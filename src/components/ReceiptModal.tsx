import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Clock, Share2, Check, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from './OperatorBadge';
import { downloadReceiptPDF, shareReceiptPDF } from '../utils/receiptGenerator';

export const ReceiptModal: React.FC = () => {
  const { selectedReceiptTx, setSelectedReceiptTx, showToast } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!selectedReceiptTx) return null;

  const tx = selectedReceiptTx;
  const isCompleted = tx.status === 'completed';
  const isTelecom = ['natcom', 'claro', 'digicel', 'altice'].includes(tx.operator);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full max-h-[92vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedReceiptTx(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Ticket Area */}
        <div id="printable-receipt" className="space-y-4 text-center overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0">
          
          {/* Ticket Header */}
          <div className="border-b border-dashed border-slate-300 pb-4 space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
              D
            </div>
            <h2 className="font-extrabold text-slate-900 text-base leading-tight mt-2">D'Alexis</h2>
            <p className="text-[11px] font-semibold text-slate-500">Transferencia y accesorio</p>
            <p className="text-[10px] text-slate-400">RD ➔ Haïti • Agence République Dominicaine</p>
            
            {/* Status Indicator on Receipt */}
            <div className="pt-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  {isTelecom ? 'REÇU OFFICIEL • VALIDÉ PAR LE GESTIONNAIRE' : 'REÇU OFFICIEL • DÉCAISSEMENT EFFECTUÉ'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-900 border border-orange-300">
                  <Clock className="w-3 h-3 text-orange-600" />
                  {isTelecom ? 'BORDEREAU PROVISOIRE • EN ATTENTE DU GESTIONNAIRE' : 'BORDEREAU PROVISOIRE • EN COURS EN HAÏTI'}
                </span>
              )}
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-left">
            <div className="flex justify-between font-mono font-bold">
              <span className="text-slate-400">N° Reçu:</span>
              <span className="text-slate-900">{tx.referenceNumber}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold text-slate-700">{new Date(tx.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Service:</span>
              <OperatorBadge operator={tx.operator} size="sm" />
            </div>
          </div>

          {/* Sender & Receiver Info */}
          <div className="text-left space-y-2 text-xs border-b border-dashed border-slate-300 pb-3">
            {tx.senderName && tx.senderName !== 'Client Comptoir' && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Expéditeur (RD)</p>
                <p className="font-bold text-slate-900">{tx.senderName}</p>
                {tx.senderPhone && tx.senderPhone !== '+1 809 000 0000' && (
                  <p className="text-[11px] text-slate-500 font-mono">{tx.senderPhone}</p>
                )}
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {isTelecom ? `Numéro Récepteur (${tx.operator.toUpperCase()})` : 'Bénéficiaire (Haïti)'}
              </p>
              {!isTelecom && tx.receiverName && !tx.receiverName.startsWith('Recharge') && (
                <p className="font-bold text-slate-900">{tx.receiverName}</p>
              )}
              <p className="text-[12px] font-extrabold text-slate-900 font-mono mt-0.5">{tx.receiverPhone}</p>
            </div>
          </div>

          {/* Preuve de Paiement / Clôture Section */}
          {(tx.proofNotes || tx.proofUrl) && (
            <div className="bg-blue-50/90 p-3.5 rounded-2xl border border-blue-200 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-950 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Preuve Photo & Validation :</span>
              </div>

              {tx.proofUrl ? (
                <div className="rounded-2xl overflow-hidden border border-blue-300/80 bg-slate-950 flex flex-col items-center justify-center p-1.5 space-y-1 shadow-inner">
                  <img 
                    src={tx.proofUrl} 
                    alt="Photo Preuve Officielle" 
                    className="max-h-48 w-auto object-contain rounded-xl"
                  />
                  <span className="text-[9px] font-mono text-blue-300 font-bold block text-center">📷 PREUVE PHOTO DU REÇU ENREGISTRÉE</span>
                </div>
              ) : null}

              {tx.proofNotes && (
                <p className="text-[10px] font-mono font-bold text-blue-950 bg-white/95 p-2 rounded-xl border border-blue-200 leading-snug break-words">
                  {tx.proofNotes}
                </p>
              )}
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="space-y-2 text-left text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Montant Encaissé:</span>
              <span className="font-bold text-slate-900">{tx.amountDOP.toLocaleString()} Pesos</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taux Appliqué:</span>
              <span className="font-semibold text-slate-700">100 Pesos = {Math.round(tx.exchangeRate * 100)} HTG</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frais de Service:</span>
              <span className="font-semibold text-slate-700">{tx.feeDOP} Pesos</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Commission Admin:</span>
              <span className="font-bold text-blue-600">+{tx.commissionDOP || Math.round(tx.amountDOP * 0.01)} Pesos</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Montant à Décaissement:</span>
              <span className="text-lg font-extrabold text-blue-600">{tx.amountHTG.toLocaleString()} HTG</span>
            </div>
          </div>

          {/* Signature & Certificate Section (QR Code removed / in standby) */}
          <div className="pt-2 flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-xs">
                DA
              </div>
              <div className="text-left text-[11px] leading-tight">
                <span className="font-extrabold text-slate-800 block">D'Alexis Certifié</span>
                <span className="text-[10px] text-slate-400 font-mono">Node: {tx.createdByNode || 'node-01'}</span>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              <p className="font-bold text-slate-700">Agent: {tx.createdByName || 'Agence RD'}</p>
              <p className="text-blue-600 font-black mt-0.5">✔ OFFICIEL & AUDITÉ</p>
            </div>
          </div>

        </div>

        {/* Action Buttons: Télécharger en PDF & Partager en PDF */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch gap-2.5 shrink-0">
          <button
            type="button"
            onClick={async () => {
              setIsDownloading(true);
              try {
                await downloadReceiptPDF(tx);
                showToast('Reçu PDF officiel téléchargé avec succès !', 'success');
              } catch {
                showToast('Erreur lors du téléchargement du PDF.', 'error');
              } finally {
                setIsDownloading(false);
              }
            }}
            disabled={isDownloading}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            title="Télécharger le reçu officiel au format PDF"
          >
            <FileText className="w-4 h-4" />
            <span>{isDownloading ? 'Génération PDF...' : 'Télécharger en PDF'}</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setIsSharing(true);
              try {
                await shareReceiptPDF(tx);
                setCopiedShare(true);
                setTimeout(() => setCopiedShare(false), 2500);
                showToast('Partage du reçu PDF activé !', 'success');
              } catch {
                showToast('Partage annulé ou indisponible.', 'info');
              } finally {
                setIsSharing(false);
              }
            }}
            disabled={isSharing}
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            title="Partager le reçu PDF via WhatsApp, Email ou messagerie"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShare ? 'PDF Partagé !' : 'Partager le Reçu (PDF)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
