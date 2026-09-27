import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ArrowRight, 
  LayoutDashboard, 
  Zap, 
  Wallet, 
  FolderArchive, 
  Wrench, 
  Users, 
  SlidersHorizontal, 
  Power, 
  Scroll, 
  Settings, 
  Moon, 
  Sun, 
  Download, 
  CornerDownLeft,
  X,
  FileText,
  Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const CommandPalette: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    setActiveTab, 
    transactions, 
    availableUsers, 
    currentUser,
    isDarkMode, 
    toggleDarkMode,
    setSelectedReceiptTx 
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rôles et autorisations
  const role = currentUser.role;
  const isAdmin = role === 'admin';
  const isAgentRD = role === 'agent_rd';
  const isAgentHaiti = role === 'agent_haiti';
  const isGestionnaire = role === 'gestionnaire';

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global keydown handler for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Pages definition filtrées par rôle
  const allPages: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; category: string }[] = [
    { id: 'overview', label: 'Tableau de bord (Dashboard & KPIs)', icon: LayoutDashboard, category: 'Pages' },
    { id: 'tasks', label: isAgentHaiti ? 'File des Décaissements (Haïti)' : 'Flux en Temps Réel (Tâches & Routage)', icon: Zap, category: 'Pages' },
    { id: 'settlements', label: 'Versements & Liquidations Hebdomadaires', icon: Landmark, category: 'Pages' },
    { id: 'treasury', label: 'Trésorerie & Soldes Multi-Opérateurs', icon: Wallet, category: 'Pages' },
    { id: 'history', label: isAgentRD ? 'Mes Transactions & Bordereaux' : isAgentHaiti ? 'Historique des Décaissements Haïti' : 'Historique & Pièces Justificatives', icon: FolderArchive, category: 'Pages' },
    { id: 'guichet', label: 'Espace Opérations Guichet (Saisie Express)', icon: Wrench, category: 'Pages' },
    { id: 'users', label: 'Gestion des Utilisateurs & Accès Nœuds', icon: Users, category: 'Pages' },
    { id: 'create_user', label: 'Créer un Nouvel Utilisateur', icon: Users, category: 'Pages' },
    { id: 'permissions_matrix', label: 'Matrice de Modélisation des Privilèges', icon: SlidersHorizontal, category: 'Pages' },
    { id: 'kill_switch', label: 'Sécurité & Interrupteurs de Services', icon: Power, category: 'Pages' },
    { id: 'audit_logs', label: 'Journaux d\'Audit & Logs Système', icon: Scroll, category: 'Pages' },
    { id: 'settings', label: 'Paramètres Généraux du Nœud', icon: Settings, category: 'Pages' },
  ];

  const pages = allPages.filter(p => {
    if (p.id === 'users' || p.id === 'create_user' || p.id === 'permissions_matrix' || p.id === 'audit_logs') {
      return isAdmin;
    }
    if (p.id === 'guichet') {
      return isAdmin || isAgentRD;
    }
    if (p.id === 'treasury') {
      return isAdmin || isGestionnaire;
    }
    if (p.id === 'kill_switch') {
      return isAdmin || isGestionnaire;
    }
    return true;
  });

  // Quick actions filtrées
  const quickActions = [
    {
      id: 'action_dark_mode',
      label: isDarkMode ? 'Passer en Mode Clair ☀️' : 'Passer en Mode Sombre 🌙',
      icon: isDarkMode ? Sun : Moon,
      category: 'Actions Rapides',
      action: () => {
        toggleDarkMode();
        setIsSearchOpen(false);
      }
    },
    ...(isAdmin || isAgentRD ? [{
      id: 'action_new_tx',
      label: 'Nouvelle Saisie Guichet Express',
      icon: Wrench,
      category: 'Actions Rapides',
      action: () => {
        setActiveTab('guichet');
        setIsSearchOpen(false);
      }
    }] : []),
    ...(isAdmin ? [{
      id: 'action_export_audit',
      label: 'Exporter les Journaux d\'Audit (CSV/JSON)',
      icon: Download,
      category: 'Actions Rapides',
      action: () => {
        alert("Exportation des journaux d'audit déclenchée...");
        setIsSearchOpen(false);
      }
    }] : [])
  ];

  // Filter items (only show matching items when typing a query)
  const cleanQuery = query.toLowerCase().trim();

  const filteredPages = cleanQuery
    ? pages.filter(p => p.label.toLowerCase().includes(cleanQuery))
    : [];

  const filteredActions = cleanQuery
    ? quickActions.filter(a => a.label.toLowerCase().includes(cleanQuery))
    : [];

  // Transactions scopées au rôle
  const scopedTransactions = transactions.filter((tx) => {
    if (isAgentHaiti) return tx.channel === 'haiti_cash' || tx.assignedToRole === 'agent_haiti' || tx.operator === 'moncash' || tx.operator === 'natcash' || tx.operator === 'natcom';
    if (isAgentRD) return tx.createdByRole === 'agent_rd' || tx.createdByName === currentUser.name || tx.assignedToRole === 'agent_rd';
    return true;
  });

  const filteredTransactions = cleanQuery
    ? scopedTransactions
        .filter(t => 
          t.referenceNumber.toLowerCase().includes(cleanQuery) ||
          t.senderName.toLowerCase().includes(cleanQuery) ||
          t.receiverName.toLowerCase().includes(cleanQuery) ||
          t.operator.toLowerCase().includes(cleanQuery) ||
          t.amountDOP.toString().includes(cleanQuery)
        )
        .slice(0, 5)
    : [];

  // Annuaire des utilisateurs disponible UNIQUEMENT pour les administrateurs
  const filteredUsers = (cleanQuery && isAdmin)
    ? availableUsers
        .filter(u => 
          u.name.toLowerCase().includes(cleanQuery) ||
          (u.username && u.username.toLowerCase().includes(cleanQuery)) ||
          u.role.toLowerCase().includes(cleanQuery) ||
          u.location.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 4)
    : [];

  // Combine results for keyboard navigation
  const allResults: Array<{
    type: 'page' | 'action' | 'transaction' | 'user';
    id: string;
    onSelect: () => void;
  }> = [
    ...filteredPages.map(p => ({
      type: 'page' as const,
      id: p.id,
      onSelect: () => {
        setActiveTab(p.id);
        setIsSearchOpen(false);
      }
    })),
    ...filteredActions.map(a => ({
      type: 'action' as const,
      id: a.id,
      onSelect: a.action
    })),
    ...filteredTransactions.map(t => ({
      type: 'transaction' as const,
      id: t.id,
      onSelect: () => {
        setSelectedReceiptTx(t);
        setActiveTab('history');
        setIsSearchOpen(false);
      }
    })),
    ...filteredUsers.map(u => ({
      type: 'user' as const,
      id: u.id,
      onSelect: () => {
        setActiveTab('users');
        setIsSearchOpen(false);
      }
    }))
  ];

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      allResults[selectedIndex].onSelect();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-3 sm:pt-20 p-2.5 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#131C2E]">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une opération, page, client (#TX-...)..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sm:hidden hover:bg-slate-300 cursor-pointer flex-shrink-0"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* 1. Transactions match */}
          {filteredTransactions.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Transactions Trouvées ({filteredTransactions.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredTransactions.map((tx) => {
                  const itemIndex = allResults.findIndex(r => r.id === tx.id);
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={tx.id}
                      onClick={() => {
                        setSelectedReceiptTx(tx);
                        setActiveTab('history');
                        setIsSearchOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-semibold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                        <div>
                          <p className="font-mono font-bold leading-tight">{tx.referenceNumber}</p>
                          <p className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {tx.senderName} ➔ {tx.receiverName} ({tx.operator.toUpperCase()})
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold">{tx.amountDOP.toLocaleString()} Pesos</span>
                        <span className={`block text-[10px] ${isSelected ? 'text-blue-100' : 'text-emerald-500 font-semibold'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Pages match */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Navigation & Pages ({filteredPages.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredPages.map((page) => {
                  const itemIndex = allResults.findIndex(r => r.id === page.id);
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        setActiveTab(page.id);
                        setIsSearchOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white font-semibold shadow-xs' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span>{page.label}</span>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 opacity-60 ${isSelected ? 'translate-x-0.5' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Actions Rapides
              </p>
              <div className="space-y-1 mt-1">
                {filteredActions.map((act) => {
                  const itemIndex = allResults.findIndex(r => r.id === act.id);
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white font-semibold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                        <span>{act.label}</span>
                      </div>
                      <CornerDownLeft className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Users match */}
          {filteredUsers.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Utilisateurs ({filteredUsers.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredUsers.map((u) => {
                  const itemIndex = allResults.findIndex(r => r.id === u.id);
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveTab('users');
                        setIsSearchOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white font-semibold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-bold leading-tight">{u.name}</p>
                          <p className={`text-[10px] capitalize ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>{u.role.replace('_', ' ')} • {u.location}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State / Search Prompt */}
          {!cleanQuery && (
            <div className="text-center py-6 sm:py-8 space-y-2">
              <Search className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tapez un nom, un numéro de téléphone, #TX-..., ou le nom d'un service...
              </p>
            </div>
          )}

          {cleanQuery && allResults.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucun résultat trouvé pour « {query} »</p>
              <p className="text-[11px] text-slate-400">Essayez avec un numéro de transaction (ex: #TX-2321), un nom ou un opérateur.</p>
            </div>
          )}

        </div>

        {/* Command Palette Footer (Desktop only) */}
        <div className="hidden sm:flex px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">↑↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">↵</kbd>
              <span>Valider</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">ESC</kbd>
              <span>Fermer</span>
            </span>
          </div>
          <span className="text-blue-600 dark:text-blue-400 font-bold">Recherche Rapide</span>
        </div>

      </div>
    </div>
  );
};
