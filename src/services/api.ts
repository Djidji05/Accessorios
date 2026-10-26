import { 
  User, 
  Transaction, 
  AccountBalance, 
  KillSwitchItem, 
  UserPermissionMatrix, 
  AuditLog, 
  OperatorCode, 
  ServiceType 
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Helper pour effectuer des requêtes fetch avec gestion d'erreurs
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dalexis_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Timeout de 12 secondes avec AbortController pour éviter les connexions bloquées HTTP/2
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('dalexis_token');
        window.dispatchEvent(new CustomEvent('dalexis_auth_unauthorized'));
      }
      throw new Error(data.error || `Erreur requête HTTP (${response.status})`);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new Error('Délai d\'attente dépassé (timeout 12s)');
    }
    throw err;
  }
}

export const api = {
  // 1. Healthcheck
  health: () => request<{ status: string; service: string }>('/health'),

  // 2. Authentification & Profil
  auth: {
    login: (identifier: string, password: string) => 
      request<{ success: boolean; token: string; user: User; permissions: UserPermissionMatrix | null }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: identifier, username: identifier, identifier, password }),
      }),
    getMe: () => request<{ user: User; permissions: UserPermissionMatrix | null }>('/auth/me'),
    getUsers: () => request<User[]>('/auth/users'),
  },

  // 3. Transactions & Guichet
  transactions: {
    getAll: async (params?: { status?: string; operator?: string; search?: string; limit?: number; page?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.operator) query.append('operator', params.operator);
      if (params?.search) query.append('search', params.search);
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.page) query.append('page', String(params.page));
      const qs = query.toString();
      const txs = await request<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`);
      const token = localStorage.getItem('dalexis_token');
      if (token && Array.isArray(txs)) {
        return txs.map(t => ({
          ...t,
          proofUrl: t.proofUrl && t.proofUrl.startsWith('/api/') && !t.proofUrl.includes('token=')
            ? `${t.proofUrl}?token=${encodeURIComponent(token)}`
            : t.proofUrl
        }));
      }
      return txs;
    },
    create: (data: {
      senderName: string;
      senderPhone: string;
      receiverName: string;
      receiverPhone: string;
      operator: OperatorCode;
      serviceType: ServiceType;
      amountDOP: number;
      feeDOP: number;
      commissionDOP: number;
      currentUserId?: string;
    }) => request<{ success: boolean; message: string; transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    complete: async (id: string, proofNotes: string, proofUrl?: string, actorName?: string) => {
      const res = await request<{ success: boolean; message: string; transaction: Transaction }>(`/transactions/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ proofNotes, proofUrl, actorName }),
      });
      const token = localStorage.getItem('dalexis_token');
      if (token && res?.transaction?.proofUrl && res.transaction.proofUrl.startsWith('/api/') && !res.transaction.proofUrl.includes('token=')) {
        res.transaction.proofUrl = `${res.transaction.proofUrl}?token=${encodeURIComponent(token)}`;
      }
      return res;
    },
    cancel: (id: string, reason: string, actorName?: string) =>
      request<{ success: boolean; message: string; transaction: Transaction }>(`/transactions/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason, actorName }),
      }),
    update: (id: string, fields: Partial<Transaction>) =>
      request<{ success: boolean; message: string; transaction: Transaction }>(`/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fields),
      }),
  },

  // 4. Trésorerie
  treasury: {
    getBalances: () => request<AccountBalance[]>('/treasury/balances'),
    recharge: (data: { accountId: string; amount: number; note?: string; actorName?: string }) =>
      request<{ success: boolean; message: string; account: AccountBalance }>('/treasury/recharge', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStats: (startDate?: string, endDate?: string) => {
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      const qs = query.toString();
      return request<{ count: number; totalVolumeDOP: number; totalVolumeHTG: number; totalFeesDOP: number }>(
        `/treasury/stats${qs ? `?${qs}` : ''}`
      );
    },
  },

  // 5. Kill-Switch Opérateurs
  killSwitch: {
    getAll: () => request<KillSwitchItem[]>('/kill-switch'),
    toggle: (operator: OperatorCode, reason?: string, actorName?: string) =>
      request<{ success: boolean; message: string; item: KillSwitchItem }>('/kill-switch/toggle', {
        method: 'POST',
        body: JSON.stringify({ operator, reason, actorName }),
      }),
  },

  // 6. Taux de change officiel
  rates: {
    get: () => request<{ baseCurrency: string; targetCurrency: string; rate: number }>('/rates').catch(() => ({ baseCurrency: 'DOP', targetCurrency: 'HTG', rate: 2.35 })),
    update: (rate: number, actorName?: string) =>
      request<{ success: boolean; message: string; rate: { rate: number } }>('/rates', {
        method: 'PUT',
        body: JSON.stringify({ rate, actorName }),
      }),
  },

  // 7. Logs d'audit
  audit: {
    getLogs: (params?: { targetType?: string; priority?: string }) => {
      const query = new URLSearchParams();
      if (params?.targetType) query.append('targetType', params.targetType);
      if (params?.priority) query.append('priority', params.priority);
      const qs = query.toString();
      return request<AuditLog[]>(`/audit-logs${qs ? `?${qs}` : ''}`).catch(() => []);
    },
  },

  // 8. Gestion des utilisateurs & permissions
  users: {
    getAll: () => request<{ users: User[]; permissions: UserPermissionMatrix[] }>('/users'),
    create: (data: Partial<User> & { password?: string }) =>
      request<{ success: boolean; message: string; user: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<User> & { password?: string }) =>
      request<{ success: boolean; message: string; user: User }>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    toggleStatus: (id: string) => request<{ success: boolean; status: 'online' | 'busy' | 'offline' }>(`/users/${id}/status`, {
      method: 'PATCH',
    }),
    updatePermissions: (id: string, permissions: Partial<UserPermissionMatrix>) =>
      request<{ success: boolean; permissions: UserPermissionMatrix }>(`/users/${id}/permissions`, {
        method: 'PATCH',
        body: JSON.stringify(permissions),
      }),
  },

  // 9. Notifications et Service Email
  email: {
    getStatus: () => request<{
      isConfigured: boolean;
      provider: 'resend' | 'smtp' | 'simulation';
      providerLabel: string;
      smtpHost: string;
      smtpPort: number;
      smtpSecure: boolean;
      smtpUser: string;
      hasSmtpPass: boolean;
      smtpFrom: string;
      hasResendKey: boolean;
      resendFrom: string;
      adminNotificationEmails: string[];
      slaEngine: { isRunning: boolean; trackedPendingCount: number };
      supportedLanguages: string[];
    }>('/email/status'),
    updateConfig: (data: {
      provider?: 'gmail' | 'resend' | 'smtp' | 'simulation';
      smtpHost?: string;
      smtpPort?: number;
      smtpSecure?: boolean;
      smtpUser?: string;
      smtpPass?: string;
      smtpFrom?: string;
      resendApiKey?: string;
      resendFrom?: string;
      adminNotificationEmails?: string | string[];
    }) => request<{ success: boolean; message: string; status: any }>('/email/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    verify: () => request<{ success: boolean; message: string }>('/email/verify', {
      method: 'POST',
    }),
    sendTest: (to: string, lang?: string) => request<{ success: boolean; simulated: boolean; message: string }>('/email/test', {
      method: 'POST',
      body: JSON.stringify({ to, lang }),
    }),
    triggerSlaCheck: () => request<{ success: boolean; message: string; details: any }>('/email/sla-check', {
      method: 'POST',
    }),
  },
};

