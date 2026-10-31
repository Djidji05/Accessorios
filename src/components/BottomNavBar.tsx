import React from 'react';
import { LayoutDashboard, History, Landmark, Settings, Zap, Bell, Users, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    selectedService, 
    selectedReceiptTx, 
    isTransactionDetailOpen, 
    unreadTasksCount,
    t 
  } = useApp();

  // Hide bottom navbar when inspecting receipts, filling transfer forms, or viewing full-screen transaction details
  if (
    isTransactionDetailOpen ||
    selectedReceiptTx ||
    selectedService ||
    (activeTab as string) === 'notifications'
  ) {
    return null;
  }

  const role = currentUser.role;
  const isAgentHaiti = role === 'agent_haiti';
  const isAgentRD = role === 'agent_rd';

  if (isAgentHaiti) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 md:hidden px-3 py-2 shadow-xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Tâches / Décaissements Haïti */}
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'tasks' || activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Tâches')}</span>
          </button>

          {/* Historique Haïti */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Historique')}</span>
          </button>

          {/* Paramètres */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Paramètres')}</span>
          </button>
        </div>
      </nav>
    );
  }

  if (isAgentRD) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 md:hidden px-3 py-2 shadow-xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Guichet / Accueil */}
          <button
            type="button"
            onClick={() => setActiveTab('guichet')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'guichet' || activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Accueil')}</span>
          </button>

          {/* Historique */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Historique')}</span>
          </button>

          {/* Dépôts */}
          <button
            type="button"
            onClick={() => setActiveTab('settlements')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'settlements'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Dépôts')}</span>
          </button>

          {/* Paramètres */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight font-semibold">{t('Paramètres')}</span>
          </button>
        </div>
      </nav>
    );
  }

  // Admin and Gestionnaire roles Mobile Bottom Navigation Bar
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 md:hidden px-2 py-1.5 shadow-xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Tableau de bord */}
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight font-semibold">{t('nav_dashboard', 'Tableau')}</span>
        </button>

        {/* 2. File d'attente / Tâches (avec badge des tâches en attente) */}
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer ${
            activeTab === 'tasks'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Zap className={`w-5 h-5 ${activeTab === 'tasks' ? 'text-amber-500' : ''}`} />
            {unreadTasksCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full bg-orange-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                {unreadTasksCount > 99 ? '99+' : unreadTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-semibold">{t('nav_tasks', 'Tâches')}</span>
        </button>

        {/* 3. Trésorerie */}
        <button
          type="button"
          onClick={() => setActiveTab('treasury')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'treasury'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Landmark className="w-5 h-5" />
          <span className="text-[10px] tracking-tight font-semibold">{t('nav_treasury', 'Trésorerie')}</span>
        </button>

        {/* 4. Historique */}
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] tracking-tight font-semibold">{t('nav_history', 'Historique')}</span>
        </button>

        {/* 5. Paramètres */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight font-semibold">{t('nav_settings', 'Paramètres')}</span>
        </button>
      </div>
    </nav>
  );
};
