import React, { useState } from 'react';
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
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, ShieldCheck, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { AccountBalance } from '../../types';

// Mock 7-day treasury evolution data
const evolutionData = [
  { date: '06 Sep', dop: 1250000, htg: 3450000, fluxIn: 450000, fluxOut: 410000 },
  { date: '07 Sep', dop: 1380000, htg: 3200000, fluxIn: 520000, fluxOut: 480000 },
  { date: '08 Sep', dop: 1420000, htg: 3680000, fluxIn: 610000, fluxOut: 590000 },
  { date: '09 Sep', dop: 1510000, htg: 3890000, fluxIn: 580000, fluxOut: 540000 },
  { date: '10 Sep', dop: 1480000, htg: 4120000, fluxIn: 690000, fluxOut: 630000 },
  { date: '11 Sep', dop: 1620000, htg: 3950000, fluxIn: 740000, fluxOut: 710000 },
  { date: '12 Sep', dop: 1785000, htg: 4250000, fluxIn: 810000, fluxOut: 760000 },
];

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomAreaTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 min-w-[170px]">
        <p className="font-extrabold text-slate-300 border-b border-slate-800 pb-1 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-[10px] text-emerald-400 font-mono">EN DIRECT</span>
        </p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-mono font-bold text-white">
              {item.value.toLocaleString()} {item.dataKey === 'dop' ? 'Pesos' : 'HTG'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/* 1. SHADCN AREA CHART: EVOLUTION DE LA TRESORERIE                           */
/* -------------------------------------------------------------------------- */
export const TreasuryEvolutionChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Évolution des Solde & Flottes</h3>
            <p className="text-[11px] text-slate-500 font-medium">Liquidités Réelles vs Flottes de recharges</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              timeRange === '7d' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 derniers jours
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              timeRange === '30d' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHtg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} dy={5} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 10 }} 
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
            />
            <Tooltip content={<CustomAreaTooltip />} />
            <Area 
              type="monotone" 
              dataKey="dop" 
              name="Solde Pesos (RD)" 
              stroke="#2563EB" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorDop)" 
            />
            <Area 
              type="monotone" 
              dataKey="htg" 
              name="Flotte HTG" 
              stroke="#10B981" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorHtg)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="font-semibold text-slate-700">Comptes RD (Pesos)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-slate-700">Flottes Haïti (HTG)</span>
          </div>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">Mise à jour: Il y a 2 min</span>
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
    // Approx rate 1 DOP = 2.65 HTG
    if (b.currency === 'HTG') return sum + b.balance / 2.65;
    return sum + b.balance;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Répartition par Opérateur</h3>
            <p className="text-[11px] text-slate-500 font-medium">Part de chaque banque et portefeuille</p>
          </div>
        </div>
      </div>

      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number, name: string, entry: any) => [
                `${val.toLocaleString()} ${entry.payload.currency}`,
                entry.payload.name
              ]}
              contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Approx</span>
          <span className="text-sm font-black text-slate-900">~{Math.round(totalBalanceApproxDOP).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-slate-500">Pesos Equiv.</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        {pieData.map((acc, index) => (
          <div key={index} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="font-semibold text-slate-800 truncate">{acc.name}</span>
            </div>
            <span className="font-mono font-bold text-slate-900 text-[10px] ml-1">
              {acc.value.toLocaleString()} {acc.currency === 'DOP' ? 'Pesos' : acc.currency}
            </span>
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
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Volume des Décaissements vs Encaissements</h3>
            <p className="text-[11px] text-slate-500 font-medium">Comparatif quotidien des entrées (RD) et sorties (Haïti)</p>
          </div>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number, name: any) => [`${v.toLocaleString()} ${name && name.includes('Pesos') ? 'Pesos' : 'HTG'}`, name]}
              contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
            />
            <Bar dataKey="fluxIn" name="Entrées Pesos" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={16} />
            <Bar dataKey="fluxOut" name="Sorties HTG" fill="#10B981" radius={[6, 6, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
