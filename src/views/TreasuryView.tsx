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

// Mock recent treasury operations log
const initialTreasuryLogs = [
  { id: 'TR-9081', type: 'recharge_float', operator: 'moncash', account: 'Flotte Principal MonCash', amount: 250000, currency: 'HTG', status: 'completed', date: 'Aujourd\'hui 11:42', author: 'Admin' },
  { id: 'TR-9080', type: 'bank_deposit', operator: 'bank_rd', account: 'Banreservas RD #882', amount: 500000, currency: 'DOP', status: 'completed', date: 'Aujourd\'hui 10:15', author: 'Jean-Marc (Caissier)' },
  { id: 'TR-9079', type: 'recharge_float', operator: 'natcash', account: 'Natcash Business Float', amount: 150000, currency: 'HTG', status: 'completed', date: 'Hier 16:30', author: 'Admin' },
  { id: 'TR-9078', type: 'cash_transfer', operator: 'cash_haiti', account: 'Caisse Agence Cap-Haïtien', amount: 100000, currency: 'HTG', status: 'completed', date: 'Hier 14:10', author: 'Pierre (Agent Cap-Haïtien)' },
];

export const TreasuryView: React.FC = () => {
  const { accountBalances, currentUser, rechargeAccount, transactions } = useApp();
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

  const OPERATOR_CARDS_CONFIG: Array<{
    code: OperatorCode;
    name: string;
    symbol: string;
    badgeBg: string;
    badgeText: string;
    currencyPrimary: 'HTG' | 'DOP' | 'USD';
  }> = [
    { code: 'natcash', name: 'Natcash', symbol: 'NC', badgeBg: 'bg-emerald-600 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'moncash', name: 'MonCash', symbol: 'MC', badgeBg: 'bg-rose-600 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'natcom', name: 'Natcom', symbol: 'NAT', badgeBg: 'bg-sky-600 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'claro', name: 'Claro', symbol: 'CLA', badgeBg: 'bg-red-500 text-white', badgeText: 'RD', currencyPrimary: 'DOP' },
    { code: 'altice', name: 'Altice', symbol: 'ALT', badgeBg: 'bg-orange-500 text-white', badgeText: 'RD', currencyPrimary: 'DOP' },
    { code: 'digicel', name: 'Digicel', symbol: 'DIG', badgeBg: 'bg-red-600 text-white', badgeText: 'HT', currencyPrimary: 'HTG' },
    { code: 'zelle', name: 'Zelle', symbol: 'ZEL', badgeBg: 'bg-purple-600 text-white', badgeText: 'US', currencyPrimary: 'USD' },
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
    switch (selectedDateRange.preset) {
      case 'today':
        return { volume: '810 000', diff: '+18.2% vs hier', label: 'Volume Traité (Aujourd\'hui)' };
      case 'yesterday':
        return { volume: '740 000', diff: '+4.5% vs avant-hier', label: 'Volume Traité (Hier)' };
      case 'this_month':
      case 'last_30_days':
        return { volume: '21 840 000', diff: '+24.1% vs mois préc.', label: 'Volume Traité (30 jours)' };
      case 'last_month':
        return { volume: '19 650 000', diff: '+11.8% vs mois préc.', label: 'Volume Traité (Mois dernier)' };
      default:
        return { volume: '5 285 000', diff: '+18.2% vs semaine préc.', label: 'Volume Traité (7 jours)' };
    }
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

  // Identify float warning (< 200,000 HTG)
  const lowFloatAccounts = accountBalances.filter(b => b.currency === 'HTG' && b.balance < 200000);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Trésorerie & Solde des Comptes
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Suivi des réserves bancaires en Pesos (RD), Gourdes (Haïti) et Dollars (Zelle).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-nowrap">
          <DateRangePicker value={selectedDateRange} onChange={setSelectedDateRange} />

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              title="Réapprovisionner une Flotte"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Réapprovisionner</span>
            </button>
          )}

          <button
            onClick={() => alert(`Génération du rapport de trésorerie pour la période : ${selectedDateRange.label}...`)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
            title="Exporter Rapport"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-700 text-white text-xs font-bold flex justify-between items-center shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white text-xs underline font-bold">Fermer</button>
        </div>
      )}

      {/* LOW FLOAT ALERTS BANNER (IF APPLICABLE) */}
      {lowFloatAccounts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Alerte Seuil de Sécurité Liquidité (Haïti)</p>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Comptes sous le seuil recommandé (200 000 HTG) :{' '}
                <span className="font-extrabold underline">{lowFloatAccounts.map(a => a.name).join(', ')}</span>.
              </p>
            </div>
          </div>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                setSelectedAccountId(lowFloatAccounts[0].id);
                setShowRechargeModal(true);
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs whitespace-nowrap transition-all"
            >
              Injecter Flotte
            </button>
          )}
        </div>
      )}

      {/* 2. TOP 3 MASTER RESERVE CARDS (CLEAN WHITE STRIPE STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: DOP RD Liquidities */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Liquidités RD (Pesos)</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalDOP.toLocaleString()} <span className="text-xs font-bold text-slate-500">DOP</span>
            </p>
            <p className="text-xs text-slate-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Banreservas & Caisses Agences RD
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Comptes Banreservas + BHD</span>
            <span className="text-emerald-600 font-bold">+12.4% cette semaine</span>
          </div>
        </div>

        {/* Card 2: HTG Flotte & Portefeuilles */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Flottes & Cash Haïti (HTG)</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalHTG.toLocaleString()} <span className="text-xs font-bold text-slate-500">HTG</span>
            </p>
            <p className="text-xs text-slate-600 font-bold flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500" /> Portefeuilles MonCash & Natcash
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>60% MonCash / 40% Natcash</span>
            <span className="text-slate-800 font-bold">Taux: 2.30 HTG/DOP</span>
          </div>
        </div>

        {/* Card 3: Performance & Flux Mouvement */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{volumeMetrics.label}</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {volumeMetrics.volume} <span className="text-xs font-bold text-slate-500">HTG</span>
            </p>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> {volumeMetrics.diff}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Temps moyen de liquidation</span>
            <span className="text-slate-900 font-bold">2.4 min / transaction</span>
          </div>
        </div>

      </div>

      {/* 2b. VOLUME TRANSITÉ PAR CANAL OPÉRATEUR (LES 7 CARDS PROPRES) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Volume Transité par Opérateur ({selectedDateRange.label})</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Montant des fonds transigés et nombre d'opérations exécutées par canal pendant la période.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            7 Canaux Actifs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {OPERATOR_CARDS_CONFIG.map((op) => {
            const data = getOperatorVolumeData(op.code);
            return (
              <div 
                key={op.code}
                className="bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/90 p-3.5 transition-all shadow-2xs hover:shadow-sm space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl ${op.badgeBg} flex items-center justify-center font-black text-xs shadow-2xs`}>
                    {op.symbol}
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {op.badgeText}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-slate-900 block truncate">{op.name}</span>
                  <p className="text-sm font-black text-slate-900 font-mono tracking-tight mt-0.5">
                    {op.currencyPrimary === 'USD' 
                      ? `$${data.usd.toLocaleString()}`
                      : op.currencyPrimary === 'DOP' 
                        ? `${data.dop.toLocaleString()} DOP`
                        : `${data.htg.toLocaleString()} HTG`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 font-bold">{data.count} ops</span>
                  <span className="text-emerald-700 font-extrabold">✓ En flux</span>
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Comptes Opérateurs & Flottes Distantes</h3>
                <p className="text-[11px] text-slate-500 font-medium">Niveaux de réserve par compte et solde disponible</p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
              {accountBalances.length} Comptes Enregistrés
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {accountBalances.map((bal) => {
              const isLow = bal.currency === 'HTG' && bal.balance < 200000;
              const maxTarget = bal.currency === 'HTG' ? 1000000 : 2000000;
              const percent = Math.min(100, Math.round((bal.balance / maxTarget) * 100));

              return (
                <div 
                  key={bal.id} 
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isLow ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/60 border-slate-200/90 hover:bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 truncate">{bal.name}</span>
                    <OperatorBadge operator={bal.operator as any} size="sm" />
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                        {bal.balance.toLocaleString()} <span className="text-xs font-bold text-slate-500">{bal.currency === 'DOP' ? 'Pesos' : bal.currency}</span>
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isLow ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isLow ? 'Seuil Faible' : 'Optimum'}
                      </span>
                    </div>

                    {/* Progress Float Buffer Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLow ? 'bg-amber-500' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="truncate">N° {bal.accountNumber || 'Interne'}</span>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedAccountId(bal.id);
                          setShowRechargeModal(true);
                        }}
                        className="text-blue-600 font-bold hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Recharger →
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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Journal des Mouvements de Trésorerie</h3>
              <p className="text-[11px] text-slate-500 font-medium">Historique récent des réapprovisionnements et transferts de caisse</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {selectedDateRange.label}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-4">Réf Opération</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Compte / Flotte</th>
                <th className="py-2.5 px-4 text-right">Montant</th>
                <th className="py-2.5 px-4">Auteur</th>
                <th className="py-2.5 px-4">Horodatage</th>
                <th className="py-2.5 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">{op.id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {op.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{op.account}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                    +{op.amount.toLocaleString()} {op.currency === 'DOP' ? 'Pesos' : op.currency}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">{op.author}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{op.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Réapprovisionner une Flotte</h3>
              </div>
              <button 
                onClick={() => setShowRechargeModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sélectionner le Compte Cible</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs px-3 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {accountBalances.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance.toLocaleString()} {acc.currency === 'DOP' ? 'Pesos' : acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Montant à Injecter</label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 font-mono text-base font-black text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  min={100}
                />
                
                {/* Presets buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {[50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-[11px] border border-slate-200 transition-colors"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note / Référence Banque ou Transaction</label>
                <input
                  type="text"
                  value={rechargeNote}
                  onChange={(e) => setRechargeNote(e.target.value)}
                  placeholder="Ex: Virement Banreservas #99214..."
                  className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirmer la Recharge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
