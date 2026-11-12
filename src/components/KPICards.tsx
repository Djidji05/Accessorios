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

  // Taux de référence direct USD -> DOP (ex: 58.0 DOP)
  const usdToDopRate = (usdToHtgRate && usdToHtgRate <= 100)
    ? usdToHtgRate
    : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);

  // Helper pour calculer la commission d'une transaction en DOP (taux dynamique par service, 0 sur Dépôt)
  const getTxCommissionDOP = (tx: typeof transactions[0]) => {
    if (tx.status === 'cancelled' || tx.serviceType === 'haiti_inbound_cash') {
      return 0;
    }
    const commRate = (serviceCommissionRates[tx.operator] ?? 1.0) / 100;
    if (tx.operator === 'zelle' || tx.amountUSD) {
      const amtUSD = tx.amountUSD || (tx.amountDOP ? tx.amountDOP / usdToDopRate : 0);
      const commUSD = amtUSD * commRate;
      return tx.commissionDOP && tx.commissionDOP > 0 ? tx.commissionDOP : Math.max(1, Math.round(commUSD * usdToDopRate));
    }
    return tx.commissionDOP && tx.commissionDOP > 0 ? tx.commissionDOP : Math.max(1, Math.round(tx.amountDOP * commRate));
  };

  // Filtrer les transactions selon la plage de dates sélectionnée dans le calendrier du Dashboard
  const scopedTransactions = React.useMemo(() => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return transactions;
    }
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return transactions.filter((tx) => {
      try {
        const txDate = new Date(tx.createdAt);
        return txDate >= start && txDate <= end;
      } catch (e) {
        return true;
      }
    });
  }, [transactions, dateRange]);

  // Helper pour générer les points de données temporels basés sur les transactions filtrées
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
    const periodLabel = dateRange?.label ? `(${dateRange.label})` : '';

    // 1. Spécifique Agent RD
    if (currentUser.role === 'agent_rd') {
      const myTxs = scopedTransactions.filter(tx => tx.createdByName === currentUser.name || tx.createdByRole === 'agent_rd');
      const myVolDOP = myTxs.reduce((acc, tx) => acc + tx.amountDOP, 0);
      const myCompleted = myTxs.filter(tx => tx.status === 'completed').length;
      const { txCounts, txVolumes } = getDailyMetrics(myTxs);

      return [
        {
          title: t('global_transactions'),
          value: myTxs.length.toString(),
          percentage: `+${myCompleted} ${t('settled')}`,
          comparison: periodLabel || t('au guichet', 'au guichet'),
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: txCounts,
        },
        {
          title: t('global_volume'),
          value: `${myVolDOP.toLocaleString()} DOP`,
          percentage: '100%',
          comparison: periodLabel || t('in_cash'),
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
      const htTxs = scopedTransactions.filter(tx => (tx.operator === 'natcash' || tx.operator === 'natcom') && tx.serviceType !== 'haiti_inbound_cash');
      const htVolHTG = htTxs.filter(tx => tx.status === 'completed').reduce((acc, tx) => acc + tx.amountHTG, 0);
      const htPending = htTxs.filter(tx => tx.status === 'in_progress').length;
      const { txCounts, txVolumes } = getDailyMetrics(htTxs);

      return [
        {
          title: t('global_volume'),
          value: `${htVolHTG.toLocaleString()} HTG`,
          percentage: t('Fonds versés', 'Fonds versés'),
          comparison: periodLabel || t('en Haïti', 'en Haïti'),
          isPositive: true,
          sparklineColor: '#10B981',
          gradientId: 'gradCard1',
          sparklineData: txVolumes,
        },
        {
          title: t('global_transactions'),
          value: htTxs.filter(tx => tx.status === 'completed').length.toString(),
          percentage: t('settled'),
          comparison: periodLabel,
          isPositive: true,
          sparklineColor: '#14B8A6',
          gradientId: 'gradCard2',
          sparklineData: txCounts,
        },
        {
          title: t('pending'),
          value: htPending.toString(),
          percentage: htPending > 0 ? t('in_progress_count') : t('node_connected'),
          comparison: periodLabel,
          isPositive: htPending === 0,
          sparklineColor: htPending > 0 ? '#F59E0B' : '#10B981',
          gradientId: 'gradCard3',
          sparklineData: txCounts,
        },
      ];
    }

    // 3. Admin / Gestionnaire
    const activeTransactions = scopedTransactions.filter(tx => tx.status !== 'cancelled');
    const totalCount = scopedTransactions.length;
    const completedCount = scopedTransactions.filter(tx => tx.status === 'completed').length;
    const pendingCount = scopedTransactions.filter(tx => tx.status === 'in_progress').length;
    const totalVolumeDOP = activeTransactions.reduce((acc, tx) => acc + (tx.amountDOP || 0), 0);

    const totalCommissionDOP = activeTransactions.reduce((acc, tx) => acc + getTxCommissionDOP(tx), 0);
    const completedCommissionDOP = scopedTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((acc, tx) => acc + getTxCommissionDOP(tx), 0);

    const { txCounts, txVolumes, txCommissions } = getDailyMetrics(scopedTransactions);

    return [
      {
        title: t('global_transactions'),
        value: totalCount.toString(),
        percentage: `${completedCount} ${t('settled')}`,
        comparison: periodLabel ? `${periodLabel} • ${pendingCount} ${t('in_progress_count')}` : `• ${pendingCount} ${t('in_progress_count')}`,
        isPositive: true,
        sparklineColor: '#10B981',
        gradientId: 'gradCard1',
        sparklineData: txCounts,
      },
      {
        title: t('global_volume'),
        value: `${totalVolumeDOP.toLocaleString()} DOP`,
        percentage: '100%',
        comparison: periodLabel || t('in_cash'),
        isPositive: true,
        sparklineColor: '#14B8A6',
        gradientId: 'gradCard2',
        sparklineData: txVolumes,
      },
      {
        title: t('admin_commissions'),
        value: `${totalCommissionDOP.toLocaleString()} DOP`,
        percentage: `+${completedCommissionDOP.toLocaleString()} DOP`,
        comparison: periodLabel || t('settled'),
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
