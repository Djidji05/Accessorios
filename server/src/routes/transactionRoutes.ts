import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// 1. Liste des transactions (Authentifié)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, operator, search } = req.query;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = String(status);
    }
    if (operator && operator !== 'all') {
      where.operator = String(operator);
    }
    if (search) {
      const q = String(search);
      where.OR = [
        { referenceNumber: { contains: q } },
        { senderName: { contains: q } },
        { receiverName: { contains: q } },
        { senderPhone: { contains: q } },
        { receiverPhone: { contains: q } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(transactions);
  } catch (error) {
    console.error('Erreur get transactions:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des transactions.' });
  }
});

// 2. Création d'une transaction (Guichet authentifié)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      operator,
      serviceType,
      amountDOP,
      feeDOP,
      commissionDOP,
      currentUserId,
    } = req.body;

    if (!senderName || !receiverName || !receiverPhone || !operator || !amountDOP) {
      return res.status(400).json({ error: 'Champs obligatoires manquants pour la transaction.' });
    }

    // 2.1 Vérification Kill-Switch
    const ks = await prisma.killSwitch.findUnique({ where: { operator } });
    if (ks && !ks.enabled) {
      return res.status(403).json({
        error: `Le service ${operator.toUpperCase()} est temporairement indisponible (Motif : ${ks.reason || 'Maintenance technique'}). Veuillez réessayer ultérieurement.`
      });
    }

    // 2.2 Récupération du taux officiel
    const officialRateObj = await prisma.exchangeRate.findUnique({ where: { id: 'rate_official' } });
    const exchangeRate = officialRateObj?.rate || 2.35;
    const amountHTG = Math.round(Number(amountDOP) * exchangeRate);

    // 2.3 Récupération de l'agent émetteur
    const actor = currentUserId 
      ? await prisma.user.findUnique({ where: { id: currentUserId } })
      : await prisma.user.findFirst({ where: { role: 'admin' } });

    // 2.4 Détermination du canal et routage vers le bon agent
    const isCashChannel = operator === 'moncash' || operator === 'natcash';
    const channel = isCashChannel ? 'haiti_cash' : 'digital_telecom';

    let assignedAgent = await prisma.user.findFirst({
      where: { role: isCashChannel ? 'agent_haiti' : 'gestionnaire' }
    });
    if (!assignedAgent) {
      assignedAgent = actor;
    }

    // 2.5 Génération du numéro de référence unique
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `#TX-${randomSuffix}`;

    // 2.6 Création de la transaction
    const newTx = await prisma.transaction.create({
      data: {
        referenceNumber,
        senderName,
        senderPhone: senderPhone || '',
        receiverName,
        receiverPhone,
        operator,
        serviceType: serviceType || 'transfer',
        channel,
        amountDOP: Number(amountDOP),
        amountHTG,
        exchangeRate,
        feeDOP: Number(feeDOP) || 0,
        commissionDOP: Number(commissionDOP) || 0,
        createdByNode: actor?.nodeId || 'node-agent-rd-01',
        createdByName: actor?.name || 'Agent Guichet',
        createdByRole: actor?.role || 'agent_rd',
        isAdminNominalTrace: actor?.role === 'admin',
        assignedToNode: assignedAgent?.nodeId || 'node-agent-haiti-01',
        assignedToRole: assignedAgent?.role || 'agent_haiti',
        assignedToName: assignedAgent?.name || 'Agent Haïti',
        status: isCashChannel ? 'in_progress' : 'completed',
        completedAt: !isCashChannel ? new Date() : null,
      },
    });

    // 2.7 Débit / Ajustement des balances de trésorerie
    // Débit du compte correspondant (ex: flotte MonCash ou Natcash en HTG, ou caisse Pesos)
    const targetBalance = await prisma.accountBalance.findFirst({
      where: { operator }
    });
    if (targetBalance) {
      const deduction = targetBalance.currency === 'HTG' ? amountHTG : Number(amountDOP);
      await prisma.accountBalance.update({
        where: { id: targetBalance.id },
        data: {
          balance: Math.max(0, targetBalance.balance - deduction),
          lastUpdated: new Date()
        }
      });
    }

    // 2.8 Tracé dans le journal d'audit
    await prisma.auditLog.create({
      data: {
        nodeId: actor?.nodeId || 'node-01',
        actorName: actor?.name || 'Guichetier',
        actorRole: actor?.role || 'agent_rd',
        action: 'CREATION_TRANSACTION',
        targetType: 'transaction',
        details: `Saisie transaction ${operator.toUpperCase()} (${referenceNumber}) de ${Number(amountDOP).toLocaleString()} Pesos (${amountHTG.toLocaleString()} HTG) par ${actor?.name}.`,
        nodeStatus: 'SYNCED',
        priority: 'Medium',
      }
    });

    return res.status(201).json({
      success: true,
      message: `Transaction ${referenceNumber} enregistrée avec succès.`,
      transaction: newTx,
    });
  } catch (error) {
    console.error('Erreur create transaction:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de la transaction.' });
  }
});

// 3. Clôture de tâche / Preuve SMS (Agent Haïti ou Gestionnaire authentifié)
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { proofNotes, actorName } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        proofNotes: proofNotes || 'Validé & Décaissé avec succès',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        nodeId: 'node-agent-haiti-01',
        actorName: actorName || 'Agent Haïti',
        actorRole: 'agent_haiti',
        action: 'CLOTURE_TACHE',
        targetType: 'transaction',
        details: `Clôture certifiée de la transaction ${existing.referenceNumber}. Preuve : ${proofNotes || 'SMS confirmé'}.`,
        nodeStatus: 'ACK',
        priority: 'Low',
      }
    });

    return res.json({ success: true, message: 'Tâche clôturée avec succès.', transaction: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la clôture de la tâche.' });
  }
});

// 4. Annulation sécurisée (Admin uniquement)
router.patch('/:id/cancel', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, actorName } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Annulé par l\'administrateur',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        nodeId: 'node-admin-01',
        actorName: actorName || 'Alexis D\'Alexis (Admin)',
        actorRole: 'admin',
        action: 'ANNULATION_TRANSACTION',
        targetType: 'transaction',
        details: `Annulation de la transaction ${existing.referenceNumber}. Motif : ${reason || 'Non spécifié'}.`,
        nodeStatus: 'ACK',
        priority: 'High',
      }
    });

    return res.json({ success: true, message: 'Transaction annulée.', transaction: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de l\'annulation de la transaction.' });
  }
});

// 5. Modification administrative (Admin uniquement)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updatedFields,
    });

    return res.json({ success: true, message: 'Transaction mise à jour.', transaction: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

export default router;
