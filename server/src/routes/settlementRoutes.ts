import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

// 1. Liste des dépôts enregistrés (Authentifié)
router.get('/deposits', authMiddleware, async (req, res) => {
  try {
    const { agentId, weekLabel } = req.query as { agentId?: string; weekLabel?: string };
    const user = req.user;

    const whereClause: any = {};

    // Si l'utilisateur est un agent RD, il ne peut voir que ses propres dépôts
    if (user?.role === 'agent_rd') {
      whereClause.OR = [
        { agentId: user.id },
        { agentName: { contains: user.name } },
      ];
    } else if (agentId) {
      whereClause.agentId = agentId;
    }

    if (weekLabel && weekLabel !== 'all') {
      whereClause.weekLabel = weekLabel;
    }

    const deposits = await prisma.agentDeposit.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return res.json(deposits);
  } catch (error: any) {
    console.error('Erreur récupération dépôts:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des dépôts.' });
  }
});

const depositSchema = z.object({
  agentId: z.string().min(1, 'Identifiant agent requis'),
  agentName: z.string().min(1, 'Nom agent requis'),
  weekLabel: z.string().min(1, 'Libellé de semaine requis'),
  amount: z.number().gt(0, 'Le montant doit être supérieur à 0'),
  currency: z.string().default('DOP'),
  note: z.string().optional(),
});

// 2. Enregistrer un nouveau dépôt pour un agent (Admin & Gestionnaire)
router.post('/deposits', authMiddleware, requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const parsed = depositSchema.safeParse({
      ...req.body,
      amount: req.body.amount ? Number(req.body.amount) : undefined,
    });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map((e) => e.message).join(', ') });
    }

    const { agentId, agentName, weekLabel, amount, currency, note } = parsed.data;
    const recordedBy = req.user?.name || 'Alexis D\'Alexis (Admin)';

    const deposit = await prisma.agentDeposit.create({
      data: {
        agentId,
        agentName,
        weekLabel,
        amount,
        currency: currency || 'DOP',
        note: note || 'Versement enregistré',
        recordedBy,
      },
    });

    // Enregistrement dans les logs d'audit
    const auditDetails = `[VERSEMENT HEBDO] ${recordedBy} a enregistré un dépôt de ${amount.toLocaleString()} ${deposit.currency} pour l'agent ${agentName} (${weekLabel}).`;
    await prisma.auditLog.create({
      data: {
        nodeId: req.user?.nodeId || 'node-01',
        actorName: recordedBy,
        actorRole: req.user?.role || 'admin',
        action: 'AGENT_DEPOSIT_RECORDED',
        targetType: 'treasury',
        details: auditDetails,
        nodeStatus: 'ACK',
        priority: 'Medium',
      },
    }).catch(() => null);

    // Notification temps réel SSE à tous les clients connectés
    realtimeService.broadcast('AGENT_DEPOSIT_RECORDED', deposit);

    return res.status(201).json({
      success: true,
      message: `Dépôt de ${amount.toLocaleString()} ${deposit.currency} enregistré avec succès dans la base de données.`,
      deposit,
    });
  } catch (error: any) {
    console.error('Erreur enregistrement dépôt:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du dépôt en base de données.' });
  }
});

// 3. Réinitialiser / supprimer les dépôts (Admin uniquement)
router.post('/deposits/clear', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { agentId, weekLabel } = req.body || {};
    const whereClause: any = {};
    if (agentId) whereClause.agentId = agentId;
    if (weekLabel && weekLabel !== 'all') whereClause.weekLabel = weekLabel;

    const deleteResult = await prisma.agentDeposit.deleteMany({
      where: whereClause,
    });

    const recordedBy = req.user?.name || 'Alexis D\'Alexis (Admin)';
    await prisma.auditLog.create({
      data: {
        nodeId: req.user?.nodeId || 'node-01',
        actorName: recordedBy,
        actorRole: req.user?.role || 'admin',
        action: 'AGENT_DEPOSITS_CLEARED',
        targetType: 'treasury',
        details: `[VERSEMENT HEBDO] ${recordedBy} a réinitialisé ${deleteResult.count} dépôts en base de données.`,
        nodeStatus: 'ACK',
        priority: 'High',
      },
    }).catch(() => null);

    realtimeService.broadcast('AGENT_DEPOSITS_CLEARED', { count: deleteResult.count });

    return res.json({
      success: true,
      message: `${deleteResult.count} dépôt(s) réinitialisé(s) avec succès.`,
      count: deleteResult.count,
    });
  } catch (error: any) {
    console.error('Erreur suppression dépôts:', error);
    return res.status(500).json({ error: 'Erreur lors de la réinitialisation des dépôts.' });
  }
});

export default router;

