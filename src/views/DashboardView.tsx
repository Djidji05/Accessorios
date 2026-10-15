import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPICards } from '../components/KPICards';
import { TicketTrendChart } from '../components/charts/TicketTrendChart';
import { LatestUpdatesPanel } from '../components/LatestUpdatesPanel';
import { TransactionsTable } from '../components/TransactionsTable';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';
import { MobileGestionnaireHome } from '../components/MobileGestionnaireHome';
import { Zap, BarChart3 } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { currentUser, t } = useApp();
  const isGestionnaire = currentUser.role === 'gestionnaire';
  
  // On mobile, Gestionnaire defaults to operations action center; Admin defaults to analytics
  const [mobileView, setMobileView] = useState<'operations' | 'analytics'>(
    isGestionnaire ? 'operations' : 'analytics'
  );

  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours'
  });

  return (
    <>
      {/* 📱 MODE MOBILE (md:hidden) : Gestionnaire & Admin Responsive Portal */}
      <div className="block md:hidden">
        {/* Mobile View Switcher Pill (only shown for Gestionnaire or Admin) */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 sticky top-0 z-30 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-full">
            <button
              onClick={() => setMobileView('operations')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === 'operations'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Actions & Preuves</span>
            </button>
            <button
              onClick={() => setMobileView('analytics')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistiques & SLA</span>
            </button>
          </div>
        </div>

        {mobileView === 'operations' ? (
          <MobileGestionnaireHome />
        ) : (
          <div className="p-3 space-y-4 pb-28">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Tableau de bord
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Vue d'ensemble • {currentUser.name}
                </p>
              </div>
              <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
            </div>

            <KPICards dateRange={selectedRange} />
            <TicketTrendChart dateRange={selectedRange} />
            <LatestUpdatesPanel />
            <div className="overflow-x-auto -mx-3 px-3">
              <TransactionsTable dateRange={selectedRange} />
            </div>
          </div>
        )}
      </div>

      {/* 💻 MODE TABLETTE & DESKTOP (hidden md:block) */}
      <div className="hidden md:block p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Welcome Banner */}
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
            <KPICards dateRange={selectedRange} />
            <TicketTrendChart dateRange={selectedRange} />
          </div>

          {/* Right Column: Activity Panel */}
          <div className="lg:col-span-1 lg:h-[581px] h-auto">
            <LatestUpdatesPanel />
          </div>
        </div>

        {/* Bottom Section: Transactions Table */}
        <div className="w-full overflow-hidden">
          <TransactionsTable dateRange={selectedRange} />
        </div>
      </div>
    </>
  );
};
