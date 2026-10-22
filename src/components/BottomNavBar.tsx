import React from 'react';
import { LayoutDashboard, History, Landmark, Settings, Zap, Bell, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, selectedService, selectedReceiptTx, isTransactionDetailOpen, t } = useApp();

  // Hide bottom navbar when inspecting receipts, filling transfer forms, viewing details, or on administrative pages
  if (
    isTransactionDetailOpen ||
    selectedReceiptTx ||
    selectedService ||
    (activeTab as string) === 'notifications' ||
    (activeTab as string) === 'users' ||
    (activeTab as string) === 'treasury' ||
    (activeTab as string) === 'kill_switch' ||
    (activeTab as string) === 'audit'
  ) {
    return null;
  }

  const role = currentUser.role;
  const isAgentHaiti = role === 'agent_haiti';
  const isAgentRD = role === 'agent_rd';
  const isGestionnaire = role === 'gestionnaire';

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

  // Admin and Gestionnaire roles use responsive layout (header & mobile sidebar drawer)
  return null;
};
