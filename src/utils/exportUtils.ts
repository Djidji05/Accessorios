/**
 * Utilitaires d'exportation réels en fichier CSV/Excel et PDF pour l'application Alexis Transferencia
 * Permet l'exportation complète de tout le système financier (Revenus, Encaissements, Décaissements, Commissions, Flottes et Transactions).
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export interface SummaryBox {
  label: string;
  value: string;
  subtext?: string;
}

/**
 * Exporte un tableau d'objets en fichier CSV téléchargeable (UTF-8 BOM)
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  extraSummaryRows: string[][] = []
) {
  if (!data || data.length === 0) {
    alert("Aucune donnée disponible à exporter.");
    return;
  }

  // En-têtes CSV
  const headerRow = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(';');

  // Lignes de données CSV
  const dataRows = data.map(item => {
    return columns.map(col => {
      const val = col.accessor(item);
      const strVal = val === null || val === undefined ? '' : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(';');
  });

  // Lignes de récapitulatif supplémentaire au début
  const summaryHTML = extraSummaryRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';'));

  // Contenu complet avec UTF-8 BOM pour Excel
  const lines = [
    ...summaryHTML,
    ...(summaryHTML.length > 0 ? [''] : []),
    headerRow,
    ...dataRows
  ];

  const csvContent = '\uFEFF' + lines.join('\r\n');

  // Déclenchement du téléchargement navigateur
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { jsPDF } from 'jspdf';

/**
 * Génère et télécharge directement un document PDF vectoriel officiel
 */
