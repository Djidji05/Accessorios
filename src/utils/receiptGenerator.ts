import { Transaction } from '../types';
import { jsPDF } from 'jspdf';

/**
 * Génère le texte récapitulatif du reçu pour le partage SMS / WhatsApp / Presse-papier
 */
export function getReceiptShareText(tx: Transaction, lang: string = 'FR'): string {
  const isCompleted = tx.status === 'completed';
  const isCancelled = tx.status === 'cancelled';
  const isES = lang === 'ES';
  const isHT = lang === 'HT';

  const statusLabel = isCancelled 
    ? (isES ? '❌ TRANSACCIÓN CANCELADA' : isHT ? '❌ TRANZAKSYON ANILE' : '❌ TRANSACTION ANNULÉE') 
    : isCompleted 
    ? (isES ? '✅ REALIZADO Y COMPLETADO' : isHT ? '✅ FÈT AK VALIDE' : '✅ EFFECTUÉ & CLÔTURÉ') 
    : (isES ? '⏳ EN PROCESO / EN ESPERA' : isHT ? '⏳ AN KOU / AP TANN' : '⏳ EN COURS / EN ATTENTE');

  const localeCode = isES ? 'es-DO' : isHT ? 'fr-HT' : 'fr-FR';
  const dateStr = new Date(tx.createdAt).toLocaleString(localeCode, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isTelecom = ['digicel', 'claro', 'altice', 'natcom'].includes(tx.operator);
  const showReceiverName = !isTelecom && tx.receiverName && !tx.receiverName.startsWith('Recharge');

  const headerTitle = "🧾 *D'ALEXIS TRANSFERENCIA*";
  const subTitle = isES ? 'Transferencias y Servicios RD ➔ Haití' : isHT ? 'Transfè & Sèvis RD ➔ Ayiti' : 'Transfert & Services RD ➔ Haïti';
  const refLabel = isES ? '📄 *Ref :*' : '📄 *Réf :*';
  const dateLabel = isES ? '📅 *Fecha :*' : isHT ? '📅 *Dat :*' : '📅 *Date :*';
  const serviceLabel = isES ? '📶 *Servicio :*' : isHT ? '📶 *Sèvis :*' : '📶 *Service :*';
  const statusKey = isES ? '⚡ *Estado :*' : isHT ? '⚡ *Estati :*' : '⚡ *Statut :*';
  const cancelReasonLabel = isES ? '⚠️ *Motivo de cancelación :*' : isHT ? '⚠️ *Rezon anilasyon :*' : "⚠️ *Motif d'annulation :*";
  const beneficiaryLabel = isES ? '👤 *Beneficiario :*' : isHT ? '👤 *Moun k ap resevwa :*' : '👤 *Bénéficiaire :*';
  const phoneLabel = isTelecom 
    ? (isES ? '📞 *Número Recargado :*' : isHT ? '📞 *Nimewo Rechaje :*' : '📞 *Numéro Rechargé :*')
    : (isES ? '📞 *Teléfono :*' : isHT ? '📞 *Telefòn :*' : '📞 *Téléphone :*');
  const amountRcvLabel = isES ? '💵 *Monto a Recibir :*' : isHT ? '💵 *Montan pou Resevwa :*' : '💵 *Montant Reçu :*';
  const amountPaidLabel = isES ? '💰 *Monto Pagado :*' : isHT ? '💰 *Montan Peye :*' : '💰 *Montant Payé :*';
  const rateLabel = isES ? '📊 *Tasa :*' : isHT ? '📊 *To :*' : '📊 *Taux :*';
  const agentLabel = isES ? '🏢 Agente :' : isHT ? '🏢 Ajan :' : '🏢 Agent :';
  const footerSec = isCancelled
    ? (isES ? 'Transacción cancelada y revocada' : isHT ? 'Tranzaksyon anile epi revoke' : 'Transaction annulée et révoquée')
    : (isES ? "Transacción oficial certificada D'Alexis" : isHT ? "Tranzaksyon ofisyèl sètifye D'Alexis" : "Transaction officielle certifiée D'Alexis");

  const isHaitiInbound = tx.serviceType === 'haiti_inbound_cash' || tx.senderName === 'Client Haïti' || Boolean(tx.referenceNumber?.startsWith('#INB-'));
  const isZelle = tx.operator === 'zelle';
  const appliedRate = tx.exchangeRate || 2.35;
  const calcFeeDOP = isHaitiInbound ? 0 : (tx.feeDOP && tx.feeDOP > 0 ? tx.feeDOP : Math.max(1, Math.round(tx.amountDOP * 0.005)));
  const calcCommDOP = isHaitiInbound ? 0 : (tx.commissionDOP && tx.commissionDOP > 0 ? tx.commissionDOP : Math.max(1, Math.round(tx.amountDOP * 0.01)));
  const calcNetDOP = isHaitiInbound ? tx.amountDOP : Math.max(0, tx.amountDOP - calcFeeDOP);
  const calcNetHTG = isHaitiInbound ? tx.amountHTG : Math.round(calcNetDOP * appliedRate);

  const financialLines = isHaitiInbound
    ? `💰 *Somme Reçue (Dépôt) :* ${tx.amountHTG.toLocaleString()} HTG\n🎁 *Frais sur Dépôt :* 0 DOP (Aucun frais)\n📊 *Taux :* 100 DOP = ${Math.round(appliedRate * 100)} HTG\n💵 *Montant Converti (RD) :* ${tx.amountDOP.toLocaleString()} DOP`
    : isZelle
    ? `💰 *Montant Zelle :* $${(tx.amountUSD || 0).toFixed(2)} USD (${tx.amountDOP.toLocaleString()} DOP)\n📉 *Frais (0.5%) :* -${calcFeeDOP} DOP\n💼 *Commission (1%) :* +${calcCommDOP} DOP\n💵 *Montant Net (RD) :* ${(tx.netPayoutAmount || calcNetDOP).toLocaleString()} ${tx.netPayoutCurrency || 'DOP'}`
    : `${amountPaidLabel} ${tx.amountDOP.toLocaleString()} DOP\n📉 *Frais (0.5%) :* -${calcFeeDOP} DOP (-${Math.round(calcFeeDOP * appliedRate)} HTG)\n🔄 *Montant Net Converti :* ${calcNetDOP.toLocaleString()} DOP\n💼 *Commission (1%) :* +${calcCommDOP} DOP\n${rateLabel} 100 DOP = ${Math.round(appliedRate * 100)} HTG\n${amountRcvLabel} ${calcNetHTG.toLocaleString()} HTG`;

  return `${headerTitle}
${subTitle}
--------------------------------
${refLabel} ${tx.referenceNumber}
${dateLabel} ${dateStr}
${serviceLabel} ${tx.operator.toUpperCase()}
${statusKey} ${statusLabel}
${isCancelled && tx.cancellationReason ? `${cancelReasonLabel} ${tx.cancellationReason}\n` : ''}--------------------------------
${showReceiverName ? `${beneficiaryLabel} ${tx.receiverName}\n` : ''}${phoneLabel} ${tx.receiverPhone}
${financialLines}
--------------------------------
${agentLabel} ${tx.createdByName || (isES ? 'Agencia Santo Domingo' : 'Agence Santo Domingo')}
🔒 _${footerSec}_`;
}

/**
 * Dessine un reçu graphique officiel haute définition sur HTML5 Canvas
 */
export async function generateReceiptCanvas(tx: Transaction, lang: string = 'FR'): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const bestProofUrl = tx.proofUrl || tx.zelleProofUrl || tx.haitiInboundProofUrl;
  const hasProof = !!bestProofUrl;
  const isCancelled = tx.status === 'cancelled';
  const isCompleted = tx.status === 'completed';
  const isES = lang === 'ES';
  const isHT = lang === 'HT';
  canvas.width = 650;
  canvas.height = (hasProof ? 1240 : 1000) + (isCancelled ? 90 : 0);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d\'initialiser le contexte canvas 2D');

  // Fond blanc avec texture soignée
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bandeau supérieur sombre (ou rouge si annulé)
  ctx.fillStyle = isCancelled ? '#BE123C' : '#0F172A';
  ctx.fillRect(0, 0, canvas.width, 16);

  // Logo officiel Alexis Transferencia
  try {
    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = '/images/logo1.png?v=2';
    });
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(285, 45, 80, 80, 20);
    ctx.clip();
    ctx.drawImage(logoImg, 285, 45, 80, 80);
    ctx.restore();
    if (isCancelled) {
      ctx.fillStyle = 'rgba(190, 18, 60, 0.45)';
      ctx.beginPath();
      ctx.roundRect(285, 45, 80, 80, 20);
      ctx.fill();
    }
  } catch {
    ctx.fillStyle = isCancelled ? '#BE123C' : '#0F172A';
    ctx.beginPath();
    ctx.roundRect(285, 45, 80, 80, 20);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isCancelled ? '✕' : 'A', 325, 102);
  }

  // Titre & En-tête
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("Alexis", 325, 160);

  ctx.fillStyle = '#0284C7';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Transferencia', 325, 185);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px sans-serif';
  ctx.fillText(isES ? 'RD ➔ Haití • Agencia República Dominicana' : isHT ? 'RD ➔ Ayiti • Ajans Repiblik Dominikèn' : 'RD ➔ Haïti • Agence République Dominicaine', 325, 208);

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
      ? (isES ? '✖ TRANSACCIÓN OFICIALMENTE CANCELADA' : isHT ? '✖ TRANZAKSYON OFISYÈLMAN ANILE' : '✖ TRANSACTION OFFICIELLEMENT ANNULÉE') 
      : isCompleted 
      ? (isES ? '✔ RECIBO OFICIAL • DESEMBOLSO REALIZADO' : isHT ? '✔ RESI OFISYÈL • DEBOUYMAN FÈT' : '✔ REÇU OFFICIEL • DÉCAISSEMENT EFFECTUÉ') 
      : (isES ? '⏳ COMPROBANTE OFICIAL • EN ESPERA' : isHT ? '⏳ BÒDWO OFISYÈL • AP TANN' : '⏳ BORDEREAU OFFICIEL • EN ATTENTE'),
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
  ctx.fillText(isES ? 'Nº de Referencia :' : isHT ? 'Nimewo Referans :' : 'N° de Référence :', 60, 345);
  ctx.fillText(isES ? 'Fecha y Hora :' : isHT ? 'Dat & Lè :' : 'Date & Heure :', 60, 380);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(tx.referenceNumber, 590, 345);

  const localeCode = isES ? 'es-DO' : isHT ? 'fr-HT' : 'fr-FR';
  const dateFormatted = new Date(tx.createdAt).toLocaleString(localeCode, {
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
  ctx.fillText(isES ? 'OPERADOR / SERVICIO :' : isHT ? 'OPERATÈ / SÈVIS :' : 'OPÉRATEUR / SERVICE :', 45, currentY);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'black 15px sans-serif';
  ctx.fillText(tx.operator.toUpperCase(), 230, currentY);

  const isTelecomOp = ['digicel', 'claro', 'altice', 'natcom'].includes(tx.operator);
  const showReceiverNameCanvas = !isTelecomOp && tx.receiverName && !tx.receiverName.startsWith('Recharge');

  currentY += 35;
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(isES ? 'REMITENTE (RD)' : isHT ? 'MOUN K AP VOYE (RD)' : 'EXPÉDITEUR (RD)', 45, currentY);
  ctx.fillText(isTelecomOp ? (isES ? 'NÚMERO RECARGADO' : isHT ? 'NIMEWO RECHAJE' : 'NUMÉRO RECHARGÉ') : (isES ? 'BENEFICIARIO (HAITÍ)' : isHT ? 'MOUN K AP RESEVWA (AYITI)' : 'BÉNÉFICIAIRE (HAÏTI)'), 345, currentY);

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

  // Détails Financiers (Boîte verte avec détail complet des frais)
  const isHaitiInboundCanvas = tx.serviceType === 'haiti_inbound_cash' || tx.senderName === 'Client Haïti' || Boolean(tx.referenceNumber?.startsWith('#INB-'));
  const isZelleCanvas = tx.operator === 'zelle';
  const appliedRateCanvas = tx.exchangeRate || 2.35;
  const calcFeeDOPCanvas = isHaitiInboundCanvas ? 0 : (tx.feeDOP && tx.feeDOP > 0 ? tx.feeDOP : Math.max(1, Math.round(tx.amountDOP * 0.005)));
  const calcCommDOPCanvas = isHaitiInboundCanvas ? 0 : (tx.commissionDOP && tx.commissionDOP > 0 ? tx.commissionDOP : Math.max(1, Math.round(tx.amountDOP * 0.01)));
  const calcNetDOPCanvas = isHaitiInboundCanvas ? tx.amountDOP : Math.max(0, tx.amountDOP - calcFeeDOPCanvas);
  const calcFeeHTGCanvas = Math.round(calcFeeDOPCanvas * appliedRateCanvas);
  const calcNetHTGCanvas = isHaitiInboundCanvas ? tx.amountHTG : Math.round(calcNetDOPCanvas * appliedRateCanvas);

  currentY += 25;
  ctx.fillStyle = '#F0FDF4';
  ctx.beginPath();
  ctx.roundRect(40, currentY, 570, 240, 20);
  ctx.fill();
  ctx.strokeStyle = '#BBF7D0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  let finY = currentY + 32;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = '600 14px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? 'Somme Reçue (Dépôt Gourdes) :'
      : isZelleCanvas
      ? 'Montant Brut Zelle :'
      : (isES ? 'Monto Bruto Recibido (RD) :' : isHT ? 'Montan Brut Kolekte (RD) :' : 'Montant Brut Encaissé (RD) :'),
    65,
    finY
  );
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? `${tx.amountHTG.toLocaleString()} HTG`
      : isZelleCanvas
      ? `$${(tx.amountUSD || 0).toFixed(2)} USD (${tx.amountDOP.toLocaleString()} DOP)`
      : `${tx.amountDOP.toLocaleString()} DOP`,
    585,
    finY
  );

  finY += 28;
  ctx.textAlign = 'left';
  ctx.fillStyle = isHaitiInboundCanvas ? '#15803D' : '#B45309';
  ctx.font = '600 14px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? 'Frais & Commission sur Dépôt :'
      : (isES ? 'Cargo de Servicio (0.5%) deducido :' : isHT ? 'Frè Sèvis (0.5%) dedwi :' : 'Frais de Service (0.5%) déduits :'),
    65,
    finY
  );
  ctx.textAlign = 'right';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? '0 DOP (Aucun frais)'
      : isZelleCanvas
      ? `-${calcFeeDOPCanvas.toLocaleString()} DOP`
      : `-${calcFeeDOPCanvas.toLocaleString()} DOP (-${calcFeeHTGCanvas.toLocaleString()} HTG)`,
    585,
    finY
  );

  finY += 28;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = '600 14px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? 'Montant Converti (Pesos RD) :'
      : (isES ? 'Monto Neto Convertido :' : isHT ? 'Montan Nèt Konvèti :' : 'Montant Net Converti :'),
    65,
    finY
  );
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${calcNetDOPCanvas.toLocaleString()} DOP`, 585, finY);

  finY += 28;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = '600 14px sans-serif';
  ctx.fillText(isES ? 'Tasa / Comisión (1%) :' : isHT ? 'To / Komisyon (1%) :' : 'Taux Appliqué / Commission (1%) :', 65, finY);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1D4ED8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? `100 DOP = ${Math.round(appliedRateCanvas * 100)} HTG (Comm: 0 DOP)`
      : isZelleCanvas
      ? `1 USD = ${(tx.zelleExchangeRate || appliedRateCanvas).toFixed(2)} DOP | Comm: +${calcCommDOPCanvas} DOP`
      : `100 DOP = ${Math.round(appliedRateCanvas * 100)} HTG | Comm: +${calcCommDOPCanvas} DOP`,
    585,
    finY
  );

  finY += 20;
  ctx.strokeStyle = '#DCFCE7';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(65, finY);
  ctx.lineTo(585, finY);
  ctx.stroke();
  ctx.setLineDash([]);

  finY += 42;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(isES ? 'MONTO NETO A ENTREGAR :' : isHT ? 'MONTAN NÈT POU PEYE :' : 'MONTANT NET LIVRÉ :', 65, finY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#15803D';
  ctx.font = '900 26px sans-serif';
  ctx.fillText(
    isHaitiInboundCanvas
      ? `${tx.amountDOP.toLocaleString()} DOP`
      : isZelleCanvas
      ? `${(tx.netPayoutAmount || calcNetDOPCanvas).toLocaleString()} ${tx.netPayoutCurrency || 'DOP'}`
      : `${calcNetHTGCanvas.toLocaleString()} HTG`,
    585,
    finY
  );

  // Bas de page : Agent & Signature
  currentY += 265;

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
    ctx.fillText(isES ? '⚠ MOTIVO OFICIAL DE CANCELACIÓN :' : isHT ? '⚠ REZON OFISYÈL ANILASYON :' : '⚠ MOTIF OFFICIEL D\'ANNULATION :', 60, currentY + 24);

    ctx.fillStyle = '#7F1D1D';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(tx.cancellationReason || (isES ? 'Cancelado por la dirección' : isHT ? 'Anile pa direksyon an' : "Annulé par l'administration"), 60, currentY + 48);

    currentY += 90;
  }

  if (hasProof) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = bestProofUrl!;
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
        ctx.fillText(isES ? '📷 COMPROBANTE FOTOGRÁFICO / RECIBO :' : isHT ? '📷 PRÈV FOTO DEKASMAN / RESI :' : '📷 PREUVE PHOTOGRAPHIQUE DU DÉCAISSEMENT / REÇU :', 60, currentY + 24);

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
  ctx.fillText(`${isES ? 'Agente emisor :' : isHT ? 'Ajan ki voye :' : 'Agent émetteur :'} ${tx.createdByName || (isES ? 'Agencia RD' : 'Agence RD')}`, 45, currentY);
  ctx.fillText(`${isES ? 'Nodo :' : isHT ? 'Nœud :' : 'Noeud :'} ${tx.createdByNode || 'node-01'}`, 45, currentY + 22);

  ctx.textAlign = 'right';
  ctx.fillStyle = isCancelled ? '#DC2626' : '#2563EB';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(isCancelled ? (isES ? '✖ TRANSACCIÓN REVOCADA Y CANCELADA' : isHT ? '✖ TRANZAKSYON REVOKE AK ANILE' : '✖ TRANSACTION RÉVOQUÉE ET ANNULÉE') : (isES ? '✔ TRANSACCIÓN OFICIAL SEGURA' : isHT ? '✔ TRANZAKSYON OFISYÈL SEKIRIZE' : '✔ TRANSACTION OFFICIELLE SÉCURISÉE'), 605, currentY);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px sans-serif';
  ctx.fillText("Plateforme D'Alexis Transferencia", 605, currentY + 22);

  return canvas;
}

/**
 * Génère un document PDF officiel haute définition à partir du canvas
 */
export async function generateReceiptPDF(tx: Transaction, lang: string = 'FR'): Promise<jsPDF> {
  const canvas = await generateReceiptCanvas(tx, lang);
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
export async function downloadReceiptPDF(tx: Transaction, lang: string = 'FR'): Promise<void> {
  const doc = await generateReceiptPDF(tx, lang);
  const cleanRef = tx.referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  doc.save(`Recu_${cleanRef}.pdf`);
}

/**
 * Partage le reçu PDF via l'API Web Share native (WhatsApp, SMS, Email, etc.) ou fallback WhatsApp
 */
export async function shareReceiptPDF(tx: Transaction, lang: string = 'FR'): Promise<boolean> {
  const shareText = getReceiptShareText(tx, lang);
  const cleanRef = tx.referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_');

  try {
    const doc = await generateReceiptPDF(tx, lang);
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
    await downloadReceiptPDF(tx, lang);
    return true;
  } catch {
    navigator.clipboard.writeText(shareText);
    await downloadReceiptPDF(tx, lang);
    return false;
  }
}

/**
 * Télécharge le reçu au format image PNG (pour compatibilité)
 */
export async function downloadReceiptImage(tx: Transaction, lang: string = 'FR'): Promise<void> {
  return downloadReceiptPDF(tx, lang);
}

/**
 * Partage le reçu (pour compatibilité)
 */
export async function shareReceipt(tx: Transaction, lang: string = 'FR'): Promise<boolean> {
  return shareReceiptPDF(tx, lang);
}
