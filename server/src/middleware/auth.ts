import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  nodeId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dalexis_transferencia_super_secret_jwt_key_2026';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé : Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Support des sessions locales / tokens de secours (demo_token_...) uniquement hors production
  if (token && token.startsWith('demo_token_')) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Accès non autorisé : Mode démo désactivé en production.' });
    }
    const userId = token.replace('demo_token_', '');
    req.user = {
      id: userId || 'cmtyvnlg40000d2uvmaf3szds',
      email: 'ndjivensly@gmail.com',
      role: 'admin',
      name: 'Noel Djivensly',
      nodeId: 'node-admin-01',
    };
    return next();
  }

  // 2. Vérification cryptographique JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes pour cette opération.' });
    }
    next();
  };
};
