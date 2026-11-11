import React, { useState, useEffect, useRef } from 'react';
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
  XCircle,
  Camera,
  Upload,
  Trash2,
  Eye,
  Image as ImageIcon,
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode, ServiceType, Transaction } from '../types';
import { OperatorBadge } from '../components/OperatorBadge';
import { MobileAgentHome } from '../components/MobileAgentHome';
import { getOperatorLogo } from '../utils/operatorLogos';
import { Pagination } from '../components/Pagination';
import { ZellePayoutModal } from '../components/ZellePayoutModal';
import { HaitiInboundPayoutModal } from '../components/HaitiInboundPayoutModal';
import { ImageViewerModal } from '../components/ImageViewerModal';
import { compressImage } from '../utils/imageCompressor';

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
    usdToHtgRate,
    setDopToHtgRate,
    createTransaction, 
    killSwitchList,
    setSelectedReceiptTx,
    transactions,
    setActiveTab,
    serviceFeeRates,
    serviceCommissionRates,
    t
  } = useApp();

  const [operator, setOperator] = useState<OperatorCode | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [amountDOP, setAmountDOP] = useState<string>('');
  
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Mode Guichet : Sortant (Envois/Recharges) vs Entrant (Réception Haïti)
  const [guichetMode, setGuichetMode] = useState<'outbound' | 'inbound_haiti'>('outbound');

  // Haïti Inbound States (Dépôt MonCash/Natcash Haïti -> Retrait RD)
  const [inboundOperator, setInboundOperator] = useState<'moncash' | 'natcash'>('moncash');
  const [inboundAmountUSD, setInboundAmountUSD] = useState<string>('');
  const [inboundProofImage, setInboundProofImage] = useState<string | null>(null);
  const [selectedHaitiInboundTx, setSelectedHaitiInboundTx] = useState<Transaction | null>(null);
  const inboundCameraInputRef = useRef<HTMLInputElement>(null);
  const inboundFileInputRef = useRef<HTMLInputElement>(null);

  // Zelle Specific States
  const [zelleProofImage, setZelleProofImage] = useState<string | null>(null);
  const [zelleAmountUSD, setZelleAmountUSD] = useState<string>('100');
  const [zellePayoutCurrency, setZellePayoutCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [selectedZellePayoutTx, setSelectedZellePayoutTx] = useState<Transaction | null>(null);
  const [zelleLightboxUrl, setZelleLightboxUrl] = useState<string | null>(null);
  const zelleCameraInputRef = useRef<HTMLInputElement>(null);
  const zelleFileInputRef = useRef<HTMLInputElement>(null);

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
  const activeFeeRate = operator ? (serviceFeeRates[operator] ?? 0.5) : 0.5;
  const activeCommRate = operator ? (serviceCommissionRates[operator] ?? 1.0) : 1.0;
  const feeDOP = numAmountDOP > 0 ? Math.max(1, Math.round(numAmountDOP * (activeFeeRate / 100))) : 0;
  const commissionDOP = numAmountDOP > 0 ? Math.max(1, Math.round(numAmountDOP * (activeCommRate / 100))) : 0;
  const netDOP = Math.max(0, numAmountDOP - feeDOP - commissionDOP);
  const computedHTG = Math.round(netDOP * dopToHtgRate);

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

  const handleInboundProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.7);
      setInboundProofImage(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setInboundProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInboundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundProofImage) {
      setFeedback({ type: 'error', message: "⚠️ La photo de preuve MonCash / Natcash est obligatoire pour envoyer à l'Admin." });
      return;
    }
    const numHTG = parseFloat(inboundAmountUSD) || 0;
    if (numHTG <= 0) {
      setFeedback({ type: 'error', message: '⚠️ Veuillez saisir la somme exacte reçue en Gourdes (HTG).' });
      return;
    }

    const currentHtgRate = dopToHtgRate || 2.35;
    const grossDOP = Math.max(1, Math.round(numHTG / currentHtgRate));
    const feeDOP = 0; // Sur Dépôt on ne prend aucun frais
    const commDOP = 0; // Sur Dépôt on ne prend aucune commission

    const result = createTransaction({
      senderName: 'Client Haïti',
      senderPhone: '+509 Haïti',
      receiverName: 'Client Guichet RD',
      receiverPhone: '+1 809 Comptoir RD',
      operator: inboundOperator,
      serviceType: 'haiti_inbound_cash',
      amountHTG: Math.round(numHTG),
      amountDOP: grossDOP,
      feeDOP,
      commissionDOP: commDOP,
      proofUrl: inboundProofImage,
    });

    if (result.success && result.transaction) {
      setFeedback({ type: 'success', message: result.message });
      setSelectedHaitiInboundTx(result.transaction);
      setInboundAmountUSD('');
      setInboundProofImage(null);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleZelleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.7);
      setZelleProofImage(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setZelleProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!operator) {
      setFeedback({ type: 'error', message: 'Veuillez sélectionner un opérateur (MonCash, Natcash, Digicel, Natcom, Claro, Altice, Zelle Pay) avant de continuer.' });
      return;
    }

    // Zelle Dedicated Submission
    if (operator === 'zelle') {
      if (!zelleProofImage) {
        setFeedback({ type: 'error', message: '⚠️ La photo de preuve Zelle est obligatoire pour envoyer à l\'Admin.' });
        return;
      }
      const numUSD = parseFloat(zelleAmountUSD) || 0;
      if (numUSD <= 0) {
        setFeedback({ type: 'error', message: '⚠️ Veuillez saisir la somme en USD.' });
        return;
      }
      const usdToDop = (usdToHtgRate && usdToHtgRate <= 100)
        ? usdToHtgRate
        : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);
      const clientName = receiverName.trim() || senderName.trim() || 'Client Zelle';

      const zelleFeePct = serviceFeeRates['zelle'] ?? 0.5;
      const zelleCommPct = serviceCommissionRates['zelle'] ?? 1.0;

      const result = createTransaction({
        senderName: clientName,
        senderPhone: '+1 USA Zelle',
        receiverName: clientName,
        receiverPhone: '+1 USA Zelle',
        operator: 'zelle',
        serviceType: 'transfer',
        amountUSD: numUSD,
        amountDOP: Math.round(numUSD * usdToDop),
        feeDOP: Math.round(numUSD * (zelleFeePct / 100) * usdToDop),
        commissionDOP: Math.round(numUSD * (zelleCommPct / 100) * usdToDop),
        proofUrl: zelleProofImage,
        zelleProofUrl: zelleProofImage,
        payoutCurrency: zellePayoutCurrency,
      });

      if (result.success && result.transaction) {
        setFeedback({ type: 'success', message: result.message });
        setSelectedZellePayoutTx(result.transaction);
        setOperator(null);
        setZelleProofImage(null);
        setZelleAmountUSD('100');
        setReceiverName('');
        setSenderName('');
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
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
              {t('counter_rd_title', 'Saisie Opérations au Guichet (R.D.)')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('operational_portal', 'Interface taillée pour la saisie rapide au comptoir, l\'encaissement en Pesos (DOP) et le décaissement en Gourdes (HTG).')}
          </p>
        </div>

        {/* Live Exchange Rate Display / Controller */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{t('rate_label', 'Taux officiel')}</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              100 DOP = {Math.round(dopToHtgRate * 100)} HTG
            </span>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsEditingRate(!isEditingRate)}
              className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              title="Modifier le Taux de Change Officiel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('edit', 'Ajuster')}</span>
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
              <p className="text-xs font-extrabold text-blue-900">{t('official_exchange_rate', 'Ajustement du Taux de Change Appliqué')}</p>
              <p className="text-[11px] text-blue-700">{t('rate_today', 'Modifie le taux de conversion immédiatement pour toutes les nouvelles opérations.')}</p>
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
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              {t('save', 'Appliquer')}
            </button>
            <button
              type="button"
              onClick={() => setIsEditingRate(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300 cursor-pointer"
            >
              {t('cancel', 'Annuler')}
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
                    {t('transfer_sent', 'Transmis avec succès au flux opérationnel')}
                  </span>
                </div>
                <h3 className="text-lg font-black mt-0.5 text-white">
                  {lastCreatedTx.amountDOP.toLocaleString()} DOP ➔ {lastCreatedTx.amountHTG.toLocaleString()} HTG
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {t('beneficiary', 'Bénéficiaire')} : <strong className="text-slate-200">{lastCreatedTx.receiverName}</strong> ({lastCreatedTx.receiverPhone}) • {t('operator', 'Opérateur')} : <strong className="text-slate-200">{lastCreatedTx.operator.toUpperCase()}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedReceiptTx(lastCreatedTx)}
                className="px-3.5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-4 h-4 text-blue-100 shrink-0" />
                <span>{t('download_receipt', 'Reçu PDF')}</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{t('my_transactions_day', 'Suivre')}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={() => setLastCreatedTx(null)}
                className="p-2 text-slate-500 hover:text-white text-xs font-bold cursor-pointer"
                title={t('close', 'Fermer')}
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
          <button onClick={() => setFeedback(null)} className="underline text-white font-bold cursor-pointer">{t('close', 'Fermer')}</button>
        </div>
      )}

      {/* 2. MODE SWITCHER: ENVOI SORTANT vs RÉCEPTION HAÏTI */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-full sm:w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setGuichetMode('outbound')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            guichetMode === 'outbound'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{t('Envoi & Recharge', 'Envoi & Recharge')}</span>
        </button>

        <button
          type="button"
          onClick={() => setGuichetMode('inbound_haiti')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            guichetMode === 'inbound_haiti'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>{t('Réception Haïti', 'Réception Haïti')}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-white/20 text-white uppercase tracking-wider">
            {t('RD', 'RD')}
          </span>
        </button>
      </div>

      {guichetMode === 'inbound_haiti' ? (
        <form onSubmit={handleInboundSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Étape 1: Choix MonCash ou Natcash */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t('1. Compte de Réception en Haïti', '1. Compte de Réception en Haïti')}
                </label>
                <span className="text-[11px] font-bold text-slate-400">
                  {t('Choisissez MonCash ou Natcash', 'Choisissez MonCash ou Natcash')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setInboundOperator('moncash')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                    inboundOperator === 'moncash'
                      ? 'border-rose-600 bg-rose-50/50 ring-4 ring-rose-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-rose-100 flex items-center justify-center p-1.5 overflow-hidden">
                      <img 
                        src="/images/mon cash.jpg" 
                        alt="MonCash" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (!img.dataset.failed) {
                            img.dataset.failed = '1';
                            img.src = '/images/moncash.png';
                          } else if (img.dataset.failed === '1') {
                            img.dataset.failed = '2';
                            img.src = '/moncash.png';
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">MonCash (Digicel)</p>
                      <p className="text-xs text-slate-500 font-medium">Réception Gourdes (HTG) • 0 Frais</p>
                    </div>
                  </div>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${inboundOperator === 'moncash' ? 'border-rose-600 bg-rose-600' : 'border-slate-300'}`}>
                    {inboundOperator === 'moncash' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInboundOperator('natcash')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                    inboundOperator === 'natcash'
                      ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-blue-100 flex items-center justify-center p-1.5 overflow-hidden">
                      <img 
                        src="/images/natcash.jpg" 
                        alt="Natcash" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (!img.dataset.failed) {
                            img.dataset.failed = '1';
                            img.src = '/images/natcash.png';
                          } else if (img.dataset.failed === '1') {
                            img.dataset.failed = '2';
                            img.src = '/natcash.png';
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Natcash (Natcom)</p>
                      <p className="text-xs text-slate-500 font-medium">Réception Gourdes (HTG) • 0 Frais</p>
                    </div>
                  </div>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${inboundOperator === 'natcash' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {inboundOperator === 'natcash' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                </button>
              </div>
            </div>

            {/* Étape 2: Somme Reçue en Gourdes (HTG) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                {t('2. Somme Écrite sur la Preuve (Gourdes HTG)', '2. Somme Écrite sur la Preuve (Gourdes HTG)')}
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={inboundAmountUSD}
                  onChange={(e) => setInboundAmountUSD(e.target.value)}
                  placeholder="Ex : 5000"
                  required
                  className="w-full pl-5 pr-28 py-4 text-2xl font-black font-mono text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/20"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-amber-600 text-xs">
                  HTG (Gourdes)
                </span>
              </div>

              {/* Conversion Indicative HTG -> DOP (0 Frais) */}
              {(() => {
                const numHTG = parseFloat(inboundAmountUSD) || 0;
                const currentHtgRate = dopToHtgRate || 2.35;
                const estDOP = numHTG > 0 ? Math.max(1, Math.round(numHTG / currentHtgRate)) : 0;
                if (numHTG <= 0) return null;

                return (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-amber-800 font-semibold block">{t('Montant converti en Pesos après validation :', 'Montant converti en Pesos après validation :')}</span>
                      <span className="text-[11px] text-amber-700 font-bold">100 DOP = {Math.round(currentHtgRate * 100)} HTG</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-amber-800">
                        {estDOP.toLocaleString()} DOP
                      </span>
                      <span className="text-[10px] text-emerald-700 font-extrabold block">{t('0 Frais sur Dépôt (Aucun frais déduit)', '0 Frais sur Dépôt (Aucun frais déduit)')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Étape 3: Photo Preuve de Transaction */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                {t('3. Preuve de la Transaction (Capture d\'écran ou Photo Reçu)', '3. Preuve de la Transaction (Capture d\'écran ou Photo Reçu)')}
              </label>

              <input
                ref={inboundCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleInboundProofUpload}
                className="hidden"
              />
              <input
                ref={inboundFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInboundProofUpload}
                className="hidden"
              />

              {!inboundProofImage ? (
                <div className="p-6 border-2 border-dashed border-amber-300 rounded-3xl bg-amber-50/40 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 mx-auto border border-amber-100">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{t('Ajouter la photo de preuve MonCash / Natcash', 'Ajouter la photo de preuve MonCash / Natcash')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('Capture d\'écran du SMS de confirmation ou de l\'application mobile.', 'Capture d\'écran du SMS de confirmation ou de l\'application mobile.')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-1">
                    <button
                      type="button"
                      onClick={() => inboundCameraInputRef.current?.click()}
                      className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('Prendre une Photo', 'Prendre une Photo')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => inboundFileInputRef.current?.click()}
                      className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-98 transition-all"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>{t('Importer une Image', 'Importer une Image')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-black/5 p-2">
                  <div className="aspect-video sm:aspect-2/1 rounded-xl overflow-hidden bg-black/10 flex items-center justify-center relative group">
                    <img src={inboundProofImage} alt="Preuve" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl mt-2 border border-slate-200">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('Photo de preuve chargée avec succès', 'Photo de preuve chargée avec succès')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setInboundProofImage(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('Supprimer', 'Supprimer')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de Soumission */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-white shrink-0" />
              <span>{t('Envoyer à l\'Admin', 'Envoyer à l\'Admin')}</span>
            </button>
          </div>

          {/* Right Column (Instructions & Summary) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{t('Comment fonctionne ce flux ?', 'Comment fonctionne ce flux ?')}</span>
              </h4>
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="font-extrabold text-slate-900 block">1. Saisie de la Preuve</span>
                  <p className="text-[11px] text-slate-500">Le client en RD vous présente la preuve du transfert MonCash ou Natcash reçu en Haïti.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="font-extrabold text-slate-900 block">2. Validation par l'Admin</span>
                  <p className="text-[11px] text-slate-500">L'administrateur vérifie son compte en temps réel et confirme la bonne réception des fonds.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="font-extrabold text-slate-900 block">3. Remise des Pesos (DOP)</span>
                  <p className="text-[11px] text-slate-500">Dès validation, l'application affiche le montant net calculé à remettre au client au guichet.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
      /* 2. MAIN GUICHET FORM LAYOUT */
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Inputs (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operator Selection Card with Official Logos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                {t('step1_service', '1. Sélection du Service & Opérateur')}
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                {t('service_selection', 'Cliquez directement sur l\'opérateur')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {(Object.keys(OPERATOR_VISUAL_CARDS) as OperatorCode[]).map((opKey) => {
                const conf = OPERATOR_VISUAL_CARDS[opKey];
                const ks = killSwitchList.find(k => k.operator === opKey);
                const isForbiddenForGestionnaire = currentUser.role === 'gestionnaire' && (opKey === 'natcash' || opKey === 'natcom');
                const isLocked = (ks && !ks.enabled) || isForbiddenForGestionnaire;
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
                    title={isForbiddenForGestionnaire ? "Service restreint : Un gestionnaire/superviseur ne peut pas effectuer d'opérations Natcash ou Natcom" : undefined}
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
                        {isForbiddenForGestionnaire ? (
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
                        {isForbiddenForGestionnaire ? "Non disponible Superviseur" : conf.category}
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

          {/* Client Details Card or Zelle Proof Card */}
          {operator === 'zelle' ? (
            <div className="bg-white p-6 rounded-3xl border border-purple-200/80 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>2. Preuve de Virement Zelle & Client (Obligatoire)</span>
                </label>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Vérification Admin Requise
                </span>
              </div>

              {/* Upload Container with Dual Camera & Import Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    <span>Capture d'écran ou Photo du reçu Zelle :</span>
                  </label>
                  {zelleProofImage && (
                    <button
                      type="button"
                      onClick={() => setZelleProofImage(null)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Changer la photo</span>
                    </button>
                  )}
                </div>

                {/* Hidden input elements */}
                <input
                  ref={zelleCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleZelleProofUpload}
                  className="hidden"
                />
                <input
                  ref={zelleFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleZelleProofUpload}
                  className="hidden"
                />

                {!zelleProofImage ? (
                  <div className="p-6 border-2 border-dashed border-purple-300 rounded-3xl bg-purple-50/40 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 mx-auto border border-purple-100">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Ajouter la preuve de virement Zelle</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Choisissez de prendre une photo en direct ou d'importer une image de la galerie.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-1">
                      <button
                        type="button"
                        onClick={() => zelleCameraInputRef.current?.click()}
                        className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Prendre Photo (Caméra)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => zelleFileInputRef.current?.click()}
                        className="py-3 px-4 rounded-2xl bg-white hover:bg-purple-50 text-purple-700 font-extrabold text-xs border-2 border-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Importer Image (Galerie)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border-2 border-purple-400 bg-slate-900 group shadow-md">
                    <img
                      src={zelleProofImage}
                      alt="Preuve Zelle"
                      className="w-full max-h-[360px] object-contain mx-auto"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setZelleLightboxUrl(zelleProofImage)}
                        className="px-4 py-2 bg-white/95 text-slate-900 text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-white cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span>Agrandir en Plein Écran</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZelleProofImage(null)}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Preuve attachée avec succès</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notice : Pas besoin de nom de client */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-purple-950">Pas de nom de client requis pour Zelle</p>
                  <p className="text-[11px] text-purple-700 mt-0.5">Le virement est identifié directement sur le compte de destination et certifié par la preuve bancaire transmise à l'Admin.</p>
                </div>
              </div>
            </div>
          ) : (
            (() => {
              const isTelecom = operator ? ['natcom', 'claro', 'digicel', 'altice'].includes(operator) : false;
              const opLabel = operator ? operator.toUpperCase() : '';
              return (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      {t('step2_parties', '2. Informations Récepteur')} {opLabel ? `(${opLabel})` : ''}
                    </label>
                    <span className="text-[11px] font-bold text-slate-400">
                      {isTelecom ? 'Entrez uniquement le numéro de téléphone à recharger' : t('receiver_info', 'Saisissez les informations du compte récepteur')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                      {isTelecom ? `Recharge Directe (${opLabel})` : t('receiver_info', 'Bénéficiaire Récepteur (Haïti 🇭🇹)')}
                    </span>

                    <div className={`grid grid-cols-1 ${isTelecom ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
                      {!isTelecom && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span>{t('receiver_name', 'Nom complet du bénéficiaire')}</span>
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
                          <span>{isTelecom ? `Numéro de Téléphone à Recharger (${opLabel})` : t('receiver_phone', 'Numéro Portefeuille / Compte')}</span>
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
            })()
          )}

        </div>

        {/* Real-time Rate Calculator & Summary (Right Column) */}
        <div className="space-y-6">
          {operator === 'zelle' ? (
            <div className="bg-white p-6 rounded-3xl border border-purple-200/80 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span>3. Montant Zelle & Conversion</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  Devise USD 🇺🇸
                </span>
              </div>

              {/* Amount in USD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Somme exacte reçue par Zelle (USD) :
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={zelleAmountUSD}
                    onChange={(e) => setZelleAmountUSD(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-200 font-mono text-2xl font-black text-slate-900 pl-4 pr-16 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:bg-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-purple-600 font-mono">
                    USD $
                  </span>
                </div>
              </div>

              {/* Quick USD Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Montants Zelle fréquents :
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[50, 100, 200, 300, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setZelleAmountUSD(preset.toString())}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                        parseFloat(zelleAmountUSD) === preset
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Currency Choice */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Devise de remise au client :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setZellePayoutCurrency('DOP')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      zellePayoutCurrency === 'DOP'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🇩🇴 Pesos (DOP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setZellePayoutCurrency('USD')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      zellePayoutCurrency === 'USD'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🇺🇸 Dollars (USD)</span>
                  </button>
                </div>
              </div>

              {/* Live Calculations Breakdown */}
              {(() => {
                const numUSD = parseFloat(zelleAmountUSD) || 0;
                const usdToDop = (usdToHtgRate && usdToHtgRate <= 100)
        ? usdToHtgRate
        : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);
                const zelleFeePct = serviceFeeRates['zelle'] ?? 0.5;
                const zelleCommPct = serviceCommissionRates['zelle'] ?? 1.0;
                const feeUSD = Math.round(numUSD * (zelleFeePct / 100) * 100) / 100;
                const commUSD = Math.round(numUSD * (zelleCommPct / 100) * 100) / 100;
                const netUSD = Math.max(0, Math.round((numUSD - feeUSD - commUSD) * 100) / 100);
                const netDOP = Math.round(netUSD * usdToDop);
                const netUSDExact = netUSD;
                const netPayout = zellePayoutCurrency === 'DOP' ? netDOP : netUSDExact;

                return (
                  <div className="p-4 bg-purple-50/70 rounded-2xl space-y-3 text-xs border border-purple-200/70 font-sans">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">{t('Taux de conversion :')}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {zellePayoutCurrency === 'DOP'
                          ? `1 USD = ${usdToDop.toFixed(2)} DOP`
                          : '1 USD = 1.00 USD'}
                      </span>
                    </div>

                    {currentUser.role === 'admin' && (
                      <div className="flex justify-between items-center text-slate-600 text-[11px]">
                        <span>{t('Frais de service')} ({zelleFeePct}%) :</span>
                        <span className="font-mono font-bold text-slate-700">-${feeUSD.toFixed(2)} USD</span>
                      </div>
                    )}

                    <div className="p-3.5 bg-purple-100/80 rounded-2xl border border-purple-300 text-purple-950 space-y-1.5">
                      <div className="flex items-center gap-2 font-black text-xs text-purple-900">
                        <Lock className="w-4 h-4 text-purple-700 shrink-0" />
                        <span>Montant à remettre : Bloqué en attente Admin</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-purple-800">
                        ⚠️ <strong>Ne remettez aucun argent au client pour l'instant !</strong> Le montant net à décaisser sera débloqué et affiché uniquement après que l'Administrateur aura vérifié son compte et validé la transaction (OUI).
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Routing Notice */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-950">
                <p className="font-black flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Validation bancaire obligatoire</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  L'Administrateur recevra l'alerte pour vérifier son compte Zelle et cliquer sur <strong>OUI</strong> ou <strong>NON</strong>. Dès validation, votre fiche de remise s'actualise avec les frais, le taux et le montant net à payer.
                </p>
              </div>

              {/* Submission Button */}
              <button
                type="submit"
                disabled={isOperatorLocked || !zelleProofImage}
                className={`w-full py-3.5 rounded-2xl font-black text-xs text-white transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer whitespace-nowrap ${
                  isOperatorLocked || !zelleProofImage
                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 active:scale-[0.99]'
                }`}
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Envoyer à l'Admin</span>
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>{t('step3_amounts', '3. Saisie Financière & Conversion')}</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Temps Réel
                </span>
              </div>

              {/* Amount in DOP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('amount_dop', 'Montant en Pesos dominicains (DOP) versé :')}
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
                  {t('quick_amounts', 'Montants rapides au comptoir :')}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUICK_AMOUNTS_DOP.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountDOP(preset.toString())}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
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
              <div className="p-4 bg-slate-50/90 rounded-2xl space-y-2.5 text-xs border border-slate-200/70 font-sans">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="whitespace-nowrap font-medium">{t('Montant Brut Encaissé', 'Montant Brut Encaissé')} :</span>
                  <span className="font-mono font-bold text-slate-900 whitespace-nowrap">{numAmountDOP.toLocaleString()} DOP</span>
                </div>

                <div className="flex justify-between items-center text-amber-700 text-[11px]">
                  <span className="whitespace-nowrap font-semibold">{t('Frais Guichet')} ({activeFeeRate}%) :</span>
                  <span className="font-mono font-bold whitespace-nowrap">-{feeDOP.toLocaleString()} DOP</span>
                </div>

                <div className="flex justify-between items-center text-blue-700 text-[11px]">
                  <span className="whitespace-nowrap font-semibold">{t('Commission Admin')} ({activeCommRate}%) :</span>
                  <span className="font-mono font-bold whitespace-nowrap">-{commissionDOP.toLocaleString()} DOP</span>
                </div>

                <div className="flex justify-between items-center text-slate-800 text-[11px] font-bold pt-1 border-t border-slate-200/50">
                  <span className="whitespace-nowrap font-medium">{t('Montant Net Converti', 'Montant Net Converti')} :</span>
                  <span className="font-mono font-bold text-slate-900 whitespace-nowrap">{netDOP.toLocaleString()} DOP</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="whitespace-nowrap font-medium">{t('rate_label', 'Taux appliqué')} :</span>
                  <span className="font-mono font-bold text-slate-900 whitespace-nowrap">100 DOP = {Math.round(dopToHtgRate * 100)} HTG</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200/70 text-slate-900">
                  <span className="font-black text-xs uppercase tracking-tight whitespace-nowrap">{t('received_htg', 'Montant net en Haïti :')}</span>
                  <span className="font-mono font-black text-blue-600 text-lg whitespace-nowrap">
                    {computedHTG.toLocaleString()} HTG
                  </span>
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
                className={`w-full py-3.5 rounded-2xl font-black text-xs text-white transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer whitespace-nowrap ${
                  isOperatorLocked 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.99]'
                }`}
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{t('validate_transaction', 'Valider & Envoyer')}</span>
              </button>
            </div>
          )}
        </div>

      </form>
      )}

      {/* 3. RECENT CASHIER TRANSACTIONS LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">{t('my_transactions_day', 'Mes Dernières Opérations au Comptoir')}</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('tracking_receipts', 'Suivi instantané des transactions récemment saisies depuis ce poste')}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('view_all', 'Voir tout')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">{t('date', 'Réf. & Heure')}</th>
                <th className="pb-3 px-3">{t('operator', 'Opérateur')}</th>
                <th className="pb-3 px-3">{t('sender', 'Expéditeur')} ➔ {t('beneficiary', 'Bénéficiaire')}</th>
                <th className="pb-3 px-3 text-right">{t('amount_dop', 'Montant DOP')}</th>
                <th className="pb-3 px-3 text-right">{t('received_htg', 'Montant Net HTG')}</th>
                <th className="pb-3 px-3 text-center">{t('status', 'Statut')}</th>
                <th className="pb-3 px-3 text-center">{t('actions', 'Action Reçu')}</th>
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
                      {tx.serviceType === 'haiti_inbound_cash'
                        ? (tx.haitiInboundStatus === 'approved' || isCompleted
                            ? `${(tx.amountDOP || tx.netPayoutAmount || 0).toLocaleString()} DOP (0 Frais)`
                            : `En attente validation`)
                        : `${tx.amountDOP.toLocaleString()} DOP`}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-blue-600 text-sm">
                      {tx.serviceType === 'haiti_inbound_cash'
                        ? `${(tx.amountHTG || 0).toLocaleString()} HTG`
                        : `${tx.amountHTG.toLocaleString()} HTG`}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {tx.serviceType === 'haiti_inbound_cash' ? (
                        tx.haitiInboundStatus === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {isCompleted ? 'Pesos remis' : 'Prêt versement'}
                          </span>
                        ) : tx.haitiInboundStatus === 'rejected' || tx.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Refusé Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Attente Vérif. Admin
                          </span>
                        )
                      ) : tx.operator === 'zelle' ? (
                        tx.zelleStatus === 'approved' || isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Validé Admin (À Payer)
                          </span>
                        ) : tx.zelleStatus === 'rejected' || tx.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Refusé Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300 animate-pulse">
                            <Clock className="w-3 h-3 text-purple-600" />
                            Attente Vérif. Admin
                          </span>
                        )
                      ) : tx.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          {t('cancelled', 'Annulé')}
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          {t('completed', 'Clôturé / Validé')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-900 border border-orange-300">
                          <Clock className="w-3 h-3 text-orange-600 animate-pulse" />
                          {t('pending', 'En attente')}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {tx.serviceType === 'haiti_inbound_cash' ? (
                        <button
                          onClick={() => setSelectedHaitiInboundTx(tx)}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                          title="Ouvrir la fiche Réception Haïti (MonCash / Natcash)"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Fiche Dépôt</span>
                        </button>
                      ) : tx.operator === 'zelle' ? (
                        <button
                          onClick={() => setSelectedZellePayoutTx(tx)}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                          title="Ouvrir la fiche de décaissement Zelle avec preuve et validation"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Fiche Zelle</span>
                        </button>
                      ) : (
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
                          <span>{tx.status === 'cancelled' ? t('cancelled', 'Annulé') : isCompleted ? t('certified_receipt', 'Reçu (PDF)') : t('details', 'Bordereau')}</span>
                        </button>
                      )}
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

      {/* Certified Zelle Payout & Admin Verification Modal */}
      {selectedZellePayoutTx && (
        <ZellePayoutModal
          tx={selectedZellePayoutTx}
          onClose={() => setSelectedZellePayoutTx(null)}
        />
      )}

      {/* Haïti Inbound Payout & Admin Verification Modal */}
      {selectedHaitiInboundTx && (
        <HaitiInboundPayoutModal
          tx={selectedHaitiInboundTx}
          onClose={() => setSelectedHaitiInboundTx(null)}
        />
      )}

      {/* Full-Screen Image Lightbox */}
      {zelleLightboxUrl && (
        <ImageViewerModal
          imageUrl={zelleLightboxUrl}
          title="Preuve de transaction Zelle"
          onClose={() => setZelleLightboxUrl(null)}
        />
      )}
    </>
  );
};
