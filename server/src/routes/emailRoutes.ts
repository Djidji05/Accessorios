import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { sendEmail, resolveLanguage, EMAIL_TRANSLATIONS, SupportedLanguage } from '../services/emailService';
import { checkPendingTransactionsSla, getSlaEngineStatus } from '../services/slaReminderService';

const router = Router();

// 1. Statut du service d'emails et du moteur SLA
router.get('/status', authMiddleware, (_req, res) => {
  const isSmtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const slaStatus = getSlaEngineStatus();

  return res.json({
    smtpConfigured: isSmtpConfigured,
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpFrom: process.env.SMTP_FROM || "D'Alexis Transferencia <notifications@dalexistransferencia.com>",
    adminNotificationEmails: process.env.ADMIN_NOTIFICATION_EMAILS || '',
    slaEngine: slaStatus,
    supportedLanguages: ['FR', 'HT', 'ES'],
  });
});

// 2. Envoi d'un e-mail de test (Admin / Gestionnaire)
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
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    };

    const subject = `[TEST] ${t.slaAlertSubject(dummyTx.referenceNumber, 35)}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0f172a;">📧 Test du Service Email Accessorio (${targetLang})</h2>
        <p style="color: #334155;">Ce message valide que votre configuration d'envoi d'e-mails est active et fonctionnelle.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <strong>Langue sélectionnée :</strong> ${targetLang}<br>
          <strong>Destinataire :</strong> ${to}<br>
          <strong>Horodatage :</strong> ${new Date().toLocaleString('fr-FR')}
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">D'Alexis Transferencia y Accesorio • Système Opérationnel</p>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject,
      html,
      text: `Test de notification Accessorio en langue ${targetLang}.`,
    });

    return res.json({
      success: result.success,
      simulated: result.simulated,
      messageId: result.messageId,
      message: result.simulated
        ? `Simulation réussie pour la langue ${targetLang}. L'e-mail a été consigné dans les logs du serveur (SMTP non configuré dans .env).`
        : `E-mail de test (${targetLang}) envoyé avec succès à ${to} !`,
    });
  } catch (error: any) {
    console.error('Erreur test email:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'envoi de l\'e-mail de test.' });
  }
});

// 3. Déclenchement manuel de la vérification SLA 30 minutes (Admin / Gestionnaire)
router.post('/sla-check', authMiddleware, requireRole('admin', 'gestionnaire'), async (_req, res) => {
  try {
    const result = await checkPendingTransactionsSla();
    return res.json({
      success: true,
      message: `Vérification SLA terminée. ${result.checkedCount} transaction(s) analysée(s), ${result.alertsSent.length} alerte(s) 30m+ déclenchée(s).`,
      details: result,
    });
  } catch (error: any) {
    console.error('Erreur déclenchement sla-check:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors du contrôle SLA.' });
  }
});

export default router;
