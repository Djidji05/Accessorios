export type Role = 'admin' | 'agent_rd' | 'agent_haiti' | 'gestionnaire';

export type OperatorCode = 'moncash' | 'natcash' | 'digicel' | 'natcom' | 'claro' | 'altice' | 'zelle';

export type ServiceType = 'cash_out' | 'transfer' | 'topup_mobile' | 'bill_payment';

export interface ServiceCommissionConfig {
  serviceType: ServiceType;
  serviceName: string;
  defaultFeeRate: number;        // Frais de service globaux (%)
  adminCommissionRate: number;   // Commission Admin (%)
  flatFeeDOP?: number;           // Frais fixe optionnel en DOP
  description?: string;
}

export interface OperatorCommissionConfig {
  operator: OperatorCode;
  operatorName: string;
  adminCommissionRate: number;   // Commission Admin (%)
  defaultFeeRate: number;        // Frais client globaux (%)
  flatCommissionDOP?: number;    // Commission / Frais fixe optionnel en DOP
  currency: string;
  description: string;
}

export type ChannelType = 'haiti_cash' | 'digital_telecom';

export type TransactionStatus = 'pending_routing' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: Role;
  avatar: string;
  location: string;
  nodeId: string;
  status: 'online' | 'busy' | 'offline';
  commissionRate?: number; // e.g. 1.0 (1%), 1.5 (1.5%), 3.0 (3%)
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  operator: OperatorCode;
  serviceType: ServiceType;
  channel: ChannelType;
  amountDOP: number;
  amountHTG: number;
  amountUSD?: number;
  exchangeRate: number; // e.g. 1 DOP = 2.30 HTG
  feeDOP: number;
  commissionDOP: number;
  
  // Distributed System Node Tracing
  createdByNode: string;
  createdByName: string;
  createdByRole: Role;
  isAdminNominalTrace: boolean;
  
  assignedToNode: string;
  assignedToRole: Role;
  assignedToName: string;
  
  proofUrl?: string;
  proofNotes?: string;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface AccountBalance {
  id: string;
  operator: OperatorCode | 'bank_rd' | 'cash_rd' | 'cash_haiti';
  name: string;
  balance: number;
  currency: 'DOP' | 'HTG' | 'USD';
  accountNumber?: string;
  lastUpdated: string;
  status: 'optimal' | 'low' | 'critical';
}

export interface KillSwitchItem {
  operator: OperatorCode;
  serviceName: string;
  enabled: boolean; // true = Active, false = Locked/Disabled
  reason?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface UserPermissionMatrix {
  userId: string;
  userName: string;
  role: Role;
  servicesAllowed: OperatorCode[];
  maxSingleTransactionDOP: number;
  canCancelTransaction: boolean;
  canManageKillSwitch: boolean;
  canViewTreasury: boolean;
  canEditRates: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  nodeId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetType: 'transaction' | 'kill_switch' | 'permission' | 'treasury' | 'user' | 'system';
  details: string;
  nodeStatus: 'ACK' | 'SYNCED' | 'DISPATCHED';
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface WeeklyDepositRecord {
  id: string;
  amount: number;
  date: string;
  note: string;
  recordedBy: string;
}

export interface WeeklySettlement {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: Role;
  weekLabel: string; // e.g. "Semaine 37 (07/09 - 13/09/2026)"
  startDate: string;
  endDate: string;
  currency: 'DOP' | 'HTG';
  
  totalCollected: number;      // Total encaissé / géré par l'agent
  totalCommission: number;     // Commissions gagnées selon le %
  netAmountToPay: number;      // Montant net à reverser = totalCollected - totalCommission
  
  amountDeposited: number;     // Montant saisi/enregistré par l'Admin
  remainingBalance: number;    // Reste à payer = netAmountToPay - amountDeposited
  
  status: 'paid' | 'partial' | 'pending'; // 'paid' = Tout payé, 'partial' = Reste à payer, 'pending' = Aucun versement
  
  deposits: WeeklyDepositRecord[];
}

export type ActiveTab = 
  | 'overview' 
  | 'tasks' 
  | 'notifications'
  | 'treasury' 
  | 'history'
  | 'guichet' 
  | 'settlements'
  | 'users' 
  | 'user_list'
  | 'create_user'
  | 'permissions_matrix'
  | 'kill_switch' 
  | 'audit_logs' 
  | 'settings'
  | 'help';

