export type Language = 'FR' | 'HT' | 'ES';

export interface Translations {
  // Navigation & General
  nav_dashboard: string;
  nav_guichet: string;
  nav_tasks: string;
  nav_notifications: string;
  nav_treasury: string;
  nav_history: string;
  nav_settlements: string;
  nav_users: string;
  nav_kill_switch: string;
  nav_audit_logs: string;
  nav_settings: string;
  logout: string;

  // Header & Tools
  search_placeholder: string;
  rate_label: string;
  edit: string;
  node_connected: string;
  node_offline: string;
  recharge: string;
  export: string;
  language_name: string;

  // Dashboard & Metrics Page
  hello: string;
  operational_portal: string;
  global_transactions: string;
  global_volume: string;
  admin_commissions: string;
  network_activity: string;
  in_cash: string;
  settled: string;
  in_progress_count: string;
  trend_volume_7d: string;
  filter_activity: string;
  events: string;
  today: string;
  yesterday: string;
  this_week: string;

  // Guichet / Counter
  sender_info: string;
  sender_name: string;
  sender_phone: string;
  receiver_info: string;
  receiver_name: string;
  receiver_phone: string;
  service_selection: string;
  amount_dop: string;
  received_htg: string;
  fees: string;
  total_dop: string;
  validate_transaction: string;
  counter_rd_title: string;

  // Task Queue
  task_queue_title: string;
  pending: string;
  in_progress: string;
  completed: string;
  cancelled: string;
  upload_proof: string;
  confirm_completion: string;
  reassign: string;

  // Treasury
  treasury_title: string;
  treasury_subtitle: string;
  how_to_read: string;
  gross_revenue: string;
  admin_commissions_enc: string;
  guichet_fees: string;
  optimal_status: string;
  low_status: string;
  critical_status: string;

  // Auth & Receipt
  login_title: string;
  login_subtitle: string;
  identifier_placeholder: string;
  password_placeholder: string;
  connect: string;
  receipt_title: string;
  print_receipt: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  FR: {
    // Navigation
    nav_dashboard: "Tableau de bord",
    nav_guichet: "Nouvelle Transaction",
    nav_tasks: "File d'attente Tâches",
    nav_notifications: "Notifications",
    nav_treasury: "Trésorerie & Solde",
    nav_history: "Historique Transactions",
    nav_settlements: "Versements Hebdo",
    nav_users: "Gestion Utilisateurs",
    nav_kill_switch: "Arrêt d'Urgence",
    nav_audit_logs: "Journal d'Audit",
    nav_settings: "Paramètres",
    logout: "Se déconnecter",

    // Header
    search_placeholder: "Rechercher une opération...",
    rate_label: "Taux officiel",
    edit: "Éditer",
    node_connected: "Nœud Connecté",
    node_offline: "Mode Hors-ligne",
    recharge: "Réapprovisionner",
    export: "Exporter",
    language_name: "Français",

    // Dashboard
    hello: "Bonjour",
    operational_portal: "Portail Opérationnel",
    global_transactions: "Transactions Globales",
    global_volume: "Volume Global (DOP)",
    admin_commissions: "Commissions Admin (DOP)",
    network_activity: "ACTIVITÉ RÉSEAU EN TEMPS RÉEL",
    in_cash: "100% en caisse sur le réseau",
    settled: "soldée(s)",
    in_progress_count: "en cours",
    trend_volume_7d: "Tendance du Volume de Transactions (7 derniers jours)",
    filter_activity: "Filtrer l'activité (nom, réf, agent)...",
    events: "événements",
    today: "Aujourd'hui",
    yesterday: "Hier",
    this_week: "Semaine",

    // Guichet
    sender_info: "Informations Expéditeur (RD)",
    sender_name: "Nom complet de l'expéditeur",
    sender_phone: "Téléphone de l'expéditeur",
    receiver_info: "Informations Destinataire (Haïti/RD)",
    receiver_name: "Nom complet du destinataire",
    receiver_phone: "Téléphone du destinataire",
    service_selection: "Sélection de l'opérateur",
    amount_dop: "Montant à envoyer (DOP)",
    received_htg: "Montant reçu (HTG)",
    fees: "Frais de service (3%)",
    total_dop: "Total à payer au guichet",
    validate_transaction: "Valider & Enregistrer l'opération",
    counter_rd_title: "Saisie d'Opération au Guichet (RD)",

    // Task Queue
    task_queue_title: "File d'attente des tâches numériques",
    pending: "En attente",
    in_progress: "En cours",
    completed: "Clôturée / Validée",
    cancelled: "Annulée",
    upload_proof: "Téléverser la preuve SMS / Reçu",
    confirm_completion: "Certifier & Clôturer la tâche",
    reassign: "Réattribuer la tâche",

    // Treasury
    treasury_title: "Trésorerie & Solde des Comptes",
    treasury_subtitle: "Suivi des réserves bancaires en Pesos (RD), Gourdes (Haïti) et Dollars (Zelle).",
    how_to_read: "Comment lire cette page facilement ?",
    gross_revenue: "Revenu Brut Total Agence",
    admin_commissions_enc: "Commissions Admin Encaissées",
    guichet_fees: "Frais de Service Guichet (3%)",
    optimal_status: "Optimal",
    low_status: "Seuil Bas",
    critical_status: "Critique",

    // Auth & Receipt
    login_title: "Connexion au Système",
    login_subtitle: "Portail sécurisé réservé aux agents autorisés",
    identifier_placeholder: "Email ou nom d'utilisateur",
    password_placeholder: "Mot de passe",
    connect: "Se connecter",
    receipt_title: "Reçu Officiel de Transaction",
    print_receipt: "Reçu (PDF / Partager)",
    close: "Fermer",
  },

