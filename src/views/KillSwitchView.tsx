import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Power, 
  Clock, 
  History, 
  CheckCircle2, 
  Zap, 
  X, 
  Send,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorCode } from '../types';
import { OPERATOR_CONFIG } from '../components/OperatorBadge';

export const KillSwitchView: React.FC = () => {
  const { killSwitchList, toggleKillSwitch, currentUser } = useApp();
  
  // State for emergency lock reason modal
  const [lockingOp, setLockingOp] = useState<OperatorCode | null>(null);
  const [lockReason, setLockReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const lockedCount = killSwitchList.filter(k => !k.enabled).length;

  const handleOpenLockModal = (op: OperatorCode, isCurrentlyEnabled: boolean) => {
    if (currentUser.role !== 'admin') return;

    if (isCurrentlyEnabled) {
      setLockingOp(op);
      setLockReason('Panne réseau / Maintenance d\'urgence');
    } else {
      // Unlocking directly
      toggleKillSwitch(op);
      setFeedback(`Service ${op.toUpperCase()} déverrouillé et réactivé avec succès !`);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleConfirmLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockingOp) return;

    toggleKillSwitch(lockingOp, lockReason || 'Maintenance d\'urgence');
    setFeedback(`Service ${lockingOp.toUpperCase()} VERROUILLÉ D'URGENCE !`);
    setLockingOp(null);
    setLockReason('');
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. HEADER & EMERGENCY STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Gestion des Interrupteurs de Sécurité</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Suspension et réactivation en temps réel des flux opérateurs partenaires en cas d'incident ou de maintenance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {lockedCount > 0 ? (
            <span className="px-3.5 py-2 bg-rose-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>{lockedCount} SERVICE(S) EN SUSPENSION D'URGENCE</span>
            </span>
          ) : (
            <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>TOUS LES SERVICES OPÉRATIONNELS</span>
            </span>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-extrabold flex justify-between items-center shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white text-xs underline">Fermer</button>
        </div>
      )}

      {currentUser.role !== 'admin' && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Accès Réservé Administrateur : Seul un administrateur système est autorisé à modifier les paramètres de sécurité des services.</span>
        </div>
      )}

      {/* 2. KILL SWITCH OPERATOR CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {killSwitchList.map((item) => {
          const config = OPERATOR_CONFIG[item.operator];
          const isEnabled = item.enabled;

          return (
            <div 
              key={item.operator}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-2xs ${
                isEnabled ? 'bg-white border-slate-200/80' : 'bg-rose-50/70 border-rose-200 shadow-md ring-2 ring-rose-500/10'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${config.bg}`} />
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">{config.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.serviceName}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[11px] font-black rounded-xl flex items-center gap-1.5 ${
                  isEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-600 text-white shadow-xs'
                }`}>
                  {isEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isEnabled ? 'ACTIF' : 'VERROUILLÉ'}</span>
                </span>
              </div>

              {!isEnabled && item.reason && (
                <div className="p-3 bg-white border border-rose-200 rounded-xl text-xs text-rose-900 font-medium space-y-1">
                  <p className="font-extrabold text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Motif d'Urgence :
                  </p>
                  <p className="font-mono text-[11px] bg-rose-50 p-2 rounded-lg border border-rose-100">{item.reason}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Dernière action:</span>
                <span className="font-bold text-slate-600">{item.updatedBy}</span>
              </div>

              <button
                disabled={currentUser.role !== 'admin'}
                onClick={() => handleOpenLockModal(item.operator, isEnabled)}
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  currentUser.role !== 'admin' ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500' :
                  isEnabled 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isEnabled ? 'Verrouiller Urgence' : 'Déverrouiller le Service'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL DE VERROUILLAGE D'URGENCE (AVEC MOTIF) */}
      {lockingOp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Verrouillage d'Urgence : {lockingOp.toUpperCase()}</h3>
              </div>
              <button 
                onClick={() => setLockingOp(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmLock} className="space-y-4 text-xs font-sans">
              <p className="text-slate-600 font-medium leading-relaxed">
                Spécifiez le motif d'arrêt d'urgence pour le service <span className="font-extrabold text-slate-900">{lockingOp.toUpperCase()}</span>. Cette action empêchera immédiatement toute saisie sur ce canal.
              </p>

              {/* Quick Preset Badges */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raccourcis Motifs</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Panne API MonCash',
                    'Maintenance Natcash',
                    'Seuil Flotte Insuffisant',
                    'Instabilité Réseau'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLockReason(preset)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motif Détaillé de l'Arrêt *</label>
                <textarea
                  rows={3}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Ex: Interruption temporaire du service par l'opérateur MonCash..."
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLockingOp(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Power className="w-4 h-4" />
                  <span>Confirmer le Verrouillage</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
