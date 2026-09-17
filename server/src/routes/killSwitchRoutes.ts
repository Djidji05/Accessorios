import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// 1. Statut de tous les kill-switches (Authentifié)
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const list = await prisma.killSwitch.findMany();
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

    const current = await prisma.killSwitch.findUnique({ where: { operator } });
    if (!current) {
      return res.status(404).json({ error: 'Opérateur introuvable dans le Kill-Switch.' });
    }

    const updated = await prisma.killSwitch.update({
      where: { operator },
      data: {
        enabled: !current.enabled,
        reason: !current.enabled ? null : (reason || 'Verrouillage d\'urgence administrateur'),
        updatedBy: actorName || 'Alexis D\'Alexis (Admin)',
        updatedAt: new Date(),
      }
    });

    // Tracé d'audit de haute priorité
    await prisma.auditLog.create({
      data: {
        nodeId: 'node-admin-01',
        actorName: actorName || 'Alexis D\'Alexis (Admin)',
        actorRole: 'admin',
        action: updated.enabled ? 'KILL_SWITCH_UNLOCKED' : 'KILL_SWITCH_LOCKED',
        targetType: 'kill_switch',
        details: updated.enabled 
          ? `Rétablissement du service pour l'opérateur ${operator.toUpperCase()}.`
          : `VERROUILLAGE D'URGENCE DE L'OPÉRATEUR ${operator.toUpperCase()}. Motif : ${reason || 'Sécurité réseau'}.`,
        nodeStatus: 'SYNCED',
        priority: 'Critical',
      }
    });

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
