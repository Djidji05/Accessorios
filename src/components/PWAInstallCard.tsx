import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Check,
  X,
  Share2,
  MoreVertical,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  PlusSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PWAInstallCardProps {
  compact?: boolean;
  className?: string;
}

type PlatformTab = 'android' | 'ios' | 'desktop';

export const PWAInstallCard: React.FC<PWAInstallCardProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const { isPWAInstalled, installPWA, downloadDesktopShortcut, t } = useApp();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>('android');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformTab>('android');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(ua);
      
      if (isIOS) {
        setDetectedPlatform('ios');
        setActiveTab('ios');
      } else if (isAndroid) {
        setDetectedPlatform('android');
        setActiveTab('android');
      } else {
        setDetectedPlatform('desktop');
        setActiveTab('desktop');
      }
    }
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    setFeedback(null);
    try {
      const outcome = await installPWA();
      if (outcome === 'accepted') {
        setFeedback(t('Installation réussie ! L\'application est désormais sur votre appareil.', 'Installation réussie ! L\'application est désormais sur votre appareil.'));
      } else if (outcome === 'already_installed') {
        setFeedback(t('L\'application est déjà installée sur cet appareil.', 'L\'application est déjà installée sur cet appareil.'));
      } else if (outcome === 'guide_needed') {
        setShowGuideModal(true);
      } else if (outcome === 'downloaded') {
        setFeedback(t('Raccourci de bureau téléchargé avec succès ! Retrouvez Alexis Transferencia sur votre écran.', 'Raccourci de bureau téléchargé avec succès ! Retrouvez Alexis Transferencia sur votre écran.'));
      } else if (outcome === 'dismissed') {
        setFeedback(t('Installation annulée.', 'Installation annulée.'));
      } else {
        setShowGuideModal(true);
      }
    } catch (err) {
      console.error(err);
      setShowGuideModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const getPlatformBadge = () => {
    if (detectedPlatform === 'ios') return 'iPhone / iPad';
    if (detectedPlatform === 'android') return 'Android';
    return 'Ordinateur (PC/Mac)';
  };

  return (
    <>
      <div className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-all ${className} ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {detectedPlatform === 'desktop' ? (
                <Monitor className="w-6 h-6 text-white" />
              ) : (
                <Smartphone className="w-6 h-6 text-white" />
              )}
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
                    <span>{t('Prête à installer', 'Prête à installer')}</span>
                  </span>
                )}
                <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {getPlatformBadge()}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                {t(
                  'pwa_desc',
                  'Installez Alexis Transferencia directement sur votre écran d\'accueil pour un accès ultra-rapide, un affichage plein écran et une utilisation fluide au comptoir.'
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0 self-start md:self-center">
            {isPWAInstalled ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('App Déjà Installée', 'App Déjà Installée')}</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{isInstalling ? t('Installation...') : t('Installer l\'Application')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="w-full sm:w-auto px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                  title={t('Comment installer l\'application sur votre téléphone ou PC')}
                >
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>{t('Guide d\'installation', 'Guide d\'installation')}</span>
                </button>
              </>
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

      {/* MODAL GUIDE D'INSTALLATION ÉTAPE PAR ÉTAPE */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t('Installer Alexis Transferencia', 'Installer Alexis Transferencia')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Ajoutez l\'application sur votre écran d\'accueil en 2 étapes rapides.', 'Ajoutez l\'application sur votre écran d\'accueil en 2 étapes rapides.')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iOS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Mac</span>
              </button>
            </div>

            {/* TAB CONTENT: ANDROID */}
            {activeTab === 'android' && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Installation PWA 100% sécurisée via Chrome ou Samsung Internet</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">1</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Ouvrez le menu du navigateur <MoreVertical className="w-3.5 h-3.5 text-slate-500 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Appuyez sur les <strong>3 petits points verticaux</strong> en haut à droite de Chrome ou du navigateur.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">2</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Sélectionnez « Installer l'application » <Download className="w-3.5 h-3.5 text-blue-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        (ou <em>« Ajouter à l'écran d'accueil »</em> selon votre modèle de téléphone).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">3</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Confirmez « Installer » <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        L'icône officielle <strong>Alexis Transferencia</strong> apparaît immédiatement sur votre écran d'accueil avec ouverture plein écran !
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Lancer l'invite automatique Android</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: IOS (IPHONE / IPAD) */}
            {activeTab === 'ios' && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sur iPhone / iPad, l'installation se fait directement depuis le navigateur <strong>Safari</strong></span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">1</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">
                        Ouvrez la page dans Safari
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Assurez-vous d'être dans le navigateur <strong>Safari</strong> d'Apple (pas Google Chrome iOS).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">2</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Touchez le bouton Partager <Share2 className="w-3.5 h-3.5 text-blue-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        C'est l'icône de rectangle avec une flèche vers le haut située en bas de l'écran.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">3</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Sélectionnez « Sur l'écran d'accueil » <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Faites défiler le menu d'actions vers le bas puis touchez <strong>« Sur l'écran d'accueil »</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">4</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Touchez « Ajouter » <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        En haut à droite de l'écran. L'icône Alexis Transferencia sera ajoutée sur votre écran d'iPhone !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DESKTOP (PC / MAC) */}
            {activeTab === 'desktop' && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Installation PWA instantanée sur Google Chrome, Microsoft Edge ou Brave</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">1</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Cliquez sur l'icône « Installer » dans la barre d'adresse <Download className="w-3.5 h-3.5 text-blue-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Tout à droite de la barre d'adresse de votre navigateur (icône d'écran avec une flèche vers le bas).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">2</span>
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Cliquez sur « Installer » <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        L'application se lance dans sa propre fenêtre indépendante, avec icône sur la barre des tâches Windows ou le Dock Mac.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Téléchargement direct raccourci bureau */}
                <div className="pt-2 border-t border-slate-150 dark:border-slate-800 flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Option alternative directe pour Windows :
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      downloadDesktopShortcut();
                      setFeedback(t('Raccourci de bureau téléchargé avec succès !'));
                      setShowGuideModal(false);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Télécharger le raccourci Bureau (.url)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Alexis Transferencia v2.4 (PWA Standalone)
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                {t('Compris, fermer', 'Compris, fermer')}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
