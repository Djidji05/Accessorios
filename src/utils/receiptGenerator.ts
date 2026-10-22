import { Transaction } from '../types';
import { jsPDF } from 'jspdf';

/**
 * Génère le texte récapitulatif du reçu pour le partage SMS / WhatsApp / Presse-papier
 */
export function getReceiptShareText(tx: Transaction): string {
  const isCompleted = tx.status === 'completed';
  const isCancelled = tx.status === 'cancelled';
  const statusLabel = isCancelled 
    ? '❌ TRANSACTION ANNULÉE' 
    : isCompleted 
    ? '✅ EFFECTUÉ & CLÔTURÉ' 
    : '⏳ EN COURS / EN ATTENTE';
  const dateStr = new Date(tx.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isTelecom = ['digicel', 'claro', 'altice', 'natcom'].includes(tx.operator);
  const showReceiverName = !isTelecom && tx.receiverName && !tx.receiverName.startsWith('Recharge');

  return `🧾 *D'ALEXIS TRANSFERENCIA*
Transfert & Services RD ➔ Haïti
--------------------------------
📄 *Réf :* ${tx.referenceNumber}
📅 *Date :* ${dateStr}
📶 *Service :* ${tx.operator.toUpperCase()}
⚡ *Statut :* ${statusLabel}
${isCancelled && tx.cancellationReason ? `⚠️ *Motif d'annulation :* ${tx.cancellationReason}\n` : ''}--------------------------------
${showReceiverName ? `👤 *Bénéficiaire :* ${tx.receiverName}\n` : ''}📞 *${isTelecom ? 'Numéro Rechargé' : 'Téléphone'} :* ${tx.receiverPhone}
💵 *Montant Reçu :* ${tx.amountHTG.toLocaleString()} HTG
💰 *Montant Payé :* ${tx.amountDOP.toLocaleString()} DOP
📊 *Taux :* 100 DOP = ${Math.round(tx.exchangeRate * 100)} HTG
--------------------------------
🏢 Agent : ${tx.createdByName || 'Agence Santo Domingo'}
🔒 _${isCancelled ? 'Transaction annulée et révoquée' : 'Transaction officielle certifiée D\'Alexis'}_`;
}

/**
 * Dessine un reçu graphique officiel haute définition sur HTML5 Canvas
 */
export async function generateReceiptCanvas(tx: Transaction): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const hasProof = !!tx.proofUrl;
  const isCancelled = tx.status === 'cancelled';
  const isCompleted = tx.status === 'completed';
  canvas.width = 650;
  canvas.height = (hasProof ? 1160 : 920) + (isCancelled ? 90 : 0);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d\'initialiser le contexte canvas 2D');

  // Fond blanc avec texture soignée
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bandeau supérieur sombre (ou rouge si annulé)
  ctx.fillStyle = isCancelled ? '#BE123C' : '#0F172A';
  ctx.fillRect(0, 0, canvas.width, 16);

  // Logo D'Alexis
  ctx.fillStyle = isCancelled ? '#BE123C' : '#0F172A';
  ctx.beginPath();
  ctx.roundRect(285, 45, 80, 80, 20);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isCancelled ? '✕' : 'D', 325, 102);

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
  ctx.fillStyle = isCancelled ? '#FEF2F2' : isCompleted ? '#EFF6FF' : '#FFFBEB';
  ctx.beginPath();
  ctx.roundRect(100, badgeY, 450, 36, 18);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isCancelled ? '#FECACA' : isCompleted ? '#BFDBFE' : '#FDE68A';
  ctx.stroke();

  ctx.fillStyle = isCancelled ? '#991B1B' : isCompleted ? '#1E40AF' : '#92400E';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(
    isCancelled 
      ? '✖ TRANSACTION OFFICIELLEMENT ANNULÉE' 
      : isCompleted 
      ? '✔ REÇU OFFICIEL • DÉCAISSEMENT EFFECTUÉ' 
      : '⏳ BORDEREAU OFFICIEL • EN ATTENTE',
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

  const isTelecomOp = ['digicel', 'claro', 'altice', 'natcom'].includes(tx.operator);
  const showReceiverNameCanvas = !isTelecomOp && tx.receiverName && !tx.receiverName.startsWith('Recharge');

  currentY += 35;
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EXPÉDITEUR (RD)', 45, currentY);
  ctx.fillText(isTelecomOp ? 'NUMÉRO RECHARGÉ' : 'BÉNÉFICIAIRE (HAÏTI)', 345, currentY);

  currentY += 25;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(tx.senderName || 'Client Comptoir', 45, currentY);
  ctx.fillText(showReceiverNameCanvas ? tx.receiverName : (tx.receiverPhone || '---'), 345, currentY);

  currentY += 22;
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(tx.senderPhone || '---', 45, currentY);
  if (showReceiverNameCanvas) {
    ctx.fillText(tx.receiverPhone || '---', 345, currentY);
  }

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
  currentY += 185;

  if (isCancelled) {
    ctx.fillStyle = '#FEF2F2';
    ctx.beginPath();
    ctx.roundRect(40, currentY, 570, 75, 14);
    ctx.fill();
    ctx.strokeStyle = '#FECACA';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠ MOTIF OFFICIEL D\'ANNULATION :', 60, currentY + 24);

    ctx.fillStyle = '#7F1D1D';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(tx.cancellationReason || "Annulé par l'administration", 60, currentY + 48);

    currentY += 90;
  }

  if (hasProof) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = tx.proofUrl!;
      });
      if (img.width > 0 && img.height > 0) {
        ctx.fillStyle = '#EFF6FF';
        ctx.beginPath();
        ctx.roundRect(40, currentY, 570, 210, 16);
        ctx.fill();
        ctx.strokeStyle = '#BFDBFE';
        ctx.stroke();

        ctx.fillStyle = '#1E40AF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('📷 PREUVE PHOTOGRAPHIQUE DU DÉCAISSEMENT / REÇU :', 60, currentY + 24);

        const maxW = 530;
        const maxH = 160;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = 40 + (570 - drawW) / 2;
        const drawY = currentY + 35 + (maxH - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        currentY += 230;
      }
    } catch {}
  }

  currentY += 20;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '600 13px sans-serif';
  ctx.fillText(`Agent émetteur : ${tx.createdByName || 'Agence RD'}`, 45, currentY);
  ctx.fillText(`Noeud : ${tx.createdByNode || 'node-01'}`, 45, currentY + 22);

  ctx.textAlign = 'right';
  ctx.fillStyle = isCancelled ? '#DC2626' : '#2563EB';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(isCancelled ? '✖ TRANSACTION RÉVOQUÉE ET ANNULÉE' : '✔ TRANSACTION OFFICIELLE SÉCURISÉE', 605, currentY);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px sans-serif';
  ctx.fillText("Plateforme D'Alexis Transferencia", 605, currentY + 22);

  return canvas;
}

/**
 * Génère un document PDF officiel haute définition à partir du canvas
 */
export async function generateReceiptPDF(tx: Transaction): Promise<jsPDF> {
  const canvas = await generateReceiptCanvas(tx);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Format ticket thermique / A6 vertical (100mm de large)
  const pdfWidth = 100;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
  });

  doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  return doc;
}

/**
 * Télécharge le reçu au format PDF
 */
export async function downloadReceiptPDF(tx: Transaction): Promise<void> {
  const doc = await generateReceiptPDF(tx);
  const cleanRef = tx.referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  doc.save(`Recu_${cleanRef}.pdf`);
}

/**
 * Partage le reçu PDF via l'API Web Share native (WhatsApp, SMS, Email, etc.) ou fallback WhatsApp
 */
export async function shareReceiptPDF(tx: Transaction): Promise<boolean> {
  const shareText = getReceiptShareText(tx);
  const cleanRef = tx.referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_');

  try {
    const doc = await generateReceiptPDF(tx);
    const pdfBlob = doc.output('blob');

    if (pdfBlob && typeof navigator !== 'undefined' && navigator.canShare) {
      const file = new File([pdfBlob], `Recu_${cleanRef}.pdf`, { type: 'application/pdf' });
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
    if (err?.name === 'AbortError') return true;
  }

  // Fallback : ouverture WhatsApp avec texte récapitulatif + téléchargement direct du PDF
  try {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    await downloadReceiptPDF(tx);
    return true;
  } catch {
    navigator.clipboard.writeText(shareText);
    await downloadReceiptPDF(tx);
    return false;
  }
}

/**
 * Télécharge le reçu au format image PNG (pour compatibilité)
 */
export async function downloadReceiptImage(tx: Transaction): Promise<void> {
  return downloadReceiptPDF(tx);
}

/**
 * Partage le reçu (pour compatibilité)
 */
export async function shareReceipt(tx: Transaction): Promise<boolean> {
  return shareReceiptPDF(tx);
}
