export type Language = 'FR' | 'HT' | 'ES';

export interface Translations {
  // Navigation & General
  nav_overview: string;
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
  space_guichet_rd: string;
  my_transactions_day: string;
  tracking_receipts: string;
  settlements_liquidations: string;
  balance_admin_deposits: string;
  haiti_queue: string;
  haiti_disbursements: string;
  receipts_proofs: string;
  mobile_action_center: string;
  digital_flows_mgmt: string;
  admin_security: string;
  ops_flows: string;
  sub_user_list: string;
  sub_create_user: string;

  // Header & Tools
  search_placeholder: string;
  rate_label: string;
  edit: string;
  node_connected: string;
  node_offline: string;
  recharge: string;
  export: string;
  language_name: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  copy: string;
  copied: string;
  close: string;
  back: string;
  view_all: string;
  details: string;
  filter: string;
  all: string;
  active: string;
  suspended: string;
  yes: string;
  no: string;
  success: string;
  error: string;
  actions: string;
  status: string;
  operator: string;
  date: string;
  amount: string;
  phone: string;
  beneficiary: string;
  sender: string;
  download_receipt: string;
  share_whatsapp: string;
  certified_receipt: string;
  loading: string;

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
  last_7_days: string;
  last_30_days: string;
  this_month: string;

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
  step1_service: string;
  step2_parties: string;
  step3_amounts: string;
  transfer_confirmation: string;
  transfer_sent: string;
  waiting_haiti_agent: string;
  new_transfer: string;
  quick_amounts: string;
  rate_today: string;
  send_amount: string;
  receive_amount: string;
  admin_comm: string;

  // Task Queue
  task_queue_title: string;
  pending: string;
  in_progress: string;
  completed: string;
  cancelled: string;
  upload_proof: string;
  confirm_completion: string;
  reassign: string;
  haiti_operations_center: string;
  natcash_natcom_balance: string;
  moncash_balance: string;
  to_disburse_haiti: string;
  proof_required: string;
  certified_by: string;
  take_photo: string;
  upload_image: string;

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
  haiti_floats: string;
  operator_accounts_floats: string;
  inject_float: string;
  inject_amount: string;
  target_account: string;
  volume_by_operator: string;
  solde_natcash_natcom: string;

  // Weekly Settlements
  settlements_title: string;
  settlements_subtitle: string;
  week_collected_total: string;
  deposits_made: string;
  remaining_to_deposit: string;
  agencies_up_to_date: string;
  record_deposit: string;
  up_to_date: string;
  overdue: string;
  partial: string;
  agent_agency: string;
  deposit_amount: string;

  // User Management
  users_title: string;
  users_subtitle: string;
  new_user: string;
  role: string;
  admin_role: string;
  gestionnaire_role: string;
  agent_rd_role: string;
  agent_haiti_role: string;
  location_agency: string;
  agent_commission_rate: string;
  user_status: string;

  // Kill Switch & Audit
  killswitch_title: string;
  killswitch_subtitle: string;
  audit_title: string;
  audit_subtitle: string;
  critical_priority: string;
  high_priority: string;
  medium_priority: string;
  low_priority: string;

  // Settings
  settings_title: string;
  interface_language: string;
  theme_display: string;
  dark_mode: string;
  light_mode: string;
  official_exchange_rate: string;

  // Auth & Receipt
  login_title: string;
  login_subtitle: string;
  identifier_placeholder: string;
  password_placeholder: string;
  connect: string;
  receipt_title: string;
  print_receipt: string;
}

