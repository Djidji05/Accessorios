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
  Printer, 
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
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode, ServiceType, Transaction } from '../types';
import { OperatorBadge } from './OperatorBadge';
import { BottomNavBar } from './BottomNavBar';
import { getOperatorLogo } from '../utils/operatorLogos';

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
    createTransaction, 
    killSwitchList, 
    setSelectedReceiptTx,
    setActiveTab,
    openSearch,
    logout,
    selectedService,
    setSelectedService
  } = useApp();

  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Form states for transfer entry page
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [amountDOP, setAmountDOP] = useState<string>('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

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
      let title = `Transfert ${tx.status === 'completed' ? 'Validé' : tx.status === 'cancelled' ? 'Annulé' : 'En cours'}`;

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
        message: `${tx.operator.toUpperCase()} • ${tx.amountHTG.toLocaleString()} HTG pour ${tx.receiverName} (${tx.receiverPhone})`,
        time: 'Récent',
        icon,
        color,
        tx
      });
    });

    // Exchange Rate notification
    list.push({
      id: 'notif_rate',
      title: 'Taux du Jour',
      message: `100 Pesos (DOP) = ${Math.round(dopToHtgRate * 100)} Gourdes (HTG)`,
      time: 'Aujourd\'hui',
      icon: DollarSign,
      color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800'
    });

    // Security / KillSwitch alert
    const activeKillCount = killSwitchList.filter(k => !k.enabled).length;
    if (activeKillCount > 0) {
      list.push({
        id: 'notif_ks',
        title: 'Alerte Opérateurs',
        message: `${activeKillCount} service(s) temporairement suspendu(s)`,
        time: 'Actif',
        icon: Lock,
        color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
      });
    }

    return list;
  }, [transactions, currentUser, dopToHtgRate, killSwitchList, isAdmin, isGestionnaire, isAgentRD, isAgentHaiti, isMyTransaction]);

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

    if (!receiverPhone || !receiverName) {
      setFeedback({ type: 'error', message: 'Veuillez remplir le numéro de téléphone et le nom du bénéficiaire.' });
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
    const feeDOP = Math.round(numAmountDOP * 0.03);
    const commissionDOP = Math.round(numAmountDOP * 0.01);

    const result = createTransaction({
      senderName: senderName || currentUser.name || 'Client Comptoir',
      senderPhone: senderPhone || '+1 809 000 0000',
      receiverName: receiverName || 'Bénéficiaire Mobile',
      receiverPhone,
      operator: selectedService,
      serviceType: serviceType || 'cash_out',
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

  // IF A SERVICE IS CLICKED: Render the Transfer Form Page, Confirmation Page, or Success Page
  if (selectedService) {
    const ksStatus = killSwitchList.find(k => k.operator === selectedService);
    const isOperatorLocked = ksStatus && !ksStatus.enabled;
    const numAmountDOP = parseFloat(amountDOP) || 0;
    const computedHTG = Math.round(numAmountDOP * dopToHtgRate);
    const serviceInfo = SERVICES_LIST.find(s => s.id === selectedService);

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
              Transfert Effectué
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
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
              </div>

              {/* Title & Success Message */}
              <div>
                <span className="text-[10px] font-mono font-black px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 uppercase tracking-wider inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Réf: {lastCreatedTx.referenceNumber} • En attente de preuve
                </span>

                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-3">
                  Transfert envoyé !
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed bg-amber-500/10 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-800 dark:text-amber-300">
                  Le transfert de <strong className="font-black text-slate-900 dark:text-white">{lastCreatedTx.amountHTG.toLocaleString()} HTG</strong> pour <strong className="font-bold text-slate-900 dark:text-white">{lastCreatedTx.receiverName}</strong> (<span className="font-mono font-bold">{lastCreatedTx.receiverPhone}</span>) a été envoyé. 
                  <span className="block mt-1 font-semibold">Nous sommes en attente de l'agent Haïti pour la preuve.</span>
                </p>
              </div>

              {/* Transaction Detail Card */}
              <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 space-y-2.5 text-xs text-left border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Statut</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    En attente de l'agent Haïti
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Bénéficiaire</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{lastCreatedTx.receiverName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Téléphone</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{lastCreatedTx.receiverPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Service</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{lastCreatedTx.operator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Montant Envoyé</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{lastCreatedTx.amountDOP.toLocaleString()} DOP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Commission Admin</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+{lastCreatedTx.commissionDOP || Math.round(lastCreatedTx.amountDOP * 0.01)} DOP</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Montant Reçu</span>
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
                <span>Reçu (PDF / Partager)</span>
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
                  <span>Nouveau Transfert</span>
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
                  <span>Accueil</span>
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
              title="Retour"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Confirmation du Transfert
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service</span>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {serviceInfo?.name || selectedService.toUpperCase()}
                </h4>
              </div>
            </div>

            {/* Visual Amount Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Montant Envoyé</span>
                <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {numAmountDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/20">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Montant Recevant</span>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {computedHTG.toLocaleString()} <span className="text-xs font-bold text-blue-500">HTG</span>
                </p>
              </div>
            </div>

            {/* Info Table */}
            <div className="space-y-2.5 text-xs pt-1">
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">Bénéficiaire</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{receiverName}</span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">Téléphone</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{receiverPhone}</span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-slate-500 font-medium">Taux du jour</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  100 DOP = {Math.round(dopToHtgRate * 100)} HTG
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Vérifiez attentivement les informations ci-dessus avant de valider.
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
                <span>Confirmer & Effectuer le Transfert</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center block"
              >
                Modifier les informations
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 space-y-4 animate-in fade-in">
        
        {/* Top Header Bar with Centered Title */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => {
              setSelectedService(null);
              setFeedback(null);
              setLastCreatedTx(null);
            }}
            className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 cursor-pointer"
            title="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {serviceInfo?.name || selectedService.toUpperCase()}
          </h3>

          <div className="w-9" />
        </div>

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
            
            {/* Phone Number Field (Numero de telephone) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400">
                Numero de telephone
              </label>
              <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-800">
                <input
                  type="text"
                  required
                  placeholder="509XXXXXX"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
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

            {/* Beneficiary Name Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400">
                Nom du Bénéficiaire *
              </label>
              <input
                type="text"
                required
                placeholder="Nom complet du bénéficiaire"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white px-3.5 py-2.5 rounded-2xl focus:outline-none"
              />
            </div>

            {/* Amount Field (Montant en DOP) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400">
                Montant
              </label>
              <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-800">
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="Montant DOP"
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
              <span className="font-semibold">Taux du jour :</span>
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
                Beneficiaire recent
              </h4>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>Voir Tout</span>
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
                      setReceiverName(b.name);
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
                      Sélectionner
                    </span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400 py-1">Aucun bénéficiaire récent</span>
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
                <span>Continuez</span>
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

      {/* 1. TOP HEADER: Agent Avatar, Greeting, Notifications & Icons (Hidden for Admin & Gestionnaire) */}
      {!isDesktopNavRole && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Agent Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md ring-2 ring-white dark:ring-slate-800">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block leading-none">
                {isGestionnaire ? 'Gestionnaire Numérique' : isAgentRD ? 'Agent Comptoir R.D.' : isAgentHaiti ? 'Agent Terrain Haïti' : 'Hello,'}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
                {currentUser.name}
              </h3>
            </div>
          </div>

          {/* Top Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button 
              onClick={openSearch}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-slate-50"
              title="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell with Red Badge */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
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
                            Notifications
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isAgentRD ? 'Compte Agent RD' : currentUser.role}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((notif) => {
                        const IconComp = notif.icon;
                        return (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              if (notif.tx) setSelectedReceiptTx(notif.tx);
                              setIsNotificationsOpen(false);
                            }}
                            className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-800/80"
                          >
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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
                        <span>Voir toutes les notifications</span>
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
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN AGENT CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-white p-6 shadow-xl border border-slate-800/80">
        
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">
                {isGestionnaire ? "Flux numérique cette semaine" : "Montant des transactions cette semaine"}
              </span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
                title={showBalance ? "Masquer le montant" : "Afficher le montant"}
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-slate-200" />
                ) : (
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            </div>

            <div className="p-1.5 rounded-xl bg-white/10 text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm font-mono font-bold text-emerald-400">DOP</span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {showBalance ? displayTotalDOP.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '••••••••'}
            </h2>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-0.5">
            <span>{weeklyCount} transfert{weeklyCount > 1 ? 's' : ''} réalisé{weeklyCount > 1 ? 's' : ''} cette semaine</span>
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
                  Équivalent DOP
                </span>
                <span className="text-xs font-bold font-mono text-slate-300">
                  {showBalance ? `${zelleTotalDOP.toLocaleString('fr-FR')} DOP` : '••••'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* 3. TOP SERVICES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            Top services
          </h4>
          <span className="text-[11px] font-bold text-slate-400">
            Cliquez pour transférer
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
            Recent transactions
          </h4>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Recent Transactions Cards */}
        <div className="space-y-2">
          {recentTxs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Aucune transaction récente
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Les transferts que vous effectuez apparaîtront ici.
              </p>
            </div>
          ) : (
            recentTxs.map((tx) => {
              const isCompleted = tx.status === 'completed';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Left: Operator Icon & Transaction Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <OperatorBadge operator={tx.operator} size="sm" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {tx.receiverName}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono block">
                        {tx.referenceNumber} • {tx.receiverPhone}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amounts & Receipt Action */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-xs block">
                      {tx.amountDOP.toLocaleString()} DOP
                    </span>
                    
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      {isCompleted ? (
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                          Clôturé
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 px-1.5 py-0.5 rounded">
                          En cours
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Télécharger ou partager le reçu PDF"
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
    </div>
  );
};
