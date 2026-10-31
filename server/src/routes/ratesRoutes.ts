import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

// 1. Consulter le taux actuel (Accès public & initial)
router.get('/', async (_req, res) => {
  try {
    const dopRate = await prisma.exchangeRate.findUnique({
      where: { id: 'rate_official' }
    });
    const usdRate = await prisma.exchangeRate.findUnique({
      where: { id: 'rate_usd' }
    });
    return res.json({
      baseCurrency: 'DOP',
      targetCurrency: 'HTG',
      rate: dopRate?.rate || 2.35,
      usdRate: usdRate?.rate || 140.5,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du taux.' });
  }
});

// 2. Mettre à jour le taux (Admin uniquement)
router.put('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { rate, actorName, currency = 'DOP' } = req.body;
    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate <= 0) {
      return res.status(400).json({ error: 'Taux de change invalide.' });
    }

    const effectiveActorName = req.user?.name || actorName || 'Alexis D\'Alexis (Admin)';
    const effectiveNodeId = req.user?.nodeId || 'node-admin-01';

    const isUSD = String(currency).toUpperCase() === 'USD';
    const rateId = isUSD ? 'rate_usd' : 'rate_official';
    const baseCur = isUSD ? 'USD' : 'DOP';

    const updated = await prisma.exchangeRate.upsert({
      where: { id: rateId },
      update: {
        rate: numRate,
        updatedBy: effectiveActorName,
        updatedAt: new Date(),
      },
      create: {
        id: rateId,
        baseCurrency: baseCur,
        targetCurrency: 'HTG',
        rate: numRate,
        updatedBy: effectiveActorName,
      }
    });

    // Tracé d'audit authentifié
    await prisma.auditLog.create({
      data: {
        nodeId: effectiveNodeId,
        actorName: effectiveActorName,
        actorRole: req.user?.role || 'admin',
        action: 'TAUX_CHANGE_MAJ',
        targetType: 'system',
        details: isUSD
          ? `Mise à jour du taux officiel USD : 1 USD = ${numRate} HTG.`
          : `Mise à jour du taux officiel : 1 Peso = ${numRate} HTG.`,
        nodeStatus: 'SYNCED',
        priority: 'Medium',
      }
    });

    realtimeService.broadcast('RATE_UPDATED', { ...updated, isUSD, usdRate: isUSD ? numRate : undefined });

    return res.json({
      success: true,
      message: isUSD 
        ? `Taux USD mis à jour : 1 USD = ${numRate} HTG.`
        : `Taux mis à jour : 1 Peso = ${numRate} HTG.`,
      rate: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du taux.' });
  }
});

export default router;
