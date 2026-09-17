import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building, 
  Phone, 
  Eye, 
  Printer, 
  Search, 
  Filter, 
  X, 
  AlertCircle,
  Activity,
  FileCheck,
  Send,
  Pencil
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from '../components/OperatorBadge';
import { Transaction, OperatorCode, TransactionStatus } from '../types';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';

export const SupervisionAgentsView: React.FC = () => {
  const { 
    transactions, 
    currentUser, 
    availableUsers, 
    setSelectedReceiptTx, 
    auditLogs,
    updateTransaction
  } = useApp();

  const isAdmin = currentUser.role === 'admin';

  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(2026, 8, 5),
    endDate: new Date(2026, 8, 12),
    label: '7 derniers jours (Last week)'
  });

  const [selectedAgentTab, setSelectedAgentTab] = useState<'all' | 'agent_rd' | 'agent_haiti'>('all');
  const [anomalyTx, setAnomalyTx] = useState<Transaction | null>(null);
  const [anomalyReason, setAnomalyReason] = useState<string>('bad_number');
  const [anomalyNotes, setAnomalyNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedTx, setInspectedTx] = useState<Transaction | null>(null);

  // Admin Edit Transaction modal state
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editSenderName, setEditSenderName] = useState<string>('');
  const [editSenderPhone, setEditSenderPhone] = useState<string>('');
  const [editReceiverName, setEditReceiverName] = useState<string>('');
  const [editReceiverPhone, setEditReceiverPhone] = useState<string>('');
  const [editOperator, setEditOperator] = useState<OperatorCode>('moncash');
  const [editAmountDOP, setEditAmountDOP] = useState<number | string>('');
  const [editStatus, setEditStatus] = useState<TransactionStatus>('in_progress');

  const handleOpenEditTx = (tx: Transaction) => {
    setEditTx(tx);
    setEditSenderName(tx.senderName);
    setEditSenderPhone(tx.senderPhone);
    setEditReceiverName(tx.receiverName);
    setEditReceiverPhone(tx.receiverPhone);
    setEditOperator(tx.operator);
    setEditAmountDOP(tx.amountDOP);
    setEditStatus(tx.status);
  };

  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTx) return;

    const res = updateTransaction(editTx.id, {
      senderName: editSenderName,
      senderPhone: editSenderPhone,
      receiverName: editReceiverName,
      receiverPhone: editReceiverPhone,
      operator: editOperator as OperatorCode,
      amountDOP: Number(editAmountDOP),
      status: editStatus as TransactionStatus,
    });

    // Auto-resolve any pending anomaly on this transaction
    setReportedAnomalies((prev) =>
      prev.map((a) =>
        a.referenceNumber === editTx.referenceNumber || a.txId === editTx.id
          ? { ...a, status: 'resolved' as const }
          : a
      )
    );

    setEditTx(null);
    setFeedback({
      type: 'success',
      message: res?.message || `Transaction #${editTx.referenceNumber} modifiée et régularisée par l'Administrateur !`,
    });
  };

  // Per-team agent search filter
  const [agentRDSearch, setAgentRDSearch] = useState<string>('');
  const [agentHaitiSearch, setAgentHaitiSearch] = useState<string>('');

  // List of reported anomalies stored in component state for demonstration & audit
  const [reportedAnomalies, setReportedAnomalies] = useState<Array<{
    txId: string;
    referenceNumber: string;
    reason: string;
    notes: string;
    reportedAt: string;
    reportedBy: string;
    status: 'pending_admin' | 'resolved';
  }>>([
    {
      txId: 'tx-anomaly-1',
      referenceNumber: '#TX-8819',
      reason: 'Erreur de saisie téléphone récepteur',
      notes: 'L\'expéditeur a signalé une erreur sur le dernier chiffre du numéro bénéficiaire Haïti.',
      reportedAt: 'Aujourd\'hui 12:15',
      reportedBy: currentUser.name,
      status: 'pending_admin'
    }
  ]);

  // Équipes
  const agentRDUsers = availableUsers.filter(u => u.role === 'agent_rd');
  const agentHaitiUsers = availableUsers.filter(u => u.role === 'agent_haiti');

  const filteredRDUsers = agentRDUsers.filter(u =>
    u.name.toLowerCase().includes(agentRDSearch.toLowerCase()) ||
    u.location.toLowerCase().includes(agentRDSearch.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(agentRDSearch.toLowerCase()))
  );

  const filteredHaitiUsers = agentHaitiUsers.filter(u =>
    u.name.toLowerCase().includes(agentHaitiSearch.toLowerCase()) ||
    u.location.toLowerCase().includes(agentHaitiSearch.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(agentHaitiSearch.toLowerCase()))
  );

  // Transactions metrics
  const todayRDTransactions = transactions.filter(t => t.createdByRole === 'agent_rd' || t.createdByName.toLowerCase().includes('achmad'));
  const totalDOPCollected = todayRDTransactions.reduce((acc, t) => acc + t.amountDOP, 0);

  const todayHaitiTasks = transactions.filter(t => t.operator === 'natcash' || t.operator === 'natcom');
  const completedHaitiTasks = todayHaitiTasks.filter(t => t.status === 'completed');
  const pendingHaitiTasks = todayHaitiTasks.filter(t => t.status === 'in_progress');
  const totalHTGDisbursed = completedHaitiTasks.reduce((acc, t) => acc + t.amountHTG, 0);

  // SLA calculation (> 15 min wait)
  const delayedTasksCount = transactions.filter(t => {
    if (t.status !== 'in_progress') return false;
    const diffMin = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60);
    return diffMin > 15;
  }).length;

  const handleOpenReportAnomaly = (tx: Transaction) => {
    setAnomalyTx(tx);
    setAnomalyReason('bad_number');
    setAnomalyNotes('');
  };

  const handleSubmitAnomaly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anomalyTx) return;

    const reasonLabels: Record<string, string> = {
      bad_number: 'Mauvais numéro récepteur en Haïti',
      wrong_amount: 'Montant erroné saisi par l\'agent',
      duplicate: 'Suspicion de transaction en doublon',
      wrong_receiver: 'Erreur de nom bénéficiaire',
      network_issue: 'Problème réseau / API opérateur',
      other: 'Autre anomalie de conformité'
    };

    const newAnomaly = {
      txId: anomalyTx.id,
      referenceNumber: anomalyTx.referenceNumber,
      reason: reasonLabels[anomalyReason] || anomalyReason,
      notes: anomalyNotes.trim() || 'Signalement transmis pour arbitrage et correction sécurisée.',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reportedBy: currentUser.name,
      status: 'pending_admin' as const
    };

    setReportedAnomalies([newAnomaly, ...reportedAnomalies]);

    setFeedback({
      type: 'success',
      message: `Anomalie sur la transaction ${anomalyTx.referenceNumber} transmise à l'administration.`
    });

    setAnomalyTx(null);
    setTimeout(() => setFeedback(null), 5000);
  };

  // Filtered transactions for quality control review
  const filteredQualityTx = transactions.filter(t => {
    if (selectedAgentTab === 'agent_rd' && t.createdByRole !== 'agent_rd') return false;
    if (selectedAgentTab === 'agent_haiti' && (t.operator !== 'natcash' && t.operator !== 'natcom')) return false;
    
    let matchesDate = true;
    if (selectedRange && selectedRange.startDate && selectedRange.endDate) {
      const txDate = new Date(t.createdAt);
      const start = new Date(selectedRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedRange.endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = txDate >= start && txDate <= end;
    }
    if (!matchesDate) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.referenceNumber.toLowerCase().includes(q) ||
        t.receiverName.toLowerCase().includes(q) ||
        t.receiverPhone.includes(q) ||
        t.senderName.toLowerCase().includes(q) ||
        t.operator.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 font-sans">
      
      {/* 1. Header & Operational Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-md flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isAdmin ? "Supervision Administrative & Équipes Réseau" : "Supervision Opérationnelle & Équipes"}
              </h1>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {isAdmin ? "Espace Administration • Contrôle & Arbitrage" : "Espace Superviseur • Contrôle Qualité"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Suivi en temps réel de l'activité des guichets en République Dominicaine et des opérations en Haïti.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Calendar & Date Range Selector */}
          <DateRangePicker value={selectedRange} onChange={setSelectedRange} />

          {/* Security Rule Pill */}
          <div className="p-3 px-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-200 block text-[11px]">
                {isAdmin ? "Pouvoir d'Arbitrage Administrateur :" : "Règle de Contrôle Qualité :"}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAdmin
                  ? "Droit de supervision intégrale • Arbitrage et régularisation en direct."
                  : "Droit de regard étendu • Corrections soumises à l'Admin."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-2xs bg-emerald-600 text-white border-emerald-600 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white hover:text-emerald-100 underline">
            Fermer
          </button>
        </div>
      )}

      {/* 2. Global Supervision KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* KPI 1: Active Agents */}
        <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Agents au Poste
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {availableUsers.filter(u => u.status === 'online').length} / {availableUsers.length}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connectés au réseau
          </p>
        </div>

        {/* KPI 2: Total Encaissement RD */}
        <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Encaissé Guichets (R.D.)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalDOPCollected.toLocaleString()} DOP
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {todayRDTransactions.length} dossiers saisis
          </p>
        </div>

        {/* KPI 3: Total Décaissement Haïti */}
        <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Décaissé Terrain (Haïti)
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {totalHTGDisbursed.toLocaleString()} HTG
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {completedHaitiTasks.length} versement(s) effectué(s)
          </p>
        </div>

        {/* KPI 4: Pending in Haiti queue */}
        <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
            En Attente de Versement
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {pendingHaitiTasks.length} dossiers
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {delayedTasksCount > 0 ? `${delayedTasksCount} tâche(s) > 15m (SLA)` : 'Traitement régulier'}
          </p>
        </div>

        {/* KPI 5: Anomalies Signalées */}
        <div className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isAdmin ? "Arbitrages & Signalements" : "Signalements Qualité"}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {reportedAnomalies.length} dossier{reportedAnomalies.length > 1 ? 's' : ''}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isAdmin ? "Dossiers à arbitrer en direct" : "Transmis à l'arbitrage"}
          </p>
        </div>

      </div>

      {/* 3. Teams Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TEAM R.D. (GUICHETS EN CAISSE) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">République Dominicaine — Guichets</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Encaissement et saisie des bordereaux en agence</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap self-start sm:self-auto">
              {agentRDUsers.length} Agent(s) actif(s)
            </span>
          </div>

          {/* Search bar inside team card */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={agentRDSearch}
              onChange={(e) => setAgentRDSearch(e.target.value)}
              placeholder="Rechercher un agent R.D. par nom, pseudo, lieu..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Compact Scrollable Agent List Container */}
          <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredRDUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Aucun agent R.D. ne correspond à la recherche.</p>
            ) : (
              filteredRDUsers.map((agent) => {
                const agentTx = transactions.filter((t) => t.createdByName === agent.name || t.createdByRole === 'agent_rd');
                const agentDOP = agentTx.reduce((acc, t) => acc + t.amountDOP, 0);

                return (
                  <div
                    key={agent.id}
                    className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-2xs flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{agent.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">@{agent.username}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{agent.location} • Agence ({agent.nodeId})</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3.5 font-mono text-[11px] whitespace-nowrap flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-tight">Dossiers</span>
                        <span className="font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">{agentTx.length}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-tight">Encaissé</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{agentDOP.toLocaleString()} DOP</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] whitespace-nowrap flex-shrink-0">
                        🟢 En ligne
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent RD entries */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              Derniers bordereaux encaissés en agence
            </span>
            <div className="max-h-[190px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs pr-1">
              {todayRDTransactions.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs font-medium">Aucun bordereau récent.</div>
              ) : (
                todayRDTransactions.map(tx => (
                  <div key={tx.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{tx.referenceNumber}</span>
                      <OperatorBadge operator={tx.operator} size="sm" />
                      <span className="text-slate-600 dark:text-slate-300 truncate">{tx.senderName} ➔ {tx.receiverName}</span>
                    </div>
                    <div className="text-right font-mono whitespace-nowrap pl-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{tx.amountDOP.toLocaleString()} DOP</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TEAM HAÏTI (DÉCAISSEMENT & VERSIONS) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Haïti — Opérations Mobile & Cash</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Décaissement mobile money</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap self-start sm:self-auto">
              {agentHaitiUsers.length} Agent(s) actif(s)
            </span>
          </div>

          {/* Search bar inside Haïti team card */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={agentHaitiSearch}
              onChange={(e) => setAgentHaitiSearch(e.target.value)}
              placeholder="Rechercher un agent Haïti par nom, pseudo, lieu..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Compact Scrollable Agent List Container */}
          <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredHaitiUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Aucun agent Haïti ne correspond à la recherche.</p>
            ) : (
              filteredHaitiUsers.map((agent) => {
                const haitiTx = transactions.filter((t) => t.operator === 'natcash' || t.operator === 'natcom');
                const completedCount = haitiTx.filter((t) => t.status === 'completed').length;
                const totalHTG = haitiTx.filter((t) => t.status === 'completed').reduce((acc, t) => acc + t.amountHTG, 0);

                return (
                  <div
                    key={agent.id}
                    className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-2xs flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{agent.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">@{agent.username}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{agent.location} • Agence ({agent.nodeId})</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3.5 font-mono text-[11px] whitespace-nowrap flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-tight">Décaissements</span>
                        <span className="font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">{completedCount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-tight">Volume HTG</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{totalHTG.toLocaleString()} HTG</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px] whitespace-nowrap flex-shrink-0">
                        🔵 File Active
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent disbursements */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              Derniers décaissements validés en Haïti
            </span>
            <div className="max-h-[190px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs pr-1">
              {todayHaitiTasks.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs font-medium">Aucun décaissement récent.</div>
              ) : (
                todayHaitiTasks.map(tx => (
                  <div key={tx.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{tx.referenceNumber}</span>
                      <OperatorBadge operator={tx.operator} size="sm" />
                      <span className="text-slate-600 dark:text-slate-300 truncate">{tx.receiverName} ({tx.receiverPhone})</span>
                    </div>
                    <div className="text-right font-mono whitespace-nowrap pl-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{tx.amountHTG.toLocaleString()} HTG</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Anomaly Reporting & Quality Control Panel */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Contrôle Qualité : Dossiers Transmis en Arbitrage
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historique des signalements de saisie remontés par la supervision à l'administrateur système.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {reportedAnomalies.length} Signalement(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3 px-4">Réf Transaction</th>
                <th className="py-3 px-4">Motif de l'Anomalie</th>
                <th className="py-3 px-4">Notes d'Explication</th>
                <th className="py-3 px-4">Heure Signalement</th>
                <th className="py-3 px-4">Superviseur</th>
                <th className="py-3 px-4 text-center">Statut Résolution</th>
                {isAdmin && <th className="py-3 px-4 text-center">Action Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportedAnomalies.map((anom, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{anom.referenceNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{anom.reason}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs max-w-md">{anom.notes}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{anom.reportedAt}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{anom.reportedBy}</td>
                  <td className="py-3 px-4 text-center">
                    {anom.status === 'resolved' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                        🟢 Régularisé par Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                        Arbitrage Admin
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-center">
                      {anom.status === 'pending_admin' ? (
                        <button
                          onClick={() => {
                            const targetTx = transactions.find((t) => t.referenceNumber === anom.referenceNumber || t.id === anom.txId);
                            if (targetTx) {
                              handleOpenEditTx(targetTx);
                            } else {
                              setReportedAnomalies(reportedAnomalies.map((a, i) => i === idx ? { ...a, status: 'resolved' as const } : a));
                              setFeedback({ type: 'success', message: `Dossier ${anom.referenceNumber} régularisé avec succès par l'Administrateur !` });
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
                          title="Modifier la transaction et régulariser l'anomalie"
                        >
                          <Pencil className="w-3.5 h-3.5 text-white" />
                          <span>Modifier & Régulariser</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">🟢 Résolu</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Quality Review Table for Transactions */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Registre Général & Inspection des Flux
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Revue des bordereaux en direct avec capacité de signalement immédiat en cas d'erreur de saisie.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-nowrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSelectedAgentTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedAgentTab === 'all' 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedAgentTab('agent_rd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedAgentTab === 'agent_rd' 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                R.D.
              </button>
              <button
                onClick={() => setSelectedAgentTab('agent_haiti')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedAgentTab === 'agent_haiti' 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Haïti
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher #TX, nom, tél..."
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none w-56"
              />
            </div>
          </div>
        </div>

        {/* Transactions Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-4">Réf Transaction</th>
                <th className="py-3.5 px-4">Opérateur</th>
                <th className="py-3.5 px-4">Expéditeur (R.D.)</th>
                <th className="py-3.5 px-4">Bénéficiaire (Haïti)</th>
                <th className="py-3.5 px-4 text-right">Montant DOP</th>
                <th className="py-3.5 px-4 text-right">Montant HTG</th>
                <th className="py-3.5 px-4 text-center">Statut SLA</th>
                <th className="py-3.5 px-4 text-center">Actions de Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQualityTx.map((tx) => {
                const anomaly = reportedAnomalies.find(
                  (a) => a.referenceNumber === tx.referenceNumber || a.txId === tx.id
                );

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{tx.referenceNumber}</span>
                        {anomaly && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                              anomaly.status === 'resolved'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
                            }`}
                            title={`Signalement d'Anomalie (${anomaly.status === 'resolved' ? 'Résolu' : 'En attente'}) : ${anomaly.reason}`}
                          >
                            <AlertTriangle className={`w-3 h-3 ${anomaly.status === 'resolved' ? 'text-emerald-600' : 'text-amber-600 dark:text-amber-400'}`} />
                            {anomaly.status === 'resolved' ? 'Régularisé' : 'Anomalie'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <OperatorBadge operator={tx.operator} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{tx.senderName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.senderPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{tx.receiverName}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-semibold">{tx.receiverPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {tx.amountDOP.toLocaleString()} DOP
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {tx.amountHTG.toLocaleString()} HTG
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {tx.status === 'completed' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                          Certifié
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInspectedTx(tx)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          title="Inspecter le dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          title="Voir le reçu"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin ? (
                          /* Bouton Plume pour modification Admin */
                          <button
                            onClick={() => handleOpenEditTx(tx)}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                            title="Modifier la transaction (Plume Admin)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          /* Bouton Signaler pour Superviseur / Agent */
                          <button
                            onClick={() => handleOpenReportAnomaly(tx)}
                            className="p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                            title="Signaler une anomalie à l'administrateur"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REPORT ANOMALY FORM */}
      {anomalyTx && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Signaler une Anomalie — {anomalyTx.referenceNumber}
                </h3>
              </div>
              <button onClick={() => setAnomalyTx(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAnomaly} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">Dossier : {anomalyTx.referenceNumber} ({anomalyTx.operator.toUpperCase()})</p>
                <p className="text-slate-500">Expéditeur: {anomalyTx.senderName} ➔ Bénéficiaire: {anomalyTx.receiverName} ({anomalyTx.receiverPhone})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nature de l'Erreur ou du Problème :
                </label>
                <select
                  value={anomalyReason}
                  onChange={(e) => setAnomalyReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none"
                >
                  <option value="bad_number">Mauvais numéro récepteur en Haïti</option>
                  <option value="wrong_amount">Montant erroné saisi par l'agent</option>
                  <option value="duplicate">Suspicion de transaction en doublon</option>
                  <option value="wrong_receiver">Erreur de nom bénéficiaire</option>
                  <option value="network_issue">Problème réseau / API opérateur</option>
                  <option value="other">Autre anomalie de conformité</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Détails et instructions pour l'Administrateur :
                </label>
                <textarea
                  rows={3}
                  value={anomalyNotes}
                  onChange={(e) => setAnomalyNotes(e.target.value)}
                  placeholder="Ex: Le client signale que le dernier chiffre est un 7..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 p-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnomalyTx(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmettre à l'Admin
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: INSPECT TRANSACTION DETAILS */}
      {inspectedTx && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Inspection de la Transaction {inspectedTx.referenceNumber}
                </h3>
                <p className="text-xs text-slate-500">Contrôle de conformité opérationnelle</p>
              </div>
              <button onClick={() => setInspectedTx(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Opérateur</span>
                  <OperatorBadge operator={inspectedTx.operator} size="sm" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Statut</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{inspectedTx.status}</span>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="font-bold text-slate-900 dark:text-slate-100">Expéditeur (R.D.) : {inspectedTx.senderName} ({inspectedTx.senderPhone})</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">Bénéficiaire (Haïti) : {inspectedTx.receiverName} ({inspectedTx.receiverPhone})</p>
                <p className="font-mono font-bold text-emerald-600">Montants : {inspectedTx.amountDOP.toLocaleString()} DOP ➔ {inspectedTx.amountHTG.toLocaleString()} HTG</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <p className="text-slate-500 font-medium">Saisie effectuée par : <span className="font-bold text-slate-800 dark:text-slate-200">{inspectedTx.createdByName}</span> ({inspectedTx.createdAt})</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: ADMIN EDIT TRANSACTION (PLUME MODAL) */}
      {editTx && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Modification Admin — {editTx.referenceNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Régularisation et mise à jour des paramètres du bordereau
                  </p>
                </div>
              </div>
              <button onClick={() => setEditTx(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTx} className="space-y-4">
              {/* Expéditeur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom Expéditeur (R.D.)
                  </label>
                  <input
                    type="text"
                    value={editSenderName}
                    onChange={(e) => setEditSenderName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone Expéditeur
                  </label>
                  <input
                    type="text"
                    value={editSenderPhone}
                    onChange={(e) => setEditSenderPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Bénéficiaire */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom Bénéficiaire (Haïti)
                  </label>
                  <input
                    type="text"
                    value={editReceiverName}
                    onChange={(e) => setEditReceiverName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone Bénéficiaire
                  </label>
                  <input
                    type="text"
                    value={editReceiverPhone}
                    onChange={(e) => setEditReceiverPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Opérateur & Montant DOP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opérateur Réseau
                  </label>
                  <select
                    value={editOperator}
                    onChange={(e) => setEditOperator(e.target.value as OperatorCode)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="moncash">MonCash</option>
                    <option value="natcash">Natcash</option>
                    <option value="digicel">Digicel</option>
                    <option value="natcom">Natcom</option>
                    <option value="claro">Claro</option>
                    <option value="altice">Altice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Montant DOP
                  </label>
                  <input
                    type="number"
                    value={editAmountDOP}
                    onChange={(e) => setEditAmountDOP(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Statut de la Transaction
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TransactionStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none font-bold"
                >
                  <option value="in_progress">En cours (In Progress)</option>
                  <option value="completed">Certifié / Validé (Completed)</option>
                  <option value="cancelled">Annulé / Rejeté (Cancelled)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditTx(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Enregistrer & Régulariser
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
