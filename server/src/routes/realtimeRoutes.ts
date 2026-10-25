import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, requireRole, getJwtSecret, AuthUser } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

// 1. Flux SSE en temps réel (Server-Sent Events)
router.get('/events', (req: Request, res: Response) => {
  // Récupérer le jeton depuis le paramètre d'URL (obligatoire pour les EventSource des navigateurs)
  const token = (req.query.token as string) || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);

  if (!token) {
    return res.status(401).json({ error: 'Accès SSE refusé : Jeton d\'authentification manquant.' });
  }

  let user: AuthUser;
  try {
    user = jwt.verify(token, getJwtSecret()) as AuthUser;
  } catch (err) {
    return res.status(401).json({ error: 'Jeton invalide ou expiré pour le flux temps réel.' });
  }

  // Configuration des en-têtes SSE standards
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Désactive la mise en mémoire tampon des reverse-proxies NGINX

  // Envoi initial des en-têtes
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const clientId = `client_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  realtimeService.registerClient({
    id: clientId,
    userId: user.id,
    name: user.name || 'Agent',
    role: user.role || 'agent_rd',
    res,
    connectedAt: new Date(),
  });

  // Nettoyage automatique dès que le navigateur ferme l'onglet ou perd la connexion
  req.on('close', () => {
    realtimeService.removeClient(clientId);
  });
});

// 2. Statistiques des clients connectés en direct (Admin uniquement)
router.get('/stats', authMiddleware, requireRole('admin'), (_req, res) => {
  return res.json(realtimeService.getStats());
});

export default router;