export const translations: Record<Language, Translations> = {
  FR: {
    // Navigation
    nav_overview: "Vue d'ensemble",
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
    space_guichet_rd: "Espace Guichet R.D.",
    my_transactions_day: "Mes Transactions",
    tracking_receipts: "Suivi & Reçus du Jour",
    settlements_liquidations: "Versements & Liquidations",
    balance_admin_deposits: "Solde & Dépôts Admin",
    haiti_queue: "File d'attente Haïti",
    haiti_disbursements: "Décaissements Natcash/MonCash",
    receipts_proofs: "Reçus & Justificatifs",
    mobile_action_center: "Centre d'Action Mobile",
    digital_flows_mgmt: "Gestion des Flux Numériques",
    admin_security: "Administration & Sécurité",
    ops_flows: "Opérations & Flux",
    sub_user_list: "Liste & Rôles",
    sub_create_user: "Créer un Utilisateur",

    // Header & Tools
    search_placeholder: "Rechercher une opération...",
    rate_label: "Taux officiel",
    edit: "Éditer",
    node_connected: "Nœud Connecté",
    node_offline: "Mode Hors-ligne",
    recharge: "Réapprovisionner",
    export: "Exporter",
    language_name: "Français",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    delete: "Supprimer",
    copy: "Copier",
    copied: "Copié !",
    close: "Fermer",
    back: "Retour",
    view_all: "Voir tout",
    details: "Détails",
    filter: "Filtrer",
    all: "Tous",
    active: "Actif",
    suspended: "Suspendu",
    yes: "Oui",
    no: "Non",
    success: "Succès",
    error: "Erreur",
    actions: "Actions",
    status: "Statut",
    operator: "Opérateur",
    date: "Date & Heure",
    amount: "Montant",
    phone: "Téléphone",
    beneficiary: "Bénéficiaire",
    sender: "Expéditeur",
    download_receipt: "Télécharger Reçu (PDF)",
    share_whatsapp: "Partager via WhatsApp",
    certified_receipt: "Reçu Certifié",
    loading: "Chargement en cours...",

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
    last_7_days: "7 derniers jours",
    last_30_days: "30 derniers jours",
    this_month: "Ce mois",

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
    step1_service: "1. Sélection du Service & Opérateur",
    step2_parties: "2. Coordonnées Expéditeur & Bénéficiaire",
    step3_amounts: "3. Saisie Financière & Conversion",
    transfer_confirmation: "Confirmation du Transfert",
    transfer_sent: "Transfert envoyé !",
    waiting_haiti_agent: "Nous sommes en attente de l'agent Haïti pour la preuve.",
    new_transfer: "Nouveau Transfert",
    quick_amounts: "Montants rapides au comptoir",
    rate_today: "Taux du jour",
    send_amount: "Montant Envoyé",
    receive_amount: "Montant Recevant",
    admin_comm: "Commission Admin",

    // Task Queue
    task_queue_title: "File d'attente des tâches numériques",
    pending: "En attente",
    in_progress: "En cours",
    completed: "Clôturée / Validée",
    cancelled: "Annulée",
    upload_proof: "Téléverser la preuve SMS / Reçu",
    confirm_completion: "Certifier & Clôturer la tâche",
    reassign: "Réattribuer la tâche",
    haiti_operations_center: "Centre d'Opérations Haïti",
    natcash_natcom_balance: "Solde Natcash & Natcom",
    moncash_balance: "Solde MonCash",
    to_disburse_haiti: "À décaisser en Haïti",
    proof_required: "Preuve photo obligatoire",
    certified_by: "Certifié par",
    take_photo: "Prendre une photo",
    upload_image: "Choisir une image",

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
    haiti_floats: "Flottes Haïti (HTG)",
    operator_accounts_floats: "Comptes Opérateurs & Flottes",
    inject_float: "Injecter Flotte",
    inject_amount: "Montant à Injecter",
    target_account: "Compte Cible",
    volume_by_operator: "Volume Transité par Opérateur",
    solde_natcash_natcom: "Solde Natcash & Natcom (HT)",

    // Weekly Settlements
    settlements_title: "Versements & Liquidations Hebdomadaires",
    settlements_subtitle: "Suivi des encaissements par agence et dépôts bancaires hebdomadaires.",
    week_collected_total: "Total Encaissé Semaine",
    deposits_made: "Versements Déposés",
    remaining_to_deposit: "Solde Restant à Déposer",
    agencies_up_to_date: "Agences à Jour",
    record_deposit: "Enregistrer un Versement",
    up_to_date: "À jour",
    overdue: "En retard",
    partial: "Partiel",
    agent_agency: "Agent / Agence",
    deposit_amount: "Montant du Versement",

    // User Management
    users_title: "Gestion des Utilisateurs & Permissions",
    users_subtitle: "Gestion centralisée des accès, rôles et plafonds d'agents.",
    new_user: "Nouvel Utilisateur",
    role: "Rôle",
    admin_role: "Administrateur",
    gestionnaire_role: "Gestionnaire",
    agent_rd_role: "Agent Comptoir R.D.",
    agent_haiti_role: "Agent Terrain Haïti",
    location_agency: "Localisation / Agence",
    agent_commission_rate: "Taux de Commission Agent (%)",
    user_status: "Statut du Compte",

    // Kill Switch & Audit
    killswitch_title: "Arrêt d'Urgence & Coupe-Circuit",
    killswitch_subtitle: "Désactiver instantanément un opérateur en cas d'incident technique ou de liquidité.",
    audit_title: "Journal d'Audit & Sécurité",
    audit_subtitle: "Traçabilité intégrale de toutes les actions et modifications système.",
    critical_priority: "Critique",
    high_priority: "Élevée",
    medium_priority: "Moyenne",
    low_priority: "Basse",

    // Settings
    settings_title: "Paramètres Système",
    interface_language: "Langue de l'Interface",
    theme_display: "Thème & Affichage",
    dark_mode: "Mode Sombre",
    light_mode: "Mode Clair",
    official_exchange_rate: "Taux de Change Officiel",

    // Auth & Receipt
    login_title: "Connexion au Système",
    login_subtitle: "Portail sécurisé réservé aux agents autorisés",
    identifier_placeholder: "Email ou nom d'utilisateur",
    password_placeholder: "Mot de passe",
    connect: "Se connecter",
    receipt_title: "Reçu Officiel de Transaction",
    print_receipt: "Télécharger Reçu (PDF)",
  },

  HT: {
    // Navigation
    nav_overview: "Apèsi Jeneral",
    nav_dashboard: "Tablo de bò",
    nav_guichet: "Nouvo Tranzaksyon",
    nav_tasks: "Fil d'Atant Tach yo",
    nav_notifications: "Notifikasyon yo",
    nav_treasury: "Trezo ak Balans",
    nav_history: "Istwa Tranzaksyon yo",
    nav_settlements: "Vèsman pa Semèn",
    nav_users: "Jeston Itilizatè yo",
    nav_kill_switch: "Blokaj d'Ijans",
    nav_audit_logs: "Lòg Audit yo",
    nav_settings: "Paramèt yo",
    logout: "Dekonekte",
    space_guichet_rd: "Espas Gichè R.D.",
    my_transactions_day: "Tranzaksyon Mwen Yo",
    tracking_receipts: "Swivi & Resi pou Jodi a",
    settlements_liquidations: "Vèsman & Likidasyon",
    balance_admin_deposits: "Balans & Depo Admin",
    haiti_queue: "Fil d'atant Ayiti",
    haiti_disbursements: "Dekasman Natcash/MonCash",
    receipts_proofs: "Resi & Jistifikatif yo",
    mobile_action_center: "Sant Aksyon Mobil",
    digital_flows_mgmt: "Jeston Fliks Dijital yo",
    admin_security: "Administrasyon & Sekirite",
    ops_flows: "Operasyon & Fliks",
    sub_user_list: "Lis & Wòl yo",
    sub_create_user: "Kreye yon Itilizatè",

    // Header & Tools
    search_placeholder: "Chèche yon operasyon...",
    rate_label: "Tays ofisyèl",
    edit: "Modifye",
    node_connected: "Nwl Konekte",
    node_offline: "Mòd Mòt / Sòti Rezo",
    recharge: "Rechaje trezo",
    export: "Ekspòte",
    language_name: "Kreyòl",
    save: "Anrejistre",
    cancel: "Anile",
    confirm: "Konfime",
    delete: "Efase",
    copy: "Kopye",
    copied: "Kopye !",
    close: "Fèmen",
    back: "Retou",
    view_all: "Wè tout",
    details: "Detay yo",
    filter: "Filtre",
    all: "Tout",
    active: "Aktif",
    suspended: "Sispann",
    yes: "Wi",
    no: "Non",
    success: "Siksè",
    error: "Erè",
    actions: "Aksyon yo",
    status: "Stati",
    operator: "Operatè",
    date: "Dat & Lè",
    amount: "Montan",
    phone: "Nimewo telefòn",
    beneficiary: "Moun k ap resevwa a",
    sender: "Moun k ap voye a",
    download_receipt: "Telechaje Resi (PDF)",
    share_whatsapp: "Pataje sou WhatsApp",
    certified_receipt: "Resi Sètifye",
    loading: "Chajman an kou...",

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
    last_7_days: "7 dènye jou yo",
    last_30_days: "30 dènye jou yo",
    this_month: "Mwa sa a",

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
    step1_service: "1. Chwazi Sèvis & Operatè a",
    step2_parties: "2. Enfòmasyon Moun k ap Voye & Resevwa",
    step3_amounts: "3. Saisie Lajan & Konvèsyon",
    transfer_confirmation: "Konfimasyon Transfè a",
    transfer_sent: "Transfè a pati !",
    waiting_haiti_agent: "N ap tann ajan Ayiti a pou mete prèv la.",
    new_transfer: "Nouvo Transfè",
    quick_amounts: "Chwa montan rapid nan gichè a",
    rate_today: "Tays pou jodi a",
    send_amount: "Montan k ap voye a",
    receive_amount: "Montan k ap resevwa a",
    admin_comm: "Komisyon Admin",

    // Task Queue
    task_queue_title: "Fil d'atant tach dijital yo",
    pending: "An atant",
    in_progress: "An kou",
    completed: "Fèmen / Valide",
    cancelled: "Anile",
    upload_proof: "Mete prèv SMS / Resi a",
    confirm_completion: "Sètifye epi Fèmen tach la",
    reassign: "Mete sou yon lòt moun",
    haiti_operations_center: "Sant Operasyon Ayiti",
    natcash_natcom_balance: "Balans Natcash & Natcom",
    moncash_balance: "Balans MonCash",
    to_disburse_haiti: "Pou bay moun nan men an Ayiti",
    proof_required: "Prèv foto obligatwa",
    certified_by: "Sètifye pa",
    take_photo: "Pran yon foto",
    upload_image: "Chwazi yon imaj",

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
    haiti_floats: "Flòt Ayiti (HTG)",
    operator_accounts_floats: "Kont Operatè ak Flòt yo",
    inject_float: "Enjekte Flòt",
    inject_amount: "Montan pou Enjekte",
    target_account: "Kont Sib la",
    volume_by_operator: "Volim ki Pase pa Operatè",
    solde_natcash_natcom: "Balans Natcash & Natcom (HT)",

    // Weekly Settlements
    settlements_title: "Vèsman & Likidasyon pa Semèn",
    settlements_subtitle: "Swivi lajan ki rantre pa agans ak depo labank chak semèn.",
    week_collected_total: "Total Ki Rantre nan Semèn nan",
    deposits_made: "Vèsman Ki Depoze",
    remaining_to_deposit: "Rès Balans pou Depoze",
    agencies_up_to_date: "Agans Ki A Jou",
    record_deposit: "Anrejistre yon Vèsman",
    up_to_date: "A jou",
    overdue: "An reta",
    partial: "Pasyèl",
    agent_agency: "Ajan / Agans",
    deposit_amount: "Montan Vèsman an",

    // User Management
    users_title: "Jeston Itilizatè & Pèmisyon yo",
    users_subtitle: "Jere aksè, wòl ak limit chak ajan nan yon sèl kote.",
    new_user: "Nouvo Itilizatè",
    role: "Wòl",
    admin_role: "Administratè",
    gestionnaire_role: "Jestionè",
    agent_rd_role: "Ajan Gichè R.D.",
    agent_haiti_role: "Ajan Ayiti",
    location_agency: "Kote / Agans",
    agent_commission_rate: "Pousantaj Komisyon Ajan (%)",
    user_status: "Stati Kont la",

    // Kill Switch & Audit
    killswitch_title: "Blokaj d'Ijans & Koupe-Kouran",
    killswitch_subtitle: "Bloke yon operatè touswit si gen pwoblèm teknik oswa lajan.",
    audit_title: "Lòg Audit & Sekirite",
    audit_subtitle: "Trase tout aksyon ak chanjman ki fèt nan sistèm nan san mank.",
    critical_priority: "Kritik",
    high_priority: "Wo",
    medium_priority: "Mwayen",
    low_priority: "Ba",

    // Settings
    settings_title: "Paramèt Sistèm nan",
    interface_language: "Lang Entèfas la",
    theme_display: "Tèm ak Afichaj",
    dark_mode: "Mòd Nwa",
    light_mode: "Mòd Klè",
    official_exchange_rate: "Tays Echanj Ofisyèl",

    // Auth & Receipt
    login_title: "Koneksyon nan Sistèm nan",
    login_subtitle: "Pòtay ansekirite pou ajan otorize yo sèlman",
    identifier_placeholder: "Imèl oswa non itilizatè",
    password_placeholder: "Mots de pas",
    connect: "Konekte",
    receipt_title: "Resi Ofisyèl Tranzaksyon",
    print_receipt: "Telechaje Resi (PDF)",
  },

  ES: {
    // Navigation
    nav_overview: "Vista General",
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
    space_guichet_rd: "Área de Ventanilla R.D.",
    my_transactions_day: "Mis Transacciones",
    tracking_receipts: "Seguimiento y Recibos de Hoy",
    settlements_liquidations: "Liquidaciones y Depósitos",
    balance_admin_deposits: "Saldo y Depósitos Admin",
    haiti_queue: "Cola de Tareas Haití",
    haiti_disbursements: "Desembolsos Natcash/MonCash",
    receipts_proofs: "Recibos y Comprobantes",
    mobile_action_center: "Centro de Acción Móvil",
    digital_flows_mgmt: "Gestión de Flujos Digitales",
    admin_security: "Administración y Seguridad",
    ops_flows: "Operaciones y Flujos",
    sub_user_list: "Lista y Roles",
    sub_create_user: "Crear Usuario",

    // Header & Tools
    search_placeholder: "Buscar una operación...",
    rate_label: "Tasa Oficial",
    edit: "Editar",
    node_connected: "Nodo Conectado",
    node_offline: "Modo Fuera de Línea",
    recharge: "Reabastecer",
    export: "Exportar",
    language_name: "Español",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    copy: "Copiar",
    copied: "¡Copiado!",
    close: "Cerrar",
    back: "Volver",
    view_all: "Ver todo",
    details: "Detalles",
    filter: "Filtrar",
    all: "Todos",
    active: "Activo",
    suspended: "Suspendido",
    yes: "Sí",
    no: "No",
    success: "Éxito",
    error: "Error",
    actions: "Acciones",
    status: "Estado",
    operator: "Operador",
    date: "Fecha y Hora",
    amount: "Monto",
    phone: "Teléfono",
    beneficiary: "Beneficiario",
    sender: "Remitente",
    download_receipt: "Descargar Recibo (PDF)",
    share_whatsapp: "Compartir por WhatsApp",
    certified_receipt: "Recibo Certificado",
    loading: "Cargando...",

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
    last_7_days: "Últimos 7 días",
    last_30_days: "Últimos 30 días",
    this_month: "Este mes",

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
    step1_service: "1. Selección del Servicio y Operador",
    step2_parties: "2. Datos del Remitente y Beneficiario",
    step3_amounts: "3. Registro Financiero y Conversión",
    transfer_confirmation: "Confirmación de la Transferencia",
    transfer_sent: "¡Transferencia enviada!",
    waiting_haiti_agent: "Esperando confirmación y comprobante en Haití.",
    new_transfer: "Nueva Transferencia",
    quick_amounts: "Montos rápidos en ventanilla",
    rate_today: "Tasa del día",
    send_amount: "Monto Enviado",
    receive_amount: "Monto a Recibir",
    admin_comm: "Comisión Admin",

    // Task Queue
    task_queue_title: "Cola de tareas digitales",
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completada / Validada",
    cancelled: "Cancelada",
    upload_proof: "Subir comprobante SMS / Recibo",
    confirm_completion: "Certificar y Cerrar tarea",
    reassign: "Reasignar tarea",
    haiti_operations_center: "Centro de Operaciones Haití",
    natcash_natcom_balance: "Saldo Natcash y Natcom",
    moncash_balance: "Saldo MonCash",
    to_disburse_haiti: "A pagar en efectivo en Haití",
    proof_required: "Comprobante fotográfico obligatorio",
    certified_by: "Certificado por",
    take_photo: "Tomar una foto",
    upload_image: "Elegir una imagen",

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
    haiti_floats: "Flotas Haití (HTG)",
    operator_accounts_floats: "Cuentas de Operadores y Flotas",
    inject_float: "Inyectar Flota",
    inject_amount: "Monto a Inyectar",
    target_account: "Cuenta Destino",
    volume_by_operator: "Volumen Transitado por Operador",
    solde_natcash_natcom: "Saldo Natcash y Natcom (HT)",

    // Weekly Settlements
    settlements_title: "Liquidaciones y Depósitos Semanales",
    settlements_subtitle: "Seguimiento de cobros por agencia y depósitos bancarios semanales.",
    week_collected_total: "Total Cobrado en la Semana",
    deposits_made: "Depósitos Realizados",
    remaining_to_deposit: "Saldo Restante por Depositar",
    agencies_up_to_date: "Agencias al Día",
    record_deposit: "Registrar un Depósito",
    up_to_date: "Al día",
    overdue: "Atrasado",
    partial: "Parcial",
    agent_agency: "Agente / Agencia",
    deposit_amount: "Monto del Depósito",

    // User Management
    users_title: "Gestión de Usuarios y Permisos",
    users_subtitle: "Control centralizado de accesos, roles y límites de agentes.",
    new_user: "Nuevo Usuario",
    role: "Rol",
    admin_role: "Administrador",
    gestionnaire_role: "Gestor",
    agent_rd_role: "Agente de Ventanilla R.D.",
    agent_haiti_role: "Agente en Haití",
    location_agency: "Ubicación / Agencia",
    agent_commission_rate: "Tasa de Comisión Agente (%)",
    user_status: "Estado de la Cuenta",

    // Kill Switch & Audit
    killswitch_title: "Control de Emergencia e Interrupción",
    killswitch_subtitle: "Desactive de inmediato un operador en caso de falla técnica o liquidez.",
    audit_title: "Registros de Auditoría y Seguridad",
    audit_subtitle: "Trazabilidad completa de todas las acciones y cambios en el sistema.",
    critical_priority: "Crítico",
    high_priority: "Alta",
    medium_priority: "Media",
    low_priority: "Baja",

    // Settings
    settings_title: "Configuración del Sistema",
    interface_language: "Idioma de la Interfaz",
    theme_display: "Tema y Visualización",
    dark_mode: "Modo Oscuro",
    light_mode: "Modo Claro",
    official_exchange_rate: "Tasa de Cambio Oficial",

    // Auth & Receipt
    login_title: "Iniciar Sesión en el Sistema",
    login_subtitle: "Portal seguro exclusivo para agentes autorizados",
    identifier_placeholder: "Correo o nombre de usuario",
    password_placeholder: "Contraseña",
    connect: "Iniciar sesión",
    receipt_title: "Recibo Oficial de Transacción",
    print_receipt: "Descargar Recibo (PDF)",
  },
};