export function exportToPDF<T>(
  data: T[],
  columns: ExportColumn<T>[],
  title: string,
  subtitle = 'Rapport Officiel de la Plateforme',
  summaryBoxes: SummaryBox[] = [],
  _extraHTML = ''
) {
  if (!data || data.length === 0) {
    alert("Aucune donnée disponible pour le téléchargement du PDF.");
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2; // 186mm
  const nowStr = new Date().toLocaleDateString('fr-FR');
  const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Function to draw header & footer on any page
  const drawPageDecorations = (pageNum: number) => {
    // Header banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("ALEXIS TRANSFERENCIA", marginX, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Plateforme de Gestion & Transferts Transfrontaliers (RD ⇄ Haïti)", marginX, 17);
    doc.text("Direction Financière & Contrôle des Opérations", marginX, 22);

    // Right Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.text(title.toUpperCase().slice(0, 36), pageWidth - marginX, 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Édité le : ${nowStr} à ${nowTime} • Total : ${data.length} enregistrements`, pageWidth - marginX, 17, { align: 'right' });
    doc.text(`Document officiel téléchargeable`, pageWidth - marginX, 22, { align: 'right' });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Alexis Transferencia • Document Officiel d'Exploitation & Supervision Bancaire (RD ⇄ Haïti)", marginX, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
  };

  let pageIndex = 1;
  drawPageDecorations(pageIndex);

  let curY = 32;

  // Title & Subtitle block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(title, marginX, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  curY += 5;
  doc.text(subtitle, marginX, curY);
  curY += 6;

  // Summary Boxes (grid of 3 columns max)
  if (summaryBoxes.length > 0) {
    const boxGap = 3;
    const cols = Math.min(summaryBoxes.length, 3);
    const boxWidth = (contentWidth - boxGap * (cols - 1)) / cols;
    const boxHeight = 15;

    summaryBoxes.forEach((box, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const bx = marginX + col * (boxWidth + boxGap);
      const by = curY + row * (boxHeight + boxGap);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(bx, by, boxWidth, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(box.label.toUpperCase(), bx + 3, by + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(box.value, bx + 3, by + 9.5);

      if (box.subtext) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(37, 99, 235);
        doc.text(box.subtext, bx + 3, by + 13);
      }
    });

    const totalRows = Math.ceil(summaryBoxes.length / cols);
    curY += totalRows * (boxHeight + boxGap) + 4;
  }

  // Table Setup
  const colCount = columns.length;
  const colWidth = contentWidth / colCount;
  const rowHeight = 6.5;

  const drawTableHeader = (y: number) => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(marginX, y, contentWidth, rowHeight + 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);

    columns.forEach((col, idx) => {
      const cx = marginX + idx * colWidth + 2;
      const truncatedHeader = doc.splitTextToSize(col.header.toUpperCase(), colWidth - 4)[0] || col.header.toUpperCase();
      doc.text(truncatedHeader, cx, y + 5);
    });
  };

  drawTableHeader(curY);
  curY += rowHeight + 1;

  // Table Data Rows
  data.forEach((item, rowIdx) => {
    // Page break check
    if (curY + rowHeight > pageHeight - 16) {
      doc.addPage();
      pageIndex++;
      drawPageDecorations(pageIndex);
      curY = 32;
      drawTableHeader(curY);
      curY += rowHeight + 1;
    }

    const bg = rowIdx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(marginX, curY, contentWidth, rowHeight, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(marginX, curY + rowHeight, marginX + contentWidth, curY + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);

    columns.forEach((col, colIdx) => {
      const val = col.accessor(item);
      const strVal = val === null || val === undefined ? '-' : String(val);
      const cx = marginX + colIdx * colWidth + 2;
      const fitText = doc.splitTextToSize(strVal, colWidth - 3)[0] || strVal;
      doc.text(fitText, cx, curY + 4.5);
    });

    curY += rowHeight;
  });

  // Save / Trigger Download directly in browser
  const safeFilename = title.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeFilename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Exports CSV & PDF pour les Transactions (Avec Détails Financiers)
 */
export function exportTransactionsToCSV(transactions: any[], filename = 'Alexis_Transferencia_Transactions') {
  const totalVolumeDOP = transactions.reduce((acc, t) => acc + (t.amountDOP || 0), 0);
  const totalVolumeHTG = transactions.reduce((acc, t) => acc + (t.amountHTG || 0), 0);
  const totalCommissionsDOP = transactions.reduce((acc, t) => acc + (t.commissionDOP || 0), 0);
  const totalFeesDOP = transactions.reduce((acc, t) => acc + (t.feeDOP || 0), 0);

  const extraSummary = [
    ['=== RECAPITULATIF DES FLUX ET DE L\'ARGENT REÇU ==='],
    ['Volume Total Traité en Pesos (RD)', `${totalVolumeDOP.toLocaleString()} DOP`],
    ['Volume Total Traité en Gourdes (Haïti)', `${totalVolumeHTG.toLocaleString()} HTG`],
    ['Commissions Administrateur Cumulées', `${totalCommissionsDOP.toLocaleString()} DOP`],
    ['Frais de Service Guichet (3%) Collectés', `${totalFeesDOP.toLocaleString()} DOP`],
    ['Nombre Total de Transactions', `${transactions.length}`],
    ['=== DETAIL INDIVIDUEL DES TRANSACTIONS ===']
  ];

  const columns: ExportColumn<any>[] = [
    { header: 'Référence', accessor: (t) => t.referenceNumber },
    { header: 'Date', accessor: (t) => new Date(t.createdAt).toLocaleString('fr-FR') },
    { header: 'Opérateur', accessor: (t) => t.operator?.toUpperCase() },
    { header: 'Type Service', accessor: (t) => t.serviceType },
    { header: 'Canal', accessor: (t) => t.channel },
    { header: 'Expéditeur', accessor: (t) => t.senderName },
    { header: 'Tél. Expéditeur', accessor: (t) => t.senderPhone },
    { header: 'Bénéficiaire', accessor: (t) => t.receiverName },
    { header: 'Tél. Bénéficiaire', accessor: (t) => t.receiverPhone },
    { header: 'Montant Reçu (DOP)', accessor: (t) => t.amountDOP },
    { header: 'Frais Collectés (DOP)', accessor: (t) => t.feeDOP || 0 },
    { header: 'Commission Admin (DOP)', accessor: (t) => t.commissionDOP || 0 },
    { header: 'Taux Change', accessor: (t) => t.exchangeRate },
    { header: 'Montant Livré (HTG)', accessor: (t) => t.amountHTG },
    { header: 'Montant (USD)', accessor: (t) => t.amountUSD || 0 },
    { header: 'Statut', accessor: (t) => t.status },
    { header: 'Agent Créateur', accessor: (t) => t.createdByName },
  ];

  exportToCSV(transactions, columns, filename, extraSummary);
}

export function exportTransactionsToPDF(transactions: any[], title = 'Rapport Financier des Transactions') {
  const totalVolumeDOP = transactions.reduce((acc, t) => acc + (t.amountDOP || 0), 0);
  const totalVolumeHTG = transactions.reduce((acc, t) => acc + (t.amountHTG || 0), 0);
  const totalCommissionsDOP = transactions.reduce((acc, t) => acc + (t.commissionDOP || 0), 0);

  const summaryBoxes: SummaryBox[] = [
    { label: 'Volume Reçu (Pesos RD)', value: `${totalVolumeDOP.toLocaleString()} DOP`, subtext: `${transactions.length} Transactions` },
    { label: 'Volume Livré (Haïti)', value: `${totalVolumeHTG.toLocaleString()} HTG`, subtext: 'Converti au taux officiel' },
    { label: 'Commissions Admin', value: `${totalCommissionsDOP.toLocaleString()} DOP`, subtext: 'Revenus nets enregistrés' },
  ];

  const columns: ExportColumn<any>[] = [
    { header: 'Référence', accessor: (t) => t.referenceNumber },
    { header: 'Date', accessor: (t) => new Date(t.createdAt).toLocaleDateString('fr-FR') },
    { header: 'Opérateur', accessor: (t) => t.operator?.toUpperCase() },
    { header: 'Expéditeur', accessor: (t) => t.senderName },
    { header: 'Bénéficiaire', accessor: (t) => t.receiverName },
    { header: 'Reçu (DOP)', accessor: (t) => `${t.amountDOP?.toLocaleString()} DOP` },
    { header: 'Comm. Admin', accessor: (t) => `${(t.commissionDOP || 0).toLocaleString()} DOP` },
    { header: 'Livré (HTG)', accessor: (t) => `${t.amountHTG?.toLocaleString()} HTG` },
    { header: 'Statut', accessor: (t) => t.status === 'completed' ? 'Validé' : 'En cours' },
  ];

  exportToPDF(transactions, columns, title, 'Historique complet de l\'argent reçu et distribué (RD ⇄ Haïti)', summaryBoxes);
}

/**
 * Exports CSV & PDF pour les Logs d'Audit
 */
export function exportAuditLogsToCSV(logs: any[], filename = 'Alexis_Transferencia_Audit_Logs') {
  const columns: ExportColumn<any>[] = [
    { header: 'Horodatage', accessor: (l) => new Date(l.timestamp).toLocaleString('fr-FR') },
    { header: 'Acteur', accessor: (l) => l.actorName },
    { header: 'Rôle', accessor: (l) => l.actorRole },
    { header: 'Action', accessor: (l) => l.action },
    { header: 'Cible', accessor: (l) => l.targetType },
    { header: 'Priorité', accessor: (l) => l.priority || 'Medium' },
    { header: 'Nœud ID', accessor: (l) => l.nodeId },
    { header: 'Détails Action', accessor: (l) => l.details },
  ];

  exportToCSV(logs, columns, filename);
}

export function exportAuditLogsToPDF(logs: any[], title = 'Journaux d\'Audit & Supervision System') {
  const columns: ExportColumn<any>[] = [
    { header: 'Horodatage', accessor: (l) => new Date(l.timestamp).toLocaleString('fr-FR') },
    { header: 'Acteur', accessor: (l) => l.actorName },
    { header: 'Rôle', accessor: (l) => l.actorRole },
    { header: 'Action', accessor: (l) => l.action },
    { header: 'Priorité', accessor: (l) => l.priority || 'Medium' },
    { header: 'Détails', accessor: (l) => l.details },
  ];

  exportToPDF(logs, columns, title, 'Journal inaltérable des actions administrateurs & opérateurs');
}

/**
 * Exports CSV & PDF pour la TRÉSORERIE & SYSTÈME FINANCIER GLOBAL
 * Inclut le montant brut total, l'argent reçu, les frais guichet, les commissions et les soldes de flotte.
 */
export function exportTreasuryReportToCSV(
  accountBalances: any[],
  transactions: any[] = [],
  filename = 'Alexis_Transferencia_Rapport_Financier_Trésorerie',
  treasuryLogs: any[] = []
) {
  const totalDOP = accountBalances.filter(b => b.currency === 'DOP').reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalHTG = accountBalances.filter(b => b.currency === 'HTG').reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalUSD = accountBalances.filter(b => b.currency === 'USD').reduce((acc, curr) => acc + (curr.balance || 0), 0);

  const totalVolumeDOP = transactions.reduce((sum, t) => sum + (t.amountDOP || 0), 0);
  const totalVolumeHTG = transactions.reduce((sum, t) => sum + (t.amountHTG || 0), 0);
  const totalFeesDOP = transactions.reduce((sum, t) => sum + (t.feeDOP || Math.round((t.amountDOP || 0) * 0.03)), 0);
  const totalCommissionsDOP = transactions.reduce((sum, t) => sum + (t.commissionDOP || Math.round((t.amountDOP || 0) * 0.01)), 0);
  const totalPlatformRevenueDOP = totalFeesDOP + totalCommissionsDOP;

  const extraSummary = [
    ['=== BILAN ET SYSTEME FINANCIER GLOBAL ALEXIS TRANSFERENCIA ==='],
    ['Revenu Brut Total Agence (Frais + Commissions)', `${totalPlatformRevenueDOP.toLocaleString()} DOP`],
    ['Frais de Service Guichet Encaissés (3%)', `${totalFeesDOP.toLocaleString()} DOP`],
    ['Commissions Administrateur Cumulées', `${totalCommissionsDOP.toLocaleString()} DOP`],
    ['Volume Total Argent Reçu en Agences (Pesos RD)', `${totalVolumeDOP.toLocaleString()} DOP`],
    ['Volume Total Argent Livré aux Bénéficiaires (Gourdes HTG)', `${totalVolumeHTG.toLocaleString()} HTG`],
    ['Liquidités Totales Disponibles RD (Comptes Bancaires & Caisses DOP)', `${totalDOP.toLocaleString()} DOP`],
    ['Réserves Totales Flottes Haïti (MonCash, Natcash, Digicel, Natcom HTG)', `${totalHTG.toLocaleString()} HTG`],
    ['Réserves US Dollars (Compte Zelle Pay USD)', `$${totalUSD.toLocaleString()} USD`],
    ['Nombre Total de Transactions Enregistrées', `${transactions.length}`],
  ];

  if (treasuryLogs && treasuryLogs.length > 0) {
    extraSummary.push(
      ['=== JOURNAL DES OPERATIONS DE TRESORERIE (RECHARGES, DEPOTS & TRANSFERTS) ==='],
      ['Référence', 'Type Opération', 'Compte Source / Flotte', 'Montant', 'Devise', 'Auteur', 'Date / Heure', 'Statut']
    );
    treasuryLogs.forEach(log => {
      extraSummary.push([
        log.id || '',
        log.type?.replace('_', ' ') || '',
        log.account || '',
        log.amount ? log.amount.toString() : '0',
        log.currency || '',
        log.author || '',
        log.date || '',
        log.status === 'completed' ? 'Validé' : log.status || ''
      ]);
    });
  }

  extraSummary.push(
    [''],
    ['=== DETAIL DES COMPTES DE TRESORERIE ET FLOTTES OPERATEURS ===']
  );

  const columns: ExportColumn<any>[] = [
    { header: 'Identifiant Compte', accessor: (b) => b.id },
    { header: 'Nom du Compte / Flotte', accessor: (b) => b.name },
    { header: 'Opérateur', accessor: (b) => b.operator?.toUpperCase() },
    { header: 'Solde Disponible', accessor: (b) => b.balance },
    { header: 'Devise', accessor: (b) => b.currency },
    { header: 'Numéro de Compte', accessor: (b) => b.accountNumber || '-' },
    { header: 'État Liquidité', accessor: (b) => b.status === 'optimal' ? 'Optimal (>= 10 000)' : 'Alerte (< 10 000)' },
    { header: 'Dernière Mise à Jour', accessor: (b) => new Date(b.lastUpdated).toLocaleString('fr-FR') },
  ];

  exportToCSV(accountBalances, columns, filename, extraSummary);
}

export function exportTreasuryReportToPDF(
  accountBalances: any[],
  transactions: any[] = [],
  title = 'Rapport Financier Consolidé & Trésorerie',
  treasuryLogs: any[] = []
) {
  const totalDOP = accountBalances.filter(b => b.currency === 'DOP').reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalHTG = accountBalances.filter(b => b.currency === 'HTG').reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalUSD = accountBalances.filter(b => b.currency === 'USD').reduce((acc, curr) => acc + (curr.balance || 0), 0);

  const totalVolumeDOP = transactions.reduce((sum, t) => sum + (t.amountDOP || 0), 0);
  const totalVolumeHTG = transactions.reduce((sum, t) => sum + (t.amountHTG || 0), 0);
  const totalFeesDOP = transactions.reduce((sum, t) => sum + (t.feeDOP || Math.round((t.amountDOP || 0) * 0.03)), 0);
  const totalCommissionsDOP = transactions.reduce((sum, t) => sum + (t.commissionDOP || Math.round((t.amountDOP || 0) * 0.01)), 0);
  const totalPlatformRevenueDOP = totalFeesDOP + totalCommissionsDOP;

  const summaryBoxes: SummaryBox[] = [
    { label: 'Revenu Brut Total Agence', value: `${totalPlatformRevenueDOP.toLocaleString()} DOP`, subtext: 'Frais Guichet + Comm. Admin' },
    { label: 'Volume Argent Reçu (RD)', value: `${totalVolumeDOP.toLocaleString()} DOP`, subtext: `${totalVolumeHTG.toLocaleString()} HTG distribués` },
    { label: 'Liquidités Disponibles (RD)', value: `${totalDOP.toLocaleString()} DOP`, subtext: 'Comptes Banreservas & Caisses' },
    { label: 'Réserves Flottes (Haïti)', value: `${totalHTG.toLocaleString()} HTG`, subtext: 'MonCash, Natcash, Digicel, Natcom' },
    { label: 'Commissions Encaissées', value: `${totalCommissionsDOP.toLocaleString()} DOP`, subtext: 'Prélèvements sur services' },
    { label: 'Frais de Service (3%)', value: `${totalFeesDOP.toLocaleString()} DOP`, subtext: 'Collectés au comptoir' },
  ];

  const columns: ExportColumn<any>[] = [
    { header: 'Nom du Compte / Flotte', accessor: (b) => b.name },
    { header: 'Opérateur', accessor: (b) => b.operator?.toUpperCase() },
    { header: 'Solde Disponible', accessor: (b) => `${(b.balance || 0).toLocaleString()} ${b.currency}` },
    { header: 'Devise', accessor: (b) => b.currency },
    { header: 'État Liquidité', accessor: (b) => b.status === 'optimal' ? 'Optimal (>= 10 000)' : 'Alerte (< 10 000)' },
    { header: 'Numéro Compte', accessor: (b) => b.accountNumber || '-' },
  ];

  let logsHTML = '';
  if (treasuryLogs && treasuryLogs.length > 0) {
    const logRows = treasuryLogs.map((log, idx) => {
      const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      return `
        <tr style="background-color: ${bg};">
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; font-family: monospace; font-weight: bold; color: #0F172A;">${log.id}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; color: #475569; text-transform: uppercase;">${log.type?.replace('_', ' ')}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; color: #1E293B; font-weight: 600;">${log.account}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; text-align: right; font-family: monospace; font-weight: bold; color: #0F172A;">+${(log.amount || 0).toLocaleString()} ${log.currency}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; color: #475569;">${log.author}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; color: #64748B;">${log.date}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 10px; text-align: center; color: #166534; font-weight: bold;">Validé</td>
        </tr>
      `;
    }).join('');

    logsHTML = `
      <div style="margin-top: 30px; border-top: 2px solid #0F172A; padding-top: 15px;">
        <div style="font-size: 14px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">
          Journal des Opérations de Trésorerie (Recharges & Mouvements)
        </div>
        <div style="font-size: 10px; color: #64748B; margin-bottom: 12px;">
          Historique exhaustif des réapprovisionnements de flottes, dépôts bancaires et mouvements de caisses.
        </div>
        <table>
          <thead>
            <tr>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: left; font-size: 10px; text-transform: uppercase; color: #0F172A;">Référence</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: left; font-size: 10px; text-transform: uppercase; color: #0F172A;">Type</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: left; font-size: 10px; text-transform: uppercase; color: #0F172A;">Compte Source / Flotte</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: right; font-size: 10px; text-transform: uppercase; color: #0F172A;">Montant</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: left; font-size: 10px; text-transform: uppercase; color: #0F172A;">Auteur</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: left; font-size: 10px; text-transform: uppercase; color: #0F172A;">Date</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #0F172A; text-align: center; font-size: 10px; text-transform: uppercase; color: #0F172A;">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${logRows}
          </tbody>
        </table>
      </div>
    `;
  }

  exportToPDF(
    accountBalances,
    columns,
    title,
    'Bilan financier consolidé : Argent reçu, revenus bruts, frais guichet, commissions, réserves de flottes et journal des opérations',
    summaryBoxes,
    logsHTML
  );
}

