import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { prisma } from '../prisma';

dotenv.config();

export type SupportedLanguage = 'FR' | 'HT' | 'ES';

// Configuration SMTP
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || "D'Alexis Transferencia <notifications@dalexistransferencia.com>";
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';

const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  console.log(`📧 Service Email configuré via SMTP (${SMTP_HOST}:${SMTP_PORT}) - Émetteur: ${SMTP_FROM}`);
} else {
  console.log('ℹ️ Service Email en mode simulation (Identifiants SMTP_USER / SMTP_PASS non renseignés dans .env). Les e-mails seront prévisualisés dans les logs.');
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email réel si SMTP est configuré, sinon affiche la prévisualisation dans la console
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) {
    return { success: false };
  }

  const toHeader = recipients.join(', ');

  if (!isSmtpConfigured || !transporter) {
    console.log(`\n======================================================`);
    console.log(`📨 [SIMULATION EMAIL] Vers: ${toHeader}`);
    console.log(`📌 Objet: ${subject}`);
    console.log(`📄 Texte brut:\n${text || 'Voir version HTML'}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: toHeader,
      subject,
      html,
      text: text || subject,
    });
    console.log(`✅ [EMAIL ENVOYÉ] ID: ${info.messageId} | Vers: ${toHeader} | Sujet: "${subject}"`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error) {
    console.error(`❌ [ERREUR EMAIL] Échec d'envoi vers ${toHeader}:`, error);
    return { success: false };
  }
}

/**
 * Dictionnaire multilingue pour les e-mails
 */
export const EMAIL_TRANSLATIONS = {
  FR: {
    slaAlertSubject: (ref: string, minutes: number) => `🚨 [ALERTE SLA] Transaction #${ref} en attente depuis ${minutes} minutes`,
    slaAlertTitle: 'Alerte Dépassement SLA - Transaction en Attente',
    slaAlertWarning: (minutes: number) => `Cette transaction est en attente d'exécution ou de validation depuis plus de <strong>${minutes} minutes</strong> sans avoir été clôturée.`,
    actionRequired: 'Action Requise Immédiatement',
    txDetailsTitle: 'Détails de l\'Opération',
    reference: 'Référence',
    operator: 'Opérateur',
    amountDOP: 'Montant Encaissé (DOP)',
    amountHTG: 'Montant à Décaisser (HTG)',
    sender: 'Expéditeur',
    receiver: 'Bénéficiaire',
    receiverPhone: 'Téléphone Bénéficiaire',
    assignedTo: 'Responsable Assigné',
    createdAt: 'Date d\'Émission',
    elapsedTime: 'Temps d\'Attente Total',
    openTxButton: 'Accéder à la Transaction',
    footerNote: 'Ce message d\'alerte automatique est renvoyé toutes les 30 minutes jusqu\'à ce que la transaction soit validée ou traitée.',
    newTxSubject: (ref: string) => `📋 [NOUVELLE TRANSACTION] Réf #${ref} à traiter`,
    completedTxSubject: (ref: string) => `✅ [VALIDÉE] Transaction #${ref} clôturée avec succès`,
    cancelledTxSubject: (ref: string) => `⚠️ [ANNULÉE] Transaction #${ref} annulée`,
  },
  HT: {
    slaAlertSubject: (ref: string, minutes: number) => `🚨 [ALÈT SLA] Tranzaksyon #${ref} ap tann depi ${minutes} minit san trete`,
    slaAlertTitle: 'Alèt Depasman SLA - Tranzaksyon ap Tann',
    slaAlertWarning: (minutes: number) => `Tranzaksyon sa a ap tann pou egzekite oswa valide depi plis pase <strong>${minutes} minit</strong> san li pa finalize.`,
    actionRequired: 'Aksyon Egzije Touswit',
    txDetailsTitle: 'Detay sou Operasyon an',
    reference: 'Referans',
    operator: 'Operatè',
    amountDOP: 'Montan Resevwa (DOP)',
    amountHTG: 'Montan pou Peye (HTG)',
    sender: 'Moun ki Voye a',
    receiver: 'Moun k ap Resevwa a',
    receiverPhone: 'Nimewo Telefòn Moun k ap Resevwa a',
    assignedTo: 'Responsab Ki Resevwa l',
    createdAt: 'Dat Li Fèt',
    elapsedTime: 'Tan Li Genyen Ap Tann',
    openTxButton: 'Louvri Tranzaksyon an',
    footerNote: 'Mesaj alèt otomatik sa a ap voye chak 30 minit jiskaske tranzaksyon an valide oswa trete nèt.',
    newTxSubject: (ref: string) => `📋 [NOUVO TRANZAKSYON] Referans #${ref} pou trete`,
    completedTxSubject: (ref: string) => `✅ [VALIDE] Tranzaksyon #${ref} finalize ak siksè`,
    cancelledTxSubject: (ref: string) => `⚠️ [ANILE] Tranzaksyon #${ref} anile`,
  },
  ES: {
    slaAlertSubject: (ref: string, minutes: number) => `🚨 [ALERTA SLA] Transacción #${ref} en espera desde hace ${minutes} minutos`,
    slaAlertTitle: 'Alerta de Tiempo SLA - Transacción en Espera',
    slaAlertWarning: (minutes: number) => `Esta transacción lleva en espera de procesamiento o validación más de <strong>${minutes} minutos</strong> sin haber sido completada.`,
    actionRequired: 'Acción Requerida Inmediatamente',
    txDetailsTitle: 'Detalles de la Operación',
    reference: 'Referencia',
    operator: 'Operador',
    amountDOP: 'Monto Cobrado (DOP)',
    amountHTG: 'Monto a Pagar (HTG)',
    sender: 'Remitente',
    receiver: 'Beneficiario',
    receiverPhone: 'Teléfono Beneficiario',
    assignedTo: 'Responsable Asignado',
    createdAt: 'Fecha de Emisión',
    elapsedTime: 'Tiempo de Espera Total',
    openTxButton: 'Ver Transacción en el Sistema',
    footerNote: 'Este mensaje de alerta automática se reenvía cada 30 minutos hasta que la transacción sea validada o procesada.',
    newTxSubject: (ref: string) => `📋 [NUEVA TRANSACCIÓN] Ref #${ref} por procesar`,
    completedTxSubject: (ref: string) => `✅ [COMPLETADA] Transacción #${ref} validada con éxito`,
    cancelledTxSubject: (ref: string) => `⚠️ [CANCELADA] Transacción #${ref} cancelada`,
  },
};

