import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, RotateCcw, X } from 'lucide-react';

export interface DateRange {
  preset: string;
  startDate: Date | null;
  endDate: Date | null;
  label: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today reference: Real dynamic date
  const today = new Date();

  // Default: "Last 7 days" relative to today
  const [selectedPreset, setSelectedPreset] = useState<string>(value?.preset || 'last_7_days');
  const [startDate, setStartDate] = useState<Date | null>(
    value?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    value?.endDate || new Date()
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Current view month in the calendar
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // Presets definition
  const presets = [
    { id: 'today', label: "Aujourd'hui", getRange: () => [today, today] },
    { 
      id: 'yesterday', 
      label: 'Hier', 
      getRange: () => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return [y, y];
      } 
    },
    { 
      id: 'last_7_days', 
      label: '7 derniers jours', 
      getRange: () => {
        const s = new Date(today);
        s.setDate(s.getDate() - 7);
        return [s, today];
      } 
    },
    { 
      id: 'last_30_days', 
      label: '30 derniers jours', 
      getRange: () => {
        const s = new Date(today);
        s.setDate(s.getDate() - 30);
        return [s, today];
      } 
    },
    { 
      id: 'this_month', 
      label: 'Ce mois-ci', 
      getRange: () => [new Date(today.getFullYear(), today.getMonth(), 1), today] 
    },
    { 
      id: 'last_month', 
      label: 'Mois dernier', 
      getRange: () => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)] 
    },
    { id: 'custom', label: 'Personnalisé', getRange: () => [startDate, endDate] }
  ];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const popover = document.getElementById('date-range-picker-popover');
        if (popover && popover.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format date helper: "12 Sep 2026"
  const formatDate = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatShortDate = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  // Label to display in pill button
  const getDisplayLabel = () => {
    if (selectedPreset === 'last_7_days') return 'Last week';
    if (selectedPreset === 'today') return "Aujourd'hui";
    if (selectedPreset === 'yesterday') return 'Hier';
    if (selectedPreset === 'last_30_days') return '30 derniers jours';
    if (selectedPreset === 'this_month') return 'Ce mois-ci';
    if (selectedPreset === 'last_month') return 'Mois dernier';
    if (startDate && endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        return formatShortDate(startDate);
      }
      return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
    }
    return 'Choisir une période';
  };

  // Calendar calculations
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const target = presets.find(p => p.id === presetId);
    if (target && presetId !== 'custom') {
      const [start, end] = target.getRange();
      setStartDate(start);
      setEndDate(end);
      if (start) {
        setViewYear(start.getFullYear());
        setViewMonth(start.getMonth());
      }
      if (onChange) {
        onChange({
          preset: presetId,
          startDate: start,
          endDate: end,
          label: target.label
        });
      }
      setIsOpen(false);
    }
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewYear, viewMonth, day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      setSelectedPreset('custom');
    } else if (startDate && !endDate) {
      if (clickedDate < startDate) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
      setSelectedPreset('custom');
    }
  };

  const isDateSelected = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (startDate && d.toDateString() === startDate.toDateString()) return 'start';
    if (endDate && d.toDateString() === endDate.toDateString()) return 'end';
    return null;
  };

  const isDateInRange = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (startDate && endDate) {
      return d > startDate && d < endDate;
    }
    if (startDate && !endDate && hoverDate) {
      if (hoverDate > startDate) {
        return d > startDate && d <= hoverDate;
      } else {
        return d >= hoverDate && d < startDate;
      }
    }
    return false;
  };

  const isToday = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d.toDateString() === today.toDateString();
  };

  const handleApply = () => {
    const finalStart = startDate || today;
    const finalEnd = endDate || startDate || today;
    if (onChange) {
      onChange({
        preset: selectedPreset,
        startDate: finalStart,
        endDate: finalEnd,
        label: `${formatShortDate(finalStart)} - ${formatShortDate(finalEnd)}`
      });
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    handleSelectPreset('last_7_days');
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Date Filter Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all border ${
          isOpen
            ? 'bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
        title="Filtrer par période"
      >
        <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${isOpen ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
        <span className="font-semibold truncate max-w-[130px] sm:max-w-none">{getDisplayLabel()}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
      </button>

      {/* Popover Wrapper (Modal overlay on mobile, dropdown popover on desktop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-0 sm:static sm:bg-transparent sm:backdrop-blur-none sm:z-auto animate-in fade-in duration-150">
          <div 
            id="date-range-picker-popover"
            className="w-full max-w-[360px] sm:max-w-none sm:w-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 sm:absolute sm:right-0 sm:top-full sm:mt-2 space-y-3 sm:space-y-4 max-h-[92vh] overflow-y-auto sm:max-h-none sm:overflow-visible"
          >
            {/* Mobile-Only Dialog Header */}
            <div className="flex items-center justify-between sm:hidden border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Sélectionner une période</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Presets Grid (Mobile: 2-column grid, Desktop: vertical list) */}
              <div className="sm:w-44 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-3 sm:pb-0 sm:pr-3 space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1 mb-1.5">
                  Périodes Prédéfinies
                </span>
                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-1">
                  {presets.map((p) => {
                    const isSelected = selectedPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-colors text-left ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-blue-600 text-white font-semibold'
                            : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 sm:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar View */}
              <div className="flex-1 space-y-3">
                
                {/* Month / Year Header Navigation */}
                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    title="Mois précédent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {monthNames[viewMonth]} {viewYear}
                  </span>

                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    title="Mois suivant"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day of Week Header */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {dayNames.map((day, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 py-0.5">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Previous month placeholders */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => {
                    const dayNum = prevMonthDays - firstDayIndex + idx + 1;
                    return (
                      <div
                        key={`prev-${idx}`}
                        className="h-8 sm:h-7 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-600 font-medium select-none"
                      >
                        {dayNum}
                      </div>
                    );
                  })}

                  {/* Current month days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const selectedType = isDateSelected(dayNum);
                    const inRange = isDateInRange(dayNum);
                    const todayFlag = isToday(dayNum);

                    let cellClass = 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';
                    
                    if (selectedType === 'start' || selectedType === 'end') {
                      cellClass = 'bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-lg shadow-2xs';
                    } else if (inRange) {
                      cellClass = 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 font-semibold rounded-none';
                    }

                    return (
                      <button
                        key={`day-${dayNum}`}
                        onClick={() => handleDayClick(dayNum)}
                        onMouseEnter={() => setHoverDate(new Date(viewYear, viewMonth, dayNum))}
                        onMouseLeave={() => setHoverDate(null)}
                        className={`h-8 sm:h-7 w-full flex items-center justify-center text-xs transition-all relative rounded-lg ${cellClass}`}
                      >
                        <span>{dayNum}</span>
                        {todayFlag && !selectedType && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected dates preview text */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="text-slate-500 dark:text-slate-400">
                    {startDate ? (
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200">{formatDate(startDate)}</strong>
                        {endDate && endDate.toDateString() !== startDate.toDateString() && (
                          <> ➔ <strong className="text-slate-800 dark:text-slate-200">{formatDate(endDate)}</strong></>
                        )}
                      </span>
                    ) : (
                      <span>Sélectionnez une date</span>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApply}
                  className="text-xs bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-xl shadow-xs transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
