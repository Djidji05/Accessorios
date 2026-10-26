import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma';

dotenv.config();

export type SupportedLanguage = 'FR' | 'HT' | 'ES';

export interface EmailConfigState {
  provider: 'resend' | 'smtp' | 'simulation';
  resendApiKey: string;
  resendFrom: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  frontendUrl: string;
  adminNotificationEmails: string[];
}

const envFilePath = path.resolve(__dirname, '../../.env');

// État en mémoire dynamique (peut être mis à jour sans redémarrer le serveur)
export let emailConfig: EmailConfigState = {
  provider: 'simulation',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFrom: process.env.RESEND_FROM || "D'Alexis Transferencia <notifications@dalexistransferencia.com>",
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || process.env.RESEND_FROM || "D'Alexis Transferencia <notifications@dalexistransferencia.com>",
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  adminNotificationEmails: (process.env.ADMIN_NOTIFICATION_EMAILS || 'admin@accessorio.com,supervision@accessorio.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean),
};

export function isResendConfigured(): boolean {
  return Boolean(emailConfig.resendApiKey && emailConfig.resendApiKey.trim() !== '');
}

export function isSmtpConfigured(): boolean {
  return Boolean(emailConfig.smtpUser && emailConfig.smtpUser.trim() !== '' && emailConfig.smtpPass && emailConfig.smtpPass.trim() !== '');
}

export function isEmailConfigured(): boolean {
  return isResendConfigured() || isSmtpConfigured();
}

let transporter: Transporter | null = null;

/**
 * Re-crée et initialise le transporteur selon l'état actuel de emailConfig
 */
export function reloadTransporter(): void {
  transporter = null;

  if (isResendConfigured()) {
    emailConfig.provider = 'resend';
    console.log(`📧 Service Email configuré via RESEND API (HTTPS) - Émetteur: ${emailConfig.resendFrom}`);
  } else if (isSmtpConfigured()) {
    emailConfig.provider = 'smtp';
    transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpSecure,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`📧 Service Email configuré via SMTP (${emailConfig.smtpHost}:${emailConfig.smtpPort}) - Émetteur: ${emailConfig.smtpFrom}`);
  } else {
    emailConfig.provider = 'simulation';
    console.log('ℹ️ Service Email en mode simulation (Ni RESEND_API_KEY ni SMTP_USER/PASS renseignés dans .env). Les e-mails seront prévisualisés dans les logs.');
  }
}

// Initialisation au chargement
reloadTransporter();

/**
 * Sauvegarde les variables dans le fichier server/.env pour persistance
 */
export function persistConfigToEnv(updates: Partial<Record<string, string>>): void {
  try {
    let content = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';

    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) continue;
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const formattedLine = `${key}="${val.replace(/"/g, '\\"')}"`;
      if (regex.test(content)) {
        content = content.replace(regex, formattedLine);
      } else {
        content += `\n${formattedLine}`;
      }
    }

    fs.writeFileSync(envFilePath, content, 'utf8');
    console.log('💾 Paramètres e-mail enregistrés dans server/.env avec succès.');
  } catch (err) {
    console.error('❌ Échec de la persistance dans .env :', err);
  }
}

/**
 * Met à jour la configuration en mémoire et optionnellement dans .env
 */
