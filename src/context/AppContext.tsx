import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Transaction, 
  AccountBalance, 
  KillSwitchItem, 
  UserPermissionMatrix, 
  AuditLog, 
  ActiveTab, 
  OperatorCode,
  Role,
  ServiceType,
  ChannelType,
  WeeklySettlement,
  ServiceCommissionConfig,
  OperatorCommissionConfig
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BALANCES, 
  INITIAL_KILL_SWITCH, 
  INITIAL_PERMISSIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTLEMENTS,
  INITIAL_SERVICE_COMMISSIONS,
  INITIAL_OPERATOR_COMMISSIONS
} from '../core/initialData';
import { eventBus } from '../core/eventBus';
import { api } from '../services/api';
import { Language, Translations, translations, translateText } from '../i18n/translations';
import { soundPlayer } from '../utils/audioNotification';

export const DEFAULT_SERVICE_COMMISSION_RATES: Record<string, number> = {
  moncash: 1.0,
  natcash: 1.0,
  zelle: 1.5,
  digicel: 2.0,
  natcom: 2.0,
  claro: 2.5,
  altice: 2.5,
};

interface AppContextType {
  // Active User / Node Persona
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  
  // Auth State & Actions
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Financial Rates & System Commissions
  dopToHtgRate: number;
  usdToHtgRate: number;
  setDopToHtgRate: (rate: number) => void;
  setUsdToHtgRate: (rate: number) => void;
  adminCommissionRate: number;
  setAdminCommissionRate: (rate: number) => void;
  serviceCommissionRates: Record<string, number>;
  updateServiceCommissionRate: (serviceKey: string, rate: number) => void;
  
  // Core Business State
  transactions: Transaction[];
  accountBalances: AccountBalance[];
  killSwitchList: KillSwitchItem[];
  permissions: UserPermissionMatrix[];
  auditLogs: AuditLog[];
  settlements: WeeklySettlement[];
  serviceCommissions: ServiceCommissionConfig[];
  operatorCommissions: OperatorCommissionConfig[];

  // Service & Operator Commissions Management
  updateServiceCommission: (serviceType: ServiceType, adminCommissionRate: number, defaultFeeRate: number) => void;
  updateOperatorCommission: (operator: OperatorCode, adminCommissionRate: number, defaultFeeRate: number, flatCommissionDOP?: number) => void;
  
  // Business Actions
  createTransaction: (data: {
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    operator: OperatorCode;
    serviceType: ServiceType;
    amountDOP: number;
    feeDOP: number;
    commissionDOP: number;
    amountUSD?: number;
    proofUrl?: string;
    zelleProofUrl?: string;
    payoutCurrency?: 'DOP' | 'HTG' | 'USD';
  }) => { success: boolean; message: string; transaction?: Transaction };
  
  validateZelleTransaction: (transactionId: string, approved: boolean, note?: string) => { success: boolean; message: string };
  completeTask: (transactionId: string, proofNotes: string, proofUrl?: string) => { success: boolean; message: string };
  cancelTransaction: (transactionId: string, reason: string) => { success: boolean; message: string };
  updateTransaction: (transactionId: string, updatedFields: Partial<Transaction>) => { success: boolean; message: string };
  reassignTask: (transactionId: string, targetUser: User) => { success: boolean; message: string };
  toggleKillSwitch: (operator: OperatorCode, reason?: string) => void;
  updateUserPermissions: (userId: string, newPermissions: Partial<UserPermissionMatrix>) => void;
  rechargeAccount: (accountId: string, amount: number, note?: string) => Promise<{ success: boolean; message: string }>;
  recordAgentDeposit: (settlementId: string, amount: number, note: string, settlementData?: Partial<WeeklySettlement>) => { success: boolean; message: string };
  
  // Receipt Modal State
  selectedReceiptTx: Transaction | null;
  setSelectedReceiptTx: (tx: Transaction | null) => void;
  
  // Distributed System Node Stats
  nodeConnectionStatus: 'connected' | 'syncing' | 'offline';
  unreadTasksCount: number;
  addUser: (userData: Omit<User, 'id'> & { password?: string }) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, data: Partial<User> & { password?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  toggleUserStatus: (userId: string) => void;

  // Global Toast Feedback Notification
  toastNotification: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Sidebar visibility state
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleMobileSidebar: () => void;

  // Dark Mode Theme State
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean | ((prev: boolean) => boolean)) => void;
  toggleDarkMode: () => void;

  // Global Command Palette / Search Modal State (Cmd+K / Ctrl+K)
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  openSearch: () => void;

  // Selected Mobile Service state
  selectedService: OperatorCode | null;
  setSelectedService: (service: OperatorCode | null) => void;

  // Transaction Detail View State (To hide bottom navbar when viewing details)
  isTransactionDetailOpen: boolean;
  setIsTransactionDetailOpen: (open: boolean) => void;