  HT: {
    // Navigation
    nav_dashboard: "Tablo de bò",
    nav_guichet: "Nouvo Tranzaksyon",
    nav_tasks: "Fil d'Atant Tach",
    nav_notifications: "Notifikasyon yo",
    nav_treasury: "Trezo ak Balans",
    nav_history: "Istwa Tranzaksyon yo",
    nav_settlements: "Vèsman pa Semèn",
    nav_users: "Jeston Itilizatè",
    nav_kill_switch: "Blokaj d'Ijans",
    nav_audit_logs: "Lòg Audit yo",
    nav_settings: "Paramèt yo",
    logout: "Dekonekte",

    // Header
    search_placeholder: "Chèche yon operasyon...",
    rate_label: "Tays ofisyèl",
    edit: "Modifye",
    node_connected: "Nwl Konekte",
    node_offline: "Mòd Mòt / Sòti Rezo",
    recharge: "Rechaje trezo",
    export: "Ekspòte",
    language_name: "Kreyòl",

    // Dashboard
    hello: "Bonjou",
    operational_portal: "Pòtay Operasyonèl",
    global_transactions: "Tranzaksyon Global yo",
    global_volume: "Volim Global (DOP)",
    admin_commissions: "Komisyon Admin (DOP)",
    network_activity: "AKTIVITE REZO AN TAN LEYÈL",
    in_cash: "100% nan kes sou rezo a",
    settled: "peye",
    in_progress_count: "an kou",
    trend_volume_7d: "Tandans Volim Tranzaksyon yo (7 dènye jou)",
    filter_activity: "Filtre aktivite a (non, ref, ajan)...",
    events: "evènman",
    today: "Jodi a",
    yesterday: "Yè",
    this_week: "Semèn sa a",

    // Guichet
    sender_info: "Enfòmasyon Moun k ap Voye a (RD)",
    sender_name: "Non konplè moun k ap voye a",
    sender_phone: "Nimewo telefòn moun k ap voye a",
    receiver_info: "Enfòmasyon Moun k ap Resevwa a (Ayiti/RD)",
    receiver_name: "Non konplè moun k ap resevwa a",
    receiver_phone: "Nimewo telefòn moun k ap resevwa a",
    service_selection: "Chwazi operatè a",
    amount_dop: "Montan pou voye a (DOP)",
    received_htg: "Montan k ap resevwa a (HTG)",
    fees: "Fristè sèvis (3%)",
    total_dop: "Total pou peye nan gichè a",
    validate_transaction: "Valide epi Anrejistre operasyon an",
    counter_rd_title: "Saisizyon Operasyon nan Gichè a (RD)",

    // Task Queue
    task_queue_title: "Fil d'atant tach dijital yo",
    pending: "An atant",
    in_progress: "An kou",
    completed: "Fèmen / Valide",
    cancelled: "Anile",
    upload_proof: "Mete prèv SMS / Resi a",
    confirm_completion: "Sètifye epi Fèmen tach la",
    reassign: "Mete sou yon lòt moun",

    // Treasury
    treasury_title: "Trezo ak Balans Kont yo",
    treasury_subtitle: "Swivi rezèv an Pèso (RD), Goud (Ayiti) ak Dola (Zelle).",
    how_to_read: "Ki jan pou w li paj sa a fasilman?",
    gross_revenue: "Revenu Brijal Agans lan",
    admin_commissions_enc: "Komisyon Admin Ki Rantre",
    guichet_fees: "Fristè Sèvis Gichè (3%)",
    optimal_status: "Optimal",
    low_status: "Nivo Ba",
    critical_status: "Kritik",

    // Auth & Receipt
    login_title: "Koneksyon nan Sistèm nan",
    login_subtitle: "Pòtay ansekirite pou ajan otorize yo sèlman",
    identifier_placeholder: "Imèl oswa non itilizatè",
    password_placeholder: "Mots de pas",
    connect: "Konekte",
    receipt_title: "Resi Ofisyèl Tranzaksyon",
    print_receipt: "Resi (PDF / Pataje)",
    close: "Fèmen",
  },

