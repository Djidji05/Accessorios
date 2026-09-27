import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Logs d'audit (Admin & Gestionnaire; Fallback sécurisé sans erreur 403 pour agents)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.user?.role;
    // Si l'utilisateur n'est ni Admin ni Gestionnaire, retourner une liste vide sans lever d'erreur 403
    if (role !== 'admin' && role !== 'gestionnaire') {
      return res.json([]);
    }

    const { targetType, priority } = req.query;

    const where: any = {};
    if (targetType && targetType !== 'all') {
      where.targetType = String(targetType);
    }
    if (priority && priority !== 'all') {
      where.priority = String(priority);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des logs d\'audit.' });
  }
});

export default router;
