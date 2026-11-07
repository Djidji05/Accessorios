import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Clock, 
  XCircle, 
  Eye,
  Camera,
  Coins,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';
import { ImageViewerModal } from './ImageViewerModal';

interface HaitiInboundPayoutModalProps {
  tx: Transaction | null;
  isOpen?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const HaitiInboundPayoutModal: React.FC<HaitiInboundPayoutModalProps> = ({
  tx,
  isOpen = true,
  onClose,
  onRefresh,
}) => {
  const { 
    currentUser, 
    validateHaitiInboundTransaction,
    completeTask,
    setSelectedReceiptTx, 
    dopToHtgRate,
    usdToHtgRate,
    t 
  } = useApp();

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tx) return null;

  const isAdmin = currentUser.role === 'admin';
  const isPending = tx.haitiInboundStatus === 'pending_admin_check' || (tx.status === 'pending_routing' && !tx.haitiInboundStatus);
  const isApproved = tx.haitiInboundStatus === 'approved';
  const isRejected = tx.haitiInboundStatus === 'rejected' || tx.status === 'cancelled';
  const isCompleted = tx.status === 'completed';

  const usdToDop = (usdToHtgRate && usdToHtgRate <= 100)
    ? usdToHtgRate
    : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);
  const appliedRate = tx.exchangeRate || usdToDop || 58.0;
  const numUSD = tx.amountUSD || (tx.amountDOP > 0 ? Math.round((tx.amountDOP / appliedRate) * 100) / 100 : (tx.amountHTG > 0 ? Math.round((tx.amountHTG / (dopToHtgRate || 2.35) / appliedRate) * 100) / 100 : 0));
  const grossDOP = tx.amountDOP > 0 ? tx.amountDOP : (numUSD > 0 ? Math.round(numUSD * appliedRate) : Math.round(tx.amountHTG / (dopToHtgRate || 2.35)));
  const feeDOP = tx.feeDOP > 0 ? tx.feeDOP : Math.round(grossDOP * 0.005); // 0.5% frais de service guichet
  const commDOP = tx.commissionDOP > 0 ? tx.commissionDOP : Math.round(grossDOP * 0.01); // 1% commission admin
  const netPayout = tx.netPayoutAmount && tx.netPayoutAmount > 0 ? tx.netPayoutAmount : (grossDOP - feeDOP);

  const proofImg = tx.haitiInboundProofUrl || tx.proofUrl;
  const operatorName = tx.operator === 'natcash' ? 'Natcash (Haïti 🇭🇹)' : 'MonCash (Haïti 🇭🇹)';

  const handleAdminApprove = () => {
    setIsSubmitting(true);
    const res = validateHaitiInboundTransaction(tx.id, true);
    setIsSubmitting(false);
    if (res.success && onRefresh) onRefresh();
  };

  const handleAdminReject = () => {
    setIsSubmitting(true);
    const res = validateHaitiInboundTransaction(tx.id, false, rejectNote);
    setIsSubmitting(false);
    setShowRejectInput(false);
    if (res.success && onRefresh) onRefresh();
  };

  const handleAgentDisburse = () => {
    setIsSubmitting(true);
    const res = completeTask(
      tx.id,
      `[DÉCAISSEMENT COMPTOIR] ${netPayout.toLocaleString()} DOP remis au client en liquide par ${currentUser.name}.`
    );
    setIsSubmitting(false);
    if (res.success && onRefresh) onRefresh();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center shadow-xs">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {operatorName}
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {tx.referenceNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('Dépôt Haïti vers Retrait en Pesos (RD)', 'Dépôt Haïti vers Retrait en Pesos (RD)')}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Live Status Banner */}
            {isPending && (
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-orange-900 dark:text-orange-200 space-y-1">
                  <p className="font-extrabold text-sm">
                    {t('En attente de confirmation Admin', 'En attente de confirmation Admin')}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {isAdmin 
                      ? "Le client a envoyé cette somme sur votre compte MonCash / Natcash. Vérifiez sur votre téléphone avant de confirmer."
                      : "La preuve a été transmise à l'Admin. Ne remettez pas les Pesos au client avant que l'Admin ait confirmé la réception."}
                  </p>
                </div>
              </div>
            )}

            {isApproved && !isCompleted && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <p className="font-extrabold text-sm">
                    {t('Réception confirmée par l\'Admin !', 'Réception confirmée par l\'Admin !')}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    L'argent a bien été reçu sur le compte. Vous pouvez maintenant verser les Pesos au client.
                  </p>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-extrabold text-sm">
                    {t('Transaction Clôturée avec Succès', 'Transaction Clôturée avec Succès')}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Les fonds ont été remis au client au guichet en RD.
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
                  <p className="font-extrabold text-sm">
                    {t('Transaction Refusée par l\'Admin', 'Transaction Refusée par l\'Admin')}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {tx.cancellationReason || "Preuve non reçue ou virement introuvable sur le compte de l'Administrateur."}
                  </p>
                </div>
              </div>
            )}

            {/* Photo Preuve */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('Photo Preuve MonCash / Natcash', 'Photo Preuve MonCash / Natcash')}</span>
                </span>
                {proofImg && (
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(proofImg)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('Plein écran', 'Plein écran')}</span>
                  </button>
                )}
              </div>

              {proofImg ? (
                <div 
                  onClick={() => setLightboxUrl(proofImg)}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 aspect-video sm:aspect-2/1 flex items-center justify-center cursor-pointer shadow-2xs hover:opacity-95 transition-opacity"
                >
                  <img 
                    src={proofImg} 
                    alt="Preuve MonCash / Natcash" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                    <Eye className="w-4 h-4" />
                    <span>{t('Agrandir la preuve', 'Agrandir la preuve')}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  {t('Aucune photo de preuve fournie', 'Aucune photo de preuve fournie')}
                </div>
              )}
            </div>

            {/* Financial Details Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Montant Reçu USD */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">
                    {t('Somme sur la Preuve (USD)', 'Somme sur la Preuve (USD)')}
                  </p>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                    ${numUSD.toLocaleString()} <span className="text-sm font-bold text-slate-500">USD</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {tx.operator.toUpperCase()}
                  </p>
                </div>

                {/* Montant Net à Verser DOP */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                  <p className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    {t('Montant Net à Verser (RD)', 'Montant Net à Verser (RD)')}
                  </p>
                  <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {netPayout.toLocaleString()} <span className="text-sm font-bold text-emerald-700">DOP</span>
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600/80 mt-0.5">
                    {t('Taux :', 'Taux :')} 1 USD = {appliedRate.toFixed(2)} DOP
                  </p>
                </div>
              </div>

              {/* Admin Confidential Breakdown (Hidden from Agents) */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('Équivalent Brut (DOP) :', 'Équivalent Brut (DOP) :')}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{grossDOP.toLocaleString()} DOP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('Frais de service (0.5%) :', 'Frais de service (0.5%) :')}</span>
                    <span className="font-mono font-bold text-amber-600">-{feeDOP.toLocaleString()} DOP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('Commission Admin (1%) :', 'Commission Admin (1%) :')}</span>
                    <span className="font-mono font-bold text-emerald-600">+{commDOP.toLocaleString()} DOP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reject Note Input (if opened) */}
            {showRejectInput && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold text-rose-900 dark:text-rose-200">
                  {t('Motif du refus (visible par l\'agent) :', 'Motif du refus (visible par l\'agent) :')}
                </label>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Ex : Virement non reçu sur le compte, montant incorrect, capture tronquée..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t('Annuler', 'Annuler')}
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminReject}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? 'Refus en cours...' : t('Confirmer le Refus', 'Confirmer le Refus')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t('Fermer', 'Fermer')}
            </button>

            <div className="flex items-center gap-2.5 ml-auto">
              {/* ADMIN ACTIONS: Approve or Reject */}
              {isAdmin && isPending && !showRejectInput && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>{t('Rejeter', 'Rejeter')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAdminApprove}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isSubmitting ? 'Validation...' : t('Confirmer la Réception sur mon Compte', 'Confirmer la Réception sur mon Compte')}</span>
                  </button>
                </>
              )}

              {/* AGENT ACTIONS: Remettre les Pesos au Client */}
              {isApproved && !isCompleted && (
                <button
                  type="button"
                  onClick={handleAgentDisburse}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-white" />
                  <span>{isSubmitting ? 'Finalisation...' : `${t('Remettre', 'Remettre')} ${netPayout.toLocaleString()} DOP au Client`}</span>
                </button>
              )}

              {/* Completed: Receipt Button */}
              {isCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReceiptTx(tx);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('Reçu de Paiement', 'Reçu de Paiement')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <ImageViewerModal
          imageUrl={lightboxUrl}
          title={`Preuve Réception ${tx.operator.toUpperCase()} (${tx.amountHTG.toLocaleString()} HTG)`}
          onClose={() => setLightboxUrl(null)}
        />
      )}
    </>
  );
};

