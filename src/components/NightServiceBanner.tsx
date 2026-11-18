import React, { useState, useEffect } from 'react';
import { Moon, Clock, Sparkles, X, ChevronDown, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';

interface NightServiceBannerProps {
  forceVisible?: boolean;
}

export const NightServiceBanner: React.FC<NightServiceBannerProps> = ({ forceVisible = false }) => {
  const { currentLang } = useApp();
  const [isNightTime, setIsNightTime] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Vérification de l'heure : Actif de 19h00 (7:00 PM) le soir jusqu'à 07h00 (7:00 AM) le matin
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Formater l'heure locale
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTimeStr(timeFormatted);

      // Actif entre 19h00 (7:00 PM) et 06h59 (avant 7:00 AM)
      const inNightWindow = hours >= 19 || hours < 7;
      const forceTest = typeof window !== 'undefined' && localStorage.getItem('force_night_banner') === 'true';

      setIsNightTime(forceVisible || inNightWindow || forceTest);
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000); // Réévalue toutes les 30s
    return () => clearInterval(interval);
  }, [forceVisible]);

  // Si on n'est pas dans la plage horaire de nuit, ne rien afficher
  if (!isNightTime) {
    return null;
  }

  const langKey = (currentLang && translations[currentLang]) ? currentLang : 'FR';
  const tStrings = translations[langKey];

  const badgeText = tStrings.night_banner_badge || "HORAIRE DE NUIT (19H00 - 07H00)";
  const mainMessage = tStrings.night_banner_text || "Toute transaction soumise à cette heure sera effectuée le lendemain à partir de 7h00 AM, car les agents ne sont pas encore disponibles.";
  const scheduleText = tStrings.night_banner_schedule || "Reprise des opérations : Demain dès 7h00 AM";

  // Mode réduit / minimisé
  if (isDismissed) {
    return (
      <aside aria-label="Mode réduit service de nuit" className="bg-slate-950/95 border-b border-indigo-900/60 px-3 py-1 flex items-center justify-between text-[11px] text-indigo-200 z-50">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Moon className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-amber-300">{badgeText}</span>
          <span className="hidden sm:inline text-slate-400">• {scheduleText}</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-xs text-indigo-300 hover:text-white underline ml-2 transition-colors flex items-center gap-1 cursor-pointer"
          title="Afficher la banderole complète"
        >
          <span>Afficher le message</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </aside>
    );
  }

  // Segment répétitif pour un défilement continu sans interruption (Continuous Marquee)
  const MarqueeItem = () => (
    <div className="flex items-center gap-6 px-6 shrink-0">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm border border-amber-300">
        <Moon className="w-3 h-3 fill-slate-950 text-slate-950" />
        <span>7:00 PM – 7:00 AM</span>
      </span>

      <span className="font-semibold text-xs sm:text-sm text-amber-100 tracking-wide flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 inline-block" />
        <span>{mainMessage}</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300/90 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
        <Clock className="w-3 h-3 text-amber-300" />
        <span>{scheduleText}</span>
      </span>

      <span className="text-amber-500/60 font-bold">•</span>
    </div>
  );

  return (
    <aside aria-label="Banderole horaire service de nuit" className="relative w-full overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-amber-500/40 shadow-md z-50">
      {/* Halo d'ambiance nocturne */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative flex items-center h-10 px-2 sm:px-3">
        {/* Badge fixe à gauche avec indicateur lumineux */}
        <div className="hidden md:flex items-center gap-2 shrink-0 pr-3 border-r border-indigo-800/80 bg-slate-950/80 py-1 pl-1 z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
          <div className="flex items-center gap-1 text-[11px] font-extrabold tracking-wider text-amber-300 uppercase">
            <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{badgeText}</span>
          </div>
        </div>

        {/* Piste de défilement continu (Banderole qui passe) */}
        <div className="flex-1 overflow-hidden relative cursor-default select-none">
          {/* Dégradés latéraux pour estomper élégamment les bords */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

          {/* Double contenu pour une boucle fluide infinie */}
          <div 
            className="animate-marquee-scroll py-1"
            title="Survolez pour mettre en pause le défilement"
          >
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>

        {/* Bouton de minimisation à droite */}
        <div className="flex items-center gap-2 pl-2 shrink-0 z-10">
          {currentTimeStr && (
            <span className="hidden lg:inline text-[10px] font-mono font-bold text-amber-300/80 bg-slate-900/90 px-2 py-0.5 rounded border border-indigo-800/60">
              {currentTimeStr}
            </span>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimiser la banderole"
            aria-label="Fermer la banderole"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NightServiceBanner;
