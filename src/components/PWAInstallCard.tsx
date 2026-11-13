import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Check
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
      } else if (outcome === 'ios_profile') {
        setFeedback(t('Installation Apple Web Clip déclenchée ! Suivez l\'invite système pour ajouter l\'icône sur votre écran.', 'Installation Apple Web Clip déclenchée ! Suivez l\'invite système pour ajouter l\'icône sur votre écran.'));
      } else if (outcome === 'downloaded') {
        setFeedback(t('Application téléchargée avec succès ! Retrouvez le raccourci Alexis Transferencia dans vos téléchargements.', 'Application téléchargée avec succès ! Retrouvez le raccourci Alexis Transferencia dans vos téléchargements.'));
      } else if (outcome === 'dismissed') {
        setFeedback(t('Installation annulée.', 'Installation annulée.'));
      } else {
        setFeedback(t('Application prête et disponible !', 'Application prête et disponible !'));
      }
    } catch (err) {
      console.error(err);
      setFeedback(t('Application prête et disponible !', 'Application prête et disponible !'));
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
    </>
  );
};
