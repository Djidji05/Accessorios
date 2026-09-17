import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// 1. Consulter le taux actuel (Authentifié)
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const rate = await prisma.exchangeRate.findUnique({
      where: { id: 'rate_official' }
    });
    return res.json(rate || { baseCurrency: 'DOP', targetCurrency: 'HTG', rate: 2.35 });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du taux.' });
  }
});

// 2. Mettre à jour le taux (Admin uniquement)
router.put('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { rate, actorName } = req.body;
    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate <= 0) {
      return res.status(400).json({ error: 'Taux de change invalide.' });
    }

    const updated = await prisma.exchangeRate.upsert({
      where: { id: 'rate_official' },
      update: {
        rate: numRate,
        updatedBy: actorName || 'Alexis D\'Alexis (Admin)',
        updatedAt: new Date(),
      },
      create: {
        id: 'rate_official',
        baseCurrency: 'DOP',
        targetCurrency: 'HTG',
        rate: numRate,
        updatedBy: actorName || 'Alexis D\'Alexis (Admin)',
      }
    });

    // Tracé d'audit
    await prisma.auditLog.create({
      data: {
        nodeId: 'node-admin-01',
        actorName: actorName || 'Alexis D\'Alexis (Admin)',
        actorRole: 'admin',
        action: 'TAUX_CHANGE_MAJ',
        targetType: 'system',
        details: `Mise à jour du taux officiel : 1 Peso = ${numRate} HTG.`,
        nodeStatus: 'SYNCED',
        priority: 'Medium',
      }
    });

    return res.json({
      success: true,
      message: `Taux mis à jour : 1 Peso = ${numRate} HTG.`,
      rate: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du taux.' });
  }
});

export default router;
