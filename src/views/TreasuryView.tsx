import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCcw, 
  Building2, 
  Smartphone, 
  PlusCircle, 
  ArrowDownLeft, 
  AlertTriangle, 
  Download, 
  DollarSign, 
  CheckCircle2, 
  Layers, 
  History, 
  Settings2,
  X,
  Send,
  Zap,
  TrendingUp,
  Activity,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode } from '../types';
import { OperatorBadge } from '../components/OperatorBadge';
import { 
  TreasuryEvolutionChart, 
  TreasuryPieChart, 
  TreasuryFlowBarChart 
} from '../components/charts/TreasuryCharts';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';
import { getOperatorLogo } from '../utils/operatorLogos';

import { exportTreasuryReportToCSV, exportTreasuryReportToPDF } from '../utils/exportUtils';

// Mock recent treasury operations log
const initialTreasuryLogs = [
  { id: 'TR-9081', type: 'recharge_float', operator: 'moncash', account: 'Flotte Principal MonCash', amount: 250000, currency: 'HTG', status: 'completed', date: 'Aujourd\'hui 11:42', author: 'Admin' },
  { id: 'TR-9080', type: 'bank_deposit', operator: 'bank_rd', account: 'Banreservas RD #882', amount: 500000, currency: 'DOP', status: 'completed', date: 'Aujourd\'hui 10:15', author: 'Jean-Marc (Caissier)' },
  { id: 'TR-9079', type: 'recharge_float', operator: 'natcash', account: 'Natcash Business Float', amount: 150000, currency: 'HTG', status: 'completed', date: 'Hier 16:30', author: 'Admin' },
  { id: 'TR-9078', type: 'cash_transfer', operator: 'cash_haiti', account: 'Caisse Agence Cap-Haïtien', amount: 100000, currency: 'HTG', status: 'completed', date: 'Hier 14:10', author: 'Pierre (Agent Cap-Haïtien)' },
];

