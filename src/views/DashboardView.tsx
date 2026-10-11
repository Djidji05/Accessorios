import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPICards } from '../components/KPICards';
import { TicketTrendChart } from '../components/charts/TicketTrendChart';
import { LatestUpdatesPanel } from '../components/LatestUpdatesPanel';
import { TransactionsTable } from '../components/TransactionsTable';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';
import { MobileGestionnaireHome } from '../components/MobileGestionnaireHome';

export const DashboardView: React.FC = () => {
  const { currentUser, t } = useApp();
  const isDesktopNavRole = currentUser.role === 'admin' || currentUser.role === 'gestionnaire';
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours'
  });

  return (
    <>
      {/* 📱 MODE AGENT MOBILE (md:hidden) */}
      {!isDesktopNavRole && (
        <div className="block md:hidden">
          <MobileGestionnaireHome />
        </div>
      )}

      {/* 💻 MODE DESKTOP & RESPONSIVE MOBILE POUR ADMIN ET GESTIONNAIRE */}
      <div className={`${isDesktopNavRole ? 'block' : 'hidden md:block'} p-3 sm:p-6 space-y-5 max-w-[1600px] mx-auto`}>
        {/* Welcome Banner matching reference screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {t('hello')}, {currentUser.name} <span className="text-xl">👋</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {t('operational_portal')} • <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{currentUser.role.replace('_', ' ')}</span> • {currentUser.location}
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

          {/* Right Column: Activity Panel */}
          <div className="lg:col-span-1 lg:h-[581px] h-auto">
            <LatestUpdatesPanel />
          </div>
        </div>

        {/* Bottom Section: Transactions Table */}
        <TransactionsTable dateRange={selectedRange} />
      </div>
    </>
  );
};
