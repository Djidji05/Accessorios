import React from 'react';
import { Layers } from 'lucide-react';
import { SparklineChart } from './charts/SparklineChart';
import { DateRange } from './DateRangePicker';
import { useApp } from '../context/AppContext';

interface KPICardsProps {
  dateRange?: DateRange;
}

export const KPICards: React.FC<KPICardsProps> = ({ dateRange }) => {
  const { currentUser, transactions, dopToHtgRate, usdToHtgRate, adminCommissionRate, serviceCommissionRates, t } = useApp();

  // Taux dynamique USD -> DOP (1 USD = 60 DOP approx. basé sur USD/HTG vs DOP/HTG)
  const usdToDopRate = (usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 60.0;

  // Helper pour calculer la commission d'une transaction en DOP
  const getTxCommissionDOP = (tx: typeof transactions[0]) => {
    const commRate = serviceCommissionRates[tx.operator] ?? adminCommissionRate ?? 1.0;
    if (tx.operator === 'zelle' || tx.amountUSD) {
      const amtUSD = tx.amountUSD || (tx.amountDOP ? tx.amountDOP / usdToDopRate : 0);
      const commUSD = amtUSD * (commRate / 100);
      return Math.round(commUSD * usdToDopRate);
    }
    return tx.commissionDOP || Math.round(tx.amountDOP * (commRate / 100));
  };

  // Helper pour générer 7 points de données temporels réels basés sur les transactions du système
  const getDailyMetrics = (txList: typeof transactions) => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const txCounts = last7Days.map(dateStr => {
      return txList.filter(tx => {
        try {
          const txDateStr = new Date(tx.createdAt).toISOString().split('T')[0];
          return txDateStr === dateStr;
        } catch (e) {
          return false;
        }
      }).length;
    });

    const txVolumes = last7Days.map(dateStr => {
      return txList.filter(tx => {
        try {
          const txDateStr = new Date(tx.createdAt).toISOString().split('T')[0];
          return txDateStr === dateStr;
        } catch (e) {
          return false;
        }
      }).reduce((acc, tx) => acc + (tx.amountDOP || 0), 0);
    });

    const txCommissions = last7Days.map(dateStr => {
      return txList.filter(tx => {
        try {
          const txDateStr = new Date(tx.createdAt).toISOString().split('T')[0];
          return txDateStr === dateStr;
        } catch (e) {
          return false;
        }
      }).reduce((acc, tx) => acc + getTxCommissionDOP(tx), 0);
    });

    return { txCounts, txVolumes, txCommissions };
  };

  // Dynamic KPI numbers based on selected period & role
  const getCardsData = () => {
    // 1. Spécifique Agent RD
    if (currentUser.role === 'agent_rd') {
      const myTxs = transactions.filter(tx => tx.createdByName === currentUser.name || tx.createdByRole === 'agent_rd');
      const myVolDOP = myTxs.reduce((acc, tx) => acc + tx.amountDOP, 0);
      const myCompleted = myTxs.filter(tx => tx.status === 'completed').length;
      const { txCounts, txVolumes } = getDailyMetrics(myTxs);

      return [
        {
          title: t('global_transactions'),
          value: myTxs.length.toString(),
          percentage: `+${myCompleted} ${t('settled')}`,
          comparison: 'au guichet',
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: txCounts,
        },
        {
          title: t('global_volume'),
          value: `${myVolDOP.toLocaleString()} DOP`,
          percentage: '100%',
          comparison: t('in_cash'),
          isPositive: true,
          sparklineColor: '#14B8A6',
          gradientId: 'gradCard2',
          sparklineData: txVolumes,
        },
        {
          title: t('rate_label'),
          value: `100 DOP = ${Math.round(dopToHtgRate * 100)} HTG`,
          percentage: t('node_connected'),
          comparison: '',
          isPositive: true,
          sparklineColor: '#3B82F6',
          gradientId: 'gradCard3',
          sparklineData: [dopToHtgRate, dopToHtgRate, dopToHtgRate, dopToHtgRate, dopToHtgRate, dopToHtgRate, dopToHtgRate],
        },
      ];
    }

    // 2. Spécifique Agent Haïti
    if (currentUser.role === 'agent_haiti') {
      const htTxs = transactions.filter(tx => tx.channel === 'haiti_cash' || tx.assignedToRole === 'agent_haiti' || tx.operator === 'moncash' || tx.operator === 'natcash' || tx.operator === 'natcom');
      const htVolHTG = htTxs.filter(tx => tx.status === 'completed').reduce((acc, tx) => acc + tx.amountHTG, 0);
      const htPending = htTxs.filter(tx => tx.status === 'in_progress').length;
      const { txCounts, txVolumes } = getDailyMetrics(htTxs);

      return [
        {
          title: t('global_volume'),
          value: `${htVolHTG.toLocaleString()} HTG`,
          percentage: 'Fonds versés',
          comparison: 'en Haïti',
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: txVolumes,
        },
        {
          title: t('global_transactions'),
          value: htTxs.filter(tx => tx.status === 'completed').length.toString(),
          percentage: t('settled'),
          comparison: '',
          isPositive: true,
          sparklineColor: '#14B8A6',
          gradientId: 'gradCard2',
          sparklineData: txCounts,
        },
        {
          title: t('pending'),
          value: htPending.toString(),
          percentage: htPending > 0 ? t('in_progress_count') : t('node_connected'),
          comparison: '',
          isPositive: htPending === 0,
          sparklineColor: htPending > 0 ? '#F59E0B' : '#10B981',
          gradientId: 'gradCard3',
          sparklineData: txCounts,
        },
      ];
    }

    // 3. Admin / Gestionnaire
    const totalCount = transactions.length;
    const completedCount = transactions.filter(tx => tx.status === 'completed').length;
    const pendingCount = transactions.filter(tx => tx.status === 'in_progress').length;
    const totalVolumeDOP = transactions.reduce((acc, tx) => acc + tx.amountDOP, 0);

    const totalCommissionDOP = transactions.reduce((acc, tx) => acc + getTxCommissionDOP(tx), 0);
    const completedCommissionDOP = transactions
      .filter(tx => tx.status === 'completed')
      .reduce((acc, tx) => acc + getTxCommissionDOP(tx), 0);

    const { txCounts, txVolumes, txCommissions } = getDailyMetrics(transactions);

    return [
      {
        title: t('global_transactions'),
        value: totalCount.toString(),
        percentage: `${completedCount} ${t('settled')}`,
        comparison: `• ${pendingCount} ${t('in_progress_count')}`,
        isPositive: true,
        sparklineColor: '#10B981',
        gradientId: 'gradCard1',
        sparklineData: txCounts,
      },
      {
        title: t('global_volume'),
        value: `${totalVolumeDOP.toLocaleString()} DOP`,
        percentage: '100%',
        comparison: t('in_cash'),
        isPositive: true,
        sparklineColor: '#14B8A6',
        gradientId: 'gradCard2',
        sparklineData: txVolumes,
      },
      {
        title: t('admin_commissions'),
        value: `${totalCommissionDOP.toLocaleString()} DOP`,
        percentage: `+${completedCommissionDOP.toLocaleString()} DOP`,
        comparison: t('settled'),
        isPositive: true,
        sparklineColor: '#3B82F6',
        gradientId: 'gradCard3',
        sparklineData: txCommissions,
      },
    ];
  };

  const cards = getCardsData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
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
