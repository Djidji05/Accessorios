import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { realtimeService } from '../services/realtimeService';

const router = Router();

// 1. Liste des transactions (Authentifié)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, operator, search, limit, page } = req.query;

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

    // Pagination haute performance : supporte limit et page
    const take = limit ? Math.min(Math.max(1, parseInt(String(limit), 10)), 1000) : 250;
    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : 1;
    const skip = (pageNum - 1) * take;

    const [totalCount, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    // Allègement drastique du payload JSON : les chaînes base64 massives sont transformées
    // en URLs dédiées /api/transactions/:id/proof pour préserver la mémoire et éliminer
    // définitivement les erreurs HTTP/2 PROTOCOL_ERROR et CONNECTION_RESET.
    const lightweightTxs = transactions.map((t) => ({
      ...t,
      proofUrl: t.proofUrl
        ? t.proofUrl.startsWith('data:')
          ? `/api/transactions/${t.id}/proof`
          : t.proofUrl
        : null,
    }));

    // En-têtes de pagination standard pour les applications et intégrations
    res.setHeader('X-Total-Count', String(totalCount));
    res.setHeader('X-Total-Pages', String(Math.ceil(totalCount / take)));
    res.setHeader('X-Current-Page', String(pageNum));

    return res.json(lightweightTxs);
  } catch (error) {
    console.error('Erreur get transactions:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des transactions.' });
  }
});

// 1.1 Récupération de l'image de preuve (Sécurisé par authentification)
router.get('/:id/proof', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await prisma.transaction.findUnique({
      where: { id },
      select: { proofUrl: true, referenceNumber: true },
    });

    if (!tx || !tx.proofUrl) {
      return res.status(404).send('Preuve introuvable pour cette transaction.');
    }

    if (tx.proofUrl.startsWith('data:image/')) {
      const commaIndex = tx.proofUrl.indexOf(',');
      if (commaIndex > -1) {
        const meta = tx.proofUrl.substring(0, commaIndex);
        const base64Data = tx.proofUrl.substring(commaIndex + 1);
        const contentType = meta.replace('data:', '').replace(';base64', '') || 'image/jpeg';
        const imgBuffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', imgBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // Cache 7 jours
        return res.end(imgBuffer);
      }
    }

    // Si c'est déjà une URL externe (ex. S3 / CDN)
    return res.redirect(tx.proofUrl);
  } catch (error) {
    console.error('Erreur get proof image:', error);
    return res.status(500).send('Erreur lors du chargement de la preuve.');
  }
});

import { z } from 'zod';

const createTransactionSchema = z.object({
  senderName: z.string().min(1, 'Nom de l\'expéditeur requis'),
  senderPhone: z.string().optional().default(''),
  receiverName: z.string().min(1, 'Nom du destinataire requis'),
  receiverPhone: z.string().min(1, 'Téléphone du destinataire requis'),
  operator: z.string().min(1, 'Opérateur requis'),
  serviceType: z.string().optional().default('transfer'),
  amountDOP: z.number().gt(0, 'Le montant en DOP doit être supérieur à 0'),
  feeDOP: z.number().optional().default(0),
  commissionDOP: z.number().optional().default(0),
  currentUserId: z.string().optional(),
});

