import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// 1. Liste des utilisateurs et leurs permissions (Authentifié)
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        location: true,
        nodeId: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const permissions = await prisma.userPermission.findMany();
    const formattedPermissions = permissions.map(p => ({
      ...p,
      servicesAllowed: JSON.parse(p.servicesAllowed),
    }));

    return res.json({ users, permissions: formattedPermissions });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
  }
});

// 2. Créer un nouvel utilisateur avec Mot de passe et Username (Admin uniquement)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, username, email, password, role, location, nodeId, avatar } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Nom, courriel et rôle sont obligatoires.' });
    }

    const cleanUsername = (username && username.trim()) ? username.trim().toLowerCase() : email.split('@')[0].toLowerCase();

    // Vérifier email existant
    const existingEmail = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Un utilisateur avec ce courriel existe déjà.' });
    }

    // Vérifier username existant
    const existingUsername = await prisma.user.findFirst({ where: { username: cleanUsername } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Ce nom d\'utilisateur (username) est déjà attribué.' });
    }

    const finalPassword = (password && password.trim()) ? password.trim() : 'dalexis123';
    const passwordHash = bcrypt.hashSync(finalPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        password: passwordHash,
        role,
        avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        location: location || 'Agence RD',
        nodeId: nodeId || `node-${role}-01`,
        status: 'online',
      },
    });

    // Création permissions par défaut
    await prisma.userPermission.create({
      data: {
        userId: newUser.id,
        userName: newUser.name,
        role: newUser.role,
        servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice']),
        maxSingleTransactionDOP: role === 'admin' ? 500000 : 50000,
        canCancelTransaction: role === 'admin',
        canManageKillSwitch: role === 'admin',
        canViewTreasury: role === 'admin' || role === 'gestionnaire',
        canEditRates: role === 'admin',
      }
    });

    const { password: _, ...safeUser } = newUser;

    // Tracé dans le journal d'audit
    await prisma.auditLog.create({
      data: {
        nodeId: req.user?.nodeId || 'node-admin-01',
        actorName: req.user?.name || 'Alexis D\'Alexis (Admin)',
        actorRole: req.user?.role || 'admin',
        action: 'CREATION_UTILISATEUR',
        targetType: 'user',
        details: `Création du compte utilisateur ${newUser.name} (@${cleanUsername}) avec le rôle ${role.toUpperCase()}.`,
        nodeStatus: 'SYNCED',
        priority: 'Medium',
      }
    });

    return res.status(201).json({ success: true, message: 'Utilisateur créé avec succès.', user: safeUser });
  } catch (error: any) {
    console.error('Erreur create user:', error);
    return res.status(500).json({ error: error?.message || 'Erreur lors de la création de l\'utilisateur.' });
  }
});

// 3. Mettre à jour les informations ou le mot de passe d'un utilisateur (Admin uniquement)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, password, role, location, status } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const dataToUpdate: any = {};

    if (name && name.trim()) {
      dataToUpdate.name = name.trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (emailTaken) {
          return res.status(400).json({ error: 'Cette adresse courriel est déjà utilisée par un autre agent.' });
        }
        dataToUpdate.email = cleanEmail;
      }
    }

    if (username && username.trim()) {
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername !== existingUser.username) {
        const usernameTaken = await prisma.user.findFirst({
          where: {
            username: cleanUsername,
            NOT: { id: existingUser.id },
          },
        });
        if (usernameTaken) {
          return res.status(400).json({ error: 'Ce nom d\'utilisateur (username) est déjà attribué.' });
        }
        dataToUpdate.username = cleanUsername;
      }
    }

    if (password && password.trim()) {
      dataToUpdate.password = bcrypt.hashSync(password.trim(), 10);
    }

    if (role) {
      dataToUpdate.role = role;
    }

    if (location) {
      dataToUpdate.location = location.trim();
    }

    if (status) {
      dataToUpdate.status = status;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    // Mettre à jour le nom et le rôle dans les permissions si modifiés
    if (dataToUpdate.name || dataToUpdate.role) {
      await prisma.userPermission.updateMany({
        where: { userId: id },
        data: {
          ...(dataToUpdate.name ? { userName: dataToUpdate.name } : {}),
          ...(dataToUpdate.role ? { role: dataToUpdate.role } : {}),
        },
      });
    }

    const { password: _, ...safeUser } = updatedUser;

    // Tracé d'audit
    await prisma.auditLog.create({
      data: {
        nodeId: req.user?.nodeId || 'node-admin-01',
        actorName: req.user?.name || 'Alexis D\'Alexis (Admin)',
        actorRole: req.user?.role || 'admin',
        action: 'MAJ_UTILISATEUR',
        targetType: 'user',
        details: `Mise à jour des informations de l'agent ${updatedUser.name} (@${updatedUser.username || ''}).`,
        nodeStatus: 'SYNCED',
        priority: 'Medium',
      }
    });

    return res.json({
      success: true,
      message: 'Informations de l\'utilisateur mises à jour avec succès.',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Erreur update user:', error);
    return res.status(500).json({ error: error?.message || 'Erreur lors de la mise à jour de l\'utilisateur.' });
  }
});

// 4. Bascule de statut (online / offline)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const nextStatus = user.status === 'online' ? 'offline' : 'online';
    const updated = await prisma.user.update({
      where: { id },
      data: { status: nextStatus },
    });

    return res.json({ success: true, status: updated.status });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du changement de statut.' });
  }
});

// 4. Modifier les permissions d'un utilisateur (Admin uniquement)
router.patch('/:id/permissions', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dataToUpdate: any = { ...updates };
    if (updates.servicesAllowed && Array.isArray(updates.servicesAllowed)) {
      dataToUpdate.servicesAllowed = JSON.stringify(updates.servicesAllowed);
    }

    const updated = await prisma.userPermission.update({
      where: { userId: id },
      data: dataToUpdate,
    });

    // Tracé d'audit
    await prisma.auditLog.create({
      data: {
        nodeId: req.user?.nodeId || 'node-admin-01',
        actorName: req.user?.name || 'Alexis D\'Alexis (Admin)',
        actorRole: req.user?.role || 'admin',
        action: 'PERMISSIONS_MAJ',
        targetType: 'permission',
        details: `Mise à jour de la matrice de permissions pour l'utilisateur ${updated.userName} (${updated.role}).`,
        nodeStatus: 'SYNCED',
        priority: 'High',
      }
    });

    return res.json({
      success: true,
      permissions: {
        ...updated,
        servicesAllowed: JSON.parse(updated.servicesAllowed),
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour des permissions.' });
  }
});

export default router;
