import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from 'recharts';
import { Layers } from 'lucide-react';
import { DateRange } from '../DateRangePicker';
import { useApp } from '../../context/AppContext';

const baseData = [
  { day: 'Dim', volume: 270 },
  { day: 'Lun', volume: 410 },
  { day: 'Mar', volume: 584 },
  { day: 'Mer', volume: 310 },
  { day: 'Jeu', volume: 490 },
  { day: 'Ven', volume: 450 },
  { day: 'Sam', volume: 530 },
];

interface TicketTrendChartProps {
  dateRange?: DateRange;
}

export const TicketTrendChart: React.FC<TicketTrendChartProps> = ({ dateRange }) => {
  const { transactions } = useApp();
  const [activeIndex, setActiveIndex] = useState<number>(2); // Default to Mar (index 2)
  const [hoverYPx, setHoverYPx] = useState<number>(65);

  // Dynamic volume calculation based on date range
  const filteredTx = transactions.filter(tx => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) return true;
    const d = new Date(tx.createdAt);
    const start = new Date(dateRange.startDate);
    start.setHours(0,0,0,0);
    const end = new Date(dateRange.endDate);
    end.setHours(23,59,59,999);
    return d >= start && d <= end;
  });

  const rangeTotalVolume = filteredTx.length > 0
    ? filteredTx.reduce((sum, tx) => sum + tx.amountDOP, 0)
    : 479000;

  const data = baseData.map(item => ({
    ...item,
    volume: dateRange?.preset === 'today' ? Math.round(item.volume * 0.3) : item.volume
  }));

  const activeItem = data[activeIndex] || data[2];

  // Calculate horizontal percentage for tooltip placement over each bar
  const getTagLeftPercent = (idx: number) => {
    const percentages = [10.5, 23.5, 36.5, 50.0, 63.5, 76.5, 89.5];
    return percentages[idx] !== undefined ? percentages[idx] : 36.5;
  };

  const activeXPercent = getTagLeftPercent(activeIndex);

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-[22px] border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      
      {/* Header inside card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Layers className="w-3.5 h-3.5 rotate-45" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tendance du Volume de Transactions ({dateRange?.label || 'Last week'})
          </span>
        </div>
      </div>

      {/* Main Metric */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
          {rangeTotalVolume.toLocaleString()} DOP
        </span>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          +8% <span className="text-slate-400 dark:text-slate-500 font-normal">vs période précédente</span>
        </span>
      </div>

      {/* Chart Canvas Area */}
      <div 
        className="w-full relative pt-8 pb-1"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relativeX = e.clientX - rect.left;
          const index = Math.min(
            data.length - 1,
            Math.max(0, Math.floor((relativeX / rect.width) * data.length))
          );
          setActiveIndex(index);
        }}
      >
        
        {/* Floating Dark Pill Tooltip Badge over Active Bar */}
        <div 
          className="absolute z-20 top-[-2px] -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-200"
          style={{ left: `${activeXPercent}%` }}
        >
          <div className="bg-[#0F172A] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-slate-700">
            <span>{activeItem.day}:</span>
            <span className="font-extrabold text-white">{activeItem.volume}</span>
          </div>
          {/* Downward triangle indicator */}
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#0F172A]" />
        </div>

        {/* Horizontal Dotted Line from Tooltip to Chart Right Edge */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1={`${activeXPercent}%`}
            y1={hoverYPx || 65}
            x2="95%"
            y2={hoverYPx || 65}
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="transition-all duration-150 opacity-60"
          />
        </svg>

        {/* Recharts Rounded Bar Chart */}
        <div className="h-48 w-full">
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
              {/* X-Axis Days */}
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
                dy={8}
              />
              
              {/* Rounded Vertical Bars matching screenshot */}
              <Bar dataKey="volume" radius={[8, 8, 8, 8]} barSize={38}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === activeIndex ? '#0F172A' : '#E2E8F0'} 
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
