import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

// 1. Liste des comptes et soldes (Authentifié)
router.get('/balances', authMiddleware, async (_req, res) => {
  try {
    const balances = await prisma.accountBalance.findMany({
      orderBy: { balance: 'desc' },
    });
    return res.json(balances);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des soldes.' });
  }
});

import { z } from 'zod';

const rechargeSchema = z.object({
  accountId: z.string().min(1, 'Identifiant du compte requis'),
  amount: z.number().gt(0, 'Le montant doit être supérieur à 0'),
  note: z.string().optional(),
  actorName: z.string().optional(),
});

// 2. Réapprovisionnement d'un compte flotte (Admin & Gestionnaire)
router.post('/recharge', authMiddleware, requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const parseResult = rechargeSchema.safeParse({
      ...req.body,
      amount: req.body.amount ? Number(req.body.amount) : undefined,
    });

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
    }

    const { accountId, amount, note, actorName } = parseResult.data;

    const acc = await prisma.accountBalance.findUnique({ where: { id: accountId } });
    if (!acc) {
      return res.status(404).json({ error: 'Compte flotte introuvable.' });
    }

    const newBalance = acc.balance + amount;

    const effectiveActorName = req.user?.name || 'Alexis D\'Alexis (Admin)';
    const effectiveNodeId = req.user?.nodeId || 'node-admin-01';
    const effectiveRole = req.user?.role || 'admin';

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBalance = await tx.accountBalance.update({
        where: { id: accountId },
        data: {
          balance: newBalance,
          lastUpdated: new Date(),
          status: newBalance >= 10000 ? 'optimal' : 'low',
        }
      });

      await tx.auditLog.create({
        data: {
          nodeId: effectiveNodeId,
          actorName: effectiveActorName,
          actorRole: effectiveRole,
          action: 'RECHARGE_FLOTTE',
          targetType: 'treasury',
          details: `Injection de liquidités : +${amount.toLocaleString()} ${acc.currency} sur le compte ${acc.name}. Note : ${note || 'Réapprovisionnement'}.`,
          nodeStatus: 'ACK',
          priority: 'Medium',
        }
      });

      return updatedBalance;
    });

    realtimeService.broadcast('BALANCE_UPDATED', updated);

    return res.json({
      success: true,
      message: `Flotte ${acc.name} réapprovisionnée (+${amount.toLocaleString()} ${acc.currency}).`,
      account: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du réapprovisionnement.' });
  }
});

// 3. Métriques de volumes agrégées en base de données (Protection DoS mémoire)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { status: 'completed' };
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate)),
      };
    }

    const [aggregates, count] = await Promise.all([
      prisma.transaction.aggregate({
        where,
        _sum: {
          amountDOP: true,
          amountHTG: true,
          feeDOP: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({
      count,
      totalVolumeDOP: aggregates._sum.amountDOP || 0,
      totalVolumeHTG: aggregates._sum.amountHTG || 0,
      totalFeesDOP: aggregates._sum.feeDOP || 0,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' });
  }
});

export default router;
