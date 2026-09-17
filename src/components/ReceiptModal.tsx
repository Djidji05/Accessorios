import React from 'react';
import { X, Printer, ShieldCheck, QrCode, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from './OperatorBadge';

export const ReceiptModal: React.FC = () => {
  const { selectedReceiptTx, setSelectedReceiptTx } = useApp();

  if (!selectedReceiptTx) return null;

  const tx = selectedReceiptTx;
  const isCompleted = tx.status === 'completed';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedReceiptTx(null)}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Ticket Area */}
        <div id="printable-receipt" className="space-y-4 text-center">
          
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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  REÇU OFFICIEL • DÉCAISSEMENT EFFECTUÉ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3 h-3 text-amber-600" />
                  BORDEREAU PROVISOIRE • EN COURS EN HAÏTI
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
            {tx.proofNotes && (
              <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-600">
                <span className="font-bold text-emerald-700 block">Preuve Haïti :</span>
                <span className="font-mono">{tx.proofNotes}</span>
              </div>
            )}
          </div>

          {/* Sender & Receiver Info */}
          <div className="text-left space-y-2 text-xs border-b border-dashed border-slate-300 pb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Expéditeur (RD)</p>
              <p className="font-bold text-slate-900">{tx.senderName}</p>
              <p className="text-[11px] text-slate-500 font-mono">{tx.senderPhone}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Bénéficiaire (Haïti)</p>
              <p className="font-bold text-slate-900">{tx.receiverName}</p>
              <p className="text-[11px] text-slate-500 font-mono">{tx.receiverPhone}</p>
            </div>
          </div>

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
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Montant à Décaissement:</span>
              <span className="text-lg font-extrabold text-emerald-600">{tx.amountHTG.toLocaleString()} HTG</span>
            </div>
          </div>

          {/* QR Code & Signature */}
          <div className="pt-2 flex items-center justify-between">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              <p className="font-bold text-slate-700">Agent: {tx.createdByName}</p>
              <p>Node: {tx.createdByNode}</p>
              <p className="text-emerald-600 font-bold mt-1">✔ TRANSACTION SÉCURISÉE</p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Reçu</span>
          </button>
        </div>

      </div>
    </div>
  );
};
