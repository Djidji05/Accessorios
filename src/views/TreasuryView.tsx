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

  // Taux de conversion USD -> DOP (1 USD ≈ 60 DOP, dérivé de USD/HTG vs DOP/HTG)
  const usdToDopRate = (usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 60.0;
  const zelleCommRate = serviceCommissionRates['zelle'] ?? adminCommissionRate ?? 1.5;

  // Transactions Zelle & Calculs dédiés en USD
  const zelleTxs = transactions.filter(t => t.operator === 'zelle');
  const liveZelleUSD = zelleTxs.reduce((sum, t) => sum + (t.amountUSD || (t.amountDOP ? t.amountDOP / usdToDopRate : 0)), 0);
  const totalZelleVolumeUSD = liveZelleUSD > 0 ? liveZelleUSD : 5300; // Baseline $5,300 USD
  const totalZelleCommissionUSD = Math.round(totalZelleVolumeUSD * (zelleCommRate / 100) * 100) / 100;
  const totalZelleCommissionDOP = Math.round(totalZelleCommissionUSD * usdToDopRate);
  const totalZelleVolumeDOP = Math.round(totalZelleVolumeUSD * usdToDopRate);
  const totalZelleVolumeHTG = Math.round(totalZelleVolumeUSD * (usdToHtgRate || 140.5));

  // --- CALCULS DU REVENU GLOBAL DE LA PLATEFORME (COMMISSIONS + FRAIS + AUTRES) ---
  const liveFeesDOP = transactions.reduce((sum, t) => {
    if (t.operator === 'zelle' || t.amountUSD) {
      const amtUSD = t.amountUSD || (t.amountDOP ? t.amountDOP / usdToDopRate : 0);
      const feeUSD = amtUSD * 0.035;
      return sum + Math.round(feeUSD * usdToDopRate);
    }
    return sum + (t.feeDOP || Math.round(t.amountDOP * 0.03));
  }, 0);
  const totalFeesDOP = liveFeesDOP > 0 ? liveFeesDOP : 48500; // Baseline démo

  const liveAdminCommissionsDOP = transactions.reduce((sum, t) => {
    const commRate = serviceCommissionRates[t.operator] ?? adminCommissionRate ?? 1.0;
    if (t.operator === 'zelle' || t.amountUSD) {
      const amtUSD = t.amountUSD || (t.amountDOP ? t.amountDOP / usdToDopRate : 0);
      const commUSD = amtUSD * (commRate / 100);
      return sum + Math.round(commUSD * usdToDopRate);
    }
    return sum + (t.commissionDOP || Math.round(t.amountDOP * (commRate / 100)));
  }, 0);
  const totalAdminCommissionsDOP = liveAdminCommissionsDOP > 0 ? liveAdminCommissionsDOP : 24800; // Baseline démo

  const totalPlatformRevenueDOP = totalFeesDOP + totalAdminCommissionsDOP;
  const totalPlatformRevenueHTG = Math.round(totalPlatformRevenueDOP * dopToHtgRate);
  const totalPlatformRevenueUSD = Math.round((totalPlatformRevenueDOP / usdToDopRate) * 100) / 100;

  // Calendar Date Range Filter
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours',
  });

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
    const { preset, startDate, endDate } = selectedDateRange;
    const now = new Date();

    const periodFilteredTxs = transactions.filter((t) => {
      const txDate = new Date(t.createdAt);
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
      if (startDate && endDate) {
        return txDate >= new Date(startDate) && txDate <= new Date(endDate);
      }
      return true;
    });

    const opTxs = periodFilteredTxs.filter((t) => t.operator === opCode);
    const liveHTG = opTxs.reduce((sum, t) => sum + t.amountHTG, 0);
    const liveDOP = opTxs.reduce((sum, t) => sum + t.amountDOP, 0);
    const liveUSD = opTxs.reduce((sum, t) => sum + (t.amountUSD || Math.round(t.amountDOP / 60)), 0);
    const liveCount = opTxs.length;

    const mult = 
      preset === 'today' ? 1 :
      preset === 'yesterday' ? 0.85 :
      preset === 'last_30_days' || preset === 'this_month' ? 4.2 : 2.5;

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
      htg: liveHTG > 0 ? liveHTG : base.htg,
      dop: liveDOP > 0 ? liveDOP : base.dop,
      usd: liveUSD > 0 ? liveUSD : base.usd,
      count: liveCount > 0 ? liveCount : base.count,
    };
  };

  const getVolumeMetrics = () => {
    const totalVolHTG = transactions.reduce((sum, tx) => sum + tx.amountHTG, 0);
    const label = selectedDateRange.preset === 'today' 
      ? 'Volume Traité (Aujourd\'hui)'
      : selectedDateRange.preset === 'yesterday'
      ? 'Volume Traité (Hier)'
      : selectedDateRange.preset === 'this_month' || selectedDateRange.preset === 'last_30_days'
      ? 'Volume Traité (30 jours)'
      : selectedDateRange.preset === 'last_month'
      ? 'Volume Traité (Mois dernier)'
      : 'Volume Traité (7 jours)';

    return {
      volume: totalVolHTG.toLocaleString(),
      diff: totalVolHTG > 0 ? '+18.2% vs période préc.' : '0% vs période préc.',
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

  // Identify float warning (< 10,000)
  const lowFloatAccounts = accountBalances.filter(b => b.balance < 10000);

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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-sans animate-in fade-in pb-36 md:pb-6">
      
      {/* 1. CLEAN ENTERPRISE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Trésorerie & Solde des Comptes
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Suivi des réserves bancaires en Pesos (RD), Gourdes (Haïti) et Dollars (Zelle).
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 flex-nowrap">
          <DateRangePicker value={selectedDateRange} onChange={setSelectedDateRange} />

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              title="Réapprovisionner une Flotte"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Réapprovisionner</span>
            </button>
          )}

          <button
            onClick={() => exportTreasuryReportToCSV(accountBalances, transactions, undefined, logs)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 cursor-pointer"
            title="Exporter Rapport CSV Financier avec Journal des Opérations"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportTreasuryReportToPDF(accountBalances, transactions, undefined, logs)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-900 cursor-pointer"
            title="Générer & Télécharger le Rapport PDF Financier avec Journal des Opérations"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* GUIDE DE LECTURE EN UN COUP D'ŒIL (POUR UTILISATEURS LAMBDA) */}
      <div className="bg-emerald-50/70 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/40 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
            💡
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-emerald-300">Comment lire cette page facilement ?</p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              <strong className="text-slate-900 dark:text-white">1. Soldes Réels :</strong> L'argent disponible pour payer les clients. &nbsp;•&nbsp; 
              <strong className="text-slate-900 dark:text-white">2. Badges Vert/Jaune/Rouge :</strong> Indiquent si le portefeuille est plein ou doit être rechargé. &nbsp;•&nbsp; 
              <strong className="text-slate-900 dark:text-white">3. Devises :</strong> DOP = Pesos Dominicains, HTG = Gourdes Haïtiennes, USD = Dollars US.
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="p-4 rounded border-l-4 border-l-slate-800 bg-white border border-slate-200 text-slate-900 text-xs font-bold flex justify-between items-center shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-slate-700" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-500 hover:text-slate-800 text-xs underline font-bold">Fermer</button>
        </div>
      )}

      {/* LOW FLOAT ALERTS BANNER (IF APPLICABLE) */}
      {lowFloatAccounts.length > 0 && (
        <div className="bg-white border border-slate-200 border-l-4 border-l-slate-800 rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Alerte Sécurité Liquidité</p>
              <p className="text-xs text-slate-600 mt-0.5">
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow-sm whitespace-nowrap transition-all"
            >
              Injecter Flotte
            </button>
          )}
        </div>
      )}

      {/* 1b. REVENU TOTAL & PERFORMANCE FINANCIÈRE DE LA PLATEFORME */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Revenu Total & Performance Financière de la Plateforme</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Vue consolidée des revenus d'agence : Frais de Service Guichet (3%), Commissions Administrateur et Virements Zelle (USD).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-extrabold px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              ● Performance {selectedDateRange.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Revenu Brut Total */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Revenu Brut Total Agence</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Global</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white font-mono tracking-tight">
                {totalPlatformRevenueDOP.toLocaleString()} <span className="text-xs font-bold text-slate-400">DOP</span>
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                <span>≈ {totalPlatformRevenueHTG.toLocaleString()} HTG</span>
                <span>•</span>
                <span className="text-emerald-400">${totalPlatformRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-800">
              Frais de Service (3%) + Commissions Admin cumulées
            </p>
          </div>

          {/* Card 2: Commissions Admin */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Commissions Admin Encaissées</span>
              <span className="text-blue-400 text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-800">Net Direc.</span>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400 font-mono tracking-tight">
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
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Frais de Service Guichet (3%)</span>
              <span className="text-amber-400 text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">Comptoir</span>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-400 font-mono tracking-tight">
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

      {/* 2. TOP 3 MASTER RESERVE CARDS (CLEAN CORPORATE STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: DOP RD Liquidities */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Liquidités RD (Pesos)</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {totalDOP.toLocaleString()} <span className="text-xs font-medium text-slate-500">DOP</span>
            </p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
              Banreservas & Caisses Agences RD
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
            <span>Comptes Bancaires</span>
            <span className="text-slate-800 font-bold">+12.4%</span>
          </div>
        </div>

        {/* Card 2: HTG Flotte & Portefeuilles */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flottes Haïti (HTG)</span>
            <Smartphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {totalHTG.toLocaleString()} <span className="text-xs font-medium text-slate-500">HTG</span>
            </p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
              Portefeuilles MonCash & Natcash
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
            <span>Ratio : 60% MC / 40% NC</span>
            <span className="text-slate-800 font-bold">Taux: 2.30</span>
          </div>
        </div>

        {/* Card 3: Performance & Flux Mouvement */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{volumeMetrics.label}</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {volumeMetrics.volume} <span className="text-xs font-medium text-slate-500">HTG</span>
            </p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
              {volumeMetrics.diff}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
            <span>Vitesse Moyenne</span>
            <span className="text-slate-900 font-bold">2.4 min</span>
          </div>
        </div>

      </div>

      {/* 2b. ESPACE SPÉCIAL : ZELLE PAY (USD) & CONVERSION DE COMMISSIONS EN PESOS (DOP) */}
      <div className="bg-purple-900 text-white rounded border border-purple-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white p-1 flex items-center justify-center border border-purple-200 shrink-0">
              <img src="/images/Zelle.png" alt="Zelle Pay" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                <span>Espace Spécial Zelle Pay (USD) & Commissions Converties</span>
              </h3>
              <p className="text-[11px] text-purple-200 font-medium">
                Suivi indépendant du volume circulé en Dollars USD et conversion certifiée en Pesos (DOP) pour les commissions globales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-purple-950 text-purple-200 px-3 py-1 rounded border border-purple-700">
              1 USD = {usdToDopRate.toFixed(1)} DOP (Taux Pesos)
            </span>
            <span className="text-[11px] font-mono font-bold bg-purple-950 text-purple-200 px-3 py-1 rounded border border-purple-700">
              1 USD = {usdToHtgRate || 140.5} HTG (Taux Gourdes)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* Box 1: Total Volume USD */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Volume Circulé Zelle</span>
            <p className="text-2xl font-black font-mono text-white">
              ${totalZelleVolumeUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-purple-300">USD</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              ≈ {totalZelleVolumeDOP.toLocaleString()} DOP au cours bancaire
            </p>
          </div>

          {/* Box 2: Commission Zelle USD */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Commission Agence (USD)</span>
            <p className="text-2xl font-black font-mono text-emerald-400">
              ${totalZelleCommissionUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-purple-300">USD</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              Taux appliqué : {zelleCommRate}% du volume Zelle
            </p>
          </div>

          {/* Box 3: Commission Convertie en DOP */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Ajout aux Commissions (DOP)</span>
            <p className="text-2xl font-black font-mono text-blue-300">
              +{totalZelleCommissionDOP.toLocaleString()} <span className="text-xs font-bold text-purple-300">DOP</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              Converti à 1 USD = {usdToDopRate.toFixed(1)} DOP
            </p>
          </div>

          {/* Box 4: Équivalence HTG */}
          <div className="bg-purple-950/70 border border-purple-700/80 p-3.5 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Volume Équivalent Haïti</span>
            <p className="text-2xl font-black font-mono text-white">
              {totalZelleVolumeHTG.toLocaleString()} <span className="text-xs font-bold text-purple-300">HTG</span>
            </p>
            <p className="text-[10px] text-purple-300 font-medium">
              Calculé au taux USD de {usdToHtgRate || 140.5} HTG
            </p>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-purple-200 border-t border-purple-800/80 flex items-center justify-between flex-wrap gap-2">
          <span>💡 <strong>Note de conversion :</strong> Les commissions Zelle en Dollars sont automatiquement converties en Pesos (DOP) au taux du Dollar Pesos (`1 USD = ${usdToDopRate.toFixed(1)} DOP`) et s'ajoutent directement à la carte des commissions globales de la plateforme.</span>
        </div>
      </div>

      {/* 2b. VOLUME TRANSITÉ PAR CANAL OPÉRATEUR */}
      <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Volume Transité par Opérateur ({selectedDateRange.label})</span>
            </h3>
          </div>
          <span className="text-xs font-mono font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            7 Canaux Actifs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {OPERATOR_CARDS_CONFIG.map((op) => {
            const data = getOperatorVolumeData(op.code);
            return (
              <div 
                key={op.code}
                className="bg-white border border-slate-200 p-4 rounded transition-all hover:border-slate-300 shadow-sm hover:shadow flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{op.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${op.badgeBg}`}>
                    {op.badgeText}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900 font-mono tracking-tight mt-1">
                    {op.currencyPrimary === 'USD' 
                      ? `$${data.usd.toLocaleString()}`
                      : op.currencyPrimary === 'DOP' 
                        ? `${data.dop.toLocaleString()} DOP`
                        : `${data.htg.toLocaleString()} HTG`}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">{data.count} ops</span>
                  <span className="text-slate-800 font-bold">Actif</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Left: Area Evolution Chart (2 cols) */}
        <div className="lg:col-span-2">
          <TreasuryEvolutionChart />
        </div>

        {/* Right: Donut Operator Distribution (1 col) */}
        <div className="lg:col-span-1">
          <TreasuryPieChart accountBalances={accountBalances} />
        </div>

      </div>

      {/* 4. SECONDARY CHART & INDIVIDUAL ACCOUNTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Dual Bar Chart */}
        <div className="lg:col-span-1">
          <TreasuryFlowBarChart />
        </div>

        {/* Right: Individual Account Cards & Float Status (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Comptes Opérateurs & Flottes</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Suivi individuel par compte cible</p>
              </div>
            </div>

            <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 font-mono">
              {accountBalances.length} Comptes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountBalances.map((bal) => {
              const isLow = bal.balance < 10000;
              const maxTarget = bal.currency === 'HTG' ? 1000000 : 2000000;
              const percent = Math.min(100, Math.round((bal.balance / maxTarget) * 100));

              return (
                <div 
                  key={bal.id} 
                  className={`p-4 rounded border transition-all space-y-4 ${
                    isLow ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{bal.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{bal.operator}</span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                        {bal.balance.toLocaleString()} <span className="text-[10px] font-medium text-slate-500">{bal.currency}</span>
                      </p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        isLow ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        {isLow ? 'ALERTE' : 'OK'}
                      </span>
                    </div>

                    {/* Progress Float Buffer Bar - Monochrome */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLow ? 'bg-slate-800' : 'bg-slate-400'
                        }`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span className="truncate">N° {bal.accountNumber || 'Interne'}</span>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedAccountId(bal.id);
                          setShowRechargeModal(true);
                        }}
                        className="text-slate-900 font-bold hover:underline cursor-pointer"
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

      {/* 5. RECENT TREASURY MOVEMENTS AUDIT LOG TABLE */}
      <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Journal des Opérations</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Historique brut des réapprovisionnements</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              {selectedDateRange.label}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200">
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Compte Source</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4">Auteur</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{op.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 rounded text-[10px] font-medium uppercase border border-slate-200 bg-white text-slate-600">
                      {op.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{op.account}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    +{op.amount.toLocaleString()} {op.currency === 'DOP' ? 'Pesos' : op.currency}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{op.author}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{op.date}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px] font-bold">
                      Validé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL RECHARGE FLOTTE (ADMIN) */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-lg w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-base">Réapprovisionner</h3>
              </div>
              <button 
                onClick={() => setShowRechargeModal(false)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-5 text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Compte Cible</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2.5 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                >
                  {accountBalances.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance.toLocaleString()} {acc.currency === 'DOP' ? 'Pesos' : acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Montant à Injecter</label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 font-mono text-base font-bold text-slate-900 px-3 py-2.5 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  required
                  min={100}
                />
                
                {/* Presets buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {[50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className="px-3 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono font-medium text-xs border border-slate-200 transition-colors"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Référence / Note</label>
                <input
                  type="text"
                  value={rechargeNote}
                  onChange={(e) => setRechargeNote(e.target.value)}
                  placeholder="Ex: Ref #99214..."
                  className="w-full bg-white border border-slate-300 text-slate-900 px-3 py-2.5 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
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
