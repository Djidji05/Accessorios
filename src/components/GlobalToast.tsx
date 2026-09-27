import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalToast: React.FC = () => {
  const { toastNotification, hideToast } = useApp();

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification, hideToast]);

  if (!toastNotification) return null;

  const { text, type } = toastNotification;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-auto animate-in slide-in-from-top-3 fade-in duration-200 pointer-events-auto">
      <div 
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
          isSuccess 
            ? 'bg-emerald-900/90 dark:bg-emerald-950/95 border-emerald-500/50 text-white' 
            : isError 
            ? 'bg-rose-900/90 dark:bg-rose-950/95 border-rose-500/50 text-white' 
            : 'bg-blue-900/90 dark:bg-slate-900/95 border-blue-500/50 text-white'
        }`}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 pr-2">
          <p className="text-xs font-bold leading-snug tracking-wide">
            {isSuccess ? 'Action effectuée avec succès' : isError ? 'Alerte Système' : 'Notification Information'}
          </p>
          <p className="text-xs text-slate-200 mt-0.5 font-medium leading-relaxed">
            {text}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={hideToast}
          className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
