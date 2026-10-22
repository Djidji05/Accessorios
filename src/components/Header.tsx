import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  DollarSign, 
  Globe, 
  ChevronDown, 
  Check, 
  Bell, 
  Zap, 
  CheckCircle2, 
  ShieldAlert,
  X,
  PanelLeftOpen,
  PanelLeft,
  Search,
  LogOut,
  Clock,
  ChevronRight,
  Lock,
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    dopToHtgRate, 
    setDopToHtgRate, 
    unreadTasksCount, 
    killSwitchList,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    toggleMobileSidebar,
    isDarkMode,
    toggleDarkMode,
    openSearch,
    nodeConnectionStatus,
    logout,
    transactions,
    setSelectedReceiptTx,
    selectedService,
    currentLang,
    setLanguage,
    t,
    readNotificationIds,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activeKillCount = killSwitchList.filter(k => !k.enabled).length;

  const isAgentRD = currentUser.role === 'agent_rd';
  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isDesktopNavRole = currentUser.role === 'admin' || currentUser.role === 'gestionnaire';

  // Role-scoped notifications (strictly respects user permissions)
  const notifications = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      icon: any;
      color: string;
      actionTab?: any;
      tx?: any;
    }> = [];

    // Filter transactions per role
    const scopedTxs = transactions.filter((t) => {
      if (isAgentRD) {
        return (
          t.createdByName?.toLowerCase() === currentUser.name?.toLowerCase() ||
          t.senderName?.toLowerCase() === currentUser.name?.toLowerCase() ||
          t.createdByRole === 'agent_rd'
        );
      }
      if (isAgentHaiti) {
        return t.operator === 'natcash' || t.operator === 'natcom' || t.channel === 'haiti_cash';
      }
      return true;
    });

    // Recent transaction status notifications
    scopedTxs.slice(0, 3).forEach((tx) => {
      let icon = Clock;
      let color = 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800';
      let title = `Transfert ${tx.status === 'completed' ? 'Validé' : tx.status === 'cancelled' ? 'Annulé' : 'En cours'}`;

      if (tx.status === 'completed') {
        icon = CheckCircle2;
        color = 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800';
      } else if (tx.status === 'cancelled') {
        icon = ShieldAlert;
        color = 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800';
      }

      list.push({
        id: `tx_${tx.id}`,
        title,
        message: `${tx.operator.toUpperCase()} • ${tx.amountHTG.toLocaleString()} HTG pour ${tx.receiverName}`,
        time: 'Récent',
        icon,
        color,
        tx
      });
    });

    // General operational notifications
    if (activeKillCount > 0) {
      list.push({
        id: 'ks_alert',
        title: 'Sécurité des Services',
        message: `${activeKillCount} service(s) temporairement suspendu(s)`,
        time: 'Actif',
        icon: Lock,
        color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
        actionTab: 'kill_switch'
      });
    }

    list.push({
      id: 'rate_info',
      title: t('rate_label'),
      message: `100 Pesos = ${Math.round(dopToHtgRate * 100)} HTG`,
      time: 'Aujourd\'hui',
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800'
    });

    return list;
  }, [transactions, currentUser, dopToHtgRate, activeKillCount, isAgentRD, isAgentHaiti, t]);

  const unreadNotifications = notifications.filter(n => !readNotificationIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const languages: Array<{ code: 'FR' | 'HT' | 'ES'; label: string }> = [
    { code: 'FR', label: 'Français 🇫🇷' },
    { code: 'HT', label: 'Kreyòl 🇭🇹' },
    { code: 'ES', label: 'Español 🇩🇴' },
  ];

  return (
    <header className={`${isDesktopNavRole ? (selectedService ? 'hidden md:flex' : 'flex') : 'hidden md:flex'} h-14 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 px-2 sm:px-6 items-center justify-between sticky top-0 z-30 transition-colors w-full min-w-0`}>
      {/* Left Section: Mobile Brand Header & Desktop Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 min-w-0 flex-shrink">
        {/* Mobile Menu Toggle Button */}
        {isDesktopNavRole && (
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            title="Menu Principal"
          >
            <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
          </button>
        )}

        {/* Desktop Sidebar Toggle & Breadcrumbs (md:flex) */}
        {isSidebarCollapsed && (
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center shadow-xs ring-1 ring-slate-200/80 dark:ring-slate-700"
              title="Rouvrir la barre latérale"
              aria-label="Rouvrir la barre latérale"
            >
              <PanelLeftOpen className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        <span className="text-slate-500 dark:text-slate-400 font-medium hidden md:inline">Overview</span>
        <span className="text-slate-300 dark:text-slate-600 hidden md:inline">/</span>
        <span className="font-bold text-slate-900 dark:text-slate-100 capitalize truncate hidden md:inline">
          {activeTab === 'overview' ? t('nav_dashboard') : activeTab === 'guichet' ? t('nav_guichet') : activeTab.replace('_', ' ')}
        </span>
      </div>

      {/* Center Search Bar Trigger in Navbar */}
      <div className="flex-1 max-w-sm mx-3 sm:mx-6 hidden md:block">
        <button
          onClick={openSearch}
          className="w-full flex items-center justify-between bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700/70 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 transition-all group shadow-2xs cursor-pointer"
          title="Rechercher (⌘K ou Ctrl+K)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex-shrink-0 transition-colors" />
            <span className="text-slate-400 dark:text-slate-400 font-medium truncate">{t('search_placeholder')}</span>
          </div>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-2xs flex-shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Tools: Mobile Search, Taux, Notification Bell, Language Globe Icon, Dark mode, Settings */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        
        {/* Mobile Search Icon Button */}
        <button 
          onClick={openSearch}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
          title="Rechercher (⌘K / Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Real-time Exchange Rate Widget (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-xl text-xs font-medium flex-shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 hidden lg:inline">Taux:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            100 Pesos = {Math.round(dopToHtgRate * 100)} HTG
          </span>
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => {
                const newRate = prompt('Nouveau taux 1 Peso -> HTG:', dopToHtgRate.toString());
                if (newRate && !isNaN(parseFloat(newRate))) {
                  setDopToHtgRate(parseFloat(newRate));
                }
              }}
              className="ml-1 text-[10px] text-slate-400 hover:text-slate-900 dark:hover:text-white underline font-semibold"
            >
              Edit
            </button>
          )}
        </div>

        {/* NOTIFICATION BELL ICON BUTTON */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            
            {/* Small Red Number Badge (Disparaît si 0 notifications non lues) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-75">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <>
              {/* Mobile overlay */}
              <div className="fixed inset-0 z-40 bg-black/10 dark:bg-black/40 sm:hidden" onClick={() => setIsNotificationsOpen(false)} />
              <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-black rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead(notifications.map(n => n.id))}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Tout marquer lu
                    </button>
                  )}
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">Aucune notification</p>
                ) : (
                  notifications.map((notif) => {
                    const IconComp = notif.icon;
                    const isUnread = !readNotificationIds.includes(notif.id);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.tx) {
                            const freshTx = transactions.find((t) => t.id === notif.tx?.id) || notif.tx;
                            setSelectedReceiptTx(freshTx);
                          }
                          if (notif.actionTab) setActiveTab(notif.actionTab);
                          setIsNotificationsOpen(false);
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors cursor-pointer border ${
                          isUnread
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-50/80'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 dark:text-slate-100">{notif.title}</p>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">{notif.time}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug mt-0.5">{notif.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setIsNotificationsOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Voir toutes les notifications</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            </>
          )}
        </div>

        {/* Language Globe Icon Selector Button */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
            title="Changer de langue"
          >
            <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{currentLang}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Language Dropdown Menu */}
          {isLangOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in">
              <div className="space-y-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                      currentLang === lang.code ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear Button (Hidden on mobile) */}
        <button 
          onClick={() => setActiveTab('settings')}
          className="hidden md:block p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Paramètres"
        >
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
