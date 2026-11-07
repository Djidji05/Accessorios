import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  ExternalLink, 
  Printer, 
  Clock, 
  Check, 
  Copy, 
  XCircle, 
  HelpCircle,
  Eye,
  Camera,
  ArrowRight
} from 'lucide-react';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';
import { ImageViewerModal } from './ImageViewerModal';

interface ZellePayoutModalProps {
  tx: Transaction | null;
  isOpen?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const ZellePayoutModal: React.FC<ZellePayoutModalProps> = ({
  tx,
  isOpen = true,
  onClose,
  onRefresh,
}) => {
  const { 
    currentUser, 
    validateZelleTransaction, 
    setSelectedReceiptTx, 
    usdToHtgRate, 
    dopToHtgRate,
    t 
  } = useApp();

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tx) return null;

  const isAdmin = currentUser.role === 'admin';
  const isPending = tx.zelleStatus === 'pending_admin_check' || (tx.status === 'in_progress' && tx.operator === 'zelle');
  const isApproved = tx.zelleStatus === 'approved' || (tx.status === 'completed' && tx.operator === 'zelle');
  const isRejected = tx.zelleStatus === 'rejected' || (tx.status === 'cancelled' && tx.operator === 'zelle');

  const usdToDop = (usdToHtgRate && usdToHtgRate <= 100)
    ? usdToHtgRate
    : ((usdToHtgRate && dopToHtgRate && dopToHtgRate > 0) ? (usdToHtgRate / dopToHtgRate) : 58.0);
  const amountUSD = tx.amountUSD || Math.round((tx.amountDOP / usdToDop) * 100) / 100;
  const appliedRate = tx.zelleExchangeRate || usdToDop;
  const payoutCurrency = (tx.netPayoutCurrency === 'USD') ? 'USD' : 'DOP';
  const feeUSD = tx.zelleFeeUSD || Math.round(amountUSD * 0.035 * 100) / 100;
  const feeDOP = Math.round(feeUSD * appliedRate);
  const commUSD = tx.zelleCommissionUSD || Math.round(amountUSD * 0.015 * 100) / 100;
  const commDOP = Math.round(commUSD * appliedRate);
  const netUSD = Math.round((amountUSD - feeUSD) * 100) / 100;
  const netPayout = tx.netPayoutAmount || (payoutCurrency === 'DOP' ? Math.round(netUSD * appliedRate) : netUSD);

  const proofImg = tx.zelleProofUrl || tx.proofUrl;

  const handleAdminApprove = () => {
    setIsSubmitting(true);
    const res = validateZelleTransaction(tx.id, true);
    setIsSubmitting(false);
    if (res.success) {
      if (onRefresh) onRefresh();
    }
  };

  const handleAdminReject = () => {
    setIsSubmitting(true);
    const res = validateZelleTransaction(tx.id, false, rejectNote);
    setIsSubmitting(false);
    setShowRejectInput(false);
    if (res.success) {
      if (onRefresh) onRefresh();
    }
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(netPayout.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto my-auto text-slate-900 dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    {t('Fiche de Validation Zelle Pay')}
                  </h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {tx.referenceNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('Virement direct USA • Reçu par')} <strong className="text-slate-800 dark:text-slate-200">{tx.createdByName || 'Agent Guichet'}</strong>
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 👤 FICHE AGENT ÉMETTEUR & CONTEXTE */}
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                {(tx.createdByName || 'A')[0].toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('Agent Émetteur')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{tx.createdByName || 'Agent Guichet'}</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 ml-1.5 font-bold uppercase tracking-wider">
                  ({tx.createdByRole?.replace('_', ' ') || 'agent'})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Date & Heure d'envoi")}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* STATUS BANNER */}
          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 space-y-1.5 animate-pulse">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                <Clock className="w-5 h-5 shrink-0" />
                <span>⏳ EN ATTENTE DE VÉRIFICATION BANCAIRE PAR L'ADMINISTRATEUR</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 pl-7 font-medium">
                Un message a été envoyé à l'Administrateur pour vérifier s'il a bien reçu le Zelle sur son compte bancaire.
                <strong className="block text-amber-900 dark:text-amber-200 mt-1 font-bold">
                  ⛔ RÈGLE DE SÉCURITÉ : Ne donnez aucun argent au client avant que l'Admin ait validé !
                </strong>
              </p>
            </div>
          )}