export async function updateEmailConfig(
  newConfig: Partial<{
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
    resendApiKey: string;
    resendFrom: string;
    adminNotificationEmails: string[];
    frontendUrl: string;
  }>,
  persistToEnv: boolean = true
): Promise<{ success: boolean; message: string; status: any }> {
  if (newConfig.smtpHost !== undefined) emailConfig.smtpHost = newConfig.smtpHost.trim();
  if (newConfig.smtpPort !== undefined) emailConfig.smtpPort = Number(newConfig.smtpPort);
  if (newConfig.smtpSecure !== undefined) emailConfig.smtpSecure = Boolean(newConfig.smtpSecure);
  if (newConfig.smtpUser !== undefined) emailConfig.smtpUser = newConfig.smtpUser.trim();
  if (newConfig.smtpPass !== undefined) emailConfig.smtpPass = newConfig.smtpPass.trim();
  if (newConfig.smtpFrom !== undefined) emailConfig.smtpFrom = newConfig.smtpFrom.trim();
  if (newConfig.resendApiKey !== undefined) emailConfig.resendApiKey = newConfig.resendApiKey.trim();
  if (newConfig.resendFrom !== undefined) emailConfig.resendFrom = newConfig.resendFrom.trim();
  if (newConfig.frontendUrl !== undefined) emailConfig.frontendUrl = newConfig.frontendUrl.trim();
  if (newConfig.adminNotificationEmails !== undefined) {
    emailConfig.adminNotificationEmails = newConfig.adminNotificationEmails.map(e => e.trim()).filter(Boolean);
  }

  reloadTransporter();

  if (persistToEnv) {
    persistConfigToEnv({
      SMTP_HOST: emailConfig.smtpHost,
      SMTP_PORT: String(emailConfig.smtpPort),
      SMTP_SECURE: String(emailConfig.smtpSecure),
      SMTP_USER: emailConfig.smtpUser,
      SMTP_PASS: emailConfig.smtpPass,
      SMTP_FROM: emailConfig.smtpFrom,
      RESEND_API_KEY: emailConfig.resendApiKey,
      RESEND_FROM: emailConfig.resendFrom,
      ADMIN_NOTIFICATION_EMAILS: emailConfig.adminNotificationEmails.join(','),
      FRONTEND_URL: emailConfig.frontendUrl,
    });
  }

  return {
    success: true,
    message: 'Configuration e-mail mise à jour avec succès.',
    status: getEmailConfigStatus(),
  };
}

/**
 * Teste la connectivité du serveur SMTP ou Resend
 */
export async function verifyEmailConnection(): Promise<{ success: boolean; message: string }> {
  if (isResendConfigured()) {
    try {
      const response = await fetch('https://api.resend.com/api-keys', {
        headers: { Authorization: `Bearer ${emailConfig.resendApiKey.trim()}` },
      });
      if (response.ok) {
        return { success: true, message: 'Connexion à l\'API Resend établie avec succès (Clé API valide).' };
      }
      return { success: false, message: `Échec de validation de la clé API Resend (Code ${response.status}).` };
    } catch (err: any) {
      return { success: false, message: `Erreur de connexion HTTPS vers Resend : ${err.message}` };
    }
  }

  if (isSmtpConfigured() && transporter) {
    try {
      await transporter.verify();
      return { success: true, message: `Connexion SMTP établie avec succès auprès de ${emailConfig.smtpHost}:${emailConfig.smtpPort}.` };
    } catch (err: any) {
      return { success: false, message: `Erreur d'authentification SMTP (${err.code || 'ERR'}) : ${err.message}` };
    }
  }

  return {
    success: false,
    message: 'Le service email est en mode simulation. Veuillez renseigner vos identifiants SMTP ou votre clé Resend.',
  };
}

/**
 * Retourne le statut public de configuration email
 */
