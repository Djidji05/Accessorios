import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCcw, 
  Send, 
  Smartphone, 
  Wifi, 
  Radio, 
  PhoneCall, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Landmark, 
  PlusCircle, 
  ArrowRight, 
  Search, 
  Bell, 
  Printer, 
  X, 
  Edit3, 
  Check, 
  ChevronRight, 
  Upload,
  Camera,
  FileText,
  AlertCircle,
  Eye,
  ShieldCheck,
  Copy,
  Plus,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode, ServiceType, Transaction } from '../types';
import { OperatorBadge } from './OperatorBadge';
import { getOperatorLogo } from '../utils/operatorLogos';
import { compressImage } from '../utils/imageCompressor';

const OPERATORS_LIST: { 
  id: OperatorCode; 
  name: string; 
  country: string; 
  symbol: string; 
  icon: React.ElementType; 
  badgeBg: string; 
  tagText: string;
}[] = [
  { id: 'moncash', name: 'MonCash', country: '🇭🇹', symbol: 'MC', icon: Send, badgeBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-900/40', tagText: 'Portefeuille Haïti' },
  { id: 'natcash', name: 'Natcash', country: '🇭🇹', symbol: 'NC', icon: Smartphone, badgeBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/40', tagText: 'Mobile Money Haïti' },
  { id: 'digicel', name: 'Digicel', country: '🇭🇹', symbol: 'DIGI', icon: Wifi, badgeBg: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-900/40', tagText: 'Recharge & Data HT' },
  { id: 'natcom', name: 'Natcom', country: '🇭🇹', symbol: 'NAT', icon: Radio, badgeBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border-sky-200 dark:border-sky-900/40', tagText: 'Telecom & Recharge HT' },
  { id: 'claro', name: 'Claro RD', country: '🇩🇴', symbol: 'CLA', icon: PhoneCall, badgeBg: 'bg-red-600/10 text-red-700 dark:bg-red-600/20 dark:text-red-400 border-red-200 dark:border-red-900/40', tagText: 'Telecom R.D.' },
  { id: 'altice', name: 'Altice RD', country: '🇩🇴', symbol: 'ALT', icon: ShoppingBag, badgeBg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-900/40', tagText: 'Telecom R.D.' },
];

export const MobileGestionnaireHome: React.FC = () => {
  const { 
    currentUser, 
    transactions, 
    accountBalances,
    dopToHtgRate, 
    setDopToHtgRate,
    createTransaction,
    completeTask,
    cancelTransaction,
    setSelectedReceiptTx,
    setActiveTab,
    openSearch
  } = useApp();

  // Filter States for Pending Tasks
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  // Modals States
  const [selectedTxForProof, setSelectedTxForProof] = useState<Transaction | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofNotes, setProofNotes] = useState<string>('');
  const [proofError, setProofError] = useState<string | null>(null);

  // Quick Direct Creation Modal (Client direct au Gestionnaire)
  const [isDirectCreationOpen, setIsDirectCreationOpen] = useState<boolean>(false);
  const [directOperator, setDirectOperator] = useState<OperatorCode>('moncash');
  const [directServiceType, setDirectServiceType] = useState<ServiceType>('transfer');
  const [directSenderName, setDirectSenderName] = useState<string>('');
  const [directSenderPhone, setDirectSenderPhone] = useState<string>('');
  const [directReceiverName, setDirectReceiverName] = useState<string>('');
  const [directReceiverPhone, setDirectReceiverPhone] = useState<string>('');
  const [directAmountDOP, setDirectAmountDOP] = useState<string>('5000');
  const [directProofImage, setDirectProofImage] = useState<string | null>(null);
  const [directProofNotes, setDirectProofNotes] = useState<string>('');
  const [directFormError, setDirectFormError] = useState<string | null>(null);
  const [isSubmittingDirect, setIsSubmittingDirect] = useState<boolean>(false);

  // Rate Editing Modal
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [tempRate, setTempRate] = useState<string>(Math.round(dopToHtgRate * 100).toString());

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered transactions for the Pending / Incoming Task section
  const digitalTransactions = transactions.filter((tx) => {
    // Opérateurs gérés par le gestionnaire : MonCash, Digicel, Claro, Altice, Natcash, Natcom, Zelle
    const isGestionnaireOp = ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom', 'zelle'].includes(tx.operator);
    if (!isGestionnaireOp) return false;

    // Filter by status
    if (statusFilter === 'pending' && (tx.status === 'completed' || tx.status === 'cancelled')) return false;
    if (statusFilter === 'completed' && tx.status !== 'completed') return false;

    // Filter by operator
    if (operatorFilter !== 'all' && tx.operator !== operatorFilter) return false;

    return true;
  });

  const pendingCount = transactions.filter(
    (t) => (t.status === 'pending_routing' || t.status === 'in_progress') && 
           ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom', 'zelle'].includes(t.operator)
  ).length;

  const completedTodayCount = transactions.filter(
    (t) => t.status === 'completed' && 
           ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom', 'zelle'].includes(t.operator)
  ).length;

  // Handle proof upload image for existing pending tx
  const handleProofImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setProofImage(compressed);
      setProofError(null);
    }
  };

  // Handle proof upload image for direct creation
  const handleDirectProofImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setDirectProofImage(compressed);
      setDirectFormError(null);
    }
  };

  // Submit Validation with Proof for Pending Tx
  const handleConfirmValidationWithProof = () => {
    if (!selectedTxForProof) return;

    // RÈGLE STRICTE : Une preuve photo est OBLIGATOIRE !
    if (!proofImage) {
      setProofError('⚠️ ACTION BLOQUÉE : Vous devez impérativement joindre une capture d\'écran ou photo du reçu pour valider la transaction.');
      return;
    }

    const proofSummary = `Reçu certifié par ${currentUser.name} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

    const result = completeTask(selectedTxForProof.id, proofSummary, proofImage || undefined);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: `Transaction ${selectedTxForProof.referenceNumber} validée avec succès avec preuve !`,
      });

      // Open Receipt for immediate printing/viewing
      const updatedTx = {
        ...selectedTxForProof,
        status: 'completed' as const,
        proofNotes: proofSummary,
        proofUrl: proofImage || selectedTxForProof.proofUrl
      };
      setSelectedReceiptTx(updatedTx);

      // Reset modal state
      setSelectedTxForProof(null);
      setProofImage(null);
      setProofNotes('');
      setProofError(null);

      setTimeout(() => setFeedback(null), 5000);
    } else {
      setProofError(result.message || 'Erreur lors de la validation.');
    }
  };

  // Submit Direct Creation + Auto Complete with Proof
  const handleCreateDirectTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectFormError(null);

    const numAmount = parseFloat(directAmountDOP);
    if (isNaN(numAmount) || numAmount <= 0) {
      setDirectFormError('Veuillez saisir un montant DOP valide.');
      return;
    }

    const isNoBeneficiaryOperator = ['digicel', 'claro', 'altice', 'natcom'].includes(directOperator);

    if (!directSenderName.trim() || !directSenderPhone.trim() || (!isNoBeneficiaryOperator && !directReceiverName.trim()) || !directReceiverPhone.trim()) {
      setDirectFormError(isNoBeneficiaryOperator 
        ? 'Veuillez saisir le numéro de téléphone destinataire.' 
        : 'Veuillez remplir toutes les informations client (expéditeur et destinataire).');
      return;
    }

    // RÈGLE STRICTE : Preuve obligatoire pour la saisie du gestionnaire
    if (!directProofImage) {
      setDirectFormError('⚠️ PREUVE REQUISE : Veuillez impérativement fournir la photo ou capture d\'écran du reçu.');
      return;
    }

    setIsSubmittingDirect(true);

    const feeDOP = Math.round(numAmount * 0.015);
    const commDOP = Math.round(numAmount * 0.01);

    const finalReceiverName = isNoBeneficiaryOperator
      ? (directReceiverName.trim() || `Recharge ${directOperator.toUpperCase()}`)
      : directReceiverName.trim();

    const res = createTransaction({
      senderName: directSenderName.trim(),
      senderPhone: directSenderPhone.trim(),
      receiverName: finalReceiverName,
      receiverPhone: directReceiverPhone.trim(),
      operator: directOperator,
      serviceType: isNoBeneficiaryOperator ? 'topup_mobile' : directServiceType,
      amountDOP: numAmount,
      feeDOP,
      commissionDOP: commDOP,
    });

    if (res.success && res.transaction) {
      const createdTx = res.transaction;
      const isHaitiOp = directOperator === 'natcom' || directOperator === 'natcash' || directOperator === 'moncash' || directOperator === 'digicel';

      if (isHaitiOp) {
        setFeedback({
          type: 'success',
          message: `Transaction ${createdTx.referenceNumber} (${directOperator.toUpperCase()}) créée et mise en attente ! Transmise à l'agent en Haïti pour validation avec photo de preuve.`,
        });
        setSelectedReceiptTx(createdTx);
      } else {
        const proofSummary = `[Saisie Directe Gestionnaire] Preuve validée par ${currentUser.name}`;

        completeTask(createdTx.id, proofSummary, directProofImage || undefined);

        const completedTx = {
          ...createdTx,
          status: 'completed' as const,
          proofNotes: proofSummary,
          proofUrl: directProofImage || undefined
        };

        setFeedback({
          type: 'success',
          message: `Opération ${completedTx.referenceNumber} (${directOperator.toUpperCase()}) créée et validée avec succès !`,
        });

        setSelectedReceiptTx(completedTx);
      }

      // Reset form & close modal
      setIsDirectCreationOpen(false);
      setDirectSenderName('');
      setDirectSenderPhone('');
      setDirectReceiverName('');
      setDirectReceiverPhone('');
      setDirectAmountDOP('5000');
      setDirectProofImage(null);
      setDirectProofNotes('');
      setIsSubmittingDirect(false);

      setTimeout(() => setFeedback(null), 5000);
    } else {
      setDirectFormError(res.message || 'Erreur lors de la création de la transaction.');
      setIsSubmittingDirect(false);
    }
  };

  // Quick Rate update submit
  const handleSaveRate = () => {
    const num = parseFloat(tempRate);
    if (!isNaN(num) && num > 0) {
      const newRate = num / 100;
      setDopToHtgRate(newRate);
      setIsRateModalOpen(false);
      setFeedback({
        type: 'success',
        message: `Taux officiel du jour mis à jour : 100 DOP = ${num} HTG`,
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 font-sans">
      
      {/* 1. TOP MOBILE CONTROL HEADER */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 p-0.5 shadow-md">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{currentUser.name}</h1>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Gestionnaire
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Centre d'Action Mobile • RD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openSearch}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
              title="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

      </header>

      {/* FEEDBACK TOAST NOTIFICATION */}
      {feedback && (
        <div className={`mx-4 mt-3 p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80' 
            : 'bg-rose-950/90 text-rose-300 border-rose-700/80'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />}
          <span className="flex-1">{feedback.message}</span>
        </div>
      )}

      <main className="p-4 space-y-6">

        {/* SECTION BOUTONS D'ACTION RAPIDE (SAISIE DIRECTE CLIENT AU GESTIONNAIRE) */}
        <section className="space-y-3">
          {/* Grid of Action Buttons for direct client creation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {OPERATORS_LIST.map((op) => {
              const IconComp = op.icon;
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    setDirectOperator(op.id);
                    setDirectFormError(null);
                    setIsDirectCreationOpen(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 active:scale-98 border border-slate-800/80 hover:border-slate-700 transition-all text-left shadow-sm group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 bg-white p-1 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <img src={getOperatorLogo(op.id)} alt={op.name} className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white truncate group-hover:text-amber-400 transition-colors">
                        {op.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. SECTION: TRANSACTIONS NUMÉRIQUES À VALIDATION AVEC PREUVE */}
        <section className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Transactions en Attente de Preuve
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Preuve Obligatoire
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                En Attente ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Validées ({completedTodayCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Toutes
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Operator Filter Pills */}
              {['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom', 'zelle'].map((opKey) => (
                <button
                  key={opKey}
                  onClick={() => setOperatorFilter(operatorFilter === opKey ? 'all' : opKey)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold capitalize whitespace-nowrap transition-all ${
                    operatorFilter === opKey
                      ? 'bg-slate-100 text-slate-950 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800'
                  }`}
                >
                  {opKey}
                </button>
              ))}
            </div>
          </div>

          {/* List of Pending Transactions requiring proof */}
          <div className="space-y-3">
            {digitalTransactions.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                <p className="text-sm font-bold text-slate-300">Aucune transaction en attente !</p>
                <p className="text-xs text-slate-500">Toutes les opérations numériques du gestionnaire sont traitées.</p>
              </div>
            ) : (
              digitalTransactions.map((tx) => {
                const isPending = tx.status === 'pending_routing' || tx.status === 'in_progress';
                const isCompleted = tx.status === 'completed';

                return (
                  <div 
                    key={tx.id}
                    className={`bg-slate-900 rounded-2xl p-4 border transition-all ${
                      isPending 
                        ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' 
                        : 'border-slate-800/80 opacity-90'
                    }`}
                  >
                    {/* Header line of card */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <OperatorBadge operator={tx.operator} />
                        <span className="text-xs font-mono font-extrabold text-slate-300">
                          {tx.referenceNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Preuve Requise
                          </span>
                        ) : isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Validée
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Annulée
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div className="bg-slate-100 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Expéditeur (R.D.)</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tx.senderName}</p>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                          <span>{tx.senderPhone}</span>
                          <button 
                            onClick={() => copyToClipboard(tx.senderPhone, `sp_${tx.id}`)}
                            className="p-1 hover:text-slate-900 dark:hover:text-white" 
                            title="Copier"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Destinataire (HT)</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tx.receiverName}</p>
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-extrabold mt-0.5">
                          <span>{tx.receiverPhone}</span>
                          <button 
                            onClick={() => copyToClipboard(tx.receiverPhone, `rp_${tx.id}`)}
                            className="p-1 hover:text-slate-900 dark:hover:text-white" 
                            title="Copier Numéro"
                          >
                            <Copy className="w-3 h-3 text-amber-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Amounts Banner */}
                    <div className="bg-slate-100 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Montant DOP Encaissé</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {tx.amountDOP.toLocaleString()} DOP
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">À Transférer HTG</span>
                        <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                          {tx.amountHTG.toLocaleString()} HTG
                        </span>
                      </div>
                    </div>

                    {/* Source & Proof Summary */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3 px-1">
                      <span>Initié par: <strong className="text-slate-700 dark:text-slate-300">{tx.createdByName}</strong></span>
                      {tx.proofNotes && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[150px]">
                          ✓ {tx.proofNotes}
                        </span>
                      )}
                    </div>

                    {/* Action buttons on Card */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTxForProof(tx);
                              setProofImage(null);
                              setProofNotes('');
                              setProofError(null);
                            }}
                            className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Valider avec Preuve</span>
                          </button>

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Motif d\'annulation de cette transaction par l\'Admin :');
                                if (reason) {
                                  cancelTransaction(tx.id, reason);
                                }
                              }}
                              className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition-all"
                            >
                              Annuler
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700/60"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reçu Officiel (PDF / Partager)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: PREUVE DE VALIDATION OBLIGATOIRE POUR UNE TRANSACTION EN ATTENTE  */}
      {/* ========================================================================= */}
      {selectedTxForProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-white">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Validation avec Preuve Requise</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{selectedTxForProof.referenceNumber}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTxForProof(null);
                  setProofImage(null);
                  setProofNotes('');
                  setProofError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction summary alert */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500 dark:text-slate-400">Opérateur :</span>
                <span className="text-slate-900 dark:text-white capitalize">{selectedTxForProof.operator}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500 dark:text-slate-400">Destinataire :</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">{selectedTxForProof.receiverPhone} ({selectedTxForProof.receiverName})</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500 dark:text-slate-400">Montant à transférer :</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{selectedTxForProof.amountHTG.toLocaleString()} HTG</span>
              </div>
            </div>

            {/* Proof Error Notice */}
            {proofError && (
              <div className="bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 p-3 rounded-2xl border border-rose-200 dark:border-rose-700/80 text-xs font-bold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{proofError}</span>
              </div>
            )}

            {/* PROOF INPUT AREA 1: Photo/Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>1. Capture d'écran ou Photo de Preuve (Recommandé)</span>
                <span className="text-[10px] text-rose-500 font-extrabold">*Obligatoire (Image ou Code)</span>
              </label>

              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 rounded-2xl p-4 text-center bg-slate-50 dark:bg-slate-950/60 transition-all">
                {proofImage ? (
                  <div className="relative group">
                    <img 
                      src={proofImage} 
                      alt="Preuve" 
                      className="max-h-48 mx-auto rounded-xl border border-slate-300 dark:border-slate-700 object-contain shadow-md"
                    />
                    <button
                      onClick={() => setProofImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-lg"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Option 1: Caméra directe */}
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/50 transition-all text-center">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-300">Prendre une photo 📷</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Ouvrir l'appareil photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleProofImageUpload} 
                        className="hidden" 
                      />
                    </label>

                    {/* Option 2: Galerie / Fichier */}
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all text-center">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">Galerie / Fichier 📁</span>
                      <span className="text-[10px] text-slate-500">Choisir une capture</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProofImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>



            {/* Validation Action Button */}
            <div className="pt-2">
              <button
                onClick={handleConfirmValidationWithProof}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white dark:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRMER ET VALIDER LA TRANSACTION</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SAISIE DIRECTE CLIENT AU GESTIONNAIRE (AUTO-VALIDATION AVEC PREUVE) */}
      {/* ========================================================================= */}
      {isDirectCreationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-white">
            
            {/* Header Direct Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Saisie Directe au Guichet</h3>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider">
                    Opérateur: {directOperator.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDirectCreationOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectTransaction} className="space-y-4">
              
              {directFormError && (
                <div className="bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 p-3 rounded-2xl border border-rose-200 dark:border-rose-700/80 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{directFormError}</span>
                </div>
              )}

              {/* Operator Selector Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Changer d'Opérateur
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {OPERATORS_LIST.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setDirectOperator(op.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                        directOperator === op.id
                          ? 'bg-amber-500 text-white dark:text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <img 
                        src={getOperatorLogo(op.id)} 
                        alt={op.name} 
                        className="w-4 h-4 object-contain rounded-md bg-white shrink-0" 
                      />
                      <span>{op.country} {op.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Expéditeur (RD) */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  1. Informations Expéditeur (Client en RD)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nom complet expéditeur (Optionnel)"
                    value={directSenderName}
                    onChange={(e) => setDirectSenderName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone RD (Optionnel)"
                    value={directSenderPhone}
                    onChange={(e) => setDirectSenderPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Client Destinataire */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {['digicel', 'claro', 'altice', 'natcom'].includes(directOperator)
                    ? `2. Numéro à Recharger (${directOperator.toUpperCase()})`
                    : '2. Informations Destinataire (Reçoit en Haïti)'}
                </span>
                <div className={`grid grid-cols-1 ${['digicel', 'claro', 'altice', 'natcom'].includes(directOperator) ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-2`}>
                  {!['digicel', 'claro', 'altice', 'natcom'].includes(directOperator) && (
                    <input
                      type="text"
                      placeholder="Nom complet destinataire"
                      value={directReceiverName}
                      onChange={(e) => setDirectReceiverName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  )}
                  <input
                    type="tel"
                    placeholder={['claro', 'altice'].includes(directOperator) ? "Téléphone RD (+1 809 / 829...)" : "Téléphone HT (509...)"}
                    value={directReceiverPhone}
                    onChange={(e) => setDirectReceiverPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Montant DOP et Calcul HTG */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Montant Encaissé (DOP)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    100 DOP = {Math.round(dopToHtgRate * 100)} HTG
                  </span>
                </div>
                <input
                  type="number"
                  value={directAmountDOP}
                  onChange={(e) => setDirectAmountDOP(e.target.value)}
                  required
                  min="100"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 text-base font-black font-mono focus:border-amber-500 focus:outline-none"
                />
                <div className="text-right text-xs font-bold text-slate-500 dark:text-slate-400">
                  Équivalent Haïti : <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm">{Math.round(parseFloat(directAmountDOP || '0') * dopToHtgRate).toLocaleString()} HTG</span>
                </div>
              </div>

              {/* ZONE DE PREUVE OBLIGATOIRE Saisie Gestionnaire */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Preuve d'Exécution par le Gestionnaire
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold">*Requis</span>
                </div>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl p-3.5 text-center bg-slate-50 dark:bg-slate-950/60">
                  {directProofImage ? (
                    <div className="relative">
                      <img 
                        src={directProofImage} 
                        alt="Preuve" 
                        className="max-h-36 mx-auto rounded-xl border border-slate-300 dark:border-slate-700 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setDirectProofImage(null)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                      >
                        Changer
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/50 transition-all text-center">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-amber-950 dark:text-amber-300">Prendre une photo 📷</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400">Ouvrir l'appareil photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          onChange={handleDirectProofImageUpload} 
                          className="hidden" 
                        />
                      </label>

                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all text-center">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">Galerie / Fichier 📁</span>
                        <span className="text-[10px] text-slate-500">Choisir une capture</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleDirectProofImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  )}
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDirect}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white dark:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmittingDirect ? 'Création & Validation...' : 'ENREGISTRER & VALIDER AVEC PREUVE'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AJUSTEMENT RAPIDE DU TAUX DU JOUR (GESTIONNAIRE / ADMIN)          */}
      {/* ========================================================================= */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Ajuster le Taux Officiel</h3>
              </div>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Valeur en HTG pour 100 DOP
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Ex: 230"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-black text-slate-500">HTG</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Exemple : Saisir 230 signifie que 100 DOP vaut 230 HTG (Taux = {(parseFloat(tempRate || '0') / 100).toFixed(2)}).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveRate}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white dark:text-slate-950 font-black text-xs rounded-xl transition-all"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
