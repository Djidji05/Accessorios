import React, { useState } from 'react';
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
  Printer,
  Building,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { dopToHtgRate, setDopToHtgRate, usdToHtgRate, currentUser, logout } = useApp();
  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isAgentRD = currentUser.role === 'agent_rd';
  
  // State pour Administrateur & Général
  const [rateInput, setRateInput] = useState(() => {
    return (dopToHtgRate <= 10 ? Math.round(dopToHtgRate * 100) : Math.round(dopToHtgRate)).toString();
  });

  React.useEffect(() => {
    setRateInput((dopToHtgRate <= 10 ? Math.round(dopToHtgRate * 100) : Math.round(dopToHtgRate)).toString());
  }, [dopToHtgRate]);

  const [companyHeader, setCompanyHeader] = useState("D'Alexis Transferencia y accesorio");
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
    return (localStorage.getItem('agent_haiti_lang') as 'fr' | 'ht' | 'es') || 'fr';
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
    return (localStorage.getItem('agent_rd_lang') as 'es' | 'fr' | 'ht') || 'es';
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
    setFeedbackMessage('Paramètres système enregistrés et synchronisés sur tout le réseau !');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAgentHaitiSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('agent_haiti_lang', haitiLanguage);
    localStorage.setItem('agent_haiti_sound', String(haitiSoundAlerts));
    localStorage.setItem('agent_haiti_visual', String(haitiVisualNotifications));
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

    setFeedbackMessage('Paramètres de l\'Agent R.D. (Imprimante thermique, Langue ES/FR & Alertes temps réel) enregistrés avec succès !');
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
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto font-sans animate-in fade-in pb-36 md:pb-6">
        


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
                <span>1. Profil & Informations Personnelles Agent R.D.</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom & Prénom de l'Agent
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rdName}
                    onChange={(e) => setRdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Nom complet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail professionnelle
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
                  Numéro de Téléphone Guichet (R.D.)
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
                  Agence & Emplacement
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
                <span>3. Préférences d'Affichage & Langue (Crucial R.D.)</span>
              </h3>
            </div>

            {/* Choix de la Langue */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2.5 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-900">
                Langue de l'Interface de Vente (Navigation Rapide) :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRdLanguage('es')}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    rdLanguage === 'es' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🇩🇴</span>
                  <span>Español (Dominicana)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRdLanguage('fr')}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    rdLanguage === 'fr' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">🇫🇷</span>
                  <span>Français (Officiel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRdLanguage('ht')}
                  className={`p-3.5 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    rdLanguage === 'ht' 
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
              <span>Se Déconnecter</span>
            </button>

            <button
              type="submit"
              className="bg-slate-900 text-white font-extrabold text-xs px-7 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl active:scale-98"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Enregistrer Mes Paramètres</span>
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
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto font-sans animate-in fade-in pb-36 md:pb-6">

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
                <span>1. Profil & Informations Personnelles</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fiche Agent Terrain</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom & Prénom
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={haitiName}
                    onChange={(e) => setHaitiName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Nom complet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail professionnelle
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
                  Numéro de téléphone professionnel (Haïti)
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
                <p className="text-[10px] text-slate-400 mt-1">Numéro associé au terminal Natcash & Natcom de l'agent.</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Préférences d'Affichage & Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-700" />
                <span>3. Préférences d'Affichage & Notifications Flux</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Alertes Natcash/Natcom</span>
            </div>

            {/* Choix de la Langue */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-900">
                Choix de la Langue de l'Interface
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setHaitiLanguage('fr')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    haitiLanguage === 'fr' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>Français</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHaitiLanguage('ht')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    haitiLanguage === 'ht' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>🇭🇹</span>
                  <span>Kreyòl Ayisyen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHaitiLanguage('es')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    haitiLanguage === 'es' 
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
                    <p className="text-xs font-bold text-slate-900">Alertes Sonores en Temps Réel</p>
                    <p className="text-[11px] text-slate-500">Émettre un signal sonore lorsqu'une nouvelle tâche Natcash/Natcom arrive.</p>
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
                    <p className="text-xs font-bold text-slate-900">Notifications Visuelles du Navigateur</p>
                    <p className="text-[11px] text-slate-500">Afficher des popups/toasts à l'écran pour les retraits urgents.</p>
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
              <span>Se Déconnecter</span>
            </button>

            <button
              type="submit"
              className="bg-slate-900 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer Mes Paramètres</span>
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
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl font-sans animate-in fade-in pb-36 md:pb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-900" />
            <span>Paramètres Généraux & Configuration Système</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configurez les taux de change globaux, les paramètres de routage des nœuds et la sécurité du réseau.
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
          <span>Lecture seule : Seul l'Administrateur peut modifier les paramètres généraux du système.</span>
        </div>
      )}

      <form onSubmit={handleAdminSave} className="space-y-6">
        
        {/* Taux de Change Globaux */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Configuration des Taux de Change En Temps Réel</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Paires Pesos (RD) / HTG / USD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Taux Officiel de Conversion (100 Pesos DOP ➔ Gourdes HTG) *
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
                Taux de Référence (1 USD ➔ HTG)
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
              <p className="text-[10px] text-slate-400 mt-1">Taux indicatif des marchés internationaux.</p>
            </div>
          </div>
        </div>

        {/* Paramètres Réseau & Nœuds */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Paramètres du Nœud Réseau & Routage Intelligente</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Node ID: {currentUser.nodeId}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-900">Routage Automatique des Tâches</p>
                <p className="text-[11px] text-slate-500">Route automatiquement les requêtes Natcash vers Haïti et MonCash vers les Télécoms.</p>
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
                <p className="text-xs font-bold text-slate-900">Devise Principale du Système</p>
                <p className="text-[11px] text-slate-500">Devise d'affichage par défaut dans les rapports de trésorerie.</p>
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
            <span>Se Déconnecter</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              type="submit"
              className="bg-slate-900 text-white font-bold text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

