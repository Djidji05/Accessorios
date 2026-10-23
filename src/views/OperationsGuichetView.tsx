import React, { useState, useEffect } from 'react';
import { 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Calculator, 
  UserCheck, 
  ArrowRight, 
  Lock, 
  FileText, 
  Sparkles, 
  User, 
  Phone, 
  CheckCircle2, 
  Zap, 
  Building2, 
  History, 
  Edit3,
  RefreshCcw,
  Clock,
  ExternalLink,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode, ServiceType, Transaction } from '../types';
import { OperatorBadge } from '../components/OperatorBadge';
import { MobileAgentHome } from '../components/MobileAgentHome';
import { getOperatorLogo } from '../utils/operatorLogos';
import { Pagination } from '../components/Pagination';

const OPERATOR_VISUAL_CARDS: Record<
  OperatorCode,
  {
    name: string;
    logoLabel: string;
    badgeBg: string;
    tagBg: string;
    activeBorder: string;
    country: string;
    category: string;
    symbol: string;
    accentHex: string;
  }
> = {
  moncash: {
    name: 'MonCash',
    logoLabel: 'Digicel Mobile Money',
    badgeBg: 'bg-rose-600 text-white',
    tagBg: 'bg-rose-50 text-rose-700 border-rose-200',
    activeBorder: 'border-rose-600 ring-4 ring-rose-500/20 bg-rose-50/40',
    country: 'Haïti 🇭🇹',
    category: 'Portefeuille Mobile',
    symbol: 'MC',
    accentHex: '#E11D48',
  },
  natcash: {
    name: 'Natcash',
    logoLabel: 'Natcom Wallet Cash',
    badgeBg: 'bg-blue-600 text-white',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBorder: 'border-blue-600 ring-4 ring-blue-500/20 bg-blue-50/40',
    country: 'Haïti 🇭🇹',
    category: 'Portefeuille Mobile',
    symbol: 'NC',
    accentHex: '#2563EB',
  },
  digicel: {
    name: 'Digicel',
    logoLabel: 'Digicel TopUp Haïti',
    badgeBg: 'bg-red-600 text-white',
    tagBg: 'bg-red-50 text-red-700 border-red-200',
    activeBorder: 'border-red-600 ring-4 ring-red-500/20 bg-red-50/40',
    country: 'Haïti 🇭🇹',
    category: 'Recharge Numérique',
    symbol: 'DIGI',
    accentHex: '#DC2626',
  },
  natcom: {
    name: 'Natcom',
    logoLabel: 'Natcom Télécom Haïti',
    badgeBg: 'bg-sky-600 text-white',
    tagBg: 'bg-sky-50 text-sky-700 border-sky-200',
    activeBorder: 'border-sky-600 ring-4 ring-sky-500/20 bg-sky-50/40',
    country: 'Haïti 🇭🇹',
    category: 'Recharge & Forfaits',
    symbol: 'NAT',
    accentHex: '#0284C7',
  },
  claro: {
    name: 'Claro',
    logoLabel: 'Claro Dominicana',
    badgeBg: 'bg-red-500 text-white',
    tagBg: 'bg-red-50 text-red-700 border-red-200',
    activeBorder: 'border-red-500 ring-4 ring-red-500/20 bg-red-50/40',
    country: 'R.D. 🇩🇴',
    category: 'Télécom Locale RD',
    symbol: 'CLA',
    accentHex: '#EF4444',
  },
  altice: {
    name: 'Altice',
    logoLabel: 'Altice Dominicana',
    badgeBg: 'bg-orange-500 text-white',
    tagBg: 'bg-orange-50 text-orange-700 border-orange-200',
    activeBorder: 'border-orange-500 ring-4 ring-orange-500/20 bg-orange-50/40',
    country: 'R.D. 🇩🇴',
    category: 'Télécom Locale RD',
    symbol: 'ALT',
    accentHex: '#F97316',
  },
  zelle: {
    name: 'Zelle Pay',
    logoLabel: 'Zelle Direct Transfer',
    badgeBg: 'bg-purple-600 text-white',
    tagBg: 'bg-purple-50 text-purple-700 border-purple-200',
    activeBorder: 'border-purple-600 ring-4 ring-purple-500/20 bg-purple-50/40',
    country: 'USA 🇺🇸',
    category: 'Virement USD',
    symbol: 'ZEL',
    accentHex: '#9333EA',
  },
};