  ES: {
    // Navigation
    nav_dashboard: "Panel de Control",
    nav_guichet: "Nueva Transacción",
    nav_tasks: "Cola de Tareas",
    nav_notifications: "Notificaciones",
    nav_treasury: "Tesorería y Saldos",
    nav_history: "Historial de Transacciones",
    nav_settlements: "Liquidaciones Semanales",
    nav_users: "Gestión de Usuarios",
    nav_kill_switch: "Control de Emergencia",
    nav_audit_logs: "Registros de Auditoría",
    nav_settings: "Configuración",
    logout: "Cerrar Sesión",

    // Header
    search_placeholder: "Buscar una operación...",
    rate_label: "Tasa Oficial",
    edit: "Editar",
    node_connected: "Nodo Conectado",
    node_offline: "Modo Fuera de Línea",
    recharge: "Reabastecer",
    export: "Exportar",
    language_name: "Español",

    // Dashboard
    hello: "Hola",
    operational_portal: "Portal Operativo",
    global_transactions: "Transacciones Globales",
    global_volume: "Volumen Global (DOP)",
    admin_commissions: "Comisiones Admin (DOP)",
    network_activity: "ACTIVIDAD DE RED EN TIEMPO REAL",
    in_cash: "100% en caja en la red",
    settled: "saldada(s)",
    in_progress_count: "en proceso",
    trend_volume_7d: "Tendencia del Volumen de Transacciones (Últimos 7 días)",
    filter_activity: "Filtrar actividad (nombre, ref, agente)...",
    events: "eventos",
    today: "Hoy",
    yesterday: "Ayer",
    this_week: "Semana",

    // Guichet
    sender_info: "Información del Remitente (RD)",
    sender_name: "Nombre completo del remitente",
    sender_phone: "Teléfono del remitente",
    receiver_info: "Información del Destinatario (Haití/RD)",
    receiver_name: "Nombre completo del destinatario",
    receiver_phone: "Teléfono del destinatario",
    service_selection: "Selección del operador",
    amount_dop: "Monto a enviar (DOP)",
    received_htg: "Monto a recibir (HTG)",
    fees: "Tarifa de servicio (3%)",
    total_dop: "Total a pagar en ventanilla",
    validate_transaction: "Validar y Registrar operación",
    counter_rd_title: "Operaciones en Ventanilla (RD)",

    // Task Queue
    task_queue_title: "Cola de tareas digitales",
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completada / Validada",
    cancelled: "Cancelada",
    upload_proof: "Subir comprobante SMS / Recibo",
    confirm_completion: "Certificar y Cerrar tarea",
    reassign: "Reasignar tarea",

    // Treasury
    treasury_title: "Tesorería y Saldo de Cuentas",
    treasury_subtitle: "Seguimiento de reservas en Pesos (RD), Gourdes (Haití) y Dólares (Zelle).",
    how_to_read: "¿Cómo leer esta página fácilmente?",
    gross_revenue: "Ingresos Brutos Totales",
    admin_commissions_enc: "Comisiones Admin Cobradas",
    guichet_fees: "Tarifas de Servicio Ventanilla (3%)",
    optimal_status: "Óptimo",
    low_status: "Nivel Bajo",
    critical_status: "Crítico",

    // Auth & Receipt
    login_title: "Iniciar Sesión en el Sistema",
    login_subtitle: "Portal seguro exclusivo para agentes autorizados",
    identifier_placeholder: "Correo o nombre de usuario",
    password_placeholder: "Contraseña",
    connect: "Iniciar sesión",
    receipt_title: "Recibo Oficial de Transacción",
    print_receipt: "Recibo (PDF / Compartir)",
    close: "Cerrar",
  },
};