// 2. Création d'une transaction (Guichet authentifié)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const parseResult = createTransactionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors.map(e => e.message).join(', ') 
      });
    }

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
    } = parseResult.data;

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
    const amountHTG = Math.round(amountDOP * exchangeRate);

    // 2.3 Récupération de l'agent émetteur authentifié
    const userId = req.user?.id || currentUserId;
    const actor = userId 
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findFirst({ where: { role: 'admin' } });

    // 2.4 Détermination du canal et routage vers le bon agent
    const isHaitiCash = operator === 'moncash' || operator === 'natcash' || operator === 'natcom';
    const channel = isHaitiCash ? 'haiti_cash' : 'digital_telecom';
    const targetRole = isHaitiCash ? 'agent_haiti' : 'gestionnaire';

    let assignedAgent = await prisma.user.findFirst({
      where: { role: targetRole }
    });
    if (!assignedAgent) {
      assignedAgent = actor;
    }

    // 2.5 Génération du numéro de référence unique anti-collision (Date AAMMJJ + 6 chiffres)
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = `#TX-${dateStr}-${randomSuffix}`;

    // 2.6 Transaction Atomique prisma.$transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Création de la transaction
      const newTx = await tx.transaction.create({
        data: {
          referenceNumber,
          senderName,
          senderPhone: senderPhone || '',
          receiverName,
          receiverPhone,
          operator,
          serviceType: serviceType || 'transfer',
          channel,
          amountDOP,
          amountHTG,
          exchangeRate,
          feeDOP: feeDOP || 0,
          commissionDOP: commissionDOP || 0,
          createdByNode: actor?.nodeId || 'node-agent-rd-01',
          createdByName: actor?.name || 'Agent Guichet',
          createdByRole: actor?.role || 'agent_rd',
          isAdminNominalTrace: actor?.role === 'admin',
          assignedToNode: assignedAgent?.nodeId || (isHaitiCash ? 'node-agent-haiti-01' : 'node-gestionnaire-01'),
          assignedToRole: targetRole,
          assignedToName: assignedAgent?.name || (isHaitiCash ? 'Agent Haïti' : 'Gestionnaire'),
          status: 'in_progress',
          completedAt: null,
        },
      });

      // 2. Débit atomique de la balance du compte correspondant (Prévention absolue des courses critiques)
      const targetBalance = await tx.accountBalance.findFirst({ where: { operator } });
      if (targetBalance) {
        const deduction = targetBalance.currency === 'HTG' ? amountHTG : amountDOP;
        await tx.accountBalance.update({
          where: { id: targetBalance.id },
          data: {
            balance: { decrement: deduction },
            lastUpdated: new Date()
          }
        });
      }

      // 3. Tracé d'audit
      await tx.auditLog.create({
        data: {
          nodeId: actor?.nodeId || 'node-01',
          actorName: actor?.name || 'Guichetier',
          actorRole: actor?.role || 'agent_rd',
          action: 'CREATION_TRANSACTION',
          targetType: 'transaction',
          details: `Saisie transaction ${operator.toUpperCase()} (${referenceNumber}) de ${amountDOP.toLocaleString()} Pesos (${amountHTG.toLocaleString()} HTG) par ${actor?.name}.`,
          nodeStatus: 'SYNCED',
          priority: 'Medium',
        }
      });

      return newTx;
    });

    // Diffusion en temps réel pur (0 délai) à tous les agents connectés
    const lightweightNewTx = {
      ...result,
      proofUrl: result.proofUrl && result.proofUrl.startsWith('data:')
        ? `/api/transactions/${result.id}/proof`
        : result.proofUrl,
    };
    realtimeService.broadcast('TRANSACTION_CREATED', lightweightNewTx);
    realtimeService.broadcast('BALANCE_UPDATED', { operator });

    return res.status(201).json({
      success: true,
      message: `Transaction ${referenceNumber} enregistrée avec succès.`,
      transaction: lightweightNewTx,
    });
  } catch (error) {
    console.error('Erreur create transaction:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de la transaction.' });
  }
});

