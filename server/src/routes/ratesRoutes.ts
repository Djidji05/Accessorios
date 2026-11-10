import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

// 1. Consulter le taux actuel & commissions par service (Accès public & initial)
router.get('/', async (_req, res) => {
  try {
    const allRates = await prisma.exchangeRate.findMany();
    const dopRate = allRates.find((r) => r.id === 'rate_official');
    const usdRate = allRates.find((r) => r.id === 'rate_usd');

    const commissions: Record<string, number> = {
      moncash: 1.0,
      natcash: 1.0,
      zelle: 1.0,
      digicel: 1.0,
      natcom: 1.0,
      claro: 1.0,
      altice: 1.0,
    };

    const fees: Record<string, number> = {
      moncash: 0.5,
      natcash: 0.5,
      zelle: 0.5,
      digicel: 0.5,
      natcom: 0.5,
      claro: 0.5,
      altice: 0.5,
    };

    allRates.forEach((r) => {
      if (r.id.startsWith('comm_')) {
        const op = r.id.replace('comm_', '');
        commissions[op] = r.rate;
      } else if (r.id.startsWith('fee_')) {
        const op = r.id.replace('fee_', '');
        fees[op] = r.rate;
      }
    });

    return res.json({
      baseCurrency: 'DOP',
      targetCurrency: 'HTG',
      rate: dopRate?.rate || 2.35,
      usdRate: usdRate?.rate || 58.0,
      commissions,
      fees,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des taux.' });
  }
});

// 2. Mettre à jour le taux de change ou les commissions/frais (Admin uniquement)
router.put('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { rate, actorName, currency = 'DOP', commissions, fees, serviceKey, commissionRate, feeRate } = req.body;
    const effectiveActorName = req.user?.name || actorName || 'Alexis D\'Alexis (Admin)';
    const effectiveNodeId = req.user?.nodeId || 'node-admin-01';

    // Mise à jour groupée ou unitaire des commissions/frais par service
    const updatedCommissions: Record<string, number> = {};
    const updatedFees: Record<string, number> = {};

    if (commissions && typeof commissions === 'object') {
      for (const [op, r] of Object.entries(commissions)) {
        const numR = parseFloat(String(r));
        if (!isNaN(numR) && numR >= 0) {
          await prisma.exchangeRate.upsert({
            where: { id: `comm_${op}` },
            update: { rate: numR, updatedBy: effectiveActorName, updatedAt: new Date() },
            create: { id: `comm_${op}`, baseCurrency: 'COMM', targetCurrency: op, rate: numR, updatedBy: effectiveActorName },
          });
          updatedCommissions[op] = numR;
        }
      }
    }

    if (fees && typeof fees === 'object') {
      for (const [op, r] of Object.entries(fees)) {
        const numR = parseFloat(String(r));
        if (!isNaN(numR) && numR >= 0) {
          await prisma.exchangeRate.upsert({
            where: { id: `fee_${op}` },
            update: { rate: numR, updatedBy: effectiveActorName, updatedAt: new Date() },
            create: { id: `fee_${op}`, baseCurrency: 'FEE', targetCurrency: op, rate: numR, updatedBy: effectiveActorName },
          });
          updatedFees[op] = numR;
        }
      }
    }

    if (serviceKey) {
      if (commissionRate !== undefined) {
        const numComm = parseFloat(String(commissionRate));
        if (!isNaN(numComm) && numComm >= 0) {
          await prisma.exchangeRate.upsert({
            where: { id: `comm_${serviceKey}` },
            update: { rate: numComm, updatedBy: effectiveActorName, updatedAt: new Date() },
            create: { id: `comm_${serviceKey}`, baseCurrency: 'COMM', targetCurrency: serviceKey, rate: numComm, updatedBy: effectiveActorName },
          });
          updatedCommissions[serviceKey] = numComm;
        }
      }
      if (feeRate !== undefined) {
        const numFee = parseFloat(String(feeRate));
        if (!isNaN(numFee) && numFee >= 0) {
          await prisma.exchangeRate.upsert({
            where: { id: `fee_${serviceKey}` },
            update: { rate: numFee, updatedBy: effectiveActorName, updatedAt: new Date() },
            create: { id: `fee_${serviceKey}`, baseCurrency: 'FEE', targetCurrency: serviceKey, rate: numFee, updatedBy: effectiveActorName },
          });
          updatedFees[serviceKey] = numFee;
        }
      }
    }

    // Mise à jour du taux de change (DOP ou USD) si fourni
    let updatedExchangeRate: any = null;
    const numRate = parseFloat(String(rate));
    if (!isNaN(numRate) && numRate > 0) {
      const isUSD = String(currency).toUpperCase() === 'USD';
      const rateId = isUSD ? 'rate_usd' : 'rate_official';
      const baseCur = isUSD ? 'USD' : 'DOP';
      const targetCur = isUSD ? 'DOP' : 'HTG';

      updatedExchangeRate = await prisma.exchangeRate.upsert({
        where: { id: rateId },
        update: {
          rate: numRate,
          targetCurrency: targetCur,
          updatedBy: effectiveActorName,
          updatedAt: new Date(),
        },
        create: {
          id: rateId,
          baseCurrency: baseCur,
          targetCurrency: targetCur,
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
            ? `Mise à jour du taux officiel USD : 1 USD = ${numRate} DOP.`
            : `Mise à jour du taux officiel : 1 Peso = ${numRate} HTG.`,
          nodeStatus: 'SYNCED',
          priority: 'Medium',
        }
      });
    }

    const payloadBroadcast = {
      rate: updatedExchangeRate?.rate,
      isUSD: String(currency).toUpperCase() === 'USD',
      usdRate: String(currency).toUpperCase() === 'USD' ? numRate : undefined,
      commissions: Object.keys(updatedCommissions).length > 0 ? updatedCommissions : undefined,
      fees: Object.keys(updatedFees).length > 0 ? updatedFees : undefined,
    };

    realtimeService.broadcast('RATE_UPDATED', payloadBroadcast);

    return res.json({
      success: true,
      message: 'Paramètres financiers et taux mis à jour avec succès.',
      rate: updatedExchangeRate,
      commissions: updatedCommissions,
      fees: updatedFees,
    });
  } catch (error) {
    console.error('Erreur put rates:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour des taux.' });
  }
});

export default router;
