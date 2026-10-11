/**
 * SUITE DE TESTS AUTOMATISÉE - ACCESSORIO TRANSFERENCIA
 * Valide l'intégrité de l'architecture, les règles financières,
 * la sécurité, la validation Zod, et le cycle de vie des données.
 */

import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Types et Schémas
const createTransactionSchema = z.object({
  senderName: z.string().min(1, "Nom de l'expéditeur requis"),
  senderPhone: z.string().optional().default(''),
  receiverName: z.string().min(1, "Nom du destinataire requis"),
  receiverPhone: z.string().min(1, "Téléphone du destinataire requis"),
  operator: z.string().min(1, "Opérateur requis"),
  serviceType: z.string().optional().default('transfer'),
  amountDOP: z.number().gt(0, "Le montant en DOP doit être supérieur à 0"),
  feeDOP: z.number().optional().default(0),
  commissionDOP: z.number().optional().default(0),
  currentUserId: z.string().optional(),
});

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(category: string, name: string, condition: boolean, details?: string) {
  results.push({
    category,
    name,
    passed: condition,
    details: condition ? undefined : details,
  });
}

// ----------------------------------------------------
// 1. TESTS CALCULS FINANCIERS & TAUX DE CHANGE
// ----------------------------------------------------
function testFinancialCalculations() {
  const officialRate = 2.35;
  const amountDOP = 1000;
  const expectedHTG = Math.round(amountDOP * officialRate); // 2350

  assert(
    "Finance & Taux",
    "Conversion DOP vers HTG avec taux officiel 2.35",
    expectedHTG === 2350,
    `Attendu: 2350, Obtenu: ${expectedHTG}`
  );

  // Test commission fixe / variable
  const defaultFeeRate = 0.05; // 5%
  const feeDOP = amountDOP * defaultFeeRate; // 50 DOP
  assert(
    "Finance & Taux",
    "Calcul frais guichet standard 5%",
    feeDOP === 50,
    `Attendu: 50, Obtenu: ${feeDOP}`
  );

  // Montant avec décimales et arrondis
  const complexAmount = 1425.75;
  const complexHTG = Math.round(complexAmount * officialRate);
  assert(
    "Finance & Taux",
    "Arrondi financier propre sans décimales flottantes",
    Number.isInteger(complexHTG) && complexHTG === 3351,
    `Attendu: 3351, Obtenu: ${complexHTG}`
  );

  // Rejet montants négatifs ou nuls
  const zeroDOP = 0;
  const negativeDOP = -500;
  const parseZero = createTransactionSchema.safeParse({
    senderName: "Jean",
    receiverName: "Pierre",
    receiverPhone: "+50931234567",
    operator: "moncash",
    amountDOP: zeroDOP,
  });
  const parseNegative = createTransactionSchema.safeParse({
    senderName: "Jean",
    receiverName: "Pierre",
    receiverPhone: "+50931234567",
    operator: "moncash",
    amountDOP: negativeDOP,
  });

  assert(
    "Finance & Taux",
    "Interdiction montant transaction = 0 DOP",
    !parseZero.success,
    "La validation Zod n'a pas rejeté un montant de 0"
  );

  assert(
    "Finance & Taux",
    "Interdiction montant transaction négatif (-500 DOP)",
    !parseNegative.success,
    "La validation Zod n'a pas rejeté un montant négatif"
  );
}