/**
 * Large Dictionary of direct French UI strings mapped to Haitian Creole (HT) and Spanish (ES).
 * This allows t('Any text') to translate instantly anywhere in the app!
 */
export const PHRASE_DICTIONARY: Record<Language, Record<string, string>> = {
  FR: {},
  HT: {
    // Menu & Navigation
    "Tableau de bord": "Tablo de bò",
    "Nouvelle Transaction": "Nouvo Tranzaksyon",
    "File d'attente Tâches": "Fil d'Atant Tach yo",
    "File d'attente Haïti": "Fil d'atant Ayiti",
    "File d'attente": "Fil d'atant",
    "Notifications": "Notifikasyon yo",
    "Trésorerie & Solde": "Trezo ak Balans",
    "Trésorerie & Soldes": "Trezo ak Balans",
    "Historique Transactions": "Istwa Tranzaksyon yo",
    "Historique": "Istwa",
    "Versements Hebdo": "Vèsman pa Semèn",
    "Versements & Liquidations": "Vèsman & Likidasyon",
    "Gestion Utilisateurs": "Jeston Itilizatè yo",
    "Arrêt d'Urgence": "Blokaj d'Ijans",
    "Journal d'Audit": "Lòg Audit yo",
    "Paramètres": "Paramèt yo",
    "Se déconnecter": "Dekonekte",
    "Espace Guichet R.D.": "Espas Gichè R.D.",
    "Guichet Saisie": "Gichè Saisie",
    "Mes Transactions": "Tranzaksyon Mwen Yo",
    "Suivi & Reçus du Jour": "Swivi & Resi pou Jodi a",
    "Solde & Dépôts Admin": "Balans & Depo Admin",
    "Décaissements Natcash/MonCash": "Dekasman Natcash/MonCash",
    "Reçus & Justificatifs": "Resi & Jistifikatif yo",
    "Centre d'Action Mobile": "Sant Aksyon Mobil",
    "Centre d'Action Mobile • RD": "Sant Aksyon Mobil • RD",
    "Gestion des Flux Numériques": "Jeston Fliks Dijital yo",
    "Administration & Sécurité": "Administrasyon & Sekirite",
    "Vue d'ensemble": "Apèsi Jeneral",
    "Opérations & Flux": "Operasyon & Fliks",
    "Accueil": "Akèy",
    "Dépôts": "Depo yo",
    "Tâches": "Tach yo",

    // Statuses
    "En attente": "An atant",
    "En attente de l'agent Haïti": "N ap tann ajan Ayiti a",
    "En cours": "An kou",
    "Clôturée": "Fèmen / Valide",
    "Clôturée / Validée": "Fèmen / Valide",
    "Clôturé": "Valide",
    "Validé": "Valide",
    "Annulée": "Anile",
    "Annulé": "Anile",
    "Actif": "Aktif",
    "Suspendu": "Sispann",
    "À jour": "A jou",
    "En retard": "An reta",
    "Partiel": "Pasyèl",
    "Critique": "Kritik",
    "Optimal": "Optimal",
    "Seuil Bas": "Nivo Ba",

    // Common Action Buttons
    "Rechercher": "Chèche",
    "Rechercher une opération...": "Chèche yon operasyon...",
    "Rechercher #TX, bénéficiaire, téléphone...": "Chèche #TX, non moun, telefòn...",
    "Valider": "Valide",
    "Annuler": "Anile",
    "Confirmer": "Konfime",
    "Enregistrer": "Anrejistre",
    "Modifier": "Modifye",
    "Éditer": "Modifye",
    "Supprimer": "Efase",
    "Copier": "Kopye",
    "Copié": "Kopye",
    "Fermer": "Fèmen",
    "Retour": "Retou",
    "Voir tout": "Wè tout",
    "Tout marquer lu": "Make tout kòm li",
    "Tout lire": "Li tout",
    "Détails": "Detay yo",
    "Exporter": "Ekspòte",
    "Télécharger": "Telechaje",
    "Télécharger Reçu (PDF)": "Telechaje Resi (PDF)",
    "Reçu (PDF / Partager)": "Resi (PDF / Pataje)",
    "Partager via WhatsApp": "Pataje sou WhatsApp",
    "Nouveau Transfert": "Nouvo Transfè",
    "Nouvel Utilisateur": "Nouvo Itilizatè",
    "Injecter Flotte": "Enjekte Flòt",
    "Réapprovisionner": "Rechaje",
    "Certifier & Clôturer": "Sètifye & Fèmen",

    // Form Labels
    "Expéditeur": "Moun k ap voye a",
    "Bénéficiaire": "Moun k ap resevwa a",
    "Destinataire": "Moun k ap resevwa a",
    "Nom complet": "Non konplè",
    "Nom complet du bénéficiaire": "Non konplè moun k ap resevwa a",
    "Nom complet de l'expéditeur": "Non konplè moun k ap voye a",
    "Téléphone": "Nimewo telefòn",
    "Numéro de téléphone": "Nimewo telefòn",
    "Montant": "Montan",
    "Montant Envoyé": "Montan k ap voye a",
    "Montant Recevant": "Montan k ap resevwa a",
    "Montant Reçu": "Montan k ap resevwa a",
    "Frais de service (3%)": "Fristè sèvis (3%)",
    "Commission Admin": "Komisyon Admin",
    "Commission Agence": "Komisyon Agans",
    "Taux du jour": "Tays pou jodi a",
    "Taux officiel": "Tays ofisyèl",
    "Total à payer": "Total pou peye",
    "Total à Encaisser": "Total pou Enkese",
    "Preuve d'Exécution": "Prèv Egzistans",
    "Preuve photo obligatoire": "Prèv foto obligatwa",
    "Preuve": "Prèv",
    "Statut": "Stati",
    "Opérateur": "Operatè",
    "Service": "Sèvis",
    "Services Disponibles": "Sèvis ki Disponib yo",
    "Date & Heure": "Dat & Lè",
    "Date": "Dat",
    "Heure": "Lè",
    "Rôle": "Wòl",
    "Fonds Disponibles": "Lajan ki Disponib",
    "Afficher": "Montre",
    "Masquer": "Kache",
    "Transactions Récentes": "Dènye Tranzaksyon yo",
    "Confirmation du Transfert": "Konfimasyon Transfè a",
    "Transfert envoyé !": "Transfè a pati !",
    "Solde Natcash & Natcom (HT)": "Balans Natcash & Natcom (HT)",
    "Solde MonCash": "Balans MonCash",
    "Comptes Opérateurs & Flottes": "Kont Operatè ak Flòt yo",
    "Revenu Brut Total Agence": "Revenu Brijal Agans lan",
    "Commissions Admin Encaissées": "Komisyon Admin Ki Rantre",
    "Mode Sombre": "Mòd Nwa",
    "Mode Clair": "Mòd Klè",
    "Changer de langue": "Chanje lang",
    "Top services": "Pi bon sèvis yo",
    "Cliquez pour transférer": "Klike pou voye lajan",
    "Recent transactions": "Dènye tranzaksyon yo",
    "Transactions récentes": "Dènye tranzaksyon yo",
    "See all": "Wè tout",
    "Aucune transaction récente": "Pa gen dènye tranzaksyon",
    "Les transferts que vous effectuez apparaîtront ici.": "Transfè ou fè yo ap parèt la.",
    "Flux numérique cette semaine": "Mouvman nimerik semèn sa",
    "Montant des transactions cette semaine": "Total tranzaksyon semèn sa",
    "transfert réalisé cette semaine": "transfè fèt semèn sa",
    "transferts réalisés cette semaine": "transfè fèt semèn sa",
    "Équivalent DOP": "Ekivalan DOP",
    "Voir toutes les notifications": "Wè tout notifikasyon yo",
    "Masquer le montant": "Kache montan an",
    "Afficher le montant": "Montre montan an",
    "Télécharger ou partager le reçu PDF": "Telechaje oswa pataje resi PDF",
    "🔒 Réservé HT": "🔒 Rezève pou Ayiti",
    "Agent Haïti • Décaissements": "Ajan Ayiti • Dekèsman",
    "Mes Tâches & Soldes": "Tach Mwen & Balans",
    "Soldes En Caisse": "Lajan Ki Nan Kès",
    "Comptes Natcash & Natcom disponibles": "Kont Natcash & Natcom ki disponib",
    "Tâches à Décaisser": "Tach Pou Dekese",
    "Historique & Reçus": "Istorik & Resi yo",
    "Télécharger le reçu PDF": "Telechaje resi PDF",
    "Valider le décaissement": "Valide dekèsman an",
    "Preuve requise": "Prèv obligatwa",
    "Transactions en Attente de Preuve": "Tranzaksyon K ap Tann Prèv",
    "Aucune transaction en attente !": "Pa gen tranzaksyon k ap tann !",
    "Toutes les opérations numériques du gestionnaire sont traitées.": "Tout operasyon nimerik jesyone a fèt.",
    "Preuve Requise": "Prèv Obligatwa",
    "Montant DOP Encaissé": "Montan DOP Ki Rantre",
    "À Transférer HTG": "Pou Transfere HTG",
    "Valider avec Preuve": "Valide ak Prèv",
    "Mes Dernières Opérations au Comptoir": "Dènye Operasyon Mwen Nan Kontwa",
    "Suivi instantané des transactions récemment saisies depuis ce poste": "Swivi rapid tranzaksyon ki sot fèt nan pòs sa",
    "1. Sélection du Service & Opérateur": "1. Chwazi Sèvis & Operatè a",
    "2. Informations Récepteur": "2. Enfòmasyon Moun K ap Resevwa a",
    "3. Saisie Financière & Conversion": "3. Montan & Konvèsyon Lajan",
    "Montant en Pesos dominicains (DOP) versé :": "Montan an Peso dominiken (DOP) :",
    "Montant net en Haïti :": "Montan nètt an Ayiti :",
    "Frais de service agence (3%) :": "Fristè sèvis ajans (3%) :",
    "Commission agence (1%) :": "Komisyon ajans (1%) :",
  },
  ES: {
    // Menu & Navigation
    "Tableau de bord": "Panel de Control",
    "Nouvelle Transaction": "Nueva Transacción",
    "File d'attente Tâches": "Cola de Tareas",
    "File d'attente Haïti": "Cola de Tareas Haití",
    "File d'attente": "Cola de Tareas",
    "Notifications": "Notificaciones",
    "Trésorerie & Solde": "Tesorería y Saldos",
    "Trésorerie & Soldes": "Tesorería y Saldos",
    "Historique Transactions": "Historial de Transacciones",
    "Historique": "Historial",
    "Versements Hebdo": "Liquidaciones Semanales",
    "Versements & Liquidations": "Liquidaciones y Depósitos",
    "Gestion Utilisateurs": "Gestión de Usuarios",
    "Arrêt d'Urgence": "Control de Emergencia",
    "Journal d'Audit": "Registros de Auditoría",
    "Paramètres": "Configuración",
    "Se déconnecter": "Cerrar Sesión",
    "Espace Guichet R.D.": "Área de Ventanilla R.D.",
    "Guichet Saisie": "Registro en Ventanilla",
    "Mes Transactions": "Mis Transacciones",
    "Suivi & Reçus du Jour": "Seguimiento y Recibos de Hoy",
    "Solde & Dépôts Admin": "Saldo y Depósitos Admin",
    "Décaissements Natcash/MonCash": "Desembolsos Natcash/MonCash",
    "Reçus & Justificatifs": "Recibos y Comprobantes",
    "Centre d'Action Mobile": "Centro de Acción Móvil",
    "Centre d'Action Mobile • RD": "Centro de Acción Móvil • RD",
    "Gestion des Flux Numériques": "Gestión de Flujos Digitales",
    "Administration & Sécurité": "Administración y Seguridad",
    "Vue d'ensemble": "Vista General",
    "Opérations & Flux": "Operaciones y Flujos",
    "Accueil": "Inicio",
    "Dépôts": "Depósitos",
    "Tâches": "Tareas",

    // Statuses
    "En attente": "Pendiente",
    "En attente de l'agent Haïti": "Esperando confirmación en Haití",
    "En cours": "En proceso",
    "Clôturée": "Completada / Validada",
    "Clôturée / Validée": "Completada / Validada",
    "Clôturé": "Completado",
    "Validé": "Validado",
    "Annulée": "Cancelada",
    "Annulé": "Cancelado",
    "Actif": "Activo",
    "Suspendu": "Suspendido",
    "À jour": "Al día",
    "En retard": "Atrasado",
    "Partiel": "Parcial",
    "Critique": "Crítico",
    "Optimal": "Óptimo",
    "Seuil Bas": "Nivel Bajo",

    // Common Action Buttons
    "Rechercher": "Buscar",
    "Rechercher une opération...": "Buscar una operación...",
    "Rechercher #TX, bénéficiaire, téléphone...": "Buscar #TX, beneficiario, teléfono...",
    "Valider": "Validar",
    "Annuler": "Cancelar",
    "Confirmer": "Confirmar",
    "Enregistrer": "Guardar",
    "Modifier": "Modificar",
    "Éditer": "Editar",
    "Supprimer": "Eliminar",
    "Copier": "Copiar",
    "Copié": "Copiado",
    "Fermer": "Cerrar",
    "Retour": "Volver",
    "Voir tout": "Ver todo",
    "Tout marquer lu": "Marcar todo como leído",
    "Tout lire": "Leer todo",
    "Détails": "Detalles",
    "Exporter": "Exportar",
    "Télécharger": "Descargar",
    "Télécharger Reçu (PDF)": "Descargar Recibo (PDF)",
    "Reçu (PDF / Partager)": "Recibo (PDF / Compartir)",
    "Partager via WhatsApp": "Compartir por WhatsApp",
    "Nouveau Transfert": "Nueva Transferencia",
    "Nouvel Utilisateur": "Nuevo Usuario",
    "Injecter Flotte": "Inyectar Flota",
    "Réapprovisionner": "Reabastecer",
    "Certifier & Clôturer": "Certificar y Cerrar",

    // Form Labels
    "Expéditeur": "Remitente",
    "Bénéficiaire": "Beneficiario",
    "Destinataire": "Destinatario",
    "Nom complet": "Nombre completo",
    "Nom complet du bénéficiaire": "Nombre completo del beneficiario",
    "Nom complet de l'expéditeur": "Nombre completo del remitente",
    "Téléphone": "Teléfono",
    "Numéro de téléphone": "Número de teléfono",
    "Montant": "Monto",
    "Montant Envoyé": "Monto Enviado",
    "Montant Recevant": "Monto a Recibir",
    "Montant Reçu": "Monto Recibido",
    "Frais de service (3%)": "Tarifa de servicio (3%)",
    "Commission Admin": "Comisión Admin",
    "Commission Agence": "Comisión Agencia",
    "Taux du jour": "Tasa del día",
    "Taux officiel": "Tasa Oficial",
    "Total à payer": "Total a pagar",
    "Total à Encaisser": "Total a Cobrar",
    "Preuve d'Exécution": "Comprobante de Ejecución",
    "Preuve photo obligatoire": "Comprobante fotográfico obligatorio",
    "Preuve": "Comprobante",
    "Statut": "Estado",
    "Opérateur": "Operador",
    "Service": "Servicio",
    "Services Disponibles": "Servicios Disponibles",
    "Date & Heure": "Fecha y Hora",
    "Date": "Fecha",
    "Heure": "Hora",
    "Rôle": "Rol",
    "Fonds Disponibles": "Fondos Disponibles",
    "Afficher": "Mostrar",
    "Masquer": "Ocultar",
    "Transactions Récentes": "Transacciones Recientes",
    "Confirmation du Transfert": "Confirmación de Transferencia",
    "Transfert envoyé !": "¡Transferencia enviada!",
    "Solde Natcash & Natcom (HT)": "Saldo Natcash y Natcom (HT)",
    "Solde MonCash": "Saldo MonCash",
    "Comptes Opérateurs & Flottes": "Cuentas de Operadores y Flotas",
    "Revenu Brut Total Agence": "Ingresos Brutos Totales",
    "Commissions Admin Encaissées": "Comisiones Admin Cobradas",
    "Mode Sombre": "Modo Oscuro",
    "Mode Clair": "Modo Claro",
    "Changer de langue": "Cambiar de idioma",
    "Top services": "Mejores servicios",
    "Cliquez pour transférer": "Haga clic para transferir",
    "Recent transactions": "Transacciones recientes",
    "Transactions récentes": "Transacciones recientes",
    "See all": "Ver todo",
    "Aucune transaction récente": "No hay transacciones recientes",
    "Les transferts que vous effectuez apparaîtront ici.": "Las transferencias que realice aparecerán aquí.",
    "Flux numérique cette semaine": "Flujo digital esta semana",
    "Montant des transactions cette semaine": "Monto de transacciones esta semana",
    "transfert réalisé cette semaine": "transferencia realizada esta semana",
    "transferts réalisés cette semaine": "transferencias realizadas esta semana",
    "Équivalent DOP": "Equivalente DOP",
    "Voir toutes les notifications": "Ver todas las notificaciones",
    "Masquer le montant": "Ocultar monto",
    "Afficher le montant": "Mostrar monto",
    "Télécharger ou partager le reçu PDF": "Descargar o compartir recibo PDF",
    "🔒 Réservé HT": "🔒 Reservado para HT",
    "Agent Haïti • Décaissements": "Agente Haití • Desembolsos",
    "Mes Tâches & Soldes": "Mis Tareas y Saldos",
    "Soldes En Caisse": "Saldos en Caja",
    "Comptes Natcash & Natcom disponibles": "Cuentas Natcash y Natcom disponibles",
    "Tâches à Décaisser": "Tareas por Desembolsar",
    "Historique & Reçus": "Historial y Recibos",
    "Télécharger le reçu PDF": "Descargar recibo PDF",
    "Valider le décaissement": "Validar desembolso",
    "Preuve requise": "Comprobante requerido",
    "Transactions en Attente de Preuve": "Transacciones Pendientes de Comprobante",
    "Aucune transaction en attente !": "¡No hay transacciones pendientes!",
    "Toutes les opérations numériques du gestionnaire sont traitées.": "Todas las operaciones digitales del gestor han sido procesadas.",
    "Preuve Requise": "Comprobante Requerido",
    "Montant DOP Encaissé": "Monto DOP Cobrado",
    "À Transférer HTG": "A Transferir HTG",
    "Valider avec Preuve": "Validar con Comprobante",
    "Mes Dernières Opérations au Comptoir": "Mis Últimas Operaciones en Ventanilla",
    "Suivi instantané des transactions récemment saisies depuis ce poste": "Seguimiento instantáneo de las transacciones registradas desde este puesto",
    "1. Sélection du Service & Opérateur": "1. Selección de Servicio y Operador",
    "2. Informations Récepteur": "2. Información del Receptor",
    "3. Saisie Financière & Conversion": "3. Monto y Conversión",
    "Montant en Pesos dominicains (DOP) versé :": "Monto en Pesos dominicanos (DOP) :",
    "Montant net en Haïti :": "Monto neto en Haití :",
    "Frais de service agence (3%) :": "Tarifa de servicio agencia (3%) :",
    "Commission agence (1%) :": "Comisión agencia (1%) :",
  },
};

