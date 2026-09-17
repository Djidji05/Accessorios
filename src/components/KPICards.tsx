import React from 'react';
import { Layers } from 'lucide-react';
import { SparklineChart } from './charts/SparklineChart';
import { DateRange } from './DateRangePicker';
import { useApp } from '../context/AppContext';

interface KPICardsProps {
  dateRange?: DateRange;
}

export const KPICards: React.FC<KPICardsProps> = ({ dateRange }) => {
  const { currentUser, transactions, accountBalances, killSwitchList, dopToHtgRate } = useApp();
  const preset = dateRange?.preset || 'last_7_days';

  // Dynamic KPI numbers based on selected period & role
  const getCardsData = () => {
    // 1. Spécifique Agent RD
    if (currentUser.role === 'agent_rd') {
      const myTxs = transactions.filter(t => t.createdByName === currentUser.name || t.createdByRole === 'agent_rd');
      const myVolDOP = myTxs.reduce((acc, t) => acc + t.amountDOP, 0);
      const myCompleted = myTxs.filter(t => t.status === 'completed').length;
      return [
        {
          title: 'Transactions Guichet RD',
          value: myTxs.length.toString(),
          percentage: `+${myCompleted} soldées`,
          comparison: 'au guichet',
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: [5, 8, 12, 14, 18, 22, 25, Math.max(30, myTxs.length * 2)],
        },
        {
          title: 'Volume Encaissé (DOP)',
          value: `${myVolDOP.toLocaleString()} DOP`,
          percentage: '100% collecté',
          comparison: 'en caisse agence',
          isPositive: true,
          sparklineColor: '#14B8A6',
          gradientId: 'gradCard2',
          sparklineData: [10, 15, 20, 25, 35, 40, 50, 55],
        },
        {
          title: 'Taux Officiel du Jour',
          value: `100 DOP = ${Math.round(dopToHtgRate * 100)} HTG`,
          percentage: 'Fixé Direction',
          comparison: 'cours certifié',
          isPositive: true,
          sparklineColor: '#3B82F6',
          gradientId: 'gradCard3',
          sparklineData: [2.30, 2.30, 2.32, 2.33, 2.35, 2.35, 2.35, 2.35],
        },
      ];
    }

    // 2. Spécifique Agent Haïti
    if (currentUser.role === 'agent_haiti') {
      const htTxs = transactions.filter(t => t.channel === 'haiti_cash' || t.assignedToRole === 'agent_haiti' || t.operator === 'moncash' || t.operator === 'natcash');
      const htVolHTG = htTxs.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amountHTG, 0);
      const htPending = htTxs.filter(t => t.status === 'in_progress').length;
      return [
        {
          title: 'Transferts Distribués (HTG)',
          value: `${htVolHTG.toLocaleString()} HTG`,
          percentage: 'Fonds versés',
          comparison: 'en Haïti',
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: [20, 30, 45, 60, 75, 90, 110, 120],
        },
        {
          title: 'Dossiers Traités',
          value: htTxs.filter(t => t.status === 'completed').length.toString(),
          percentage: 'Validés SMS',
          comparison: 'avec preuve',
          isPositive: true,
          sparklineColor: '#14B8A6',
          gradientId: 'gradCard2',
          sparklineData: [10, 12, 15, 18, 22, 26, 28, 32],
        },
        {
          title: 'En Attente de Preuve',
          value: htPending.toString(),
          percentage: htPending > 0 ? 'À décaisser' : 'À jour',
          comparison: 'file active',
          isPositive: htPending === 0,
          sparklineColor: htPending > 0 ? '#F59E0B' : '#10B981',
          gradientId: 'gradCard3',
          sparklineData: [4, 3, 5, 2, 4, 3, 2, Math.max(1, htPending)],
        },
      ];
    }

    // 3. Spécifique Gestionnaire
    if (currentUser.role === 'gestionnaire') {
      const htgFloat = accountBalances.filter(b => b.currency === 'HTG').reduce((acc, b) => acc + b.balance, 0);
      const dopFloat = accountBalances.filter(b => b.currency === 'DOP').reduce((acc, b) => acc + b.balance, 0);
      const lockedCount = killSwitchList.filter(k => !k.enabled).length;
      return [
        {
          title: 'Liquidités Flottes HTG',
          value: `${htgFloat.toLocaleString()} HTG`,
          percentage: 'MonCash & Natcash',
          comparison: 'disponible',
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: [40, 42, 45, 48, 52, 50, 53, 55],
        },
        {
          title: 'Liquidités Banques (DOP)',
          value: `${dopFloat.toLocaleString()} DOP`,
          percentage: 'Comptes Banreservas',
          comparison: 'disponible',
          isPositive: true,
          sparklineColor: '#14B8A6',
          gradientId: 'gradCard2',
          sparklineData: [20, 22, 25, 27, 28, 30, 32, 35],
        },
        {
          title: 'Opérateurs Télécom',
          value: lockedCount === 0 ? "100% Actifs" : `${lockedCount} coupure(s)`,
          percentage: lockedCount === 0 ? 'Optimal' : 'Alerte',
          comparison: 'Statut Sécurité',
          isPositive: lockedCount === 0,
          sparklineColor: lockedCount === 0 ? '#10B981' : '#F43F5E',
          gradientId: 'gradCard3',
          sparklineData: [6, 6, 6, 6, 6, 6, 6, 6 - lockedCount],
        },
      ];
    }

    // 4. Admin (Global System Metrics calculated from live state)
    const totalCount = transactions.length;
    const completedCount = transactions.filter(t => t.status === 'completed').length;
    const pendingCount = transactions.filter(t => t.status === 'in_progress').length;
    const totalVolumeDOP = transactions.reduce((acc, t) => acc + t.amountDOP, 0);
    const slaCompliance = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    return [
      {
        title: 'Transactions Globales',
        value: totalCount.toString(),
        percentage: `${completedCount} soldée(s)`,
        comparison: `• ${pendingCount} en cours`,
        isPositive: true,
        sparklineColor: '#10B981',
        gradientId: 'gradCard1',
        sparklineData: [10, 15, 22, 30, 42, 50, 60, Math.max(70, totalCount * 5)],
      },
      {
        title: 'Volume Global (DOP)',
        value: `${totalVolumeDOP.toLocaleString()} DOP`,
        percentage: '100% en caisse',
        comparison: 'sur le réseau',
        isPositive: true,
        sparklineColor: '#14B8A6',
        gradientId: 'gradCard2',
        sparklineData: [20, 35, 50, 80, 120, 150, 180, 220],
      },
      {
        title: 'Conformité SLA Réseau',
        value: `${slaCompliance}%`,
        percentage: slaCompliance >= 90 ? 'Optimal' : 'Sous surveillance',
        comparison: 'taux de clôture',
        isPositive: slaCompliance >= 90,
        sparklineColor: slaCompliance >= 90 ? '#10B981' : '#F59E0B',
        gradientId: 'gradCard3',
        sparklineData: [85, 88, 90, 92, 94, 95, 96, slaCompliance],
      },
    ];
  };

  const cards = getCardsData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-[#0F172A] rounded-[22px] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
        >
          {/* Card Header: Title on Left + Rotated Diamond/Layers Icon on Right */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.title}</span>
            <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Layers className="w-3.5 h-3.5 rotate-45" />
            </div>
          </div>

          {/* Card Main Section: Number + Subtext on left, Sparkline chart on right */}
          <div className="flex items-end justify-between gap-3 pt-1">
            <div className="space-y-1.5 min-w-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {card.value}
              </p>

              <div className="text-[11px] font-semibold flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 leading-snug">
                <span className={card.isPositive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                  {card.percentage}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">{card.comparison}</span>
              </div>
            </div>

            {/* Area Sparkline Graph */}
            <div className="flex-shrink-0">
              <SparklineChart 
                data={card.sparklineData} 
                color={card.sparklineColor} 
                gradientId={card.gradientId}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

