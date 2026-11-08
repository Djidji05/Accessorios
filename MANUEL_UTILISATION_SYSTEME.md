# 📘 MANUEL OFFICIEL D'UTILISATION & DOCUMENT DE REMISE DU SYSTÈME
## Plateforme Unifiée **Alexis Transferencia** (R.D. ⇄ Haïti ⇄ USA)

---

> **Objet du Document :** Ce manuel constitue le document officiel de livraison et le guide complet d'exploitation de la plateforme **Alexis Transferencia**. Il détaille, étape par étape, le chemin d'accès et le fonctionnement de chaque module pour les **4 profils d'utilisateurs** (Administrateur, Gestionnaire Numérique, Agent Comptoir R.D., et Agent Terrain Haïti).

---

## Table des Matières
1. [Présentation Générale du Système](#1-présentation-générale-du-système)
2. [Chemin d'Accès, Connexion & Installation de l'Application (PWA)](#2-chemin-daccès-connexion--installation-de-lapplication-pwa)
3. [Architecture des Rôles & Permissions](#3-architecture-des-rôles--permissions)
4. [Parcours Opérationnels Étape par Étape (Les 4 Flux Financiers)](#4-parcours-opérationnels-étape-par-étape-les-4-flux-financiers)
   - [Flux A : Transfert Portefeuille & Cash-Out (RD ➔ Haïti : MonCash / Natcash)](#flux-a--transfert-portefeuille--cash-out-rd--haïti--moncash--natcash)
   - [Flux B : Recharge Téléphonique Mobile (Digicel, Natcom, Claro, Altice)](#flux-b--recharge-téléphonique-mobile-digicel-natcom-claro-altice)
   - [Flux C : Réception Haïti ➔ Retrait Espèces en R.D. (MonCash / Natcash USD ➔ DOP)](#flux-c--réception-haïti--retrait-espèces-en-rd-moncash--natcash-usd--dop)
   - [Flux D : Virement Zelle Pay (USA ➔ Retrait R.D. en DOP ou USD)](#flux-d--virement-zelle-pay-usa--retrait-rd-en-dop-ou-usd)
5. [Guide Détaillé par Rôle Utilisateur](#5-guide-détaillé-par-rôle-utilisateur)
   - [5.1. Espace Agent Comptoir R.D.](#51-espace-agent-comptoir-rd)
   - [5.2. Espace Agent Terrain Haïti](#52-espace-agent-terrain-haïti)
   - [5.3. Espace Gestionnaire Numérique](#53-espace-gestionnaire-numérique)
   - [5.4. Espace Administrateur Général](#54-espace-administrateur-général)
6. [Règles Financières, Taux de Change & Calcul Automatique des Commissions](#6-règles-financières-taux-de-change--calcul-automatique-des-commissions)
7. [Reçus Officiels PDF, Sécurité & Support Technique](#7-reçus-officiels-pdf-sécurité--support-technique)

---

## 1. Présentation Générale du Système

**Alexis Transferencia** est une plateforme financière multi-devises (**DOP**, **HTG**, **USD**) et multilingue (**Français 🇫🇷**, **Créole Haïtien 🇭🇹**, **Espagnol 🇩🇴**) conçue pour orchestrer et sécuriser en temps réel toutes les opérations de transfert d'argent et de recharge entre la **République Dominicaine**, **Haïti** et les **États-Unis**.

### Opérateurs et Services Intégrés
| Opérateur | Zone | Type d'Opération | Devise Saisie | Devise Délivrée |
| :--- | :--- | :--- | :--- | :--- |
| **MonCash** | Haïti 🇭🇹 | Envoi RD ➔ HT & Réception HT ➔ RD | DOP ou USD | HTG ou DOP |
| **Natcash** | Haïti 🇭🇹 | Envoi RD ➔ HT & Réception HT ➔ RD | DOP ou USD | HTG ou DOP |
| **Digicel** | Haïti 🇭🇹 | Recharge Téléphonique (TopUp) | DOP | HTG |
| **Natcom** | Haïti 🇭🇹 | Recharge Téléphonique & Data | DOP | HTG |
| **Claro** | R.D. 🇩🇴 | Recharge Téléphonique Locale | DOP | DOP / HTG |
| **Altice** | R.D. 🇩🇴 | Recharge Téléphonique Locale | DOP | DOP / HTG |
| **Zelle Pay** | USA 🇺🇸 | Virement USA ➔ Retrait Guichet RD | USD ($) | DOP ou USD |

---

## 2. Chemin d'Accès, Connexion & Installation de l'Application (PWA)

### Étape 1 : Ouvrir la Plateforme
1. Ouvrez votre navigateur web (**Google Chrome**, **Safari**, ou **Microsoft Edge**) sur ordinateur, tablette ou smartphone.
2. Accédez à l'adresse officielle de la plateforme :
   - **URL de Production :** `https://alexistransferencia.app` (ou l'URL fournie par votre administrateur).

### Étape 2 : Choisir la Langue de Travail
- Dès l'écran de connexion ou depuis la barre supérieure (icône 🌐 **FR / HT / ES**), sélectionnez votre langue :
  - **FR** : Français
  - **HT** : Kreyòl Ayisyen
  - **ES** : Español
- Toute l'interface se traduit instantanément.

### Étape 3 : Se Connecter à son Espace
1. **Champ 1 (`Nom d'utilisateur ou Téléphone`)** : Entrez votre identifiant ou numéro professionnel attribué par l'Administrateur.
2. **Champ 2 (`Mot de passe`)** : Entrez votre mot de passe confidentiel (cliquez sur l'icône 👁️ pour vérifier la saisie).
3. Cliquez sur le bouton bleu **« Se connecter »**.
4. Le système détecte automatiquement votre rôle et vous redirige vers votre interface dédiée (Mode Mobile épuré sur téléphone ou Mode Guichet/Bureau sur PC).

### Étape 4 : Installer l'Application sur Téléphone ou Ordinateur (PWA)
- Une bannière **« Installer Alexis Transferencia PWA »** s'affiche ou un bouton est disponible dans la barre latérale (**Installer l'App**).
- Cliquez sur **« Installer l'App »** pour ajouter le raccourci directement sur l'écran d'accueil de votre téléphone Android/iPhone ou sur le bureau de votre PC Windows/Mac.

---

## 3. Architecture des Rôles & Permissions

| Rôle | Périmètre & Responsabilités Principales |
| :--- | :--- |
| **👑 Administrateur Général** | Supervision globale, configuration des taux (`DOP/HTG` et `USD/DOP`), validation `OUI/NON` des virements **Zelle** et **Réceptions Haïti**, gestion de la trésorerie/flottes, enregistrement des dépôts hebdomadaires des agents, création d'utilisateurs, arrêt d'urgence (`Kill Switch`) et audit. |
| **⚡ Gestionnaire Numérique** | Réception en temps réel des demandes numériques (`MonCash`, `Digicel`, `Claro`, `Altice`, `Natcom`), exécution des transferts, téléversement obligatoire de la preuve photo, signalement d'anomalies à l'Admin. |
| **🏪 Agent Comptoir R.D.** | Accueil client en République Dominicaine, encaissement des Pesos (`DOP`), création des envois et recharges, soumission des preuves **Réception Haïti** et **Zelle**, remise des espèces après validation Admin, délivrance des reçus PDF et suivi de ses commissions/dépôts hebdomadaires. |
| **🇭🇹 Agent Terrain Haïti** | Réception en temps réel des tâches de décaissement en Haïti (`Natcash`, `Natcom`, `MonCash`), exécution du versement au bénéficiaire et clôture obligatoire avec photo du reçu. |

---

## 4. Parcours Opérationnels Étape par Étape (Les 4 Flux Financiers)

### Flux A : Transfert Portefeuille & Cash-Out (RD ➔ Haïti : MonCash / Natcash)

**Objectif :** Un client se présente au comptoir en République Dominicaine avec des Pesos (DOP) pour envoyer de l'argent en Gourdes (HTG) vers un compte **MonCash** ou **Natcash** en Haïti.

#### Chemin Utilisateur (Étape par Étape) :
1. **Saisie au Guichet R.D. (`Accueil` / `Guichet Saisie`)** :
   - Cliquez sur l'icône **MonCash** ou **Natcash**.
   - Saisissez le **Numéro de téléphone** du bénéficiaire en Haïti (ex. `509XXXXXXXX`).
   - Saisissez le **Nom complet du bénéficiaire** (ou sélectionnez-le en 1 clic dans la liste **« Bénéficiaire récent »**).
   - Saisissez le **Montant en DOP** (ou cliquez sur un bouton rapide : `1 000`, `2 000`, `5 000`, `10 000`, `15 000`, `20 000`).
   - Le système affiche automatiquement le **Taux du jour** (`100 DOP = X HTG`) et le montant converti en **HTG**.
   - Cliquez sur **« Continuez »**, vérifiez le récapitulatif sur l'écran **« Confirmation du Transfert »**, puis cliquez sur **« Valider »**.
2. **Routage Automatique Temps Réel** :
   - Si l'opérateur est **Natcash**, la tâche est envoyée avec une alerte sonore dans la file d'attente de l'**Agent Haïti** (et de l'Admin).
   - Si l'opérateur est **MonCash**, la tâche apparaît chez le **Gestionnaire Numérique** et l'**Agent Haïti** / **Admin**.
3. **Exécution & Validation avec Preuve Photo (`Tâches` / `File d'attente`)** :
   - L'Agent Haïti (ou le Gestionnaire) clique sur la transaction en attente, effectue le transfert sur le numéro du bénéficiaire, puis clique sur **« Valider & Décaisser »**.
   - Il prend une **Photo** ou importe la **Capture d'écran** du reçu opérateur (obligatoire) et clique sur **« Valider & Clôturer »**.
4. **Délivrance du Reçu Officiel PDF** :
   - L'Agent R.D. reçoit une notification immédiate. La transaction passe au statut **« Clôturé / Validé »** et le reçu PDF officiel certifié avec la preuve photo peut être téléchargé ou partagé sur WhatsApp.

---

### Flux B : Recharge Téléphonique Mobile (Digicel, Natcom, Claro, Altice)

**Objectif :** Recharger instantanément un numéro de téléphone en Haïti (`Digicel`, `Natcom`) ou en R.D. (`Claro`, `Altice`).

#### Chemin Utilisateur (Étape par Étape) :
1. **Au Guichet R.D. (`Accueil`)** :
   - Cliquez sur l'opérateur souhaité (**Digicel**, **Natcom**, **Claro**, ou **Altice**).
   - Saisissez uniquement le **Numéro de téléphone** à recharger et le **Montant DOP** (aucun nom de bénéficiaire n'est requis pour accélérer la saisie).
   - Cliquez sur **« Continuez »** puis **« Valider »**.
2. **Traitement & Clôture** :
   - Le Gestionnaire (ou l'Agent Haïti pour Natcom) reçoit la demande, exécute la recharge, joint la capture d'écran de confirmation et clique sur **« Valider & Clôturer »**.

---

### Flux C : Réception Haïti ➔ Retrait Espèces en R.D. (MonCash / Natcash USD ➔ DOP)

**Objectif :** Un client a reçu un dépôt sur le compte **MonCash** ou **Natcash** de l'entreprise en Haïti (exprimé en **USD** sur la preuve) et souhaite retirer l'équivalent en **Pesos Dominicains (DOP)** au guichet en R.D.

#### Chemin Utilisateur (Étape par Étape) :
1. **Ouverture du Module Réception Haïti** :
   - **Sur Mobile :** Depuis l'écran d'accueil, cliquez sur la bannière orange **« Réception Haïti (MonCash / Natcash) — Dépôt »**.
   - **Sur PC :** Dans **« Guichet Saisie »**, cliquez sur le bouton d'onglet **« Réception Haïti RD »**.
2. **Saisie en 3 Étapes Simples par l'Agent R.D.** :
   - **Étape 1 (`Choix du Compte`)** : Cliquez sur **MonCash** ou **Natcash**.
   - **Étape 2 (`Somme Écrite sur la Preuve USD`)** : Saisissez le montant en **Dollars USD** inscrit sur la preuve du client (ex. `100` USD). Une estimation brute en Pesos s'affiche.
   - **Étape 3 (`Preuve Photo`)** : Cliquez sur **« Photo »** (appareil photo) ou **« Galerie »** pour joindre la capture d'écran du client.
   - Cliquez sur **« Envoyer à l'Admin pour Vérification »**.
3. **Vérification par l'Administrateur (`OUI / NON`)** :
   - L'Administrateur reçoit une alerte dans sa **File d'attente Tâches** et dans ses **Notifications**.
   - Il ouvre la transaction, inspecte la photo de preuve en plein écran et voit le bouton vert **« OUI, Valider »** et le bouton rouge **« NON, Refuser »**.
   - S'il clique sur **« OUI, Valider »**, le système déduit automatiquement les frais de service (`0.5%`) et débloque le **Montant Net à Verser (DOP)** sur l'écran de l'Agent R.D.
4. **Remise des Espèces au Client** :
   - L'Agent R.D. voit le badge vert **« 💵 Prêt Versement »**, remet le montant exact en Pesos au client et clique sur **« Confirmer Versement »** pour clôturer l'opération et générer le reçu PDF.

---

### Flux D : Virement Zelle Pay (USA ➔ Retrait R.D. en DOP ou USD)

**Objectif :** Un client présente la preuve d'un virement **Zelle** envoyé en Dollars (`USD`) vers le compte bancaire américain de l'entreprise et souhaite retirer ses fonds au guichet en **Pesos (DOP)** ou en **Dollars (USD)**.

> **⚠️ Règle de Sécurité Absolue :** Tant que l'Administrateur n'a pas vérifié son compte bancaire et cliqué sur **« OUI, Valider »**, le montant net à décaisser reste **masqué et verrouillé** pour l'Agent R.D. Aucun argent ne doit être remis au client avant la validation Admin.

#### Chemin Utilisateur (Étape par Étape) :
1. **Saisie de la Preuve Zelle par l'Agent R.D.** :
   - Cliquez sur le service **Zelle** (icône violette `$`).
   - **Étape 1 :** Prenez en photo ou importez la **Preuve de Virement Zelle** (obligatoire).
   - **Étape 2 :** Entrez la **Somme envoyée par Zelle (`$ USD`)** et choisissez la **Devise de retrait souhaitée par le client** (`🇩🇴 Pesos DOP` ou `🇺🇸 Dollars USD`).
   - Cliquez sur **« Valider & Envoyer pour Vérification Admin »**.
2. **Validation Bancaire par l'Administrateur (`OUI / NON`)** :
   - L'Administrateur ouvre la fiche Zelle depuis la **File d'attente Tâches** (bouton **« Vérifier OUI/NON »** ou **« Fiche Zelle »**).
   - Après vérification sur son compte bancaire américain :
     - Il clique sur **« OUI, Valider »** si les fonds sont bien reçus.
     - Il clique sur **« NON, Refuser »** (avec motif) si le virement n'apparaît pas.
3. **Décaissement au Guichet** :
   - Dès que l'Admin clique sur **OUI**, le montant net exact à remettre au client s'affiche sur la fiche de l'Agent R.D. L'agent remet les fonds et imprime le reçu officiel.

---

## 5. Guide Détaillé par Rôle Utilisateur

### 5.1. Espace Agent Comptoir R.D.
L'Agent Comptoir R.D. dispose d'une barre de navigation à **4 onglets** :
1. **🏠 Accueil (`Guichet`)** :
   - Affiche la carte **Flux numérique cette semaine** (total HTG & équivalent DOP, masquable via l'icône 👁️).
   - Donne accès direct à la bannière **Réception Haïti (MonCash / Natcash)** et à la grille des **Top services** (`MonCash`, `Natcash`, `Zelle`, `Digicel`, `Natcom`, `Claro`, `Altice`).
   - Liste les **Transactions récentes** avec leur statut en direct (`⏳ Vérif. Admin`, `💵 Prêt Versement`, `✅ Clôturé`, `❌ Annulé`).
2. **🕒 Historique (`Mes Transactions`)** :
   - Permet de rechercher toute opération par numéro `#TX`, nom ou téléphone, de filtrer par opérateur ou par période (`Jour`, `Semaine`, `Mois`, `Année`), et de télécharger/partager les **Reçus PDF**.
3. **🏛️ Dépôts (`Versements Hebdo`)** :
   - Affiche le **Bilan Hebdomadaire Guichet & Versements** :
     - **Commissions Récoltées** (vos gains générés sur les transactions).
     - **Montant Dû à l'Admin** (solde net restant à verser à l'administration).
     - **Déposé à l'Admin** (versements enregistrés par l'administration).
4. **⚙️ Paramètres** :
   - Permet de modifier ses informations personnelles, son mot de passe et sa langue d'interface (`FR`, `HT`, `ES`).

---

### 5.2. Espace Agent Terrain Haïti
L'Agent Terrain Haïti dispose d'une barre de navigation épurée à **3 onglets** (identique en style à celle de l'Agent R.D.) :
1. **🏠 Accueil (`Tâches & Soldes`)** :
   - Affiche la carte **Solde en Caisse (HTG)** disponible.
   - Permet de filtrer les tâches en 1 clic : **En Attente**, **Validées**, **Natcash**, **Natcom**, **MonCash**.
   - Chaque carte de tâche affiche le bénéficiaire, le bouton pour **copier le numéro de téléphone** en 1 clic, le montant en **HTG** à verser, et le bouton orange **« Valider & Décaisser »**.
2. **🕒 Historique** :
   - Liste complète des décaissements effectués avec accès aux preuves photos et aux reçus PDF.
3. **⚙️ Paramètres** :
   - Gestion du profil, du numéro de terminal Haïti, des alertes sonores et de la langue (`FR`, `HT`, `ES`).

---

### 5.3. Espace Gestionnaire Numérique
Le Gestionnaire supervise et exécute les opérations numériques (MonCash, Digicel, Natcom, Claro, Altice) :
1. **Flux en Temps Réel (`File d'attente Tâches`)** :
   - Visualise toutes les demandes entrantes, joint la capture d'écran du reçu opérateur et valide la clôture.
   - Peut signaler une anomalie à l'Administrateur via le bouton **« Signaler »** (Contrôle Qualité).
2. **Guichet Saisie** :
   - Peut saisir directement une opération et cocher **« Clôturer immédiatement avec preuve »**.
3. **Trésorerie & Historique** :
   - Suit les volumes traités et exporte les rapports en **CSV** ou **PDF**.

---

### 5.4. Espace Administrateur Général
L'Administrateur contrôle l'intégralité du réseau via le menu latéral complet :
1. **📊 Tableau de bord (`Vue d'ensemble`)** :
   - KPIs en temps réel (Volumes DOP/HTG/USD, revenus bruts, commissions Admin, graphiques de répartition par opérateur, alertes SLA).
2. **📋 File d'attente Tâches** :
   - Supervision de toutes les transactions.
   - **Validation `OUI / NON`** des virements **Zelle** et des **Réceptions Haïti**.
   - **Modification ou Annulation officielle** d'une transaction (avec motif d'audit et remboursement automatique de la flotte).
   - **Consultation complète des détails financiers & bénéficiaires** pour MonCash, Natcash et tous les autres services.
3. **💰 Trésorerie & Soldes** :
   - Suivi de l'état des flottes par opérateur (`Optimal`, `Seuil Bas`, `Critique`) et bouton **« Injecter Flotte / Réapprovisionner »** pour ajouter des fonds.
4. **🏛️ Versements Hebdo (`Liquidations`)** :
   - Suivi par semaine et par agent du **Total Encaissé**, des **Commissions Agents**, du **Net Dû Admin**, et bouton **« Enregistrer un Versement »** lorsqu'un agent remet ses espèces ou effectue un dépôt bancaire.
5. **👥 Gestion Utilisateurs** :
   - Création, modification, suspension de comptes agents/gestionnaires et définition du taux de commission individuel.
6. **🛑 Arrêt d'Urgence (`Kill Switch`)** :
   - Permet de suspendre ou réactiver instantanément un opérateur (ex. maintenance MonCash ou Natcash) sur tous les guichets.
7. **🛡️ Journal d'Audit & ⚙️ Paramètres** :
   - Traçabilité complète de toutes les actions sensibles et configuration en direct des **Taux de Change Officiels** (`100 DOP ➔ HTG` et `1 USD ➔ DOP`) ainsi que des pourcentages de commission par service.

---

## 6. Règles Financières, Taux de Change & Calcul Automatique des Commissions

Le système applique automatiquement les formules comptables suivantes sur chaque transaction :

1. **Envois & Recharges (RD ➔ Haïti)** :
   - `Montant HTG = Montant DOP × Taux Officiel DOP/HTG`
   - **Frais de service guichet** : `0.5%` du montant DOP.
   - **Commission Administrateur** : `1%` du montant DOP (configurable par service dans les Paramètres).
2. **Réception Haïti ➔ Retrait RD (MonCash / Natcash en USD)** :
   - `Équivalent Brut DOP = Montant USD × Taux USD/DOP`
   - **Frais de service déduits au versement** : `0.5%`.
   - `Montant Net à Verser au Client (DOP) = Équivalent Brut DOP - Frais de service (0.5%)`
3. **Virement Zelle Pay (USA ➔ RD)** :
   - **Frais de service** : `0.5%` | **Commission Admin** : `1%`.
   - Le montant net à remettre au client (en `DOP` ou en `USD`) est calculé automatiquement et débloqué uniquement après validation `OUI` de l'Administrateur.
4. **Liquidation Hebdomadaire des Agents R.D.** :
   - `Net Dû à l'Admin = Total Encaissé Semaine - Commissions Récoltées par l'Agent`
   - `Solde Reste à Payer = Net Dû à l'Admin - Montant Déposé à l'Admin`

---

## 7. Reçus Officiels PDF, Sécurité & Support Technique

- **Bordereau Provisoire vs Reçu Officiel Certifié** :
  - Tant qu'une transaction est en attente, le PDF généré porte la mention **« BORDEREAU PROVISOIRE »**.
  - Dès qu'elle est validée avec preuve, le PDF devient un **« REÇU OFFICIEL • D'ALEXIS CERTIFIÉ »** intégrant la photo de la preuve et le cachet d'audit.
  - Si elle est annulée par l'Admin, le reçu porte un filigrane rouge **« TRANSACTION ANNULÉE »** interdisant tout décaissement.
- **Partage Rapide** :
  - Sur mobile comme sur PC, cliquez sur **« Partager le Reçu (PDF) »** pour l'envoyer directement au client sur **WhatsApp** ou par e-mail, ou sur **« Télécharger Reçu (PDF) »** pour l'imprimer.

