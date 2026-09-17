import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

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

// 2. Réapprovisionnement d'un compte flotte (Admin & Gestionnaire)
router.post('/recharge', authMiddleware, requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const { accountId, amount, note, actorName } = req.body;
    if (!accountId || !amount) {
      return res.status(400).json({ error: 'Identifiant de compte et montant requis.' });
    }

    const numAmount = Number(amount);
    const acc = await prisma.accountBalance.findUnique({ where: { id: accountId } });
    if (!acc) {
      return res.status(404).json({ error: 'Compte flotte introuvable.' });
    }

    const newBalance = acc.balance + numAmount;
    const updated = await prisma.accountBalance.update({
      where: { id: accountId },
      data: {
        balance: newBalance,
        lastUpdated: new Date(),
        status: newBalance >= 200000 ? 'optimal' : 'low',
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        nodeId: 'node-admin-01',
        actorName: actorName || 'Alexis D\'Alexis (Admin)',
        actorRole: 'admin',
        action: 'RECHARGE_FLOTTE',
        targetType: 'treasury',
        details: `Injection de liquidités : +${numAmount.toLocaleString()} ${acc.currency} sur le compte ${acc.name}. Note : ${note || 'Réapprovisionnement'}.`,
        nodeStatus: 'ACK',
        priority: 'Medium',
      }
    });

    return res.json({
      success: true,
      message: `Flotte ${acc.name} réapprovisionnée (+${numAmount.toLocaleString()} ${acc.currency}).`,
      account: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du réapprovisionnement.' });
  }
});

// 3. Métriques de volumes sur période (Authentifié)
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

    const completed = await prisma.transaction.findMany({ where });

    const totalVolumeDOP = completed.reduce((sum, t) => sum + t.amountDOP, 0);
    const totalVolumeHTG = completed.reduce((sum, t) => sum + t.amountHTG, 0);
    const totalFeesDOP = completed.reduce((sum, t) => sum + t.feeDOP, 0);

    return res.json({
      count: completed.length,
      totalVolumeDOP,
      totalVolumeHTG,
      totalFeesDOP,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' });
  }
});

export default router;