// 3. Clôture de tâche / Preuve SMS (Agent Haïti, Gestionnaire ou Admin authentifié)
router.patch('/:id/complete', authMiddleware, requireRole('agent_haiti', 'gestionnaire', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { proofNotes, proofUrl } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const completedTx = await tx.transaction.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          proofNotes: proofNotes || 'Validé & Décaissé avec succès',
          proofUrl: proofUrl || existing.proofUrl || null,
        },
      });

      await tx.auditLog.create({
        data: {
          nodeId: req.user?.nodeId || 'node-agent-haiti-01',
          actorName: req.user?.name || 'Agent Haïti',
          actorRole: req.user?.role || 'agent_haiti',
          action: 'CLOTURE_TACHE',
          targetType: 'transaction',
          details: `Clôture certifiée de la transaction ${existing.referenceNumber}. Preuve : ${proofNotes || 'SMS confirmé'}.`,
          nodeStatus: 'ACK',
          priority: 'Low',
        }
      });

      return completedTx;
    });

    const lightweightTx = {
      ...updated,
      proofUrl: updated.proofUrl
        ? updated.proofUrl.startsWith('data:')
          ? `/api/transactions/${updated.id}/proof`
          : updated.proofUrl
        : null,
    };

    realtimeService.broadcast('TRANSACTION_COMPLETED', lightweightTx);

    return res.json({ success: true, message: 'Tâche clôturée avec succès.', transaction: lightweightTx });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la clôture de la tâche.' });
  }
});

// 4. Annulation sécurisée & Remboursement de solde (Admin uniquement)
router.patch('/:id/cancel', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }

    if (existing.status === 'cancelled') {
      return res.status(400).json({ error: 'Cette transaction est déjà annulée.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Marquer comme annulée
      const cancelledTx = await tx.transaction.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason || 'Annulé par l\'administrateur',
        },
      });

      // 2. Remboursement atomique du solde sur le compte flotte
      const targetBalance = await tx.accountBalance.findFirst({ where: { operator: existing.operator } });
      if (targetBalance) {
        const refundAmount = targetBalance.currency === 'HTG' ? existing.amountHTG : existing.amountDOP;
        await tx.accountBalance.update({
          where: { id: targetBalance.id },
          data: {
            balance: { increment: refundAmount },
            lastUpdated: new Date()
          }
        });
      }

      // 3. Tracé d'audit certifié avec identité JWT
      await tx.auditLog.create({
        data: {
          nodeId: req.user?.nodeId || 'node-admin-01',
          actorName: req.user?.name || 'Alexis D\'Alexis (Admin)',
          actorRole: req.user?.role || 'admin',
          action: 'ANNULATION_TRANSACTION',
          targetType: 'transaction',
          details: `Annulation et restitution du solde pour la transaction ${existing.referenceNumber}. Motif : ${reason || 'Non spécifié'}.`,
          nodeStatus: 'ACK',
          priority: 'High',
        }
      });

      return cancelledTx;
    });

    realtimeService.broadcast('TRANSACTION_CANCELLED', updated);
    realtimeService.broadcast('BALANCE_UPDATED', { operator: existing.operator });

    return res.json({ success: true, message: 'Transaction annulée et solde restitué.', transaction: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de l\'annulation de la transaction.' });
  }
});

// 5. Modification administrative avec liste blanche de champs (Admin uniquement)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { senderName, senderPhone, receiverName, receiverPhone, operator, status, notes } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }

    const allowedUpdates: any = {};
    if (typeof senderName === 'string') allowedUpdates.senderName = senderName.trim();
    if (typeof senderPhone === 'string') allowedUpdates.senderPhone = senderPhone.trim();
    if (typeof receiverName === 'string') allowedUpdates.receiverName = receiverName.trim();
    if (typeof receiverPhone === 'string') allowedUpdates.receiverPhone = receiverPhone.trim();
    if (typeof operator === 'string') allowedUpdates.operator = operator.trim();
    if (typeof status === 'string') allowedUpdates.status = status.trim();
    if (typeof notes === 'string') allowedUpdates.proofNotes = notes.trim();

    const updated = await prisma.transaction.update({
      where: { id },
      data: allowedUpdates,
    });

    realtimeService.broadcast('TRANSACTION_UPDATED', updated);

    return res.json({ success: true, message: 'Transaction mise à jour.', transaction: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

export default router;
