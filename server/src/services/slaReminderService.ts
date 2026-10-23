import { prisma } from '../prisma';
import { sendSlaAlertToStakeholders } from './emailService';

// Suivi en mémoire des jalons d'alertes envoyés par transaction ID
// Clé: transaction.id -> Valeur: dernier jalon de 30 minutes alerté (ex: 30, 60, 90, 120...)
const alertTracker = new Map<string, number>();

let intervalHandle: NodeJS.Timeout | null = null;
let isChecking = false;

/**
 * Vérifie toutes les transactions en attente ou en cours, calcule le temps écoulé,
 * et déclenche l'envoi d'un e-mail d'escalade toutes les 30 minutes de retard (30m, 60m, 90m...)
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

      // Si la transaction dépasse 30 minutes
      if (elapsedMinutes >= 30) {
        // Jalon de 30 minutes atteint (30, 60, 90, 120...)
        const currentMilestone = Math.floor(elapsedMinutes / 30) * 30;
        const lastSentMilestone = alertTracker.get(tx.id) || 0;

        // Si l'alerte pour ce jalon de 30 minutes n'a pas encore été envoyée
        if (currentMilestone > lastSentMilestone) {
          console.log(`⏱️ [SLA ESCALATION] Transaction #${tx.referenceNumber} dépasse ${elapsedMinutes}m (Jalon: ${currentMilestone}m). Envoi des e-mails aux personnes concernées...`);

          const result = await sendSlaAlertToStakeholders(tx, elapsedMinutes);

          if (result.sentCount > 0) {
            alertTracker.set(tx.id, currentMilestone);
            alertsSent.push({
              txId: tx.id,
              referenceNumber: tx.referenceNumber,
              elapsedMinutes,
              milestone: currentMilestone,
            });

            // Enregistrer l'événement dans le journal d'audit immuable
            try {
              await prisma.auditLog.create({
                data: {
                  nodeId: 'cron-sla',
                  actorName: 'Moteur SLA Escalation Automatique',
                  actorRole: 'system',
                  action: `TRANSACTION_SLA_ALERT_${currentMilestone}M`,
                  targetType: 'transaction',
                  priority: currentMilestone >= 60 ? 'Critical' : 'High',
                  details: `Alerte email SLA déclenchée : Transaction #${tx.referenceNumber} (${tx.operator.toUpperCase()}) en attente depuis ${elapsedMinutes} minutes sans traitement. Notification envoyée à ${result.sentCount} intervenants.`,
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
 * Démarre le moteur d'escalade SLA en tâche de fond (vérification automatique chaque minute)
 */
export function startSlaReminderEngine(intervalMs: number = 60 * 1000) {
  if (intervalHandle) {
    console.log('⚠️ Moteur SLA Reminder déjà en cours d\'exécution.');
    return;
  }

  console.log(`⏱️ Démarrage du moteur SLA Reminder (Vérification toutes les ${intervalMs / 1000}s, alertes email récurrentes toutes les 30 minutes de retard)`);

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
    trackedPendingCount: alertTracker.size,
    trackedMilestones: Array.from(alertTracker.entries()).map(([txId, milestone]) => ({
      txId,
      lastAlertMilestone: `${milestone} min`,
    })),
  };
}