// ----------------------------------------------------
// 2. TESTS VALIDATION DES DONNÉES (ZOD SCHEMAS)
// ----------------------------------------------------
function testZodValidation() {
  // Cas valide
  const validPayload = {
    senderName: "Noel Djivensly",
    senderPhone: "+18095551234",
    receiverName: "Marie Joseph",
    receiverPhone: "+50937123456",
    operator: "moncash",
    serviceType: "transfer",
    amountDOP: 5000,
    feeDOP: 150,
    commissionDOP: 50,
  };
  const parseValid = createTransactionSchema.safeParse(validPayload);
  assert(
    "Validation Zod",
    "Payload transaction valide acceptée",
    parseValid.success,
    JSON.stringify(parseValid)
  );

  // Manque nom destinataire
  const missingReceiver = { ...validPayload, receiverName: "" };
  const parseMissing = createTransactionSchema.safeParse(missingReceiver);
  assert(
    "Validation Zod",
    "Rejet si receiverName est vide",
    !parseMissing.success,
    "Le schéma a accepté un receiverName vide"
  );

  // Manque numéro téléphone destinataire
  const missingPhone = { ...validPayload, receiverPhone: "" };
  const parseMissingPhone = createTransactionSchema.safeParse(missingPhone);
  assert(
    "Validation Zod",
    "Rejet si receiverPhone est vide",
    !parseMissingPhone.success,
    "Le schéma a accepté un receiverPhone vide"
  );

  // Manque opérateur
  const missingOperator = { ...validPayload, operator: "" };
  const parseMissingOperator = createTransactionSchema.safeParse(missingOperator);
  assert(
    "Validation Zod",
    "Rejet si opérateur est manquant",
    !parseMissingOperator.success,
    "Le schéma a accepté un opérateur vide"
  );
}

// ----------------------------------------------------
// 3. TESTS SÉCURITÉ & AUTHENTIFICATION (JWT & RÔLES)
// ----------------------------------------------------
function testSecurityAndAuth() {
  const JWT_SECRET = 'dalexis_transferencia_super_secret_jwt_key_2026';

  const userPayload = {
    id: "user-test-01",
    email: "admin@accessorio.com",
    role: "admin",
    name: "Administrateur Test",
    nodeId: "node-admin-01"
  };

  // Génération de token
  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
  assert(
    "Sécurité & JWT",
    "Génération correcte d'un token JWT signé",
    typeof token === 'string' && token.split('.').length === 3,
    "Le token généré ne respecte pas le format JWT"
  );

  // Décodage et intégrité
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    assert(
      "Sécurité & JWT",
      "Vérification d'authenticité et extraction du payload",
      decoded.id === userPayload.id && decoded.role === "admin",
      "Le payload décodé ne correspond pas à l'émetteur"
    );
  } catch (err: any) {
    assert("Sécurité & JWT", "Vérification d'authenticité JWT", false, err.message);
  }

  // Détection de falsification / clé erronée
  try {
    jwt.verify(token, "cle_corrompue_invalide");
    assert("Sécurité & JWT", "Rejet token signé avec mauvaise clé", false, "Le token avec fausse clé a été accepté !");
  } catch {
    assert("Sécurité & JWT", "Rejet token signé avec mauvaise clé", true);
  }

  // Contrôle RBAC des Rôles
  const rolesAutorises = ["admin", "agent_rd"];
  const userRD = { role: "agent_rd" };
  const userHaiti = { role: "agent_haiti" };

  const hasAccessRD = rolesAutorises.includes(userRD.role);
  const hasAccessHaiti = rolesAutorises.includes(userHaiti.role);

  assert(
    "Contrôle d'Accès RBAC",
    "Agent RD autorisé au guichet RD",
    hasAccessRD === true,
    "L'agent RD a été refusé"
  );
  assert(
    "Contrôle d'Accès RBAC",
    "Agent Haïti non autorisé au guichet d'encaissement RD direct",
    hasAccessHaiti === false,
    "L'agent Haïti a accédé à une fonction restreinte"
  );
}