/**
 * Universal text translation helper function.
 * Matches typed translation keys, dictionary phrases, or returns fallback.
 */
export function translateText(keyOrPhrase: string, lang: Language, fallback?: string): string {
  if (!keyOrPhrase) return fallback || '';
  if (lang === 'FR') {
    // If it's a key in FR dictionary, return translated value, else return keyOrPhrase
    const frDict = translations.FR as unknown as Record<string, string>;
    if (frDict[keyOrPhrase]) return frDict[keyOrPhrase];
    return fallback || keyOrPhrase;
  }

  // Check typed keys in target language
  const targetDict = (translations[lang] || translations.FR) as unknown as Record<string, string>;
  if (targetDict[keyOrPhrase]) {
    return targetDict[keyOrPhrase];
  }

  // Check phrase dictionary
  const phraseDict = PHRASE_DICTIONARY[lang];
  if (phraseDict) {
    // Exact match
    if (phraseDict[keyOrPhrase]) {
      return phraseDict[keyOrPhrase];
    }
    // Trimmed match
    const trimmed = keyOrPhrase.trim();
    if (phraseDict[trimmed]) {
      return phraseDict[trimmed];
    }
  }

  // Check French fallback key
  const frDict = translations.FR as unknown as Record<string, string>;
  if (frDict[keyOrPhrase]) {
    return frDict[keyOrPhrase];
  }

  return fallback || keyOrPhrase;
}