export function getEmailConfigStatus() {
  const isSmtp = isSmtpConfigured();
  const isResend = isResendConfigured();
  return {
    isConfigured: isSmtp || isResend,
    provider: isResend ? 'resend' : isSmtp ? 'smtp' : 'simulation',
    providerLabel: isResend ? 'Resend (API HTTPS)' : isSmtp ? 'SMTP Standard / Gmail' : 'Simulation (Logs console)',
    smtpHost: emailConfig.smtpHost,
    smtpPort: emailConfig.smtpPort,
    smtpSecure: emailConfig.smtpSecure,
    smtpUser: emailConfig.smtpUser ? `${emailConfig.smtpUser.slice(0, 3)}***@${emailConfig.smtpUser.split('@')[1] || ''}` : '',
    hasSmtpPass: Boolean(emailConfig.smtpPass),
    smtpFrom: emailConfig.smtpFrom,
    hasResendKey: Boolean(emailConfig.resendApiKey),
    resendFrom: emailConfig.resendFrom,
    adminNotificationEmails: emailConfig.adminNotificationEmails,
    frontendUrl: emailConfig.frontendUrl,
  };
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email réel via Resend API ou SMTP si configuré, sinon affiche la prévisualisation dans la console
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) {
    return { success: false, error: 'Aucun destinataire' };
  }

  const toHeader = recipients.join(', ');

  // 1. Envoi via Resend API (HTTPS port 443)
  if (isResendConfigured()) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailConfig.resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailConfig.resendFrom,
          to: recipients,
          subject,
          html,
          text: text || subject,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error(`❌ [RESEND ERREUR] Statut ${response.status}:`, data);
        return { success: false, error: data.message || JSON.stringify(data) };
      }

      console.log(`✅ [RESEND EMAIL ENVOYÉ] ID: ${data.id} | Vers: ${toHeader} | Sujet: "${subject}"`);
      return { success: true, messageId: data.id, simulated: false };
    } catch (error: any) {
      console.error(`❌ [RESEND EXCEPTION] Vers ${toHeader}:`, error);
      return { success: false, error: error.message };
    }
  }

  // 2. Envoi via SMTP classique ou relais SMTP
  if (isSmtpConfigured() && transporter) {
    try {
      const info = await transporter.sendMail({
        from: emailConfig.smtpFrom,
        to: toHeader,
        subject,
        html,
        text: text || subject,
      });
      console.log(`✅ [EMAIL SMTP ENVOYÉ] ID: ${info.messageId} | Vers: ${toHeader} | Sujet: "${subject}"`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (error: any) {
      console.error(`❌ [ERREUR EMAIL SMTP] Échec d'envoi vers ${toHeader}:`, error);
      return { success: false, error: error.message };
    }
  }

  // 3. Mode Simulation (Logs)
  console.log(`\n======================================================`);
  console.log(`📨 [SIMULATION EMAIL] (Aucun compte email actif configuré)`);
  console.log(`📬 Vers: ${toHeader}`);
  console.log(`📌 Objet: ${subject}`);
  console.log(`📄 Texte brut:\n${text || 'Voir version HTML'}`);
  console.log(`======================================================\n`);
  return { success: true, simulated: true };
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
    newTxTitle: 'Nouvelle Transaction Enregistrée',
    newTxSubtitle: 'Une nouvelle opération est en attente de décaissement ou traitement',
    completedTxSubject: (ref: string) => `✅ [VALIDÉE] Transaction #${ref} clôturée avec succès`,
    completedTxTitle: 'Transaction Clôturée avec Succès',
    completedTxSubtitle: 'Le versement ou la recharge a été effectué(e) avec succès',
    cancelledTxSubject: (ref: string) => `⚠️ [ANNULÉE] Transaction #${ref} annulée`,
    cancelledTxTitle: 'Transaction Annulée & Fonds Restitués',
    cancellationReason: 'Motif d\'annulation',
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
    newTxTitle: 'Nouvo Tranzaksyon Anrejistre',
    newTxSubtitle: 'Yon nouvo operasyon ap tann pou peye oswa trete',
    completedTxSubject: (ref: string) => `✅ [VALIDE] Tranzaksyon #${ref} finalize ak siksè`,
    completedTxTitle: 'Tranzaksyon Finalize ak Siksè',
    completedTxSubtitle: 'Kòb la fin delivre bay kliyan an ak siksè',
    cancelledTxSubject: (ref: string) => `⚠️ [ANILE] Tranzaksyon #${ref} anile`,
    cancelledTxTitle: 'Tranzaksyon Anile & Lajan Retounen',
    cancellationReason: 'Rezon anilasyon an',
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
    newTxTitle: 'Nueva Transacción Registrada',
    newTxSubtitle: 'Una nueva operación está en cola de desembolso o recarga',
    completedTxSubject: (ref: string) => `✅ [COMPLETADA] Transacción #${ref} validada con éxito`,
    completedTxTitle: 'Transacción Completada con Éxito',
    completedTxSubtitle: 'El desembolso o servicio ha sido completado con éxito',
    cancelledTxSubject: (ref: string) => `⚠️ [CANCELADA] Transacción #${ref} cancelada`,
    cancelledTxTitle: 'Transacción Cancelada y Fondos Restituidos',
    cancellationReason: 'Motivo de cancelación',
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
 * Template de base uniforme et élégant
 */
function wrapEmailHtml(contentHtml: string, title: string, subtitle: string, badgeText: string, badgeBg: string = '#2563eb', lang: SupportedLanguage = 'FR'): string {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
    .header { background: linear-gradient(135deg, #090d16 0%, #1e293b 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
    .badge { display: inline-block; background: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.5px; color: #ffffff; }
    .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
    .body { padding: 26px 24px; background: #ffffff; }
    .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${badgeText}</div>
      <h1 class="title">${title}</h1>
      <p class="subtitle">${subtitle}</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      D'Alexis Transferencia y Accesorio • Système Opérationnel Sécurisé<br>
      © ${currentYear} Tous droits réservés.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Génère le tableau des détails de transaction
 */
function buildTxTableHtml(tx: any, t: any): string {
  const operatorUpper = (tx.operator || '').toUpperCase();
  return `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
      <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 0; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        ${t.txDetailsTitle}
      </h3>
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
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.amountHTG} :</td>
          <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 900; font-family: monospace; font-size: 15px;">${Number(tx.amountHTG || 0).toLocaleString('fr-FR')} HTG</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${t.amountDOP} :</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #334155; font-family: monospace;">${Number(tx.amountDOP || 0).toLocaleString('fr-FR')} DOP</td>
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
          <td style="padding: 6px 0; text-align: right; color: #64748b; font-size: 12px;">${new Date(tx.createdAt || Date.now()).toLocaleString('fr-FR')}</td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Template SLA 30m+
 */
export function buildSlaAlertEmailHtml(tx: any, elapsedMinutes: number, lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
  const txUrl = `${emailConfig.frontendUrl}/#tasks`;

  const content = `
    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; padding: 14px 16px; border-radius: 12px; margin-bottom: 22px; color: #9f1239; font-size: 13px; line-height: 1.5;">
      ⚠️ <strong>${t.actionRequired} :</strong> ${t.slaAlertWarning(elapsedMinutes)}
    </div>
    ${buildTxTableHtml(tx, t)}
    <div style="text-align: center; margin: 26px 0 10px 0;">
      <a href="${txUrl}" style="display: inline-block; background: #e11d48; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 14px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35); text-align: center;">
        ${t.openTxButton} ➔
      </a>
    </div>
  `;

  return wrapEmailHtml(content, t.slaAlertTitle, "Alerte de dépassement SLA de traitement", "SLA CRITIQUE", "#e11d48", lang);
}

/**
 * Template Nouvelle Transaction
 */
export function buildNewTxEmailHtml(tx: any, lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
  const txUrl = `${emailConfig.frontendUrl}/#tasks`;

  const content = `
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 12px; margin-bottom: 22px; color: #1e40af; font-size: 13px; line-height: 1.5;">
      📋 <strong>${t.newTxTitle} :</strong> ${t.newTxSubtitle}
    </div>
    ${buildTxTableHtml(tx, t)}
    <div style="text-align: center; margin: 26px 0 10px 0;">
      <a href="${txUrl}" style="display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); text-align: center;">
        ${t.openTxButton} ➔
      </a>
    </div>
  `;

  return wrapEmailHtml(content, t.newTxTitle, t.newTxSubtitle, "NOUVELLE TRANSACTION", "#2563eb", lang);
}

/**
 * Template Clôture / Validation
 */
export function buildCompletedTxEmailHtml(tx: any, lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
  const txUrl = `${emailConfig.frontendUrl}/#history`;

  const content = `
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 12px; margin-bottom: 22px; color: #166534; font-size: 13px; line-height: 1.5;">
      ✅ <strong>${t.completedTxTitle} :</strong> ${t.completedTxSubtitle}
      ${tx.proofNotes ? `<br><span style="font-size: 12px; margin-top: 4px; display: inline-block;">Note: <em>${tx.proofNotes}</em></span>` : ''}
    </div>
    ${buildTxTableHtml(tx, t)}
    <div style="text-align: center; margin: 26px 0 10px 0;">
      <a href="${txUrl}" style="display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 14px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35); text-align: center;">
        Voir l'historique ➔
      </a>
    </div>
  `;

  return wrapEmailHtml(content, t.completedTxTitle, t.completedTxSubtitle, "TRANSACTION VALIDÉE", "#16a34a", lang);
}

/**
 * Template Annulation
 */
export function buildCancelledTxEmailHtml(tx: any, reason: string, lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

  const content = `
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 14px 16px; border-radius: 12px; margin-bottom: 22px; color: #991b1b; font-size: 13px; line-height: 1.5;">
      ⚠️ <strong>${t.cancelledTxTitle} :</strong> ${reason || 'Annulé par l\'administrateur'}
    </div>
    ${buildTxTableHtml(tx, t)}
  `;

  return wrapEmailHtml(content, t.cancelledTxTitle, "Annulation et restitution du solde", "ANNULÉE", "#dc2626", lang);
}

/**
 * Récupère tous les emails des personnes concernées par une transaction
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

    // 2. L'agent créateur de la transaction
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

    // 4. Emails d'administration statiques configurés
    for (const email of emailConfig.adminNotificationEmails) {
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
 * Envoie l'alerte SLA 30m+
 */
export async function sendSlaAlertToStakeholders(tx: any, elapsedMinutes: number): Promise<{ sentCount: number; recipients: string[] }> {
  const stakeholders = await getConcernedStakeholderEmails(tx);
  if (stakeholders.length === 0) {
    return { sentCount: 0, recipients: [] };
  }

  const recipientsSent: string[] = [];

  for (const person of stakeholders) {
    const lang = resolveLanguage(null, tx.operator, person.role);
    const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

    const subject = t.slaAlertSubject(tx.referenceNumber, elapsedMinutes);
    const html = buildSlaAlertEmailHtml(tx, elapsedMinutes, lang);
    const text = `${t.slaAlertTitle}\n\nTransaction #${tx.referenceNumber} (${tx.operator.toUpperCase()})\nTemps d'attente : ${elapsedMinutes} minutes sans traitement.\nBénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\nMontant : ${tx.amountHTG} HTG / ${tx.amountDOP} DOP.\nResponsable : ${tx.assignedToName || tx.assignedToRole}.\n\nLien : ${emailConfig.frontendUrl}/#tasks`;

    await sendEmail({
      to: person.email,
      subject,
      html,
      text,
    });

    recipientsSent.push(`${person.name} <${person.email}> [${lang}]`);
  }

  return { sentCount: recipientsSent.length, recipients: recipientsSent };
}

/**
 * Envoie une notification lors de la création d'une transaction
 */
export async function sendNewTransactionNotification(tx: any): Promise<{ sentCount: number }> {
  try {
    const stakeholders = await getConcernedStakeholderEmails(tx);
    if (stakeholders.length === 0) return { sentCount: 0 };

    for (const person of stakeholders) {
      const lang = resolveLanguage(null, tx.operator, person.role);
      const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
      const subject = t.newTxSubject(tx.referenceNumber);
      const html = buildNewTxEmailHtml(tx, lang);
      const text = `${t.newTxTitle} : #${tx.referenceNumber}\nMontant : ${tx.amountHTG} HTG (${tx.amountDOP} DOP)\nBénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\nLien : ${emailConfig.frontendUrl}/#tasks`;

      await sendEmail({
        to: person.email,
        subject,
        html,
        text,
      });
    }

    return { sentCount: stakeholders.length };
  } catch (err) {
    console.error('Erreur sendNewTransactionNotification:', err);
    return { sentCount: 0 };
  }
}

/**
 * Envoie une notification lors de la clôture/décaissement réussi
 */
export async function sendTransactionCompletedNotification(tx: any): Promise<{ sentCount: number }> {
  try {
    const stakeholders = await getConcernedStakeholderEmails(tx);
    if (stakeholders.length === 0) return { sentCount: 0 };

    for (const person of stakeholders) {
      const lang = resolveLanguage(null, tx.operator, person.role);
      const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
      const subject = t.completedTxSubject(tx.referenceNumber);
      const html = buildCompletedTxEmailHtml(tx, lang);
      const text = `${t.completedTxTitle} : #${tx.referenceNumber}\nBénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\nMontant : ${tx.amountHTG} HTG payé avec succès.\nNote : ${tx.proofNotes || 'SMS validé'}`;

      await sendEmail({
        to: person.email,
        subject,
        html,
        text,
      });
    }

    return { sentCount: stakeholders.length };
  } catch (err) {
    console.error('Erreur sendTransactionCompletedNotification:', err);
    return { sentCount: 0 };
  }
}

/**
 * Envoie une notification lors de l'annulation d'une transaction
 */
export async function sendTransactionCancelledNotification(tx: any, reason: string): Promise<{ sentCount: number }> {
  try {
    const stakeholders = await getConcernedStakeholderEmails(tx);
    if (stakeholders.length === 0) return { sentCount: 0 };

    for (const person of stakeholders) {
      const lang = resolveLanguage(null, tx.operator, person.role);
      const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
      const subject = t.cancelledTxSubject(tx.referenceNumber);
      const html = buildCancelledTxEmailHtml(tx, reason, lang);
      const text = `${t.cancelledTxTitle} : #${tx.referenceNumber}\nMotif : ${reason}\nMontant restitué au compte flotte.`;

      await sendEmail({
        to: person.email,
        subject,
        html,
        text,
      });
    }

    return { sentCount: stakeholders.length };
  } catch (err) {
    console.error('Erreur sendTransactionCancelledNotification:', err);
    return { sentCount: 0 };
  }
}