  // Notifications Tracking State
  readNotificationIds: string[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (ids?: string[]) => void;

  // i18n Internationalization State
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;

  // PWA Installation State
  isPWAInstalled: boolean;
  canInstallPWA: boolean;
  showPWAInstallPrompt: boolean;
  setShowPWAInstallPrompt: (show: boolean) => void;
  installPWA: () => Promise<'accepted' | 'dismissed' | 'unsupported_ios' | 'unavailable' | 'already_installed'>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dalexis_available_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Erreur lecture dalexis_available_users:', err);
      }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    if (availableUsers && availableUsers.length > 0) {
      localStorage.setItem('dalexis_available_users', JSON.stringify(availableUsers));
    }
  }, [availableUsers]);
  
  // Persistance du profil utilisateur connecté (évite de réinitialiser l'admin au rafraîchissement F5)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dalexis_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Erreur lecture dalexis_user:', err);
      }
    }
    return INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('dalexis_token');
    const user = localStorage.getItem('dalexis_user');
    const lastActivity = localStorage.getItem('dalexis_last_activity');
    if (!token || !user) return false;

    // Déconnexion automatique après 60 minutes d'inactivité (ex: ordinateur fermé pendant 2 jours)
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      const MAX_INACTIVITY_MS = 60 * 60 * 1000; // 60 minutes
      if (isNaN(elapsed) || elapsed > MAX_INACTIVITY_MS) {
        localStorage.removeItem('dalexis_token');
        localStorage.removeItem('dalexis_user');
        localStorage.removeItem('dalexis_last_activity');
        return false;
      }
    } else {
      localStorage.setItem('dalexis_last_activity', Date.now().toString());
    }
    return true;
  });

  // Synchronisation continue du profil connecté dans localStorage
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('dalexis_user', JSON.stringify(currentUser));
    }
  }, [currentUser, isAuthenticated]);

  // Initialisation immédiate de l'onglet selon le rôle mémorisé (évite le flash de la vue PC sur mobile)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('dalexis_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'agent_rd' || u.role === 'gestionnaire') return 'guichet';
        if (u.role === 'agent_haiti') return 'tasks';
      }
    } catch {}
    return 'overview';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  // Global Toast Notification State & Handlers
  const [toastNotification, setToastNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastNotification({ text, type });
    if (type === 'success') {
      soundPlayer.playSuccessChime();
    } else {
      soundPlayer.playAlertSound();
    }
  };

  const hideToast = () => {
    setToastNotification(null);
  };

  // Transaction Detail View State (To hide bottom navbar when viewing details)
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState<boolean>(false);

  // Global Search Palette (⌘K)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const openSearch = () => setIsSearchOpen(true);

  // Selected Mobile Service state
  const [selectedService, setSelectedService] = useState<OperatorCode | null>(null);

  // Mode Clair forcé
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setIsDarkMode(false);
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  };

  // PWA Installation Management
  const [deferredPWAPrompt, setDeferredPWAPrompt] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return (window as any).__deferredPWAPrompt || null;
    }
    return null;
  });
  const [isPWAInstalled, setIsPWAInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
    }
    return false;
  });
  const [showPWAInstallPrompt, setShowPWAInstallPrompt] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean((window as any).__deferredPWAPrompt);
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPWAPrompt(e);
      (window as any).__deferredPWAPrompt = e;
      setShowPWAInstallPrompt(true);
    };

    const handlePromptAvailable = (e: any) => {
      if (e.detail) {
        setDeferredPWAPrompt(e.detail);
        setShowPWAInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setShowPWAInstallPrompt(false);
      setDeferredPWAPrompt(null);
      (window as any).__deferredPWAPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsPWAInstalled(true);
        setShowPWAInstallPrompt(false);
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const installPWA = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported_ios' | 'unavailable' | 'already_installed'> => {
    if (isPWAInstalled) {
      return 'already_installed';
    }
    const promptEvent = deferredPWAPrompt || (typeof window !== 'undefined' ? (window as any).__deferredPWAPrompt : null);
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsPWAInstalled(true);
          setShowPWAInstallPrompt(false);
          setDeferredPWAPrompt(null);
          if (typeof window !== 'undefined') {
            (window as any).__deferredPWAPrompt = null;
          }
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    }
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      return 'unsupported_ios';
    }
    return 'unavailable';
  }, [deferredPWAPrompt, isPWAInstalled]);

  // i18n Language State & Helper
  const [currentLang, setCurrentLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('dalexis_lang');
    if (saved === 'HT' || saved === 'ES' || saved === 'FR') {
      return saved;
    }
    return 'FR';
  });

  const setLanguage = (lang: Language) => {
    setCurrentLangState(lang);
    localStorage.setItem('dalexis_lang', lang);
  };

  const t = useCallback((key: string, fallback?: string): string => {
    return translateText(key, currentLang, fallback);
  }, [currentLang]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);
  
  const [dopToHtgRate, setDopToHtgRateState] = useState<number>(() => {
    const saved = localStorage.getItem('dalexis_dop_to_htg_rate');
    return saved ? parseFloat(saved) : 2.35;
  });
  const [usdToHtgRate, setUsdToHtgRateState] = useState<number>(() => {
    const saved = localStorage.getItem('dalexis_usd_to_htg_rate');
    return saved ? parseFloat(saved) : 140.5;
  });
  
  const [adminCommissionRate, setAdminCommissionRateState] = useState<number>(() => {
    const saved = localStorage.getItem('admin_commission_rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  const setAdminCommissionRate = (rate: number) => {
    setAdminCommissionRateState(rate);
    localStorage.setItem('admin_commission_rate', rate.toString());
  };

  const [serviceCommissionRates, setServiceCommissionRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('service_commission_rates');
    if (saved) {
      try {
        return { ...DEFAULT_SERVICE_COMMISSION_RATES, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse service_commission_rates', e);
      }
    }
    return DEFAULT_SERVICE_COMMISSION_RATES;
  });

  const updateServiceCommissionRate = (serviceKey: string, rate: number) => {
    setServiceCommissionRates((prev) => {
      const updated = { ...prev, [serviceKey]: rate };
      localStorage.setItem('service_commission_rates', JSON.stringify(updated));
      return updated;
    });
  };
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dalexis_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Erreur lecture dalexis_transactions:', err);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      localStorage.setItem('dalexis_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>(() => {
    const saved = localStorage.getItem('dalexis_balances');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Si bal_digicel existe dans le cache local, fusionner son solde dans bal_moncash et filtrer
          const digicelAcc = parsed.find((b: any) => b.operator === 'digicel');
          if (digicelAcc) {
            return parsed
              .filter((b: any) => b.operator !== 'digicel')
              .map((b: any) => b.operator === 'moncash'
                ? { ...b, name: 'Solde MonCash & Digicel (Digicel HT)', balance: b.balance + (digicelAcc.balance || 0) }
                : b
              );
          }
          return parsed;
        }
      } catch (err) {
        console.error('Erreur lecture dalexis_balances:', err);
      }
    }
    return INITIAL_BALANCES;
  });

  useEffect(() => {
    if (accountBalances && accountBalances.length > 0) {
      localStorage.setItem('dalexis_balances', JSON.stringify(accountBalances));
    }
  }, [accountBalances]);

  const [killSwitchList, setKillSwitchList] = useState<KillSwitchItem[]>(INITIAL_KILL_SWITCH);
  const [permissions, setPermissions] = useState<UserPermissionMatrix[]>(() => {
    const saved = localStorage.getItem('dalexis_permissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migration automatique: s'assurer que les agents RD, gestionnaires et admins ont Zelle autorisé par défaut s'il manquait
          return parsed.map((p: UserPermissionMatrix) => {
            const shouldHaveZelle = p.role === 'admin' || p.role === 'agent_rd' || p.role === 'gestionnaire';
            if (shouldHaveZelle && Array.isArray(p.servicesAllowed) && !p.servicesAllowed.includes('zelle')) {
              return { ...p, servicesAllowed: [...p.servicesAllowed, 'zelle'] };
            }
            return p;
          });
        }
      } catch (err) {
        console.error('Erreur lecture dalexis_permissions:', err);
      }
    }
    return INITIAL_PERMISSIONS;
  });

  useEffect(() => {
    if (permissions && permissions.length > 0) {
      localStorage.setItem('dalexis_permissions', JSON.stringify(permissions));
    }
  }, [permissions]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settlements, setSettlements] = useState<WeeklySettlement[]>(() => {
    const saved = localStorage.getItem('dalexis_settlements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erreur lecture dalexis_settlements:', e);
      }
    }
    return INITIAL_SETTLEMENTS;
  });

  useEffect(() => {
    if (settlements && settlements.length > 0) {
      try {
        localStorage.setItem('dalexis_settlements', JSON.stringify(settlements));
      } catch (err) {
        console.error('Erreur écriture dalexis_settlements:', err);
      }
    }
  }, [settlements]);

  // Notifications Tracking (Persist read notifications in localStorage)
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dalexis_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markNotificationAsRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('dalexis_read_notifs', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback((ids?: string[]) => {
    setReadNotificationIds((prev) => {
      const next = ids ? Array.from(new Set([...prev, ...ids])) : prev;
      try {
        localStorage.setItem('dalexis_read_notifs', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (settlements) {
      localStorage.setItem('dalexis_settlements', JSON.stringify(settlements));
    }
  }, [settlements]);
  
  const [serviceCommissions, setServiceCommissions] = useState<ServiceCommissionConfig[]>(() => {
    const saved = localStorage.getItem('service_commissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse service_commissions from localStorage', e);
      }
    }
    return INITIAL_SERVICE_COMMISSIONS;
  });

  const updateServiceCommission = (serviceType: ServiceType, adminCommissionRate: number, defaultFeeRate: number) => {
    setServiceCommissions((prev) => {
      const updated = prev.map((item) =>
        item.serviceType === serviceType
          ? { ...item, adminCommissionRate, defaultFeeRate }
          : item
      );
      localStorage.setItem('service_commissions', JSON.stringify(updated));
      return updated;
    });

    const logDetails = `[COMMISSIONS SYSTEME] Admin (${currentUser.name}) a mis à jour les commissions pour le service ${serviceType.toUpperCase()} (Taux Admin: ${adminCommissionRate}%, Frais: ${defaultFeeRate}%).`;
    eventBus.publish('TRANSACTION_CREATED', currentUser.nodeId, currentUser.role, logDetails);
    showToast(`Commissions du service ${serviceType.toUpperCase()} mises à jour avec succès.`, 'success');
  };

  const [operatorCommissions, setOperatorCommissions] = useState<OperatorCommissionConfig[]>(() => {
    const saved = localStorage.getItem('operator_commissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse operator_commissions from localStorage', e);
      }
    }
    return INITIAL_OPERATOR_COMMISSIONS;
  });

  const updateOperatorCommission = (operator: OperatorCode, adminCommissionRate: number, defaultFeeRate: number, flatCommissionDOP: number = 0) => {
    setOperatorCommissions((prev) => {
      const updated = prev.map((item) =>
        item.operator === operator
          ? { ...item, adminCommissionRate, defaultFeeRate, flatCommissionDOP }
          : item
      );
      localStorage.setItem('operator_commissions', JSON.stringify(updated));
      return updated;
    });

    const logDetails = `[COMMISSIONS OPERATEUR] Admin (${currentUser.name}) a configuré la commission pour l'opérateur ${operator.toUpperCase()} (Taux Admin: ${adminCommissionRate}%, Frais: ${defaultFeeRate}%).`;
    eventBus.publish('TRANSACTION_CREATED', currentUser.nodeId, currentUser.role, logDetails);
    showToast(`Commissions de l'opérateur ${operator.toUpperCase()} mises à jour avec succès.`, 'success');
  };
  
  const recordAgentDeposit = (
    settlementId: string, 
    amount: number, 
    note: string, 
    settlementData?: Partial<WeeklySettlement>
  ) => {
    setSettlements((prev) => {
      let found = false;
      const updated = prev.map((s) => {
        const matchesId = s.id === settlementId;
        const matchesWeekAndAgent = settlementData && 
          s.weekLabel === settlementData.weekLabel && 
          s.agentName.toLowerCase() === settlementData.agentName?.toLowerCase();

        if (matchesId || matchesWeekAndAgent) {
          found = true;
          const newDeposited = s.amountDeposited + amount;
          const newRemaining = Math.max(0, s.netAmountToPay - newDeposited);
          const newStatus: 'paid' | 'partial' | 'pending' =
            newRemaining === 0 ? 'paid' : newDeposited > 0 ? 'partial' : 'pending';
          const newDepositRecord = {
            id: `dep_${Date.now()}`,
            amount,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: note || 'Versement enregistré',
            recordedBy: currentUser.name,
          };

          return {
            ...s,
            amountDeposited: newDeposited,
            remainingBalance: newRemaining,
            status: newStatus,
            deposits: [newDepositRecord, ...s.deposits],
          };
        }
        return s;
      });

      if (!found) {
        // La liquidation n'existait que dynamiquement d'après les transactions en direct
        const baseNet = settlementData?.netAmountToPay ?? (settlementData?.totalCollected ? Math.max(0, settlementData.totalCollected - (settlementData.totalCommission || 0)) : amount);
        const newDeposited = (settlementData?.amountDeposited || 0) + amount;
        const newRemaining = Math.max(0, baseNet - newDeposited);
        const newStatus: 'paid' | 'partial' | 'pending' =
          newRemaining === 0 ? 'paid' : newDeposited > 0 ? 'partial' : 'pending';
        const newDepositRecord = {
          id: `dep_${Date.now()}`,
          amount,
          date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: note || 'Versement enregistré',
          recordedBy: currentUser.name,
        };

        const newSettlement: WeeklySettlement = {
          id: settlementId,
          agentId: settlementData?.agentId || currentUser.id,
          agentName: settlementData?.agentName || currentUser.name,
          agentRole: settlementData?.agentRole || 'agent_rd',
          weekLabel: settlementData?.weekLabel || 'Semaine En Cours',
          startDate: settlementData?.startDate || new Date().toISOString().split('T')[0],
          endDate: settlementData?.endDate || new Date().toISOString().split('T')[0],
          currency: settlementData?.currency || 'DOP',
          totalCollected: settlementData?.totalCollected || baseNet,
          totalCommission: settlementData?.totalCommission || 0,
          netAmountToPay: baseNet,
          amountDeposited: newDeposited,
          remainingBalance: newRemaining,
          status: newStatus,
          deposits: [newDepositRecord, ...(settlementData?.deposits || [])],
        };

        updated.unshift(newSettlement);
      }

      try {
        localStorage.setItem('dalexis_settlements', JSON.stringify(updated));
      } catch (err) {
        console.error('Erreur écriture dalexis_settlements:', err);
      }

      return updated;
    });

    const logDetails = `[VERSEMENT HEBDO] Admin (${currentUser.name}) a enregistré un versement de ${amount.toLocaleString()} pour l'agent (Réf ${settlementId}).`;
    eventBus.publish('TREASURY_RECHARGED', currentUser.nodeId, currentUser.role, logDetails);
    showToast(`Dépôt de ${amount.toLocaleString()} enregistré pour l'agent avec succès.`, 'success');

    return { success: true, message: 'Dépôt hebdomadaire enregistré avec succès et solde restant recalculé !' };
  };
  
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [nodeConnectionStatus, setNodeConnectionStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');

  // Réinitialisation automatique en cas de token expiré (401)
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('dalexis_token');
    };
    window.addEventListener('dalexis_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('dalexis_auth_unauthorized', handleUnauthorized);
  }, []);

  // Déconnexion / Verrouillage automatique après 60 minutes d'inactivité (persistant même avec PC fermé ou en veille)
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('dalexis_last_activity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (isNaN(elapsed) || elapsed > INACTIVITY_TIMEOUT_MS) {
          localStorage.removeItem('dalexis_token');
          localStorage.removeItem('dalexis_user');
          localStorage.removeItem('dalexis_last_activity');
          setIsAuthenticated(false);
          showToast("Session expirée après inactivité. Veuillez vous reconnecter.", 'info');
        }
      }
    };

    // Mettre à jour l'horodatage d'activité utilisateur (throttlé à 15 secondes pour économiser les I/O)
    let lastRecorded = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 15000) {
        lastRecorded = now;
        localStorage.setItem('dalexis_last_activity', now.toString());
      }
    };

    // Événements détectant l'activité de l'utilisateur
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Vérifier à la reprise (focus fenêtre, sortie de veille du PC, réouverture d'onglet)
    const handleResume = () => {
      checkInactivity();
      handleUserActivity();
    };

    window.addEventListener('focus', handleResume);
    window.addEventListener('pageshow', handleResume);
    document.addEventListener('visibilitychange', handleResume);

    // Vérification d'arrière-plan toutes les 30 secondes
    const checkInterval = setInterval(checkInactivity, 30000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pageshow', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
      clearInterval(checkInterval);
    };
  }, [isAuthenticated]);

  // Synchronisation avec l'API Backend Express / MySQL
  useEffect(() => {
    let isMounted = true;
    let isSyncing = false;
    let lastFullSyncTime = 0;

    // isSilent = true pour l'actualisation continue sans effet visuel clignotant ni badge "syncing"
    const syncWithBackend = async (isSilent = false) => {
      if (isSyncing) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      isSyncing = true;
      try {
        if (!isSilent) {
          setNodeConnectionStatus('syncing');
        }

        const now = Date.now();
        // Les tables peu variables (utilisateurs, kill-switch, soldes, audit) sont rafraîchies toutes les 60s
        // Seules les transactions sont actualisées toutes les 10s (gain de 80% de requêtes HTTP)
        const isFullSync = !isSilent || (now - lastFullSyncTime > 60000);
        if (isFullSync) {
          lastFullSyncTime = now;
        }

        // 1. Données publiques (taux de change - toutes les 60s ou initial)
        if (isFullSync) {
          api.rates.get().then((rateData) => {
            if (isMounted) {
              if (rateData?.rate) {
                const r = rateData.rate > 10 ? rateData.rate / 100 : rateData.rate;
                setDopToHtgRateState((prev) => (prev === r ? prev : r));
              }
              if (rateData?.usdRate) {
                const u = parseFloat(String(rateData.usdRate));
                if (!isNaN(u) && u > 0) {
                  setUsdToHtgRateState((prev) => (prev === u ? prev : u));
                }
              }
            }
          }).catch(() => null);
        }

        // 2. Vérification d'authentification avant d'appeler les routes privées
        const token = localStorage.getItem('dalexis_token');
        if (!token || !isAuthenticated) {
          if (isMounted && !isSilent) setNodeConnectionStatus('connected');
          return;
        }

        // 3. Données privées authentifiées optimisées
        const [txs, bals, ks, usersData, logsData] = await Promise.all([
          api.transactions.getAll().catch(() => null),
          isFullSync ? api.treasury.getBalances().catch(() => null) : Promise.resolve(null),
          isFullSync ? api.killSwitch.getAll().catch(() => null) : Promise.resolve(null),
          isFullSync ? api.users.getAll().catch(() => null) : Promise.resolve(null),
          isFullSync ? api.audit.getLogs().catch(() => null) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        // Mise à jour silencieuse des transactions sans perturber l'interface
        if (Array.isArray(txs)) {
          setTransactions((prev) => {
            if (prev.length === txs.length) {
              let hasChanged = false;
              for (let i = 0; i < txs.length; i++) {
                const a = txs[i];
                const b = prev[i];
                if (
                  !b ||
                  a.id !== b.id ||
                  a.status !== b.status ||
                  a.completedAt !== b.completedAt ||
                  a.cancelledAt !== b.cancelledAt ||
                  a.cancellationReason !== b.cancellationReason ||
                  a.proofUrl !== b.proofUrl ||
                  a.assignedToName !== b.assignedToName
                ) {
                  hasChanged = true;
                  break;
                }
              }
              if (!hasChanged) return prev; // Ne déclenche aucun re-render React si identique
            }
            return txs as Transaction[];
          });
        }

        // Soldes de trésorerie avec stabilité de référence
        if (Array.isArray(bals) && bals.length > 0) {
          setAccountBalances((prev) => {
            if (prev.length === bals.length) {
              const changed = bals.some((b: any, idx: number) => {
                const p = prev[idx];
                return !p || p.id !== b.id || p.balance !== b.balance;
              });
              if (!changed) return prev;
            }
            return bals as AccountBalance[];
          });
        }

        // Kill Switch avec stabilité de référence
        if (Array.isArray(ks) && ks.length > 0) {
          setKillSwitchList((prev) => {
            if (prev.length === ks.length) {
              const changed = ks.some((k: any, idx: number) => {
                const p = prev[idx];
                return !p || p.operator !== k.operator || p.enabled !== k.enabled;
              });
              if (!changed) return prev;
            }
            return ks as KillSwitchItem[];
          });
        }

        // Utilisateurs et permissions
        if (usersData?.users && usersData.users.length > 0) {
          setAvailableUsers((prev) => {
            if (prev.length === usersData.users.length) {
              const changed = usersData.users.some((u: any, idx: number) => {
                const p = prev[idx];
                return !p || p.id !== u.id || p.status !== u.status || p.role !== u.role;
              });
              if (!changed) return prev;
            }
            return usersData.users;
          });
          if (usersData.permissions) {
            setPermissions(usersData.permissions);
          }
        }

        // Journaux d'audit
        if (Array.isArray(logsData) && logsData.length > 0) {
          setAuditLogs((prev) => {
            if (prev.length === logsData.length && prev[0]?.id === logsData[0]?.id) {
              return prev;
            }
            return logsData.map((l: any) => ({
              ...l,
              timestamp: typeof l.timestamp === 'string' ? l.timestamp : new Date(l.timestamp).toISOString(),
            }));
          });
        }

        setNodeConnectionStatus('connected');
      } catch (err) {
        console.warn('Backend API non joignable, maintien du mode local/mémoire:', err);
        if (isMounted && !isSilent) setNodeConnectionStatus('offline');
      } finally {
        isSyncing = false;
      }
    };

    // Synchronisation initiale
    syncWithBackend(false);

    // Synchronisation périodique de sécurité en arrière-plan (filet de sécurité à 30s)
    const intervalId = setInterval(() => {
      if (isAuthenticated && typeof document !== 'undefined' && !document.hidden) {
        syncWithBackend(true);
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden && isAuthenticated) {
        syncWithBackend(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // =========================================================================
  // Flux Temps Réel SSE (Server-Sent Events) - 0 délai pour les transferts
  // =========================================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('dalexis_token');
    if (!token) return;

    const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
    const sseUrl = `${API_BASE_URL}/realtime/events?token=${encodeURIComponent(token)}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
          console.log('⚡ [SSE CLIENT] Connexion temps réel établie avec le serveur.');
          setNodeConnectionStatus('connected');
        };

        // 1. Réception instantanée d'un nouveau transfert créé (0 délai)
        eventSource.addEventListener('TRANSACTION_CREATED', (e: MessageEvent) => {
          try {
            const rawTx = JSON.parse(e.data) as Transaction;
            console.log('⚡ [SSE] Nouveau transfert reçu en direct (0s) :', rawTx.referenceNumber);
            const token = localStorage.getItem('dalexis_token');
            const finalProof = rawTx.proofUrl && rawTx.proofUrl.startsWith('/api/') && token && !rawTx.proofUrl.includes('token=')
              ? `${rawTx.proofUrl}?token=${encodeURIComponent(token)}`
              : rawTx.proofUrl;
            const newTx: Transaction = {
              ...rawTx,
              proofUrl: finalProof,
              zelleProofUrl: rawTx.operator === 'zelle' ? (finalProof || rawTx.zelleProofUrl) : rawTx.zelleProofUrl,
              zelleStatus: rawTx.operator === 'zelle'
                ? (rawTx.status === 'completed' ? 'approved' : rawTx.status === 'cancelled' ? 'rejected' : 'pending_admin_check')
                : rawTx.zelleStatus,
            };

            setTransactions((prev) => {
              if (prev.some(t => t.id === newTx.id || t.referenceNumber === newTx.referenceNumber)) {
                return prev.map(t => (t.id === newTx.id || t.referenceNumber === newTx.referenceNumber ? { ...t, ...newTx } : t));
              }
              return [newTx, ...prev];
            });

            // Notification sonore et toast adaptées au rôle de l'agent
            const userRole = currentUser?.role;
            if (userRole === 'agent_haiti' && newTx.channel === 'haiti_cash') {
              showToast(`🚨 Nouveau transfert Haïti reçu : ${newTx.amountHTG.toLocaleString()} HTG (#${newTx.referenceNumber})`, 'success');
            } else if (userRole === 'gestionnaire' && newTx.channel === 'digital_telecom') {
              showToast(`⚡ Nouvelle recharge reçue : ${newTx.operator.toUpperCase()} (#${newTx.referenceNumber})`, 'info');
            } else if (userRole === 'admin') {
              showToast(`⚡ Nouveau transfert émis : ${newTx.referenceNumber} (${newTx.operator.toUpperCase()})`, 'info');
            }
          } catch (err) {
            console.error('Erreur parsing TRANSACTION_CREATED SSE:', err);
          }
        });

        // 2. Clôture de tâche / Preuve validée
        eventSource.addEventListener('TRANSACTION_COMPLETED', (e: MessageEvent) => {
          try {
            const rawTx = JSON.parse(e.data) as Transaction;
            const token = localStorage.getItem('dalexis_token');
            const finalProof = rawTx.proofUrl && rawTx.proofUrl.startsWith('/api/') && token && !rawTx.proofUrl.includes('token=')
              ? `${rawTx.proofUrl}?token=${encodeURIComponent(token)}`
              : rawTx.proofUrl;
            const completedTx: Transaction = {
              ...rawTx,
              proofUrl: finalProof,
              zelleProofUrl: rawTx.operator === 'zelle' ? (finalProof || rawTx.zelleProofUrl) : rawTx.zelleProofUrl,
              zelleStatus: rawTx.operator === 'zelle' ? 'approved' : rawTx.zelleStatus,
            };
            setTransactions((prev) =>
              prev.map(t => (t.id === completedTx.id || t.referenceNumber === completedTx.referenceNumber ? { ...t, ...completedTx } : t))
            );
            showToast(`✅ Transfert #${completedTx.referenceNumber} clôturé avec succès par ${completedTx.assignedToName || 'l\'agent'}.`, 'success');
          } catch (err) {
            console.error('Erreur parsing TRANSACTION_COMPLETED SSE:', err);
          }
        });

        // 3. Annulation de transaction
        eventSource.addEventListener('TRANSACTION_CANCELLED', (e: MessageEvent) => {
          try {
            const cancelledTx = JSON.parse(e.data) as Transaction;
            setTransactions((prev) =>
              prev.map(t => (t.id === cancelledTx.id || t.referenceNumber === cancelledTx.referenceNumber ? { ...t, ...cancelledTx } : t))
            );
            showToast(`⚠️ Transfert #${cancelledTx.referenceNumber} annulé.`, 'info');
          } catch (err) {
            console.error('Erreur parsing TRANSACTION_CANCELLED SSE:', err);
          }
        });

        // 4. Mise à jour de transaction
        eventSource.addEventListener('TRANSACTION_UPDATED', (e: MessageEvent) => {
          try {
            const updatedTx = JSON.parse(e.data) as Transaction;
            setTransactions((prev) =>
              prev.map(t => (t.id === updatedTx.id || t.referenceNumber === updatedTx.referenceNumber ? { ...t, ...updatedTx } : t))
            );
          } catch (err) {
            console.error('Erreur parsing TRANSACTION_UPDATED SSE:', err);
          }
        });

        // 5. Mise à jour du taux officiel
        eventSource.addEventListener('RATE_UPDATED', (e: MessageEvent) => {
          try {
            const rateObj = JSON.parse(e.data);
            if (rateObj?.isUSD || rateObj?.baseCurrency === 'USD') {
              const u = parseFloat(String(rateObj.rate || rateObj.usdRate));
              if (!isNaN(u) && u > 0) {
                setUsdToHtgRateState(u);
                showToast(`📈 Taux USD officiel actualisé en direct : 1 USD = ${u} HTG`, 'info');
              }
            } else if (rateObj?.rate) {
              const r = rateObj.rate > 10 ? rateObj.rate / 100 : rateObj.rate;
              setDopToHtgRateState(r);
              showToast(`📈 Taux de change officiel actualisé en direct : 100 DOP = ${Math.round(r * 100)} HTG`, 'info');
            }
          } catch (err) {
            console.error('Erreur parsing RATE_UPDATED SSE:', err);
          }
        });

        // 6. Bascule Kill-Switch
        eventSource.addEventListener('KILL_SWITCH_UPDATED', (e: MessageEvent) => {
          try {
            const ksItem = JSON.parse(e.data) as KillSwitchItem;
            setKillSwitchList((prev) =>
              prev.map(k => (k.operator === ksItem.operator ? ksItem : k))
            );
            if (!ksItem.enabled) {
              showToast(`⛔ ALERTE : Le service ${ksItem.operator.toUpperCase()} a été verrouillé d'urgence.`, 'error');
            } else {
              showToast(`✅ Le service ${ksItem.operator.toUpperCase()} a été rétabli.`, 'success');
            }
          } catch (err) {
            console.error('Erreur parsing KILL_SWITCH_UPDATED SSE:', err);
          }
        });

        // 7. Mise à jour des soldes de trésorerie
        eventSource.addEventListener('BALANCE_UPDATED', () => {
          api.treasury.getBalances().then((bals) => {
            if (Array.isArray(bals)) {
              setAccountBalances(bals);
            }
          }).catch(() => null);
        });

        eventSource.onerror = () => {
          console.warn('⚠️ [SSE] Connexion temps réel interrompue, reconnexion automatique...');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnexion dans 5 secondes
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Erreur initialisation SSE:', err);
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, currentUser?.role]);

  const setDopToHtgRate = (rate: number) => {
    // Si l'utilisateur entre 230 (pour 100 Pesos), on divise par 100 pour obtenir le taux unitaire (2.30)
    const normalizedRate = rate > 10 ? rate / 100 : rate;
    setDopToHtgRateState(normalizedRate);
    localStorage.setItem('dalexis_dop_to_htg_rate', normalizedRate.toString());
    api.rates.update(normalizedRate, currentUser.name, 'DOP').catch(() => null);
    showToast(`Taux de change officiel mis à jour : 100 DOP = ${Math.round(normalizedRate * 100)} HTG`, 'success');
  };

  const setUsdToHtgRate = (rate: number) => {
    const num = parseFloat(String(rate));
    if (isNaN(num) || num <= 0) return;
    setUsdToHtgRateState(num);
    localStorage.setItem('dalexis_usd_to_htg_rate', num.toString());
    api.rates.update(num, currentUser.name, 'USD').catch(() => null);
    showToast(`Taux USD officiel mis à jour : 1 USD = ${num} HTG`, 'success');
  };

  // Subscribe to distributed event bus for audit logging
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('*', (event) => {
      const targetType = 
        event.type.includes('USER') ? 'user' :
        event.type.includes('PERMISSION') ? 'permission' :
        event.type.includes('TRANSACTION') || event.type.includes('TASK') ? 'transaction' :
        event.type.includes('KILL_SWITCH') ? 'kill_switch' :
        event.type.includes('TREASURY') ? 'treasury' : 'system';

      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: event.timestamp,
        nodeId: event.sourceNodeId,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: event.type,
        targetType,
        details: typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload),
        nodeStatus: 'ACK',
        priority: event.type.includes('KILL_SWITCH') || event.type.includes('SECURITY') ? 'High' : 'Medium',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Compute unread tasks for current user role
  const unreadTasksCount = transactions.filter((tx) => {
    if (tx.status === 'completed' || tx.status === 'cancelled') return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'agent_haiti' && tx.channel === 'haiti_cash') return true;
    if (currentUser.role === 'gestionnaire' && tx.operator !== 'natcash') return true;
    return false;
  }).length;

  // Create Transaction & Intelligent Task Routing
  const createTransaction = (data: {
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    operator: OperatorCode;
    serviceType: ServiceType;
    amountDOP: number;
    feeDOP: number;
    commissionDOP: number;
    amountUSD?: number;
    proofUrl?: string;
    zelleProofUrl?: string;
    payoutCurrency?: 'DOP' | 'HTG' | 'USD';
  }) => {
    // 1. Check Kill-Switch for this operator
    const ks = killSwitchList.find((k) => k.operator === data.operator);
    if (ks && !ks.enabled) {
      return {
        success: false,
        message: `Le service ${data.operator.toUpperCase()} est temporairement indisponible (${ks.reason || 'en maintenance'}).`,
      };
    }

    const isZelle = data.operator === 'zelle';

    // 1c. Check Operator Restrictions (Gestionnaire / Superviseur cannot do Natcash / Natcom)
    const isGestionnaire = currentUser.role === 'gestionnaire';
    const isHaitiOp = data.operator === 'natcash' || data.operator === 'natcom';

    if (isGestionnaire && isHaitiOp) {
      return {
        success: false,
        message: `Les transferts Natcash et Natcom sont réservés aux agents d'exécution.`,
      };
    }

    // 2. Check Ceiling Limit (maxSingleTransactionDOP) for current user
    const userPerm = permissions.find((p) => p.userId === currentUser.id);
    if (userPerm && userPerm.servicesAllowed && !userPerm.servicesAllowed.includes(data.operator) && currentUser.role !== 'admin') {
      return {
        success: false,
        message: `L'opérateur ${data.operator.toUpperCase()} n'est pas autorisé pour votre compte.`,
      };
    }

    if (userPerm && !isZelle && data.amountDOP > userPerm.maxSingleTransactionDOP) {
      eventBus.publish(
        'PERMISSIONS_UPDATED',
        currentUser.nodeId,
        currentUser.role,
        `[Plafond dépassé] Tentative de transfert de ${data.amountDOP.toLocaleString()} DOP par ${currentUser.name} (Max autorisé: ${userPerm.maxSingleTransactionDOP.toLocaleString()} DOP)`
      );
      return {
        success: false,
        message: `Le montant de ${data.amountDOP.toLocaleString()} DOP dépasse la limite autorisée pour votre compte (maximum : ${userPerm.maxSingleTransactionDOP.toLocaleString()} DOP).`,
      };
    }

    // Calculs spécifiques Zelle si applicable
    const usdToDop = (usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 60.0;
    const finalAmountUSD = data.amountUSD || (isZelle && data.amountDOP > 0 ? Math.round((data.amountDOP / usdToDop) * 100) / 100 : 0);
    const finalAmountDOP = isZelle ? Math.round(finalAmountUSD * usdToDop) : data.amountDOP;
    const finalAmountHTG = isZelle ? Math.round(finalAmountUSD * (usdToHtgRate || 140.5)) : Math.round(data.amountDOP * dopToHtgRate);

    const zelleCommRate = serviceCommissionRates['zelle'] ?? adminCommissionRate ?? 1.5;
    const zelleFeeRate = 3.5; // 3.5% Frais guichet / virement
    const zelleFeeUSD = isZelle ? Math.round(finalAmountUSD * (zelleFeeRate / 100) * 100) / 100 : 0;
    const zelleCommissionUSD = isZelle ? Math.round(finalAmountUSD * (zelleCommRate / 100) * 100) / 100 : 0;

    const payoutCurrency = data.payoutCurrency || 'DOP';
    const netUSD = finalAmountUSD - zelleFeeUSD;
    const netPayoutAmount = payoutCurrency === 'DOP'
      ? Math.round(netUSD * usdToDop)
      : payoutCurrency === 'HTG'
      ? Math.round(netUSD * (usdToHtgRate || 140.5))
      : Math.round(netUSD * 100) / 100;

    const finalFeeDOP = isZelle ? Math.round(zelleFeeUSD * usdToDop) : data.feeDOP;
    const finalCommDOP = isZelle ? Math.round(zelleCommissionUSD * usdToDop) : data.commissionDOP;

    // 3. Determine Channel & Intelligent Task Routing :
    // - Zelle Direct -> Admin pour vérification bancaire
    // - Haïti Cash / Mobile Money (MonCash, Natcash, Natcom) -> Agent Haïti
    // - Télécoms & Numériques (Digicel, Claro, Altice) -> Gestionnaire
    const isHaitiCashChannel = data.operator === 'moncash' || data.operator === 'natcash' || data.operator === 'natcom';
    const channel: ChannelType = isHaitiCashChannel ? 'haiti_cash' : 'digital_telecom';
    
    const assignedRole: Role = isZelle ? 'admin' : (isHaitiCashChannel ? 'agent_haiti' : 'gestionnaire');
    const assignedUser = availableUsers.find((u) => u.role === assignedRole);
    const assignedNodeId = assignedUser ? assignedUser.nodeId : (isZelle ? 'node-admin-01' : (isHaitiCashChannel ? 'node-agent-haiti-01' : 'node-gestionnaire-01'));
    const assignedName = assignedUser ? assignedUser.name : (isZelle ? 'Administrateur' : (isHaitiCashChannel ? 'Agent Haïti' : 'Gestionnaire'));

    const newTxId = `tx_${Date.now()}`;
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const refNum = isZelle ? `#ZEL-${dateStr}-${randomSuffix}` : `#TX-${dateStr}-${randomSuffix}`;
    const proofImg = data.proofUrl || data.zelleProofUrl;

    const newTx: Transaction = {
      id: newTxId,
      referenceNumber: refNum,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      operator: data.operator,
      serviceType: data.serviceType,
      channel,
      amountDOP: finalAmountDOP,
      amountHTG: finalAmountHTG,
      amountUSD: isZelle ? finalAmountUSD : data.amountUSD,
      exchangeRate: isZelle ? usdToDop : dopToHtgRate,
      feeDOP: finalFeeDOP,
      commissionDOP: finalCommDOP,
      
      // Zelle Specific Flow
      zelleStatus: isZelle ? 'pending_admin_check' : undefined,
      zelleProofUrl: isZelle ? proofImg : undefined,
      zelleExchangeRate: isZelle ? usdToDop : undefined,
      zelleFeeUSD: isZelle ? zelleFeeUSD : undefined,
      zelleCommissionUSD: isZelle ? zelleCommissionUSD : undefined,
      netPayoutAmount: isZelle ? netPayoutAmount : undefined,
      netPayoutCurrency: isZelle ? payoutCurrency : undefined,
      
      proofUrl: proofImg,
      proofNotes: isZelle ? `Preuve Zelle ($${finalAmountUSD} USD) soumise par ${currentUser.name}. En attente de vérification bancaire par l'Administrateur.` : undefined,

      createdByNode: currentUser.nodeId,
      createdByName: currentUser.name,
      createdByRole: currentUser.role,
      isAdminNominalTrace: currentUser.role === 'admin',
      
      assignedToNode: assignedNodeId,
      assignedToRole: assignedRole,
      assignedToName: assignedName,
      
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update balances: Natcom shares the Natcash balance and Digicel shares the MonCash balance
    if (!isZelle) {
      setAccountBalances((prev) =>
        prev.map((b) => {
          const targetOperator = data.operator === 'natcom' ? 'natcash' : data.operator === 'digicel' ? 'moncash' : data.operator;
          if (b.operator === targetOperator) {
            const deduction = b.currency === 'HTG' ? finalAmountHTG : data.amountDOP;
            return { ...b, balance: Math.max(0, b.balance - deduction), lastUpdated: new Date().toISOString() };
          }
          return b;
        })
      );
    }

    // Audit log & Event bus broadcast
    const logDetails = isZelle
      ? `[ZELLE PAY] Demande de virement de $${finalAmountUSD} USD créée par ${currentUser.name} (${currentUser.role}) -> Transmise à l'Admin pour vérification de compte`
      : currentUser.role === 'admin' 
        ? `[GUICHET ADMIN] Transaction ${refNum} créée par Admin (${currentUser.name}) -> Routée vers ${assignedName}`
        : `Transaction ${refNum} créée par ${currentUser.name} (${currentUser.role}) -> Routée vers ${assignedName}`;

    eventBus.publish(isZelle ? 'ZELLE_SUBMITTED' : 'TRANSACTION_CREATED', currentUser.nodeId, currentUser.role, logDetails);

    // Persistance dans le Backend SQLite / MySQL
    api.transactions.create({
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      operator: data.operator,
      serviceType: data.serviceType,
      amountDOP: finalAmountDOP,
      amountUSD: isZelle ? finalAmountUSD : data.amountUSD,
      feeDOP: finalFeeDOP,
      commissionDOP: finalCommDOP,
      proofUrl: proofImg,
      proofNotes: newTx.proofNotes,
      currentUserId: currentUser.id,
    }).then((res) => {
      if (res.transaction) {
        const finalProof = res.transaction.proofUrl || proofImg;
        setTransactions((prev) => [
          {
            ...newTx,
            ...res.transaction,
            proofUrl: finalProof,
            zelleProofUrl: isZelle ? (finalProof || proofImg) : undefined,
            id: res.transaction.id,
          },
          ...prev.filter((t) => t.id !== newTxId && t.id !== res.transaction.id),
        ]);
      }
    }).catch((err) => {
      console.warn('API createTransaction error, fallback mémoire actif:', err);
    });

    const toastMsg = isZelle
      ? `Preuve Zelle ($${finalAmountUSD} USD) enregistrée ! Transmise à l'Admin pour vérification de compte. Ne donnez pas l'argent avant validation.`
      : isHaitiCashChannel
        ? `Transaction ${refNum} (${data.operator.toUpperCase()}) enregistrée avec succès ! Montant: ${data.amountDOP.toLocaleString()} DOP (${Math.round(data.amountDOP * dopToHtgRate).toLocaleString()} HTG).`
        : `Transaction ${refNum} (${data.operator.toUpperCase()}) enregistrée avec succès ! Montant: ${data.amountDOP.toLocaleString()} DOP.`;
    showToast(toastMsg, isZelle ? 'info' : 'success');

    return {
      success: true,
      message: isZelle
        ? `Virement Zelle de $${finalAmountUSD} USD soumis ! Un message a été envoyé à l'Admin pour vérifier son compte. Attendez sa validation.`
        : isHaitiCashChannel
          ? `Transaction ${refNum} (${data.operator.toUpperCase()}) enregistrée et mise en attente ! Transmise à l'agent en Haïti pour validation avec photo de preuve.`
          : `Transaction ${refNum} (${data.operator.toUpperCase()}) enregistrée et mise en attente ! Transmise au Gestionnaire pour validation avec photo de preuve.`,
      transaction: newTx,
    };
  };

  // Validate Zelle Transaction by Admin (OUI ou NON)
  const validateZelleTransaction = (transactionId: string, approved: boolean, note?: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) {
      return { success: false, message: 'Transaction Zelle introuvable.' };
    }

    if (approved) {
      const payoutText = `${tx.netPayoutAmount ? tx.netPayoutAmount.toLocaleString() : tx.amountDOP.toLocaleString()} ${tx.netPayoutCurrency || 'DOP'}`;
      const proofNotes = `[ZELLE CONFIRMÉ PAR L'ADMIN ${currentUser.name}] Virement de $${tx.amountUSD || 0} USD vérifié et validé sur le compte bancaire. PAIEMENT CLIENT AUTORISÉ : ${payoutText}. ${note ? `Note: ${note}` : ''}`;

      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id === transactionId) {
            return {
              ...t,
              status: 'completed',
              zelleStatus: 'approved',
              completedAt: new Date().toISOString(),
              proofNotes,
            };
          }
          return t;
        })
      );

      // Audit log & Event bus
      eventBus.publish(
        'TRANSACTION_COMPLETED',
        currentUser.nodeId,
        currentUser.role,
        `[ZELLE VALIDÉ PAR ADMIN ${currentUser.name}] Transaction ${tx.referenceNumber} approuvée. Montant net à verser au client: ${payoutText}`
      );

      // Synchronisation backend
      api.transactions.complete(tx.id, proofNotes, tx.proofUrl, currentUser.name).catch(() => null);

      showToast(`✅ Zelle ${tx.referenceNumber} validé ! L'agent peut remettre ${payoutText} au client.`, 'success');

      return {
        success: true,
        message: `Zelle validé avec succès ! L'agent a été notifié qu'il peut remettre ${payoutText} au client.`
      };
    } else {
      const cancellationReason = note || "Virement Zelle non reçu / non visible sur le compte bancaire de l'Administrateur.";

      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id === transactionId) {
            return {
              ...t,
              status: 'cancelled',
              zelleStatus: 'rejected',
              cancelledAt: new Date().toISOString(),
              cancellationReason,
            };
          }
          return t;
        })
      );

      eventBus.publish(
        'TRANSACTION_CANCELLED',
        currentUser.nodeId,
        currentUser.role,
        `[ZELLE REFUSÉ PAR ADMIN ${currentUser.name}] Transaction ${tx.referenceNumber} refusée. Motif: ${cancellationReason}`
      );

      // Synchronisation backend
      api.transactions.cancel(tx.id, cancellationReason, currentUser.name).catch(() => null);

      showToast(`❌ Zelle ${tx.referenceNumber} refusé. L'agent a été averti de ne pas remettre d'argent.`, 'error');

      return {
        success: true,
        message: `Zelle refusé. L'agent a été notifié de ne pas payer le client.`
      };
    };
  };

  // Complete & Validate Task (Agent Haïti / Gestionnaire / Admin)
  const completeTask = (transactionId: string, proofNotes: string, proofUrl?: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          const updatedTx: Transaction = {
            ...tx,
            status: 'completed',
            completedAt: new Date().toISOString(),
            proofNotes: proofNotes || `Validé par ${currentUser.name}`,
            proofUrl: proofUrl || tx.proofUrl,
          };
          return updatedTx;
        }
        return tx;
      })
    );

    eventBus.publish(
      'TRANSACTION_COMPLETED',
      currentUser.nodeId,
      currentUser.role,
      `Clôture de la tâche par ${currentUser.name} (${currentUser.role}). Preuve: ${proofNotes}`
    );

    // Sync backend
    api.transactions.complete(transactionId, proofNotes, proofUrl, currentUser.name).then((res) => {
      if (res && res.transaction) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? { ...t, ...res.transaction, proofUrl: res.transaction.proofUrl || proofUrl || t.proofUrl } : t))
        );
      }
    }).catch(() => null);

    showToast('Transaction validée et clôturée avec succès !', 'success');
    return { success: true, message: 'Tâche clôturée et validée avec succès !' };
  };

  // Cancel Transaction (ADMIN ONLY Security Rule)
  const cancelTransaction = (transactionId: string, reason: string) => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Seul l\'administrateur est autorisé à annuler un transfert.',
      };
    }

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
          };
        }
        return tx;
      })
    );

    // Restitution du solde sur la flotte correspondante
    const txToCancel = transactions.find((t) => t.id === transactionId);
    if (txToCancel) {
      setAccountBalances((prev) =>
        prev.map((b) => {
          const targetOperator = txToCancel.operator === 'natcom' ? 'natcash' : txToCancel.operator === 'digicel' ? 'moncash' : txToCancel.operator;
          if (b.operator === targetOperator) {
            const refund = b.currency === 'HTG' ? (txToCancel.amountHTG || 0) : (txToCancel.amountDOP || 0);
            return { ...b, balance: b.balance + refund, lastUpdated: new Date().toISOString() };
          }
          return b;
        })
      );
    }

    eventBus.publish(
      'TRANSACTION_CANCELLED',
      currentUser.nodeId,
      currentUser.role,
      `[ADMIN OVERRIDE] Transaction ${transactionId} annulée par Admin (${currentUser.name}). Motif: ${reason}`
    );

    // Sync backend
    api.transactions.cancel(transactionId, reason, currentUser.name).catch(() => null);

    showToast(`Transaction ${transactionId} annulée par l'Administrateur.`, 'info');
    return { success: true, message: 'Transaction annulée et archivée par l\'Administrateur.' };
  };

  // Update / Edit Transaction Details (ADMIN Override)
  const updateTransaction = (transactionId: string, updatedFields: Partial<Transaction>) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Seul l\'Administrateur est autorisé à modifier les données d\'une transaction.' };
    }

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          const updated: Transaction = {
            ...tx,
            ...updatedFields,
          };
          
          // Re-calculate HTG if DOP changed
          if (updatedFields.amountDOP !== undefined) {
            updated.amountHTG = Math.round(updatedFields.amountDOP * updated.exchangeRate);
          }

          return updated;
        }
        return tx;
      })
    );

    eventBus.publish(
      'TRANSACTION_UPDATED',
      currentUser.nodeId,
      currentUser.role,
      `[ADMIN EDIT] Transaction ${transactionId} modifiée par Admin (${currentUser.name})`
    );

    showToast('Transaction modifiée et mise à jour avec succès.', 'success');
    return { success: true, message: 'Transaction modifiée et mise à jour avec succès par l\'Administrateur !' };
  };

  // Re-assign Task to Another Employee (ADMIN Action)
  const reassignTask = (transactionId: string, targetUser: User) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Seul l\'administrateur peut ré-assigner les tâches.' };
    }

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            assignedToNode: targetUser.nodeId,
            assignedToRole: targetUser.role,
            assignedToName: targetUser.name,
          };
        }
        return tx;
      })
    );

    eventBus.publish(
      'TASK_ROUTED',
      currentUser.nodeId,
      currentUser.role,
      `[ADMIN ROUTAGE] Transaction ${transactionId} ré-assignée à ${targetUser.name} (${targetUser.role})`
    );

    showToast(`Tâche ré-assignée avec succès à ${targetUser.name} !`, 'success');
    return { success: true, message: `Tâche ré-assignée avec succès à ${targetUser.name} !` };
  };

  // Toggle Operator Kill-Switch
  const toggleKillSwitch = (operator: OperatorCode, reason?: string) => {
    if (currentUser.role !== 'admin') return;

    setKillSwitchList((prev) =>
      prev.map((item) => {
        if (item.operator === operator) {
          const newStatus = !item.enabled;
          const updated: KillSwitchItem = {
            ...item,
            enabled: newStatus,
            reason: newStatus ? undefined : (reason || 'Désactivé d\'urgence par Admin'),
            updatedBy: currentUser.name,
            updatedAt: new Date().toISOString(),
          };

          eventBus.publish(
            'KILL_SWITCH_TOGGLED',
            currentUser.nodeId,
            currentUser.role,
            `Statut du service ${operator.toUpperCase()} mis à jour -> ${newStatus ? 'ACTIF / OPÉRATIONNEL' : 'SUSPENDU (SÉCURITÉ)'}`
          );

          // Sync backend
          api.killSwitch.toggle(operator, reason, currentUser.name).catch(() => null);

          showToast(
            newStatus
              ? `Service ${operator.toUpperCase()} réactivé avec succès.`
              : `Service ${operator.toUpperCase()} suspendu (Kill-Switch activé).`,
            newStatus ? 'success' : 'error'
          );

          return updated;
        }
        return item;
      })
    );
  };

  // Update User Permission Matrix
  const updateUserPermissions = (userId: string, newPermissions: Partial<UserPermissionMatrix>) => {
    if (currentUser.role !== 'admin') return;

    setPermissions((prev) =>
      prev.map((perm) => {
        if (perm.userId === userId) {
          const updated = { ...perm, ...newPermissions };
          eventBus.publish(
            'PERMISSIONS_UPDATED',
            currentUser.nodeId,
            currentUser.role,
            `Matrice de permissions modifiée pour l'utilisateur ${perm.userName}`
          );

          // Sync backend
          api.users.updatePermissions(userId, newPermissions).catch(() => null);

          showToast(`Permissions mises à jour avec succès pour ${perm.userName}.`, 'success');
          return updated;
        }
        return perm;
      })
    );
  };

  // Recharge / Réapprovisionnement de Flotte Trésorerie
  const rechargeAccount = async (accountId: string, amount: number, note?: string) => {
    try {
      const res = await api.treasury.recharge({
        accountId,
        amount,
        note,
        actorName: currentUser.name,
      });

      if (res?.account) {
        setAccountBalances((prev) =>
          prev.map((a) => (a.id === accountId ? (res.account as AccountBalance) : a))
        );
      } else {
        setAccountBalances((prev) =>
          prev.map((a) =>
            a.id === accountId
              ? { ...a, balance: a.balance + amount, lastUpdated: new Date().toISOString() }
              : a
          )
        );
      }

      eventBus.publish(
        'TREASURY_ADJUSTED',
        currentUser.nodeId,
        currentUser.role,
        `Flotte ${accountId} réapprovisionnée (+${amount.toLocaleString()}) par ${currentUser.name}`
      );

      const successMsg = res?.message || `Flotte ${accountId.toUpperCase()} réapprovisionnée avec succès (+${amount.toLocaleString()}) !`;
      showToast(successMsg, 'success');
      return { success: true, message: successMsg };
    } catch (err: any) {
      setAccountBalances((prev) =>
        prev.map((a) =>
          a.id === accountId
            ? { ...a, balance: a.balance + amount, lastUpdated: new Date().toISOString() }
            : a
        )
      );
      showToast(`Flotte ${accountId.toUpperCase()} réapprovisionnée localement (+${amount.toLocaleString()}).`, 'success');
      return { success: true, message: 'Réapprovisionnement appliqué localement.' };
    }
  };

  const addUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<{ success: boolean; message: string }> => {
    // Enregistrement des identifiants locaux pour permettre la connexion permanente
    if (userData.password) {
      try {
        const creds = JSON.parse(localStorage.getItem('dalexis_credentials') || '{}');
        if (userData.email) creds[userData.email.trim().toLowerCase()] = userData.password;
        if (userData.username) {
          creds[userData.username.trim().toLowerCase()] = userData.password;
          creds[userData.username.trim().toLowerCase().replace(/^@/, '')] = userData.password;
        }
        localStorage.setItem('dalexis_credentials', JSON.stringify(creds));
      } catch (e) {
        console.error('Erreur sauvegarde dalexis_credentials:', e);
      }
    }

    try {
      const res = await api.users.create(userData);
      if (res && res.user) {
        const createdUser = res.user;
        setAvailableUsers((prev) => {
          const updated = [...prev.filter(u => u.id !== createdUser.id && u.email !== createdUser.email), createdUser];
          localStorage.setItem('dalexis_available_users', JSON.stringify(updated));
          return updated;
        });
        
        // Add default permissions entry
        const defaultServices: OperatorCode[] = 
          createdUser.role === 'agent_haiti' ? ['natcash', 'natcom'] :
          createdUser.role === 'gestionnaire' ? ['moncash', 'digicel', 'claro', 'altice', 'zelle'] :
          createdUser.role === 'agent_rd' ? ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom', 'zelle'] :
          ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice', 'zelle'];

        const defaultCeiling = createdUser.role === 'admin' ? 500000 : (createdUser.role === 'agent_haiti' || createdUser.role === 'gestionnaire' ? 100000 : 50000);
        const newPerm: UserPermissionMatrix = {
          userId: createdUser.id,
          userName: createdUser.name,
          role: createdUser.role,
          servicesAllowed: defaultServices,
          maxSingleTransactionDOP: defaultCeiling,
          canCancelTransaction: createdUser.role === 'admin',
          canManageKillSwitch: createdUser.role === 'admin',
          canViewTreasury: createdUser.role === 'admin' || createdUser.role === 'gestionnaire',
          canEditRates: createdUser.role === 'admin',
        };
        
        setPermissions((prev) => {
          const updated = [...prev.filter(p => p.userId !== createdUser.id), newPerm];
          localStorage.setItem('dalexis_permissions', JSON.stringify(updated));
          return updated;
        });

        eventBus.publish('USER_CREATED', currentUser.nodeId, currentUser.role, `Nouvel utilisateur créé: ${createdUser.name} (@${createdUser.username || ''})`);
        showToast(`Utilisateur ${createdUser.name} créé avec succès !`, 'success');
        return { success: true, message: `Utilisateur ${createdUser.name} créé avec succès !` };
      }
    } catch (err: any) {
      console.warn('API users.create error:', err);
      const errMsg = err?.message || '';
      if (errMsg.includes('existe déjà') || errMsg.includes('déjà attribué') || errMsg.includes('obligatoire')) {
        showToast(errMsg, 'error');
        return { success: false, message: errMsg };
      }
    }

    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newUserId,
    };
    
    setAvailableUsers((prev) => {
      const updated = [...prev.filter(u => u.email !== newUser.email), newUser];
      localStorage.setItem('dalexis_available_users', JSON.stringify(updated));
      return updated;
    });
    
    // Add default permissions entry
    const localServices: OperatorCode[] = 
      newUser.role === 'agent_haiti' ? ['natcash', 'natcom'] :
      newUser.role === 'gestionnaire' ? ['moncash', 'digicel', 'claro', 'altice', 'zelle'] :
      newUser.role === 'agent_rd' ? ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom', 'zelle'] :
      ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice', 'zelle'];

    const localCeiling = newUser.role === 'admin' ? 500000 : (newUser.role === 'agent_haiti' || newUser.role === 'gestionnaire' ? 100000 : 50000);
    const newPerm: UserPermissionMatrix = {
      userId: newUserId,
      userName: newUser.name,
      role: newUser.role,
      servicesAllowed: localServices,
      maxSingleTransactionDOP: localCeiling,
      canCancelTransaction: newUser.role === 'admin',
      canManageKillSwitch: newUser.role === 'admin',
      canViewTreasury: newUser.role === 'admin' || newUser.role === 'gestionnaire',
      canEditRates: newUser.role === 'admin',
    };
    
    setPermissions((prev) => {
      const updated = [...prev.filter(p => p.userId !== newUserId), newPerm];
      localStorage.setItem('dalexis_permissions', JSON.stringify(updated));
      return updated;
    });
    
    eventBus.publish('USER_CREATED', currentUser.nodeId, currentUser.role, `Nouvel utilisateur créé: ${newUser.name} (${newUser.role})`);
    showToast(`Utilisateur ${newUser.name} enregistré avec succès !`, 'success');
    return { success: true, message: `Utilisateur ${newUser.name} enregistré avec succès !` };
  };

  const updateUser = async (userId: string, data: Partial<User> & { password?: string }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await api.users.update(userId, data);
      if (res && res.user) {
        const updatedUser = res.user;
        setAvailableUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u)));
        if (currentUser.id === userId) {
          setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
        }
        eventBus.publish('USER_UPDATED', currentUser.nodeId, currentUser.role, `Profil de l'agent mis à jour: ${updatedUser.name}`);
        showToast(`Profil de ${updatedUser.name} mis à jour avec succès !`, 'success');
        return { success: true, message: res.message || 'Utilisateur mis à jour avec succès.', user: updatedUser };
      }
    } catch (err: any) {
      console.warn('API users.update error, fallback mode local:', err);
    }

    let updatedLocalUser: User | undefined;
    setAvailableUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const { password: _, ...restData } = data;
          updatedLocalUser = { ...u, ...restData } as User;
          return updatedLocalUser;
        }
        return u;
      })
    );

    if (currentUser.id === userId && updatedLocalUser) {
      setCurrentUser(updatedLocalUser);
    }

    eventBus.publish('USER_UPDATED', currentUser.nodeId, currentUser.role, `Mise à jour locale de l'agent ${userId}`);
    return { success: true, message: 'Utilisateur mis à jour avec succès !', user: updatedLocalUser };
  };

  const toggleUserStatus = (userId: string) => {
    setAvailableUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'offline' ? 'online' : 'offline';
          api.users.toggleStatus(userId).catch(() => null);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Authentification (Login & Logout)
  const login = async (identifierOrEmail: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.auth.login(identifierOrEmail, password);
      if (res.success && res.token) {
        localStorage.setItem('dalexis_token', res.token);
        localStorage.setItem('dalexis_last_activity', Date.now().toString());
        if (res.user) {
          localStorage.setItem('dalexis_user', JSON.stringify(res.user));
          setCurrentUser(res.user);
          // Redirection immédiate sur l'onglet adapté au rôle (Gestionnaire -> Opérations en premier)
          const targetTab: ActiveTab = 
            res.user.role === 'agent_rd' || res.user.role === 'gestionnaire' ? 'guichet' :
            res.user.role === 'agent_haiti' ? 'tasks' :
            'overview';
          setActiveTab(targetTab);
        }
        setIsAuthenticated(true);
        // Synchroniser immédiatement la liste des utilisateurs du backend
        api.users.getAll().then((data) => {
          if (data?.users && data.users.length > 0) {
            setAvailableUsers(data.users);
            localStorage.setItem('dalexis_available_users', JSON.stringify(data.users));
          }
          if (data?.permissions) {
            setPermissions(data.permissions);
            localStorage.setItem('dalexis_permissions', JSON.stringify(data.permissions));
          }
        }).catch(() => null);

        return { success: true, message: 'Connexion réussie !' };
      }
      return { success: false, message: 'Identifiants invalides.' };
    } catch (err: any) {
      console.error('Erreur authentification:', err);
      return { 
        success: false, 
        message: err.message || 'Identifiants invalides ou serveur indisponible.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('dalexis_token');
    localStorage.removeItem('dalexis_user');
    localStorage.removeItem('dalexis_last_activity');
    setIsAuthenticated(false);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveTab('overview');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers,
        isAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        dopToHtgRate,
        usdToHtgRate,
        setDopToHtgRate,
        setUsdToHtgRate,
        adminCommissionRate,
        setAdminCommissionRate,
        serviceCommissionRates,
        updateServiceCommissionRate,
        transactions,
        accountBalances,
        killSwitchList,
        permissions,
        auditLogs,
        settlements,
        serviceCommissions,
        updateServiceCommission,
        operatorCommissions,
        updateOperatorCommission,
        recordAgentDeposit,
        createTransaction,
        validateZelleTransaction,
        completeTask,
        cancelTransaction,
        updateTransaction,
        reassignTask,
        toggleKillSwitch,
        updateUserPermissions,
        rechargeAccount,
        selectedReceiptTx,
        setSelectedReceiptTx,
        nodeConnectionStatus,
        unreadTasksCount,
        addUser,
        updateUser,
        toggleUserStatus,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        isSearchOpen,
        setIsSearchOpen,
        openSearch,
        selectedService,
        setSelectedService,
        toastNotification,
        showToast,
        hideToast,
        isTransactionDetailOpen,
        setIsTransactionDetailOpen,
        currentLang,
        setLanguage,
        t,
        readNotificationIds,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isPWAInstalled,
        canInstallPWA: Boolean(deferredPWAPrompt) || !isPWAInstalled,
        showPWAInstallPrompt,
        setShowPWAInstallPrompt,
        installPWA,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
