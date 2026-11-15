import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

const REQUIRED_KILL_SWITCHES = [
  { operator: 'moncash', serviceName: 'MonCash (Paiement & Transfert HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  { operator: 'natcash', serviceName: 'Natcash (Paiement & Cash-out HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  { operator: 'digicel', serviceName: 'Digicel (Recharge Téléphonique)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  { operator: 'natcom', serviceName: 'Natcom (Recharge & Data HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  { operator: 'claro', serviceName: 'Claro RD (Paiement Factures)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  { operator: 'altice', serviceName: 'Altice RD (Paiement & Recharges)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  { operator: 'zelle', serviceName: 'Zelle USA (Paiement & Virement USD)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
];

// 1. Statut de tous les kill-switches (Authentifié)
router.get('/', authMiddleware, async (_req, res) => {
  try {
    let list = await prisma.killSwitch.findMany();
    const existingOps = new Set(list.map(k => k.operator));

    // Auto-réparation si un opérateur (ex: zelle) n'a pas encore été migré en base
    for (const reqKs of REQUIRED_KILL_SWITCHES) {
      if (!existingOps.has(reqKs.operator)) {
        try {
          const created = await prisma.killSwitch.create({ data: reqKs });
          list.push(created);
        } catch {
          // ignore concurrent write
        }
      }
    }

    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des Kill-Switches.' });
  }
});

// 2. Bascule d'un opérateur (Admin uniquement)
router.post('/toggle', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { operator, reason, actorName } = req.body;
    if (!operator) {
      return res.status(400).json({ error: 'Opérateur requis.' });
    }

    let current = await prisma.killSwitch.findUnique({ where: { operator } });
    if (!current) {
      const fallback = REQUIRED_KILL_SWITCHES.find(k => k.operator === operator);
      if (fallback) {
        current = await prisma.killSwitch.create({ data: fallback });
      } else {
        return res.status(404).json({ error: 'Opérateur introuvable dans le Kill-Switch.' });
      }
    }

    const effectiveActorName = req.user?.name || 'Alexis D\'Alexis (Admin)';
    const effectiveNodeId = req.user?.nodeId || 'node-admin-01';

    const updated = await prisma.killSwitch.update({
      where: { operator },
      data: {
        enabled: !current.enabled,
        reason: !current.enabled ? null : (reason || 'Verrouillage d\'urgence administrateur'),
        updatedBy: effectiveActorName,
        updatedAt: new Date(),
      }
    });

    // Tracé d'audit certifié avec identité JWT authentifiée
    await prisma.auditLog.create({
      data: {
        nodeId: effectiveNodeId,
        actorName: effectiveActorName,
        actorRole: req.user?.role || 'admin',
        action: updated.enabled ? 'KILL_SWITCH_UNLOCKED' : 'KILL_SWITCH_LOCKED',
        targetType: 'kill_switch',
        details: updated.enabled 
          ? `Rétablissement du service pour l'opérateur ${operator.toUpperCase()}.`
          : `VERROUILLAGE D'URGENCE DE L'OPÉRATEUR ${operator.toUpperCase()}. Motif : ${reason || 'Sécurité réseau'}.`,
        nodeStatus: 'SYNCED',
        priority: 'Critical',
      }
    });

    realtimeService.broadcast('KILL_SWITCH_UPDATED', updated);

    return res.json({
      success: true,
      message: updated.enabled 
        ? `L'opérateur ${operator.toUpperCase()} a été réactivé.`
        : `L'opérateur ${operator.toUpperCase()} a été verrouillé d'urgence.`,
      item: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du Kill-Switch.' });
  }
});

export default router;
