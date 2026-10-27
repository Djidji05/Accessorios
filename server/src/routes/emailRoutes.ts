import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { 
  sendEmail, 
  resolveLanguage, 
  EMAIL_TRANSLATIONS, 
  getEmailConfigStatus, 
  updateEmailConfig, 
  verifyEmailConnection 
} from '../services/emailService';
import { checkPendingTransactionsSla, getSlaEngineStatus } from '../services/slaReminderService';

const router = Router();

// 1. Statut du service d'emails et du moteur SLA
router.get('/status', authMiddleware, (_req, res) => {
  const emailStatus = getEmailConfigStatus();
  const slaStatus = getSlaEngineStatus();

  return res.json({
    ...emailStatus,
    slaEngine: slaStatus,
    supportedLanguages: ['FR', 'HT', 'ES'],
  });
});

// 2. Mise à jour de la configuration e-mail (Admin uniquement)
router.post('/config', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { 
      provider, 
      smtpHost, 
      smtpPort, 
      smtpSecure, 
      smtpUser, 
      smtpPass, 
      smtpFrom, 
      resendApiKey, 
      resendFrom, 
      adminNotificationEmails,
      frontendUrl 
    } = req.body;

    const updates: any = {};
    if (frontendUrl !== undefined) updates.frontendUrl = frontendUrl;

    if (provider === 'gmail') {
      updates.smtpHost = 'smtp.gmail.com';
      updates.smtpPort = 587;
      updates.smtpSecure = false;
      if (smtpUser !== undefined) updates.smtpUser = smtpUser;
      if (smtpPass !== undefined) updates.smtpPass = smtpPass;
      if (smtpFrom !== undefined) updates.smtpFrom = smtpFrom || `D'Alexis Transferencia <${smtpUser}>`;
      updates.resendApiKey = '';
    } else if (provider === 'resend') {
      if (resendApiKey !== undefined) updates.resendApiKey = resendApiKey;
      if (resendFrom !== undefined) updates.resendFrom = resendFrom;
      updates.smtpUser = '';
      updates.smtpPass = '';
    } else if (provider === 'smtp') {
      if (smtpHost !== undefined) updates.smtpHost = smtpHost;
      if (smtpPort !== undefined) updates.smtpPort = Number(smtpPort);
      if (smtpSecure !== undefined) updates.smtpSecure = Boolean(smtpSecure);
      if (smtpUser !== undefined) updates.smtpUser = smtpUser;
      if (smtpPass !== undefined) updates.smtpPass = smtpPass;
      if (smtpFrom !== undefined) updates.smtpFrom = smtpFrom;
      updates.resendApiKey = '';
    } else if (provider === 'simulation') {
      // Réinitialise vers mode simulation
      updates.smtpUser = '';
      updates.smtpPass = '';
      updates.resendApiKey = '';
    }

    if (adminNotificationEmails !== undefined) {
      updates.adminNotificationEmails = Array.isArray(adminNotificationEmails)
        ? adminNotificationEmails
        : String(adminNotificationEmails).split(',').map((e: string) => e.trim()).filter(Boolean);
    }

    const result = await updateEmailConfig(updates, true);

    return res.json(result);
  } catch (error: any) {
    console.error('Erreur mise à jour config email:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour de la configuration e-mail.' });
  }
});

// 3. Vérification de la connectivité SMTP / Resend
router.post('/verify', authMiddleware, requireRole('admin'), async (_req, res) => {
  try {
    const result = await verifyEmailConnection();
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Erreur de test de connexion.' });
  }
});

// 4. Envoi d'un e-mail de test (Admin / Gestionnaire)
router.post('/test', authMiddleware, requireRole('admin', 'gestionnaire'), async (req, res) => {
  try {
    const { to, lang } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Adresse e-mail destinataire (to) obligatoire.' });
    }

    const targetLang = resolveLanguage(lang);
    const t = EMAIL_TRANSLATIONS[targetLang] || EMAIL_TRANSLATIONS.FR;

    const dummyTx = {
      referenceNumber: 'TX-TEST-2026',
      operator: 'moncash',
      amountHTG: 12500,
      amountDOP: 5000,
      receiverName: 'Jean Baptiste',
      receiverPhone: '+509 3700 0000',
      senderName: 'Marie Dominique',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Agent Haïti Principal',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    };

    const subject = `[TEST] ${t.slaAlertSubject(dummyTx.referenceNumber, 26)}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">📧 Test du Service Email Accessorio (${targetLang})</h2>
        <p style="color: #334155;">Ce message valide que votre configuration d'envoi d'e-mails est active et fonctionnelle sur la plateforme <strong>D'Alexis Transferencia y Accesorio</strong>.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6;">
          <strong>Langue sélectionnée :</strong> ${targetLang}<br>
          <strong>Destinataire :</strong> ${to}<br>
          <strong>Horodatage :</strong> ${new Date().toLocaleString('fr-FR')}<br>
          <strong>Serveur d'émission :</strong> ${getEmailConfigStatus().providerLabel}<br>
          <strong>URL de redirection :</strong> <a href="${getEmailConfigStatus().frontendUrl}" target="_blank">${getEmailConfigStatus().frontendUrl}</a>
        </div>
        <p style="color: #64748b; font-size: 11px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          D'Alexis Transferencia y Accesorio • Système Opérationnel Sécurisé
        </p>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject,
      html,
      text: `Test de notification Accessorio (${targetLang}) reçu avec succès à ${new Date().toLocaleString('fr-FR')}. URL: ${getEmailConfigStatus().frontendUrl}`,
    });

    return res.json({
      success: result.success,
      simulated: result.simulated,
      messageId: result.messageId,
      message: result.simulated
        ? `Simulation réussie pour la langue ${targetLang}. L'e-mail a été consigné dans les logs du serveur (Aucun compte email actif configuré).`
        : `E-mail de test (${targetLang}) envoyé avec succès à ${to} !`,
    });
  } catch (error: any) {
    console.error('Erreur test email:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'envoi de l\'e-mail de test.' });
  }
});

// 5. Déclenchement manuel de la vérification SLA 24 heures (Admin / Gestionnaire)
router.post('/sla-check', authMiddleware, requireRole('admin', 'gestionnaire'), async (_req, res) => {
  try {
    const result = await checkPendingTransactionsSla();
    return res.json({
      success: true,
      message: `Vérification SLA terminée. ${result.checkedCount} transaction(s) analysée(s), ${result.alertsSent.length} alerte(s) 24h+ déclenchée(s).`,
      details: result,
    });
  } catch (error: any) {
    console.error('Erreur déclenchement sla-check:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors du contrôle SLA.' });
  }
});

export default router;