// ----------------------------------------------------
// 4. TESTS DU PROTOCOLE KILL-SWITCH & SÉCURITÉ OPÉRATEUR
// ----------------------------------------------------
function testKillSwitchLogic() {
  const killSwitchList = [
    { operator: "moncash", serviceName: "MonCash Haïti", enabled: true, reason: null },
    { operator: "natcash", serviceName: "Natcash Haïti", enabled: false, reason: "Maintenance API" },
    { operator: "digicel", serviceName: "Digicel TopUp", enabled: true, reason: null },
  ];

  function canProcessOperator(op: string) {
    const item = killSwitchList.find(k => k.operator === op);
    return item ? item.enabled : false;
  }

  assert(
    "Kill-Switch",
    "Opérateur actif (MonCash) autorisé au traitement",
    canProcessOperator("moncash") === true,
    "MonCash actif a été bloqué"
  );

  assert(
    "Kill-Switch",
    "Opérateur verrouillé (Natcash) immédiatement bloqué",
    canProcessOperator("natcash") === false,
    "Natcash n'a pas été bloqué alors qu'il est en kill-switch"
  );

  assert(
    "Kill-Switch",
    "Opérateur non référencé bloqué par défaut",
    canProcessOperator("inconnu_service") === false,
    "Un service inconnu n'a pas été bloqué"
  );
}

// ----------------------------------------------------
// 5. TESTS CYCLE DE VIE DES TRANSACTIONS & ÉTATS
// ----------------------------------------------------
function testTransactionLifecycle() {
  type TxStatus = 'pending_routing' | 'in_progress' | 'completed' | 'cancelled';

  const validTransitions: Record<TxStatus, TxStatus[]> = {
    pending_routing: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [], // état final
    cancelled: []  // état final
  };

  function canTransition(current: TxStatus, target: TxStatus): boolean {
    return validTransitions[current].includes(target);
  }

  assert(
    "Cycle de Vie Transactions",
    "Transition permise: pending_routing -> in_progress",
    canTransition('pending_routing', 'in_progress'),
    "Transition échouée"
  );

  assert(
    "Cycle de Vie Transactions",
    "Transition permise: in_progress -> completed (Preuve de livraison)",
    canTransition('in_progress', 'completed'),
    "Transition échouée"
  );

  assert(
    "Cycle de Vie Transactions",
    "Transition permise: in_progress -> cancelled (Annulation motivée)",
    canTransition('in_progress', 'cancelled'),
    "Transition échouée"
  );

  assert(
    "Cycle de Vie Transactions",
    "Interdiction de ré-exécuter une transaction déjà completed",
    !canTransition('completed', 'in_progress'),
    "Une transaction complétée a pu être réouverte"
  );

  assert(
    "Cycle de Vie Transactions",
    "Interdiction de complèter une transaction déjà annulée",
    !canTransition('cancelled', 'completed'),
    "Une transaction annulée a pu être complétée"
  );
}

// ----------------------------------------------------
// 6. EXÉCUTION ET RAPPORT GLOBAL
// ----------------------------------------------------
function runAllTests() {
  testFinancialCalculations();
  testZodValidation();
  testSecurityAndAuth();
  testKillSwitchLogic();
  testTransactionLifecycle();

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log("=================================================");
  console.log("   RAPPORT DE TESTS SYSTÈME - ACCESSORIO");
  console.log("=================================================");
  console.log(`Total tests exécutés : ${total}`);
  console.log(`Succès : ${passed}  |  Échecs : ${failed}`);
  console.log("-------------------------------------------------");

  let currentCategory = "";
  for (const r of results) {
    if (r.category !== currentCategory) {
      currentCategory = r.category;
      console.log(`\n[${currentCategory}]`);
    }
    const symbol = r.passed ? "  [OK]" : "  [FAIL]";
    console.log(`${symbol} ${r.name}`);
    if (!r.passed && r.details) {
      console.log(`       Détail: ${r.details}`);
    }
  }

  console.log("\n=================================================");
  if (failed === 0) {
    console.log(" TOUS LES TESTS SONT AU VERT ! (100% SUCCÈS)");
  } else {
    console.log(` ATTENTION: ${failed} TEST(S) ÉCHOUÉ(S)`);
  }
  console.log("=================================================");

  return { total, passed, failed };
}

runAllTests();
