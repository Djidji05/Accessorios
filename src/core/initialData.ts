import { User, Transaction, AccountBalance, KillSwitchItem, UserPermissionMatrix, AuditLog, WeeklySettlement, ServiceCommissionConfig, OperatorCommissionConfig } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'cmtyvnlg40000d2uvmaf3szds',
    name: 'Noel Djivensly',
    username: 'ndjidji',
    email: 'ndjivensly@gmail.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    location: 'Direction Générale Santo Domingo',
    nodeId: 'node-admin-01',
    status: 'online',
    commissionRate: 0,
  },
  {
    id: 'usr_admin',
    name: 'Alexis D\'Alexis',
    username: 'alexis',
    email: 'alexis@dalexistransfer.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Siège Santo Domingo (RD)',
    nodeId: 'node-admin-02',
    status: 'online',
    commissionRate: 0,
  },
];

export const INITIAL_KILL_SWITCH: KillSwitchItem[] = [
  {
    operator: 'moncash',
    serviceName: 'MonCash (Paiement & Transfert HT)',
    enabled: true,
    updatedBy: 'Alexis D\'Alexis',
    updatedAt: new Date().toISOString(),
  },
  {
    operator: 'natcash',
    serviceName: 'Natcash (Paiement & Cash-out HT)',
    enabled: true,
    updatedBy: 'Alexis D\'Alexis',
    updatedAt: new Date().toISOString(),
  },
  {
    operator: 'digicel',
    serviceName: 'Digicel (Recharge Téléphonique)',
    enabled: true,
    updatedBy: 'Alexis D\'Alexis',
    updatedAt: new Date().toISOString(),
  },
  {
    operator: 'natcom',
    serviceName: 'Natcom (Recharge & Data HT)',
    enabled: true,
    updatedBy: 'Alexis D\'Alexis',
    updatedAt: new Date().toISOString(),
  },
  {
    operator: 'claro',
    serviceName: 'Claro (Recharge RD)',
    enabled: true,
    updatedBy: 'Alexis D\'Alexis',
    updatedAt: new Date().toISOString(),
  },
  {
    operator: 'altice',
    serviceName: 'Altice (Recharge RD)',
    enabled: true,
    updatedBy: 'Alexis D\'Alexis',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BALANCES: AccountBalance[] = [
  {
    id: 'bal_moncash',
    operator: 'moncash',
    name: 'Flotte Float MonCash (Digicel HT)',
    balance: 0,
    currency: 'HTG',
    accountNumber: 'MC-HT-88401',
    lastUpdated: new Date().toISOString(),
    status: 'optimal',
  },
  {
    id: 'bal_natcash',
    operator: 'natcash',
    name: 'Solde Natcash Agent (Natcom HT)',
    balance: 0,
    currency: 'HTG',
    accountNumber: 'NC-HT-11204',
    lastUpdated: new Date().toISOString(),
    status: 'optimal',
  },
  {
    id: 'bal_digicel',
    operator: 'digicel',
    name: 'Compte Bulk Top-Up Digicel',
    balance: 0,
    currency: 'DOP',
    accountNumber: 'DIGI-RD-90',
    lastUpdated: new Date().toISOString(),
    status: 'optimal',
  },
  {
    id: 'bal_natcom',
    operator: 'natcom',
    name: 'Compte Direct Natcom Data',
    balance: 0,
    currency: 'HTG',
    accountNumber: 'NAT-HT-007',
    lastUpdated: new Date().toISOString(),
    status: 'optimal',
  },
  {
    id: 'bal_bank_rd',
    operator: 'bank_rd',
    name: 'Banque Popular (RD Pesos)',
    balance: 0,
    currency: 'DOP',
    accountNumber: 'BPD-89240192',
    lastUpdated: new Date().toISOString(),
    status: 'optimal',
  },
  {
    id: 'bal_cash_haiti',
    operator: 'cash_haiti',
    name: 'Caisse Décaissement (Port-au-Prince HTG)',
    balance: 0,
    currency: 'HTG',
    accountNumber: 'CASH-HT-01',
    lastUpdated: new Date().toISOString(),
    status: 'optimal',
  },
];

export const INITIAL_PERMISSIONS: UserPermissionMatrix[] = [
  {
    userId: 'cmtyvnlg40000d2uvmaf3szds',
    userName: 'Noel Djivensly',
    role: 'admin',
    servicesAllowed: ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice'],
    maxSingleTransactionDOP: 1000000,
    canCancelTransaction: true,
    canManageKillSwitch: true,
    canViewTreasury: true,
    canEditRates: true,
  },
  {
    userId: 'usr_admin',
    userName: 'Alexis D\'Alexis',
    role: 'admin',
    servicesAllowed: ['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice'],
    maxSingleTransactionDOP: 1000000,
    canCancelTransaction: true,
    canManageKillSwitch: true,
    canViewTreasury: true,
    canEditRates: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_SETTLEMENTS: WeeklySettlement[] = [];

export const INITIAL_SERVICE_COMMISSIONS: ServiceCommissionConfig[] = [
  {
    serviceType: 'transfer',
    serviceName: 'Transfert d\'Argent / Envoi Haïti',
    defaultFeeRate: 3.0,
    adminCommissionRate: 1.0,
    description: 'Envois de fonds vers la République d\'Haïti (MonCash, Natcash, Cash)'
  },
  {
    serviceType: 'cash_out',
    serviceName: 'Retrait d\'Espèces (Cash-Out Guichet)',
    defaultFeeRate: 2.5,
    adminCommissionRate: 1.0,
    description: 'Retrait en comptoir et agences partenaires'
  },
  {
    serviceType: 'topup_mobile',
    serviceName: 'Recharge Mobile & Data Télécom',
    defaultFeeRate: 2.0,
    adminCommissionRate: 1.5,
    description: 'Recharges téléphoniques (Digicel, Natcom, Claro, Altice)'
  },
  {
    serviceType: 'bill_payment',
    serviceName: 'Paiement de Factures & Services',
    defaultFeeRate: 1.5,
    adminCommissionRate: 0.8,
    description: 'Règlement de factures d\'eau, d\'électricité et services publics'
  }
];

export const INITIAL_OPERATOR_COMMISSIONS: OperatorCommissionConfig[] = [
  {
    operator: 'moncash',
    operatorName: 'MonCash (Digicel Haïti)',
    adminCommissionRate: 1.0,
    defaultFeeRate: 3.0,
    flatCommissionDOP: 0,
    currency: 'HTG / DOP',
    description: 'Transferts et paiements mobiles MonCash Haïti'
  },
  {
    operator: 'natcash',
    operatorName: 'Natcash (Natcom Haïti)',
    adminCommissionRate: 1.0,
    defaultFeeRate: 2.5,
    flatCommissionDOP: 0,
    currency: 'HTG / DOP',
    description: 'Portefeuille électronique et décaissement Natcash Haïti'
  },
  {
    operator: 'zelle',
    operatorName: 'Zelle (Transfert USD)',
    adminCommissionRate: 1.5,
    defaultFeeRate: 3.5,
    flatCommissionDOP: 0,
    currency: 'USD / DOP',
    description: 'Virements et transferts directs Zelle USA'
  },
  {
    operator: 'digicel',
    operatorName: 'Digicel (Recharge & Data)',
    adminCommissionRate: 2.0,
    defaultFeeRate: 2.0,
    flatCommissionDOP: 0,
    currency: 'HTG',
    description: 'Recharge minutes & forfaits internet Digicel Haïti'
  },
  {
    operator: 'natcom',
    operatorName: 'Natcom (Recharge & Data)',
    adminCommissionRate: 2.0,
    defaultFeeRate: 2.0,
    flatCommissionDOP: 0,
    currency: 'HTG',
    description: 'Recharge minutes & forfaits data Natcom Haïti'
  },
  {
    operator: 'claro',
    operatorName: 'Claro (Recharge R.D.)',
    adminCommissionRate: 2.5,
    defaultFeeRate: 2.0,
    flatCommissionDOP: 0,
    currency: 'DOP',
    description: 'Recharge téléphonique Claro République Dominicaine'
  },
  {
    operator: 'altice',
    operatorName: 'Altice (Recharge R.D.)',
    adminCommissionRate: 2.5,
    defaultFeeRate: 2.0,
    flatCommissionDOP: 0,
    currency: 'DOP',
    description: 'Recharge téléphonique Altice République Dominicaine'
  }
];