export const TreasuryView: React.FC = () => {
  const { 
    accountBalances, 
    currentUser, 
    rechargeAccount, 
    transactions,
    dopToHtgRate,
    usdToHtgRate,
    serviceCommissionRates,
    adminCommissionRate
  } = useApp();
  const [logs, setLogs] = useState(initialTreasuryLogs);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('moncash');
  const [rechargeAmount, setRechargeAmount] = useState<number>(100000);
  const [rechargeNote, setRechargeNote] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calendar Date Range Filter
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours',
  });

  // Taux de conversion USD -> DOP (1 USD ≈ 60 DOP, dérivé de USD/HTG vs DOP/HTG)
  const usdToDopRate = (usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 60.0;
  const zelleCommRate = serviceCommissionRates['zelle'] ?? adminCommissionRate ?? 1.5;

  // Filtrage temporel précis des transactions
  const isTxInDateRange = (t: any, range: DateRange) => {
    if (!t.createdAt) return false;
    const txDate = new Date(t.createdAt);
    if (isNaN(txDate.getTime())) return false;

    const { preset, startDate, endDate } = range;
    const now = new Date();

    if (preset === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (preset === 'yesterday') {
      const yest = new Date();
      yest.setDate(now.getDate() - 1);
      return txDate.toDateString() === yest.toDateString();
    }
    if (preset === 'last_7_days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= sevenDaysAgo;
    }
    if (preset === 'last_30_days' || preset === 'this_month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return txDate >= thirtyDaysAgo;
    }
    if (preset === 'last_month') {
      const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return txDate >= firstDayPrevMonth && txDate <= lastDayPrevMonth;
    }
    if (startDate && endDate) {
      return txDate >= new Date(startDate) && txDate <= new Date(endDate);
    }
    return true;
  };

  // Transactions valides de la période (exclut les transactions annulées pour la trésorerie)
  const validPeriodTxs = transactions.filter((t) => {
    if (t.status === 'cancelled') return false;
    return isTxInDateRange(t, selectedDateRange);
  });

  const hasSystemHistory = transactions.length > 0;

  // Transactions Zelle & Calculs dédiés en USD sur la période
  const zelleTxs = validPeriodTxs.filter(t => t.operator === 'zelle');
  const liveZelleUSD = zelleTxs.reduce((sum, t) => sum + (t.amountUSD || (t.amountDOP ? t.amountDOP / usdToDopRate : 0)), 0);
  const totalZelleVolumeUSD = (liveZelleUSD > 0 || hasSystemHistory) ? liveZelleUSD : 5300;
  const totalZelleCommissionUSD = Math.round(totalZelleVolumeUSD * (zelleCommRate / 100) * 100) / 100;
  const totalZelleCommissionDOP = Math.round(totalZelleCommissionUSD * usdToDopRate);
  const totalZelleVolumeDOP = Math.round(totalZelleVolumeUSD * usdToDopRate);
  const totalZelleVolumeHTG = Math.round(totalZelleVolumeUSD * (usdToHtgRate || 140.5));

  // --- CALCULS DU REVENU GLOBAL DE LA PLATEFORME SUR LA PÉRIODE SÉLECTIONNÉE ---
  const liveFeesDOP = validPeriodTxs.reduce((sum, t) => {
    if (t.operator === 'zelle' || t.amountUSD) {
      const amtUSD = t.amountUSD || (t.amountDOP ? t.amountDOP / usdToDopRate : 0);
      const feeUSD = amtUSD * 0.035;
      return sum + Math.round(feeUSD * usdToDopRate);
    }
    return sum + (t.feeDOP || Math.round(t.amountDOP * 0.03));
  }, 0);
  const totalFeesDOP = (liveFeesDOP > 0 || hasSystemHistory) ? liveFeesDOP : 48500;

  const liveAdminCommissionsDOP = validPeriodTxs.reduce((sum, t) => {
    const commRate = serviceCommissionRates[t.operator] ?? adminCommissionRate ?? 1.0;
    if (t.operator === 'zelle' || t.amountUSD) {
      const amtUSD = t.amountUSD || (t.amountDOP ? t.amountDOP / usdToDopRate : 0);
      const commUSD = amtUSD * (commRate / 100);
      return sum + Math.round(commUSD * usdToDopRate);
    }
    return sum + (t.commissionDOP || Math.round(t.amountDOP * (commRate / 100)));
  }, 0);
  const totalAdminCommissionsDOP = (liveAdminCommissionsDOP > 0 || hasSystemHistory) ? liveAdminCommissionsDOP : 24800;

  const totalPlatformRevenueDOP = totalFeesDOP + totalAdminCommissionsDOP;
  const totalPlatformRevenueHTG = Math.round(totalPlatformRevenueDOP * dopToHtgRate);
  const totalPlatformRevenueUSD = Math.round((totalPlatformRevenueDOP / usdToDopRate) * 100) / 100;

  const OPERATOR_CARDS_CONFIG: Array<{
    code: OperatorCode;
    name: string;
    symbol: string;
    badgeBg: string;
    badgeText: string;
    currencyPrimary: 'HTG' | 'DOP' | 'USD';
  }> = [
    { code: 'natcash', name: 'Natcash', symbol: 'NC', badgeBg: 'bg-slate-900 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'moncash', name: 'MonCash', symbol: 'MC', badgeBg: 'bg-slate-900 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'natcom', name: 'Natcom', symbol: 'NAT', badgeBg: 'bg-slate-900 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'claro', name: 'Claro', symbol: 'CLA', badgeBg: 'bg-slate-100 text-slate-800 border border-slate-300', badgeText: 'RD', currencyPrimary: 'DOP' },
    { code: 'altice', name: 'Altice', symbol: 'ALT', badgeBg: 'bg-slate-100 text-slate-800 border border-slate-300', badgeText: 'RD', currencyPrimary: 'DOP' },
    { code: 'digicel', name: 'Digicel', symbol: 'DIG', badgeBg: 'bg-slate-900 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'zelle', name: 'Zelle', symbol: 'ZEL', badgeBg: 'bg-slate-100 text-slate-800 border border-slate-300', badgeText: 'US', currencyPrimary: 'USD' },
  ];

  // Dynamic calculation for volume transited per operator during selected date period
  const getOperatorVolumeData = (opCode: OperatorCode) => {
    const opTxs = validPeriodTxs.filter((t) => t.operator === opCode);
    const liveHTG = opTxs.reduce((sum, t) => sum + (t.amountHTG || 0), 0);
    const liveDOP = opTxs.reduce((sum, t) => sum + (t.amountDOP || 0), 0);
    const liveUSD = opTxs.reduce((sum, t) => sum + (t.amountUSD || (t.amountDOP ? Math.round(t.amountDOP / usdToDopRate) : 0)), 0);
    const liveCount = opTxs.length;

    if (hasSystemHistory) {
      return {
        htg: liveHTG,
        dop: liveDOP,
        usd: liveUSD,
        count: liveCount,
      };
    }

    const mult = 
      selectedDateRange.preset === 'today' ? 1 :
      selectedDateRange.preset === 'yesterday' ? 0.85 :
      selectedDateRange.preset === 'last_30_days' || selectedDateRange.preset === 'this_month' ? 4.2 : 2.5;

    const mockBaselines: Record<OperatorCode, { htg: number; dop: number; usd: number; count: number }> = {
      natcash: { htg: Math.round(620000 * mult), dop: Math.round(263000 * mult), usd: 0, count: Math.round(18 * mult) },
      moncash: { htg: Math.round(1450000 * mult), dop: Math.round(617000 * mult), usd: 0, count: Math.round(42 * mult) },
      natcom: { htg: Math.round(380000 * mult), dop: Math.round(161000 * mult), usd: 0, count: Math.round(12 * mult) },
      claro: { htg: Math.round(290000 * mult), dop: Math.round(123000 * mult), usd: 0, count: Math.round(15 * mult) },
      altice: { htg: Math.round(210000 * mult), dop: Math.round(89000 * mult), usd: 0, count: Math.round(9 * mult) },
      digicel: { htg: Math.round(890000 * mult), dop: Math.round(378000 * mult), usd: 0, count: Math.round(28 * mult) },
      zelle: { htg: Math.round(750000 * mult), dop: Math.round(319000 * mult), usd: Math.round(5300 * mult), count: Math.round(7 * mult) },
    };

    const base = mockBaselines[opCode] || { htg: 0, dop: 0, usd: 0, count: 0 };
    return {
      htg: base.htg,
      dop: base.dop,
      usd: base.usd,
      count: base.count,
    };
  };

  const getVolumeMetrics = () => {
    const totalVolHTG = validPeriodTxs.reduce((sum, tx) => sum + (tx.amountHTG || 0), 0);
    const label = selectedDateRange.preset === 'today' 
      ? 'Volume Traité (Aujourd\'hui)'
      : selectedDateRange.preset === 'yesterday'
      ? 'Volume Traité (Hier)'
      : selectedDateRange.preset === 'this_month' || selectedDateRange.preset === 'last_30_days'
      ? 'Volume Traité (30 jours)'
      : selectedDateRange.preset === 'last_month'
      ? 'Volume Traité (Mois dernier)'
      : `Volume Traité (${selectedDateRange.label})`;

    return {
      volume: totalVolHTG.toLocaleString(),
      diff: totalVolHTG > 0 ? `${validPeriodTxs.length} tx validée(s)` : '0 tx sur la période',
      label
    };
  };
  const volumeMetrics = getVolumeMetrics();

  const totalDOP = accountBalances
    .filter(b => b.currency === 'DOP')
    .reduce((acc, curr) => acc + curr.balance, 0);

  const totalHTG = accountBalances
    .filter(b => b.currency === 'HTG')
    .reduce((acc, curr) => acc + curr.balance, 0);

  const totalUSD = accountBalances
    .filter(b => b.currency === 'USD')
    .reduce((acc, curr) => acc + curr.balance, 0);

  // Natcom partage le même compte que Natcash (décrédité ensemble). Pas de carte séparée ni d'injection flotte pour Natcom.
  const displayAccounts = accountBalances.filter(b => b.operator !== 'natcom');

  // Identify float warning (< 10,000)
  const lowFloatAccounts = displayAccounts.filter(b => b.balance < 10000);

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const acc = accountBalances.find(b => b.id === selectedAccountId);
    if (!acc) return;

    const result = await rechargeAccount(acc.id, rechargeAmount, rechargeNote);

    // Add recharge log
    const newLog = {
      id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'recharge_float',
      operator: acc.operator,
      account: acc.name,
      amount: rechargeAmount,
      currency: acc.currency,
      status: 'completed',
      date: 'À l\'instant',
      author: `${currentUser.name} (${currentUser.role})`
    };

    setLogs([newLog, ...logs]);
    setFeedback(result.message || `Flotte ${acc.name} réapprovisionnée avec succès (+${rechargeAmount.toLocaleString()} ${acc.currency}) !`);
    setShowRechargeModal(false);
    setRechargeAmount(100000);
    setRechargeNote('');

    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto font-sans animate-in fade-in pb-28 md:pb-6">
      
      {/* 1. CLEAN ENTERPRISE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800 dark:text-slate-200" />
            <span>Trésorerie & Solde des Comptes</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Suivi des réserves bancaires en Pesos (RD), Gourdes (Haïti) et Dollars (Zelle).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-start sm:justify-end">
          <DateRangePicker value={selectedDateRange} onChange={setSelectedDateRange} />

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
              title="Réapprovisionner une Flotte"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Injecter Flotte</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportTreasuryReportToCSV(accountBalances, validPeriodTxs, `Alexis_Transferencia_Tresorerie_${selectedDateRange.preset || 'export'}`, logs)}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Exporter Rapport CSV Financier avec Journal des Opérations"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => exportTreasuryReportToPDF(accountBalances, validPeriodTxs, `Rapport Financier & Trésorerie (${selectedDateRange.label})`, logs)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-900 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Générer & Télécharger le Rapport PDF Financier avec Journal des Opérations"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* GUIDE DE LECTURE EN UN COUP D'ŒIL */}
      <div className="bg-emerald-50/70 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/40 p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
            💡
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-emerald-300">Comment lire cette page facilement ?</p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] sm:text-xs">
              <strong className="text-slate-900 dark:text-white">1. Soldes Réels :</strong> L'argent disponible pour payer les clients. &nbsp;•&nbsp; 
              <strong className="text-slate-900 dark:text-white">2. Badges Vert/Rouge :</strong> Indiquent si le portefeuille est suffisant ou doit être rechargé. &nbsp;•&nbsp; 
              <strong className="text-slate-900 dark:text-white">3. Devises :</strong> DOP = Pesos Dominicains, HTG = Gourdes Haïtiennes, USD = Dollars US.
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold flex justify-between items-center shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs underline font-bold cursor-pointer">Fermer</button>
        </div>
      )}

      {/* LOW FLOAT ALERTS BANNER (IF APPLICABLE) */}
      {lowFloatAccounts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-900 dark:text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Alerte Sécurité Liquidité</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Comptes sous le seuil critique (10 000) :{' '}
                <span className="font-bold underline">{lowFloatAccounts.map(a => a.name).join(', ')}</span>.
              </p>
            </div>
          </div>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                setSelectedAccountId(lowFloatAccounts[0].id);
                setShowRechargeModal(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap transition-all self-end sm:self-auto cursor-pointer"
            >
              Injecter Flotte
            </button>
          )}
        </div>
      )}

      {/* 1b. REVENU TOTAL & PERFORMANCE FINANCIÈRE DE LA PLATEFORME */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-md space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Revenu Total & Performance Plateforme</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                Vue consolidée : Frais Guichet (3%), Commissions Admin et Virements Zelle (USD).
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2">
            <span className="text-[11px] font-mono font-extrabold px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 inline-block">
              ● Performance {selectedDateRange.label}
            </span>
            <span className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 inline-block">
              {validPeriodTxs.length} trans.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Revenu Brut Total */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Revenu Brut Total Agence</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">Global</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {totalPlatformRevenueDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-400 mt-1">
                <span>≈ {totalPlatformRevenueHTG.toLocaleString()} HTG</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">${totalPlatformRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
              Frais de Service (3%) + Commissions Admin cumulées
            </p>
          </div>

          {/* Card 2: Commissions Admin */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Commissions Admin Encaissées</span>
              <span className="text-blue-400 text-[10px] bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">Net Direc.</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight">
                {totalAdminCommissionsDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
              </p>
              <p className="text-xs font-mono text-purple-300 mt-1">
                Inclus ${totalZelleCommissionUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD via Zelle Pay
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
              Commissions prélevées sur MonCash, Natcash, Télécom & Zelle
            </p>
          </div>

          {/* Card 3: Frais de Service Collectés */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Frais de Service Guichet (3%)</span>
              <span className="text-amber-400 text-[10px] bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">Comptoir</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                {totalFeesDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
              </p>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Collecté lors de l'encaissement en agences
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
              Couvre les coûts d'exploitation et frais opérationnels
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOP 3 MASTER RESERVE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        
        {/* Card 1: DOP RD Liquidities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Liquidités RD (Pesos)</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Banreservas & Caisses Agences RD
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
            <span>Comptes Bancaires</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+12.4%</span>
          </div>
        </div>

        {/* Card 2: HTG Flotte & Portefeuilles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flottes Haïti (HTG)</span>
            <Smartphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {totalHTG.toLocaleString()} <span className="text-xs font-bold text-slate-400">HTG</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Portefeuilles MonCash & Natcash
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
            <span>Ratio : 60% MC / 40% NC</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">Taux: {dopToHtgRate}</span>
          </div>
        </div>

        {/* Card 3: Performance & Flux Mouvement */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{volumeMetrics.label}</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {volumeMetrics.volume} <span className="text-xs font-bold text-slate-400">HTG</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              {volumeMetrics.diff}
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
            <span>Vitesse Moyenne</span>
            <span className="text-slate-900 dark:text-white font-bold">2.4 min</span>
          </div>
        </div>

      </div>

      {/* 2b. ESPACE SPÉCIAL : ZELLE PAY (USD) & CONVERSION DE COMMISSIONS EN PESOS (DOP) */}
      <div className="bg-purple-900 text-white rounded-2xl sm:rounded-3xl border border-purple-800 p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-purple-200 shrink-0">
              <img src="/images/Zelle.png" alt="Zelle Pay" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                <span>Espace Spécial Zelle Pay (USD) & Commissions</span>
              </h3>
              <p className="text-[11px] text-purple-200 font-medium mt-0.5">
                Volume circulé en Dollars USD et conversion certifiée en Pesos (DOP).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-purple-950 text-purple-200 px-2.5 py-1 rounded-xl border border-purple-700">
              1 USD = {usdToDopRate.toFixed(1)} DOP
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-purple-950 text-purple-200 px-2.5 py-1 rounded-xl border border-purple-700">
              1 USD = {usdToHtgRate || 140.5} HTG
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
          {/* Box 1: Total Volume USD */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Volume Circulé Zelle</span>
            <p className="text-xl sm:text-2xl font-black font-mono text-white">
              ${totalZelleVolumeUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-purple-300">USD</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              ≈ {totalZelleVolumeDOP.toLocaleString()} DOP au cours bancaire
            </p>
          </div>

          {/* Box 2: Commission Zelle USD */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Commission Agence (USD)</span>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              ${totalZelleCommissionUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-purple-300">USD</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              Taux appliqué : {zelleCommRate}% du volume Zelle
            </p>
          </div>

          {/* Box 3: Commission Convertie en DOP */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Ajout aux Commissions (DOP)</span>
            <p className="text-xl sm:text-2xl font-black font-mono text-blue-300">
              +{totalZelleCommissionDOP.toLocaleString()} <span className="text-xs font-bold text-purple-300">DOP</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              Converti à 1 USD = {usdToDopRate.toFixed(1)} DOP
            </p>
          </div>

          {/* Box 4: Équivalence HTG */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Volume Équivalent Haïti</span>
            <p className="text-xl sm:text-2xl font-black font-mono text-white">
              {totalZelleVolumeHTG.toLocaleString()} <span className="text-xs font-bold text-purple-300">HTG</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              Calculé au taux USD de {usdToHtgRate || 140.5} HTG
            </p>
          </div>
        </div>

        <div className="pt-2 text-[10px] sm:text-[11px] text-purple-200 border-t border-purple-800/80 flex items-center justify-between flex-wrap gap-2">
          <span>💡 <strong>Note de conversion :</strong> Les commissions Zelle en Dollars sont automatiquement converties en Pesos (DOP) au taux officiel et s'ajoutent aux commissions globales de la plateforme.</span>
        </div>
      </div>

      {/* 2b. VOLUME TRANSITÉ PAR CANAL OPÉRATEUR (ADAPTIF 2 COLONNES MOBILE / 7 COLONNES BUREAU) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Volume Transité par Opérateur ({selectedDateRange.label})</span>
            </h3>
          </div>
          <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            7 Canaux Actifs
          </span>
        </div>

        {/* Grille responsive : 2 colonnes sur mobile, 3 ou 4 sur tablette, 7 sur grand écran */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3.5">
          {OPERATOR_CARDS_CONFIG.map((op) => {
            const data = getOperatorVolumeData(op.code);
            return (
              <div 
                key={op.code}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 rounded-2xl transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{op.name}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${op.badgeBg}`}>
                    {op.badgeText}
                  </span>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {op.currencyPrimary === 'USD' 
                      ? `$${data.usd.toLocaleString()}`
                      : op.currencyPrimary === 'DOP' 
                        ? `${data.dop.toLocaleString()} DOP`
                        : `${data.htg.toLocaleString()} HTG`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{data.count} ops</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Actif</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Main Left: Area Evolution Chart (2 cols) */}
        <div className="lg:col-span-2 min-w-0">
          <TreasuryEvolutionChart />
        </div>

        {/* Right: Donut Operator Distribution (1 col) */}
        <div className="lg:col-span-1 min-w-0">
          <TreasuryPieChart accountBalances={accountBalances} />
        </div>

      </div>

      {/* 4. SECONDARY CHART & INDIVIDUAL ACCOUNTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left: Dual Bar Chart */}
        <div className="lg:col-span-1 min-w-0">
          <TreasuryFlowBarChart />
        </div>

        {/* Right: Individual Account Cards & Float Status (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 sm:space-y-5 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Comptes Opérateurs & Flottes</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Suivi individuel par compte cible</p>
              </div>
            </div>

            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
              {displayAccounts.length} Comptes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {displayAccounts.map((bal) => {
              const isLow = bal.balance < 10000;
              const maxTarget = bal.currency === 'HTG' ? 1000000 : 2000000;
              const percent = Math.min(100, Math.round((bal.balance / maxTarget) * 100));

              return (
                <div 
                  key={bal.id} 
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-3.5 ${
                    isLow 
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20' 
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {bal.operator === 'natcash' ? 'Solde Natcash & Natcom (HT)' : bal.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {bal.operator === 'natcash' ? 'Natcash / Natcom' : bal.operator}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        {bal.balance.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">{bal.currency}</span>
                      </p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        isLow ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                        {isLow ? 'ALERTE' : 'OPTIMAL'}
                      </span>
                    </div>

                    {/* Progress Float Buffer Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="truncate">N° {bal.accountNumber || 'Interne'}</span>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedAccountId(bal.id);
                          setShowRechargeModal(true);
                        }}
                        className="text-slate-900 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Action →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. RECENT TREASURY MOVEMENTS AUDIT LOG (DUAL VIEW: TABLEAU BUREAU & CARTES MOBILES) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Journal des Opérations</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Historique des réapprovisionnements & mouvements</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              {selectedDateRange.label}
            </span>
          </div>
        </div>

        {/* 1. VUE BUREAU : TABLEAU DE DONNÉES ENTERPRISE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-y border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Compte Source</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4">Auteur</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {logs.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{op.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {op.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{op.account}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{op.amount.toLocaleString()} {op.currency === 'DOP' ? 'Pesos' : op.currency}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{op.author}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{op.date}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[10px] font-bold">
                      Validé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. VUE MOBILE : CARTES EMPILÉES TRÈS RESPONSIVES (< md) */}
        <div className="md:hidden space-y-2.5">
          {logs.map((op) => (
            <div
              key={op.id}
              className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {op.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    {op.type.replace('_', ' ')}
                  </span>
                </div>

                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[9px] font-bold">
                  Validé
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {op.account}
                </span>
                <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                  +{op.amount.toLocaleString()} {op.currency === 'DOP' ? 'Pesos' : op.currency}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-400">
                <span>Auteur : <strong className="text-slate-600 dark:text-slate-300 font-semibold">{op.author}</strong></span>
                <span className="font-mono">{op.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 6. MODAL RECHARGE FLOTTE (ADMIN) - TRÈS RESPONSIVE */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto my-auto text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Réapprovisionner</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Injection de fonds dans une flotte</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRechargeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Compte Cible</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 cursor-pointer"
                >
                  {displayAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.operator === 'natcash' ? 'Solde Natcash & Natcom (Natcom HT)' : acc.name} ({acc.balance.toLocaleString()} {acc.currency === 'DOP' ? 'Pesos' : acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Montant à Injecter</label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-base font-bold text-slate-900 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
                  required
                  min={100}
                />
                
                {/* Presets buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5">
                  {[50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer active:scale-95"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">Référence / Note (Optionnel)</label>
                <input
                  type="text"
                  value={rechargeNote}
                  onChange={(e) => setRechargeNote(e.target.value)}
                  placeholder="Ex: Virement Banreservas #99214..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirmer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
