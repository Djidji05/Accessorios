import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('====================================================');
  console.log('🛡️ [Accessorio] Réinitialisation : Conservation Admin Uniquement');
  console.log('====================================================');

  // 1. Identifier ou assurer les comptes administrateurs
  let adminUsers = await prisma.user.findMany({
    where: { role: 'admin' },
  });

  if (adminUsers.length === 0) {
    console.log('⚠️ Aucun compte admin trouvé. Recréation des administrateurs par défaut...');
    const passwordHash = bcrypt.hashSync('dalexis123', 10);
    const defaultAdmins = [
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

    for (const a of defaultAdmins) {
      await prisma.user.upsert({
        where: { email: a.email },
        update: { role: 'admin' },
        create: a,
      });
    }

    adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });
  }

  const adminIds = adminUsers.map((u) => u.id);
  console.log(`🔒 Comptes administrateurs conservés (${adminUsers.length}) :`);
  adminUsers.forEach((a) => console.log(`   - ${a.name} (@${a.username || a.email}) [ADMIN]`));
  console.log('----------------------------------------------------');

  // 2. Supprimer tous les utilisateurs non-admins (agents, gestionnaires, etc.)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: { not: 'admin' },
    },
  });
  console.log(`🗑️  ${deletedUsers.count} compte(s) agent/utilisateur supprimé(s).`);

  // 3. Supprimer les permissions des utilisateurs supprimés
  const deletedPerms = await prisma.userPermission.deleteMany({
    where: {
      userId: { notIn: adminIds },
    },
  });
  console.log(`🗑️  ${deletedPerms.count} fiche(s) de permissions orphelines supprimée(s).`);

  // 4. Supprimer l'historique des commissions des agents supprimés
  await prisma.commissionRateHistory.deleteMany({
    where: {
      userId: { notIn: adminIds },
    },
  });

  // 5. Supprimer toutes les transactions
  const deletedTxs = await prisma.transaction.deleteMany();
  console.log(`🗑️  ${deletedTxs.count} transaction(s) supprimée(s).`);

  // 6. Supprimer tous les logs d'audit
  const deletedLogs = await prisma.auditLog.deleteMany();
  console.log(`🗑️  ${deletedLogs.count} journal/journaux d'audit supprimé(s).`);

  // 7. Remettre tous les soldes de trésorerie à 0
  const updatedBalances = await prisma.accountBalance.updateMany({
    data: {
      balance: 0,
      status: 'optimal',
      lastUpdated: new Date(),
    },
  });
  console.log(`🔄 ${updatedBalances.count} solde(s) de trésorerie remis à zéro (0.00).`);

  // 8. Assurer les permissions pour tous les admins conservés
  for (const admin of adminUsers) {
    await prisma.userPermission.upsert({
      where: { userId: admin.id },
      update: {
        servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice', 'zelle']),
        maxSingleTransactionDOP: 1000000,
        canCancelTransaction: true,
        canManageKillSwitch: true,
        canViewTreasury: true,
        canEditRates: true,
      },
      create: {
        userId: admin.id,
        userName: admin.name,
        role: 'admin',
        servicesAllowed: JSON.stringify(['moncash', 'natcash', 'digicel', 'natcom', 'claro', 'altice', 'zelle']),
        maxSingleTransactionDOP: 1000000,
        canCancelTransaction: true,
        canManageKillSwitch: true,
        canViewTreasury: true,
        canEditRates: true,
      },
    });
  }

  // 9. Assurer les 7 opérateurs Kill Switch (avec Zelle)
  const requiredKillSwitches = [
    { operator: 'moncash', serviceName: 'MonCash (Paiement & Transfert HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'natcash', serviceName: 'Natcash (Paiement & Cash-out HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'digicel', serviceName: 'Digicel (Recharge Téléphonique)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'natcom', serviceName: 'Natcom (Recharge & Data HT)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'claro', serviceName: 'Claro RD (Paiement Factures)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'altice', serviceName: 'Altice RD (Paiement & Recharges)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
    { operator: 'zelle', serviceName: 'Zelle USA (Paiement & Virement USD)', enabled: true, updatedBy: 'Alexis D\'Alexis' },
  ];

  for (const ks of requiredKillSwitches) {
    await prisma.killSwitch.upsert({
      where: { operator: ks.operator },
      update: { enabled: true, reason: null },
      create: ks,
    });
  }

  // 10. Audit log officiel marquant la réinitialisation
  await prisma.auditLog.create({
    data: {
      nodeId: 'node-admin-01',
      actorName: 'Alexis D\'Alexis (Admin)',
      actorRole: 'admin',
      action: 'SYSTEM_HARD_RESET',
      targetType: 'system',
      details: `Réinitialisation complète effectuée : tous les agents et transactions purgés. Seul(s) le(s) compte(s) admin (${adminUsers.map(a => a.name).join(', ')}) subsistent.`,
      nodeStatus: 'SYNCED',
      priority: 'Critical',
    },
  });

  console.log('----------------------------------------------------');
  console.log('✅ BASE DE DONNÉES ENTIÈREMENT NETTOYÉE !');
  console.log('   👤 Seuls les comptes administrateurs sont conservés.');
  console.log('   🧹 Toutes les transactions, logs et agents ont été supprimés.');
  console.log('   💰 Tous les soldes de flottes sont remis à 0.00.');
  console.log('   🟢 Tous les opérateurs (MonCash, Natcash, Zelle, etc.) sont actifs.');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du reset complet :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

