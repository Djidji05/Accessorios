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
  Receipt
} from 'lucide-react';
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