          {isApproved && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>✅ VÉRIFICATION CONFIRMÉE PAR L'ADMINISTRATEUR</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                  Paiement Autorisé
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium pl-7">
                L'Administrateur a confirmé avoir bien vu le virement Zelle de <strong>${amountUSD} USD</strong> sur le compte bancaire. Vous pouvez remettre les fonds au client.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-black text-sm">
                <XCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>❌ VIREMENT ZELLE NON REÇU / REFUSÉ PAR L'ADMINISTRATEUR</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 pl-7 font-semibold">
                L'Administrateur n'a pas vu ce virement Zelle sur le compte bancaire.
                <strong className="block text-rose-900 dark:text-rose-200 mt-1 font-black underline">
                  ⛔ INTERDICTION STRICTE : NE DONNEZ AUCUN ARGENT AU CLIENT !
                </strong>
              </p>
              {tx.cancellationReason && (
                <div className="ml-7 p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-xs font-mono text-rose-800 dark:text-rose-300">
                  Motif : {tx.cancellationReason}
                </div>
              )}
            </div>
          )}

          {/* 🌟 ENCADRÉ DU MONTANT NET À REMETTRE AU CLIENT (MASQUÉ AVANT VALIDATION ADMIN) */}
          {isApproved ? (
            <div className="p-4 sm:p-5 rounded-3xl border-2 space-y-3 transition-all bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Montant Net Débloqué à Remettre au Client</span>
                </span>
                <span className="font-mono text-[11px] font-semibold">
                  Devise : {payoutCurrency}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                    {netPayout.toLocaleString()} <span className="text-lg font-bold text-slate-500 dark:text-slate-400">{payoutCurrency}</span>
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-semibold">
                    ✓ Virement vérifié par l'Admin. Vous pouvez verser ce montant au client en toute sécurité.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                  title="Copier le montant exact"
                >
                  {copiedAmount ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAmount ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-3xl border-2 space-y-2.5 bg-amber-500/10 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                <span className="p-1 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  🔒
                </span>
                <span>Montant à Remettre Masqué (Validation Requise)</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                ⛔ <strong>Sécurité Zelle :</strong> Ne versez aucun argent au client pour le moment. Le montant exact à décaisser sera débloqué et affiché ici dès que l'Administrateur aura confirmé la réception du virement sur le compte bancaire.
              </p>
              {isAdmin && (
                <p className="text-[11px] font-mono text-purple-700 dark:text-purple-300 pt-1 border-t border-amber-200 dark:border-amber-800/60 font-semibold">
                  (Aperçu Admin pour contrôle : {netPayout.toLocaleString()} {payoutCurrency})
                </p>
              )}
            </div>
          )}

          {/* 📸 ZONE PHOTO PREUVE ZELLE EN GRAND (AVEC BOUTON PLEIN ÉCRAN) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Photo Preuve du Virement Zelle</span>
              </span>

              {proofImg && (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(proofImg)}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Agrandir en Plein Écran ↗</span>
                </button>
              )}
            </div>

            {proofImg ? (
              <div 
                className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-950 flex flex-col items-center justify-center p-2 group cursor-pointer shadow-inner"
                onClick={() => setLightboxUrl(proofImg)}
                title="Cliquer pour voir en plein écran"
              >
                <img
                  src={proofImg}
                  alt="Preuve Zelle Capture"
                  className="w-full max-h-[380px] sm:max-h-[460px] object-contain rounded-xl select-none"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                  <Eye className="w-5 h-5" />
                  <span>Cliquer pour agrandir en plein écran</span>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                Aucune photo de preuve n'a été attachée à ce virement.
              </div>
            )}
          </div>

          {/* 📊 FICHE FINANCIÈRE DÉTAILLÉE (TAUX & FRAIS TRANSPARENTS) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span>{t('Détails Financiers & Calculs Officiels')}</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">1 USD ≈ {appliedRate.toFixed(2)} DOP</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('Montant Zelle Reçu (Brut)')}</span>
                <p className="text-base font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  ${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs">USD</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('Taux de Conversion Appliqué')}</span>
                <p className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  1 USD = {appliedRate.toFixed(2)} DOP
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('Frais de Service (3.5%)')}</span>
                <p className="text-sm font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  -${feeUSD.toFixed(2)} USD <span className="text-[11px] font-medium text-slate-400 block sm:inline">(-{feeDOP.toLocaleString()} DOP)</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('Commission Plateforme')}</span>
                <p className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +${commUSD.toFixed(2)} USD <span className="text-[11px] font-medium text-slate-400 block sm:inline">(+{commDOP.toLocaleString()} DOP)</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('Devise de remise au client :')}</span>
                <p className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {payoutCurrency === 'USD' ? '🇺🇸 Dollars (USD)' : '🇩🇴 Pesos (DOP)'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t("Type d'opération")}</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {t('Virement Direct Zelle USA')}
                </p>
              </div>
            </div>
          </div>

          {/* 👑 ACTIONS ADMIN : OUI OU NON (SI TRANSACTION EN ATTENTE) */}
          {isAdmin && isPending && (
            <div className="p-4 rounded-3xl bg-purple-50/80 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-800 space-y-4">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-extrabold text-sm">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <span>{t("Question pour l'Administrateur : Avez-vous bien vu ce Zelle sur votre compte bancaire ?")}</span>
              </div>

              {showRejectInput ? (
                <div className="space-y-3 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-rose-300 dark:border-rose-800">
                  <label className="block text-xs font-bold text-rose-700 dark:text-rose-300">
                    {t("Motif du refus (optionnel) :")}
                  </label>
                  <input
                    type="text"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Ex: Fonds non visibles sur compte US / virement non reçu..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      {t('Annuler')}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleAdminReject}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      {t('Confirmer le Refus (NON)')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* BOUTON OUI */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleAdminApprove}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t("OUI, J'ai bien vu le Zelle (Valider)")}</span>
                  </button>

                  {/* BOUTON NON */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowRejectInput(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>{t("NON, Zelle non reçu (Refuser)")}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
            <button
              type="button"
              onClick={() => setSelectedReceiptTx(tx)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('Imprimer Reçu')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {t('Fermer')}
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox */}
      <ImageViewerModal
        isOpen={Boolean(lightboxUrl)}
        imageUrl={lightboxUrl}
        title={`Preuve Zelle - ${tx.referenceNumber}`}
        onClose={() => setLightboxUrl(null)}
      />
    </>
  );
};
