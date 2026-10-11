import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalToast: React.FC = () => {
  const { toastNotification, hideToast } = useApp();

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification, hideToast]);

  if (!toastNotification) return null;

  const { text, type } = toastNotification;
  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed top-5 right-5 z-[99999] max-w-md w-[calc(100vw-2.5rem)] sm:w-auto animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto shadow-2xl">
      <div 
        className={`flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-2xl shadow-xl transition-all ${
          isSuccess 
            ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20' 
            : isError 
            ? 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/20' 
            : 'bg-slate-900/95 text-white border-blue-500/50 shadow-blue-950/20'
        }`}
      >
        {/* Icon with glowing pill */}
        <div className={`shrink-0 p-2 rounded-xl mt-0.5 ${
          isSuccess 
            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' 
            : isError 
            ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30' 
            : 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
        }`}>
          {isSuccess && <CheckCircle2 className="w-5 h-5" />}
          {isError && <AlertCircle className="w-5 h-5" />}
          {!isSuccess && !isError && <Info className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 pr-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isSuccess ? 'bg-emerald-400 animate-pulse' : isError ? 'bg-rose-400 animate-pulse' : 'bg-blue-400'
            }`} />
            <h4 className="text-xs font-black tracking-tight text-white uppercase">
              {isSuccess ? 'Action Enregistrée' : isError ? 'Alerte Système' : 'Notification'}
            </h4>
          </div>
          <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
            {text}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={hideToast}
          className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
