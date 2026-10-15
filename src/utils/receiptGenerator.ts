import { Transaction } from '../types';

/**
 * Génère le texte récapitulatif du reçu pour le partage SMS / WhatsApp / Presse-papier
 */
export function getReceiptShareText(tx: Transaction): string {
  const isCompleted = tx.status === 'completed';
  const statusLabel = isCompleted ? '✅ EFFECTUÉ & CLÔTURÉ' : '⏳ EN COURS / EN ATTENTE';
  const dateStr = new Date(tx.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `🧾 *D'ALEXIS TRANSFERENCIA*
Transfert & Services RD ➔ Haïti
--------------------------------
📄 *Réf :* ${tx.referenceNumber}
📅 *Date :* ${dateStr}
📶 *Service :* ${tx.operator.toUpperCase()}
⚡ *Statut :* ${statusLabel}
--------------------------------
👤 *Bénéficiaire :* ${tx.receiverName}
📞 *Téléphone :* ${tx.receiverPhone}
💵 *Montant Reçu :* ${tx.amountHTG.toLocaleString()} HTG
💰 *Montant Payé :* ${tx.amountDOP.toLocaleString()} DOP
📊 *Taux :* 100 DOP = ${Math.round(tx.exchangeRate * 100)} HTG
--------------------------------
🏢 Agent : ${tx.createdByName || 'Agence Santo Domingo'}
🔒 _Transaction officielle certifiée D'Alexis_`;
}

/**
 * Dessine un reçu graphique officiel haute définition sur HTML5 Canvas
 */
export async function generateReceiptCanvas(tx: Transaction): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 650;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d\'initialiser le contexte canvas 2D');

  const isCompleted = tx.status === 'completed';

  // Fond blanc avec texture soignée
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bandeau supérieur sombre
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, canvas.width, 16);

  // Logo D'Alexis
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(285, 45, 80, 80, 20);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('D', 325, 102);

  // Titre & En-tête
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText("D'Alexis", 325, 160);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 16px sans-serif';
  ctx.fillText('Transferencia y accesorio', 325, 185);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px sans-serif';
  ctx.fillText('RD ➔ Haïti • Agence République Dominicaine', 325, 208);

  // Statut Badge
  const badgeY = 230;
  ctx.fillStyle = isCompleted ? '#EFF6FF' : '#FFFBEB';
  ctx.beginPath();
  ctx.roundRect(125, badgeY, 400, 36, 18);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isCompleted ? '#BFDBFE' : '#FDE68A';
  ctx.stroke();

  ctx.fillStyle = isCompleted ? '#1E40AF' : '#92400E';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(
    isCompleted ? '✔ REÇU OFFICIEL • DÉCAISSEMENT EFFECTUÉ' : '⏳ BORDEREAU OFFICIEL • EN ATTENTE',
    325,
    badgeY + 23
  );

  // Ligne pointillée
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(40, 290);
  ctx.lineTo(610, 290);
  ctx.stroke();
  ctx.setLineDash([]);

  // Métadonnées boîte grise
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.roundRect(40, 310, 570, 95, 16);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('N° de Référence :', 60, 345);
  ctx.fillText('Date & Heure :', 60, 380);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(tx.referenceNumber, 590, 345);

  const dateFormatted = new Date(tx.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  ctx.font = '600 14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(dateFormatted, 590, 380);

  // Infos Expéditeur & Destinataire
  let currentY = 435;
  ctx.textAlign = 'left';

  // Opérateur Badge
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('OPÉRATEUR / SERVICE :', 45, currentY);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'black 15px sans-serif';
  ctx.fillText(tx.operator.toUpperCase(), 230, currentY);

  currentY += 35;
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EXPÉDITEUR (RD)', 45, currentY);
  ctx.fillText('BÉNÉFICIAIRE (HAÏTI)', 345, currentY);

  currentY += 25;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(tx.senderName || 'Client Comptoir', 45, currentY);
  ctx.fillText(tx.receiverName || 'Bénéficiaire', 345, currentY);

  currentY += 22;
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(tx.senderPhone || '---', 45, currentY);
  ctx.fillText(tx.receiverPhone || '---', 345, currentY);

  // Ligne pointillée
  currentY += 30;
  ctx.strokeStyle = '#CBD5E1';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(40, currentY);
  ctx.lineTo(610, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Détails Financiers (Boîte verte)
  currentY += 25;
  ctx.fillStyle = '#F0FDF4';
  ctx.beginPath();
  ctx.roundRect(40, currentY, 570, 160, 20);
  ctx.fill();
  ctx.strokeStyle = '#BBF7D0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  let finY = currentY + 35;
  ctx.fillStyle = '#475569';
  ctx.font = '600 15px sans-serif';
  ctx.fillText('Montant Encaissé (RD) :', 65, finY);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${tx.amountDOP.toLocaleString()} DOP`, 585, finY);

  finY += 32;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.fillText('Taux Appliqué :', 65, finY);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#334155';
  ctx.font = '600 15px sans-serif';
  ctx.fillText(`100 DOP = ${Math.round(tx.exchangeRate * 100)} HTG`, 585, finY);

  finY += 20;
  ctx.strokeStyle = '#DCFCE7';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(65, finY);
  ctx.lineTo(585, finY);
  ctx.stroke();
  ctx.setLineDash([]);

  finY += 40;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('MONTANT LIVRÉ :', 65, finY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#15803D';
  ctx.font = '900 28px sans-serif';
  ctx.fillText(`${tx.amountHTG.toLocaleString()} HTG`, 585, finY);

  // Bas de page : Agent & Signature
  currentY += 200;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '600 13px sans-serif';
  ctx.fillText(`Agent émetteur : ${tx.createdByName || 'Agence RD'}`, 45, currentY);
  ctx.fillText(`Noeud : ${tx.createdByNode || 'node-01'}`, 45, currentY + 22);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#2563EB';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('✔ TRANSACTION OFFICIELLE SÉCURISÉE', 605, currentY);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px sans-serif';
  ctx.fillText("Plateforme D'Alexis Transferencia", 605, currentY + 22);

  return canvas;
}

/**
 * Télécharge le reçu au format image PNG haute résolution
 */
export async function downloadReceiptImage(tx: Transaction): Promise<void> {
  const canvas = await generateReceiptCanvas(tx);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Recu-${tx.referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Partage le reçu via l'API Web Share native (WhatsApp, SMS, etc.) ou fallback presse-papier / WhatsApp
 */
export async function shareReceipt(tx: Transaction): Promise<boolean> {
  const shareText = getReceiptShareText(tx);
  const cleanRef = tx.referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_');

  // Tentative de partage avec fichier image (sur mobile Android/iOS)
  try {
    const canvas = await generateReceiptCanvas(tx);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

    if (blob && navigator.canShare) {
      const file = new File([blob], `Recu-${cleanRef}.png`, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Reçu ${tx.referenceNumber} - D'Alexis`,
          text: shareText,
          files: [file],
        });
        return true;
      }
    }

    if (navigator.share) {
      await navigator.share({
        title: `Reçu ${tx.referenceNumber} - D'Alexis`,
        text: shareText,
      });
      return true;
    }
  } catch (err: any) {
    // Si l'utilisateur annule le menu de partage, on ne fait rien
    if (err?.name === 'AbortError') return true;
  }

  // Fallback : Ouverture directe WhatsApp ou copie dans le presse-papier
  try {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    return true;
  } catch {
    navigator.clipboard.writeText(shareText);
    return false;
  }
}
