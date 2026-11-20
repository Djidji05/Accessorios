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
  frontendUrl: process.env.FRONTEND_URL || 'https://alexistransferencia.app',
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
 * Dictionnaire multilingue soigné, humain et professionnel pour les e-mails de notification
 */
export const EMAIL_TRANSLATIONS = {
  FR: {
    newTxSubject: (ref: string) => `D'Alexis Transferencia - Confirmation de transaction #${ref}`,
    newTxBadge: 'Transaction Enregistrée',
    newTxGreeting: (name: string) => `Bonjour ${name},`,
    newTxIntro: (ref: string) => `Votre transaction sous la référence <strong>#${ref}</strong> a bien été enregistrée dans notre système. En voici le récapitulatif détaillé :`,

    completedTxSubject: (ref: string) => `D'Alexis Transferencia - Transaction #${ref} finalisée avec succès`,
    completedTxBadge: 'Transaction Validée',
    completedTxGreeting: (name: string) => `Bonjour ${name},`,
    completedTxIntro: (ref: string) => `Nous vous confirmons que la transaction portant la référence <strong>#${ref}</strong> a été exécutée et clôturée avec succès. Les fonds ont été délivrés au bénéficiaire.`,

    cancelledTxSubject: (ref: string) => `D'Alexis Transferencia - Avis d'annulation de transaction #${ref}`,
    cancelledTxBadge: 'Transaction Annulée',
    cancelledTxGreeting: (name: string) => `Bonjour ${name},`,
    cancelledTxIntro: (ref: string) => `Nous vous informons que la transaction portant la référence <strong>#${ref}</strong> a été annulée.`,
    cancellationReasonLabel: 'Motif d\'annulation :',
    cancellationRefundNote: 'Le solde correspondant a été restitué conformément aux procédures de gestion.',

    slaAlertSubject: (ref: string, timeText: string | number) => `D'Alexis Transferencia - Suivi de dossier : Transaction #${ref} en attente`,
    slaAlertBadge: 'Dossier en Attente',
    slaAlertTitle: 'Suivi de dossier - Transaction en attente (24h+)',
    slaAlertGreeting: (name: string) => `Bonjour ${name},`,
    slaAlertIntro: (timeText: string | number) => `La transaction ci-dessous est en attente de traitement depuis plus de <strong>${typeof timeText === 'number' && timeText >= 60 ? `${Math.floor(timeText / 60)} heures` : timeText}</strong>. Merci de bien vouloir vérifier son état.`,
    slaAlertWarning: (timeText: string | number) => `Cette transaction est en attente de traitement depuis plus de <strong>${typeof timeText === 'number' && timeText >= 60 ? `${Math.floor(timeText / 60)} heures` : timeText}</strong>.`,

    txDetailsTitle: 'Détails de l\'opération',
    reference: 'Référence',
    operator: 'Service / Opérateur',
    amountDOP: 'Montant encaissé (DOP)',
    amountHTG: 'Montant à décaisser (HTG)',
    sender: 'Expéditeur',
    receiver: 'Bénéficiaire',
    receiverPhone: 'Téléphone du bénéficiaire',
    assignedTo: 'Responsable assigné',
    createdAt: 'Date d\'émission',
    openTxButton: 'Consulter dans l\'application',
    supportContact: 'Pour toute question ou assistance opérationnelle, notre service d\'assistance reste à votre disposition.',
    signoff: 'Cordialement,<br><strong>Service des Opérations</strong><br>D\'Alexis Transferencia y Accesorio',
    footerRights: 'Tous droits réservés.',
    footerNotice: 'Ce message a été adressé automatiquement à l\'agent ayant effectué cette transaction.',
  },
  HT: {
    newTxSubject: (ref: string) => `D'Alexis Transferencia - Konfimasyon tranzaksyon #${ref}`,
    newTxBadge: 'Tranzaksyon Anrejistre',
    newTxGreeting: (name: string) => `Bonjou ${name},`,
    newTxIntro: (ref: string) => `Tranzaksyon ou a ki pote referans <strong>#${ref}</strong> anrejistre avèk siksè nan sistèm nan. Men detay operasyon an :`,

    completedTxSubject: (ref: string) => `D'Alexis Transferencia - Tranzaksyon #${ref} finalize avèk siksè`,
    completedTxBadge: 'Tranzaksyon Finalize',
    completedTxGreeting: (name: string) => `Bonjou ${name},`,
    completedTxIntro: (ref: string) => `Nou konfime ou tranzaksyon ki gen referans <strong>#${ref}</strong> an finalize avèk siksè epi lajan an fin delivre bay benefisyè a.`,

    cancelledTxSubject: (ref: string) => `D'Alexis Transferencia - Avi anilasyon tranzaksyon #${ref}`,
    cancelledTxBadge: 'Tranzaksyon Anile',
    cancelledTxGreeting: (name: string) => `Bonjou ${name},`,
    cancelledTxIntro: (ref: string) => `Nou enfòme ou tranzaksyon ki gen referans <strong>#${ref}</strong> an te anile.`,
    cancellationReasonLabel: 'Rezon anilasyon :',
    cancellationRefundNote: 'Balans lan te reajiste selon règleman nòmal yo.',

    slaAlertSubject: (ref: string, timeText: string | number) => `D'Alexis Transferencia - Rapèl swivi tranzaksyon #${ref} ap tann`,
    slaAlertBadge: 'Dosye Ap Tann',
    slaAlertTitle: 'Swivi dosye - Tranzaksyon ap tann (24h+)',
    slaAlertGreeting: (name: string) => `Bonjou ${name},`,
    slaAlertIntro: (timeText: string | number) => `Tranzaksyon ki anba a ap tann pou trete depi plis pase <strong>${typeof timeText === 'number' && timeText >= 60 ? `${Math.floor(timeText / 60)} èdtan` : timeText}</strong>. Tanpri verifye dosye sa a.`,
    slaAlertWarning: (timeText: string | number) => `Tranzaksyon sa a ap tann pou trete depi plis pase <strong>${typeof timeText === 'number' && timeText >= 60 ? `${Math.floor(timeText / 60)} èdtan` : timeText}</strong>.`,

    txDetailsTitle: 'Detay Operasyon an',
    reference: 'Referans',
    operator: 'Sèvis / Operatè',
    amountDOP: 'Montan Resevwa (DOP)',
    amountHTG: 'Montan pou Peye (HTG)',
    sender: 'Moun ki Voye a',
    receiver: 'Benefisyè',
    receiverPhone: 'Nimewo Telefòn Benefisyè a',
    assignedTo: 'Responsab Asiye',
    createdAt: 'Dat Li Fèt',
    openTxButton: 'Gade nan Aplikasyon an',
    supportContact: 'Pou nenpòt kesyon oswa sipò sou operasyon sa a, ekip sipò a toujou disponib pou ede w.',
    signoff: 'Sensèman,<br><strong>Sèvis Operasyon</strong><br>D\'Alexis Transferencia y Accesorio',
    footerRights: 'Tout dwa rezève.',
    footerNotice: 'Mesaj sa a voye otomatikman bay ajan ki te fè tranzaksyon an.',
  },
  ES: {
    newTxSubject: (ref: string) => `D'Alexis Transferencia - Confirmación de transacción #${ref}`,
    newTxBadge: 'Transacción Registrada',
    newTxGreeting: (name: string) => `Estimado/a ${name},`,
    newTxIntro: (ref: string) => `Su transacción con el número de referencia <strong>#${ref}</strong> ha sido registrada exitosamente en nuestro sistema. A continuación los detalles de la operación:`,

    completedTxSubject: (ref: string) => `D'Alexis Transferencia - Transacción #${ref} completada con éxito`,
    completedTxBadge: 'Transacción Completada',
    completedTxGreeting: (name: string) => `Estimado/a ${name},`,
    completedTxIntro: (ref: string) => `Le confirmamos que la transacción con número de referencia <strong>#${ref}</strong> ha sido procesada y completada satisfactoriamente. Los fondos han sido entregados al beneficiario.`,

    cancelledTxSubject: (ref: string) => `D'Alexis Transferencia - Notificación de anulación #${ref}`,
    cancelledTxBadge: 'Transacción Anulada',
    cancelledTxGreeting: (name: string) => `Estimado/a ${name},`,
    cancelledTxIntro: (ref: string) => `Le informamos que la transacción con número de referencia <strong>#${ref}</strong> ha sido cancelada.`,
    cancellationReasonLabel: 'Motivo de la anulación:',
    cancellationRefundNote: 'El balance correspondiente ha sido restituido conforme a nuestras normas operativas.',

    slaAlertSubject: (ref: string, timeText: string | number) => `D'Alexis Transferencia - Seguimiento de transacción #${ref} en espera`,
    slaAlertBadge: 'Seguimiento Requerido',
    slaAlertTitle: 'Seguimiento de caso - Transacción en espera (24h+)',
    slaAlertGreeting: (name: string) => `Estimado/a ${name},`,
    slaAlertIntro: (timeText: string | number) => `La transacción indicada a continuación se encuentra pendiente de procesamiento desde hace más de <strong>${typeof timeText === 'number' && timeText >= 60 ? `${Math.floor(timeText / 60)} horas` : timeText}</strong>. Por favor, revise el estado del caso.`,
    slaAlertWarning: (timeText: string | number) => `Esta transacción se encuentra en espera de procesamiento desde hace más de <strong>${typeof timeText === 'number' && timeText >= 60 ? `${Math.floor(timeText / 60)} horas` : timeText}</strong>.`,

    txDetailsTitle: 'Detalles de la Operación',
    reference: 'Referencia',
    operator: 'Servicio / Operador',
    amountDOP: 'Monto Cobrado (DOP)',
    amountHTG: 'Monto a Entregar (HTG)',
    sender: 'Remitente',
    receiver: 'Beneficiario',
    receiverPhone: 'Teléfono del Beneficiario',
    assignedTo: 'Responsable Asignado',
    createdAt: 'Fecha de Emisión',
    openTxButton: 'Ver en la Aplicación',
    supportContact: 'Para cualquier consulta o asistencia con esta transacción, comuníquese con el departamento operativo.',
    signoff: 'Atentamente,<br><strong>Departamento de Operaciones</strong><br>D\'Alexis Transferencia y Accesorio',
    footerRights: 'Todos los derechos reservados.',
    footerNotice: 'Este mensaje fue enviado automáticamente al usuario que ejecutó la operación.',
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
 * Gabarit de présentation corporate pour les e-mails de transaction
 */
function wrapEmailHtml(
  contentHtml: string,
  badgeText: string,
  badgeBg: string = '#e0f2fe',
  badgeColor: string = '#0369a1',
  lang: SupportedLanguage = 'FR'
): string {
  const currentYear = new Date().getFullYear();
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

  return `
<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D'Alexis Transferencia y Accesorio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 28px 14px; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);">
          <!-- Header Institutionnel -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 28px; text-align: left; border-bottom: 3px solid #0284c7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                      D'Alexis Transferencia y Accesorio
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
                      Services Financiers & Transferts Internationaux
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.4px;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps du message -->
          <tr>
            <td style="padding: 28px 28px 20px 28px; background-color: #ffffff;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6;">
              <strong style="color: #475569;">D'Alexis Transferencia y Accesorio</strong><br>
              ${t.footerNotice}<br>
              © ${currentYear} D'Alexis Transferencia y Accesorio. ${t.footerRights}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Tableau de détails financiers soigné et lisible
 */
function buildTxTableHtml(tx: any, t: any): string {
  const operatorUpper = (tx.operator || '').toUpperCase();
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px; margin-bottom: 22px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
      <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td colspan="2" style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
          ${t.txDetailsTitle}
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500; width: 42%;">${t.reference} :</td>
        <td style="padding: 9px 16px; text-align: right; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 13px; font-weight: 700; color: #0f172a;">${tx.referenceNumber}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fafbfc;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.operator} :</td>
        <td style="padding: 9px 16px; text-align: right; font-weight: 600; color: #0f172a;">${operatorUpper}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.amountDOP} :</td>
        <td style="padding: 9px 16px; text-align: right; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; font-weight: 700; color: #0f172a;">${Number(tx.amountDOP || 0).toLocaleString('fr-FR')} DOP</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fafbfc;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.amountHTG} :</td>
        <td style="padding: 9px 16px; text-align: right; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 15px; font-weight: 700; color: #059669;">${Number(tx.amountHTG || 0).toLocaleString('fr-FR')} HTG</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.receiver} :</td>
        <td style="padding: 9px 16px; text-align: right; font-weight: 600; color: #0f172a;">${tx.receiverName || '—'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fafbfc;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.receiverPhone} :</td>
        <td style="padding: 9px 16px; text-align: right; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 600; color: #0f172a;">${tx.receiverPhone || '—'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.sender} :</td>
        <td style="padding: 9px 16px; text-align: right; font-weight: 500; color: #334155;">${tx.senderName || '—'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fafbfc;">
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.assignedTo} :</td>
        <td style="padding: 9px 16px; text-align: right; font-weight: 600; color: #0284c7;">${tx.assignedToName || tx.assignedToRole || '—'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 16px; color: #64748b; font-weight: 500;">${t.createdAt} :</td>
        <td style="padding: 9px 16px; text-align: right; color: #64748b; font-size: 12px;">${new Date(tx.createdAt || Date.now()).toLocaleString('fr-FR')}</td>
      </tr>
    </table>
  `;
}

/**
 * Template Nouvelle Transaction (Agent ayant effectué la transaction)
 */
export function buildNewTxEmailHtml(tx: any, agentName: string = 'Agent', lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

  const content = `
    <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">
      ${t.newTxGreeting(agentName)}
    </div>
    <div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
      ${t.newTxIntro(tx.referenceNumber)}
    </div>

    ${buildTxTableHtml(tx, t)}

    <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      ${t.supportContact}
    </div>
    <div style="font-size: 13px; color: #334155; margin-top: 14px; line-height: 1.6;">
      ${t.signoff}
    </div>
  `;

  return wrapEmailHtml(content, t.newTxBadge, '#e0f2fe', '#0369a1', lang);
}

/**
 * Template Clôture / Validation (Agent ayant effectué la transaction)
 */
export function buildCompletedTxEmailHtml(tx: any, agentName: string = 'Agent', lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

  const proofHtml = tx.proofNotes
    ? `
      <div style="background-color: #f0fdf4; border-left: 3px solid #16a34a; padding: 12px 14px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #166534;">
        <strong>Validation de décaissement :</strong> ${tx.proofNotes}
      </div>
    `
    : '';

  const content = `
    <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">
      ${t.completedTxGreeting(agentName)}
    </div>
    <div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
      ${t.completedTxIntro(tx.referenceNumber)}
    </div>

    ${proofHtml}
    ${buildTxTableHtml(tx, t)}

    <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      ${t.supportContact}
    </div>
    <div style="font-size: 13px; color: #334155; margin-top: 14px; line-height: 1.6;">
      ${t.signoff}
    </div>
  `;

  return wrapEmailHtml(content, t.completedTxBadge, '#dcfce7', '#15803d', lang);
}

/**
 * Template Annulation (Agent ayant effectué la transaction)
 */
export function buildCancelledTxEmailHtml(tx: any, reason: string, agentName: string = 'Agent', lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;

  const content = `
    <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">
      ${t.cancelledTxGreeting(agentName)}
    </div>
    <div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
      ${t.cancelledTxIntro(tx.referenceNumber)}
    </div>

    <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px 14px; border-radius: 6px; margin: 16px 0 20px 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
      <strong>${t.cancellationReasonLabel}</strong> ${reason || 'Non spécifié'}<br>
      <span style="font-size: 12px; color: #b91c1c; margin-top: 3px; display: inline-block;">${t.cancellationRefundNote}</span>
    </div>

    ${buildTxTableHtml(tx, t)}

    <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      ${t.supportContact}
    </div>
    <div style="font-size: 13px; color: #334155; margin-top: 14px; line-height: 1.6;">
      ${t.signoff}
    </div>
  `;

  return wrapEmailHtml(content, t.cancelledTxBadge, '#fee2e2', '#b91c1c', lang);
}

/**
 * Template Rappel SLA 24h+ (Supervision interne)
 */
export function buildSlaAlertEmailHtml(tx: any, elapsedMinutes: number, lang: SupportedLanguage = 'FR'): string {
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const timeFormatted = elapsedHours >= 24 ? `${elapsedHours} heures` : `${elapsedMinutes} min`;

  const content = `
    <div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
      ${t.slaAlertIntro(timeFormatted)}
    </div>

    ${buildTxTableHtml(tx, t)}

    <div style="font-size: 13px; color: #334155; margin-top: 18px; line-height: 1.6;">
      ${t.signoff}
    </div>
  `;

  return wrapEmailHtml(content, t.slaAlertBadge, '#fef3c7', '#b45309', lang);
}

/**
 * Récupère l'agent RD qui a réellement effectué / créé la transaction.
 * RÈGLE STRICTE : SEULS LES AGENTS RD DOIVENT RECEVOIR DES E-MAILS DE TRANSACTION.
 * Les Administrateurs, les Agents Haïti et les Gestionnaires ne doivent en aucun cas recevoir d'e-mails.
 */
export async function getTransactionAgent(tx: any): Promise<{ email: string; role: string; name: string } | null> {
  try {
    // Si la transaction indique explicitement un rôle non agent_rd (ex: admin, agent_haiti, gestionnaire), bloquer immédiatement
    if (tx.createdByRole && tx.createdByRole !== 'agent_rd') {
      console.log(`ℹ️ [EMAIL FILTRÉ] Rôle créateur "${tx.createdByRole}" non éligible. Seuls les agents RD reçoivent des e-mails.`);
      return null;
    }

    // 1. Recherche par nom d'affichage ou username de l'émetteur
    if (tx.createdByName) {
      const creator = await prisma.user.findFirst({
        where: {
          OR: [
            { name: tx.createdByName },
            { name: { contains: tx.createdByName } },
            { username: tx.createdByName },
          ],
        },
        select: { email: true, role: true, name: true },
      });
      if (creator && creator.email && creator.email.trim() !== '') {
        // Validation stricte du rôle : UNIQUEMENT agent_rd
        if (creator.role !== 'agent_rd') {
          console.log(`ℹ️ [EMAIL FILTRÉ] L'utilisateur "${creator.name}" a le rôle "${creator.role}". Les e-mails sont strictement réservés aux agents RD.`);
          return null;
        }
        return {
          email: creator.email.trim(),
          role: creator.role,
          name: creator.name || tx.createdByName,
        };
      }
    }

    // 2. Recherche par nodeId
    if (tx.createdByNode) {
      const creatorByNode = await prisma.user.findFirst({
        where: { nodeId: tx.createdByNode },
        select: { email: true, role: true, name: true },
      });
      if (creatorByNode && creatorByNode.email && creatorByNode.email.trim() !== '') {
        if (creatorByNode.role !== 'agent_rd') {
          console.log(`ℹ️ [EMAIL FILTRÉ] Le nœud "${tx.createdByNode}" appartient à un rôle "${creatorByNode.role}". E-mails réservés aux agents RD.`);
          return null;
        }
        return {
          email: creatorByNode.email.trim(),
          role: creatorByNode.role,
          name: creatorByNode.name || tx.createdByName || 'Agent RD',
        };
      }
    }

    // 3. Fallback ciblé par rôle de création (strictement agent_rd)
    if (tx.createdByRole === 'agent_rd') {
      const creatorByRole = await prisma.user.findFirst({
        where: { role: 'agent_rd' },
        select: { email: true, role: true, name: true },
      });
      if (creatorByRole && creatorByRole.email && creatorByRole.email.trim() !== '') {
        return {
          email: creatorByRole.email.trim(),
          role: creatorByRole.role,
          name: creatorByRole.name || 'Agent Guichet RD',
        };
      }
    }
  } catch (error) {
    console.error('Erreur getTransactionAgent:', error);
  }

  return null;
}

/**
 * Récupère les emails des superviseurs / administrateurs pour les alertes système d'exception (ex: SLA 24h)
 */
export async function getConcernedStakeholderEmails(tx: any): Promise<{ email: string; role: string; name: string }[]> {
  const result: { email: string; role: string; name: string }[] = [];
  const seenEmails = new Set<string>();

  try {
    // Admins et gestionnaires enregistrés en base
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

    // Emails d'administration statiques configurés
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
 * Envoie une notification lors de la création d'une transaction.
 * Envoyée STRICTEMENT ET UNIQUEMENT à l'Agent RD ayant effectué la transaction.
 * Aucun email n'est envoyé à l'admin, à l'agent Haïti ou au gestionnaire.
 */
export async function sendNewTransactionNotification(tx: any): Promise<{ sentCount: number }> {
  try {
    if (tx.createdByRole && tx.createdByRole !== 'agent_rd') {
      console.log(`ℹ️ [EMAIL FILTRÉ] Transaction #${tx.referenceNumber} créée par "${tx.createdByRole}". Aucun email envoyé.`);
      return { sentCount: 0 };
    }

    const agent = await getTransactionAgent(tx);
    if (!agent || !agent.email || agent.role !== 'agent_rd') {
      return { sentCount: 0 };
    }

    const lang = resolveLanguage(null, tx.operator, agent.role);
    const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
    const subject = t.newTxSubject(tx.referenceNumber);
    const html = buildNewTxEmailHtml(tx, agent.name, lang);
    const text = `${t.newTxGreeting(agent.name)}\n\n` +
      `Votre transaction #${tx.referenceNumber} (${(tx.operator || '').toUpperCase()}) a bien été enregistrée.\n` +
      `Montant encaissé : ${Number(tx.amountDOP || 0).toLocaleString('fr-FR')} DOP\n` +
      `Montant à décaisser : ${Number(tx.amountHTG || 0).toLocaleString('fr-FR')} HTG\n` +
      `Bénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\n` +
      `Expéditeur : ${tx.senderName}\n\n` +
      `${t.supportContact}\n\nD'Alexis Transferencia y Accesorio`;

    await sendEmail({
      to: agent.email,
      subject,
      html,
      text,
    });

    console.log(`📧 [EMAIL CONFIRMATION TRANSACTION] Reçu #${tx.referenceNumber} transmis à l'Agent RD ${agent.name} <${agent.email}> [${lang}]`);
    return { sentCount: 1 };
  } catch (err) {
    console.error('Erreur sendNewTransactionNotification:', err);
    return { sentCount: 0 };
  }
}

/**
 * Envoie une notification lors de la clôture/décaissement réussi.
 * Envoyée STRICTEMENT ET UNIQUEMENT à l'Agent RD ayant initié la transaction.
 * Aucun email n'est envoyé à l'admin, à l'agent Haïti ou au gestionnaire.
 */
export async function sendTransactionCompletedNotification(tx: any): Promise<{ sentCount: number }> {
  try {
    if (tx.createdByRole && tx.createdByRole !== 'agent_rd') {
      return { sentCount: 0 };
    }

    const agent = await getTransactionAgent(tx);
    if (!agent || !agent.email || agent.role !== 'agent_rd') {
      return { sentCount: 0 };
    }

    const lang = resolveLanguage(null, tx.operator, agent.role);
    const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
    const subject = t.completedTxSubject(tx.referenceNumber);
    const html = buildCompletedTxEmailHtml(tx, agent.name, lang);
    const text = `${t.completedTxGreeting(agent.name)}\n\n` +
      `La transaction #${tx.referenceNumber} a été validée et décaissée avec succès.\n` +
      `Montant remis : ${Number(tx.amountHTG || 0).toLocaleString('fr-FR')} HTG\n` +
      `Bénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\n` +
      (tx.proofNotes ? `Note : ${tx.proofNotes}\n\n` : '\n') +
      `${t.supportContact}\n\nD'Alexis Transferencia y Accesorio`;

    await sendEmail({
      to: agent.email,
      subject,
      html,
      text,
    });

    console.log(`📧 [EMAIL FINALISATION TRANSACTION] Avis #${tx.referenceNumber} transmis à l'Agent RD ${agent.name} <${agent.email}> [${lang}]`);
    return { sentCount: 1 };
  } catch (err) {
    console.error('Erreur sendTransactionCompletedNotification:', err);
    return { sentCount: 0 };
  }
}

/**
 * Envoie une notification lors de l'annulation d'une transaction.
 * Envoyée STRICTEMENT ET UNIQUEMENT à l'Agent RD ayant initié la transaction.
 * Aucun email n'est envoyé à l'admin, à l'agent Haïti ou au gestionnaire.
 */
export async function sendTransactionCancelledNotification(tx: any, reason: string): Promise<{ sentCount: number }> {
  try {
    if (tx.createdByRole && tx.createdByRole !== 'agent_rd') {
      return { sentCount: 0 };
    }

    const agent = await getTransactionAgent(tx);
    if (!agent || !agent.email || agent.role !== 'agent_rd') {
      return { sentCount: 0 };
    }

    const lang = resolveLanguage(null, tx.operator, agent.role);
    const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
    const subject = t.cancelledTxSubject(tx.referenceNumber);
    const html = buildCancelledTxEmailHtml(tx, reason, agent.name, lang);
    const text = `${t.cancelledTxGreeting(agent.name)}\n\n` +
      `La transaction #${tx.referenceNumber} a été annulée.\n` +
      `Motif : ${reason || 'Non spécifié'}\n` +
      `${t.cancellationRefundNote}\n\n` +
      `${t.supportContact}\n\nD'Alexis Transferencia y Accesorio`;

    await sendEmail({
      to: agent.email,
      subject,
      html,
      text,
    });

    console.log(`📧 [EMAIL ANNULATION TRANSACTION] Avis #${tx.referenceNumber} transmis à l'Agent RD ${agent.name} <${agent.email}> [${lang}]`);
    return { sentCount: 1 };
  } catch (err) {
    console.error('Erreur sendTransactionCancelledNotification:', err);
    return { sentCount: 0 };
  }
}

/**
 * Envoie l'alerte SLA 24h+ uniquement à l'Agent RD ayant initié la transaction si applicable.
 * Aucun e-mail n'est envoyé à l'admin, à l'agent Haïti ou au gestionnaire.
 */
export async function sendSlaAlertToStakeholders(tx: any, elapsedMinutes: number): Promise<{ sentCount: number; recipients: string[] }> {
  const agent = await getTransactionAgent(tx);
  if (!agent || !agent.email || agent.role !== 'agent_rd') {
    return { sentCount: 0, recipients: [] };
  }

  const lang = resolveLanguage(null, tx.operator, agent.role);
  const t = EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.FR;
  const elapsedHours = Math.floor(elapsedMinutes / 60);

  const subject = t.slaAlertSubject(tx.referenceNumber, elapsedHours);
  const html = buildSlaAlertEmailHtml(tx, elapsedMinutes, lang);
  const text = `Suivi de dossier - Transaction #${tx.referenceNumber} (${(tx.operator || '').toUpperCase()})\n` +
    `En attente depuis ${elapsedHours} heures.\n` +
    `Bénéficiaire : ${tx.receiverName} (${tx.receiverPhone})\n` +
    `Montant : ${Number(tx.amountHTG || 0).toLocaleString('fr-FR')} HTG / ${Number(tx.amountDOP || 0).toLocaleString('fr-FR')} DOP\n\n` +
    `D'Alexis Transferencia y Accesorio`;

  await sendEmail({
    to: agent.email,
    subject,
    html,
    text,
  });

  console.log(`📋 [SUIVI SLA 24h+] Transaction #${tx.referenceNumber} (${elapsedHours}h en attente) transmise à l'Agent RD ${agent.name} <${agent.email}>`);

  return { sentCount: 1, recipients: [`${agent.name} <${agent.email}> [${lang}]`] };
}
