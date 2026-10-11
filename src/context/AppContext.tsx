import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { Language, Translations, translations } from '../i18n/translations';

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
  }) => { success: boolean; message: string; transaction?: Transaction };
  
  completeTask: (transactionId: string, proofNotes: string, proofUrl?: string) => { success: boolean; message: string };
  cancelTransaction: (transactionId: string, reason: string) => { success: boolean; message: string };
  updateTransaction: (transactionId: string, updatedFields: Partial<Transaction>) => { success: boolean; message: string };
  reassignTask: (transactionId: string, targetUser: User) => { success: boolean; message: string };
  toggleKillSwitch: (operator: OperatorCode, reason?: string) => void;
  updateUserPermissions: (userId: string, newPermissions: Partial<UserPermissionMatrix>) => void;
  rechargeAccount: (accountId: string, amount: number, note?: string) => Promise<{ success: boolean; message: string }>;
  recordAgentDeposit: (settlementId: string, amount: number, note: string) => { success: boolean; message: string };
  
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

  // i18n Internationalization State
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(INITIAL_USERS);
  
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
    return !!localStorage.getItem('dalexis_token') && !!localStorage.getItem('dalexis_user');
  });

  // Synchronisation continue du profil connecté dans localStorage
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('dalexis_user', JSON.stringify(currentUser));
    }
  }, [currentUser, isAuthenticated]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  // Global Toast Notification State & Handlers
  const [toastNotification, setToastNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastNotification({ text, type });
  };

  const hideToast = () => {
    setToastNotification(null);
  };

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

  const t = (key: keyof Translations): string => {
    const dict = translations[currentLang] || translations.FR;
    return dict[key] || translations.FR[key] || key;
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);
  
  const [dopToHtgRate, setDopToHtgRateState] = useState<number>(2.35);
  const [usdToHtgRate, setUsdToHtgRate] = useState<number>(140.5);
  
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
  
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>(INITIAL_BALANCES);
  const [killSwitchList, setKillSwitchList] = useState<KillSwitchItem[]>(INITIAL_KILL_SWITCH);
  const [permissions, setPermissions] = useState<UserPermissionMatrix[]>(INITIAL_PERMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settlements, setSettlements] = useState<WeeklySettlement[]>(INITIAL_SETTLEMENTS);
  
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
  };
  
  const recordAgentDeposit = (settlementId: string, amount: number, note: string) => {
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === settlementId) {
          const newDeposited = s.amountDeposited + amount;
          const newRemaining = Math.max(0, s.netAmountToPay - newDeposited);
          const newStatus: 'paid' | 'partial' | 'pending' =
            newRemaining === 0 ? 'paid' : newDeposited > 0 ? 'partial' : 'pending';
          const newDepositRecord = {
            id: `dep_${Date.now()}`,
            amount,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: note || 'Versement hebdomadaire enregistré par l\'Admin',
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
      })
    );

    const logDetails = `[VERSEMENT HEBDO] Admin (${currentUser.name}) a enregistré un dépôt de ${amount.toLocaleString()} pour la liquidation ${settlementId}.`;
    eventBus.publish('TREASURY_RECHARGED', currentUser.nodeId, currentUser.role, logDetails);

    return { success: true, message: 'Dépôt hebdomadaire enregistré avec succès et solde de l\'agent recalculé !' };
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

  // Déconnexion / Verrouillage automatique après 60 minutes (1 heure) sans utilisation
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes en millisecondes

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Supprimer la session et forcer la redemande du mot de passe
        localStorage.removeItem('dalexis_token');
        localStorage.removeItem('dalexis_user');
        setIsAuthenticated(false);
        showToast("Session verrouillée après 60 minutes d'inactivité. Veuillez resaisir votre mot de passe.", 'info');
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Événements détectant l'activité de l'utilisateur
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    // Démarrage initial du compte à rebours
    resetInactivityTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
    };
  }, [isAuthenticated]);

  // Synchronisation avec l'API Backend Express / SQLite
  useEffect(() => {
    let isMounted = true;

    const syncWithBackend = async () => {
      try {
        setNodeConnectionStatus('syncing');

        // 1. Données publiques (taux de change)
        const rateData = await api.rates.get().catch(() => null);
        if (rateData?.rate && isMounted) {
          const r = rateData.rate > 10 ? rateData.rate / 100 : rateData.rate;
          setDopToHtgRateState(r);
        }

        // 2. Vérification d'authentification avant d'appeler les routes privées
        const token = localStorage.getItem('dalexis_token');
        if (!token || !isAuthenticated) {
          if (isMounted) setNodeConnectionStatus('connected');
          return;
        }

        // 3. Données privées authentifiées
        const [txs, bals, ks, usersData, logsData] = await Promise.all([
          api.transactions.getAll().catch(() => null),
          api.treasury.getBalances().catch(() => null),
          api.killSwitch.getAll().catch(() => null),
          api.users.getAll().catch(() => null),
          api.audit.getLogs().catch(() => null),
        ]);

        if (!isMounted) return;

        if (txs && txs.length > 0) {
          setTransactions(txs as Transaction[]);
        }
        if (bals && bals.length > 0) {
          setAccountBalances(bals as AccountBalance[]);
        }
        if (ks && ks.length > 0) {
          setKillSwitchList(ks as KillSwitchItem[]);
        }
        if (rateData?.rate) {
          const r = rateData.rate > 10 ? rateData.rate / 100 : rateData.rate;
          setDopToHtgRateState(r);
        }
        if (usersData?.users && usersData.users.length > 0) {
          setAvailableUsers(usersData.users);
          if (usersData.permissions) {
            setPermissions(usersData.permissions);
          }
        }
        if (logsData && logsData.length > 0) {
          setAuditLogs(logsData.map((l: any) => ({
            ...l,
            timestamp: typeof l.timestamp === 'string' ? l.timestamp : new Date(l.timestamp).toISOString(),
          })));
        }

        setNodeConnectionStatus('connected');
      } catch (err) {
        console.warn('Backend API non joignable, maintien du mode local/mémoire:', err);
        if (isMounted) setNodeConnectionStatus('offline');
      }
    };

    syncWithBackend();

    // Synchronisation périodique en arrière-plan (toutes les 8 secondes)
    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        syncWithBackend();
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const setDopToHtgRate = (rate: number) => {
    // Si l'utilisateur entre 230 (pour 100 Pesos), on divise par 100 pour obtenir le taux unitaire (2.30)
    const normalizedRate = rate > 10 ? rate / 100 : rate;
    setDopToHtgRateState(normalizedRate);
    api.rates.update(normalizedRate, currentUser.name).catch(() => null);
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
    if (currentUser.role === 'gestionnaire' && (tx.channel === 'digital_telecom' || tx.operator === 'moncash' || tx.operator === 'digicel' || tx.operator === 'claro' || tx.operator === 'altice')) return true;
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
  }) => {
    // 1. Check Kill-Switch for this operator
    const ks = killSwitchList.find((k) => k.operator === data.operator);
    if (ks && !ks.enabled) {
      return {
        success: false,
        message: `Le service ${data.operator.toUpperCase()} est temporairement indisponible (${ks.reason || 'en maintenance'}).`,
      };
    }

    // 1b. Check Zelle Restriction (Zelle is STRICTLY Admin only)
    if (data.operator === 'zelle' && currentUser.role !== 'admin') {
      return {
        success: false,
        message: `Le service Zelle Pay est réservé à l'administrateur.`,
      };
    }

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

    if (userPerm && data.amountDOP > userPerm.maxSingleTransactionDOP) {
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

    // 3. Determine Channel & Intelligent Task Routing :
    // - Haïti Cash / Mobile Money (MonCash, Natcash, Natcom) -> Agent Haïti
    // - Télécoms & Numériques (Digicel, Claro, Altice) -> Gestionnaire
    const isHaitiCashChannel = data.operator === 'moncash' || data.operator === 'natcash' || data.operator === 'natcom';
    const channel: ChannelType = isHaitiCashChannel ? 'haiti_cash' : 'digital_telecom';
    
    const assignedRole: Role = isHaitiCashChannel ? 'agent_haiti' : 'gestionnaire';
    const assignedUser = availableUsers.find((u) => u.role === assignedRole);
    const assignedNodeId = assignedUser ? assignedUser.nodeId : (isHaitiCashChannel ? 'node-agent-haiti-01' : 'node-gestionnaire-01');
    const assignedName = assignedUser ? assignedUser.name : (isHaitiCashChannel ? 'Agent Haïti' : 'Gestionnaire');

    const newTxId = `tx_${Date.now()}`;
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const refNum = `#TX-${dateStr}-${randomSuffix}`;

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
      amountDOP: data.amountDOP,
      amountHTG: Math.round(data.amountDOP * dopToHtgRate),
      exchangeRate: dopToHtgRate,
      feeDOP: data.feeDOP,
      commissionDOP: data.commissionDOP,
      
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

    // Update balances
    setAccountBalances((prev) =>
      prev.map((b) => {
        if (b.operator === data.operator) {
          return { ...b, balance: Math.max(0, b.balance - data.amountDOP), lastUpdated: new Date().toISOString() };
        }
        return b;
      })
    );

    // Audit log & Event bus broadcast
    const logDetails = currentUser.role === 'admin' 
      ? `[GUICHET ADMIN] Transaction ${refNum} créée par Admin (${currentUser.name}) -> Routée vers ${assignedName}`
      : `Transaction ${refNum} créée par ${currentUser.name} (${currentUser.role}) -> Routée vers ${assignedName}`;

    eventBus.publish('TRANSACTION_CREATED', currentUser.nodeId, currentUser.role, logDetails);

    // Persistance dans le Backend SQLite
    api.transactions.create({
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      operator: data.operator,
      serviceType: data.serviceType,
      amountDOP: data.amountDOP,
      feeDOP: data.feeDOP,
      commissionDOP: data.commissionDOP,
      currentUserId: currentUser.id,
    }).then((res) => {
      if (res.transaction) {
        setTransactions((prev) => [
          res.transaction,
          ...prev.filter((t) => t.id !== newTxId && t.id !== res.transaction.id),
        ]);
      }
    }).catch((err) => {
      console.warn('API createTransaction error, fallback mémoire actif:', err);
    });

    return {
      success: true,
      message: isHaitiCashChannel
        ? `Transaction ${refNum} (${data.operator.toUpperCase()}) enregistrée et mise en attente ! Transmise à l'agent en Haïti pour validation avec photo de preuve.`
        : `Transaction ${refNum} (${data.operator.toUpperCase()}) enregistrée et mise en attente ! Transmise au Gestionnaire pour validation avec photo de preuve.`,
      transaction: newTx,
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

    eventBus.publish(
      'TRANSACTION_CANCELLED',
      currentUser.nodeId,
      currentUser.role,
      `[ADMIN OVERRIDE] Transaction ${transactionId} annulée par Admin (${currentUser.name}). Motif: ${reason}`
    );

    // Sync backend
    api.transactions.cancel(transactionId, reason, currentUser.name).catch(() => null);

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

      return { success: true, message: res?.message || 'Flotte réapprovisionnée avec succès !' };
    } catch (err: any) {
      setAccountBalances((prev) =>
        prev.map((a) =>
          a.id === accountId
            ? { ...a, balance: a.balance + amount, lastUpdated: new Date().toISOString() }
            : a
        )
      );
      return { success: true, message: 'Réapprovisionnement appliqué localement.' };
    }
  };

  const addUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.users.create(userData);
      if (res && res.user) {
        const createdUser = res.user;
        setAvailableUsers((prev) => [...prev, createdUser]);
        
        // Add default permissions entry
        const defaultServices: OperatorCode[] = 
          createdUser.role === 'agent_haiti' ? ['natcash', 'natcom'] :
          createdUser.role === 'gestionnaire' ? ['moncash', 'digicel', 'claro', 'altice'] :
          createdUser.role === 'agent_rd' ? ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom'] :
          ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice'];

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
        
        setPermissions((prev) => [...prev, newPerm]);
        eventBus.publish('USER_CREATED', currentUser.nodeId, currentUser.role, `Nouvel utilisateur créé: ${createdUser.name} (@${createdUser.username || ''})`);
        return { success: true, message: `Utilisateur ${createdUser.name} créé avec succès dans la base de données !` };
      }
    } catch (err: any) {
      console.warn('API users.create error, fallback mode local:', err);
    }

    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newUserId,
    };
    
    setAvailableUsers((prev) => [...prev, newUser]);
    
    // Add default permissions entry
    const localServices: OperatorCode[] = 
      newUser.role === 'agent_haiti' ? ['natcash', 'natcom'] :
      newUser.role === 'gestionnaire' ? ['moncash', 'digicel', 'claro', 'altice'] :
      newUser.role === 'agent_rd' ? ['moncash', 'digicel', 'claro', 'altice', 'natcash', 'natcom'] :
      ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice'];

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
    
    setPermissions((prev) => [...prev, newPerm]);
    
    eventBus.publish('USER_CREATED', currentUser.nodeId, currentUser.role, `Nouvel utilisateur créé: ${newUser.name} (${newUser.role})`);
    return { success: true, message: `Utilisateur ${newUser.name} créé avec succès (mode local) !` };
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
        if (res.user) {
          localStorage.setItem('dalexis_user', JSON.stringify(res.user));
          setCurrentUser(res.user);
        }
        setIsAuthenticated(true);
        return { success: true, message: 'Connexion réussie !' };
      }
      return { success: false, message: 'Identifiants invalides.' };
    } catch (err: any) {
      // Mode de secours local (fallback démo) si backend déconnecté ou mot de passe démo
      const input = identifierOrEmail.trim().toLowerCase();
      const cleanInput = input.replace(/^@/, '');
      const found = availableUsers.find(
        (u) =>
          u.email.toLowerCase() === input ||
          u.email.toLowerCase() === cleanInput ||
          (u.username && (u.username.toLowerCase() === input || u.username.toLowerCase() === cleanInput))
      );
      if (found && password === 'dalexis123') {
        localStorage.setItem('dalexis_token', `demo_token_${found.id}`);
        localStorage.setItem('dalexis_user', JSON.stringify(found));
        setCurrentUser(found);
        setIsAuthenticated(true);
        return { success: true, message: 'Connexion réussie (Session locale).' };
      }
      return { success: false, message: err.message || 'Identifiants invalides.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('dalexis_token');
    localStorage.removeItem('dalexis_user');
    setIsAuthenticated(false);
    setCurrentUser(INITIAL_USERS[0]);
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
        currentLang,
        setLanguage,
        t,
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