/**
 * Détermine la langue cible appropriée
 */
export function resolveLanguage(lang?: string | null, operator?: string, role?: string): SupportedLanguage {
  if (lang && (lang.toUpperCase() === 'HT' || lang.toUpperCase() === 'ES' || lang.toUpperCase() === 'FR')) {
    return lang.toUpperCase() as SupportedLanguage;
  }
  if (role === 'agent_haiti' || operator === 'natcash' || operator === 'natcom') {
    return 'HT';
  }
  if (role === 'agent_rd' || operator === 'claro' || operator === 'altice') {
    return 'ES';
  }
  return 'FR';
}

/**
 * Génère le template HTML d'alerte SLA pour les transactions en attente de plus de 30 minutes
 */
export function buildSlaAlertEmailHtml(tx: any, elapsedMinutes: number, lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
  const operatorUpper = (tx.operator || '').toUpperCase();
  const txUrl = `${FRONTEND_URL}/#tasks`;

  return `
<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
<head>
  <meta charset="utf-8">
  <title>${t.slaAlertTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
    .badge { display: inline-block; background: #e11d48; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; rounded: 9999px; border-radius: 20px; margin-bottom: 10px; }
    .title { font-size: 20px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: #cbd5e1; margin: 0; }
    .body { padding: 24px; }
    .alert-box { background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; padding: 14px 16px; border-radius: 12px; margin-bottom: 22px; color: #9f1239; font-size: 13px; line-height: 1.5; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px; }
    .card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 0; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .highlight-htg { color: #059669; font-weight: 900; font-family: monospace; font-size: 15px; }
    .highlight-min { color: #e11d48; font-weight: 900; font-family: monospace; }
    .cta-container { text-align: center; margin: 26px 0 16px 0; }
    .btn { display: inline-block; background: #e11d48; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 14px; box-shadow: 0 3px 10px rgba(225, 29, 72, 0.35); text-align: center; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">SLA CRITIQUE</div>
      <h1 class="title">${t.slaAlertTitle}</h1>
      <p class="subtitle">D'Alexis Transferencia y Accesorio • Système Opérationnel</p>
    </div>

    <div class="body">
      <div class="alert-box">
        ⚠️ <strong>${t.actionRequired} :</strong> ${t.slaAlertWarning(elapsedMinutes)}
      </div>

      <div class="card">
        <h3 class="card-title">${t.txDetailsTitle}</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.reference} :</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;">${tx.referenceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.operator} :</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #0f172a;">${operatorUpper}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.elapsedTime} :</td>
            <td style="padding: 6px 0; text-align: right; color: #e11d48; font-weight: 900; font-family: monospace; font-size: 14px;">⏱️ ${elapsedMinutes} min</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.amountHTG} :</td>
            <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 900; font-family: monospace; font-size: 15px;">${Number(tx.amountHTG).toLocaleString('fr-FR')} HTG</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.amountDOP} :</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #334155; font-family: monospace;">${Number(tx.amountDOP).toLocaleString('fr-FR')} DOP</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.receiver} :</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;">${tx.receiverName} (${tx.receiverPhone})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.sender} :</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #334155;">${tx.senderName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.assignedTo} :</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #2563eb;">${tx.assignedToName || tx.assignedToRole}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.createdAt} :</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b; font-size: 12px;">${new Date(tx.createdAt).toLocaleString('fr-FR')}</td>
          </tr>
        </table>
      </div>

      <div class="cta-container">
        <a href="${txUrl}" class="btn">${t.openTxButton} ➔</a>
      </div>
    </div>

    <div class="footer">
      ${t.footerNote}<br>
      © ${new Date().getFullYear()} D'Alexis Transferencia y Accesorio. Tous droits réservés.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Récupère tous les emails des personnes concernées par une transaction donnée
 * (Émetteur, Agent assigné, Administrateurs et Gestionnaires)
 */
export async function getConcernedStakeholderEmails(tx: any): Promise<{ email: string; role: string; name: string }[]> {
  const result: { email: string; role: string; name: string }[] = [];
  const seenEmails = new Set<string>();

  try {
    // 1. Tous les admins et gestionnaires
    const supervisors = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'gestionnaire'] },
      },
      select: { email: true, role: true, name: true },
    });

    for (const u of supervisors) {
      if (u.email && !seenEmails.has(u.email.toLowerCase())) {
        seenEmails.add(u.email.toLowerCase());
        result.push(u);
      }
    }

    // 2. L'agent créateur de la transaction (si identifiable)
    if (tx.createdByName) {
      const creator = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { contains: tx.createdByName } },
            { username: tx.createdByName },
          ],
        },
        select: { email: true, role: true, name: true },
      });
      if (creator && creator.email && !seenEmails.has(creator.email.toLowerCase())) {
        seenEmails.add(creator.email.toLowerCase());
        result.push(creator);
      }
    }

    // 3. L'agent assigné à la transaction
    if (tx.assignedToRole) {
      const assignedUsers = await prisma.user.findMany({
        where: {
          role: tx.assignedToRole,
        },
        select: { email: true, role: true, name: true },
      });
      for (const u of assignedUsers) {
        if (u.email && !seenEmails.has(u.email.toLowerCase())) {
          seenEmails.add(u.email.toLowerCase());
          result.push(u);
        }
      }
    }

    // 4. Emails d'administration statiques dans les variables d'environnement
    const adminEnvEmails = (process.env.ADMIN_NOTIFICATION_EMAILS || '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    for (const email of adminEnvEmails) {
      if (!seenEmails.has(email.toLowerCase())) {
        seenEmails.add(email.toLowerCase());
        result.push({ email, role: 'admin', name: 'Superviseur Général' });
      }
    }
  } catch (error) {
    console.error('Erreur getConcernedStakeholderEmails:', error);
  }

  return result;
}

/**
 * Envoie l'alerte SLA de 30 minutes (ou 60m, 90m...) à toutes les personnes concernées
 * dans la langue respective de chaque utilisateur
 */
export async function sendSlaAlertToStakeholders(tx: any, elapsedMinutes: number): Promise<{ sentCount: number; recipients: string[] }> {
  const stakeholders = await getConcernedStakeholderEmails(tx);
  if (stakeholders.length === 0) {
    console.warn(`[SLA ALERT] Aucun destinataire trouvé pour la transaction #${tx.referenceNumber}`);
    return { sentCount: 0, recipients: [] };
  }

  const recipientsSent: string[] = [];

  for (const person of stakeholders) {
    // Résolution de la langue selon le rôle de l'agent ou les paramètres
    const lang = resolveLanguage(null, tx.operator, person.role);
    const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

    const subject = t.slaAlertSubject(tx.referenceNumber, elapsedMinutes);
    const html = buildSlaAlertEmailHtml(tx, elapsedMinutes, lang);
    const text = `${t.slaAlertTitle}\n\nTransaction #${tx.referenceNumber} (${tx.operator.toUpperCase()})\nTemps d'attente : ${elapsedMinutes} minutes sans traitement.\nBénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\nMontant : ${tx.amountHTG} HTG / ${tx.amountDOP} DOP.\nResponsable : ${tx.assignedToName || tx.assignedToRole}.\n\nLien : ${FRONTEND_URL}/#tasks`;

    await sendEmail({
      to: person.email,
      subject,
      html,
      text,
    });

    recipientsSent.push(`${person.name} <${person.email}> [${lang}]`);
  }

  console.log(`🚨 [ALERTE SLA 30m+] Transaction #${tx.referenceNumber} (${elapsedMinutes}m en attente) envoyée à ${recipientsSent.length} destinataire(s): ${recipientsSent.join(', ')}`);

  return { sentCount: recipientsSent.length, recipients: recipientsSent };
}
