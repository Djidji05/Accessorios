import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPICards } from '../components/KPICards';
import { TicketTrendChart } from '../components/charts/TicketTrendChart';
import { LatestUpdatesPanel } from '../components/LatestUpdatesPanel';
import { TransactionsTable } from '../components/TransactionsTable';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';

export const DashboardView: React.FC = () => {
  const { currentUser } = useApp();
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(2026, 8, 5),
    endDate: new Date(2026, 8, 12),
    label: 'Last week'
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      
      {/* Welcome Banner matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Bonjour, {currentUser.name} <span className="text-xl">👋</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Portail Opérationnel • <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{currentUser.role.replace('_', ' ')}</span> • {currentUser.location}
          </p>
        </div>

        {/* Date Filter Pill Button & Calendar Popover */}
        <div className="flex items-center gap-2">
          <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left 2 Columns: KPI Cards & Ticket Volume Trend Chart */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* KPI Cards */}
          <KPICards dateRange={selectedRange} />

          {/* Ticket Volume Trend Card */}
          <TicketTrendChart dateRange={selectedRange} />

        </div>

        {/* Right Column: Activity Panel (Hauteur ajustée à 581px) */}
        <div className="lg:col-span-1 lg:h-[581px] h-[581px]">
          <LatestUpdatesPanel />
        </div>

      </div>

      {/* Bottom Section: Transactions Table */}
      <TransactionsTable dateRange={selectedRange} />
    </div>
  );
};
