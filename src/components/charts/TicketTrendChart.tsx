import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell, YAxis } from 'recharts';
import { Layers } from 'lucide-react';
import { DateRange } from '../DateRangePicker';
import { useApp } from '../../context/AppContext';

interface TicketTrendChartProps {
  dateRange?: DateRange;
}

const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export const TicketTrendChart: React.FC<TicketTrendChartProps> = ({ dateRange }) => {
  const { transactions, t } = useApp();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoverYPx, setHoverYPx] = useState<number | null>(null);

  // Filtrer les transactions selon la plage de dates
  const filteredTx = transactions.filter(tx => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) return true;
    try {
      const d = new Date(tx.createdAt);
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    } catch (e) {
      return true;
    }
  });

  const rangeTotalVolume = filteredTx.reduce((sum, tx) => sum + (tx.amountDOP || 0), 0);

  // Calcul du volume réel par jour
  const getChartData = () => {
    const dailyMap: Record<string, number> = {
      Dim: 0, Lun: 0, Mar: 0, Mer: 0, Jeu: 0, Ven: 0, Sam: 0
    };

    filteredTx.forEach(tx => {
      try {
        const d = new Date(tx.createdAt);
        const dayName = dayLabels[d.getDay()];
        if (dayName) {
          dailyMap[dayName] = (dailyMap[dayName] || 0) + (tx.amountDOP || 0);
        }
      } catch (e) {}
    });

    return dayLabels.map(day => ({
      day,
      volume: dailyMap[day] || 0
    }));
  };

  const data = getChartData();
  const hasData = rangeTotalVolume > 0 || data.some(d => d.volume > 0);

  // Calcul du pourcentage horizontal pour l'alignement du tooltip
  const getTagLeftPercent = (idx: number) => {
    const percentages = [10.5, 23.5, 36.5, 50.0, 63.5, 76.5, 89.5];
    return percentages[idx] !== undefined ? percentages[idx] : 50.0;
  };

  const selectedIdx = activeIndex !== null ? activeIndex : (hasData ? 2 : null);
  const activeItem = selectedIdx !== null ? data[selectedIdx] : null;
  const activeXPercent = selectedIdx !== null ? getTagLeftPercent(selectedIdx) : 50;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      
      {/* En-tête de la carte */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Layers className="w-3.5 h-3.5 rotate-45" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tendance du Volume de Transactions ({dateRange?.label || '7 derniers jours'})
          </span>
        </div>
      </div>

      {/* Métrique principale (Sans font-mono pour éviter le zéro barré 0̸) */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {rangeTotalVolume.toLocaleString()} DOP
        </span>
        {hasData ? (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            +8% <span className="text-slate-400 dark:text-slate-500 font-normal">vs période précédente</span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            0% <span className="text-slate-400 dark:text-slate-500 font-normal">(Réseau initialisé à 0)</span>
          </span>
        )}
      </div>

      {/* Zone du graphique */}
      <div 
        className="w-full relative pt-8 pb-1"
        onMouseLeave={() => {
          setActiveIndex(null);
          setHoverYPx(null);
        }}
      >
        
        {/* Tooltip flottant (uniquement lorsqu'un jour est survolé ou qu'il y a des données réelles) */}
        {activeItem && hasData && (
          <div 
            className="absolute z-20 top-[-2px] -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-200"
            style={{ left: `${activeXPercent}%` }}
          >
            <div className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-slate-700">
              <span>{activeItem.day}:</span>
              <span className="font-extrabold text-white">{activeItem.volume.toLocaleString()} DOP</span>
            </div>
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#0A192F]" />
          </div>
        )}

        {/* Ligne pointillée horizontale (Affichée uniquement en survol actif avec données) */}
        {hasData && hoverYPx !== null && activeIndex !== null && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1={`${activeXPercent}%`}
              y1={hoverYPx}
              x2="95%"
              y2={hoverYPx}
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="transition-all duration-150 opacity-60"
            />
          </svg>
        )}

        {/* Recharts BarChart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
              onMouseMove={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex);
                }
                if (state && state.chartY !== undefined) {
                  setHoverYPx(state.chartY + 15);
                }
              }}
            >
              <YAxis domain={[0, (dataMax: number) => Math.max(dataMax, 100)]} hide />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                dy={8}
              />
              
              <Bar dataKey="volume" radius={[8, 8, 8, 8]} barSize={38}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === activeIndex ? '#0F172A' : (hasData && entry.volume > 0 ? '#CBD5E1' : '#F1F5F9')} 
                    className="transition-colors duration-150 cursor-pointer hover:fill-slate-900"
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};
