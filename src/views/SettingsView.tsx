import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  DollarSign, 
  Globe, 
  ShieldCheck, 
  Bell, 
  Cpu,
  Lock,
  User,
  Mail,
  Phone,
  Key,
  Volume2,
  CheckCircle2,
  Shield,
  Building,
  Sparkles,
  LogOut,
  Percent,
  Coins,
  ArrowRightLeft,
  Smartphone,
  Receipt,
  Send,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { Language } from '../i18n/translations';
import { ServiceType, OperatorCode } from '../types';
import { OperatorBadge } from '../components/OperatorBadge';

export const SettingsView: React.FC = () => {
  const { 
    dopToHtgRate, 
    setDopToHtgRate, 
    usdToHtgRate, 
    currentUser, 
    logout, 
    adminCommissionRate,
    setAdminCommissionRate,
    serviceCommissionRates,
    updateServiceCommissionRate,
    currentLang,
    setLanguage,
    t
  } = useApp();
  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isAgentRD = currentUser.role === 'agent_rd';
  
  // State pour le Taux de Commission Admin par Service
  const [svcRatesState, setSvcRatesState] = useState<Record<string, number>>(serviceCommissionRates);

  useEffect(() => {
    setSvcRatesState(serviceCommissionRates);
  }, [serviceCommissionRates]);

  const handleSvcRateChange = (key: string, val: number) => {
    setSvcRatesState((prev) => ({ ...prev, [key]: val }));
  };
  
  // State pour le Taux de Commission Admin Global
  const [adminCommissionInput, setAdminCommissionInput] = useState(() => (adminCommissionRate || 1.0).toString());

  useEffect(() => {
    setAdminCommissionInput((adminCommissionRate || 1.0).toString());
  }, [adminCommissionRate]);
  

  
  // State pour Administrateur & Général
  const [rateInput, setRateInput] = useState(() => {
    return (dopToHtgRate <= 10 ? Math.round(dopToHtgRate * 100) : Math.round(dopToHtgRate)).toString();
  });

  React.useEffect(() => {
    setRateInput((dopToHtgRate <= 10 ? Math.round(dopToHtgRate * 100) : Math.round(dopToHtgRate)).toString());
  }, [dopToHtgRate]);

  const [companyHeader, setCompanyHeader] = useState("Alexis Transferencia");
  const [defaultCurrency, setDefaultCurrency] = useState<'DOP' | 'HTG' | 'USD'>('DOP');
  const [autoRouting, setAutoRouting] = useState(true);

  // Password state shared across agent forms
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // State dédié pour l'Agent Haïti avec persistance localStorage
  const [haitiName, setHaitiName] = useState(currentUser.name || 'Jean-Baptiste Duval');
  const [haitiEmail, setHaitiEmail] = useState(currentUser.email || 'j.duval@dalexis-haiti.com');
  const [haitiPhone, setHaitiPhone] = useState('+509 37 44 89 10');

  const [haitiLanguage, setHaitiLanguage] = useState<'fr' | 'ht' | 'es'>(() => {
    return (currentLang.toLowerCase() as 'fr' | 'ht' | 'es') || (localStorage.getItem('agent_haiti_lang') as 'fr' | 'ht' | 'es') || 'fr';
  });
  const [haitiSoundAlerts, setHaitiSoundAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('agent_haiti_sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [haitiVisualNotifications, setHaitiVisualNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem('agent_haiti_visual');
    return saved !== null ? saved === 'true' : true;
  });

  // State dédié pour l'Agent R.D. (Comptoir Vente R.D.) avec persistance localStorage
  const [rdName, setRdName] = useState(currentUser.name || 'Achmad Hakim');
  const [rdEmail, setRdEmail] = useState(currentUser.email || 'achmad.hakim@dalexistransfer.com');
  const [rdPhone, setRdPhone] = useState('+1 809 555 0192');
  const [rdAgency, setRdAgency] = useState('Agence Av. Independence - Santo Domingo');

  const [rdLanguage, setRdLanguage] = useState<'es' | 'fr' | 'ht'>(() => {
    return (currentLang.toLowerCase() as 'es' | 'fr' | 'ht') || (localStorage.getItem('agent_rd_lang') as 'es' | 'fr' | 'ht') || 'es';
  });

  const [rdCurrencyDisplay, setRdCurrencyDisplay] = useState<'DOP_WITH_HTG_CONVERSION' | 'DOP_ONLY'>(() => {
    return (localStorage.getItem('agent_rd_currency_display') as any) || 'DOP_WITH_HTG_CONVERSION';
  });

  const [rdPrinterDevice, setRdPrinterDevice] = useState<string>(() => {
    return localStorage.getItem('agent_rd_printer_device') || 'EPSON TM-T20III Thermal Receipt Printer (USB/LAN)';
  });

  const [rdAutoPrintOnClose, setRdAutoPrintOnClose] = useState<boolean>(() => {
    const saved = localStorage.getItem('agent_rd_auto_print');
    return saved !== null ? saved === 'true' : true;
  });

  const [rdPrintCopies, setRdPrintCopies] = useState<number>(() => {
    const saved = localStorage.getItem('agent_rd_print_copies');
    return saved ? parseInt(saved) : 2; // 1 Ticket Client + 1 Souche Agence
  });

  const [rdSoundAlert, setRdSoundAlert] = useState<boolean>(() => {
    const saved = localStorage.getItem('agent_rd_sound_alert');
    return saved !== null ? saved === 'true' : true;
  });

  const [rdVisualAlert, setRdVisualAlert] = useState<boolean>(() => {
    const saved = localStorage.getItem('agent_rd_visual_alert');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Email Configuration State (Admin)
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'resend' | 'smtp' | 'simulation'>('gmail');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpFrom, setSmtpFrom] = useState("D'Alexis Transferencia <notifications@dalexistransferencia.com>");
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFrom, setResendFrom] = useState("D'Alexis Transferencia <notifications@dalexistransferencia.com>");
  const [adminNotificationEmails, setAdminNotificationEmails] = useState('');
  
  // Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState(currentUser.email || '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fetchEmailStatus = async () => {
    try {
      const res = await api.email.getStatus();
      setEmailStatus(res);
      if (res.provider === 'resend') {
        setEmailProvider('resend');
      } else if (res.provider === 'smtp') {
        setEmailProvider(res.smtpHost?.includes('gmail') ? 'gmail' : 'smtp');
      } else {
        setEmailProvider('gmail');
      }
      if (res.smtpHost) setSmtpHost(res.smtpHost);
      if (res.smtpPort) setSmtpPort(res.smtpPort);
      if (res.smtpSecure !== undefined) setSmtpSecure(res.smtpSecure);
      if (res.smtpFrom) setSmtpFrom(res.smtpFrom);
      if (res.resendFrom) setResendFrom(res.resendFrom);
      if (res.adminNotificationEmails) setAdminNotificationEmails(res.adminNotificationEmails.join(', '));
    } catch (err) {
      console.error('Erreur chargement statut email:', err);
    }
  };

  useEffect(() => {
    if (currentUser.role === 'admin' || currentUser.role === 'gestionnaire') {
      fetchEmailStatus();
    }
  }, [currentUser.role]);

  const handleSaveEmailConfig = async () => {
    setIsSavingEmail(true);
    setEmailFeedback(null);
    try {
      const payload: any = { provider: emailProvider };
      if (emailProvider === 'gmail') {
        payload.smtpUser = smtpUser;
        payload.smtpPass = smtpPass;
        payload.smtpFrom = smtpFrom || `D'Alexis Transferencia <${smtpUser}>`;
      } else if (emailProvider === 'resend') {
        payload.resendApiKey = resendApiKey;
        payload.resendFrom = resendFrom;
      } else if (emailProvider === 'smtp') {
        payload.smtpHost = smtpHost;
        payload.smtpPort = smtpPort;
        payload.smtpSecure = smtpSecure;
        payload.smtpUser = smtpUser;
        payload.smtpPass = smtpPass;
        payload.smtpFrom = smtpFrom;
      } else if (emailProvider === 'simulation') {
        payload.provider = 'simulation';
      }
      payload.adminNotificationEmails = adminNotificationEmails;

      const res = await api.email.updateConfig(payload);
      setEmailFeedback({ type: 'success', message: res.message });
      setFeedbackMessage('Configuration e-mail enregistrée avec succès !');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      await fetchEmailStatus();
    } catch (err: any) {
      setEmailFeedback({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde de la configuration.' });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    setEmailFeedback(null);
    try {
      const res = await api.email.verify();
      if (res.success) {
        setEmailFeedback({ type: 'success', message: res.message });
      } else {
        setEmailFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setEmailFeedback({ type: 'error', message: err.message || 'Erreur lors de la vérification de la connexion.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setEmailFeedback({ type: 'error', message: 'Veuillez saisir une adresse e-mail destinataire valide.' });
      return;
    }
    setIsSendingTest(true);
    setEmailFeedback(null);
    try {
      const res = await api.email.sendTest(testEmailRecipient, currentLang);
      if (res.simulated) {
        setEmailFeedback({ 
          type: 'info', 
          message: `ℹ️ ${res.message}` 
        });
      } else {
        setEmailFeedback({ 
          type: 'success', 
          message: res.message || `E-mail de test envoyé avec succès à ${testEmailRecipient} !` 
        });
      }
    } catch (err: any) {
      setEmailFeedback({ type: 'error', message: err.message || 'Échec de l\'envoi de l\'e-mail de test.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleAdminSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(rateInput);
    if (!isNaN(newRate) && newRate > 0) {
      const finalRate = newRate > 10 ? newRate / 100 : newRate;
      setDopToHtgRate(finalRate);
    }

    // Enregistrer les taux de commission par service configurés par l'Admin
    Object.entries(svcRatesState).forEach(([serviceKey, val]) => {
      updateServiceCommissionRate(serviceKey, val);
    });

    setFeedbackMessage('Paramètres système et grille de commission Admin par service enregistrés avec succès !');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAgentHaitiSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('agent_haiti_lang', haitiLanguage);
    localStorage.setItem('agent_haiti_sound', String(haitiSoundAlerts));
    localStorage.setItem('agent_haiti_visual', String(haitiVisualNotifications));
    setLanguage(haitiLanguage.toUpperCase() as Language);
    setFeedbackMessage('Vos préférences d\'agent Haïti et informations de sécurité ont été enregistrées avec succès !');
    setSaveSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleAgentRDSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('agent_rd_lang', rdLanguage);
    localStorage.setItem('agent_rd_currency_display', rdCurrencyDisplay);
    localStorage.setItem('agent_rd_printer_device', rdPrinterDevice);
    localStorage.setItem('agent_rd_auto_print', String(rdAutoPrintOnClose));
    localStorage.setItem('agent_rd_print_copies', String(rdPrintCopies));
    localStorage.setItem('agent_rd_sound_alert', String(rdSoundAlert));
    localStorage.setItem('agent_rd_visual_alert', String(rdVisualAlert));
    setLanguage(rdLanguage.toUpperCase() as Language);

    setFeedbackMessage('Paramètres de l\'Agent R.D. (Langue ES/FR & Alertes temps réel) enregistrés avec succès !');
    setSaveSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // =========================================================================
  // VUE PARAMÈTRES : AGENT R.D. (COMPTOIR REPUBLIQUE DOMINICAINE)
  // =========================================================================
  if (isAgentRD) {
    return (
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-[1600px] mx-auto font-sans animate-in fade-in pb-36 md:pb-6">
        


        {/* Success Toast */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <form onSubmit={handleAgentRDSave} className="space-y-6">
          
          {/* SECTION 1: Profil & Informations Personnelles */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                <span>{t('1. Profil & Informations Personnelles Agent R.D.')}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Nom & Prénom de l\'Agent')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rdName}
                    onChange={(e) => setRdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder={t('Nom complet')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Adresse e-mail professionnelle')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={rdEmail}
                    onChange={(e) => setRdEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="email@dalexistransfer.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Numéro de Téléphone Guichet (R.D.)')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rdPhone}
                    onChange={(e) => setRdPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
                    placeholder="+1 809 XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Agence & Emplacement')}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rdAgency}
                    onChange={(e) => setRdAgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Point de vente Santo Domingo / Santiago"
                  />
                </div>
              </div>
            </div>
          </div>



          {/* SECTION 3: Langue & Affichage Monétaire (Crucial pour la R.D.) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-700" />
                <span>{t('3. Préférences d\'Affichage & Langue (Crucial R.D.)')}</span>
              </h3>
            </div>

            {/* Choix de la Langue */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2.5 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-900">
                {t('Langue de l\'Interface de Vente (Navigation Rapide) :')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRdLanguage('es');
                    setLanguage('ES');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    rdLanguage === 'es' || currentLang === 'ES'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🇩🇴</span>
                  <span>Español (Dominicana)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRdLanguage('fr');
                    setLanguage('FR');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    rdLanguage === 'fr' || currentLang === 'FR'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🇫🇷</span>
                  <span>Français (Officiel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRdLanguage('ht');
                    setLanguage('HT');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    rdLanguage === 'ht' || currentLang === 'HT'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🇭🇹</span>
                  <span>Kreyòl Ayisyen</span>
                </button>
              </div>
            </div>


          </div>





          {/* Boutons d'Action (Sauvegarde & Déconnexion) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={logout}
              className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('Se déconnecter')}</span>
            </button>

            <button
              type="submit"
              className="bg-slate-900 text-white font-extrabold text-xs px-7 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl active:scale-98"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{t('Enregistrer Mes Paramètres')}</span>
            </button>
          </div>

        </form>
      </div>
    );
  }

  // =========================================================================
  // VUE PARAMÈTRES : AGENT HAÏTI
  // =========================================================================
  if (isAgentHaiti) {
    return (
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-[1600px] mx-auto font-sans animate-in fade-in pb-36 md:pb-6">

        {/* Success Toast */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <form onSubmit={handleAgentHaitiSave} className="space-y-6">
          
          {/* SECTION 1: Profil & Informations Personnelles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                <span>{t('1. Profil & Informations Personnelles')}</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('Fiche Agent Terrain')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Nom complet')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={haitiName}
                    onChange={(e) => setHaitiName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder={t('Nom complet')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Adresse e-mail professionnelle')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={haitiEmail}
                    onChange={(e) => setHaitiEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="email@dalexis-transfer.com"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Utilisée pour les quittances et notifications système.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Numéro de téléphone professionnel (Haïti)')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={haitiPhone}
                    onChange={(e) => setHaitiPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
                    placeholder="+509 XX XX XX XX"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{t('Numéro associé au terminal Natcash & Natcom de l\'agent.')}</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Préférences d'Affichage & Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-700" />
                <span>{t('3. Préférences d\'Affichage & Notifications Flux')}</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('Alertes Natcash/Natcom')}</span>
            </div>

            {/* Choix de la Langue */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-900">
                {t('Choix de la Langue de l\'Interface')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setHaitiLanguage('fr');
                    setLanguage('FR');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    haitiLanguage === 'fr' || currentLang === 'FR'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>Français</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHaitiLanguage('ht');
                    setLanguage('HT');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    haitiLanguage === 'ht' || currentLang === 'HT'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>🇭🇹</span>
                  <span>Kreyòl Ayisyen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHaitiLanguage('es');
                    setLanguage('ES');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    haitiLanguage === 'es' || currentLang === 'ES'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>🇩🇴</span>
                  <span>Español</span>
                </button>
              </div>
            </div>

            {/* Alertes Sonores & Visuelles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t('Alertes Sonores en Temps Réel')}</p>
                    <p className="text-[11px] text-slate-500">{t('Émettre un signal sonore lorsqu\'une nouvelle tâche Natcash/Natcom arrive.')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={haitiSoundAlerts}
                  onChange={(e) => setHaitiSoundAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t('Notifications Visuelles du Navigateur')}</p>
                    <p className="text-[11px] text-slate-500">{t('Afficher des popups/toasts à l\'écran pour les retraits urgents.')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={haitiVisualNotifications}
                  onChange={(e) => setHaitiVisualNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'Action (Sauvegarde & Déconnexion) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={logout}
              className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('Se déconnecter')}</span>
            </button>

            <button
              type="submit"
              className="bg-slate-900 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('Enregistrer Mes Paramètres')}</span>
            </button>
          </div>

        </form>
      </div>
    );
  }

  // =========================================================================
  // VUE PARAMÈTRES : ADMINISTRATEUR & GESTIONNAIRE
  // =========================================================================
  return (
    <div className="p-3 sm:p-6 space-y-6 w-full max-w-[1600px] mx-auto font-sans animate-in fade-in pb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-900" />
            <span>{t('Paramètres Généraux & Configuration Système')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('Configurez les taux de change globaux, les paramètres de routage des nœuds et la sécurité du réseau.')}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {currentUser.role !== 'admin' && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>{t('Lecture seule : Seul l\'Administrateur peut modifier les paramètres généraux du système.')}</span>
        </div>
      )}

      <form onSubmit={handleAdminSave} className="space-y-6">
        
        {/* Taux de Change Globaux */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>{t('Configuration des Taux de Change En Temps Réel')}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{t('Paires Pesos (RD) / HTG / USD')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('Taux Officiel de Conversion (100 Pesos DOP ➔ Gourdes HTG) *')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={rateInput}
                  disabled={currentUser.role !== 'admin'}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-mono font-black text-slate-900 px-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                  placeholder="230"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">HTG</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Saisir <span className="font-mono font-bold text-slate-700">230</span> signifie que <span className="font-mono font-bold text-slate-700">100 Pesos (DOP) = 230 HTG</span>.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('Taux de Référence (1 USD ➔ HTG)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  disabled
                  value={usdToHtgRate}
                  className="w-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 px-3 py-2.5 rounded-xl cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">HTG</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{t('Taux indicatif des marchés internationaux.')}</p>
            </div>
          </div>
        </div>

        {/* Taux de Commission Admin par Service Offert */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('Taux de Commission Admin par Service Offert')}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{t('Prélèvement Réseau par Service')}</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('Définissez le pourcentage de commission calculé pour l\'Administrateur sur chaque type de service réseau.')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {[
              { key: 'moncash', desc: 'Transferts & paiements mobiles MonCash Haïti' },
              { key: 'natcash', desc: 'Portefeuille électronique & décaissement Natcash Haïti' },
              { key: 'zelle', desc: 'Virements & transferts directs Zelle USA' },
              { key: 'digicel', desc: 'Recharge minutes & forfaits internet Digicel Haïti' },
              { key: 'natcom', desc: 'Recharge minutes & forfaits data Natcom Haïti' },
              { key: 'claro', desc: 'Recharge téléphonique Claro République Dominicaine' },
              { key: 'altice', desc: 'Recharge téléphonique Altice République Dominicaine' },
            ].map((svc) => {
              const currentRate = svcRatesState[svc.key] ?? 1.0;
              const exampleEarned = Math.round(1000 * (currentRate / 100));

              return (
                <div 
                  key={svc.key}
                  className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <OperatorBadge operator={svc.key as OperatorCode} size="md" showText={true} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Commission Admin (%) pour ce Service')}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        disabled={currentUser.role !== 'admin'}
                        value={currentRate}
                        onChange={(e) => handleSvcRateChange(svc.key, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{svc.desc}</p>
                  </div>

                  <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[10px] flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-medium">
                    <span>{t('Ex. 1,000 DOP transférés :')}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      Comm. Admin = <strong className="font-black">{exampleEarned} DOP</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paramètres Réseau & Nœuds */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>{t('Paramètres du Nœud Réseau & Routage Intelligente')}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Node ID: {currentUser.nodeId}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-900">{t('Routage Automatique des Tâches')}</p>
                <p className="text-[11px] text-slate-500">{t('Route automatiquement les requêtes Natcash vers Haïti et MonCash vers les Télécoms.')}</p>
              </div>
              <input
                type="checkbox"
                checked={autoRouting}
                disabled={currentUser.role !== 'admin'}
                onChange={(e) => setAutoRouting(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-900">{t('Devise Principale du Système')}</p>
                <p className="text-[11px] text-slate-500">{t('Devise d\'affichage par défaut dans les rapports de trésorerie.')}</p>
              </div>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value as any)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="DOP">Pesos (RD)</option>
                <option value="HTG">HTG (Haïti)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration du Service E-mails & Notifications (Admin) */}
        {currentUser.role === 'admin' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    {t('Service E-mails & Notifications Automatiques')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t('Alertes SLA 30m, notifications de transferts, clôtures de tâches et escalades.')}
                  </p>
                </div>
              </div>

              {/* Statut Live Badge */}
              <div>
                {emailStatus?.isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Actif : {emailStatus?.providerLabel}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mode Simulation (Aucun compte actif)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Message Explicatif si non configuré */}
            {!emailStatus?.isConfigured && (
              <div className="p-4 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Pourquoi les e-mails ne sont pas envoyés ?</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Le système est actuellement en <strong>Mode Simulation</strong> car aucun compte d'envoi n'a été renseigné (identifiant & mot de passe SMTP ou clé API Resend vides). Les e-mails sont uniquement affichés dans la console du serveur au lieu d'être acheminés vers les boîtes de réception réelles.
                </p>
                <p className="text-[11px] font-semibold">
                  👉 Pour activer l'envoi immédiat, sélectionnez <strong>Gmail (Recommandé)</strong> ci-dessous, renseignez votre adresse Gmail et votre <strong>Mot de passe d'application Google (16 lettres)</strong>.
                </p>
              </div>
            )}

            {/* Feedback Message */}
            {emailFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                emailFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : emailFeedback.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300'
              }`}>
                {emailFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : emailFeedback.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Bell className="w-4 h-4 text-blue-600 shrink-0" />
                )}
                <span>{emailFeedback.message}</span>
              </div>
            )}

            {/* Choix du Fournisseur */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('Fournisseur d\'Envoi d\'E-mails')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'gmail', label: 'Gmail (Google)', desc: 'Mot de passe d\'application' },
                  { id: 'resend', label: 'Resend API', desc: 'HTTPS API (Port 443)' },
                  { id: 'smtp', label: 'Autre SMTP', desc: 'Hostinger, OVH, etc.' },
                  { id: 'simulation', label: 'Simulation', desc: 'Logs console uniquement' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEmailProvider(p.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      emailProvider === p.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{p.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulaire spécifique selon le fournisseur */}
            {emailProvider === 'gmail' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Adresse Gmail de l\'Expéditeur *')}
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="alexis.transfert@gmail.com"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('Mot de Passe d\'Application Google (16 lettres) *')}
                      </label>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Créer un mot de passe</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ne pas utiliser votre mot de passe habituel, mais le code généré dans Google Sécurité ➔ Mots de passe d'application.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Nom Affiché de l\'Émetteur')}
                  </label>
                  <input
                    type="text"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    placeholder="D'Alexis Transferencia <notifications@dalexistransferencia.com>"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>
            )}

            {emailProvider === 'resend' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Clé API Resend (re_...) *')}
                    </label>
                    <input
                      type="password"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_123456789abcdef..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Adresse Expéditeur Certifiée (Domaine Resend)')}
                    </label>
                    <input
                      type="text"
                      value={resendFrom}
                      onChange={(e) => setResendFrom(e.target.value)}
                      placeholder="D'Alexis Transferencia <onboarding@resend.dev>"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {emailProvider === 'smtp' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Hôte SMTP (ex: mail.monserveur.com) *')}
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="mail.dalexistransfer.com"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Port SMTP')}
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="587 ou 465"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={smtpSecure}
                        onChange={(e) => setSmtpSecure(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>SSL/TLS Sécurisé (Port 465)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Identifiant / Nom d\'Utilisateur SMTP *')}
                    </label>
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="notifications@dalexistransfer.com"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Mot de Passe SMTP *')}
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Destinataires d'Administration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('E-mails des Superviseurs pour les Alertes SLA & Escalades (séparés par des virgules)')}
              </label>
              <input
                type="text"
                value={adminNotificationEmails}
                onChange={(e) => setAdminNotificationEmails(e.target.value)}
                placeholder="ndjivensly@gmail.com, alexis@dalexistransfer.com"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2.5 rounded-xl font-medium"
              />
            </div>

            {/* Barre de Boutons d'Action Email */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEmailConfig}
                  disabled={isSavingEmail}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEmail ? 'Enregistrement...' : 'Enregistrer la Configuration'}</span>
                </button>

                {emailProvider !== 'simulation' && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isVerifying}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'Vérification...' : 'Tester la Connexion'}</span>
                  </button>
                )}
              </div>

              {/* Envoi d'un Email de Test */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="destinataire@test.com"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2 rounded-xl w-48 font-medium"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
                  <span>{isSendingTest ? 'Envoi...' : 'Envoyer un Test'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'Action (Sauvegarde & Déconnexion) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
          <button
            type="button"
            onClick={logout}
            className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('Se déconnecter')}</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              type="submit"
              className="bg-slate-900 text-white font-bold text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('Enregistrer les Modifications')}</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

