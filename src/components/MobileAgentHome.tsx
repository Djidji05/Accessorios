import React, { useState } from 'react';
import { 
  Send, 
  Smartphone, 
  Wifi, 
  Radio, 
  PhoneCall, 
  ShoppingBag, 
  DollarSign, 
  Grid, 
  Bell, 
  QrCode, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  FileText,
  ArrowLeft, 
  User, 
  Phone, 
  Zap, 
  Calculator, 
  AlertTriangle,
  Lock,
  Search,
  Sparkles,
  Layers,
  ArrowUpRight,
  Eye,
  EyeOff,
  LogOut,
  ChevronLeft,
  X,
  UserCheck,
  Clock,
  Home,
  PlusCircle,
  Users,
  Globe,
  Check,
  ChevronDown,
  Camera,
  Upload,
  Trash2,
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode, ServiceType, Transaction } from '../types';
import { OperatorBadge } from './OperatorBadge';
import { BottomNavBar } from './BottomNavBar';
import { getOperatorLogo } from '../utils/operatorLogos';
import { ZellePayoutModal } from './ZellePayoutModal';
import { HaitiInboundPayoutModal } from './HaitiInboundPayoutModal';
import { ImageViewerModal } from './ImageViewerModal';
import { compressImage } from '../utils/imageCompressor';

const SERVICES_LIST: {
  id: OperatorCode | 'more';
  name: string;
  sublabel: string;
  icon: React.ElementType;
  country: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  { 
    id: 'moncash', 
    name: 'MonCash', 
    sublabel: 'Portefeuille HT', 
    icon: Send, 
    country: '🇭🇹',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 border-rose-200 dark:border-rose-900/50',
    badgeText: 'text-rose-600 dark:text-rose-400' 
  },
  { 
    id: 'natcash', 
    name: 'Natcash', 
    sublabel: 'Mobile Money HT', 
    icon: Smartphone, 
    country: '🇭🇹',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20 border-blue-200 dark:border-blue-900/50',
    badgeText: 'text-blue-600 dark:text-blue-400' 
  },
  { 
    id: 'digicel', 
    name: 'Digicel', 
    sublabel: 'Recharge HT', 
    icon: Wifi, 
    country: '🇭🇹',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/20 border-red-200 dark:border-red-900/50',
    badgeText: 'text-red-600 dark:text-red-400' 
  },
  { 
    id: 'natcom', 
    name: 'Natcom', 
    sublabel: 'Forfait HT', 
    icon: Radio, 
    country: '🇭🇹',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-500/20 border-sky-200 dark:border-sky-900/50',
    badgeText: 'text-sky-600 dark:text-sky-400' 
  },
  { 
    id: 'claro', 
    name: 'Claro RD', 
    sublabel: 'Télécom RD', 
    icon: PhoneCall, 
    country: '🇩🇴',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 border-rose-200 dark:border-rose-900/50',
    badgeText: 'text-rose-600 dark:text-rose-400' 
  },
  { 
    id: 'altice', 
    name: 'Altice RD', 
    sublabel: 'Télécom RD', 
    icon: ShoppingBag, 
    country: '🇩🇴',
    badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20 border-orange-200 dark:border-orange-900/50',
    badgeText: 'text-orange-600 dark:text-orange-400' 
  },
  { 
    id: 'zelle', 
    name: 'Zelle Pay', 
    sublabel: 'Virement USD', 
    icon: DollarSign, 
    country: '🇺🇸',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20 border-purple-200 dark:border-purple-900/50',
    badgeText: 'text-purple-600 dark:text-purple-400' 
  }
];

const QUICK_AMOUNTS_DOP = [1000, 2500, 5000, 10000, 15000, 20000];

