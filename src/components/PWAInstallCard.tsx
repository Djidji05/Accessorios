import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Info, 
  Sparkles, 
  Check, 
  ChevronRight, 
  X,
  Laptop
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PWAInstallCardProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallCard: React.FC<PWAInstallCardProps> = ({ 
  compact = false,
  className = '' 
}) => {
  const { isPWAInstalled, installPWA, t } = useApp();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    setFeedback(null);
    try {
      const outcome = await installPWA();
      if (outcome === 'accepted') {
        setFeedback(t('Installation réussie ! L\'application est désormais sur votre appareil.', 'Installation réussie ! L\'application est désormais sur votre appareil.'));
      } else if (outcome === 'already_installed') {
        setFeedback(t('L\'application est déjà installée sur cet appareil.', 'L\'application est déjà installée sur cet appareil.'));
      } else if (outcome === 'unsupported_ios') {
        setShowIOSModal(true);
      } else if (outcome === 'downloaded') {
        setFeedback(t('Application téléchargée avec succès ! Retrouvez le raccourci Alexis Transferencia dans vos téléchargements.', 'Application téléchargée avec succès ! Retrouvez le raccourci Alexis Transferencia dans vos téléchargements.'));
      } else if (outcome === 'dismissed') {
        setFeedback(t('Installation annulée.', 'Installation annulée.'));
      } else {
        setShowIOSModal(true);
      }
    } catch (err) {
      console.error(err);
      setShowIOSModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <div className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-all ${className} ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                  {t('Application Mobile & Bureau (PWA)', 'Application Mobile & Bureau (PWA)')}
                </h3>
                {isPWAInstalled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('Installée', 'Installée')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>{t('Disponible', 'Disponible')}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                {t(
                  'pwa_desc',
                  'Installez Alexis Transferencia directement sur votre écran d\'accueil pour un accès ultra-rapide, un affichage plein écran et une utilisation fluide au comptoir.'
                )}
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {isPWAInstalled ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('App Déjà Installée', 'App Déjà Installée')}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isInstalling ? t('Installation...') : t('Installer l\'Application PWA')}</span>
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Modal Guide pour iOS / Navigateurs sans prompt automatique */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    {t('Installer sur votre Appareil')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('Instructions pour iPhone, iPad ou Safari / Chrome')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                {t('Pour ajouter l\'application à votre écran d\'accueil :')}
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {t('Appuyez sur le bouton Partager')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>{t('Icône')}</span>
                      <Share className="w-3.5 h-3.5 text-blue-500 inline" />
                      <span>{t('située en bas de votre écran (sur Safari) ou en haut.')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {t('Sélectionnez « Sur l\'écran d\'accueil »')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>{t('Faites défiler le menu et appuyez sur')}</span>
                      <PlusSquare className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 inline" />
                      <span>{t('« Sur l\'écran d\'accueil »')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {t('Confirmez avec « Ajouter »')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('L\'icône Alexis Transferencia apparaîtra directement sur votre téléphone.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Laptop className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {t('Sur ordinateur (Chrome / Edge), vous pouvez également cliquer sur l\'icône d\'installation située directement dans la barre d\'adresse à droite.')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              {t('J\'ai compris')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
