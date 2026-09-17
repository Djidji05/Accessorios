import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dalexis_transferencia_super_secret_jwt_key_2026';

// 1. Connexion (Login avec Email ou Nom d'utilisateur)
router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.email || req.body.username || req.body.identifier || '';
    const password = req.body.password;

    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur ou email et mot de passe requis.' });
    }

    const identifier = String(rawIdentifier).trim();
    const cleanUsername = identifier.startsWith('@') ? identifier.slice(1).trim() : identifier;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { email: identifier.toLowerCase() },
          { username: identifier },
          { username: identifier.toLowerCase() },
          { username: cleanUsername },
          { username: cleanUsername.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    // Mettre à jour le statut en ligne
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'online' }
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        nodeId: user.nodeId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const permissions = await prisma.userPermission.findUnique({
      where: { userId: user.id }
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
        nodeId: user.nodeId,
        status: user.status,
      },
      permissions: permissions ? {
        ...permissions,
        servicesAllowed: JSON.parse(permissions.servicesAllowed)
      } : null
    });
  } catch (error) {
    console.error('Erreur Login:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de la connexion.' });
  }
});

// 2. Profil utilisateur connecté
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const permissions = await prisma.userPermission.findUnique({
      where: { userId: user.id }
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
        nodeId: user.nodeId,
        status: user.status,
      },
      permissions: permissions ? {
        ...permissions,
        servicesAllowed: JSON.parse(permissions.servicesAllowed)
      } : null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

// 3. Liste de tous les utilisateurs (Authentifié)
router.get('/users', authMiddleware, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        location: true,
        nodeId: true,
        status: true,
      }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
  }
});

export default router;