export const MobileAgentHome: React.FC = () => {
  const { 
    currentUser, 
    transactions, 
    dopToHtgRate, 
    usdToHtgRate,
    createTransaction, 
    killSwitchList, 
    setSelectedReceiptTx,
    setActiveTab,
    openSearch,
    logout,
    selectedService,
    setSelectedService,
    readNotificationIds,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentLang,
    setLanguage,
    t,
  } = useApp();

  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);

  const languages: Array<{ code: 'FR' | 'HT' | 'ES'; label: string; flag: string }> = [
    { code: 'FR', label: 'Français', flag: '🇫🇷' },
    { code: 'HT', label: 'Kreyòl', flag: '🇭🇹' },
    { code: 'ES', label: 'Español', flag: '🇩🇴' },
  ];

  // Form states for transfer entry page
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [amountDOP, setAmountDOP] = useState<string>('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Haïti Inbound specific states
  const [isHaitiInboundActive, setIsHaitiInboundActive] = useState<boolean>(false);
  const [inboundOperator, setInboundOperator] = useState<'moncash' | 'natcash'>('moncash');
  const [inboundAmountUSD, setInboundAmountUSD] = useState<string>('');
  const [inboundProofImage, setInboundProofImage] = useState<string | null>(null);
  const [selectedHaitiInboundTx, setSelectedHaitiInboundTx] = useState<Transaction | null>(null);
  const inboundCameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const inboundFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Zelle specific agent intake states
  const [zelleProofImage, setZelleProofImage] = useState<string | null>(null);
  const [zelleAmountUSD, setZelleAmountUSD] = useState<string>('100');
  const [zellePayoutCurrency, setZellePayoutCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [selectedZellePayoutTx, setSelectedZellePayoutTx] = useState<Transaction | null>(null);
  const [zelleLightboxUrl, setZelleLightboxUrl] = useState<string | null>(null);
  const zelleCameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const zelleFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastCreatedTx, setLastCreatedTx] = useState<Transaction | null>(null);

  // Role Scoped Notifications (Strictly respects Agent RD, Gestionnaire & user rights)
  const isAgentRD = currentUser.role === 'agent_rd';
  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isGestionnaire = currentUser.role === 'gestionnaire';
  const isAdmin = currentUser.role === 'admin';
  const isDesktopNavRole = isAdmin || isGestionnaire;

  // Helper : Détermine si une transaction appartient à l'utilisateur connecté dans ce guichet
  const isMyTransaction = React.useCallback((t: Transaction): boolean => {
    if (isAdmin) return true;

    const currentName = currentUser.name?.trim().toLowerCase() || '';
    const currentUsername = currentUser.username?.trim().toLowerCase() || '';
    const createdByName = t.createdByName?.trim().toLowerCase() || '';

    if (isGestionnaire) {
      // Pour le gestionnaire : uniquement les transactions qui lui appartiennent / créées par lui
      const isCreatedByMe = (
        (createdByName !== '' && (createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername))) ||
        (t.createdByRole === 'gestionnaire' && (!createdByName || createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername) || currentName.includes('gestionnaire') || createdByName.includes('gestionnaire')))
      );
      return Boolean(isCreatedByMe);
    }

    if (isAgentRD) {
      // Pour l'agent RD : uniquement les transactions créées par lui-même au comptoir
      const isCreatedByMe = (
        (createdByName !== '' && (createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername))) ||
        (t.createdByRole === 'agent_rd' && (!createdByName || createdByName === currentName || (currentUsername !== '' && createdByName === currentUsername)))
      );
      return Boolean(isCreatedByMe);
    }

    if (isAgentHaiti) {
      return t.operator === 'natcash' || t.operator === 'natcom' || t.channel === 'haiti_cash';
    }

    return createdByName === currentName;
  }, [isAdmin, isGestionnaire, isAgentRD, isAgentHaiti, currentUser]);

  const notifications = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      icon: any;
      color: string;
      tx?: Transaction;
    }> = [];

    const scopedTxs = transactions.filter((t) => {
      if (isAdmin) return true;
      if (isGestionnaire) {
        return isMyTransaction(t) || ['digicel', 'claro', 'altice'].includes(t.operator);
      }
      if (isAgentRD) {
        return isMyTransaction(t);
      }
      if (isAgentHaiti) {
        return t.operator === 'natcash' || t.operator === 'natcom' || t.channel === 'haiti_cash';
      }
      return isMyTransaction(t);
    });

    scopedTxs.slice(0, 4).forEach((tx) => {
      let icon = Clock;
      let color = 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800';
      const statusLabel = tx.status === 'completed' ? t('Validé', 'Validé') : tx.status === 'cancelled' ? t('Annulé', 'Annulé') : t('En cours', 'En cours');
      let title = `${t('Transfert', 'Transfert')} ${statusLabel}`;

      if (tx.status === 'completed') {
        icon = CheckCircle2;
        color = 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800';
      } else if (tx.status === 'cancelled') {
        icon = AlertTriangle;
        color = 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800';
      }

      list.push({
        id: `tx_${tx.id}`,
        title,
        message: `${tx.operator.toUpperCase()} • ${tx.amountHTG.toLocaleString()} HTG ${t('pour', 'pour')} ${tx.receiverName} (${tx.receiverPhone})`,
        time: t('Récemment', 'Récemment'),
        icon,
        color,
        tx
      });
    });

    // Exchange Rate notification
    list.push({
      id: 'notif_rate',
      title: t('Taux du Jour', 'Taux du Jour'),
      message: `100 Pesos (DOP) = ${Math.round(dopToHtgRate * 100)} Gourdes (HTG)`,
      time: t('Aujourd\'hui', 'Aujourd\'hui'),
      icon: DollarSign,
      color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800'
    });

    // Security / KillSwitch alert
    const activeKillCount = killSwitchList.filter(k => !k.enabled).length;
    if (activeKillCount > 0) {
      list.push({
        id: 'notif_ks',
        title: t('Alerte Opérateurs', 'Alerte Opérateurs'),
        message: `${activeKillCount} ${t('service(s) temporairement suspendu(s)', 'service(s) temporairement suspendu(s)')}`,
        time: t('Actif', 'Actif'),
        icon: Lock,
        color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
      });
    }

    return list;
  }, [transactions, currentUser, dopToHtgRate, killSwitchList, isAdmin, isGestionnaire, isAgentRD, isAgentHaiti, isMyTransaction, t]);

  const unreadNotifications = notifications.filter(n => !readNotificationIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  // Calculate transactions & amount realized during the current week for this user
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const myTxs = transactions.filter(isMyTransaction);

  const weeklyTxs = myTxs.filter((t) => {
    if (t.status === 'cancelled') return false;
    const tDate = new Date(t.createdAt);
    return !isNaN(tDate.getTime()) && tDate >= startOfWeek;
  });

  const weeklyCount = weeklyTxs.length;
  const weeklyTotalDOP = weeklyTxs.reduce((sum, t) => sum + t.amountDOP, 0);
  const displayTotalDOP = weeklyTotalDOP;
  const displayTotalHTG = Math.round(displayTotalDOP * dopToHtgRate);

  const zelleTxs = myTxs.filter((t) => t.operator === 'zelle');
  const zelleTotalDOP = zelleTxs.reduce((sum, t) => sum + t.amountDOP, 0);
  const zelleTotalUSD = zelleTxs.reduce((sum, t) => sum + (t.amountUSD || Math.round((t.amountDOP / 60) * 100) / 100), 0);

  const recentTxs = myTxs.slice(0, 6);

  // Step 1: Transfer Form Submission Handler -> Opens Confirmation Page
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Check if operator requires beneficiary name (digicel, claro, altice, natcom are topups/recharges with no beneficiary name needed)
    const isNoBeneficiaryOperator = ['digicel', 'claro', 'altice', 'natcom'].includes(selectedService);

    if (!receiverPhone || (!isNoBeneficiaryOperator && !receiverName)) {
      setFeedback({ 
        type: 'error', 
        message: isNoBeneficiaryOperator 
          ? 'Veuillez saisir le numéro de téléphone.' 
          : 'Veuillez remplir le numéro de téléphone et le nom du bénéficiaire.' 
      });
      return;
    }

    const numAmountDOP = parseFloat(amountDOP) || 0;
    if (numAmountDOP <= 0) {
      setFeedback({ type: 'error', message: 'Le montant saisi doit être supérieur à 0 Peso.' });
      return;
    }

    setFeedback(null);
    setShowConfirmation(true);
  };

  // Step 2: Final Transaction Execution Handler
  const executeTransaction = () => {
    if (!selectedService) return;

    const numAmountDOP = parseFloat(amountDOP) || 0;
    const feeDOP = Math.max(1, Math.round(numAmountDOP * 0.005)); // 0.5% frais de service guichet
    const commissionDOP = Math.max(1, Math.round(numAmountDOP * 0.01)); // 1% commission admin

    const isNoBeneficiaryOperator = ['digicel', 'claro', 'altice', 'natcom'].includes(selectedService);
    const defaultReceiver = isNoBeneficiaryOperator 
      ? `Recharge ${selectedService.toUpperCase()}`
      : 'Bénéficiaire Mobile';

    const result = createTransaction({
      senderName: senderName || currentUser.name || 'Client Comptoir',
      senderPhone: senderPhone || '+1 809 000 0000',
      receiverName: receiverName.trim() || defaultReceiver,
      receiverPhone,
      operator: selectedService,
      serviceType: serviceType || (isNoBeneficiaryOperator ? 'topup_mobile' : 'cash_out'),
      amountDOP: numAmountDOP,
      feeDOP,
      commissionDOP,
    });

    setShowConfirmation(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      if (result.transaction) {
        setLastCreatedTx(result.transaction);
      }
      // Reset inputs
      setSenderName('');
      setSenderPhone('');
      setReceiverName('');
      setReceiverPhone('');
      setAmountDOP('');
      setServiceType(null);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  // Haïti Inbound Photo & Intake Handlers
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
      setFeedback({ type: 'error', message: "⚠️ La photo de preuve MonCash / Natcash est obligatoire pour que l'Admin puisse vérifier." });
      return;
    }
    const numHTG = parseFloat(inboundAmountUSD) || 0;
    if (numHTG <= 0) {
      setFeedback({ type: 'error', message: '⚠️ Veuillez saisir la somme exacte en Gourdes (HTG) écrite sur la preuve.' });
      return;
    }

    const currentHtgRate = dopToHtgRate || 2.35;
    const grossDOP = Math.max(1, Math.round(numHTG / currentHtgRate));
    const feeDOP = 0; // Sur Dépôt on ne prend aucun frais
    const commDOP = 0; // Sur Dépôt on ne prend aucune commission

    const res = createTransaction({
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

    if (res.success && res.transaction) {
      setFeedback({ type: 'success', message: res.message });
      setSelectedHaitiInboundTx(res.transaction);
      setIsHaitiInboundActive(false);
      setInboundAmountUSD('');
      setInboundProofImage(null);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Zelle Photo & Intake Handlers
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

  const handleZelleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zelleProofImage) {
      setFeedback({ type: 'error', message: '⚠️ La photo de preuve Zelle est obligatoire pour que l\'Admin puisse vérifier.' });
      return;
    }
    const amountVal = parseFloat(zelleAmountUSD) || 0;
    if (amountVal <= 0) {
      setFeedback({ type: 'error', message: '⚠️ Veuillez saisir le montant en USD envoyé par Zelle.' });
      return;
    }

    const usdToDop = (usdToHtgRate && usdToHtgRate <= 100)
      ? usdToHtgRate
      : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);
    const clientName = 'Client Zelle';

    const res = createTransaction({
      senderName: clientName,
      senderPhone: '+1 USA Zelle',
      receiverName: clientName,
      receiverPhone: '+1 USA Zelle',
      operator: 'zelle',
      serviceType: 'transfer',
      amountUSD: amountVal,
      amountDOP: Math.round(amountVal * usdToDop),
      feeDOP: Math.round(amountVal * 0.005 * usdToDop), // 0.5% frais de service guichet
      commissionDOP: Math.round(amountVal * 0.01 * usdToDop), // 1% commission admin
      proofUrl: zelleProofImage,
      zelleProofUrl: zelleProofImage,
      payoutCurrency: zellePayoutCurrency,
    });

    if (res.success && res.transaction) {
      setSelectedZellePayoutTx(res.transaction);
      setSelectedService(null);
      setZelleProofImage(null);
      setZelleAmountUSD('100');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // DEDICATED STREAMLINED HAÏTI INBOUND SCREEN (DÉPÔT EN GOURDES HTG -> PESOS DOP APRÈS VALIDATION, 0 FRAIS)
  if (isHaitiInboundActive) {
    const numHTG = parseFloat(inboundAmountUSD) || 0;
    const currentHtgRate = dopToHtgRate || 2.35;
    const estDOP = numHTG > 0 ? Math.max(1, Math.round(numHTG / currentHtgRate)) : 0;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 space-y-4 animate-in fade-in">
        <header className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md -mx-4 -mt-4 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setIsHaitiInboundActive(false);
              setFeedback(null);
            }}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 cursor-pointer"
            title="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t('Réception Haïti → Retrait RD', 'Réception Haïti → Retrait RD')}
            </h3>
          </div>
          <div className="w-9" />
        </header>

        {feedback && (
          <div className={`p-4 rounded-2xl text-xs font-bold ${feedback.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleInboundSubmit} className="space-y-4">
          {/* Opérateur MonCash ou Natcash */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('1. Choix du Compte de Réception (Haïti)')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInboundOperator('moncash')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  inboundOperator === 'moncash'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 ring-4 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs overflow-hidden">
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
                <span className="font-black text-xs text-slate-900 dark:text-white">MonCash</span>
              </button>

              <button
                type="button"
                onClick={() => setInboundOperator('natcash')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  inboundOperator === 'natcash'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-4 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs overflow-hidden">
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
                <span className="font-black text-xs text-slate-900 dark:text-white">Natcash</span>
              </button>
            </div>
          </div>

          {/* Montant en Gourdes (HTG) */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('2. Somme Écrite sur la Preuve (Gourdes HTG)')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="1"
                value={inboundAmountUSD}
                onChange={(e) => setInboundAmountUSD(e.target.value)}
                placeholder={t('Ex : 5000')}
                required
                className="w-full pl-4 pr-24 py-3.5 text-2xl font-black font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-amber-600 dark:text-amber-400 text-xs">
                HTG (Gourdes)
              </span>
            </div>

            {numHTG > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 dark:text-amber-200 font-bold">{t('Somme reçue (Gourdes) :')}</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">{Math.round(numHTG).toLocaleString()} HTG</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>{t('Frais sur Dépôt :')}</span>
                  <span className="font-mono">0 DOP (Aucun frais)</span>
                </div>
                <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-amber-900 dark:text-amber-200 font-extrabold block">{t('Après validation Admin (Pesos) :')}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">100 DOP = {Math.round(currentHtgRate * 100)} HTG</span>
                  </div>
                  <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-300">
                    {estDOP.toLocaleString()} DOP
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Photo Preuve */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t("3. Preuve (Capture d'écran / Photo)")}
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
              <div className="p-5 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-3">
                <Camera className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t("Ajoutez la capture d'écran reçue du client")}
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => inboundCameraInputRef.current?.click()}
                    className="py-2.5 px-3 bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('Photo')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => inboundFileInputRef.current?.click()}
                    className="py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('Galerie')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="aspect-video rounded-2xl overflow-hidden bg-black/10 border border-amber-300 flex items-center justify-center">
                  <img src={inboundProofImage} alt="Preuve" className="w-full h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setInboundProofImage(null)}
                  className="w-full py-2 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('Remplacer la photo')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bouton de validation */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{t("Envoyer à l'Admin pour Vérification")}</span>
          </button>
        </form>

        <BottomNavBar />
      </div>
    );
  }

  // IF A SERVICE IS CLICKED: Render the Transfer Form Page, Confirmation Page, or Success Page
  if (selectedService) {
    const ksStatus = killSwitchList.find(k => k.operator === selectedService);
    const isOperatorLocked = ksStatus && !ksStatus.enabled;
    const numAmountDOP = parseFloat(amountDOP) || 0;
    const previewFeeDOP = numAmountDOP > 0 ? Math.max(1, Math.round(numAmountDOP * 0.005)) : 0;
    const previewNetDOP = Math.max(0, numAmountDOP - previewFeeDOP);
    const previewCommDOP = numAmountDOP > 0 ? Math.max(1, Math.round(numAmountDOP * 0.01)) : 0;
    const computedHTG = Math.round(previewNetDOP * dopToHtgRate);
    const serviceInfo = SERVICES_LIST.find(s => s.id === selectedService);
    const isNoBeneficiaryOperator = ['digicel', 'claro', 'altice', 'natcom'].includes(selectedService);

    // DEDICATED STREAMLINED ZELLE INTAKE SCREEN
    if (selectedService === 'zelle') {
      const usdToDop = (usdToHtgRate && usdToHtgRate <= 100)
      ? usdToHtgRate
      : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);
      const numUSD = parseFloat(zelleAmountUSD) || 0;
      const feeUSD = Math.round(numUSD * 0.005 * 100) / 100;
      const netUSD = Math.max(0, numUSD - feeUSD);
      const netPayoutDOP = Math.round(netUSD * usdToDop);
      const displayPayout = zellePayoutCurrency === 'DOP' ? `${netPayoutDOP.toLocaleString()} DOP` : `${netUSD.toFixed(2)} USD`;

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 space-y-4 animate-in fade-in">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md -mx-4 -mt-4 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setSelectedService(null);
                setFeedback(null);
              }}
              className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 cursor-pointer"
              title="Retour"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                $
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Zelle Pay (USA)
              </h3>
            </div>

            <div className="w-9" />
          </header>

          {/* Feedback error */}
          {feedback && feedback.type === 'error' && (
            <div className="p-3.5 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-200" />
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="underline text-white font-bold ml-2">Fermer</button>
            </div>
          )}

          {/* ZELLE FORM */}
          <form onSubmit={handleZelleSubmit} className="space-y-4">
            
            {/* 1. PHOTO DE PREUVE ZELLE (OBLIGATOIRE & BIEN VISIBLE EN GRAND) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>{t('1. Photo Preuve de Zelle (Obligatoire) *')}</span>
                </label>
                {zelleProofImage && (
                  <button
                    type="button"
                    onClick={() => setZelleProofImage(null)}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('Supprimer')}</span>
                  </button>
                )}
              </div>

              {zelleProofImage ? (
                <div className="space-y-2">
                  <div 
                    className="relative rounded-2xl overflow-hidden border-2 border-purple-300 dark:border-purple-800 bg-slate-950 flex items-center justify-center p-2 cursor-pointer shadow-md"
                    onClick={() => setZelleLightboxUrl(zelleProofImage)}
                  >
                    <img
                      src={zelleProofImage}
                      alt="Preuve Zelle"
                      className="max-h-72 w-full object-contain rounded-xl"
                    />
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <Eye className="w-3 h-3" />
                      <span>{t('Agrandir')}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-center">
                    {t('✓ Photo de preuve attachée avec succès !')}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-purple-900 dark:text-purple-200 block">
                      {t('Preuve de Virement Zelle')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {t("Prenez une photo de l'écran du client ou importez une capture")}
                    </span>
                  </div>

                  {/* 2 Boutons distincts : Prendre une Photo OU Importer une Image */}
                  <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs mt-1">
                    <button
                      type="button"
                      onClick={() => zelleCameraInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('Prendre Photo')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => zelleFileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 hover:bg-purple-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>{t('Importer Image')}</span>
                    </button>
                  </div>

                  {/* Inputs cachés : un avec caméra activée et un pour galerie/fichiers */}
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
                </div>
              )}
            </div>

            {/* 2. SOMME ENVOYÉE PAR ZELLE (USD) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>{t('2. Somme envoyée par Zelle ($ USD) *')}</span>
                </label>
                <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                  1 USD = {usdToDop.toFixed(2)} DOP
                </span>
              </div>

              <div className="relative flex items-center bg-slate-100/90 dark:bg-slate-950 rounded-2xl p-2 border border-slate-200 dark:border-slate-800">
                <span className="text-xl font-black font-mono text-purple-600 pl-3">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  required
                  placeholder={t('Ex : 500')}
                  value={zelleAmountUSD}
                  onChange={(e) => setZelleAmountUSD(e.target.value)}
                  className="w-full bg-transparent font-mono text-2xl font-black text-slate-900 dark:text-white px-3 py-2 focus:outline-none"
                />
                <span className="text-xs font-black font-mono text-slate-400 pr-3">USD</span>
              </div>

              {/* Presets USD */}
              <div className="grid grid-cols-5 gap-1.5">
                {[50, 100, 200, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setZelleAmountUSD(preset.toString())}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                      numUSD === preset
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Devise de remise au client */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {t('Devise de retrait souhaitée par le client :')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setZellePayoutCurrency('DOP')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      zellePayoutCurrency === 'DOP'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🇩🇴 Pesos (DOP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setZellePayoutCurrency('USD')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      zellePayoutCurrency === 'USD'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🇺🇸 Dollars (USD)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* 3. VÉRIFICATION SÉCURISÉE & MONTANT MASQUÉ EN ATTENTE DE VALIDATION ADMIN */}
            <div className="bg-purple-950 text-white p-5 rounded-3xl space-y-3 shadow-md border border-purple-900">
              <div className="flex items-center justify-between text-xs text-purple-300">
                <span className="font-bold uppercase tracking-wider">{t("Vérification Requise par l'Admin")}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-900/60 border border-purple-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t('Montant net à décaisser masqué')}</span>
                </div>
                <p className="text-[11px] text-purple-200/90 leading-relaxed pl-6">
                  {t('Ne donnez aucun argent au client avant que l\'Admin ait validé !')}
                </p>
                <div className="mt-1 pl-6">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                    ⛔ {t('Ne remettez aucun argent au client avant validation')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-purple-300 pt-1 border-t border-purple-800/80">
                <span>{t('Virement Zelle déclaré :')}</span>
                <span className="font-bold text-white font-mono">${numUSD.toFixed(2)} USD</span>
              </div>
            </div>

            {/* BOUTON VALIDATION */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t('Valider & Envoyer pour Vérification Admin')}</span>
            </button>
          </form>

          {/* Full Screen Lightbox if requested */}
          <ImageViewerModal
            isOpen={Boolean(zelleLightboxUrl)}
            imageUrl={zelleLightboxUrl}
            title="Preuve Zelle (Capture)"
            onClose={() => setZelleLightboxUrl(null)}
          />
        </div>
      );
    }

    // Filter recent unique beneficiaries from previous cashier transactions
    const recentBeneficiaries = Array.from(
      new Map(
        myTxs.map(t => [t.receiverPhone, { name: t.receiverName, phone: t.receiverPhone }])
      ).values()
    ).slice(0, 4);

    // SUCCESS RECAP PAGE (After confirming transaction)
    if (lastCreatedTx) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-56 flex flex-col justify-between animate-in fade-in">
          
          {/* Header */}
          <div className="flex items-center justify-center py-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('Transfert Effectué')}
            </h3>
          </div>

          {/* Main Success Card */}
          <div className="my-auto space-y-5 pb-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-lg">
              
              {/* Green Animated Checkmark Icon with Clock badge */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
              </div>

              {/* Title & Success Message */}
              <div>
                <span className="text-[10px] font-mono font-black px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 uppercase tracking-wider inline-flex items-center gap-1 border border-orange-200 dark:border-orange-800">
                  <Clock className="w-3 h-3 text-orange-600" />
                  Réf: {lastCreatedTx.referenceNumber} • En attente de preuve
                </span>

                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-3">
                  {t('Transfert envoyé !')}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed bg-orange-500/10 dark:bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20 text-orange-900 dark:text-orange-200">
                  {['digicel', 'claro', 'altice', 'natcom'].includes(lastCreatedTx.operator) ? (
                    <>La recharge de <strong className="font-black text-slate-900 dark:text-white">{lastCreatedTx.amountHTG.toLocaleString()} HTG</strong> pour le numéro <span className="font-mono font-bold">{lastCreatedTx.receiverPhone}</span> a été envoyée. </>
                  ) : (
                    <>Le transfert de <strong className="font-black text-slate-900 dark:text-white">{lastCreatedTx.amountHTG.toLocaleString()} HTG</strong> pour <strong className="font-bold text-slate-900 dark:text-white">{lastCreatedTx.receiverName}</strong> (<span className="font-mono font-bold">{lastCreatedTx.receiverPhone}</span>) a été envoyé. </>
                  )}
                  <span className="block mt-1 font-semibold">{t('En attente de l\'agent Haïti')}</span>
                </p>
              </div>

              {/* Transaction Detail Card */}
              <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 space-y-2.5 text-xs text-left border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('Statut')}</span>
                  <span className="font-bold text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-orange-600" />
                    {t('En attente de l\'agent Haïti')}
                  </span>
                </div>
                {!['digicel', 'claro', 'altice', 'natcom'].includes(lastCreatedTx.operator) && lastCreatedTx.receiverName && !lastCreatedTx.receiverName.startsWith('Recharge') && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{t('Bénéficiaire')}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{lastCreatedTx.receiverName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{['digicel', 'claro', 'altice', 'natcom'].includes(lastCreatedTx.operator) ? t('Numéro de téléphone') : t('Téléphone')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{lastCreatedTx.receiverPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('Service')}</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{lastCreatedTx.operator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('Montant Brut Encaissé')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{lastCreatedTx.amountDOP.toLocaleString()} DOP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('Frais de Service (0.5%) déduits')}</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">-{lastCreatedTx.feeDOP || Math.max(1, Math.round(lastCreatedTx.amountDOP * 0.005))} DOP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('Montant Net Converti')}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{Math.max(0, lastCreatedTx.amountDOP - (lastCreatedTx.feeDOP || Math.max(1, Math.round(lastCreatedTx.amountDOP * 0.005)))).toLocaleString()} DOP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('Commission (1%)')}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+{lastCreatedTx.commissionDOP || Math.max(1, Math.round(lastCreatedTx.amountDOP * 0.01))} DOP</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">{t('Montant Net Reçu (Haïti)')}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{lastCreatedTx.amountHTG.toLocaleString()} HTG</span>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Bottom Actions Container */}
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
            <div className="max-w-md mx-auto space-y-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptTx(lastCreatedTx)}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{t("Reçu (PDF / Partager)")}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLastCreatedTx(null);
                    setShowConfirmation(false);
                    setSenderName('');
                    setSenderPhone('');
                    setReceiverName('');
                    setReceiverPhone('');
                    setAmountDOP('5000');
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/20 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t("Nouveau Transfert")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLastCreatedTx(null);
                    setSelectedService(null);
                    setShowConfirmation(false);
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>{t("Accueil")}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      );
    }

    // CONFIRMATION RECAP PAGE
    if (showConfirmation) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-32 space-y-4 animate-in fade-in">
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => setShowConfirmation(false)}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 cursor-pointer"
              title={t('Retour')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('Confirmation du Transfert')}
            </h3>

            <div className="w-9" />
          </div>

          {/* Main Confirmation Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm">
            
            {/* Service Title */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-slate-200 dark:border-slate-800 font-black flex items-center justify-center text-lg overflow-hidden shadow-2xs">
                <img src={getOperatorLogo(selectedService)} alt={selectedService} className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('Service')}</span>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {serviceInfo?.name || selectedService.toUpperCase()}
                </h4>
              </div>
            </div>

            {/* Visual Amount Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('Montant Envoyé')}</span>
                <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {numAmountDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/20">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block">{t('Montant Recevant')}</span>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {computedHTG.toLocaleString()} <span className="text-xs font-bold text-blue-500">HTG</span>
                </p>
              </div>
            </div>

            {/* Info Table */}
            <div className="space-y-2.5 text-xs pt-1">
              {!isNoBeneficiaryOperator && receiverName && (
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                  <span className="text-slate-500 font-medium">{t('Bénéficiaire')}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{receiverName}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">{isNoBeneficiaryOperator ? t('Numéro de téléphone') : t('Téléphone')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{receiverPhone}</span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">{t('Frais de Service (0.5%) déduits')}</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  -{previewFeeDOP} DOP (Net converti: {previewNetDOP.toLocaleString()} DOP)
                </span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">{t('Commission (1%)')}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{previewCommDOP} DOP
                </span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">{t('Taux du jour')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  100 DOP = {Math.round(dopToHtgRate * 100)} HTG
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              {t('Vérifiez attentivement les informations ci-dessus avant de valider.')}
            </p>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto space-y-2">
              <button
                type="button"
                onClick={executeTransaction}
                className="w-full py-4 rounded-full font-black text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('Valider')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center block"
              >
                {t('Modifier')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 space-y-4 animate-in fade-in">
        
        {/* Top Header Bar with Centered Title (Sticky Navbar en mode Mobile) */}
        <header className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md -mx-4 -mt-4 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setSelectedService(null);
              setFeedback(null);
              setLastCreatedTx(null);
            }}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 cursor-pointer"
            title="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {serviceInfo?.name || selectedService.toUpperCase()}
          </h3>

          <div className="w-9" />
        </header>

        {/* Feedback Error Banner */}
        {feedback && feedback.type === 'error' && (
          <div className="p-3.5 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-200" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="underline text-white font-bold ml-2">Fermer</button>
          </div>
        )}

        {/* Main Form Card (Matching the Reference Screenshot) */}
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
            
              {/* Phone Number Field (Numero de telephone - Pavé numérique activé) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400">
                  {t('Numero de telephone')}
                </label>
                <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-800">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    placeholder="509XXXXXX"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-transparent font-mono text-base font-black text-slate-900 dark:text-white px-3 py-2 focus:outline-none"
                  />
                
                {receiverPhone && (
                  <button
                    type="button"
                    onClick={() => setReceiverPhone('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                <div className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center ml-1">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Beneficiary Name Field - Hidden for digicel, claro, altice, natcom */}
            {!isNoBeneficiaryOperator && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400">
                  {t('Nom du Bénéficiaire *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('Nom complet du bénéficiaire')}
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-slate-100/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white px-3.5 py-2.5 rounded-2xl focus:outline-none"
                />
              </div>
            )}

            {/* Amount Field (Montant en DOP) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400">
                {t('Montant')}
              </label>
              <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-800">
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder={t('Montant DOP')}
                  value={amountDOP}
                  onChange={(e) => setAmountDOP(e.target.value)}
                  className="w-full bg-transparent font-mono text-xl font-black text-slate-900 dark:text-white px-3 py-2 focus:outline-none"
                />
                <span className="text-xs font-black font-mono text-slate-400 pr-3">DOP</span>
              </div>
            </div>

            {/* Taux Section (Sans fond, sans somme de conversion) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-1 py-0.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold">{t('Taux du jour :')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                100 DOP = {Math.round(dopToHtgRate * 100)} HTG
              </span>
            </div>

            {/* Preset Amount Buttons (Grid 3x2 matching screenshot) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[1000, 2000, 5000, 10000, 15000, 20000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountDOP(preset.toString())}
                  className={`py-3.5 rounded-2xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                    numAmountDOP === preset
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100/90 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80'
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>

          </div>

          {/* Bottom Card: Beneficiaire recent */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                {t('Beneficiaire recent')}
              </h4>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>{t('Voir Tout')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vertical list of recent beneficiaries (l'un en dessous de l'autre, une ligne par bénéficiaire) */}
            <div className="flex flex-col space-y-2">
              {recentBeneficiaries.length > 0 ? (
                recentBeneficiaries.map((b, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!isNoBeneficiaryOperator) setReceiverName(b.name);
                      setReceiverPhone(b.phone);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 text-left hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {b.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {b.phone}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {t('Sélectionner')}
                    </span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400 py-1">{t('Aucun bénéficiaire récent')}</span>
              )}
            </div>
          </div>

          {/* Bottom Sticky Action Button (Continuez) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <button
                type="submit"
                disabled={isOperatorLocked}
                className={`w-full py-4 rounded-full font-black text-sm text-white transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  isOperatorLocked
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-600/30'
                }`}
              >
                <span>{t('Continuez')}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    );
  }

  // DEFAULT MOBILE AGENT HOME VIEW (matching the provided screenshot structure)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-24 space-y-5 animate-in fade-in">
      
      {/* Feedback Alert Banner */}
      {feedback && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
          feedback.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
        }`}>
          <span className="pr-2">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-80 flex-shrink-0 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER: Agent Avatar, Greeting, Notifications & Icons (Sticky Navbar en mode Mobile) */}
      {!isDesktopNavRole && (
        <header className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md -mx-4 -mt-4 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Agent Avatar */}
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white dark:ring-slate-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md ring-2 ring-white dark:ring-slate-800">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block leading-none">
                {isGestionnaire ? t('Gestionnaire Numérique') : isAgentRD ? t('Agent Comptoir R.D.') : isAgentHaiti ? t('Agent Terrain Haïti') : t('hello')}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
                {currentUser.name}
              </h3>
            </div>
          </div>

          {/* Top Right Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Language Switcher Globe */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-black"
                title={t('Changer de langue')}
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{currentLang}</span>
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                          currentLang === lang.code
                            ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {currentLang === lang.code && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Trigger */}
            <button 
              onClick={openSearch}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-slate-50"
              title={t('Rechercher')}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell with Red Badge */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer relative"
                title={t('nav_notifications')}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-75">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 sm:hidden"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                            {t('Notifications')}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isAgentRD ? t('Agent Comptoir R.D.') : isGestionnaire ? t('Gestionnaire Numérique') : currentUser.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => markAllNotificationsAsRead(notifications.map(n => n.id))}
                            className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            {t('Tout lire')}
                          </button>
                        )}
                        <button 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {unreadNotifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">{t('Aucune notification')}</p>
                      ) : (
                        unreadNotifications.map((notif) => {
                          const IconComp = notif.icon;
                          return (
                            <div 
                              key={notif.id}
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                if (notif.tx) {
                                  const freshTx = transactions.find((t) => t.id === notif.tx!.id) || notif.tx;
                                  setSelectedReceiptTx(freshTx);
                                }
                                setIsNotificationsOpen(false);
                              }}
                              className="flex items-start gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer border bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/50 hover:bg-rose-50/80"
                            >
                              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0 text-xs">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                  </div>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          setActiveTab('notifications');
                        }}
                        className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                      >
                        <span>{t("Voir toutes les notifications")}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 shadow-2xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title={t("Se déconnecter")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* 2. MAIN AGENT CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-white p-6 shadow-xl border border-slate-800/80">
        
        {/* Subtle Brand Logo Watermark */}
        <div className="absolute -bottom-6 -right-6 w-36 h-36 opacity-15 pointer-events-none select-none">
          <img src="/images/logo1.png?v=2" alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">
                {isGestionnaire ? t("Flux numérique cette semaine") : t("Montant des transactions cette semaine")}
              </span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
                title={showBalance ? t("Masquer le montant") : t("Afficher le montant")}
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-slate-200" />
                ) : (
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowBalance(true);
                setActiveTab('history');
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer focus:outline-none flex items-center justify-center"
              title={t("Voir l'historique financier et les transactions", "Voir l'historique financier et les transactions")}
              aria-label={t("Voir l'historique financier et les transactions", "Voir l'historique financier et les transactions")}
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm font-mono font-bold text-emerald-400">DOP</span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {showBalance ? displayTotalDOP.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '••••••••'}
            </h2>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-0.5">
            <span>{weeklyCount} {weeklyCount > 1 ? t("transferts réalisés cette semaine") : t("transfert réalisé cette semaine")}</span>
            {weeklyCount > 0 && showBalance && (
              <span className="text-emerald-400/90 font-mono">≈ {displayTotalHTG.toLocaleString('fr-FR')} HTG</span>
            )}
          </div>

          {/* Zelle Pay Stat Row (Admin / Zelle) */}
          {(isAdmin || zelleTotalDOP > 0) && (
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🇺🇸</span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-purple-300 tracking-wider block">
                    Zelle Pay (USD)
                  </span>
                  <p className="text-base font-black font-mono text-purple-200">
                    {showBalance ? `$${zelleTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` : '••••••••'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  {t("Équivalent DOP")}
                </span>
                <span className="text-xs font-bold font-mono text-slate-300">
                  {showBalance ? `${zelleTotalDOP.toLocaleString('fr-FR')} DOP` : '••••'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Banner Réception Haïti (MonCash / Natcash) -> Retrait RD */}
      <div 
        onClick={() => {
          setIsHaitiInboundActive(true);
          setFeedback(null);
        }}
        className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-sm text-white">{t('Réception Haïti (MonCash / Natcash)', 'Réception Haïti (MonCash / Natcash)')}</p>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white/25 text-white uppercase">
                {t('Dépôt', 'Dépôt')}
              </span>
            </div>
            <p className="text-[11px] text-amber-100 font-medium">{t('Preuve photo & versement de Pesos au guichet', 'Preuve photo & versement de Pesos au guichet')}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80" />
      </div>

      {/* 3. TOP SERVICES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            {t("Top services")}
          </h4>
          <span className="text-[11px] font-bold text-slate-400">
            {t("Cliquez pour transférer")}
          </span>
        </div>

        {/* Services Grid (3 columns x 2 rows = 6 items) */}
        <div className="grid grid-cols-3 gap-2.5">
          {SERVICES_LIST.map((srv) => {
            const IconComponent = srv.icon;
            const isForbiddenForGestionnaire = isGestionnaire && (srv.id === 'natcash' || srv.id === 'natcom');
            
            return (
              <button
                key={srv.id}
                onClick={() => {
                  if (isForbiddenForGestionnaire) {
                    setFeedback({
                      type: 'error',
                      message: 'Les transferts Natcash et Natcom sont réservés aux agents d\'exécution.'
                    });
                    return;
                  }
                  setSelectedService(srv.id as OperatorCode);
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer h-24 group relative ${
                  isForbiddenForGestionnaire
                    ? 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/40 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {isForbiddenForGestionnaire && (
                  <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-slate-500 text-white shadow-xs" title="Restreint pour le Gestionnaire">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}

                {/* Service Logo inside soft pill */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 overflow-hidden bg-white p-1 shadow-2xs border-slate-200 dark:border-slate-800">
                  <img src={getOperatorLogo(srv.id as string)} alt={srv.name} className="w-full h-full object-contain rounded-xl" />
                </div>

                {/* Service Name Label */}
                <div className="text-center w-full min-w-0">
                  <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 block leading-tight truncate">
                    {srv.name}
                  </span>
                  {isForbiddenForGestionnaire && (
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block leading-none mt-0.5">
                      🔒 Réservé HT
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. QUICK TRANSFER SECTION REMOVED AS REQUESTED BY USER */}

      {/* 5. RECENT TRANSACTIONS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            {t("Transactions récentes")}
          </h4>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{t("Voir tout")}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Recent Transactions Cards */}
        <div className="space-y-2">
          {recentTxs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("Aucune transaction récente")}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {t("Les transferts que vous effectuez apparaîtront ici.")}
              </p>
            </div>
          ) : (
            recentTxs.map((tx) => {
              const isCompleted = tx.status === 'completed';
              const isZelleTx = tx.operator === 'zelle';
              const isHaitiInboundTx = tx.serviceType === 'haiti_inbound_cash';

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    if (isHaitiInboundTx) {
                      setSelectedHaitiInboundTx(tx);
                    } else if (isZelleTx) {
                      setSelectedZellePayoutTx(tx);
                    } else {
                      setSelectedReceiptTx(tx);
                    }
                  }}
                  className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isHaitiInboundTx
                      ? 'border-amber-300 dark:border-amber-800/80 hover:border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                      : isZelleTx
                      ? 'border-purple-200 dark:border-purple-800/80 hover:border-purple-400 bg-purple-50/20'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left: Operator Icon & Transaction Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <OperatorBadge operator={tx.operator} size="sm" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {isHaitiInboundTx
                            ? `Dépôt Haïti (${(tx.amountHTG || 0).toLocaleString()} HTG)`
                            : isZelleTx
                            ? `Virement Zelle ($${tx.amountUSD || 0} USD)`
                            : tx.receiverName}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono block">
                        {tx.referenceNumber} • {isHaitiInboundTx ? (tx.operator === 'natcash' ? 'Natcash (0 Frais)' : 'MonCash (0 Frais)') : isZelleTx ? (tx.senderName || 'Client Zelle') : tx.receiverPhone}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amounts & Receipt Action */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-xs block">
                      {isHaitiInboundTx
                        ? (tx.haitiInboundStatus === 'approved' || isCompleted
                            ? `${(tx.amountDOP || tx.netPayoutAmount || 0).toLocaleString()} DOP`
                            : `${(tx.amountHTG || 0).toLocaleString()} HTG`)
                        : isZelleTx 
                        ? (tx.zelleStatus === 'approved' || isCompleted 
                            ? `${(tx.netPayoutAmount || 0).toLocaleString()} ${tx.netPayoutCurrency || 'DOP'}` 
                            : `$${tx.amountUSD || 0} USD`)
                        : `${tx.amountDOP.toLocaleString()} DOP`}
                    </span>
                    
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      {isHaitiInboundTx ? (
                        isCompleted ? (
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                            ✅ Pesos Remis
                          </span>
                        ) : tx.haitiInboundStatus === 'approved' ? (
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded animate-pulse">
                            💵 Prêt Versement
                          </span>
                        ) : tx.haitiInboundStatus === 'rejected' || tx.status === 'cancelled' ? (
                          <span className="text-[9px] font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded">
                            ❌ Refusé Admin
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded animate-pulse">
                            ⏳ Vérif. Admin
                          </span>
                        )
                      ) : isZelleTx ? (
                        tx.zelleStatus === 'approved' || isCompleted ? (
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                            ✅ Zelle Validé
                          </span>
                        ) : tx.zelleStatus === 'rejected' || tx.status === 'cancelled' ? (
                          <span className="text-[9px] font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded">
                            ❌ Zelle Refusé
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded animate-pulse">
                            ⏳ Attente Admin
                          </span>
                        )
                      ) : isCompleted ? (
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                          {t("Clôturé")}
                        </span>
                      ) : tx.status === 'cancelled' ? (
                        <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                          {t("Annulé")}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-900/50">
                          {t("En attente")}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isHaitiInboundTx) {
                            setSelectedHaitiInboundTx(tx);
                          } else if (isZelleTx) {
                            setSelectedZellePayoutTx(tx);
                          } else {
                            setSelectedReceiptTx(tx);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={isHaitiInboundTx ? "Voir Fiche Retrait Haïti" : isZelleTx ? "Voir Fiche Validation Zelle" : t("Télécharger ou partager le reçu PDF")}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Certified Zelle Payout Modal */}
      <ZellePayoutModal
        tx={selectedZellePayoutTx}
        isOpen={Boolean(selectedZellePayoutTx)}
        onClose={() => setSelectedZellePayoutTx(null)}
      />

      {/* Certified Haiti Inbound Payout Modal */}
      <HaitiInboundPayoutModal
        tx={selectedHaitiInboundTx}
        onClose={() => setSelectedHaitiInboundTx(null)}
      />
    </div>
  );
};
