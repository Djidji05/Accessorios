import React, { useState } from 'react';
import { Download, X, Smartphone, Share, PlusSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAInstallPrompt: React.FC = () => {
  const { 
    isPWAInstalled, 
    showPWAInstallPrompt, 
    setShowPWAInstallPrompt, 
    installPWA,
    t 
  } = useApp();

  const [showIOSModal, setShowIOSModal] = useState(false);

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
      const outcome = await installPWA();
      if (outcome === 'unsupported_ios') {
        setShowIOSModal(true);
      }
    } catch (e) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
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

      {/* Guide iOS Popup */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm">
                    {t('Installer sur iPhone / iOS')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('Procédure en 3 étapes simples')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {t('Appuyez sur Partager')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{t('Icône')}</span>
                    <Share className="w-3.5 h-3.5 text-blue-500 inline" />
                    <span>{t('en bas dans Safari')}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {t('« Sur l\'écran d\'accueil »')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{t('Appuyez sur')}</span>
                    <PlusSquare className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 inline" />
                    <span>{t('dans la liste')}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {t('Touchez « Ajouter »')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('L\'application Alexis s\'ouvrira désormais en plein écran.')}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                handleDismiss();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {t('J\'ai compris')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
