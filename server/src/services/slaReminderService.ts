import { prisma } from '../prisma';
import { sendSlaAlertToStakeholders } from './emailService';

// Suivi en mémoire des jalons d'alertes envoyés par transaction ID
// Clé: transaction.id -> Valeur: dernier jalon d'heures alerté (ex: 24, 48, 72...)
const alertTracker = new Map<string, number>();

let intervalHandle: NodeJS.Timeout | null = null;
let isChecking = false;

// Seuil d'escalade SLA : 24 heures (1440 minutes) et récurrence toutes les 24 heures (24h, 48h, 72h...)
export const SLA_THRESHOLD_MINUTES = 24 * 60; // 1440 minutes = 24 heures
export const SLA_HOURS_STEP = 24;

/**
 * Vérifie toutes les transactions en attente ou en cours, calcule le temps écoulé,
 * et déclenche l'envoi d'un e-mail d'escalade toutes les 24 heures de retard (24h, 48h, 72h...)
 */
export async function checkPendingTransactionsSla(): Promise<{
  checkedCount: number;
  alertsSent: { txId: string; referenceNumber: string; elapsedMinutes: number; milestone: number }[];
}> {
  if (isChecking) {
    return { checkedCount: 0, alertsSent: [] };
  }

  isChecking = true;
  const alertsSent: { txId: string; referenceNumber: string; elapsedMinutes: number; milestone: number }[] = [];

  try {
    const now = Date.now();

    // Récupérer toutes les transactions qui ne sont pas encore clôturées ou annulées
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        status: {
          in: ['in_progress', 'pending_routing'],
        },
      },
      select: {
        id: true,
        referenceNumber: true,
        operator: true,
        channel: true,
        amountDOP: true,
        amountHTG: true,
        senderName: true,
        receiverName: true,
        receiverPhone: true,
        createdByName: true,
        createdByRole: true,
        assignedToName: true,
        assignedToRole: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const activeTxIds = new Set(pendingTransactions.map(t => t.id));

    // Nettoyer les transactions qui ont été clôturées du tracker
    for (const trackedId of alertTracker.keys()) {
      if (!activeTxIds.has(trackedId)) {
        alertTracker.delete(trackedId);
      }
    }

    for (const tx of pendingTransactions) {
      const createdTs = new Date(tx.createdAt).getTime();
      const elapsedMinutes = Math.floor((now - createdTs) / (1000 * 60));
      const elapsedHours = Math.floor(elapsedMinutes / 60);

      // Si la transaction dépasse 24 heures (1440 minutes)
      if (elapsedMinutes >= SLA_THRESHOLD_MINUTES) {
        // Jalon de 24h atteint (24h, 48h, 72h...)
        const currentMilestoneHours = Math.floor(elapsedHours / SLA_HOURS_STEP) * SLA_HOURS_STEP;
        let lastSentMilestoneHours = alertTracker.get(tx.id);

        // Si le serveur vient de redémarrer, vérifier la table AuditLog pour éviter les doublons d'e-mails
        if (lastSentMilestoneHours === undefined) {
          const existingAudit = await prisma.auditLog.findFirst({
            where: {
              action: `TRANSACTION_SLA_ALERT_${currentMilestoneHours}H`,
              details: { contains: tx.referenceNumber },
            },
            select: { id: true },
          }).catch(() => null);

          if (existingAudit) {
            alertTracker.set(tx.id, currentMilestoneHours);
            lastSentMilestoneHours = currentMilestoneHours;
          } else {
            lastSentMilestoneHours = 0;
          }
        }

        // Si l'alerte pour ce jalon de 24 heures n'a pas encore été envoyée
        if (currentMilestoneHours > (lastSentMilestoneHours || 0)) {
          console.log(`⏱️ [SLA ESCALATION 24h+] Transaction #${tx.referenceNumber} dépasse ${elapsedHours}h (Jalon: ${currentMilestoneHours}h). Envoi des e-mails aux personnes concernées...`);

          const result = await sendSlaAlertToStakeholders(tx, elapsedMinutes);

          if (result.sentCount > 0) {
            alertTracker.set(tx.id, currentMilestoneHours);
            alertsSent.push({
              txId: tx.id,
              referenceNumber: tx.referenceNumber,
              elapsedMinutes,
              milestone: currentMilestoneHours,
            });

            // Enregistrer l'événement dans le journal d'audit immuable
            try {
              await prisma.auditLog.create({
                data: {
                  nodeId: 'cron-sla',
                  actorName: 'Moteur SLA Escalation Automatique (24h)',
                  actorRole: 'system',
                  action: `TRANSACTION_SLA_ALERT_${currentMilestoneHours}H`,
                  targetType: 'transaction',
                  priority: currentMilestoneHours >= 48 ? 'Critical' : 'High',
                  details: `Alerte email SLA déclenchée : Transaction #${tx.referenceNumber} (${tx.operator.toUpperCase()}) en attente depuis ${elapsedHours} heures sans traitement (seuil 24h dépassé). Notification envoyée à ${result.sentCount} intervenants.`,
                  nodeStatus: 'ACK',
                },
              });
            } catch (auditErr) {
              console.error('Erreur enregistrement audit log SLA:', auditErr);
            }
          }
        }
      }
    }

    return {
      checkedCount: pendingTransactions.length,
      alertsSent,
    };
  } catch (error) {
    console.error('Erreur checkPendingTransactionsSla:', error);
    return { checkedCount: 0, alertsSent: [] };
  } finally {
    isChecking = false;
  }
}

/**
 * Démarre le moteur d'escalade SLA en tâche de fond (vérification automatique)
 */
export function startSlaReminderEngine(intervalMs: number = 60 * 1000) {
  if (intervalHandle) {
    console.log('⚠️ Moteur SLA Reminder déjà en cours d\'exécution.');
    return;
  }

  console.log(`⏱️ Démarrage du moteur SLA Reminder (Vérification périodique, alertes email récurrentes toutes les 24 heures de retard)`);

  // Première exécution après 10 secondes de démarrage du serveur
  setTimeout(() => {
    checkPendingTransactionsSla();
  }, 10000);

  // Intervalle récurrent
  intervalHandle = setInterval(() => {
    checkPendingTransactionsSla();
  }, intervalMs);
}

/**
 * Arrête le moteur SLA Reminder
 */
export function stopSlaReminderEngine() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('🛑 Moteur SLA Reminder arrêté.');
  }
}

/**
 * Récupère le statut actuel du moteur SLA
 */
export function getSlaEngineStatus() {
  return {
    isRunning: Boolean(intervalHandle),
    thresholdHours: SLA_HOURS_STEP,
    trackedPendingCount: alertTracker.size,
    trackedMilestones: Array.from(alertTracker.entries()).map(([txId, milestone]) => ({
      txId,
      lastAlertMilestone: `${milestone} heures`,
    })),
  };
}
