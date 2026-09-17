import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du peuplement de la base de données D\'Alexis Transferencia...');

  // 1. Nettoyage
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.accountBalance.deleteMany();
  await prisma.killSwitch.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync('dalexis123', 10);

  // 2. Utilisateurs
  const users = [
    {
      id: 'cmtyvnlg40000d2uvmaf3szds',
      name: 'Noel Djivensly',
      username: 'ndjidji',
      email: 'ndjivensly@gmail.com',
      password: passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      location: 'Direction Générale Santo Domingo',
      nodeId: 'node-admin-01',
      status: 'online',
    },
    {
      id: 'usr_admin',
      name: 'Alexis D\'Alexis',
      username: 'alexis',
      email: 'alexis@dalexistransfer.com',
      password: passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      location: 'Siège Santo Domingo (RD)',
      nodeId: 'node-admin-02',
      status: 'online',
    },
    {
      id: 'usr_agent_rd',
      name: 'Achmad Hakim',
      username: 'achmad',
      email: 'achmad.hakim@dalexistransfer.com',
      password: passwordHash,
      role: 'agent_rd',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      location: 'Agence Av. Independence (RD)',
      nodeId: 'node-agent-rd-01',
      status: 'online',
    },
    {
      id: 'usr_agent_haiti',
      name: 'Jean-Baptiste Joseph',
      username: 'jbjoseph',
      email: 'jb.joseph@dalexistransfer.ht',
      password: passwordHash,
      role: 'agent_haiti',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      location: 'Agence Delmas 33 (Haïti)',
      nodeId: 'node-agent-haiti-01',
      status: 'online',
    },
    {
      id: 'usr_gestionnaire',
      name: 'Marie-Claire Dupont',
      username: 'mcdupont',
      email: 'mc.dupont@dalexistransfer.com',
      password: passwordHash,
      role: 'gestionnaire',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      location: 'Centre de Gestion Télécom',
      nodeId: 'node-gestionnaire-01',
      status: 'online',
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 3. Permissions
  const permissions = [
    {
      userId: 'cmtyvnlg40000d2uvmaf3szds',
      userName: 'Noel Djivensly',
      role: 'admin',
      servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice']),
      maxSingleTransactionDOP: 500000,
      canCancelTransaction: true,
      canManageKillSwitch: true,
      canViewTreasury: true,
      canEditRates: true,
    },
    {
      userId: 'usr_admin',
      userName: 'Alexis D\'Alexis',
      role: 'admin',
      servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice']),
      maxSingleTransactionDOP: 500000,
      canCancelTransaction: true,
      canManageKillSwitch: true,
      canViewTreasury: true,
      canEditRates: true,
    },
    {
      userId: 'usr_agent_rd',
      userName: 'Achmad Hakim',
      role: 'agent_rd',
      servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice']),
      maxSingleTransactionDOP: 50000,
      canCancelTransaction: false,
      canManageKillSwitch: false,
      canViewTreasury: false,
      canEditRates: false,
    },
    {
      userId: 'usr_agent_haiti',
      userName: 'Jean-Baptiste Joseph',
      role: 'agent_haiti',
      servicesAllowed: JSON.stringify(['natcash', 'natcom']),
      maxSingleTransactionDOP: 100000,
      canCancelTransaction: false,
      canManageKillSwitch: false,
      canViewTreasury: false,
      canEditRates: false,
    },
    {
      userId: 'usr_gestionnaire',
      userName: 'Marie-Claire Dupont',
      role: 'gestionnaire',
      servicesAllowed: JSON.stringify(['moncash', 'digicel', 'claro', 'altice']),
      maxSingleTransactionDOP: 100000,
      canCancelTransaction: false,
      canManageKillSwitch: false,
      canViewTreasury: true,
      canEditRates: false,
    },
  ];

  for (const p of permissions) {
    await prisma.userPermission.create({ data: p });
  }

  // 4. Kill-Switch
  const killSwitches = [
    { operator: 'moncash', serviceName: 'MonCash (Paiement & Transfert HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'natcash', serviceName: 'Natcash (Paiement & Cash-out HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'digicel', serviceName: 'Digicel (Recharge Téléphonique)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'natcom', serviceName: 'Natcom (Recharge & Data HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'claro', serviceName: 'Claro RD (Paiement Factures)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'altice', serviceName: 'Altice RD (Paiement & Recharges)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  ];

  for (const ks of killSwitches) {
    await prisma.killSwitch.create({ data: ks });
  }

  // 5. Trésorerie & Soldes Flottes
  const balances = [
    {
      id: 'bal_moncash',
      operator: 'moncash',
      name: 'Flotte Float MonCash (Digicel HT)',
      balance: 485000,
      currency: 'HTG',
      accountNumber: 'MC-HT-88401',
      status: 'optimal',
    },
    {
      id: 'bal_natcash',
      operator: 'natcash',
      name: 'Solde Natcash Agent (Natcom HT)',
      balance: 620000,
      currency: 'HTG',
      accountNumber: 'NC-HT-11204',
      status: 'optimal',
    },
    {
      id: 'bal_digicel',
      operator: 'digicel',
      name: 'Compte Bulk Top-Up Digicel',
      balance: 145000,
      currency: 'DOP',
      accountNumber: 'DIGI-RD-90',
      status: 'optimal',
    },
    {
      id: 'bal_natcom',
      operator: 'natcom',
      name: 'Compte Direct Natcom Data',
      balance: 290000,
      currency: 'HTG',
      accountNumber: 'NAT-HT-007',
      status: 'optimal',
    },
    {
      id: 'bal_bank_rd',
      operator: 'bank_rd',
      name: 'Banque Popular (RD Pesos)',
      balance: 1250000,
      currency: 'DOP',
      accountNumber: 'BPD-89240192',
      status: 'optimal',
    },
    {
      id: 'bal_cash_haiti',
      operator: 'cash_haiti',
      name: 'Caisse Décaissement (Port-au-Prince HTG)',
      balance: 950000,
      currency: 'HTG',
      accountNumber: 'CASH-HT-01',
      status: 'optimal',
    },
  ];

  for (const b of balances) {
    await prisma.accountBalance.create({ data: b });
  }

  // 6. Taux de change officiel
  await prisma.exchangeRate.create({
    data: {
      id: 'rate_official',
      baseCurrency: 'DOP',
      targetCurrency: 'HTG',
      rate: 2.35,
      updatedBy: 'Alexis D\'Alexis',
    },
  });

  // 7. Transactions initiales
  const transactions = [
    {
      id: 'tx_8821',
      referenceNumber: '#TX-8821',
      senderName: 'Carlos Mendoza',
      senderPhone: '+1 809 555 0192',
      receiverName: 'Dieudonné Célestin',
      receiverPhone: '+509 3845 9012',
      operator: 'natcash',
      serviceType: 'cash_out',
      channel: 'haiti_cash',
      amountDOP: 19150,
      amountHTG: 45000,
      exchangeRate: 2.35,
      feeDOP: 550,
      commissionDOP: 180,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim (Agence Santo Domingo)',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-agent-haiti-01',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Jean-Baptiste Joseph',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1000 * 60 * 4), // 4 min ago
    },
    {
      id: 'tx_8819',
      referenceNumber: '#TX-8819',
      senderName: 'Maria Rodriguez',
      senderPhone: '+1 829 678 1234',
      receiverName: 'Marie Yolande Fleurival',
      receiverPhone: '+509 4602 1189',
      operator: 'natcash',
      serviceType: 'cash_out',
      channel: 'haiti_cash',
      amountDOP: 12000,
      amountHTG: 28200,
      exchangeRate: 2.35,
      feeDOP: 350,
      commissionDOP: 120,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim (Agence Santiago)',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-agent-haiti-01',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Jean-Baptiste Joseph',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1000 * 60 * 12), // 12 min ago
    },
    {
      id: 'tx_8814',
      referenceNumber: '#TX-8814',
      senderName: 'Jose Antonio Peña',
      senderPhone: '+1 809 234 5678',
      receiverName: 'Ronald Saint-Louis',
      receiverPhone: '+509 3219 4455',
      operator: 'natcom',
      serviceType: 'topup_mobile',
      channel: 'haiti_cash',
      amountDOP: 6000,
      amountHTG: 14100,
      exchangeRate: 2.35,
      feeDOP: 150,
      commissionDOP: 60,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim (Agence Santo Domingo)',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-agent-haiti-01',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Jean-Baptiste Joseph',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1000 * 60 * 18), // 18 min ago (>15m SLA alert)
    },
    {
      id: 'tx_8802',
      referenceNumber: '#TX-8802',
      senderName: 'Juan Castillo',
      senderPhone: '+1 809 789 0123',
      receiverName: 'Evens Pierre-Louis',
      receiverPhone: '+509 3901 2233',
      operator: 'natcash',
      serviceType: 'cash_out',
      channel: 'haiti_cash',
      amountDOP: 15000,
      amountHTG: 35250,
      exchangeRate: 2.35,
      feeDOP: 450,
      commissionDOP: 150,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim (Agence Santo Domingo)',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-agent-haiti-01',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Jean-Baptiste Joseph',
      status: 'completed',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      completedAt: new Date(Date.now() - 1000 * 60 * 105),
      proofNotes: 'Réf Natcash #NC-892144 - Quittance signée et décaissée en agence Delmas 33',
    },
    {
      id: 'tx_2319',
      referenceNumber: '#TX-2319',
      senderName: 'Carlos Mendoza',
      senderPhone: '+1 809 455 1290',
      receiverName: 'Jean Baptiste Pierre',
      receiverPhone: '+509 3721 8844',
      operator: 'natcash',
      serviceType: 'cash_out',
      channel: 'haiti_cash',
      amountDOP: 15000,
      amountHTG: 35250,
      exchangeRate: 2.35,
      feeDOP: 450,
      commissionDOP: 150,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-agent-haiti-01',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Jean-Baptiste Joseph',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: 'tx_2320',
      referenceNumber: '#TX-2320',
      senderName: 'Luisa Fernandez',
      senderPhone: '+1 829 444 8812',
      receiverName: 'Fabienne Desire',
      receiverPhone: '+509 4812 9001',
      operator: 'moncash',
      serviceType: 'transfer',
      channel: 'digital_telecom',
      amountDOP: 8500,
      amountHTG: 19975,
      exchangeRate: 2.35,
      feeDOP: 250,
      commissionDOP: 85,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-gestionnaire-01',
      assignedToRole: 'gestionnaire',
      assignedToName: 'Marie-Claire Dupont',
      status: 'completed',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      completedAt: new Date(Date.now() - 1000 * 60 * 30),
      proofNotes: 'MonCash Ref: #MC-9982410 - Validé',
    },
    {
      id: 'tx_2321',
      referenceNumber: '#TX-2321',
      senderName: 'Alexis D\'Alexis (Guichet)',
      senderPhone: '+1 809 999 1122',
      receiverName: 'Michel Salomon',
      receiverPhone: '+509 3102 7788',
      operator: 'digicel',
      serviceType: 'topup_mobile',
      channel: 'digital_telecom',
      amountDOP: 1200,
      amountHTG: 2820,
      exchangeRate: 2.35,
      feeDOP: 0,
      commissionDOP: 60,
      createdByNode: 'node-admin-01',
      createdByName: 'Alexis D\'Alexis',
      createdByRole: 'admin',
      isAdminNominalTrace: true,
      assignedToNode: 'node-gestionnaire-01',
      assignedToRole: 'gestionnaire',
      assignedToName: 'Marie-Claire Dupont',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      id: 'tx_2322',
      referenceNumber: '#TX-2322',
      senderName: 'Roberto Gomez',
      senderPhone: '+1 809 333 4567',
      receiverName: 'Sheila Noel',
      receiverPhone: '+509 4910 2233',
      operator: 'natcom',
      serviceType: 'topup_mobile',
      channel: 'haiti_cash',
      amountDOP: 2500,
      amountHTG: 5875,
      exchangeRate: 2.35,
      feeDOP: 50,
      commissionDOP: 75,
      createdByNode: 'node-agent-rd-01',
      createdByName: 'Achmad Hakim',
      createdByRole: 'agent_rd',
      isAdminNominalTrace: false,
      assignedToNode: 'node-agent-haiti-01',
      assignedToRole: 'agent_haiti',
      assignedToName: 'Jean-Baptiste Joseph',
      status: 'pending_routing',
      createdAt: new Date(Date.now() - 1000 * 60 * 180),
    },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }

  // 8. Logs d'audit
  const logs = [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      nodeId: 'node-admin-01',
      actorName: 'Alexis D\'Alexis (Admin)',
      actorRole: 'admin',
      action: 'ESPACE_GUICHET_SAISIE',
      targetType: 'transaction',
      details: 'Saisie directe d\'une recharge Digicel (#TX-2321) de 1,200 Pesos en tant qu\'Administrateur.',
      nodeStatus: 'ACK',
      priority: 'Medium',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      nodeId: 'node-agent-rd-01',
      actorName: 'Achmad Hakim',
      actorRole: 'agent_rd',
      action: 'CREATION_TRANSACTION',
      targetType: 'transaction',
      details: 'Création transaction Natcash (#TX-2319) de 15,000 Pesos -> Routé auto vers Agent Haïti.',
      nodeStatus: 'SYNCED',
      priority: 'High',
    },
  ];

  for (const l of logs) {
    await prisma.auditLog.create({ data: l });
  }

  console.log('✅ Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
