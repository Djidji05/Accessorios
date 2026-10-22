import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Wallet, 
  FolderArchive, 
  Wrench, 
  Users, 
  UserCheck, 
  UserPlus, 
  SlidersHorizontal, 
  Power, 
  Scroll, 
  Settings, 
  ChevronDown, 
  MoreVertical,
  Lock,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  PlusCircle,
  ClipboardList,
  Landmark,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    unreadTasksCount,
    killSwitchList,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    logout,
    transactions,
    t
  } = useApp();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  
  // Auto-expand user management sub-menu if an inner user tab is selected
  const isUserMgmtActive = activeTab === 'users' || activeTab === 'user_list' || activeTab === 'create_user';
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState<boolean>(true);

  const activeKillCount = killSwitchList.filter(k => !k.enabled).length;

  // Filtrage selon le rôle connecté
  const role = currentUser.role;
  const isAdmin = role === 'admin';
  const isAgentRD = role === 'agent_rd';
  const isAgentHaiti = role === 'agent_haiti';
  const isGestionnaire = role === 'gestionnaire';

  // Compteur des transactions initiées par l'agent RD encore en attente
  const agentRDPendingCount = transactions.filter(
    t => (t.createdByRole === 'agent_rd' || t.createdByName === currentUser.name) && t.status === 'in_progress'
  ).length;

  // Compteur des flux numériques en attente pour le gestionnaire
  const gestionnairePendingCount = transactions.filter(
    t => (t.operator === 'moncash' || t.operator === 'digicel' || t.operator === 'claro' || t.operator === 'altice' || t.operator === 'natcom' || t.channel === 'digital_telecom') && t.status === 'in_progress'
  ).length;

  const canSeeGuichet = isAdmin;
  const canSeeTreasury = isAdmin || isGestionnaire;
  const canSeeKillSwitch = isAdmin;
  const canSeeUsers = isAdmin;
  const canSeePermissions = isAdmin;
  const canSeeAuditLogs = isAdmin;
  const canSeeAdminSection = canSeeUsers || canSeePermissions || canSeeKillSwitch || canSeeAuditLogs;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('button')) {
            setIsMobileSidebarOpen(false);
          }
        }}
        className={`${
          isMobileSidebarOpen 
            ? 'fixed inset-y-0 left-0 z-50 flex w-64 shadow-2xl bg-white border-r border-slate-200' 
            : 'hidden md:flex sticky top-0'
        } bg-[#FFFFFF] border-r border-slate-200 flex-col h-screen z-30 select-none text-slate-700 font-sans transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSidebarCollapsed && !isMobileSidebarOpen ? 'w-16' : 'w-64'
        }`}
      >
      
      {/* Brand Header: Logo + "D'Alexis Transferencia" + Collapse/Expand Icon */}
      <div className={`h-14 flex items-center border-b border-slate-200/80 bg-slate-50/50 transition-all duration-300 ${
        isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-2' : 'justify-between px-3.5'
      }`}>
        {(!isSidebarCollapsed || isMobileSidebarOpen) ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-slate-900/10 flex-shrink-0">
                A
              </div>
              <div className="truncate">
                <span className="font-extrabold text-slate-900 text-xs tracking-tight block leading-tight">
                  Alexis
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 tracking-tight block">
                  Transferencia
                </span>
              </div>
            </div>

            <div className="flex items-center flex-shrink-0">
              {isMobileSidebarOpen ? (
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                  title="Fermer le menu"
                >
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors items-center justify-center"
                  title="Réduire la barre latérale"
                  aria-label="Réduire la barre latérale"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md hover:bg-slate-800 transition-all group relative"
            title="Agrandir la barre latérale"
            aria-label="Agrandir la barre latérale"
          >
            <span className="group-hover:hidden">D</span>
            <PanelLeftOpen className="w-4 h-4 hidden group-hover:block text-white" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-2 py-3 space-y-2' : 'px-3 py-3 space-y-4'}`}>
        
        {/* CAS PARTICULIER 1 : AGENT R.D. (Strictement 2 Menus : Nouvelle Transaction & Mes Transactions du Jour) */}
        {isAgentRD ? (
          <nav className="space-y-1.5">
            {!isSidebarCollapsed && (
              <div className="px-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {t('Espace Guichet R.D.')}
                </span>
              </div>
            )}

            {/* ➕ Nouvelle Transaction (Guichet Saisie) */}
            <button
              onClick={() => setActiveTab('guichet')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all relative ${
                activeTab === 'guichet' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Nouvelle Transaction')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <PlusCircle className={`w-4 h-4 flex-shrink-0 ${activeTab === 'guichet' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Nouvelle Transaction')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'guichet' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {t('Guichet Saisie')}
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 📋 Mes Transactions du Jour */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all relative ${
                activeTab === 'tasks' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Mes Transactions')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <ClipboardList className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Mes Transactions')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'tasks' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {t('Suivi & Reçus du Jour')}
                    </span>
                  </div>
                )}
              </div>
              {agentRDPendingCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'tasks' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-900 border border-orange-200'
                  }`}>
                    {agentRDPendingCount} {t('En attente')}
                  </span>
                )
              )}
            </button>

            {/* 💵 Versements & Liquidations Hebdomadaires */}
            <button
              onClick={() => setActiveTab('settlements')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'settlements' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Versements & Liquidations')}
            >
              <Landmark className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settlements' ? 'text-white' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && (
                <div className="text-left">
                  <span className="block font-bold leading-tight">{t('Versements & Liquidations')}</span>
                  <span className={`text-[10px] block font-medium ${activeTab === 'settlements' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {t('Solde & Dépôts Admin')}
                  </span>
                </div>
              )}
            </button>
          </nav>
        ) : isAgentHaiti ? (
          <nav className="space-y-1.5">
            {!isSidebarCollapsed && (
              <div className="px-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {t('Espace Opérationnel Haïti')}
                </span>
              </div>
            )}

            {/* Décaissements Haïti */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all relative ${
                activeTab === 'tasks' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Décaissements Haïti')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <ClipboardList className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Décaissements Haïti')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'tasks' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {t('Retraits & Recharges')}
                    </span>
                  </div>
                )}
              </div>
              {unreadTasksCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'tasks' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-900 border border-orange-300'
                  }`}>
                    {unreadTasksCount}
                  </span>
                )
              )}
            </button>

            {/* 📁 Historique & Reçus Clôturés */}
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'history' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Historique & Reçus')}
            >
              <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && (
                <div className="text-left">
                  <span className="block font-bold leading-tight">{t('Historique & Reçus')}</span>
                  <span className={`text-[10px] block font-medium ${activeTab === 'history' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {t('Dossiers Clôturés')}
                  </span>
                </div>
              )}
            </button>
          </nav>
        ) : isGestionnaire ? (
          /* CAS PARTICULIER 3 : GESTIONNAIRE (Exactement 5 Menus : Tableau de bord, Flux Numérique, Trésorerie, Supervision, Historique) */
          <nav className="space-y-1.5">
            {!isSidebarCollapsed && (
              <div className="px-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {t('Centre d\'Action Mobile')}
                </span>
              </div>
            )}

            {/* 1. 📊 Tableau de bord de l'entreprise (KPIs & Statistiques) */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'overview' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Tableau de bord')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Tableau de bord')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'overview' ? 'text-slate-300' : 'text-slate-400'}`}>
                      KPIs & Statistiques
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* ➕ Nouvelle Transaction (Saisie Directe Gestionnaire) */}
            <button
              onClick={() => setActiveTab('guichet')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all relative ${
                activeTab === 'guichet' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Nouvelle Transaction')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <PlusCircle className={`w-4 h-4 flex-shrink-0 ${activeTab === 'guichet' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Nouvelle Transaction')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'guichet' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {t('Guichet Saisie')}
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 2. ⚡ Flux en Temps Réel (Tâches Numériques) */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all relative ${
                activeTab === 'tasks' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('File d\'attente Tâches')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Zap className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('File d\'attente')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'tasks' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Tâches & Routage
                    </span>
                  </div>
                )}
              </div>
              {gestionnairePendingCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'tasks' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-900 border border-orange-300'
                  }`}>
                    {gestionnairePendingCount}
                  </span>
                )
              )}
            </button>

            {/* 3. 💸 Suivi de la Trésorerie */}
            <button
              onClick={() => setActiveTab('treasury')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'treasury' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Trésorerie & Solde')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Wallet className={`w-4 h-4 flex-shrink-0 ${activeTab === 'treasury' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Trésorerie & Solde')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'treasury' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Soldes & Liquidités
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 5. 📁 Historique & Rapports */}
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'history' 
                  ? 'bg-slate-900 text-white font-bold shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('Historique')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">{t('Historique')}</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'history' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Archives & Bilans
                    </span>
                  </div>
                )}
              </div>
            </button>
          </nav>
        ) : (
          /* TOP LEVEL NAVIGATION STANDARD POUR ADMIN */
          <nav className="space-y-1">
            
            {/* 📊 Tableau de bord (Dashboard & KPIs) */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                activeTab === 'overview' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('nav_dashboard')}
            >
              <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && <span>{t('nav_dashboard')}</span>}
            </button>

            {/* ⚡ Flux en Temps Réel (Tâches & Routage) */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs transition-all relative ${
                activeTab === 'tasks' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('nav_tasks')}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Zap className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-amber-400' : 'text-amber-500'}`} />
                {!isSidebarCollapsed && <span>{t('nav_tasks')}</span>}
              </div>
              {unreadTasksCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'tasks' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-900 border border-orange-300'
                  }`}>
                    {unreadTasksCount}
                  </span>
                )
              )}
            </button>

            {/* 💸 Trésorerie & Soldes (MonCash, Natcash, etc.) - Réservé Admin & Gestionnaire */}
            {canSeeTreasury && (
              <button
                onClick={() => setActiveTab('treasury')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                  activeTab === 'treasury' 
                    ? 'bg-slate-900 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                }`}
                title={t('nav_treasury')}
              >
                <Wallet className={`w-4 h-4 flex-shrink-0 ${activeTab === 'treasury' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                {!isSidebarCollapsed && <span>{t('nav_treasury')}</span>}
              </button>
            )}

            {/* 📁 Historique & Pièces Justificatives */}
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                activeTab === 'history' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('nav_history')}
            >
              <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && (
                <span>{t('nav_history')}</span>
              )}
            </button>

            {/* 💵 Versements & Liquidations Hebdomadaires */}
            <button
              onClick={() => setActiveTab('settlements')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                activeTab === 'settlements' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={t('nav_settlements')}
            >
              <Landmark className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settlements' ? 'text-white' : 'text-emerald-600'}`} />
              {!isSidebarCollapsed && (
                <span>{t('nav_settlements')}</span>
              )}
            </button>
          </nav>
        )}

        {/* ESPACE OPÉRATIONS - Uniquement visible pour Admin et Agent RD */}
        {canSeeGuichet && (
          <div className={isSidebarCollapsed ? 'pt-1' : 'pt-2'}>
            {!isSidebarCollapsed ? (
              <div className="px-3 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {t('Opérations Guichet')}
                </span>
              </div>
            ) : (
              <div className="h-px bg-slate-100 my-1.5 mx-1" />
            )}
            
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('guichet')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                  activeTab === 'guichet' 
                    ? 'bg-slate-900 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                }`}
                title={t('Espace Opérations')}
              >
                <Wrench className={`w-4 h-4 flex-shrink-0 ${activeTab === 'guichet' ? 'text-indigo-300' : 'text-indigo-600'}`} />
                {!isSidebarCollapsed && <span className="truncate">{t('Espace Opérations')}</span>}
              </button>
            </div>
          </div>
        )}

        {/* 🔒 ADMINISTRATION & SÉCURITÉ - Conditionné selon les permissions */}
        {canSeeAdminSection && (
          <div className={isSidebarCollapsed ? 'pt-1' : 'pt-2'}>
            {!isSidebarCollapsed ? (
              <div className="px-3 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  {t('Administration & Sécurité')}
                </span>
              </div>
            ) : (
              <div className="h-px bg-slate-100 my-1.5 mx-1" />
            )}

            <nav className="space-y-1">
              
              {/* 👥 Gestion des Utilisateurs - Uniquement Admin */}
              {canSeeUsers && (
                isSidebarCollapsed ? (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center justify-center p-2.5 rounded-xl text-xs transition-all ${
                      isUserMgmtActive
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={t('nav_users')}
                  >
                    <Users className={`w-4 h-4 flex-shrink-0 ${isUserMgmtActive ? 'text-white' : 'text-blue-600'}`} />
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => setIsUserMgmtOpen(!isUserMgmtOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isUserMgmtActive
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{t('nav_users')}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMgmtOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMgmtOpen && (
                      <div className="ml-5 pl-2.5 border-l-2 border-slate-200 space-y-1 mt-1 my-1">
                        <button 
                          onClick={() => {
                            setActiveTab('user_list');
                            setIsMobileSidebarOpen(false);
                          }} 
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                            activeTab === 'user_list' || activeTab === 'users'
                              ? 'text-blue-900 font-bold bg-blue-50/80 border border-blue-100' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>📋 {t('sub_user_list')}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('create_user');
                            setIsMobileSidebarOpen(false);
                          }} 
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                            activeTab === 'create_user'
                              ? 'text-blue-900 font-bold bg-blue-50/80 border border-blue-100' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                          <span>➕ {t('sub_create_user')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* 🔌 Sécurité Services (Interrupteurs d'urgence) - Admin & Gestionnaire */}
              {canSeeKillSwitch && (
                <button
                  onClick={() => setActiveTab('kill_switch')}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs transition-all relative ${
                    activeTab === 'kill_switch' 
                      ? 'bg-rose-900 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:bg-rose-50 hover:text-rose-950 font-semibold'
                  }`}
                  title={t('nav_kill_switch')}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Power className={`w-4 h-4 flex-shrink-0 ${activeTab === 'kill_switch' ? 'text-rose-300' : 'text-rose-600'}`} />
                    {!isSidebarCollapsed && <span>{t('nav_kill_switch')}</span>}
                  </div>
                  {activeKillCount > 0 && (
                    isSidebarCollapsed ? (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                    ) : (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                        {activeKillCount} OFF
                      </span>
                    )
                  )}
                </button>
              )}

              {/* 📜 Journaux d'Audit & Logs - Uniquement Admin */}
              {canSeeAuditLogs && (
                <button
                  onClick={() => setActiveTab('audit_logs')}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                    activeTab === 'audit_logs' 
                      ? 'bg-slate-900 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  }`}
                  title={t('nav_audit_logs')}
                >
                  <Scroll className={`w-4 h-4 flex-shrink-0 ${activeTab === 'audit_logs' ? 'text-white' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span>{t('nav_audit_logs')}</span>}
                </button>
              )}
            </nav>
          </div>
        )}

        {/* ⚙️ PARAMÈTRES GÉNÉRAUX */}
        <div className={isSidebarCollapsed ? 'pt-1 border-t border-slate-100' : 'pt-2 border-t border-slate-100'}>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
              activeTab === 'settings' 
                ? 'bg-slate-900 text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
            }`}
            title={t('nav_settings')}
          >
            <Settings className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
            {!isSidebarCollapsed && <span>{t('nav_settings')}</span>}
          </button>
        </div>

      </div>

      {/* Bottom Profile Switcher */}
      <div className="p-2 border-t border-slate-100">
        <div className="relative">
          <button 
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-1.5' : 'justify-between px-2 py-1.5'} rounded-xl hover:bg-slate-100 transition-all group`}
            title={`${currentUser.name} (${currentUser.role})`}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'} overflow-hidden`}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
              {!isSidebarCollapsed && (
                <div className="text-left truncate">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <MoreVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0 ml-1" />
            )}
          </button>

          {/* Logout Dropdown (Desktop PC Mode Only) */}
          {isPersonaOpen && (
            <div className={`absolute bottom-full ${isSidebarCollapsed ? 'left-14 w-56' : 'left-0 w-full'} mb-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in`}>
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <p className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
              </div>

              {/* Bouton Déconnexion */}
              <button
                onClick={() => {
                  setIsPersonaOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{t('Se déconnecter')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  </>
  );
};
