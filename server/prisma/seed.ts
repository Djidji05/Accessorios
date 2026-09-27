import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Nettoyage complet et réinitialisation de la base de données D\'Alexis Transferencia...');

  // 1. Nettoyage
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.accountBalance.deleteMany();
  await prisma.killSwitch.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync('dalexis123', 10);

  // 2. Utilisateurs (Seulement les Administrateurs)
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
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 3. Permissions (Admin Only)
  const permissions = [
    {
      userId: 'cmtyvnlg40000d2uvmaf3szds',
      userName: 'Noel Djivensly',
      role: 'admin',
      servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice']),
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
      servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice']),
      maxSingleTransactionDOP: 1000000,
      canCancelTransaction: true,
      canManageKillSwitch: true,
      canViewTreasury: true,
      canEditRates: true,
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

  // 5. Trésorerie & Soldes Flottes (Tous les compteurs à 0)
  const balances = [
    {
      id: 'bal_moncash',
      operator: 'moncash',
      name: 'Flotte Float MonCash (Digicel HT)',
      balance: 0,
      currency: 'HTG',
      accountNumber: 'MC-HT-88401',
      status: 'optimal',
    },
    {
      id: 'bal_natcash',
      operator: 'natcash',
      name: 'Solde Natcash Agent (Natcom HT)',
      balance: 0,
      currency: 'HTG',
      accountNumber: 'NC-HT-11204',
      status: 'optimal',
    },
    {
      id: 'bal_digicel',
      operator: 'digicel',
      name: 'Compte Bulk Top-Up Digicel',
      balance: 0,
      currency: 'DOP',
      accountNumber: 'DIGI-RD-90',
      status: 'optimal',
    },
    {
      id: 'bal_natcom',
      operator: 'natcom',
      name: 'Compte Direct Natcom Data',
      balance: 0,
      currency: 'HTG',
      accountNumber: 'NAT-HT-007',
      status: 'optimal',
    },
    {
      id: 'bal_bank_rd',
      operator: 'bank_rd',
      name: 'Banque Popular (RD Pesos)',
      balance: 0,
      currency: 'DOP',
      accountNumber: 'BPD-89240192',
      status: 'optimal',
    },
    {
      id: 'bal_cash_haiti',
      operator: 'cash_haiti',
      name: 'Caisse Décaissement (Port-au-Prince HTG)',
      balance: 0,
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

  console.log('✅ Base de données entièrement réinitialisée à 0 avec le compte Admin uniquement !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
