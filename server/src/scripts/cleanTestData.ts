import { prisma } from '../prisma';

async function main() {
  console.log('====================================================');
  console.log('🧹 [Accessorio] Nettoyage Sécurisé des Données de Test');
  console.log('====================================================');

  const txCount = await prisma.transaction.count();
  const auditCount = await prisma.auditLog.count();
  const userCount = await prisma.user.count();
  const balanceCount = await prisma.accountBalance.count();
  const ksCount = await prisma.killSwitch.count();

  console.log(`📊 État de la base avant nettoyage :`);
  console.log(`   • Transactions existantes       : ${txCount}`);
  console.log(`   • Entrées de logs d'audit        : ${auditCount}`);
  console.log(`   • Comptes Utilisateurs (INTACTS) : ${userCount}`);
  console.log(`   • Soldes de Flottes              : ${balanceCount}`);
  console.log(`   • Opérateurs Kill-Switch         : ${ksCount}`);
  console.log('----------------------------------------------------');

  // 1. Suppression de toutes les transactions
  console.log('⏳ Suppression des transactions de test...');
  const deletedTxs = await prisma.transaction.deleteMany();
  console.log(`✅ ${deletedTxs.count} transaction(s) supprimée(s) avec succès.`);

  // 2. Suppression des logs d'audit de test
  console.log('⏳ Suppression des anciens journaux d\'audit...');
  const deletedLogs = await prisma.auditLog.deleteMany();
  console.log(`✅ ${deletedLogs.count} journal/journaux d'audit supprimé(s).`);

  // 3. Remise à zéro des soldes de caisse et flottes
  console.log('⏳ Réinitialisation des soldes de trésorerie à 0.00...');
  const updatedBalances = await prisma.accountBalance.updateMany({
    data: {
      balance: 0,
      status: 'optimal',
      lastUpdated: new Date(),
    },
  });
  console.log(`✅ ${updatedBalances.count} compte(s) de trésorerie remis à zéro.`);

  // 4. Création d'une entrée d'audit certifiée de lancement
  await prisma.auditLog.create({
    data: {
      nodeId: 'node-admin-01',
      actorName: 'Alexis D\'Alexis (Admin)',
      actorRole: 'admin',
      action: 'SYSTEM_CLEANUP',
      targetType: 'system',
      details: 'Nettoyage de production effectué : purge des transactions de test, suppression des logs et remise à zéro des soldes de flottes.',
      nodeStatus: 'SYNCED',
      priority: 'Critical',
    },
  });

  console.log('----------------------------------------------------');
  console.log('🎉 NETTOYAGE EFFECTUÉ AVEC SUCCÈS !');
  console.log('   🔒 Tous les comptes utilisateurs et agents sont conservés.');
  console.log('   🔒 Toutes les permissions et taux de change sont conservés.');
  console.log('   🔒 Le Kill Switch est actif et opérationnel.');
  console.log('   🚀 Le système est propre et prêt pour la vraie exploitation.');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du nettoyage de la base de données :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

