import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  compact?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  compact = false,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 text-xs select-none ${className}`}>
      {/* Item counts indicator */}
      {startItem && endItem && totalItems ? (
        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium order-2 sm:order-1">
          Affichage de <span className="font-bold text-slate-800 dark:text-slate-200">{startItem}</span> à{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">{endItem}</span> sur{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span>
        </span>
      ) : (
        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium order-2 sm:order-1">
          Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> sur{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
        </span>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`p-1.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
          }`}
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {!compact &&
          getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  currentPage === p
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400 dark:text-slate-600 font-bold">
                …
              </span>
            )
          )}

        {compact && (
          <span className="px-2 font-bold text-xs text-slate-700 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`p-1.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
            currentPage >= totalPages
              ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
          }`}
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
