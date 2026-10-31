import React, { useEffect } from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen?: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen = true,
  imageUrl,
  title = 'Aperçu de la Preuve Photo',
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div 
        className="w-full max-w-5xl flex items-center justify-between bg-slate-900/90 border border-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ZoomIn className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-bold text-white truncate">{title}</h4>
            <p className="text-[11px] text-slate-400 font-medium">Affichage haute résolution plein écran</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={imageUrl}
            download="preuve-alexis-transferencia.png"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Télécharger l'image"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Télécharger</span>
          </a>

          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Ouvrir</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="w-full flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={onClose}
      >
        <div 
          className="relative max-h-[82vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black/40"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl select-none"
          />
        </div>
      </div>

      {/* Footer Hint */}
      <div className="text-[11px] text-slate-400 font-medium pb-1 shrink-0 text-center">
        Cliquez n'importe où en dehors de l'image ou appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Échap</kbd> pour fermer
      </div>
    </div>
  );
};
