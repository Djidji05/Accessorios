import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Bell,
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText, 
  ArrowLeft, 
  Check, 
  Copy, 
  XCircle,
  Hash,
  Search,
  Eye,
  EyeOff,
  AlertTriangle,
  UserCheck,
  X,
  ChevronRight,
  User,
  Building,
  DollarSign,
  Edit,
  Save,
  AlertCircle,
  Camera,
  Image,
  Trash2,
  ShieldCheck,
  PlusCircle,
  ArrowUpRight,
  Phone,
  RefreshCw,
  Filter,
  Landmark,
  Percent,
  LogOut,
  FolderArchive,
  Download,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../i18n/translations';
import { OperatorBadge } from '../components/OperatorBadge';
import { Transaction, ChannelType, OperatorCode, ServiceType } from '../types';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';
import { compressImage } from '../utils/imageCompressor';
import { exportTransactionsToCSV, exportTransactionsToPDF } from '../utils/exportUtils';
import { Pagination } from '../components/Pagination';

export const TaskQueueView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours'
  });
  const { 
    transactions, 
    currentUser, 
    completeTask, 
    cancelTransaction, 
    updateTransaction,
    createTransaction,
    dopToHtgRate,
    setSelectedReceiptTx,
    setActiveTab,
    accountBalances,
    logout,
    setIsTransactionDetailOpen,
    readNotificationIds,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentLang,
    setLanguage,
    t
  } = useApp();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const dateLocale = currentLang === 'ES' ? 'es-DO' : currentLang === 'HT' ? 'fr-HT' : 'fr-FR';

  // Full-page transaction view state (NO modal popups)
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<Transaction | null>(null);

  // Dedicated Agent Haïti Modal & Workflow States
  const [haitiDetailTx, setHaitiDetailTx] = useState<Transaction | null>(null);
  const [haitiProofModalTx, setHaitiProofModalTx] = useState<Transaction | null>(null);

  // Dedicated Gestionnaire States & Filters
  const [gestionnaireDetailTx, setGestionnaireDetailTx] = useState<Transaction | null>(null);
  const [gestionnaireProofModalTx, setGestionnaireProofModalTx] = useState<Transaction | null>(null);
  const [gestionnaireProofImage, setGestionnaireProofImage] = useState<string | null>(null);
  const [gestionnaireProofNotes, setGestionnaireProofNotes] = useState<string>('');
  const [gestionnaireProofError, setGestionnaireProofError] = useState<string | null>(null);
  const [gestionnaireTimeFilter, setGestionnaireTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [gestionnaireStatusFilter, setGestionnaireStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [gestionnaireOperatorFilter, setGestionnaireOperatorFilter] = useState<string>('all');
  const [gestionnaireSearchQuery, setGestionnaireSearchQuery] = useState('');

  // Masquer la barre de navigation quand un détail de transaction ou modal de validation est ouvert
  React.useEffect(() => {
    setIsTransactionDetailOpen(
      !!(selectedTxForDetails || haitiDetailTx || haitiProofModalTx || gestionnaireDetailTx || gestionnaireProofModalTx)
    );
    return () => setIsTransactionDetailOpen(false);
  }, [selectedTxForDetails, haitiDetailTx, haitiProofModalTx, gestionnaireDetailTx, gestionnaireProofModalTx, setIsTransactionDetailOpen]);
  const [haitiProofImage, setHaitiProofImage] = useState<string | null>(null);
  const [haitiSmsCode, setHaitiSmsCode] = useState<string>('');
  const [haitiNotes, setHaitiNotes] = useState<string>('');
  const [haitiOperatorFilter, setHaitiOperatorFilter] = useState<'all' | 'natcash' | 'natcom' | 'moncash' | 'digicel'>('all');
  const [haitiStatusFilter, setHaitiStatusFilter] = useState<'in_progress' | 'completed' | 'all'>('in_progress');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [showHaitiBalance, setShowHaitiBalance] = useState<boolean>(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Dedicated Agent R.D. States & Filters ("Mes Transactions du Jour")
  const [rdDetailTx, setRdDetailTx] = useState<Transaction | null>(null);
  const [rdStatusFilter, setRdStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [rdOperatorFilter, setRdOperatorFilter] = useState<string>('all');
  const [rdSearchQuery, setRdSearchQuery] = useState('');
  const [rdCopiedPhoneId, setRdCopiedPhoneId] = useState<string | null>(null);

  // Pagination states
  const [haitiPage, setHaitiPage] = useState<number>(1);
  const [rdPage, setRdPage] = useState<number>(1);
  const [gestionnairePage, setGestionnairePage] = useState<number>(1);
  const [queuePage, setQueuePage] = useState<number>(1);

  // Form states inside full detail page
  const [proofNotes, setProofNotes] = useState('');
  const [proofCode, setProofCode] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDetailProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setProofImage(compressed);
    }
  };

  // Admin Edit Mode States
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [editData, setEditData] = useState({
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    amountDOP: 0,
    proofNotes: ''
  });

  // Filter & Search states
  const [selectedChannel, setSelectedChannel] = useState<'all' | ChannelType>('all');
  const [selectedOperatorFilter, setSelectedOperatorFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('in_progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reset pagination when filters change
  useEffect(() => {
    setHaitiPage(1);
  }, [haitiOperatorFilter, haitiStatusFilter, searchQuery]);

  useEffect(() => {
    setRdPage(1);
  }, [rdStatusFilter, rdOperatorFilter, rdSearchQuery]);

  useEffect(() => {
    setGestionnairePage(1);
  }, [gestionnaireTimeFilter, gestionnaireStatusFilter, gestionnaireOperatorFilter, gestionnaireSearchQuery]);

  useEffect(() => {
    setQueuePage(1);
  }, [selectedChannel, selectedOperatorFilter, selectedStatusFilter, searchQuery]);

  // Quick Add Transaction Modal (Gestionnaire / Admin direct execution)
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [newTxOperator, setNewTxOperator] = useState<OperatorCode>('moncash');
  const [newTxServiceType, setNewTxServiceType] = useState<ServiceType>('transfer');
  const [newTxSenderName, setNewTxSenderName] = useState('');
  const [newTxSenderPhone, setNewTxSenderPhone] = useState('');
  const [newTxReceiverName, setNewTxReceiverName] = useState('');
  const [newTxReceiverPhone, setNewTxReceiverPhone] = useState('');
  const [newTxAmountDOP, setNewTxAmountDOP] = useState<string>('3000');
  const [newTxImmediateClose, setNewTxImmediateClose] = useState<boolean>(true);
  const [newTxProofImage, setNewTxProofImage] = useState<string | null>(null);

  const handleNewTxProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setNewTxProofImage(compressed);
    }
  };

  const handleCreateNewTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newTxAmountDOP) || 0;
    if (amountNum <= 0) {
      alert("Veuillez saisir un montant supérieur à 0.");
      return;
    }
    const isNoBeneficiaryOperator = ['digicel', 'claro', 'altice', 'natcom'].includes(newTxOperator);

    if (!newTxSenderName.trim() || (!isNoBeneficiaryOperator && !newTxReceiverName.trim()) || !newTxReceiverPhone.trim()) {
      alert(isNoBeneficiaryOperator 
        ? "Veuillez remplir les informations obligatoires (Expéditeur et Numéro Récepteur)." 
        : "Veuillez remplir les informations obligatoires (Expéditeur, Bénéficiaire et Téléphone).");
      return;
    }

    if (newTxImmediateClose && !newTxProofImage) {
      alert("Veuillez joindre la capture ou le reçu opérateur pour clôturer immédiatement.");
      return;
    }

    const feeDOP = Math.round(amountNum * 0.03);
    const commissionDOP = Math.round(amountNum * 0.01);

    const finalReceiverName = isNoBeneficiaryOperator
      ? (newTxReceiverName.trim() || `Recharge ${newTxOperator.toUpperCase()}`)
      : newTxReceiverName.trim();

    const result = createTransaction({
      senderName: newTxSenderName.trim(),
      senderPhone: newTxSenderPhone.trim() || '+1 809 000 0000',
      receiverName: finalReceiverName,
      receiverPhone: newTxReceiverPhone.trim(),
      operator: newTxOperator,
      serviceType: isNoBeneficiaryOperator ? 'topup_mobile' : newTxServiceType,
      amountDOP: amountNum,
      feeDOP,
      commissionDOP,
    });

    if (result.success && result.transaction) {
      const created = result.transaction;
      if (newTxImmediateClose) {
        const opUpper = newTxOperator.toUpperCase();
        const fullProof = `Reçu ${opUpper} certifié par ${currentUser.name} (${currentUser.location || 'Guichet'})`;

        completeTask(created.id, fullProof, newTxProofImage || undefined);
        setFeedback({
          type: 'success',
          text: `Transaction ${created.referenceNumber} (${opUpper}) enregistrée et clôturée immédiatement avec succès !`
        });
      } else {
        setFeedback({
          type: 'success',
          text: `Transaction ${created.referenceNumber} (${newTxOperator.toUpperCase()}) enregistrée et ajoutée au flux en attente !`
        });
      }

      // Reset
      setNewTxSenderName('');
      setNewTxSenderPhone('');
      setNewTxReceiverName('');
      setNewTxReceiverPhone('');
      setNewTxAmountDOP('3000');
      setNewTxProofImage(null);
      setIsAddTxModalOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } else {
      alert(result.message || "Erreur lors de la création de la transaction.");
    }
  };

  // SLA Stagnation check (>15m)
  const [nowTs, setNowTs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Sync editData when selectedTxForDetails changes or edit mode starts
  const startAdminEdit = (tx: Transaction) => {
    setEditData({
      senderName: tx.senderName,
      senderPhone: tx.senderPhone,
      receiverName: tx.receiverName,
      receiverPhone: tx.receiverPhone,
      amountDOP: tx.amountDOP,
      proofNotes: tx.proofNotes || ''
    });
    setIsEditingAdmin(true);
  };

  const handleAdminSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForDetails) return;

    const res = updateTransaction(selectedTxForDetails.id, {
      senderName: editData.senderName,
      senderPhone: editData.senderPhone,
      receiverName: editData.receiverName,
      receiverPhone: editData.receiverPhone,
      amountDOP: Number(editData.amountDOP),
      proofNotes: editData.proofNotes,
    });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      const updatedTx: Transaction = {
        ...selectedTxForDetails,
        senderName: editData.senderName,
        senderPhone: editData.senderPhone,
        receiverName: editData.receiverName,
        receiverPhone: editData.receiverPhone,
        amountDOP: Number(editData.amountDOP),
        amountHTG: Math.round(Number(editData.amountDOP) * selectedTxForDetails.exchangeRate),
        proofNotes: editData.proofNotes
      };
      setSelectedTxForDetails(updatedTx);
      setIsEditingAdmin(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isAgentRD = currentUser.role === 'agent_rd';
  const isGestionnaire = currentUser.role === 'gestionnaire';
  const isAdmin = currentUser.role === 'admin';

  // Périmètre strict selon le rôle connecté + filtre par calendrier
  const roleScopedTasks = transactions.filter((tx) => {
    let matchesDate = true;
    // Les tâches en attente / en cours (in_progress, pending_routing) restent toujours visibles pour l'agent
    if (tx.status !== 'in_progress' && tx.status !== 'pending_routing' && selectedRange && selectedRange.startDate && selectedRange.endDate) {
      const txDate = new Date(tx.createdAt);
      const start = new Date(selectedRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedRange.endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = txDate >= start && txDate <= end;
    }
    if (!matchesDate) return false;

    if (isAgentHaiti) {
      // Agent Haïti : flux destinés à Haïti (MonCash, Natcash, Natcom, Digicel)
      return tx.operator === 'natcash' || tx.operator === 'natcom' || tx.operator === 'moncash' || tx.operator === 'digicel' || tx.channel === 'haiti_cash';
    }
    if (isAgentRD) {
      // Agent RD : uniquement les transferts initiés par son guichet/agence ou qui lui sont assignés
      return tx.createdByRole === 'agent_rd' || tx.createdByName === currentUser.name || tx.assignedToRole === 'agent_rd';
    }
    if (isGestionnaire) {
      // Pour le gestionnaire : toutes les transactions des autres services sont visibles dans le flux, SAUF Natcash
      return tx.operator !== 'natcash';
    }
    return true; // Admin voit l'ensemble
  });

  const filteredTasks = roleScopedTasks.filter((tx) => {
    if (selectedStatusFilter !== 'all' && tx.status !== selectedStatusFilter) return false;
    if (selectedChannel !== 'all' && tx.channel !== selectedChannel) return false;
    if (selectedOperatorFilter !== 'all' && tx.operator !== selectedOperatorFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.senderName.toLowerCase().includes(q) ||
        tx.receiverName.toLowerCase().includes(q) ||
        tx.receiverPhone.includes(q) ||
        tx.operator.toLowerCase().includes(q) ||
        tx.assignedToName.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const inProgressCount = roleScopedTasks.filter((t) => t.status === 'in_progress').length;
  const haitiCashCount = roleScopedTasks.filter((t) => t.status === 'in_progress' && t.channel === 'haiti_cash').length;
  const digitalTelecomCount = roleScopedTasks.filter((t) => t.status === 'in_progress' && t.channel === 'digital_telecom').length;
  const completedCount = roleScopedTasks.filter((t) => t.status === 'completed').length;
  const stagnantCount = roleScopedTasks.filter((t) => {
    if (t.status !== 'in_progress') return false;
    const elapsedMinutes = (nowTs - new Date(t.createdAt).getTime()) / (1000 * 60);
    return elapsedMinutes > 15;
  }).length;

  const getElapsedInfo = (createdAtIso: string) => {
    const minutes = Math.floor((nowTs - new Date(createdAtIso).getTime()) / (1000 * 60));
    const isStagnant = minutes >= 15;

    if (minutes < 1) return { text: "1m", isStagnant: false };
    if (minutes < 60) return { text: `${minutes}m`, isStagnant };
    const hours = Math.floor(minutes / 60);
    return { text: `${hours}h${minutes % 60}m`, isStagnant: true };
  };

  const handleValidateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForDetails) return;

    if (!proofImage) {
      alert("⚠️ La preuve photographique (photo ou capture d'écran du reçu) est obligatoire pour valider et clôturer cette transaction.");
      return;
    }

    const opUpper = selectedTxForDetails.operator.toUpperCase();
    const fullProofText = `Reçu ${opUpper} certifié par ${currentUser.name} (${currentUser.location || 'Guichet'})`;

    const res = completeTask(selectedTxForDetails.id, fullProofText, proofImage || undefined);
    if (res.success) {
      setFeedback({ 
        type: 'success', 
        text: `Transaction ${selectedTxForDetails.referenceNumber} (${opUpper}) validée et clôturée avec succès ! Reçu attaché.` 
      });
      const updated: Transaction = { 
        ...selectedTxForDetails, 
        status: 'completed' as const, 
        proofNotes: fullProofText,
        proofUrl: proofImage || selectedTxForDetails.proofUrl,
        completedAt: new Date().toISOString()
      };
      setSelectedTxForDetails(updated);
      setProofNotes('');
      setProofCode('');
      setProofImage(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const copyToClipboard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Agent Haïti Action Handlers
  const handleOpenHaitiDetails = (tx: Transaction) => {
    setHaitiDetailTx(tx);
  };

  const handleOpenHaitiUploadProof = (tx: Transaction) => {
    setHaitiProofModalTx(tx);
    setHaitiProofImage(tx.proofUrl || null);
    setHaitiSmsCode('');
    setHaitiNotes(tx.proofNotes || '');
  };

  const handleOpenHaitiValidate = (tx: Transaction) => {
    setHaitiProofModalTx(tx);
    setHaitiProofImage(tx.proofUrl || null);
    setHaitiSmsCode('');
    setHaitiNotes('');
  };

  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setHaitiProofImage(compressed);
    }
  };

  const handleHaitiConfirmClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!haitiProofModalTx) return;

    if (!haitiProofImage) {
      alert("⚠️ La preuve photographique (photo ou fichier du reçu) est obligatoire pour valider et clôturer ce décaissement.");
      return;
    }

    const opUpper = haitiProofModalTx.operator.toUpperCase();
    const smsClean = haitiSmsCode.trim();
    const noteClean = haitiNotes.trim();

    const fullProof = smsClean 
      ? `Réf ${opUpper}: #${smsClean}${noteClean ? ` - ${noteClean}` : ' - Décaissement certifié'}`
      : noteClean || `Décaissement certifié par ${currentUser.name} (Delmas 33)`;

    const res = completeTask(haitiProofModalTx.id, fullProof, haitiProofImage || undefined);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Transaction ${haitiProofModalTx.referenceNumber} clôturée avec succès ! L'agence en RD a été notifiée et peut télécharger le reçu client.`
      });
      setHaitiProofModalTx(null);
      setHaitiProofImage(null);
      setHaitiSmsCode('');
      setHaitiNotes('');
      if (haitiDetailTx && haitiDetailTx.id === haitiProofModalTx.id) {
        setHaitiDetailTx({ ...haitiDetailTx, status: 'completed', proofNotes: fullProof, proofUrl: haitiProofImage || undefined });
      }
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const copyHaitiPhone = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // VUE PARTICULIÈRE & ÉPURÉE : AGENT HAÏTI (Natcash, Natcom, MonCash & Décaissements Haïti)
  if (isAgentHaiti) {
    const haitiScopedTasks = transactions.filter(
      (tx) =>
        tx.operator === 'natcash' ||
        tx.operator === 'natcom' ||
        tx.operator === 'moncash' ||
        tx.operator === 'digicel' ||
        tx.channel === 'haiti_cash' ||
        tx.assignedToRole === 'agent_haiti'
    );

    const haitiFilteredTasks = haitiScopedTasks.filter((tx) => {
      // 1. Filtre par opérateur Natcash / Natcom
      if (haitiOperatorFilter !== 'all' && tx.operator !== haitiOperatorFilter) return false;

      // 2. Filtre par statut
      if (haitiStatusFilter !== 'all' && tx.status !== haitiStatusFilter) return false;

      // 3. Recherche
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          tx.referenceNumber.toLowerCase().includes(q) ||
          tx.receiverName.toLowerCase().includes(q) ||
          tx.receiverPhone.includes(q) ||
          tx.senderName.toLowerCase().includes(q) ||
          tx.senderPhone.includes(q)
        );
      }
      return true;
    });

    const HAITI_PAGE_SIZE = 10;
    const haitiTotalPages = Math.ceil(haitiFilteredTasks.length / HAITI_PAGE_SIZE) || 1;
    const haitiPaginatedTasks = haitiFilteredTasks.slice((haitiPage - 1) * HAITI_PAGE_SIZE, haitiPage * HAITI_PAGE_SIZE);

    const pendingTasks = haitiScopedTasks.filter((t) => t.status === 'in_progress');
    const haitiPendingCount = pendingTasks.length;
    const haitiTotalPendingHTG = pendingTasks.reduce((sum, t) => sum + t.amountHTG, 0);
    const haitiNatcashCount = pendingTasks.filter((t) => t.operator === 'natcash').length;
    const haitiNatcomCount = pendingTasks.filter((t) => t.operator === 'natcom').length;
    const haitiCompletedCount = haitiScopedTasks.filter((t) => t.status === 'completed').length;
    const haitiStagnantCount = pendingTasks.filter((t) => {
      const elapsed = (nowTs - new Date(t.createdAt).getTime()) / (1000 * 60);
      return elapsed >= 15;
    }).length;

    const haitiAccountBalances = accountBalances;
    const natcashAccount = accountBalances.find((b) => b.operator === 'natcash');
    const natcashBalance = natcashAccount ? natcashAccount.balance : 620000;

    const natcomAccount = accountBalances.find((b) => b.operator === 'natcom');
    const natcomBalance = natcomAccount ? natcomAccount.balance : 290000;

    const haitiNotifications = React.useMemo(() => {
      return haitiScopedTasks.slice(0, 5).map((tx) => ({
        id: tx.id,
        title: `${t('Transfert', 'Transfert')} ${tx.operator.toUpperCase()} ${tx.status === 'completed' ? t('validé', 'validé') : t('en cours', 'en cours')}`,
        message: `${tx.receiverName} - ${tx.amountHTG.toLocaleString(dateLocale)} HTG (${tx.referenceNumber})`,
        time: new Date(tx.createdAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }),
        status: tx.status,
        tx
      }));
    }, [haitiScopedTasks, currentLang]);

    const unreadHaitiNotifs = haitiNotifications.filter(n => !readNotificationIds.includes(n.id));
    const unreadHaitiCount = unreadHaitiNotifs.length;

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto font-sans animate-in fade-in pb-24">
        {/* Toast feedback */}
        {feedback && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-white hover:text-emerald-100 font-extrabold text-sm p-1">
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. MOBILE ONLY VIEW (block md:hidden)                                    */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-4">
          {/* Mobile Top Header (Sticky Navbar en mode Mobile) */}
          <header className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md -mx-4 -mt-4 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">
                {t("Agent Haïti • Décaissements")}
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("Mes Tâches & Soldes")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold"
                  title={t("Changer de langue")}
                >
                  <Globe className="w-4 h-4 text-orange-500" />
                  <span className="text-[11px] font-black">{currentLang}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isLangOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/20"
                      onClick={() => setIsLangOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
                      {[
                        { code: 'FR' as Language, label: 'Français', flag: '🇫🇷' },
                        { code: 'HT' as Language, label: 'Kreyòl', flag: '🇭🇹' },
                        { code: 'ES' as Language, label: 'Español', flag: '🇩🇴' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                            currentLang === lang.code
                              ? 'bg-orange-500 text-white font-bold'
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

              {/* NOTIFICATION BELL ICON BUTTON WITH DROPDOWN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer relative"
                  title={t("nav_notifications")}
                >
                  <Bell className="w-5 h-5 text-orange-500" />
                  {unreadHaitiCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-75">
                      {unreadHaitiCount > 99 ? '99+' : unreadHaitiCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                              {t('Notifications Haïti', 'Notifications Haïti')}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Natcash & Natcom ({haitiPendingCount} {t('en attente', 'en attente')})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {unreadHaitiCount > 0 && (
                            <button
                              type="button"
                              onClick={() => markAllNotificationsAsRead(haitiNotifications.map(n => n.id))}
                              className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                            >
                              {t('Tout lire', 'Tout lire')}
                            </button>
                          )}
                          <button
                            onClick={() => setIsNotificationsOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {unreadHaitiNotifs.length > 0 ? (
                          unreadHaitiNotifs.map((notif) => {
                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  markNotificationAsRead(notif.id);
                                  handleOpenHaitiDetails(notif.tx);
                                  setIsNotificationsOpen(false);
                                }}
                                className="p-2.5 rounded-2xl transition-colors cursor-pointer border flex items-start gap-2.5 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/50 hover:bg-rose-50/80"
                              >
                                <div className={`p-1.5 rounded-xl flex-shrink-0 mt-0.5 ${
                                  notif.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                                }`}>
                                  {notif.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                        {notif.title}
                                      </p>
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono font-medium flex-shrink-0">
                                      {notif.time}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400">
                            {t('Aucune notification pour le moment.', 'Aucune notification pour le moment.')}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                          onClick={() => {
                            setActiveTab('notifications');
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full py-2.5 px-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <span>{t('Voir toutes les notifications', 'Voir toutes les notifications')}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* LOGOUT BUTTON NEXT TO BELL */}
              <button
                type="button"
                onClick={logout}
                className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer flex items-center justify-center"
                title={t('Déconnexion', 'Déconnexion')}
              >
                <LogOut className="w-5 h-5 text-rose-500" />
              </button>
            </div>
          </header>

          {/* MAIN LARGE BALANCE CARD (Solde en Caisse) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-white p-5 shadow-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs border border-orange-500/30">
                  HT
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-slate-200 tracking-wider block leading-none">
                    {t('Solde en Caisse', 'Solde en Caisse')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                    {t('Fonds opérationnels disponibles', 'Fonds opérationnels disponibles')}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowHaitiBalance(!showHaitiBalance)}
                className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={showHaitiBalance ? t('Masquer les montants', 'Masquer les montants') : t('Afficher les montants', 'Afficher les montants')}
              >
                {showHaitiBalance ? <Eye className="w-4 h-4 text-slate-200" /> : <EyeOff className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Balance Card: Solde en Caisse */}
            <div className="pt-1">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                    {t('Solde en Caisse', 'Solde en Caisse')}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HTG
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black font-mono text-white tracking-tight">
                    {showHaitiBalance ? natcashBalance.toLocaleString(dateLocale) : '••••••••'}
                  </p>
                  <span className="text-xs font-extrabold text-emerald-400">HTG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setHaitiStatusFilter('in_progress')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                haitiStatusFilter === 'in_progress'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {t('En Attente', 'En Attente')} ({haitiPendingCount})
            </button>

            <button
              onClick={() => setHaitiStatusFilter('completed')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                haitiStatusFilter === 'completed'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {t('Validées', 'Validées')} ({haitiCompletedCount})
            </button>

            <button
              onClick={() => setHaitiOperatorFilter(haitiOperatorFilter === 'natcash' ? 'all' : 'natcash')}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                haitiOperatorFilter === 'natcash'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              Natcash
            </button>

            <button
              onClick={() => setHaitiOperatorFilter(haitiOperatorFilter === 'natcom' ? 'all' : 'natcom')}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                haitiOperatorFilter === 'natcom'
                  ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              Natcom
            </button>

            <button
              onClick={() => setHaitiOperatorFilter(haitiOperatorFilter === 'moncash' ? 'all' : 'moncash')}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                haitiOperatorFilter === 'moncash'
                  ? 'bg-rose-600 text-white border-rose-600 font-extrabold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              MonCash
            </button>
          </div>

          {/* Tasks List Cards for Mobile */}
          <div className="space-y-3">
            {haitiPaginatedTasks.length > 0 ? (
              haitiPaginatedTasks.map((tx) => {
                const isCompleted = tx.status === 'completed';

                return (
                  <div
                    key={tx.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    {/* Header: Operator, Reference, Hour/Time, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OperatorBadge operator={tx.operator} size="sm" />
                        <div>
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white block leading-tight">
                            {tx.referenceNumber}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(tx.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                          : 'bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800'
                      }`}>
                        {isCompleted ? `✓ ${t('completed', 'Clôturé')}` : `⏳ ${t('pending', 'En attente')}`}
                      </span>
                    </div>

                    {/* Body: Receiver & Amount */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('Bénéficiaire', 'Bénéficiaire')}</span>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {tx.receiverName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                            {tx.receiverPhone}
                          </span>
                          <button
                            onClick={(e) => copyHaitiPhone(e, tx.receiverPhone, tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700"
                            title={t('copy', 'Copier')}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('Montant', 'Montant')}</span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          {tx.amountHTG.toLocaleString(dateLocale)} <span className="text-xs">HTG</span>
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          ({tx.amountDOP.toLocaleString(dateLocale)} DOP)
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {!isCompleted ? (
                        <button
                          onClick={() => handleOpenHaitiValidate(tx)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('Valider & Décaisser', 'Valider & Décaisser')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenHaitiDetails(tx)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          <span>{t('Voir la preuve', 'Voir la preuve')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Aucune tâche en attente', 'Aucune tâche en attente')}</p>
                <p className="text-[11px] text-slate-400">{t('Tous les décaissements Natcash et Natcom sont à jour.', 'Tous les décaissements Natcash et Natcom sont à jour.')}</p>
              </div>
            )}

            {/* Mobile Pagination */}
            {haitiFilteredTasks.length > HAITI_PAGE_SIZE && (
              <Pagination
                currentPage={haitiPage}
                totalPages={haitiTotalPages}
                onPageChange={setHaitiPage}
                totalItems={haitiFilteredTasks.length}
                itemsPerPage={HAITI_PAGE_SIZE}
                compact
              />
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PC ONLY VIEW (hidden md:block - UNTOUCHED ORIGINAL DESKTOP LAYOUT)     */}
        {/* ========================================================================= */}
        <div className="hidden md:block space-y-6">
          {/* 1. Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {t('Décaissements & Opérations Haïti', 'Décaissements & Opérations Haïti')}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {t('File des opérations et décaissements à exécuter en Haïti.', 'File des opérations et décaissements à exécuter en Haïti.')}
              </p>
            </div>
            <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
          </div>

          {/* 2. KPI Summary Stream Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Solde en Caisse', 'Solde en Caisse')}</p>
                <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{natcashBalance.toLocaleString(dateLocale)}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{t('Gourdes (HTG) en Caisse', 'Gourdes (HTG) en Caisse')}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-xs">
                NC / NAT
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('En Attente', 'En Attente')}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{haitiPendingCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t('À décaisser en Haïti', 'À décaisser en Haïti')}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Total à Verser', 'Total à Verser')}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{haitiTotalPendingHTG.toLocaleString(dateLocale)}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{t('Gourdes (HTG)', 'Gourdes (HTG)')}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Clôturées', 'Clôturées')}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{haitiCompletedCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t('Quittances validées', 'Quittances validées')}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          {/* 3. Operator Filter Buttons & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Operator Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                  {t('operator')} :
                </span>

                <button
                  onClick={() => setHaitiOperatorFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    haitiOperatorFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{t('all', 'Tous')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${haitiOperatorFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {haitiScopedTasks.length}
                  </span>
                </button>

                <button
                  onClick={() => setHaitiOperatorFilter('natcash')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    haitiOperatorFilter === 'natcash'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Natcash</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    haitiOperatorFilter === 'natcash' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {haitiScopedTasks.filter(t => t.operator === 'natcash').length}
                  </span>
                </button>

                <button
                  onClick={() => setHaitiOperatorFilter('natcom')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    haitiOperatorFilter === 'natcom'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Natcom</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    haitiOperatorFilter === 'natcom' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {haitiScopedTasks.filter(t => t.operator === 'natcom').length}
                  </span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Rechercher #TX, bénéficiaire, téléphone...', 'Rechercher #TX, bénéficiaire, téléphone...')}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>

            {/* Status Tab Toggle */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setHaitiStatusFilter('in_progress')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  haitiStatusFilter === 'in_progress'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t('En Attente de Décaissement', 'En Attente de Décaissement')} ({haitiPendingCount})</span>
              </button>

              <button
                onClick={() => setHaitiStatusFilter('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  haitiStatusFilter === 'completed'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('Validées & Clôturées', 'Validées & Clôturées')} ({haitiCompletedCount})</span>
              </button>

              <button
                onClick={() => setHaitiStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  haitiStatusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{t('Toutes', 'Toutes')} ({haitiScopedTasks.length})</span>
              </button>
            </div>
          </div>

          {/* 4. Table des Tâches Entrantes (Épurée & Simplifiée) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200 items-center">
            <div className="col-span-2">{t('ID', 'ID')}</div>
            <div className="col-span-2">{t('Arrivée', 'Arrivée')}</div>
            <div className="col-span-2 text-right">{t('Montant', 'Montant')}</div>
            <div className="col-span-2">{t('Bénéficiaire & N°', 'Bénéficiaire & N°')}</div>
            <div className="col-span-2 text-center">{t('Statut', 'Statut')}</div>
            <div className="col-span-1 text-center">{t('Vue', 'Vue')}</div>
            <div className="col-span-1 text-center">{t('Preuve', 'Preuve')}</div>
          </div>

          {/* List items */}
          {haitiFilteredTasks.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{t('Aucune tâche en attente dans ce filtre !', 'Aucune tâche en attente dans ce filtre !')}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t("Toutes les transactions pour Natcash et Natcom ont été traitées et clôturées. Les nouvelles demandes envoyées depuis la République Dominicaine s'afficheront ici en direct.", "Toutes les transactions pour Natcash et Natcom ont été traitées et clôturées. Les nouvelles demandes envoyées depuis la République Dominicaine s'afficheront ici en direct.")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {haitiPaginatedTasks.map((tx) => {
                const elapsed = getElapsedInfo(tx.createdAt);
                const isPending = tx.status === 'in_progress';
                const isCompleted = tx.status === 'completed';

                return (
                  <div
                    key={tx.id}
                    className={`grid grid-cols-12 gap-3 px-6 py-3.5 text-xs items-center transition-all ${
                      isCompleted
                        ? 'bg-slate-50/40 hover:bg-slate-50'
                        : 'bg-white hover:bg-blue-50/30'
                    }`}
                  >
                    {/* 1. ID Transaction */}
                    <div className="col-span-2">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {tx.referenceNumber}
                      </span>
                    </div>

                    {/* 2. Arrivée (Heure exacte + Écoulé) */}
                    <div className="col-span-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-black text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{new Date(tx.createdAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({new Date(tx.createdAt).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' })})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {t('Il y a', 'Il y a')} {elapsed.text}
                      </span>
                    </div>

                    {/* 3. Montant HTG */}
                    <div className="col-span-2 text-right space-y-0.5">
                      <div className="text-base font-black text-emerald-600 font-mono tracking-tight">
                        {tx.amountHTG.toLocaleString()} HTG
                      </div>
                    </div>

                    {/* 4. Bénéficiaire avec numéro */}
                    <div className="col-span-2 space-y-0.5 min-w-0">
                      <p className="font-extrabold text-slate-900 text-xs truncate">
                        {tx.receiverName}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded truncate">
                          {tx.receiverPhone}
                        </span>
                        <button
                          onClick={(e) => copyHaitiPhone(e, tx.receiverPhone, tx.id)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-[10px] font-bold flex-shrink-0"
                          title={t('Copier le numéro', 'Copier le numéro')}
                        >
                          {copiedPhoneId === tx.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-black">{t('Copié !', 'Copié !')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>{t('Copier', 'Copier')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 5. Statut (Strictement 1 ligne) */}
                    <div className="col-span-2 flex items-center justify-center">
                      {isPending ? (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800">
                          <Clock className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 animate-pulse" />
                          <span className="whitespace-nowrap">{t('En attente', 'En attente')}</span>
                        </span>
                      ) : (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="whitespace-nowrap">{t('Clôturé', 'Clôturé')}</span>
                        </span>
                      )}
                    </div>

                    {/* 6. Icône de Vue */}
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => handleOpenHaitiDetails(tx)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-bold text-xs flex items-center justify-center cursor-pointer"
                        title={t('Voir les détails de la transaction', 'Voir les détails de la transaction')}
                      >
                        <Eye className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>

                    {/* 7. Action Preuve (Joindre Preuve & Clôturer) */}
                    <div className="col-span-1 flex items-center justify-center">
                      {isPending ? (
                        <button
                          onClick={() => handleOpenHaitiUploadProof(tx)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-extrabold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                          title={t('Uploader la preuve et clôturer la transaction', 'Uploader la preuve et clôturer la transaction')}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t('Preuve', 'Preuve')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenHaitiUploadProof(tx)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                          title={t('Consulter la preuve enregistrée', 'Consulter la preuve enregistrée')}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('Preuve', 'Preuve')}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop Pagination */}
          {haitiFilteredTasks.length > HAITI_PAGE_SIZE && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                currentPage={haitiPage}
                totalPages={haitiTotalPages}
                onPageChange={setHaitiPage}
                totalItems={haitiFilteredTasks.length}
                itemsPerPage={HAITI_PAGE_SIZE}
              />
            </div>
          )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL 1: 🔍 VOIR LES DÉTAILS DE LA TRANSACTION */}
        {haitiDetailTx && (() => {
          const currentHaitiTx = transactions.find((t) => t.id === haitiDetailTx.id) || haitiDetailTx;
          const isCancelled = currentHaitiTx.status === 'cancelled';
          const isInProgress = currentHaitiTx.status === 'in_progress';
          const isCompleted = currentHaitiTx.status === 'completed';

          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 animate-in zoom-in-95 my-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isCancelled ? <X className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono truncate">
                        {currentHaitiTx.referenceNumber}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t('Reçu à', 'Reçu à')} {new Date(currentHaitiTx.createdAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })} • {new Date(currentHaitiTx.createdAt).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setHaitiDetailTx(null)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-h-0">
                  {/* Status & Operator Banner */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('Opérateur :', 'Opérateur :')}</span>
                      <OperatorBadge operator={currentHaitiTx.operator} size="sm" />
                    </div>

                    <div>
                      {isCancelled ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 text-xs font-black border border-rose-300 dark:border-rose-800">
                          ✕ {t('Annulé', 'Annulé')}
                        </span>
                      ) : isInProgress ? (
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 text-xs font-black border border-orange-300 dark:border-orange-800">
                          ⏳ {t('En attente', 'En attente')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                          ✅ {t('Clôturé', 'Clôturé')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Motif d'annulation officiel */}
                  {isCancelled && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 dark:text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{t('Transaction Annulée', 'Transaction Annulée')}</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs">
                        <span className="text-[10px] font-bold uppercase text-rose-500 block mb-0.5">{t('Motif officiel :', 'Motif officiel :')}</span>
                        <p className="font-semibold text-rose-900 dark:text-rose-200 break-words">
                          {currentHaitiTx.cancellationReason || t("Annulé par l'administrateur", "Annulé par l'administrateur")}
                        </p>
                        {currentHaitiTx.cancelledAt && (
                          <p className="text-[10px] text-slate-400 font-mono pt-1 mt-1 border-t border-rose-100 dark:border-slate-800">
                            {t('Annulée le', 'Annulée le')} {new Date(currentHaitiTx.cancelledAt).toLocaleString(dateLocale)}
                          </p>
                        )}
                      </div>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                        {t('⚠️ Ne pas décaisser de fonds pour cette transaction.', '⚠️ Ne pas décaisser de fonds pour cette transaction.')}
                      </p>
                    </div>
                  )}

                  {/* Parties Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Expéditeur RD */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {t('Expéditeur (RD)', 'Expéditeur (RD)')}
                      </span>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">{currentHaitiTx.senderName || t('Client Comptoir', 'Client Comptoir')}</p>
                      <p className="font-mono text-xs text-slate-600 dark:text-slate-300">{currentHaitiTx.senderPhone || '---'}</p>
                      <p className="text-[10px] text-slate-500 pt-1">
                        {t('Agence émettrice :', 'Agence émettrice :')} <strong>{currentHaitiTx.createdByName || t('Agence RD', 'Agence RD')}</strong>
                      </p>
                    </div>

                    {/* Bénéficiaire Haïti */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-1">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        {t('Bénéficiaire (Haïti)', 'Bénéficiaire (Haïti)')}
                      </span>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">{currentHaitiTx.receiverName}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                          {currentHaitiTx.receiverPhone}
                        </span>
                        <button
                          onClick={(e) => copyHaitiPhone(e, currentHaitiTx.receiverPhone, currentHaitiTx.id)}
                          className="p-1 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 text-[10px] font-bold cursor-pointer"
                        >
                          {copiedPhoneId === currentHaitiTx.id ? t('✓ Copié', '✓ Copié') : t('Copier', 'Copier')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Financial Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">{t('Montant Net à Décaisser', 'Montant Net à Décaisser')}</span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                        ({currentHaitiTx.amountDOP.toLocaleString()} DOP)
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {currentHaitiTx.amountHTG.toLocaleString()} HTG
                    </div>
                  </div>

                  {/* Preuve si existante (Photo & Notes) */}
                  {(currentHaitiTx.proofNotes || currentHaitiTx.proofUrl) && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>{t('Preuve / Reçu Enregistré :', 'Preuve / Reçu Enregistré :')}</span>
                        </span>
                        {currentHaitiTx.proofUrl && (
                          <a 
                            href={currentHaitiTx.proofUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-[11px]"
                          >
                            {t('Plein écran ↗', 'Plein écran ↗')}
                          </a>
                        )}
                      </div>

                      {currentHaitiTx.proofNotes && (
                        <p className="font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 break-words text-[11px]">
                          {currentHaitiTx.proofNotes}
                        </p>
                      )}

                      {currentHaitiTx.proofUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-black/30 flex justify-center p-1">
                          <img
                            src={currentHaitiTx.proofUrl}
                            alt={t('Photo de la preuve de transfert', 'Photo de la preuve de transfert')}
                            className="max-h-56 sm:max-h-64 w-auto object-contain rounded-lg shadow-xs"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fixed Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setHaitiDetailTx(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {t('Fermer', 'Fermer')}
                  </button>

                  <div className="flex items-center gap-2">
                    {isInProgress ? (
                      <button
                        type="button"
                        onClick={() => {
                          const target = currentHaitiTx;
                          setHaitiDetailTx(null);
                          handleOpenHaitiValidate(target);
                        }}
                        className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('Valider & Clôturer', 'Valider & Clôturer')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceiptTx(currentHaitiTx);
                        }}
                        className={`px-4 sm:px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCancelled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>{isCancelled ? t('Voir Reçu Annulé', 'Voir Reçu Annulé') : t('Voir / Télécharger Reçu', 'Voir / Télécharger Reçu')}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* MODAL 2: 📁 PAGE / ÉCRAN DÉDIÉ : DÉCAISSEMENT & PREUVE PHOTO */}
        {haitiProofModalTx && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 sm:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 min-h-screen sm:min-h-0 sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 animate-in zoom-in-95 flex flex-col justify-between">
              
              {/* Top Header with Back Button */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHaitiProofModalTx(null);
                      setHaitiProofImage(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-orange-500" />
                    <span>{t('Retour aux tâches', 'Retour aux tâches')}</span>
                  </button>

                  <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">
                    {t('Agent Haïti • Proof', 'Agent Haïti • Proof')}
                  </span>
                </div>

                {/* Transaction Header Info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {haitiProofModalTx.referenceNumber}
                      </h3>
                      <OperatorBadge operator={haitiProofModalTx.operator} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('Bénéficiaire :', 'Bénéficiaire :')} <strong className="text-slate-800 dark:text-slate-200">{haitiProofModalTx.receiverName}</strong> ({haitiProofModalTx.receiverPhone})
                    </p>
                  </div>
                </div>

                {/* Prominent Amount to Disburse */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center space-y-0.5">
                  <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    {t('Montant à verser au bénéficiaire', 'Montant à verser au bénéficiaire')}
                  </span>
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                    {haitiProofModalTx.amountHTG.toLocaleString(dateLocale)} HTG
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    {t('Équivalent :', 'Équivalent :')} {haitiProofModalTx.amountDOP.toLocaleString(dateLocale)} DOP
                  </span>
                </div>

                <form id="haiti-proof-form" onSubmit={handleHaitiConfirmClosure} className="space-y-4">
                  
                  {/* Module photo / Preuve */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                      📸 {t('Preuve du Décaissement / Reçu :', 'Preuve du Décaissement / Reçu :')}
                    </label>

                    {haitiProofImage ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={haitiProofImage}
                            alt={t('Aperçu quittance', 'Aperçu quittance')}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              {t('✓ Preuve attachée avec succès', '✓ Preuve attachée avec succès')}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                              {t('Prête pour archivage', 'Prête pour archivage')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setHaitiProofImage(null)}
                          className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                          title={t('Supprimer la photo', 'Supprimer la photo')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Button 1: Take Photo via Camera */}
                        <label className="border-2 border-dashed border-orange-300 dark:border-orange-800/80 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {t('Prendre une photo', 'Prendre une photo')}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {t("Ouvrir l'appareil photo", "Ouvrir l'appareil photo")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleProofFileUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Button 2: Import from Gallery / Files */}
                        <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {t('Galerie / Fichier', 'Galerie / Fichier')}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {t('Importer une image (Max 10Mo)', 'Importer une image (Max 10Mo)')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Operational Notice */}
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-2 text-[11px] text-blue-900 dark:text-blue-300">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>{t('Confirmation immédiate :', 'Confirmation immédiate :')}</strong> {t("La validation enregistre la preuve et notifie l'agence RD en temps réel.", "La validation enregistre la preuve et notifie l'agence RD en temps réel.")}
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer Validation Button (Sticky / Bottom) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setHaitiProofModalTx(null);
                    setHaitiProofImage(null);
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl cursor-pointer"
                >
                  {t('Annuler', 'Annuler')}
                </button>

                <button
                  type="submit"
                  form="haiti-proof-form"
                  disabled={!haitiProofImage}
                  className={`flex-1 sm:flex-none px-6 py-3 font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                    haitiProofImage
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20 cursor-pointer active:scale-[0.98]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('Valider & Clôturer', 'Valider & Clôturer')}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // VUE PARTICULIÈRE & ÉPURÉE : AGENT R.D. ("Mes Transactions du Jour")
  // =========================================================================
  if (isAgentRD) {
    const rdScopedTasks = transactions.filter(
      (t) => t.createdByRole === 'agent_rd' || t.createdByName === currentUser.name || t.assignedToRole === 'agent_rd'
    );

    const rdFilteredTasks = rdScopedTasks.filter((t) => {
      if (rdStatusFilter !== 'all' && t.status !== rdStatusFilter) return false;
      if (rdOperatorFilter !== 'all' && t.operator !== rdOperatorFilter) return false;
      if (rdSearchQuery) {
        const q = rdSearchQuery.toLowerCase();
        return (
          t.referenceNumber.toLowerCase().includes(q) ||
          t.receiverName.toLowerCase().includes(q) ||
          t.receiverPhone.includes(q) ||
          t.senderName.toLowerCase().includes(q) ||
          t.senderPhone.includes(q) ||
          t.operator.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const totalRdCount = rdScopedTasks.length;
    const rdPendingTasks = rdScopedTasks.filter((t) => t.status === 'in_progress');
    const rdPendingCount = rdPendingTasks.length;
    const rdCompletedTasks = rdScopedTasks.filter((t) => t.status === 'completed');
    const rdCompletedCount = rdCompletedTasks.length;
    const rdCancelledTasks = rdScopedTasks.filter((t) => t.status === 'cancelled');
    const rdCancelledCount = rdCancelledTasks.length;
    const totalDopEncashed = rdScopedTasks.reduce((acc, t) => acc + t.amountDOP, 0);
    const totalHtgDisbursed = rdCompletedTasks.reduce((acc, t) => acc + t.amountHTG, 0);

    const RD_PAGE_SIZE = 10;
    const rdTotalPages = Math.ceil(rdFilteredTasks.length / RD_PAGE_SIZE) || 1;
    const rdPaginatedTasks = rdFilteredTasks.slice((rdPage - 1) * RD_PAGE_SIZE, rdPage * RD_PAGE_SIZE);

    const copyRdPhone = (e: React.MouseEvent, phone: string, id: string) => {
      e.stopPropagation();
      navigator.clipboard.writeText(phone);
      setRdCopiedPhoneId(id);
      setTimeout(() => setRdCopiedPhoneId(null), 2000);
    };

    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans animate-in fade-in">
        
        {/* Toast Feedback */}
        {feedback && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-white hover:text-emerald-100 font-extrabold text-sm p-1">
              ✕
            </button>
          </div>
        )}

        {/* 1. Header & Live Counter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-md">
              <FileText className="w-7 h-7 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('Mes Transactions du Jour', 'Mes Transactions du Jour')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {t('Suivi en temps réel des transferts saisis au comptoir et délivrance des reçus clients officiels.', 'Suivi en temps réel des transferts saisis au comptoir et délivrance des reçus clients officiels.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('guichet')}
              className="px-5 py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-100" />
              <span>{t('Nouvelle Transaction', 'Nouvelle Transaction')}</span>
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Total Saisies */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('Opérations Saisies (Jour)', 'Opérations Saisies (Jour)')}
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalRdCount}</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {totalDopEncashed.toLocaleString(dateLocale)} DOP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t("Total encaissé aujourd'hui", "Total encaissé aujourd'hui")}</p>
          </div>

          {/* Card 2: En attente Haïti */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-1 relative overflow-hidden border-l-4 border-l-slate-400">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {t('En attente Haïti', 'En attente Haïti')}
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{rdPendingCount}</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {rdPendingTasks.reduce((acc, t) => acc + t.amountDOP, 0).toLocaleString(dateLocale)} DOP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{t('À traiter en Haïti', 'À traiter en Haïti')}</p>
          </div>

          {/* Card 3: Clôturées / Validées */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-1 relative overflow-hidden border-l-4 border-l-blue-600">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              {t('Clôturé / Validé', 'Clôturé / Validé')}
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{rdCompletedCount}</span>
              <span className="text-xs font-bold text-blue-700 font-mono">
                {totalHtgDisbursed.toLocaleString(dateLocale)} HTG
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{t('Reçus officiels prêts', 'Reçus officiels prêts')} ({totalHtgDisbursed.toLocaleString(dateLocale)} HTG)</p>
          </div>

        </div>

        {/* 3. Filter Bar & Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded">
            <button
              onClick={() => setRdStatusFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                rdStatusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('Toutes', 'Toutes')} ({totalRdCount})
            </button>
            <button
              onClick={() => setRdStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                rdStatusFilter === 'in_progress'
                  ? 'bg-slate-400 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {t('En attente', 'En attente')} ({rdPendingCount})
            </button>
            <button
              onClick={() => setRdStatusFilter('completed')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                rdStatusFilter === 'completed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('Clôturées', 'Clôturées')} ({rdCompletedCount})
            </button>
            <button
              onClick={() => setRdStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                rdStatusFilter === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              {t('Annulées', 'Annulées')} ({rdCancelledCount})
            </button>
          </div>

          {/* Operator Filter & Search */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            {/* Operator select */}
            <select
              value={rdOperatorFilter}
              onChange={(e) => setRdOperatorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="all">{t('Tous les Opérateurs', 'Tous les Opérateurs')}</option>
              <option value="moncash">MonCash (Haïti)</option>
              <option value="natcash">Natcash (Haïti)</option>
              <option value="digicel">Digicel (Haïti)</option>
              <option value="natcom">Natcom (Haïti)</option>
              <option value="claro">Claro (R.D.)</option>
              <option value="altice">Altice (R.D.)</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('Rechercher #TX, bénéficiaire, téléphone...', 'Rechercher #TX, bénéficiaire, téléphone...')}
                value={rdSearchQuery}
                onChange={(e) => setRdSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white"
              />
              {rdSearchQuery && (
                <button
                  onClick={() => setRdSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 4. Transactions List Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          {rdFilteredTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">{t('Aucune opération trouvée', 'Aucune opération trouvée')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {rdSearchQuery 
                  ? t("Aucune transaction ne correspond à votre recherche.", "Aucune transaction ne correspond à votre recherche.") 
                  : t("Vous n'avez pas encore d'opérations enregistrées dans cette catégorie aujourd'hui.", "Vous n'avez pas encore d'opérations enregistrées dans cette catégorie aujourd'hui.")}
              </p>
              <button
                onClick={() => setActiveTab('guichet')}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('Créer une Transaction', 'Créer une Transaction')}</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4">{t('Réf. & Heure', 'Réf. & Heure')}</th>
                    <th className="py-3 px-4">{t('Opérateur', 'Opérateur')}</th>
                    <th className="py-3 px-4">{t('Expéditeur (RD)', 'Expéditeur (RD)')}</th>
                    <th className="py-3 px-4">{t('Bénéficiaire (Haïti)', 'Bénéficiaire (Haïti)')}</th>
                    <th className="py-3 px-4 text-right">{t('Montant DOP', 'Montant DOP')}</th>
                    <th className="py-3 px-4 text-right">{t('Net à Décaisser', 'Net à Décaisser')}</th>
                    <th className="py-3 px-4 text-center">{t('Statut en Temps Réel', 'Statut en Temps Réel')}</th>
                    <th className="py-3 px-4 text-center">{t('Action Reçu', 'Action Reçu')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rdPaginatedTasks.map((tx) => {
                    const isCompleted = tx.status === 'completed';
                    return (
                      <tr 
                        key={tx.id} 
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setRdDetailTx(tx)}
                      >
                        {/* Ref & Time */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-black text-slate-900 text-xs block">{tx.referenceNumber}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Operator */}
                        <td className="py-3.5 px-4">
                          <OperatorBadge operator={tx.operator} size="sm" />
                        </td>

                        {/* Sender */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 truncate max-w-[130px]">{tx.senderName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tx.senderPhone}</div>
                        </td>

                        {/* Receiver */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 truncate max-w-[150px]">{tx.receiverName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              {tx.receiverPhone}
                            </span>
                            <button
                              onClick={(e) => copyRdPhone(e, tx.receiverPhone, tx.id)}
                              className="text-[9px] text-slate-400 hover:text-blue-600 font-bold cursor-pointer"
                              title={t('Copier le numéro', 'Copier le numéro')}
                            >
                              {rdCopiedPhoneId === tx.id ? '✓' : t('Copier', 'Copier')}
                            </button>
                          </div>
                        </td>

                        {/* Amount DOP */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          {tx.amountDOP.toLocaleString(dateLocale)} DOP
                          <span className="text-[9px] text-slate-400 block font-normal">{t('Frais:', 'Frais:')} {tx.feeDOP} DOP</span>
                        </td>

                        {/* Amount Net HTG */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-blue-600 text-sm">
                          {tx.amountHTG.toLocaleString(dateLocale)} HTG
                        </td>

                        {/* Real-time Status */}
                        <td className="py-3.5 px-4 text-center">
                          {tx.status === 'cancelled' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{t('Annulé', 'Annulé')}</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{t('Clôturé / Validé', 'Clôturé / Validé')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-orange-100 text-orange-900 border border-orange-300 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                              <span>{t('En attente Haïti', 'En attente Haïti')}</span>
                            </span>
                          )}
                        </td>

                        {/* Action Receipt Button */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedReceiptTx(tx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                tx.status === 'cancelled'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : isCompleted
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title={tx.status === 'cancelled' ? t("Reçu officiel d'annulation", "Reçu officiel d'annulation") : isCompleted ? t("Télécharger ou partager le reçu PDF", "Télécharger ou partager le reçu PDF") : t("Bordereau provisoire (PDF)", "Bordereau provisoire (PDF)")}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{tx.status === 'cancelled' ? t("Reçu Annulé", "Reçu Annulé") : isCompleted ? t("Reçu (PDF)", "Reçu (PDF)") : t("Bordereau", "Bordereau")}</span>
                            </button>

                            <button
                              onClick={() => setRdDetailTx(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={t('Voir les détails complets', 'Voir les détails complets')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* RD Agent Pagination */}
          {rdFilteredTasks.length > RD_PAGE_SIZE && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                currentPage={rdPage}
                totalPages={rdTotalPages}
                onPageChange={setRdPage}
                totalItems={rdFilteredTasks.length}
                itemsPerPage={RD_PAGE_SIZE}
              />
            </div>
          )}
        </div>

        {/* 5. MODAL DÉTAILS DE L'OPÉRATION (AGENT R.D.) */}
        {rdDetailTx && (() => {
          const tx = transactions.find((t) => t.id === rdDetailTx.id) || rdDetailTx;
          const isCancelled = tx.status === 'cancelled';
          const isCompleted = tx.status === 'completed';
          const isHaitiOp = ['moncash', 'natcash', 'natcom'].includes(tx.operator);

          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 max-h-[95vh] overflow-y-auto custom-scrollbar">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black font-mono shadow-xs ${
                      isCancelled ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {isCancelled ? '✕' : 'TX'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 font-mono">
                          {tx.referenceNumber}
                        </h3>
                        <OperatorBadge operator={tx.operator} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('Enregistré le', 'Enregistré le')} {new Date(tx.createdAt).toLocaleString(dateLocale)} {t('par', 'par')} {tx.createdByName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setRdDetailTx(null)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isCancelled
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : isCompleted
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isCancelled ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-600 animate-spin shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-black">
                        {isCancelled
                          ? t('Transaction Annulée & Révoquée', 'Transaction Annulée & Révoquée')
                          : isCompleted
                          ? (isHaitiOp ? t('Clôturé & Validé en Haïti', 'Clôturé & Validé en Haïti') : t('Clôturé & Validé par le Gestionnaire', 'Clôturé & Validé par le Gestionnaire'))
                          : (isHaitiOp ? t('En attente de décaissement (Haïti)', 'En attente de décaissement (Haïti)') : t('En attente de validation par le Gestionnaire', 'En attente de validation par le Gestionnaire'))}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {isCancelled
                          ? t("Cette opération a été révoquée par l'administration. Aucun décaissement n'est prévu.", "Cette opération a été révoquée par l'administration. Aucun décaissement n'est prévu.")
                          : isCompleted
                          ? (isHaitiOp ? t('Les fonds ont été décaissés et remis au bénéficiaire de l\'autre côté de la frontière.', 'Les fonds ont été décaissés et remis au bénéficiaire de l\'autre côté de la frontière.') : t('L\'opération a été vérifiée, traitée et certifiée par le Gestionnaire.', 'L\'opération a été vérifiée, traitée et certifiée par le Gestionnaire.'))
                          : (isHaitiOp ? t('L\'équipe en Haïti a reçu la tâche et s\'apprête à effectuer le décaissement.', 'L\'équipe en Haïti a reçu la tâche et s\'apprête à effectuer le décaissement.') : t('Le Gestionnaire a reçu la tâche et s\'apprête à effectuer la validation avec photo.', 'Le Gestionnaire a reçu la tâche et s\'apprête à effectuer la validation avec photo.'))}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const target = tx;
                      setRdDetailTx(null);
                      setSelectedReceiptTx(target);
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isCancelled
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isCancelled ? t('Reçu Annulé (PDF)', 'Reçu Annulé (PDF)') : t('Reçu (PDF / Partager)', 'Reçu (PDF / Partager)')}</span>
                  </button>
                </div>

                {/* Motif officiel d'annulation (si annulée) */}
                {isCancelled && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{t("Motif d'annulation officiel :", "Motif d'annulation officiel :")}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-rose-200 space-y-1">
                      <p className="font-extrabold text-rose-700 text-xs break-words">
                        {tx.cancellationReason || t("Annulé par l'administrateur", "Annulé par l'administrateur")}
                      </p>
                      {tx.cancelledAt && (
                        <p className="text-[10px] text-slate-400 font-mono pt-0.5 border-t border-rose-100">
                          {t('Annulée le', 'Annulée le')} {new Date(tx.cancelledAt).toLocaleString(dateLocale)}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-rose-600 font-medium">
                      {t("⚠️ Les fonds et commissions ont été régularisés. Aucun décaissement n'est autorisé pour cette transaction.", "⚠️ Les fonds et commissions ont été régularisés. Aucun décaissement n'est autorisé pour cette transaction.")}
                    </p>
                  </div>
                )}

                {/* Parties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Sender RD */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {t('Expéditeur (République Dominicaine 🇩🇴)', 'Expéditeur (République Dominicaine 🇩🇴)')}
                    </span>
                    <p className="font-black text-slate-900 text-sm">{tx.senderName}</p>
                    <p className="font-mono text-xs text-slate-600">{tx.senderPhone}</p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      {t('Guichet émetteur :', 'Guichet émetteur :')} <strong>{tx.createdByName}</strong>
                    </p>
                  </div>

                  {/* Receiver Haiti */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1.5">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                      {t('Bénéficiaire (Haïti 🇭🇹)', 'Bénéficiaire (Haïti 🇭🇹)')}
                    </span>
                    <p className="font-black text-slate-900 text-sm">{tx.receiverName}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-800 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                        {tx.receiverPhone}
                      </span>
                      <button
                        onClick={(e) => copyRdPhone(e, tx.receiverPhone, tx.id)}
                        className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold cursor-pointer"
                      >
                        {rdCopiedPhoneId === tx.id ? t('✓ Copié', '✓ Copié') : t('Copier', 'Copier')}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Financial Box */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-800 uppercase">{t('Montant Net en Haïti', 'Montant Net en Haïti')}</span>
                    <span className="font-semibold text-blue-700">{t('Taux appliqué :', 'Taux appliqué :')} 100 DOP = {Math.round(tx.exchangeRate * 100)} HTG</span>
                  </div>
                  <div className="text-3xl font-black text-blue-700 font-mono">
                    {tx.amountHTG.toLocaleString(dateLocale)} HTG
                  </div>
                  <div className="text-xs text-blue-800/80 flex justify-between border-t border-blue-200/70 pt-2">
                    <span>{t('Encaissé au comptoir :', 'Encaissé au comptoir :')} <strong>{tx.amountDOP.toLocaleString(dateLocale)} {t('Pesos', 'Pesos')}</strong></span>
                    <span>{t('Frais de service :', 'Frais de service :')} <strong>{tx.feeDOP} {t('Pesos', 'Pesos')}</strong></span>
                    <span>{t('Commission :', 'Commission :')} <strong>{tx.commissionDOP} {t('Pesos', 'Pesos')}</strong></span>
                  </div>
                </div>

                {/* Proof / Quittance Haïti si disponible */}
                {tx.proofNotes && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">{t('Quittance / Confirmation de Décaissement :', 'Quittance / Confirmation de Décaissement :')}</span>
                    <p className="font-mono text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                      {tx.proofNotes}
                    </p>
                    {tx.proofUrl && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">{t('Photo de la quittance :', 'Photo de la quittance :')}</span>
                        <img
                          src={tx.proofUrl}
                          alt={t('Preuve quittance', 'Preuve quittance')}
                          className="max-h-40 rounded-xl border border-slate-200 object-contain bg-black/5"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRdDetailTx(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {t('Fermer', 'Fermer')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = tx;
                      setRdDetailTx(null);
                      setSelectedReceiptTx(target);
                    }}
                    className={`px-6 py-2.5 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer ${
                      isCancelled ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isCancelled ? t('Reçu Annulé (PDF)', 'Reçu Annulé (PDF)') : t('Reçu Officiel (PDF / Partager)', 'Reçu Officiel (PDF / Partager)')}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

      </div>
    );
  }

  // IF A TRANSACTION IS SELECTED -> RENDER FULL-SCREEN TRANSACTION PAGE
  if (selectedTxForDetails) {
    const tx = transactions.find((t) => t.id === selectedTxForDetails.id) || selectedTxForDetails;
    const isCompleted = tx.status === 'completed';
    const isCancelled = tx.status === 'cancelled';
    const isInProgress = tx.status === 'in_progress';
    const elapsed = getElapsedInfo(tx.createdAt);

    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto font-sans animate-in fade-in">
        
        {/* Navigation Bar / Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTxForDetails(null);
                setIsEditingAdmin(false);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Retour au Flux', 'Retour au Flux')}</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {t('Transaction', 'Transaction')} {tx.referenceNumber}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                  isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  'bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800'
                }`}>
                  {tx.status === 'completed' ? t('Clôturée', 'Clôturée') : tx.status === 'cancelled' ? t('Annulée', 'Annulée') : t('En Attente', 'En Attente')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('Créée le', 'Créée le')} {new Date(tx.createdAt).toLocaleString(dateLocale)} ({elapsed.text})
              </p>
            </div>
          </div>

          {/* Page Header Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Admin Edit Trigger */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  if (isEditingAdmin) setIsEditingAdmin(false);
                  else startAdminEdit(tx);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isEditingAdmin 
                    ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                }`}
              >
                <Edit className="w-4 h-4" />
                <span>{isEditingAdmin ? t('Annuler la Modification', 'Annuler la Modification') : t('Modifier la Transaction', 'Modifier la Transaction')}</span>
              </button>
            )}

            <button
              onClick={() => setSelectedReceiptTx(tx)}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title={t('Consulter et télécharger le reçu officiel (PDF)', 'Consulter et télécharger le reçu officiel (PDF)')}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{t('Télécharger Reçu PDF', 'Télécharger Reçu PDF')}</span>
            </button>

            {/* Gestionnaire Quality Control: Report Anomaly to Admin (Superviser sans modifier) */}
            {currentUser.role === 'gestionnaire' && !isCancelled && (
              <button
                onClick={() => {
                  const motif = prompt(`🚨 CONTRÔLE QUALITÉ - Signaler une anomalie à l'Administrateur pour ${tx.referenceNumber} :
Précisez l'erreur constatée (ex: mauvais numéro récepteur, montant erroné saisi au guichet RD, suspicion doublon) :`);
                  if (motif && motif.trim()) {
                    setFeedback({ 
                      type: 'success', 
                      text: `Anomalie sur ${tx.referenceNumber} consignée et transmise à l'Administrateur pour arbitrage et correction sécurisée !` 
                    });
                    setTimeout(() => setFeedback(null), 5000);
                  }
                }}
                className="px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title={t("Superviser sans modifier : signaler une anomalie pour correction par l'Admin", "Superviser sans modifier : signaler une anomalie pour correction par l'Admin")}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t('Signaler une Anomalie', 'Signaler une Anomalie')}</span>
              </button>
            )}

            {currentUser.role === 'admin' && !isCancelled && !isCompleted && (
              <button
                onClick={() => {
                  const reason = prompt(`Annuler la transaction ${tx.referenceNumber} ? Motif:`);
                  if (reason) {
                    cancelTransaction(tx.id, reason);
                    setSelectedTxForDetails({ ...tx, status: 'cancelled', cancellationReason: reason });
                  }
                }}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{t('Annuler Transaction', 'Annuler Transaction')}</span>
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex justify-between items-center ${
            feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="text-white underline">{t('Fermer', 'Fermer')}</button>
          </div>
        )}

        {/* Official Cancellation Notice (when cancelled) */}
        {isCancelled && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-rose-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{t('TRANSACTION OFFICIELLEMENT ANNULÉE & RÉVOQUÉE', 'TRANSACTION OFFICIELLEMENT ANNULÉE & RÉVOQUÉE')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">{t('Motif officiel :', 'Motif officiel :')}</span>
              <p className="font-extrabold text-rose-900 text-sm break-words">
                {tx.cancellationReason || t("Annulé par l'administrateur", "Annulé par l'administrateur")}
              </p>
              {tx.cancelledAt && (
                <p className="text-[10px] text-slate-400 font-mono pt-1 border-t border-rose-100">
                  {t('Annulée le', 'Annulée le')} {new Date(tx.cancelledAt).toLocaleString(dateLocale)}
                </p>
              )}
            </div>
            <p className="text-[11px] text-rose-700 font-semibold">
              {t('⚠️ Cette transaction a été révoquée. Aucun décaissement ou transfert de flotte n\'a été exécuté pour ce transfert.', '⚠️ Cette transaction a été révoquée. Aucun décaissement ou transfert de flotte n\'a été exécuté pour ce transfert.')}
            </p>
          </div>
        )}

        {/* ADMIN EDIT FORM MODE (IF ADMIN CLICKS MODIFIER) */}
        {isEditingAdmin && currentUser.role === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
              <h3 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <span>{t('Formulaire de Modification Administrateur', 'Formulaire de Modification Administrateur')}</span>
              </h3>
              <span className="text-[11px] text-blue-600 font-bold">{t("Correction à la demande d'un employé", "Correction à la demande d'un employé")}</span>
            </div>

            <form onSubmit={handleAdminSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Nom Expéditeur (RD)', 'Nom Expéditeur (RD)')}</label>
                  <input
                    type="text"
                    value={editData.senderName}
                    onChange={(e) => setEditData({ ...editData, senderName: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Téléphone Expéditeur', 'Téléphone Expéditeur')}</label>
                  <input
                    type="text"
                    value={editData.senderPhone}
                    onChange={(e) => setEditData({ ...editData, senderPhone: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                {!(selectedTxForDetails && ['digicel', 'claro', 'altice', 'natcom'].includes(selectedTxForDetails.operator)) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('Nom Bénéficiaire (Haïti)', 'Nom Bénéficiaire (Haïti)')}</label>
                    <input
                      type="text"
                      value={editData.receiverName}
                      onChange={(e) => setEditData({ ...editData, receiverName: e.target.value })}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Téléphone Bénéficiaire (Portefeuille HT)', 'Téléphone Bénéficiaire (Portefeuille HT)')}</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editData.receiverPhone}
                    onChange={(e) => setEditData({ ...editData, receiverPhone: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Montant Encaissé (Pesos)', 'Montant Encaissé (Pesos)')}</label>
                  <input
                    type="number"
                    value={editData.amountDOP}
                    onChange={(e) => setEditData({ ...editData, amountDOP: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Note / Preuve Justificative', 'Note / Preuve Justificative')}</label>
                  <input
                    type="text"
                    value={editData.proofNotes}
                    onChange={(e) => setEditData({ ...editData, proofNotes: e.target.value })}
                    placeholder="Ref ou Note de rectification..."
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAdmin(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                >
                  {t('Annuler', 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('Enregistrer la Modification Admin', 'Enregistrer la Modification Admin')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2-Column Professional Fintech Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Column: Financials, Parties & Proof Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Financial Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>{t('Détails Financiers & Conversion', 'Détails Financiers & Conversion')}</span>
                </h3>
                <OperatorBadge operator={tx.operator} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-500 uppercase">{t('Montant Encaissé (RD)', 'Montant Encaissé (RD)')}</p>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">{tx.amountDOP.toLocaleString(dateLocale)} {t('Pesos', 'Pesos')}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{t('Frais de transfert:', 'Frais de transfert:')} {tx.feeDOP} {t('Pesos', 'Pesos')}</p>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                  <p className="text-xs font-bold text-blue-800 uppercase">{t('Montant à Verser (Haïti)', 'Montant à Verser (Haïti)')}</p>
                  <p className="text-2xl font-black text-blue-700 font-mono mt-1">{tx.amountHTG.toLocaleString(dateLocale)} HTG</p>
                  <p className="text-[11px] text-blue-600 font-bold mt-1">{t('Taux: 100 Pesos =', 'Taux: 100 Pesos =')} {Math.round(tx.exchangeRate * 100)} HTG</p>
                </div>
              </div>
            </div>

            {/* Parties Prenantes Card: Expéditeur & Bénéficiaire */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>{t('Expéditeur & Bénéficiaire', 'Expéditeur & Bénéficiaire')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Expéditeur */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('Expéditeur (République Dominicaine)', 'Expéditeur (République Dominicaine)')}</span>
                  <p className="font-bold text-slate-900 text-sm">{tx.senderName}</p>
                  <p className="font-mono text-xs text-slate-600 font-semibold">{tx.senderPhone}</p>
                </div>

                {/* Bénéficiaire */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('Bénéficiaire (Haïti)', 'Bénéficiaire (Haïti)')}</span>
                  <p className="font-bold text-slate-900 text-sm">{tx.receiverName}</p>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-700 font-bold">
                    <span>{tx.receiverPhone}</span>
                    <button
                      onClick={(e) => copyToClipboard(e, tx.receiverPhone, tx.id)}
                      className="p-1 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors"
                      title={t('Copier le numéro', 'Copier le numéro')}
                    >
                      {copiedId === tx.id ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Preuve & Formulaire de Validation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{t('Preuve de Décaissement & Validation', 'Preuve de Décaissement & Validation')}</span>
              </h3>

              {tx.proofNotes ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl font-mono text-xs text-blue-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-blue-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>{t('✓ Preuve de paiement enregistrée :', '✓ Preuve de paiement enregistrée :')}</span>
                    </p>
                    {tx.completedAt && (
                      <span className="text-[10px] text-slate-500 font-sans font-bold">
                        {t('Clôturé le', 'Clôturé le')} {new Date(tx.completedAt).toLocaleString(dateLocale)}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-800 font-sans font-semibold bg-white/90 p-3 rounded-xl border border-blue-100">
                    {tx.proofNotes}
                  </p>

                  {/* Visual Proof Image Preview if available */}
                  {tx.proofUrl && (
                    <div className="pt-1">
                      <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block mb-1.5 font-sans">
                        {t('Capture / Quittance de paiement associée :', 'Capture / Quittance de paiement associée :')}
                      </span>
                      <div className="relative inline-block group">
                        <img 
                          src={tx.proofUrl} 
                          alt={t('Quittance de transaction', 'Quittance de transaction')} 
                          className="w-36 h-36 object-cover rounded-xl border-2 border-blue-300 shadow-sm group-hover:scale-105 transition-transform bg-white"
                        />
                        <a 
                          href={tx.proofUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-[11px] font-bold transition-opacity font-sans"
                        >
                          {t('Agrandir ↗', 'Agrandir ↗')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : isInProgress ? (
                <form onSubmit={handleValidateTask} className="space-y-4 pt-1">
                  
                  {/* Preuve Visuelle : Photo / Capture de Quittance */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>{t('Preuve Photographique ou Capture d\'Écran :', 'Preuve Photographique ou Capture d\'Écran :')}</span>
                      <span className="text-[10px] text-purple-600 font-semibold">{t('Photo ou screenshot quittance', 'Photo ou screenshot quittance')}</span>
                    </label>

                    {proofImage ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={proofImage} 
                            alt={t('Aperçu quittance', 'Aperçu quittance')} 
                            className="w-14 h-14 rounded-xl object-cover border border-blue-300 shadow-2xs flex-shrink-0"
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {t('✓ Capture / Reçu attaché', '✓ Capture / Reçu attaché')}
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold block">
                              {t('Prête pour validation et archivage', 'Prête pour validation et archivage')}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProofImage(null)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex-shrink-0 cursor-pointer"
                          title={t('Supprimer la capture', 'Supprimer la capture')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                          {t('Joindre la capture ou le reçu opérateur', 'Joindre la capture ou le reçu opérateur')} ({tx.operator.toUpperCase()})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t('Formats : PNG, JPG, JPEG (Max 10 Mo)', 'Formats : PNG, JPG, JPEG (Max 10 Mo)')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDetailProofUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('Valider & Clôturer la Transaction', 'Valider & Clôturer la Transaction')}</span>
                  </button>
                </form>
              ) : isCancelled ? (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-mono">
                  <p className="font-bold">✕ {t('Transaction Annulée', 'Transaction Annulée')}</p>
                  <p className="mt-1">{t('Motif :', 'Motif :')} {tx.cancellationReason || t("Annulé par l'administrateur", "Annulé par l'administrateur")}</p>
                </div>
              ) : null}
            </div>

          </div>

          {/* Right Sidebar: Responsable & Agence */}
          <div className="space-y-6">
            
            {/* Responsable de la tâche */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>{t('Responsable de la Tâche', 'Responsable de la Tâche')}</span>
              </h4>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-900">{tx.assignedToName}</p>
                <p className="text-[11px] text-slate-500 capitalize">{tx.assignedToRole.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Agence d'Origine */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-2xs">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" />
                <span>{t("Agence d'Origine", "Agence d'Origine")}</span>
              </h4>
              <p className="text-xs font-bold text-slate-900">{tx.createdByName}</p>
              <p className="text-[11px] text-slate-500 capitalize">{t('Rôle:', 'Rôle:')} {tx.createdByRole.replace('_', ' ')}</p>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // VUE PARTICULIÈRE & ÉPURÉE : GESTIONNAIRE ("Flux en Temps Réel" style Historique Mobile)
  // =========================================================================
  const handleGestionnaireProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setGestionnaireProofImage(compressed);
    }
  };

  const handleGestionnaireConfirmClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gestionnaireProofModalTx) return;

    if (!gestionnaireProofImage) {
      setGestionnaireProofError(t("⚠️ La preuve photographique (photo ou capture d'écran du reçu) est obligatoire pour valider et clôturer."));
      return;
    }

    const opUpper = gestionnaireProofModalTx.operator.toUpperCase();
    const noteClean = gestionnaireProofNotes.trim();
    const fullProof = noteClean
      ? `Réf/Note ${opUpper}: ${noteClean} - Clôturé par ${currentUser.name}`
      : `Reçu ${opUpper} certifié par ${currentUser.name} (${currentUser.location || 'Gestionnaire'})`;

    const res = completeTask(gestionnaireProofModalTx.id, fullProof, gestionnaireProofImage);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `${t("Transaction", "Transaction")} ${gestionnaireProofModalTx.referenceNumber} ${t("clôturée avec succès !", "clôturée avec succès !")}`
      });
      if (gestionnaireDetailTx && gestionnaireDetailTx.id === gestionnaireProofModalTx.id) {
        setGestionnaireDetailTx({
          ...gestionnaireDetailTx,
          status: 'completed',
          proofNotes: fullProof,
          proofUrl: gestionnaireProofImage
        });
      }
      setGestionnaireProofModalTx(null);
      setGestionnaireProofImage(null);
      setGestionnaireProofNotes('');
      setGestionnaireProofError(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const renderGestionnaireProofModal = () => {
    if (!gestionnaireProofModalTx) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar p-5 space-y-4 shadow-2xl text-slate-900 dark:text-white my-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t("Valider la Transaction", "Valider la Transaction")} #{gestionnaireProofModalTx.referenceNumber}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {t("Opérateur", "Opérateur")} : <strong className="uppercase text-slate-700 dark:text-slate-200">{gestionnaireProofModalTx.operator}</strong> • {gestionnaireProofModalTx.receiverName} ({gestionnaireProofModalTx.receiverPhone})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setGestionnaireProofModalTx(null);
                setGestionnaireProofImage(null);
                setGestionnaireProofNotes('');
                setGestionnaireProofError(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {gestionnaireProofError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{gestionnaireProofError}</span>
            </div>
          )}

          {/* Photo upload / Prise de Photo Directe */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {t("1. Photo / Capture d'écran du reçu (Preuve OBLIGATOIRE 📷)", "1. Photo / Capture d'écran du reçu (Preuve OBLIGATOIRE 📷)")}
            </label>

            {gestionnaireProofImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 max-h-56 bg-slate-950 flex flex-col items-center justify-center p-2 shadow-inner">
                <img src={gestionnaireProofImage} alt="Preuve" className="max-h-48 w-auto object-contain rounded-xl" />
                <div className="flex items-center justify-between w-full pt-2 px-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t("Photo enregistrée avec succès", "Photo enregistrée avec succès")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGestionnaireProofImage(null)}
                    className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                    title={t("Supprimer la photo", "Supprimer la photo")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t("Changer", "Changer")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Prendre une Photo en direct avec l'appareil photo */}
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 cursor-pointer transition-all group text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 block">
                      {t("Prendre une Photo", "Prendre une Photo")} 📷
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                      {t("Ouvrir l'appareil photo", "Ouvrir l'appareil photo")}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleGestionnaireProofUpload}
                    className="hidden"
                  />
                </label>

                {/* Option 2: Importer une Capture d'écran ou Fichier depuis la Galerie */}
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all group text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {t("Galerie / Fichier", "Galerie / Fichier")} 📁
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                      {t("Choisir une capture du reçu", "Choisir une capture du reçu")}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGestionnaireProofUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Notes / SMS Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {t("2. Note ou Référence Opérateur (Optionnel)", "2. Note ou Référence Opérateur (Optionnel)")}
            </label>
            <input
              type="text"
              placeholder={t("Ex: Confirmation SMS MonCash #483920...", "Ex: Confirmation SMS MonCash #483920...")}
              value={gestionnaireProofNotes}
              onChange={(e) => setGestionnaireProofNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setGestionnaireProofModalTx(null);
                setGestionnaireProofImage(null);
                setGestionnaireProofNotes('');
                setGestionnaireProofError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {t("Annuler", "Annuler")}
            </button>
            <button
              type="button"
              onClick={handleGestionnaireConfirmClosure}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("Valider & Clôturer", "Valider & Clôturer")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isGestionnaire) {
    const currentName = currentUser.name?.trim().toLowerCase() || '';
    const currentUsername = currentUser.username?.trim().toLowerCase() || '';

    const gestionnaireScopedTasks = transactions.filter((tx) => {
      // Pour le gestionnaire : toutes les transactions des autres services sont visibles dans le flux, SAUF Natcash
      return tx.operator !== 'natcash';
    });

    const gestionnaireFilteredTasks = gestionnaireScopedTasks.filter((tx) => {
      const txDateObj = new Date(tx.createdAt);
      const now = new Date();

      // 1. Filtre Temporel (Tous, Jour, Semaine, Mois, Année)
      let matchesTime = true;
      if (gestionnaireTimeFilter === 'today') {
        matchesTime = txDateObj.toDateString() === now.toDateString();
      } else if (gestionnaireTimeFilter === 'week') {
        const startOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        matchesTime = txDateObj >= startOfWeek;
      } else if (gestionnaireTimeFilter === 'month') {
        matchesTime =
          txDateObj.getMonth() === now.getMonth() &&
          txDateObj.getFullYear() === now.getFullYear();
      } else if (gestionnaireTimeFilter === 'year') {
        matchesTime = txDateObj.getFullYear() === now.getFullYear();
      }

      // 2. Filtre de Statut (Toutes, En attente, Validées)
      let matchesStatus = true;
      if (gestionnaireStatusFilter === 'in_progress') {
        matchesStatus = tx.status === 'in_progress' || tx.status === 'pending_routing';
      } else if (gestionnaireStatusFilter === 'completed') {
        matchesStatus = tx.status === 'completed';
      }

      // 3. Recherche
      const query = gestionnaireSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tx.referenceNumber.toLowerCase().includes(query) ||
        tx.receiverName.toLowerCase().includes(query) ||
        tx.senderName.toLowerCase().includes(query) ||
        tx.receiverPhone.includes(query) ||
        tx.senderPhone.includes(query);

      // 4. Filtre Opérateur
      const matchesOperator =
        gestionnaireOperatorFilter === 'all' || tx.operator === gestionnaireOperatorFilter;

      return matchesTime && matchesStatus && matchesSearch && matchesOperator;
    });

    const totalGestionnaireCount = gestionnaireScopedTasks.length;
    const pendingGestionnaireCount = gestionnaireScopedTasks.filter(
      (t) => t.status === 'in_progress' || t.status === 'pending_routing'
    ).length;
    const completedGestionnaireCount = gestionnaireScopedTasks.filter(
      (t) => t.status === 'completed'
    ).length;

    const GESTIONNAIRE_PAGE_SIZE = 10;
    const gestionnaireTotalPages = Math.ceil(gestionnaireFilteredTasks.length / GESTIONNAIRE_PAGE_SIZE) || 1;
    const gestionnairePaginatedTasks = gestionnaireFilteredTasks.slice((gestionnairePage - 1) * GESTIONNAIRE_PAGE_SIZE, gestionnairePage * GESTIONNAIRE_PAGE_SIZE);

    // A. VUE DÉTAILS PLEIN ÉCRAN (STRUCTURE LISTE VERTICALE IDENTIQUE À HISTORYVIEW)
    if (gestionnaireDetailTx) {
      const tx = transactions.find((t) => t.id === gestionnaireDetailTx.id) || gestionnaireDetailTx;
      const isCompleted = tx.status === 'completed';
      const isCancelled = tx.status === 'cancelled';
      const isInProgress = tx.status === 'in_progress' || tx.status === 'pending_routing';

      return (
        <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto space-y-6 animate-in fade-in pb-28 font-sans">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between py-1">
            <button
              onClick={() => setGestionnaireDetailTx(null)}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title={t("Retour au flux", "Retour au flux")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("Détails de la Transaction", "Détails de la Transaction")}
            </h3>

            <div className="w-9" />
          </div>

          {/* Main Details Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Header Row: Reference & Status */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("Référence", "Référence")}</span>
                <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                  {tx.referenceNumber}
                </span>
              </div>

              {isCompleted ? (
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/50">
                  ✓ {t("Clôturé", "Clôturé")}
                </span>
              ) : isInProgress ? (
                <span className="text-[10px] font-black text-orange-900 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-2.5 py-1 rounded-full border border-orange-300 dark:border-orange-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-pulse text-orange-600" /> {t("En attente", "En attente")}
                </span>
              ) : (
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/50">
                  ✕ {t("Annulé", "Annulé")}
                </span>
              )}
            </div>

            {/* Message d'annulation officiel */}
            {isCancelled && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{t("Transaction Annulée", "Transaction Annulée")}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs">
                  <span className="text-[10px] font-bold uppercase text-rose-500 block mb-0.5">{t("Motif officiel :", "Motif officiel :")}</span>
                  <p className="font-semibold text-rose-900 dark:text-rose-200 break-words">
                    {tx.cancellationReason || t("Annulé par l'administrateur", "Annulé par l'administrateur")}
                  </p>
                  {tx.cancelledAt && (
                    <p className="text-[10px] text-slate-400 font-mono pt-1 mt-1 border-t border-rose-100 dark:border-slate-800">
                      {t("Annulée le", "Annulée le")} {new Date(tx.cancelledAt).toLocaleString(dateLocale)}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                  {t("⚠️ Transaction révoquée. Aucune validation de preuve requise.", "⚠️ Transaction révoquée. Aucune validation de preuve requise.")}
                </p>
              </div>
            )}

            {/* Vertical Stacked Details List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Service / Opérateur", "Service / Opérateur")}</span>
                <OperatorBadge operator={tx.operator} size="sm" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Bénéficiaire", "Bénéficiaire")}</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{gestionnaireDetailTx.receiverName}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Téléphone Bénéficiaire", "Téléphone Bénéficiaire")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{gestionnaireDetailTx.receiverPhone}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(gestionnaireDetailTx.receiverPhone);
                    }}
                    className="p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title={t("Copier le numéro", "Copier le numéro")}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Expéditeur", "Expéditeur")}</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{gestionnaireDetailTx.senderName}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Téléphone Expéditeur", "Téléphone Expéditeur")}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{gestionnaireDetailTx.senderPhone}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Montant Envoyé", "Montant Envoyé")}</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-sm">{gestionnaireDetailTx.amountDOP.toLocaleString()} DOP</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-blue-700 dark:text-blue-400 font-bold">{t("Commission Admin (DOP)", "Commission Admin (DOP)")}</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                  +{(gestionnaireDetailTx.commissionDOP || Math.round(gestionnaireDetailTx.amountDOP * 0.01)).toLocaleString()} DOP
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-blue-700 dark:text-blue-400 font-bold">{t("Montant Reçu", "Montant Reçu")}</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-base">{gestionnaireDetailTx.amountHTG.toLocaleString()} HTG</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Date & Heure", "Date & Heure")}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(gestionnaireDetailTx.createdAt).toLocaleString(dateLocale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 font-medium">{t("Créé par", "Créé par")}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {gestionnaireDetailTx.createdByName} ({gestionnaireDetailTx.createdByRole})
                </span>
              </div>

              {/* Preuve de validation si existante */}
              {(gestionnaireDetailTx.proofNotes || gestionnaireDetailTx.proofUrl) && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-400">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{t("Preuve de Clôture & Validation :", "Preuve de Clôture & Validation :")}</span>
                  </div>
                  {gestionnaireDetailTx.proofNotes && (
                    <p className="text-[11px] font-mono text-blue-950 dark:text-blue-200 bg-white/90 dark:bg-slate-900 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 break-words">
                      {gestionnaireDetailTx.proofNotes}
                    </p>
                  )}
                  {gestionnaireDetailTx.proofUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-blue-300 dark:border-blue-700 max-h-52 bg-slate-900 flex items-center justify-center p-1">
                      <img 
                        src={gestionnaireDetailTx.proofUrl} 
                        alt="Preuve de transaction" 
                        className="max-h-48 w-auto object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {(tx.status === 'in_progress' || tx.status === 'pending_routing') && (
              <button
                type="button"
                onClick={() => {
                  setGestionnaireProofModalTx(tx);
                  setGestionnaireProofNotes('');
                  setGestionnaireProofImage(null);
                  setGestionnaireProofError(null);
                }}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t("Valider avec Preuve", "Valider avec Preuve")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedReceiptTx(tx)}
              className={`w-full py-3.5 rounded-2xl font-black text-xs text-white active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isCancelled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>{isCancelled ? t("Reçu Annulé (PDF / Partager)", "Reçu Annulé (PDF / Partager)") : t("Reçu Officiel (PDF / Partager)", "Reçu Officiel (PDF / Partager)")}</span>
            </button>

            <button
              type="button"
              onClick={() => setGestionnaireDetailTx(null)}
              className="w-full py-2.5 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center block"
            >
              {t("Retour au flux", "Retour au flux")}
            </button>
          </div>

          {/* Modal Validation if opened from details */}
          {renderGestionnaireProofModal()}
        </div>
      );
    }

    // B. VUE PRINCIPALE : HEADER + BARRE DE FILTRES + CARTES MOBILES + TABLEAU BUREAU
    return (
      <div className="p-3 sm:p-6 w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 font-sans animate-in fade-in pb-24 md:pb-6">
        
        {/* Toast Feedback */}
        {feedback && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-white hover:text-emerald-100 font-extrabold text-sm p-1 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* 1. Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>{t("Flux en Temps Réel", "Flux en Temps Réel")}</span>
              {pendingGestionnaireCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold animate-pulse">
                  {pendingGestionnaireCount} {t("en attente", "en attente")}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {t("Supervision opérationnelle, traitement et validation des transferts numériques (MonCash, Natcash, Digicel, Claro, Altice)", "Supervision opérationnelle, traitement et validation des transferts numériques (MonCash, Natcash, Digicel, Claro, Altice)")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportTransactionsToCSV(gestionnaireFilteredTasks, 'Flux_Temps_Reel_Gestionnaire')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title={t("Exporter en CSV", "Exporter en CSV")}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => exportTransactionsToPDF(gestionnaireFilteredTasks, 'Flux en Temps Réel - Gestionnaire')}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title={t("Télécharger en PDF", "Télécharger en PDF")}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* 2. Full-width Search and Filters Toolbar (Identique à HistoryView) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input Box */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t("Rechercher par nom, téléphone, ou référence TRX...", "Rechercher par nom, téléphone, ou référence TRX...")}
                value={gestionnaireSearchQuery}
                onChange={(e) => setGestionnaireSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-blue-500/20"
              />
              {gestionnaireSearchQuery && (
                <button
                  onClick={() => setGestionnaireSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Operator Filter Dropdown */}
              <select
                value={gestionnaireOperatorFilter}
                onChange={(e) => setGestionnaireOperatorFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">{t("Tous les opérateurs", "Tous les opérateurs")}</option>
                <option value="moncash">MonCash</option>
                <option value="digicel">Digicel</option>
                <option value="claro">Claro</option>
                <option value="altice">Altice</option>
                <option value="natcom">Natcom</option>
                <option value="zelle">Zelle</option>
              </select>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGestionnaireStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    gestionnaireStatusFilter === 'all'
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t("Toutes", "Toutes")} ({totalGestionnaireCount})
                </button>
                <button
                  type="button"
                  onClick={() => setGestionnaireStatusFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                    gestionnaireStatusFilter === 'in_progress'
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{t("En attente", "En attente")} ({pendingGestionnaireCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGestionnaireStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    gestionnaireStatusFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t("Validées", "Validées")} ({completedGestionnaireCount})
                </button>
              </div>

              {/* Date Filters Bar (Tous, Jour, Semaine, Mois, Année) */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar bg-slate-100/80 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                {[
                  { id: 'all', label: t('Tous', 'Tous') },
                  { id: 'today', label: t('Jour', 'Jour') },
                  { id: 'week', label: t('Semaine', 'Semaine') },
                  { id: 'month', label: t('Mois', 'Mois') },
                  { id: 'year', label: t('Année', 'Année') },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setGestionnaireTimeFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                      gestionnaireTimeFilter === f.id
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 3. Main Content: Mobile Stacked Cards & Desktop Data Table */}
        {gestionnaireFilteredTasks.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-950/50">
                      <th className="py-4 px-5">{t("Réf Transaction", "Réf Transaction")}</th>
                      <th className="py-4 px-5">{t("Date & Heure", "Date & Heure")}</th>
                      <th className="py-4 px-5">{t("Opérateur", "Opérateur")}</th>
                      <th className="py-4 px-5">{t("Expéditeur", "Expéditeur")}</th>
                      <th className="py-4 px-5">{t("Bénéficiaire", "Bénéficiaire")}</th>
                      <th className="py-4 px-5 text-right">{t("Montant DOP", "Montant DOP")}</th>
                      <th className="py-4 px-5 text-right">{t("Montant HTG", "Montant HTG")}</th>
                      <th className="py-4 px-5 text-center">{t("Statut", "Statut")}</th>
                      <th className="py-4 px-5 text-center">{t("Actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-sans">
                    {gestionnairePaginatedTasks.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-black text-slate-900 dark:text-white text-xs">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {tx.referenceNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] font-medium">
                          {new Date(tx.createdAt).toLocaleDateString(dateLocale, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <OperatorBadge operator={tx.operator} size="sm" />
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{tx.senderName}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-medium">{tx.senderPhone || '—'}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{tx.receiverName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {tx.receiverPhone}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right font-black font-mono text-slate-900 dark:text-white text-sm whitespace-nowrap">
                          {tx.amountDOP.toLocaleString()} DOP
                        </td>
                        <td className="py-3.5 px-5 text-right font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                          {tx.amountHTG.toLocaleString()} HTG
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          {tx.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>{t("Clôturé", "Clôturé")}</span>
                            </span>
                          ) : tx.status === 'in_progress' || tx.status === 'pending_routing' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-orange-900 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-2.5 py-1 rounded-full border border-orange-300 dark:border-orange-800">
                              <Clock className="w-3 h-3 animate-pulse text-orange-600" />
                              <span>{t("En attente", "En attente")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/60 dark:border-rose-800">
                              {t("Annulé", "Annulé")}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {(tx.status === 'in_progress' || tx.status === 'pending_routing') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setGestionnaireProofModalTx(tx);
                                  setGestionnaireProofNotes('');
                                  setGestionnaireProofImage(null);
                                  setGestionnaireProofError(null);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title={t("Valider avec preuve", "Valider avec preuve")}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{t("Valider", "Valider")}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setGestionnaireDetailTx(tx)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                              title={t("Voir tous les détails", "Voir tous les détails")}
                            >
                              {t("Détails", "Détails")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptTx(tx)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title={t("Télécharger ou partager le reçu PDF", "Télécharger ou partager le reçu PDF")}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t("Reçu PDF", "Reçu PDF")}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Gestionnaire Desktop Pagination */}
              {gestionnaireFilteredTasks.length > GESTIONNAIRE_PAGE_SIZE && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <Pagination
                    currentPage={gestionnairePage}
                    totalPages={gestionnaireTotalPages}
                    onPageChange={setGestionnairePage}
                    totalItems={gestionnaireFilteredTasks.length}
                    itemsPerPage={GESTIONNAIRE_PAGE_SIZE}
                  />
                </div>
              )}
            </div>

            {/* Mobile Stacked Responsive Cards (<md) - EXACTEMENT comme l'historique mobile des agents */}
            <div className="md:hidden space-y-3">
              {gestionnairePaginatedTasks.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Header Row: Operator + Reference + Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <OperatorBadge operator={tx.operator} size="sm" />
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {tx.referenceNumber}
                      </span>
                    </div>

                    {tx.status === 'completed' ? (
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/50">
                        ✓ {t("Clôturé", "Clôturé")}
                      </span>
                    ) : tx.status === 'in_progress' || tx.status === 'pending_routing' ? (
                      <span className="text-[10px] font-black text-orange-900 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-2.5 py-1 rounded-full border border-orange-300 dark:border-orange-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-pulse text-orange-600" /> {t("En attente", "En attente")}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/50 dark:border-rose-900/50">
                        {t("Annulé", "Annulé")}
                      </span>
                    )}
                  </div>

                  {/* Beneficiary & Amount Info */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t("Bénéficiaire", "Bénéficiaire")}</span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {tx.receiverName}
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-400">
                        {tx.receiverPhone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                        {tx.amountDOP.toLocaleString()} DOP
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                        {tx.amountHTG.toLocaleString()} HTG
                      </span>
                    </div>
                  </div>

                  {/* Sender & Agency sub-row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100/60 dark:border-slate-800/40">
                    <span>{t("Exp:", "Exp:")} <strong className="font-semibold text-slate-700 dark:text-slate-300">{tx.senderName}</strong></span>
                    <span>{t("Origine:", "Origine:")} <strong className="font-semibold text-slate-700 dark:text-slate-300">{tx.createdByName}</strong></span>
                  </div>

                  {/* Footer Row: Date/Time + Action Buttons */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString(dateLocale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {(tx.status === 'in_progress' || tx.status === 'pending_routing') && (
                        <button
                          type="button"
                          onClick={() => {
                            setGestionnaireProofModalTx(tx);
                            setGestionnaireProofNotes('');
                            setGestionnaireProofImage(null);
                            setGestionnaireProofError(null);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                          title={t("Valider avec preuve", "Valider avec preuve")}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t("Valider", "Valider")}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setGestionnaireDetailTx(tx)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {t("Détails", "Détails")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                        title={t("Télécharger ou partager le reçu PDF", "Télécharger ou partager le reçu PDF")}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t("Reçu PDF", "Reçu PDF")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Gestionnaire Mobile Pagination */}
              {gestionnaireFilteredTasks.length > GESTIONNAIRE_PAGE_SIZE && (
                <Pagination
                  currentPage={gestionnairePage}
                  totalPages={gestionnaireTotalPages}
                  onPageChange={setGestionnairePage}
                  totalItems={gestionnaireFilteredTasks.length}
                  itemsPerPage={GESTIONNAIRE_PAGE_SIZE}
                  compact
                />
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
              <FolderArchive className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t("Aucune transaction trouvée", "Aucune transaction trouvée")}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                {t("Aucun résultat ne correspond aux filtres de date, de statut, d'opérateur ou de recherche sélectionnés.", "Aucun résultat ne correspond aux filtres de date, de statut, d'opérateur ou de recherche sélectionnés.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setGestionnaireTimeFilter('all');
                setGestionnaireStatusFilter('all');
                setGestionnaireSearchQuery('');
                setGestionnaireOperatorFilter('all');
              }}
              className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              <span>{t("Réinitialiser tous les filtres", "Réinitialiser tous les filtres")}</span>
            </button>
          </div>
        )}

        {/* Modal Validation (if opened from card or table) */}
        {renderGestionnaireProofModal()}

      </div>
    );
  }

  // DEFAULT VIEW: LIST OF TRANSACTIONS IN CLEAN OVERFLOW-FREE ROW LIST
  const QUEUE_PAGE_SIZE = 10;
  const queueTotalPages = Math.ceil(filteredTasks.length / QUEUE_PAGE_SIZE) || 1;
  const queuePaginatedTasks = filteredTasks.slice((queuePage - 1) * QUEUE_PAGE_SIZE, queuePage * QUEUE_PAGE_SIZE);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto font-sans pb-28 md:pb-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>
                {isAgentHaiti 
                  ? t("File des Décaissements Haïti", "File des Décaissements Haïti")
                  : isAgentRD 
                    ? t("Flux des Transferts Guichet", "Flux des Transferts Guichet")
                    : isGestionnaire 
                      ? t("Flux en Temps Réel (Tâches Numériques & MonCash)", "Flux en Temps Réel (Tâches Numériques & MonCash)")
                      : t("Flux en Temps Réel", "Flux en Temps Réel")}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isAgentHaiti 
                ? t("Transactions en attente de versement ou confirmation SMS en Haïti.", "Transactions en attente de versement ou confirmation SMS en Haïti.")
                : isAgentRD
                  ? t("Suivi opérationnel des transferts émis par votre agence.", "Suivi opérationnel des transferts émis par votre agence.")
                  : isGestionnaire
                    ? t("Zone de travail principale : traitement, validation et clôture des transactions MonCash, Digicel, Claro et Altice.", "Zone de travail principale : traitement, validation et clôture des transactions MonCash, Digicel, Claro et Altice.")
                    : t("Cliquez sur une ligne pour ouvrir la page de détails et superviser la transaction.", "Cliquez sur une ligne pour ouvrir la page de détails et superviser la transaction.")}
            </p>
          </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
          {(isAdmin || isGestionnaire) && (
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
              title={t("Ajouter et émettre directement une nouvelle transaction (MonCash, Digicel, Claro, Altice)", "Ajouter et émettre directement une nouvelle transaction (MonCash, Digicel, Claro, Altice)")}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ {t("Ajouter une Transaction", "Ajouter une Transaction")}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stream Overview Bar (2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">{t("Tâches En Cours", "Tâches En Cours")}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{inProgressCount}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{t("Canal Haïti (Cash)", "Canal Haïti (Cash)")}</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{haitiCashCount}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
            <span className="text-sm sm:text-base font-black">🇭🇹</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{t("Canal Numérique", "Canal Numérique")}</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{digitalTelecomCount}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{t("Clôturées", "Clôturées")}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{completedCount}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedStatusFilter('in_progress')}
            className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatusFilter === 'in_progress' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t("En Cours", "En Cours")} ({inProgressCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('completed')}
            className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatusFilter === 'completed' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t("Validées", "Validées")} ({completedCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t("Toutes", "Toutes")}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {isGestionnaire ? (
            <select
              value={selectedOperatorFilter}
              onChange={(e) => setSelectedOperatorFilter(e.target.value)}
              className="bg-purple-50/70 border border-purple-200 text-xs font-bold text-purple-900 px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="all">{t("Périmètre Numérique (Tous)", "Périmètre Numérique (Tous)")}</option>
              <option value="moncash">{t("MonCash (Paiement HT)", "MonCash (Paiement HT)")}</option>
              <option value="digicel">{t("Digicel (Recharge & Services)", "Digicel (Recharge & Services)")}</option>
              <option value="claro">{t("Claro (Recharge RD)", "Claro (Recharge RD)")}</option>
              <option value="altice">{t("Altice (Recharge RD)", "Altice (Recharge RD)")}</option>
              <option value="natcom">{t("Natcom (Data & TopUp)", "Natcom (Data & TopUp)")}</option>
            </select>
          ) : (
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="all">{t("Tous les Canaux", "Tous les Canaux")}</option>
              <option value="haiti_cash">{t("Canal Haïti (Cash-out Agence HT)", "Canal Haïti (Cash-out Agence HT)")}</option>
              <option value="digital_telecom">{t("Canal Numérique (MonCash & TopUp)", "Canal Numérique (MonCash & TopUp)")}</option>
            </select>
          )}

          <div className="relative flex-1 lg:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Rechercher #TX, Bénéficiaire, Agent...", "Rechercher #TX, Bénéficiaire, Agent...")}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
      </div>

      {/* DUAL VIEW: DESKTOP TABLE (hidden md:block) & MOBILE CARDS (md:hidden) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {/* 1. DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/80 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 items-center">
              <div className="col-span-2">{t("Référence & Horodatage", "Référence & Horodatage")}</div>
              <div className="col-span-2">{t("Opérateur", "Opérateur")}</div>
              <div className="col-span-3">{t("Bénéficiaire / Téléphone", "Bénéficiaire / Téléphone")}</div>
              <div className="col-span-2">{t("Attribué À", "Attribué À")}</div>
              <div className="col-span-2 text-right">{t("Montant (HTG)", "Montant (HTG)")}</div>
              <div className="col-span-1 text-center">{t("Action", "Action")}</div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">{t("Aucune tâche en attente dans ce filtre !", "Aucune tâche en attente dans ce filtre !")}</h3>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {queuePaginatedTasks.map((tx) => {
                  const elapsed = getElapsedInfo(tx.createdAt);
                  const isCompleted = tx.status === 'completed';
                  const isCancelled = tx.status === 'cancelled';
                  const isInProgress = tx.status === 'in_progress';

                  return (
                    <div 
                      key={tx.id}
                      onClick={() => setSelectedTxForDetails(tx)}
                      className={`grid grid-cols-12 gap-3 px-5 py-3.5 text-xs items-center cursor-pointer transition-colors hover:bg-slate-100/70 group ${
                        elapsed.isStagnant && isInProgress 
                          ? 'bg-rose-50/40 border-l-4 border-l-rose-500' 
                          : isCompleted 
                            ? 'bg-emerald-50/20' 
                            : isCancelled 
                              ? 'bg-slate-50/70 opacity-75' 
                              : 'bg-white'
                      }`}
                      title={t("Cliquer pour ouvrir la page de transaction et modifier si besoin", "Cliquer pour ouvrir la page de transaction et modifier si besoin")}
                    >
                      
                      {/* 1. ID Transaction & Temps */}
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-xs">
                          {tx.referenceNumber}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {elapsed.text}
                        </span>
                      </div>

                      {/* 2. Opérateur */}
                      <div className="col-span-2 flex items-center">
                        <OperatorBadge operator={tx.operator} />
                      </div>

                      {/* 3. Bénéficiaire & Tel */}
                      <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-900 truncate">{tx.receiverName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">({tx.receiverPhone})</span>
                        <button
                          onClick={(e) => copyToClipboard(e, tx.receiverPhone, tx.id)}
                          className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                          title={t("Copier le numéro", "Copier le numéro")}
                        >
                          {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* 4. Attribué À */}
                      <div className="col-span-2 flex items-center gap-1 font-semibold text-slate-800 truncate">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{tx.assignedToName}</span>
                      </div>

                      {/* 5. Montant à payer HTG */}
                      <div className="col-span-2 text-right font-mono flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <span className="font-black text-emerald-600 text-sm">{tx.amountHTG.toLocaleString()} HTG</span>
                        <span className="text-[10px] font-bold text-slate-400">({tx.amountDOP.toLocaleString()} {t("Pesos", "Pesos")})</span>
                      </div>

                      {/* 6. Quick Action / Open Details Arrow */}
                      <div className="col-span-1 flex items-center justify-end">
                        {isInProgress ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTxForDetails(tx);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                            title={t("Prendre en charge, valider et clôturer avec quittance", "Prendre en charge, valider et clôturer avec quittance")}
                          >
                            <span>{t("Traiter", "Traiter")}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isCompleted ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReceiptTx(tx);
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                            title={t("Consulter et télécharger le reçu", "Consulter et télécharger le reçu")}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t("Reçu", "Reçu")}</span>
                          </button>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-500 flex items-center justify-center transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. MOBILE CARD STACK VIEW (md:hidden) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-xs">{t("Aucune tâche en attente dans ce filtre !", "Aucune tâche en attente dans ce filtre !")}</h3>
            </div>
          ) : (
            queuePaginatedTasks.map((tx) => {
              const elapsed = getElapsedInfo(tx.createdAt);
              const isCompleted = tx.status === 'completed';
              const isCancelled = tx.status === 'cancelled';
              const isInProgress = tx.status === 'in_progress';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxForDetails(tx)}
                  className={`p-3.5 space-y-2.5 transition-colors cursor-pointer ${
                    elapsed.isStagnant && isInProgress 
                      ? 'bg-rose-50/50 border-l-4 border-l-rose-500' 
                      : isCompleted 
                        ? 'bg-emerald-50/20' 
                        : isCancelled 
                          ? 'bg-slate-50/70 opacity-75' 
                          : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Top row: Reference + Elapsed pill + Status badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {tx.referenceNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        elapsed.isStagnant && isInProgress
                          ? 'bg-rose-100 text-rose-700 font-black'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {elapsed.text}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isCancelled
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {isCompleted ? t('Validé', 'Validé') : isCancelled ? t('Annulé', 'Annulé') : t('En cours', 'En cours')}
                    </span>
                  </div>

                  {/* Operator and Receiver Info */}
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 text-xs truncate">{tx.receiverName}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>{tx.receiverPhone}</span>
                        <button
                          onClick={(e) => copyToClipboard(e, tx.receiverPhone, tx.id)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                          title={t("Copier le numéro", "Copier le numéro")}
                        >
                          {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <OperatorBadge operator={tx.operator} />
                    </div>
                  </div>

                  {/* Amounts & Assigned Agent */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[150px]">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{tx.assignedToName || tx.createdByName || t('Non assigné')}</span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-black text-emerald-600 text-sm block leading-tight">
                        {tx.amountHTG.toLocaleString()} HTG
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ({tx.amountDOP.toLocaleString()} {t("Pesos", "Pesos")})
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    {isInProgress ? (
                      <button
                        onClick={() => setSelectedTxForDetails(tx)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <span>{t("Traiter la tâche", "Traiter la tâche")}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : isCompleted ? (
                      <button
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t("Consulter le Reçu", "Consulter le Reçu")}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTxForDetails(tx)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{t("Détails", "Détails")}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* General Queue Pagination */}
        {filteredTasks.length > QUEUE_PAGE_SIZE && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              currentPage={queuePage}
              totalPages={queueTotalPages}
              onPageChange={setQueuePage}
              totalItems={filteredTasks.length}
              itemsPerPage={QUEUE_PAGE_SIZE}
            />
          </div>
        )}
      </div>

      {/* MODAL: AJOUTER UNE NOUVELLE TRANSACTION (GESTIONNAIRE / ADMIN) */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {t("Ajouter une Transaction Directe", "Ajouter une Transaction Directe")}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("Saisie et exécution directe par le", "Saisie et exécution directe par le")} {isGestionnaire ? t("Gestionnaire", "Gestionnaire") : t("Superviseur", "Superviseur")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTxModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title={t("Fermer", "Fermer")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewTx} className="space-y-4 text-xs">
              
              {/* 1. Opérateur Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {t("Sélectionnez le Service / Opérateur :", "Sélectionnez le Service / Opérateur :")}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['moncash', 'digicel', 'claro', 'altice', 'natcom', 'natcash'] as OperatorCode[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setNewTxOperator(op)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        newTxOperator === op
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="font-extrabold uppercase text-slate-900 text-[11px]">{op}</div>
                      <div className="text-[9px] text-slate-500 font-medium capitalize mt-0.5">
                        {op === 'claro' || op === 'altice' ? 'RD 🇩🇴' : 'Haïti 🇭🇹'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Type de Service */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewTxServiceType('transfer')}
                  className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer ${
                    newTxServiceType === 'transfer' ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {t("Transfert Portefeuille", "Transfert Portefeuille")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxServiceType('topup_mobile')}
                  className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer ${
                    newTxServiceType === 'topup_mobile' ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {t("Recharge Mobile", "Recharge Mobile")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxServiceType('cash_out')}
                  className={`p-2 rounded-xl border text-center font-bold text-xs cursor-pointer ${
                    newTxServiceType === 'cash_out' ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {t("Décaissement Espèces", "Décaissement Espèces")}
                </button>
              </div>

              {/* 3. Expéditeur & Bénéficiaire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Expéditeur */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    {t("Expéditeur (Client)", "Expéditeur (Client)")}
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{t("Nom Complet", "Nom Complet")}</label>
                    <input
                      type="text"
                      value={newTxSenderName}
                      onChange={(e) => setNewTxSenderName(e.target.value)}
                      placeholder="Ex: Carlos Santana"
                      className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{t("Téléphone", "Téléphone")}</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newTxSenderPhone}
                      onChange={(e) => setNewTxSenderPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                      placeholder="+1 809 000 0000"
                      className="w-full bg-white border border-slate-200 text-xs font-mono px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                {/* Bénéficiaire */}
                {(() => {
                  const isNoBeneficiary = ['digicel', 'claro', 'altice', 'natcom'].includes(newTxOperator);
                  return (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {isNoBeneficiary ? `${t("Numéro Destinataire", "Numéro Destinataire")} (${newTxOperator.toUpperCase()})` : t("Bénéficiaire (Destinataire)", "Bénéficiaire (Destinataire)")}
                      </span>
                      {!isNoBeneficiary && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">{t("Nom du Destinataire", "Nom du Destinataire")}</label>
                          <input
                            type="text"
                            value={newTxReceiverName}
                            onChange={(e) => setNewTxReceiverName(e.target.value)}
                            placeholder="Ex: Jean Baptiste"
                            className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                            required
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isNoBeneficiary ? t("Numéro de Téléphone à Recharger", "Numéro de Téléphone à Recharger") : t("Numéro Récepteur", "Numéro Récepteur")}
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={newTxReceiverPhone}
                          onChange={(e) => setNewTxReceiverPhone(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder={newTxOperator === 'claro' || newTxOperator === 'altice' ? '809XXXXXXX' : '509XXXXXXX'}
                          className="w-full bg-white border border-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                          required
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 4. Montant & Conversion */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/70 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-purple-950 mb-1">
                      {t("Montant Encaissé (Pesos DOP) :", "Montant Encaissé (Pesos DOP) :")}
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={newTxAmountDOP}
                        onChange={(e) => setNewTxAmountDOP(e.target.value)}
                        className="w-full bg-white border border-purple-300 text-sm font-mono font-black text-slate-900 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      {t("Montant Converti à Délivrer", "Montant Converti à Délivrer")}
                    </span>
                    <span className="text-xl font-black text-purple-900 font-mono block mt-0.5">
                      {Math.round((parseFloat(newTxAmountDOP) || 0) * dopToHtgRate).toLocaleString()} HTG
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold block">
                      {t("Taux", "Taux")} : 100 DOP = {Math.round(dopToHtgRate * 100)} HTG
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Option Clôture Immédiate avec Preuve */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTxImmediateClose}
                    onChange={(e) => setNewTxImmediateClose(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-extrabold text-emerald-950 text-xs">
                    ⚡ {t("J'ai déjà effectué cette transaction (Clôturer immédiatement avec preuve)", "J'ai déjà effectué cette transaction (Clôturer immédiatement avec preuve)")}
                  </span>
                </label>

                {newTxImmediateClose && (
                  <div className="space-y-3 pt-2 border-t border-emerald-100">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t("Capture d'écran / Photo du Reçu (Requis) :", "Capture d'écran / Photo du Reçu (Requis) :")}
                      </label>
                      {newTxProofImage ? (
                        <div className="p-2.5 bg-white border border-emerald-300 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={newTxProofImage}
                              alt="Quittance"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                            <span className="text-[11px] font-bold text-emerald-800 truncate">
                              ✓ {t("Quittance attachée", "Quittance attachée")}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewTxProofImage(null)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-emerald-300 hover:border-emerald-500 bg-white rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px] font-bold text-slate-700">
                            {t("Joindre la capture ou le reçu opérateur", "Joindre la capture ou le reçu opérateur")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewTxProofUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddTxModalOpen(false);
                    setActiveTab('guichet');
                  }}
                  className="text-purple-700 hover:text-purple-900 font-bold text-xs underline cursor-pointer"
                >
                  {t("Ouvrir dans le Guichet Plein Écran ↗", "Ouvrir dans le Guichet Plein Écran ↗")}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTxModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    {t("Annuler", "Annuler")}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {newTxImmediateClose ? t("Créer & Clôturer avec Preuve", "Créer & Clôturer avec Preuve") : t("Créer la Transaction", "Créer la Transaction")}
                    </span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
