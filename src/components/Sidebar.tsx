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
  Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    activeTab, 
    setActiveTab, 
    unreadTasksCount,
    killSwitchList,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    logout,
    transactions
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
    <aside className={`hidden md:flex bg-[#FFFFFF] border-r border-[#E2E8F0] flex-col h-screen sticky top-0 z-30 select-none text-slate-700 font-sans transition-all duration-300 ease-in-out flex-shrink-0 ${
      isSidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Brand Header: Logo + "D'Alexis Transferencia" + Collapse/Expand Icon */}
      <div className={`h-14 flex items-center border-b border-slate-200/80 bg-slate-50/50 transition-all duration-300 ${
        isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
      }`}>
        {!isSidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-slate-900/10 flex-shrink-0">
                D
              </div>
              <div className="truncate">
                <span className="font-extrabold text-slate-900 text-xs tracking-tight block leading-tight">
                  D'Alexis
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 tracking-tight block">
                  Transferencia y accesorio
                </span>
              </div>
            </div>

            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center"
                title="Réduire la barre latérale"
                aria-label="Réduire la barre latérale"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
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
                  Espace Guichet R.D.
                </span>
              </div>
            )}

            {/* ➕ Nouvelle Transaction (Guichet Saisie) */}
            <button
              onClick={() => setActiveTab('guichet')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all relative ${
                activeTab === 'guichet' 
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="➕ Nouvelle Transaction (Guichet Saisie)"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <PlusCircle className={`w-4 h-4 flex-shrink-0 ${activeTab === 'guichet' ? 'text-white' : 'text-emerald-600'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Nouvelle Transaction</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'guichet' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      Guichet Saisie
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
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="📋 Mes Transactions du Jour"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <ClipboardList className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Mes Transactions</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'tasks' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      Suivi & Reçus du Jour
                    </span>
                  </div>
                )}
              </div>
              {agentRDPendingCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'tasks' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {agentRDPendingCount} en attente
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
              title="Versements & Liquidations Hebdo"
            >
              <Landmark className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settlements' ? 'text-white' : 'text-emerald-600'}`} />
              {!isSidebarCollapsed && (
                <div className="text-left">
                  <span className="block font-bold leading-tight">Versements & Liquidations</span>
                  <span className={`text-[10px] block font-medium ${activeTab === 'settlements' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Solde & Dépôts Admin
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
                  Espace Opérationnel Haïti
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
              title="Décaissements & Recharges Haïti"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <ClipboardList className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Décaissements Haïti</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'tasks' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Retraits & Recharges
                    </span>
                  </div>
                )}
              </div>
              {unreadTasksCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'tasks' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-800'
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
              title="📁 Historique & Reçus Clôturés"
            >
              <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && (
                <div className="text-left">
                  <span className="block font-bold leading-tight">Historique & Reçus</span>
                  <span className={`text-[10px] block font-medium ${activeTab === 'history' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Dossiers Clôturés
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
                  Espace Gestion & Supervision
                </span>
              </div>
            )}

            {/* 1. 📊 Tableau de bord de l'entreprise (KPIs & Statistiques) */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'overview' 
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Tableau de bord de l'entreprise (KPIs & Statistiques)"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-purple-600'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Tableau de bord</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'overview' ? 'text-purple-100' : 'text-slate-400'}`}>
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
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="➕ Nouvelle Transaction (Saisie Directe Gestionnaire)"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <PlusCircle className={`w-4 h-4 flex-shrink-0 ${activeTab === 'guichet' ? 'text-white' : 'text-purple-600'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Nouvelle Transaction</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'guichet' ? 'text-purple-100' : 'text-slate-400'}`}>
                      Saisie Directe (Guichet)
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
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Flux en Temps Réel (Tâches Numériques)"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Zap className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-amber-300 fill-amber-300' : 'text-amber-500'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Flux en Temps Réel</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'tasks' ? 'text-purple-100' : 'text-slate-400'}`}>
                      Tâches Numériques & MonCash
                    </span>
                  </div>
                )}
              </div>
              {gestionnairePendingCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'tasks' ? 'bg-amber-400 text-slate-950' : 'bg-purple-100 text-purple-900'
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
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Suivi de la Trésorerie"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Wallet className={`w-4 h-4 flex-shrink-0 ${activeTab === 'treasury' ? 'text-white' : 'text-emerald-600'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Suivi Trésorerie</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'treasury' ? 'text-purple-100' : 'text-slate-400'}`}>
                      Soldes & Liquidités
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 4. 👥 Supervision des Agents */}
            <button
              onClick={() => setActiveTab('supervision')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs transition-all ${
                activeTab === 'supervision' 
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Supervision des Agents"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Users className={`w-4 h-4 flex-shrink-0 ${activeTab === 'supervision' ? 'text-white' : 'text-purple-600'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Supervision Agents</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'supervision' ? 'text-purple-100' : 'text-slate-400'}`}>
                      Équipes R.D. & Haïti
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
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Historique & Rapports"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Historique & Rapports</span>
                    <span className={`text-[10px] block font-medium ${activeTab === 'history' ? 'text-purple-100' : 'text-slate-400'}`}>
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
              title="Tableau de bord"
            >
              <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && <span>Tableau de bord</span>}
            </button>

            {/* ⚡ Flux en Temps Réel (Tâches & Routage) */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs transition-all relative ${
                activeTab === 'tasks' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Flux en Temps Réel"
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Zap className={`w-4 h-4 flex-shrink-0 ${activeTab === 'tasks' ? 'text-amber-400' : 'text-amber-500'}`} />
                {!isSidebarCollapsed && <span>Flux en Temps Réel</span>}
              </div>
              {unreadTasksCount > 0 && (
                isSidebarCollapsed ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                ) : (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'tasks' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
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
                title="Trésorerie & Soldes"
              >
                <Wallet className={`w-4 h-4 flex-shrink-0 ${activeTab === 'treasury' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                {!isSidebarCollapsed && <span>Trésorerie & Soldes</span>}
              </button>
            )}

            {/* 👥 Supervision des Agents - Admin */}
            <button
              onClick={() => setActiveTab('supervision')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                activeTab === 'supervision' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title="Supervision des Agents"
            >
              <Users className={`w-4 h-4 flex-shrink-0 ${activeTab === 'supervision' ? 'text-white' : 'text-purple-600'}`} />
              {!isSidebarCollapsed && <span>Supervision Agents</span>}
            </button>

            {/* 📁 Historique & Pièces Justificatives */}
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                activeTab === 'history' 
                  ? 'bg-slate-900 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
              }`}
              title={isAgentRD ? "Mes Transactions Guichet" : "Historique & Pièces"}
            >
              <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && (
                <span>{isAgentRD ? "Mes Transactions" : "Historique & Pièces"}</span>
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
              title="Versements & Liquidations"
            >
              <Landmark className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settlements' ? 'text-white' : 'text-emerald-600'}`} />
              {!isSidebarCollapsed && (
                <span>Versements & Liquidations</span>
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
                  Opérations Guichet
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
                title="Espace Opérations Guichet"
              >
                <Wrench className={`w-4 h-4 flex-shrink-0 ${activeTab === 'guichet' ? 'text-indigo-300' : 'text-indigo-600'}`} />
                {!isSidebarCollapsed && <span className="truncate">Espace Opérations</span>}
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
                  Administration & Sécurité
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
                    title="Gestion des Utilisateurs"
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
                        <span>Gestion des Utilisateurs</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMgmtOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMgmtOpen && (
                      <div className="ml-5 pl-2.5 border-l-2 border-slate-200 space-y-1 mt-1 my-1">
                        <button 
                          onClick={() => setActiveTab('user_list')} 
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                            activeTab === 'user_list' || activeTab === 'users'
                              ? 'text-blue-900 font-bold bg-blue-50/80 border border-blue-100' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>📋 Liste des Utilisateurs</span>
                        </button>

                        <button 
                          onClick={() => setActiveTab('create_user')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                            activeTab === 'create_user' 
                              ? 'text-blue-900 font-bold bg-blue-50/80 border border-blue-100' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                          <span>➕ Créer un Utilisateur</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* 🎛️ Matrice de Modélisation (Permissions) - Uniquement Admin */}
              {canSeePermissions && (
                <button
                  onClick={() => setActiveTab('permissions_matrix')}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs transition-all ${
                    activeTab === 'permissions_matrix' 
                      ? 'bg-slate-900 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  }`}
                  title="Matrice de Modélisation"
                >
                  <SlidersHorizontal className={`w-4 h-4 flex-shrink-0 ${activeTab === 'permissions_matrix' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  {!isSidebarCollapsed && <span>Matrice de Modélisation</span>}
                </button>
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
                  title="Sécurité & Interrupteurs de Services"
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Power className={`w-4 h-4 flex-shrink-0 ${activeTab === 'kill_switch' ? 'text-rose-300' : 'text-rose-600'}`} />
                    {!isSidebarCollapsed && <span>Sécurité Services</span>}
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
                  title="Journaux d'Audit & Logs"
                >
                  <Scroll className={`w-4 h-4 flex-shrink-0 ${activeTab === 'audit_logs' ? 'text-white' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span>Journaux d'Audit & Logs</span>}
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
            title="Paramètres Généraux"
          >
            <Settings className={`w-4 h-4 flex-shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
            {!isSidebarCollapsed && <span>{isAgentHaiti ? "Mes Paramètres" : "Paramètres Généraux"}</span>}
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

          {/* Logout & Persona Switcher Dropdown (Desktop PC Mode Only) */}
          {isPersonaOpen && (
            <div className={`absolute bottom-full ${isSidebarCollapsed ? 'left-14 w-56' : 'left-0 w-full'} mb-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in`}>
              {isAdmin && (
                <>
                  <p className="text-[9px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Changer de Profil</p>
                  <div className="space-y-0.5 mb-1 pb-1 border-b border-slate-100">
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsPersonaOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-colors ${
                          currentUser.id === u.id ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <img src={u.avatar} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-xs leading-tight">{u.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Bouton Déconnexion */}
              <button
                onClick={() => {
                  setIsPersonaOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Se Déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
