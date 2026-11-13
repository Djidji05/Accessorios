import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAInstallPrompt: React.FC = () => {
  const { 
    isPWAInstalled, 
    showPWAInstallPrompt, 
    setShowPWAInstallPrompt, 
    installPWA,
    t 
  } = useApp();

  if (!showPWAInstallPrompt || isPWAInstalled) return null;

  const handleDismiss = () => {
    setShowPWAInstallPrompt(false);
    try {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } catch (e) {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    try {
      await installPWA();
    } catch (e) {
      console.error('Install error:', e);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white">
              {t('Installer Alexis Transferencia PWA', 'Installer Alexis Transferencia PWA')}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {t('pwa_prompt_sub', 'Installez l\'application sur votre écran d\'accueil pour un accès ultra-rapide et optimisé.')}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-slate-400 hover:text-white p-1 cursor-pointer"
          title={t('Fermer', 'Fermer')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {t('Plus tard', 'Plus tard')}
        </button>
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('Installer l\'App', 'Installer l\'App')}</span>
        </button>
      </div>
    </div>
  );
};
