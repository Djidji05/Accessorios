import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Landmark, 
  Percent, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  PlusCircle, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  Check, 
  X, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  ChevronDown, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeeklySettlement } from '../types';

export const WeeklySettlementsView: React.FC = () => {
  const { settlements, transactions, currentUser, recordAgentDeposit } = useApp();

  const isAdmin = currentUser.role === 'admin';
  const isGestionnaire = currentUser.role === 'gestionnaire';
  const isAgentRD = currentUser.role === 'agent_rd';
  const isAgentHaiti = currentUser.role === 'agent_haiti';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');
  const [selectedWeekLabel, setSelectedWeekLabel] = useState<string>('all');
  const [showWeekCalendarDropdown, setShowWeekCalendarDropdown] = useState<boolean>(false);

  // Modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedSettlementForDeposit, setSelectedSettlementForDeposit] = useState<WeeklySettlement | null>(null);
  const [modalAgentSearch, setModalAgentSearch] = useState('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const openModalForNewDeposit = () => {
    setIsDepositModalOpen(true);
    setDepositAmount('');
    setModalAgentSearch('');
    if (isAgentRD) {
      setSelectedAgentId(currentUser.id);
      const mySettlements = roleScopedSettlements.filter(
        (s) => s.agentId === currentUser.id || s.agentName.toLowerCase() === currentUser.name.toLowerCase()
      );
      const activeSettlement = mySettlements.find((s) => s.remainingBalance > 0) || mySettlements[0] || null;
      setSelectedSettlementForDeposit(activeSettlement);
    } else {
      setSelectedAgentId('');
      setSelectedSettlementForDeposit(null);
    }
  };

  const openModalForSettlement = (s: WeeklySettlement) => {
    setIsDepositModalOpen(true);
    setSelectedAgentId(s.agentId);
    setSelectedSettlementForDeposit(s);
    setDepositAmount('');
    setModalAgentSearch('');
  };

  const closeModal = () => {
    setIsDepositModalOpen(false);
    setSelectedAgentId('');
    setSelectedSettlementForDeposit(null);
    setDepositAmount('');
    setModalAgentSearch('');
  };

  const getWeekInfo = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    const day = d.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNo = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

    const startStr = monday.toISOString().split('T')[0];
    const endStr = sunday.toISOString().split('T')[0];
    const fmt = (dt: Date) => dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

    return {
      weekLabel: `Semaine ${weekNo} (${fmt(monday)} - ${fmt(sunday)}/${monday.getFullYear()})`,
      startDate: startStr,
      endDate: endStr,
    };
  };

  // Merge recorded settlements with live transactions to ensure every week with activity is present
  const allSettlementsWithLiveTx = React.useMemo(() => {
    const list = [...settlements];

    // Find all agent RD transactions
    const relevantTx = transactions.filter((t) => {
      if (t.status === 'cancelled') return false;
      if (isAgentRD) {
        return (
          t.createdByRole === 'agent_rd' &&
          (t.createdByName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
            (currentUser.username && t.createdByName?.toLowerCase().includes(currentUser.username.toLowerCase())) ||
            t.createdByNode === currentUser.nodeId)
        );
      }
      return t.createdByRole === 'agent_rd';
    });

    // Group transactions by week label & agent
    const weekGroups = new Map<string, { agentId: string; agentName: string; agentRole: any; weekLabel: string; startDate: string; endDate: string; totalCollected: number; totalCommission: number }>();

    relevantTx.forEach((tx) => {
      const wInfo = getWeekInfo(tx.createdAt);
      if (!wInfo) return;
      const key = `${tx.createdByName || 'agent'}_${wInfo.weekLabel}`;
      const existing = weekGroups.get(key);
      const comm = tx.commissionDOP || Math.round((tx.amountDOP || 0) * 0.01);
      if (!existing) {
        weekGroups.set(key, {
          agentId: tx.createdByNode || 'agent_node',
          agentName: tx.createdByName || 'Agent RD',
          agentRole: 'agent_rd',
          weekLabel: wInfo.weekLabel,
          startDate: wInfo.startDate,
          endDate: wInfo.endDate,
          totalCollected: tx.amountDOP || 0,
          totalCommission: comm,
        });
      } else {
        existing.totalCollected += tx.amountDOP || 0;
        existing.totalCommission += comm;
      }
    });

    // Merge groups into list
    weekGroups.forEach((grp, key) => {
      const idx = list.findIndex(
        (s) =>
          s.weekLabel === grp.weekLabel &&
          (s.agentName.toLowerCase() === grp.agentName.toLowerCase() ||
            (s.agentId && s.agentId === grp.agentId))
      );
      if (idx >= 0) {
        const existing = list[idx];
        const newCollected = Math.max(existing.totalCollected, grp.totalCollected);
        const newComm = Math.max(existing.totalCommission, grp.totalCommission);
        const newNet = Math.max(0, newCollected - newComm);
        const newRemaining = Math.max(0, newNet - existing.amountDeposited);
        const newStatus = newRemaining === 0 ? 'paid' : (existing.amountDeposited > 0 ? 'partial' : 'pending');
        list[idx] = {
          ...existing,
          totalCollected: newCollected,
          totalCommission: newComm,
          netAmountToPay: newNet,
          remainingBalance: newRemaining,
          status: newStatus,
        };
      } else {
        const netToPay = Math.max(0, grp.totalCollected - grp.totalCommission);
        list.push({
          id: `stl_dyn_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
          agentId: grp.agentId,
          agentName: grp.agentName,
          agentRole: grp.agentRole,
          weekLabel: grp.weekLabel,
          startDate: grp.startDate,
          endDate: grp.endDate,
          currency: 'DOP',
          totalCollected: grp.totalCollected,
          totalCommission: grp.totalCommission,
          netAmountToPay: netToPay,
          amountDeposited: 0,
          remainingBalance: netToPay,
          status: 'pending',
          deposits: [],
        });
      }
    });

    // Also ensure current week exists for agent even if 0 transactions
    if (isAgentRD) {
      const currentWeekInfo = getWeekInfo(new Date().toISOString());
      if (currentWeekInfo) {
        const hasCurrent = list.some(
          (s) =>
            s.weekLabel === currentWeekInfo.weekLabel &&
            (s.agentId === currentUser.id || s.agentName.toLowerCase() === currentUser.name.toLowerCase())
        );
        if (!hasCurrent) {
          list.push({
            id: `stl_cur_${currentUser.id}`,
            agentId: currentUser.id,
            agentName: currentUser.name,
            agentRole: 'agent_rd',
            weekLabel: currentWeekInfo.weekLabel,
            startDate: currentWeekInfo.startDate,
            endDate: currentWeekInfo.endDate,
            currency: 'DOP',
            totalCollected: 0,
            totalCommission: 0,
            netAmountToPay: 0,
            amountDeposited: 0,
            remainingBalance: 0,
            status: 'paid',
            deposits: [],
          });
        }
      }
    }

    return list;
  }, [settlements, transactions, isAgentRD, currentUser]);

  // Filter settlements based on user role (Agent Haïti is excluded as Admin pays them directly outside the app)
  const roleScopedSettlements = allSettlementsWithLiveTx.filter((s) => {
    if (s.agentRole === 'agent_haiti') return false;
    if (isAgentRD) {
      return s.agentId === currentUser.id || s.agentName.toLowerCase() === currentUser.name.toLowerCase();
    }
    return true; // Admin and Gestionnaire see collecting agents (Agent RD)
  });

  // Weekly Agent Summary Banner calculations (Filtered according to selected week or cumulative)
  const agentTargetSettlements = selectedWeekLabel === 'all'
    ? roleScopedSettlements
    : roleScopedSettlements.filter((s) => s.weekLabel === selectedWeekLabel);

  const agentBannerCommission = agentTargetSettlements.reduce((acc, s) => acc + s.totalCommission, 0);
  const agentBannerDueToAdmin = agentTargetSettlements.reduce((acc, s) => acc + s.remainingBalance, 0);
  const agentBannerDeposited = agentTargetSettlements.reduce((acc, s) => acc + s.amountDeposited, 0);
  const agentBannerCollected = agentTargetSettlements.reduce((acc, s) => acc + s.totalCollected, 0);

  // Unique weeks list ordered chronologically descending
  const availableWeeks = Array.from(
    new Set(roleScopedSettlements.map((s) => s.weekLabel))
  ).map((label) => {
    const matching = roleScopedSettlements.filter((s) => s.weekLabel === label);
    const sample = matching[0];
    const totalRemaining = matching.reduce((acc, curr) => acc + curr.remainingBalance, 0);
    return {
      label,
      startDate: sample?.startDate || '',
      endDate: sample?.endDate || '',
      settlementsCount: matching.length,
      hasRemaining: totalRemaining > 0,
    };
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  const currentWeekIndex = availableWeeks.findIndex((w) => w.label === selectedWeekLabel);

  const goToPreviousWeek = () => {
    if (selectedWeekLabel === 'all') {
      if (availableWeeks.length > 0) setSelectedWeekLabel(availableWeeks[0].label);
    } else if (currentWeekIndex < availableWeeks.length - 1) {
      setSelectedWeekLabel(availableWeeks[currentWeekIndex + 1].label);
    }
  };

  const goToNextWeek = () => {
    if (selectedWeekLabel === 'all') return;
    if (currentWeekIndex > 0) {
      setSelectedWeekLabel(availableWeeks[currentWeekIndex - 1].label);
    } else {
      setSelectedWeekLabel('all');
    }
  };

  const filteredSettlements = roleScopedSettlements.filter((s) => {
    if (selectedWeekLabel !== 'all' && s.weekLabel !== selectedWeekLabel) return false;
    if (statusFilter === 'paid' && s.remainingBalance > 0) return false;
    if (statusFilter === 'partial' && s.remainingBalance === 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.agentName.toLowerCase().includes(q) ||
        s.weekLabel.toLowerCase().includes(q) ||
        s.currency.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorted settlements to distinguish current week from past weeks
  const sortedSettlements = [...roleScopedSettlements].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const currentWeekSettlement = sortedSettlements.length > 0 ? sortedSettlements[0] : null;
  const pastWeekSettlements = sortedSettlements.length > 1 ? sortedSettlements.slice(1) : [];

  // 1. Current week calculations
  const currentWeekRemainingDOP = currentWeekSettlement && currentWeekSettlement.currency === 'DOP'
    ? currentWeekSettlement.remainingBalance
    : 0;

  const currentWeekRemainingHTG = currentWeekSettlement && currentWeekSettlement.currency === 'HTG'
    ? currentWeekSettlement.remainingBalance
    : 0;

  const currentWeekDue = isAgentHaiti ? currentWeekRemainingHTG : currentWeekRemainingDOP;

  // 2. Past Debt calculations (Carte Dette - report des semaines précédentes non entièrement payées)
  const pastDebtDOP = pastWeekSettlements
    .filter((s) => s.currency === 'DOP')
    .reduce((acc, s) => acc + s.remainingBalance, 0);

  const pastDebtHTG = pastWeekSettlements
    .filter((s) => s.currency === 'HTG')
    .reduce((acc, s) => acc + s.remainingBalance, 0);

  const pastDebtDue = isAgentHaiti ? pastDebtHTG : pastDebtDOP;

  // 3. Totals
  const totalCollectedDOP = roleScopedSettlements
    .filter((s) => s.currency === 'DOP')
    .reduce((acc, s) => acc + s.totalCollected, 0);

  const totalCommissionsDOP = roleScopedSettlements
    .filter((s) => s.currency === 'DOP')
    .reduce((acc, s) => acc + s.totalCommission, 0);

  const totalDepositedDOP = roleScopedSettlements
    .filter((s) => s.currency === 'DOP')
    .reduce((acc, s) => acc + s.amountDeposited, 0);

  const totalCollectedHTG = roleScopedSettlements
    .filter((s) => s.currency === 'HTG')
    .reduce((acc, s) => acc + s.totalCollected, 0);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlementForDeposit) return;

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedback({ type: 'error', message: 'Veuillez saisir un montant de versement valide supérieur à 0.' });
      return;
    }

    const res = recordAgentDeposit(selectedSettlementForDeposit.id, amount, 'Versement en espèces / virement');
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      closeModal();
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const currencySymbol = isAgentHaiti ? 'HTG' : 'DOP';

  return (
    <div className={`p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-sans animate-in fade-in ${isAdmin ? 'pb-6' : 'pb-36 md:pb-6'}`}>
      
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in ${
            feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white hover:text-emerald-100 font-black text-sm p-1">
            ✕
          </button>
        </div>
      )}





      {/* PAGE HEADER & ACTION BUTTON */}
      {(isAdmin || isGestionnaire) ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Gestion des Dépôts Agents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Enregistrez les versements d'espèces et dépôts bancaires reçus des agents.
              </p>
            </div>
          </div>

          <button
            onClick={openModalForNewDeposit}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enregistrer un Dépôt Agent</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Historique de mes Dépôts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Tous les dépôts et versements enregistrés pour vous par l'Administration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Control & Filter Bar (Calendrier par Semaine) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
            <CalendarDays className="w-4 h-4" />
          </div>
          <select
            value={selectedWeekLabel}
            onChange={(e) => setSelectedWeekLabel(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white pl-9 pr-8 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs appearance-none"
          >
            <option value="all">📅 Toutes les Semaines ({availableWeeks.length})</option>
            {availableWeeks.map((w) => (
              <option key={w.label} value={w.label}>
                {w.label} ({w.startDate} - {w.endDate}) {w.hasRemaining ? '🟠' : '🟢'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 🌟 BANNIÈRE STATISTIQUES AGENT : COMMISSIONS RÉCOLTÉES DANS LA SEMAINE & MONTANT DÛ À L'ADMIN */}
      {isAgentRD && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-700/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/30">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Bilan Hebdomadaire Guichet & Versements ({selectedWeekLabel === 'all' ? 'Toutes les Semaines' : selectedWeekLabel})
                </span>
                <h3 className="text-base font-black text-white">
                  Mes Commissions & Situation avec l'Administration
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black font-mono shadow-xs ${
                agentBannerDueToAdmin > 0 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {agentBannerDueToAdmin > 0 ? `🔴 DÛ À L'ADMIN : ${agentBannerDueToAdmin.toLocaleString()} DOP` : '🟢 TOUT PAYÉ (0 DOP)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Commissions Récoltées dans la Semaine */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Commissions Récoltées
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400 font-mono">
                +{agentBannerCommission.toLocaleString()} DOP
              </p>
              <p className="text-[10px] text-emerald-300/80 font-medium">
                Gains générés sur les transactions
              </p>
            </div>

            {/* 2. Nombre d'Argent Dû à l'Admin */}
            <div className={`p-4 rounded-2xl border space-y-1 ${
              agentBannerDueToAdmin > 0
                ? 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  agentBannerDueToAdmin > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  Montant Dû à l'Admin
                </span>
                {agentBannerDueToAdmin > 0 ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className={`text-xl font-black font-mono ${
                agentBannerDueToAdmin > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {agentBannerDueToAdmin.toLocaleString()} DOP
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {agentBannerDueToAdmin > 0 ? 'Solde net restant à verser' : 'Aucun montant restant dû'}
              </p>
            </div>

            {/* 3. Dépôts Versés à l'Admin */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-blue-400">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Déposé à l'Admin
                </span>
                <Landmark className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-black text-blue-400 font-mono">
                {agentBannerDeposited.toLocaleString()} DOP
              </p>
              <p className="text-[10px] text-blue-300/80 font-medium">
                Versements enregistrés par l'admin
              </p>
            </div>

            {/* 4. Total Encaissé au Guichet */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Total Encaissé
                </span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xl font-black text-white font-mono">
                {agentBannerCollected.toLocaleString()} DOP
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Volume brut des opérations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Weekly Settlements: Card List view for Agent RD, Table View for Admin/Gestionnaire */}
      {isAgentRD ? (
        /* LISTE DE CARDS DE DÉPÔTS POUR AGENT RD */
        <div className="space-y-3">
          <div className="px-2 flex items-center justify-between">
            <span className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Liste de mes Dépôts ({filteredSettlements.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">Par calendrier hebdomadaire</span>
          </div>

          {filteredSettlements.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-2 border border-slate-200 dark:border-slate-800">
              <Landmark className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Aucun dépôt ne correspond à ce filtre</h3>
              <p className="text-[11px] text-slate-400">Veuillez sélectionner une autre semaine dans le calendrier ci-dessus.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSettlements.map((s) => {
                const isPaid = s.remainingBalance === 0;

                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs space-y-3"
                  >
                    {/* Header: Week Label & Status Badge */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-bold">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs">{s.weekLabel}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">{s.startDate} au {s.endDate}</p>
                        </div>
                      </div>

                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>🟢 Tout Payé</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>🟠 Reste à Payer</span>
                        </span>
                      )}
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Encaissé</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{s.totalCollected.toLocaleString()} {s.currency}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Commissions (%)</span>
                        <span className="font-extrabold text-emerald-600">+{s.totalCommission.toLocaleString()} {s.currency}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Net Dû Admin</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">{s.netAmountToPay.toLocaleString()} {s.currency}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Déposé à l'Admin</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">{s.amountDeposited.toLocaleString()} {s.currency}</span>
                      </div>
                    </div>

                    {/* Footer highlight: Reste à Payer */}
                    <div className="flex justify-between items-center px-1 pt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">Solde Reste à Payer :</span>
                      <span className={`text-xs sm:text-sm font-black font-mono ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isPaid ? '0 DOP (Semaine réglée)' : `${s.remainingBalance.toLocaleString()} ${s.currency}`}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VUE TABLEAU POUR ADMIN / GESTIONNAIRE */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
            <span className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Relevé des Liquidations Hebdomadaires ({filteredSettlements.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">Calcul automatique selon %</span>
          </div>

          {filteredSettlements.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Aucun relevé hebdomadaire ne correspond</h3>
              <p className="text-xs text-slate-500">Essayez de modifier vos critères de recherche ou filtres.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/40 dark:bg-slate-900/20">
                    <th className="py-3.5 px-5">Semaine & Période</th>
                    <th className="py-3.5 px-5">Agent & Rôle</th>
                    <th className="py-3.5 px-5 text-right">Total Encaissé</th>
                    <th className="py-3.5 px-5 text-right">Commissions (%)</th>
                    <th className="py-3.5 px-5 text-right">Net Dû Admin</th>
                    <th className="py-3.5 px-5 text-right">Déposé à l'Admin</th>
                    <th className="py-3.5 px-5 text-right">Reste à Payer</th>
                    <th className="py-3.5 px-5 text-center">Statut Réglement</th>
                    {(isAdmin || isGestionnaire) && <th className="py-3.5 px-5 text-center">Action Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredSettlements.map((s) => {
                    const isPaid = s.remainingBalance === 0;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Semaine */}
                        <td className="py-4 px-5">
                          <div className="font-black text-slate-900 dark:text-slate-100 text-xs">{s.weekLabel}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {s.startDate} au {s.endDate}
                          </div>
                        </td>

                        {/* Agent */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{s.agentName}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{s.agentRole.replace('_', ' ')}</div>
                        </td>

                        {/* Total Encaissé */}
                        <td className="py-4 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {s.totalCollected.toLocaleString()} {s.currency}
                        </td>

                        {/* Commissions (%) */}
                        <td className="py-4 px-5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{s.totalCommission.toLocaleString()} {s.currency}
                        </td>

                        {/* Net Dû Admin */}
                        <td className="py-4 px-5 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                          {s.netAmountToPay.toLocaleString()} {s.currency}
                        </td>

                        {/* Déposé à l'Admin */}
                        <td className="py-4 px-5 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                          {s.amountDeposited.toLocaleString()} {s.currency}
                        </td>

                        {/* Reste à Payer */}
                        <td className="py-4 px-5 text-right font-mono font-black text-amber-700 dark:text-amber-400">
                          {s.remainingBalance === 0 ? '0' : `${s.remainingBalance.toLocaleString()} ${s.currency}`}
                        </td>

                        {/* Statut Badge */}
                        <td className="py-4 px-5 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>🟢 Tout Payé</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>🟠 Reste à Payer</span>
                            </span>
                          )}
                        </td>

                        {/* Action Admin */}
                        {(isAdmin || isGestionnaire) && (
                          <td className="py-4 px-5 text-center">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 font-mono">
                                —
                              </span>
                            ) : (
                              <button
                                onClick={() => openModalForSettlement(s)}
                                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                                <span>Versement</span>
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL SAISIE VERSEMENT ADMIN */}
      {isDepositModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Enregistrer un Versement Agent</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Saisie du dépôt effectué par l'agent à l'Admin</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Agent & Week Selectors for Admin */}
            {(isAdmin || isGestionnaire) && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80">
                {/* Search Bar for Agent */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rechercher un Agent par nom</span>
                    </span>
                    {modalAgentSearch && (
                      <button
                        type="button"
                        onClick={() => setModalAgentSearch('')}
                        className="text-[10px] text-slate-400 hover:text-slate-700 font-bold"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalAgentSearch}
                      onChange={(e) => setModalAgentSearch(e.target.value)}
                      placeholder="Tapez le nom de l'agent (ex: Achmad, Pierre)..."
                      className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-900 pl-9 pr-7 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
                    />
                    {modalAgentSearch && (
                      <button
                        type="button"
                        onClick={() => setModalAgentSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-black text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdowns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sélectionner l'Agent *</span>
                    </label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => {
                        const newAgentId = e.target.value;
                        setSelectedAgentId(newAgentId);
                        if (!newAgentId) {
                          setSelectedSettlementForDeposit(null);
                          setDepositAmount('');
                          return;
                        }
                        const weeksForAgent = roleScopedSettlements.filter((s) => s.agentId === newAgentId);
                        if (weeksForAgent.length > 0) {
                          const target = weeksForAgent.find((s) => s.remainingBalance > 0) || weeksForAgent[0];
                          setSelectedSettlementForDeposit(target);
                          setDepositAmount('');
                        }
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choisir un Agent dans la liste --</option>
                      {Array.from(
                        new Map(roleScopedSettlements.map((s) => [s.agentId, { id: s.agentId, name: s.agentName, role: s.agentRole }])).values()
                      )
                        .filter((ag) => ag.name.toLowerCase().includes(modalAgentSearch.toLowerCase()))
                        .map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sélectionner la Semaine *</span>
                    </label>
                    <select
                      value={selectedSettlementForDeposit ? selectedSettlementForDeposit.id : ''}
                      disabled={!selectedAgentId}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        const target = roleScopedSettlements.find((s) => s.id === targetId);
                        if (target) {
                          setSelectedSettlementForDeposit(target);
                          setDepositAmount('');
                        } else {
                          setSelectedSettlementForDeposit(null);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {!selectedAgentId ? (
                        <option value="">-- Sélectionnez d'abord un Agent --</option>
                      ) : (
                        <>
                          <option value="">-- Choisir une Semaine --</option>
                          {roleScopedSettlements
                            .filter((s) => s.agentId === selectedAgentId)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.weekLabel.split(' ')[0]} {s.weekLabel.split(' ')[1]} — {s.remainingBalance > 0 ? `🟠 Reste: ${s.remainingBalance.toLocaleString()} ${s.currency}` : '🟢 Tout Payé'}
                              </option>
                            ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Quick select pills when searching */}
                {modalAgentSearch && (
                  <div className="pt-1 border-t border-slate-200/60">
                    <p className="text-[10px] text-slate-500 font-semibold mb-1">Résultats de recherche :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        new Map(roleScopedSettlements.map((s) => [s.agentId, { id: s.agentId, name: s.agentName, role: s.agentRole }])).values()
                      )
                        .filter((ag) => ag.name.toLowerCase().includes(modalAgentSearch.toLowerCase()))
                        .map((ag) => (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => {
                              setSelectedAgentId(ag.id);
                              const weeksForAgent = roleScopedSettlements.filter((s) => s.agentId === ag.id);
                              if (weeksForAgent.length > 0) {
                                const target = weeksForAgent.find((s) => s.remainingBalance > 0) || weeksForAgent[0];
                                setSelectedSettlementForDeposit(target);
                                setDepositAmount('');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              selectedAgentId === ag.id
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            👤 {ag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Target Agent & Week Summary Box */}
            {selectedSettlementForDeposit ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Agent Sélectionné :</span>
                  <span className="font-black text-slate-900">{selectedSettlementForDeposit.agentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Semaine Concernée :</span>
                  <span className="font-bold text-slate-800">{selectedSettlementForDeposit.weekLabel}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 font-mono">
                  <span className="text-slate-500 font-bold">Total Dû Net :</span>
                  <span className="font-black text-slate-900">{selectedSettlementForDeposit.netAmountToPay.toLocaleString()} {selectedSettlementForDeposit.currency}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 font-bold">Déjà Déposé à l'Admin :</span>
                  <span className="font-bold text-blue-700">{selectedSettlementForDeposit.amountDeposited.toLocaleString()} {selectedSettlementForDeposit.currency}</span>
                </div>
                <div className="flex justify-between font-mono font-black text-amber-700 pt-1 border-t border-slate-200/60">
                  <span>Actuellement Reste à Payer :</span>
                  <span>{selectedSettlementForDeposit.remainingBalance.toLocaleString()} {selectedSettlementForDeposit.currency}</span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1.5 animate-in fade-in">
                <User className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Aucun Agent sélectionné</p>
                <p className="text-[11px] text-slate-400">Veuillez choisir un agent et une semaine ci-dessus pour afficher le bilan de liquidation.</p>
              </div>
            )}

            {/* Deposit Form */}
            {(() => {
              const isFullyPaid = selectedSettlementForDeposit ? selectedSettlementForDeposit.remainingBalance === 0 : false;

              return (
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Montant du Dépôt / Versement {selectedSettlementForDeposit ? `(${selectedSettlementForDeposit.currency})` : ''} *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        disabled={!selectedSettlementForDeposit || isFullyPaid}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={
                          !selectedSettlementForDeposit
                            ? "Sélectionnez d'abord un agent et une semaine..."
                            : isFullyPaid
                            ? "🟢 Semaine entièrement réglée (Aucun solde dû)"
                            : `Saisir le montant (ex: ${selectedSettlementForDeposit.remainingBalance})`
                        }
                        className="w-full bg-slate-50 border border-slate-200 text-sm font-black text-slate-900 px-3.5 py-2.5 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        required={!isFullyPaid}
                      />
                      {selectedSettlementForDeposit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                          {selectedSettlementForDeposit.currency}
                        </span>
                      )}
                    </div>
                    {isFullyPaid ? (
                      <p className="text-[11px] text-emerald-700 font-extrabold mt-1.5 flex items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>🟢 Cette semaine est déjà 100% payée. Aucun versement supplémentaire ne peut être saisi.</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">L'application recalculera instantanément le solde reste à payer.</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedSettlementForDeposit || isFullyPaid || !depositAmount || parseFloat(depositAmount) <= 0}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shadow-none"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Valider le Versement</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