const QUICK_AMOUNTS_DOP = [1000, 2500, 5000, 10000, 15000, 20000];

export const OperationsGuichetView: React.FC = () => {
  const { 
    currentUser, 
    dopToHtgRate, 
    setDopToHtgRate,
    createTransaction, 
    killSwitchList,
    setSelectedReceiptTx,
    transactions,
    setActiveTab,
    t
  } = useApp();

  const [operator, setOperator] = useState<OperatorCode | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [amountDOP, setAmountDOP] = useState<string>('');
  
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState<string>(dopToHtgRate.toString());

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastCreatedTx, setLastCreatedTx] = useState<Transaction | null>(null);

  // Auto-dismiss in-page notifications after 4.5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Check Kill Switch status for chosen operator
  const ksStatus = operator ? killSwitchList.find(k => k.operator === operator) : null;
  const isOperatorLocked = Boolean(ksStatus && !ksStatus.enabled);

  const numAmountDOP = parseFloat(amountDOP) || 0;
  const computedHTG = Math.round(numAmountDOP * dopToHtgRate);
  const feeDOP = Math.round(numAmountDOP * 0.03); // 3% fee
  const commissionDOP = Math.round(numAmountDOP * 0.01); // 1% commission

  // Filtrage des transactions récentes de l'opérateur au guichet
  const isAgentRD = currentUser.role === 'agent_rd';
  const isGestionnaire = currentUser.role === 'gestionnaire';
  const currentName = currentUser.name?.trim().toLowerCase() || '';
  const currentUsername = currentUser.username?.trim().toLowerCase() || '';

  const recentCashierTx = transactions
    .filter((t) => {
      if (currentUser.role === 'admin') return true;
      const createdByName = t.createdByName?.trim().toLowerCase() || '';

      if (isGestionnaire) {
        return (
          (createdByName !== '' && (createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername))) ||
          (t.createdByRole === 'gestionnaire' && (!createdByName || createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername) || currentName.includes('gestionnaire') || createdByName.includes('gestionnaire')))
        );
      }

      if (isAgentRD) {
        return (
          (createdByName !== '' && (createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername))) ||
          (t.createdByRole === 'agent_rd' && (!createdByName || createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername)))
        );
      }

      return createdByName === currentName;
    });

  const [guichetPage, setGuichetPage] = useState<number>(1);
  const GUICHET_PAGE_SIZE = 10;
  const guichetTotalPages = Math.ceil(recentCashierTx.length / GUICHET_PAGE_SIZE) || 1;
  const paginatedCashierTx = recentCashierTx.slice((guichetPage - 1) * GUICHET_PAGE_SIZE, guichetPage * GUICHET_PAGE_SIZE);

  const handleUpdateRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newR = parseFloat(tempRate);
    if (newR > 0) {
      setDopToHtgRate(newR);
      setIsEditingRate(false);
      setFeedback({ type: 'success', message: `Taux de change mis à jour avec succès : 100 Pesos = ${Math.round(newR * 100)} HTG` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!operator) {
      setFeedback({ type: 'error', message: 'Veuillez sélectionner un opérateur (MonCash, Natcash, Digicel, Natcom, Claro, Altice, Zelle Pay) avant de continuer.' });
      return;
    }

    const isTelecom = ['natcom', 'claro', 'digicel', 'altice'].includes(operator);

    if (!receiverPhone.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez saisir le numéro de téléphone récepteur.' });
      return;
    }

    if (!isTelecom && !receiverName.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez saisir le nom du bénéficiaire.' });
      return;
    }

    if (numAmountDOP <= 0) {
      setFeedback({ type: 'error', message: 'Le montant saisi doit être supérieur à 0 Peso.' });
      return;
    }

    const finalSenderName = senderName.trim() || 'Client Comptoir';
    const finalSenderPhone = senderPhone.trim() || '+1 809 000 0000';
    const finalReceiverName = isTelecom 
      ? (receiverName.trim() || `Recharge ${operator.toUpperCase()}`)
      : receiverName.trim();

    const finalServiceType: ServiceType = serviceType || (isTelecom ? 'topup_mobile' : 'cash_out');

    const result = createTransaction({
      senderName: finalSenderName,
      senderPhone: finalSenderPhone,
      receiverName: finalReceiverName,
      receiverPhone: receiverPhone.trim(),
      operator,
      serviceType: finalServiceType,
      amountDOP: numAmountDOP,
      feeDOP,
      commissionDOP,
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      if (result.transaction) {
        setLastCreatedTx(result.transaction);
      }
      // Reset form fields for next customer entry (no preselection)
      setOperator(null);
      setServiceType(null);
      setSenderName('');
      setSenderPhone('');
      setReceiverName('');
      setReceiverPhone('');
      setAmountDOP('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      {/* 📱 MODE MOBILE (block md:hidden) - Interface Mobile Agent pour tous (y compris Admin) */}
      <div className="block md:hidden">
        <MobileAgentHome />
      </div>

      {/* 💻 MODE DESKTOP PC (hidden md:block) */}
      <div className="hidden md:block p-3 sm:p-6 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in">
      
      {/* 1. PAGE HEADER & RATE CONTROLLER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t('counter_rd_title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Interface taillée pour la saisie rapide au comptoir, l'encaissement en Pesos (DOP) et le décaissement en Gourdes (HTG).
          </p>
        </div>

        {/* Live Exchange Rate Display / Controller */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{t('rate_label')}</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              100 DOP = {Math.round(dopToHtgRate * 100)} HTG
            </span>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsEditingRate(!isEditingRate)}
              className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-1 shadow-xs"
              title="Modifier le Taux de Change Officiel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ajuster</span>
            </button>
          )}
        </div>
      </div>

      {/* RATE EDIT MODAL (ADMIN ONLY) */}
      {isEditingRate && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs font-extrabold text-blue-900">Ajustement du Taux de Change Appliqué</p>
              <p className="text-[11px] text-blue-700">Modifie le taux de conversion immédiatement pour toutes les nouvelles opérations.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateRateSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              step="0.05"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              className="w-28 bg-white border border-blue-300 text-slate-900 font-mono font-black text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-xs"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={() => setIsEditingRate(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300"
            >
              Annuler
            </button>
          </form>
        </div>
      )}

      {/* POST-CREATION INSTANT CONFIRMATION & RECEIPT CARD */}
      {lastCreatedTx && (
        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md space-y-4 animate-in fade-in slide-in-from-top-3 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-sm">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">
                    {lastCreatedTx.referenceNumber}
                  </span>
                  <span className="text-xs font-extrabold uppercase text-blue-400">
                    Transmis avec succès au flux opérationnel
                  </span>
                </div>
                <h3 className="text-lg font-black mt-0.5 text-white">
                  {lastCreatedTx.amountDOP.toLocaleString()} DOP versé ➔ {lastCreatedTx.amountHTG.toLocaleString()} HTG à décaisser
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Bénéficiaire : <strong className="text-slate-200">{lastCreatedTx.receiverName}</strong> ({lastCreatedTx.receiverPhone}) • Opérateur : <strong className="text-slate-200">{lastCreatedTx.operator.toUpperCase()}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setSelectedReceiptTx(lastCreatedTx)}
                className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-100" />
                <span>Reçu Guichet (PDF / Partager)</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <span>Suivre dans Mes Transactions</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLastCreatedTx(null)}
                className="p-2 text-slate-500 hover:text-white text-xs font-bold"
                title="Masquer cette bannière"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK BANNER (FOR ERRORS) */}
      {feedback && feedback.type === 'error' && (
        <div className="p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between shadow-2xs bg-rose-600 text-white border-rose-600">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-200" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline text-white font-bold">Fermer</button>
        </div>
      )}

      {/* 2. MAIN GUICHET FORM LAYOUT */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Inputs (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operator Selection Card with Official Logos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Sélection du Service & Opérateur (Logos Officiels)
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                Cliquez directement sur l'opérateur pour éviter toute erreur
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {(Object.keys(OPERATOR_VISUAL_CARDS) as OperatorCode[]).map((opKey) => {
                const conf = OPERATOR_VISUAL_CARDS[opKey];
                const ks = killSwitchList.find(k => k.operator === opKey);
                const isForbiddenForGestionnaire = currentUser.role === 'gestionnaire' && (opKey === 'natcash' || opKey === 'natcom');
                const isForbiddenZelleNonAdmin = opKey === 'zelle' && currentUser.role !== 'admin';
                const isLocked = (ks && !ks.enabled) || isForbiddenForGestionnaire || isForbiddenZelleNonAdmin;
                const isSelected = operator === opKey;

                return (
                  <button
                    key={opKey}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) setOperator(opKey);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between h-28 ${
                      isLocked 
                        ? 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed' 
                        : isSelected 
                          ? `${conf.activeBorder} scale-102 cursor-pointer` 
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs cursor-pointer'
                    }`}
                    title={isForbiddenZelleNonAdmin ? "Service Zelle Pay (USD) réservé exclusivement à l'Administrateur" : isForbiddenForGestionnaire ? "Service restreint : Un gestionnaire/superviseur ne peut pas effectuer d'opérations Natcash ou Natcom" : undefined}
                  >
                    <div className="flex items-start justify-between">
                      {/* Logo Emblem Image */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center p-1 shrink-0">
                        <img 
                          src={getOperatorLogo(opKey)} 
                          alt={conf.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Country Flag & Locked indicator */}
                      <div className="flex items-center gap-1.5">
                        {isForbiddenZelleNonAdmin ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[9px]" title="Réservé Administrateur">
                            Admin Only
                          </span>
                        ) : isForbiddenForGestionnaire ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[9px]" title="Non autorisé Superviseur">
                            Restreint
                          </span>
                        ) : isLocked ? (
                          <span className="p-1 rounded-md bg-rose-100 text-rose-600" title="Verrouillé d'urgence">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : null}
                        {isSelected && !isLocked && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-black text-slate-900 block leading-tight">
                        {conf.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 block truncate">
                        {isForbiddenZelleNonAdmin ? "Réservé Administrateur" : isForbiddenForGestionnaire ? "Non disponible Superviseur" : conf.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isOperatorLocked && operator && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>ATTENTION : Le service <strong>{operator.toUpperCase()}</strong> est actuellement VERROUILLÉ d'urgence par la direction. Saisie impossible.</span>
              </div>
            )}
          </div>

          {/* Client Details Card */}
          {(() => {
            const isTelecom = operator ? ['natcom', 'claro', 'digicel', 'altice'].includes(operator) : false;
            const opLabel = operator ? operator.toUpperCase() : '';
            return (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                    2. Informations Récepteur {opLabel ? `(${opLabel})` : ''}
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {isTelecom ? 'Entrez uniquement le numéro de téléphone à recharger' : 'Saisissez les informations du compte récepteur (MonCash / Natcash)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                    {isTelecom ? `Recharge Directe (${opLabel})` : 'Bénéficiaire Récepteur (Haïti 🇭🇹)'}
                  </span>

                  <div className={`grid grid-cols-1 ${isTelecom ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
                    {!isTelecom && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span>Nom complet du bénéficiaire en Haïti</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Jean-Baptiste Pierre"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          className="w-full bg-white border border-blue-200 text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isTelecom ? `Numéro de Téléphone à Recharger (${opLabel})` : 'Numéro Portefeuille / Compte (Haïti)'}</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        placeholder={isTelecom ? "ex: 37000000 ou 8090000000" : "+509 37000000"}
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                        className="w-full bg-white border border-blue-200 text-xs font-mono font-bold text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Real-time Rate Calculator & Summary (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>3. Saisie Financière & Conversion</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Temps Réel
              </span>
            </div>

            {/* Amount in DOP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Montant en Pesos dominicains (DOP) versé :
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={amountDOP}
                  onChange={(e) => setAmountDOP(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 font-mono text-2xl font-black text-slate-900 pl-4 pr-16 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono">
                  DOP
                </span>
              </div>
            </div>

            {/* Quick Amount Preset Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Montants rapides au comptoir :
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {QUICK_AMOUNTS_DOP.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountDOP(preset.toString())}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                      numAmountDOP === preset
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-slate-50/90 rounded-2xl space-y-3 text-xs border border-slate-200/70 font-sans">
              <div className="flex justify-between items-center text-slate-600">
                <span className="whitespace-nowrap font-medium">Taux appliqué :</span>
                <span className="font-mono font-bold text-slate-900 whitespace-nowrap">100 DOP = {Math.round(dopToHtgRate * 100)} HTG</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200/70 text-slate-900">
                <span className="font-black text-xs uppercase tracking-tight whitespace-nowrap">Montant net en Haïti :</span>
                <span className="font-mono font-black text-blue-600 text-lg whitespace-nowrap">
                  {computedHTG.toLocaleString()} HTG
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1">
                <span className="whitespace-nowrap">Frais de service agence (3%) :</span>
                <span className="font-mono font-bold whitespace-nowrap">{feeDOP.toLocaleString()} DOP</span>
              </div>

              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                <span className="whitespace-nowrap">Commission agence (1%) :</span>
                <span className="font-mono font-bold text-slate-700 whitespace-nowrap">{commissionDOP.toLocaleString()} DOP</span>
              </div>
            </div>

            {/* Routing Destination Indicator */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-1 text-blue-950">
              <p className="font-extrabold flex items-center gap-1.5 text-blue-900">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Destination du flux :</span>
              </p>
              <p className="text-[11px] text-blue-800 font-medium">
                {operator === 'moncash' || operator === 'natcash' 
                  ? 'Transmis instantanément à l\'Agent Haïti pour décaissement sur portefeuille mobile.' 
                  : 'Transmis au Gestionnaire de flotte pour exécution et recharge numérique immédiate.'}
              </p>
            </div>

            {/* Submission Button: Valider et Envoyer au Flux */}
            <button
              type="submit"
              disabled={isOperatorLocked}
              className={`w-full py-4 rounded-2xl font-black text-xs text-white transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isOperatorLocked 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.99]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Valider et Envoyer au Flux</span>
            </button>
          </div>
        </div>

      </form>

      {/* 3. RECENT CASHIER TRANSACTIONS LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Mes Dernières Opérations au Comptoir</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Suivi instantané des transactions récemment saisies depuis ce poste
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Voir le tableau de suivi complet ("Mes Transactions du Jour")</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Réf. & Heure</th>
                <th className="pb-3 px-3">Opérateur</th>
                <th className="pb-3 px-3">Expéditeur ➔ Bénéficiaire</th>
                <th className="pb-3 px-3 text-right">Montant DOP</th>
                <th className="pb-3 px-3 text-right">Montant Net HTG</th>
                <th className="pb-3 px-3 text-center">Statut Flux</th>
                <th className="pb-3 px-3 text-center">Action Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCashierTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium text-xs">
                    Aucune transaction récente enregistrée à ce guichet pour votre compte.
                  </td>
                </tr>
              ) : (
                paginatedCashierTx.map((tx) => {
                  const isCompleted = tx.status === 'completed';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono">
                      <span className="font-black text-slate-900">{tx.referenceNumber}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <OperatorBadge operator={tx.operator} size="sm" />
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate max-w-[120px]">{tx.senderName}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">{tx.receiverName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {tx.receiverPhone}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                      {tx.amountDOP.toLocaleString()} DOP
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-blue-600 text-sm">
                      {tx.amountHTG.toLocaleString()} HTG
                    </td>

                    <td className="py-3 px-3 text-center">
                      {tx.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Annulé
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Clôturé / Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-900 border border-orange-300">
                          <Clock className="w-3 h-3 text-orange-600 animate-pulse" />
                          En attente en Haïti
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedReceiptTx(tx)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer ${
                          tx.status === 'cancelled'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                            : isCompleted
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={tx.status === 'cancelled' ? "Consulter le reçu d'annulation" : isCompleted ? "Télécharger ou partager le reçu PDF" : "Bordereau provisoire"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{tx.status === 'cancelled' ? "Reçu Annulé" : isCompleted ? "Reçu (PDF)" : "Bordereau"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Guichet Recent Transactions Pagination */}
        {recentCashierTx.length > GUICHET_PAGE_SIZE && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              currentPage={guichetPage}
              totalPages={guichetTotalPages}
              onPageChange={setGuichetPage}
              totalItems={recentCashierTx.length}
              itemsPerPage={GUICHET_PAGE_SIZE}
            />
          </div>
        )}
      </div>

      </div>
    </>
  );
};
