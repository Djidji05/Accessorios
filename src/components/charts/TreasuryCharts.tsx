import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { AccountBalance } from '../../types';
import { useApp } from '../../context/AppContext';

// Strict Monochrome + Corporate Blue Palette
const COLORS = [
  '#0F172A', // slate-900
  '#3B82F6', // blue-500
  '#64748B', // slate-500
  '#94A3B8', // slate-400
  '#1E40AF', // blue-800
  '#CBD5E1', // slate-300
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomAreaTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-slate-900 p-3 rounded shadow-lg border border-slate-200 text-xs space-y-1.5 min-w-[170px]">
        <p className="font-bold text-slate-700 border-b border-slate-100 pb-1 flex justify-between items-center">
          <span>{label}</span>
        </p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center gap-4 text-xs font-medium mt-1">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-bold text-slate-900">
              {(item.value || 0).toLocaleString()} {item.dataKey === 'dop' || item.dataKey === 'fluxIn' ? 'Pesos' : 'HTG'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/* Helper to generate last 7 days chart data dynamically from transactions    */
/* -------------------------------------------------------------------------- */
const useChartData = () => {
  const { transactions, accountBalances } = useApp();
  
  return useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Obtenir le solde actuel des comptes Pesos et HTG
    const currentDopBalance = accountBalances
      .filter(b => b.currency === 'DOP')
      .reduce((sum, b) => sum + b.balance, 0);

    const currentHtgBalance = accountBalances
      .filter(b => b.currency === 'HTG')
      .reduce((sum, b) => sum + b.balance, 0);

    // Générer les données réelles pour les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      
      // Filtrer les transactions du jour
      const dailyTxs = transactions.filter(tx => {
        try {
          const txDate = new Date(tx.createdAt);
          return txDate.toDateString() === targetDate.toDateString();
        } catch (e) {
          return false;
        }
      });

      // Calculer les encaissements (fluxIn DOP) et décaissements (fluxOut HTG) réels
      const fluxIn = dailyTxs.reduce((sum, tx) => sum + (tx.amountDOP || 0), 0);
      const fluxOut = dailyTxs.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + (tx.amountHTG || 0), 0);

      data.push({
        date: dateStr,
        dop: currentDopBalance,
        htg: currentHtgBalance,
        fluxIn: fluxIn,
        fluxOut: fluxOut
      });
    }

    return data;
  }, [transactions, accountBalances]);
};


/* -------------------------------------------------------------------------- */
/* 1. SHADCN AREA CHART: EVOLUTION DE LA TRESORERIE                           */
/* -------------------------------------------------------------------------- */
export const TreasuryEvolutionChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const evolutionData = useChartData();

  return (
    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Évolution des Solde & Flottes</h3>
            <p className="text-[11px] text-slate-500 font-medium">Liquidités Réelles vs Flottes de recharges</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${
              timeRange === '7d' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 derniers jours
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${
              timeRange === '30d' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 jours
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHtg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} dy={5} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10 }} 
              domain={[0, (max: number) => Math.max(max, 1000)]}
              tickFormatter={(v) => (v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`)} 
            />
            <Tooltip content={<CustomAreaTooltip />} />
            <Area 
              type="monotone" 
              dataKey="dop" 
              name="Solde Pesos (RD)" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorDop)" 
            />
            <Area 
              type="monotone" 
              dataKey="htg" 
              name="Flotte HTG" 
              stroke="#0F172A" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorHtg)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-blue-500 inline-block" />
            <span className="font-bold text-slate-700">Comptes RD (Pesos)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-slate-900 inline-block" />
            <span className="font-bold text-slate-700">Flottes Haïti (HTG)</span>
          </div>
        </div>
        <span className="text-slate-400 font-medium text-[10px]">Mise à jour: En direct</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. SHADCN DONUT PIE CHART: REPARTITION DE LA TRESORERIE                     */
/* -------------------------------------------------------------------------- */
interface PieProps {
  accountBalances: AccountBalance[];
}

export const TreasuryPieChart: React.FC<PieProps> = ({ accountBalances }) => {
  const pieData = accountBalances.map(acc => ({
    name: acc.name,
    value: acc.balance,
    currency: acc.currency,
    operator: acc.operator
  }));

  const totalBalanceApproxDOP = accountBalances.reduce((sum, b) => {
    if (b.currency === 'HTG') return sum + b.balance / 2.65;
    return sum + b.balance;
  }, 0);

  return (
    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Répartition des Flottes</h3>
            <p className="text-[11px] text-slate-500 font-medium">Répartition par opérateur & caisses</p>
          </div>
        </div>
      </div>

      <div className="h-52 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number, name: string, entry: any) => [
                `${(val || 0).toLocaleString()} ${entry.payload.currency}`,
                entry.payload.name
              ]}
              contentStyle={{ backgroundColor: '#ffffff', color: '#0F172A', borderRadius: '4px', fontSize: '11px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Approx</span>
          <span className="text-sm font-bold text-slate-900">~{Math.round(totalBalanceApproxDOP).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-slate-400">Pesos Equiv.</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        {pieData.map((acc, index) => (
          <div key={index} className="flex items-center justify-between text-[11px] p-1.5 rounded border border-slate-100">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="font-bold text-slate-700 truncate">{acc.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. SHADCN BARCHART: CASH-IN RD VS CASH-OUT HTG                             */
/* -------------------------------------------------------------------------- */
export const TreasuryFlowBarChart: React.FC = () => {
  const evolutionData = useChartData();

  return (
    <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Décaissements vs Encaissements</h3>
            <p className="text-[11px] text-slate-500 font-medium">Comparatif des entrées (RD) et sorties (Haïti)</p>
          </div>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10 }} 
              domain={[0, (max: number) => Math.max(max, 1000)]}
              tickFormatter={(v) => (v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`)} 
            />
            <Tooltip
              formatter={(v: number, name: any) => [`${(v || 0).toLocaleString()} ${name && name.includes('Pesos') ? 'Pesos' : 'HTG'}`, name]}
              contentStyle={{ backgroundColor: '#ffffff', color: '#0F172A', borderRadius: '4px', fontSize: '11px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}
            />
            <Bar dataKey="fluxIn" name="Entrées Pesos" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={16} />
            <Bar dataKey="fluxOut" name="Sorties HTG" fill="#0F172A" radius={[2, 2, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
