import React from 'react';
import { AreaChart, Area, YAxis } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  gradientId?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({ 
  data, 
  color = '#10B981',
  gradientId = 'sparklineGrad'
}) => {
  const chartData = data.map((val, idx) => ({ idx, val }));

  return (
    <div className="h-10 w-24 overflow-hidden flex items-center justify-center">
      <AreaChart width={96} height={40} data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <YAxis domain={[0, (dataMax: number) => Math.max(dataMax, 1)]} hide />
        <Area
          type="monotone"
          dataKey="val"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
};
