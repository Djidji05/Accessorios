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

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: JWT_SECRET environment variable is not defined!');
      process.exit(1);
    }
    return 'dalexis_transferencia_super_secret_jwt_key_2026';
  }
  return secret;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string') {
    // Support pour les éléments médias (images <img>, <a>)
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé : Token manquant.' });
  }

  // Vérification cryptographique JWT stricte (aucune porte dérobée ni bypass)
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;
    req.user = decoded;
    return next();
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

