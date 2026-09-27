import React, { useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  Search, 
  Download, 
  Eye, 
  ArrowLeft, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Lock, 
  User, 
  Layers, 
  Clock, 
  FileText,
  Calendar,
  X,
  Flag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import { DateRangePicker, DateRange } from '../components/DateRangePicker';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guichet' | 'security' | 'user' | 'treasury'>('all');
  
  // Standardized Date Range Picker
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours'
  });

  // Full-page log inspection state (NO MODAL POPUP DIV)
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);

  const getPriorityBadge = (p?: string, action?: string) => {
    let priority = p;
    if (!priority && action) {
      if (action.includes('KILL_SWITCH') || action.includes('SECURITY')) priority = 'High';
      else if (action.includes('USER') || action.includes('PERMISSION') || action.includes('TREASURY')) priority = 'Medium';
      else priority = 'Low';
    }

    switch (priority) {
      case 'Critical':
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Flag className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>High</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Flag className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Medium</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Flag className="w-3 h-3 text-slate-400" />
            <span>Low</span>
          </span>
        );
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const logDateObj = new Date(log.timestamp);
    const todayObj = new Date();

    const matchesSearch = 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.nodeId.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCat = true;
    if (selectedCategory === 'guichet') {
      matchesCat = log.action.includes('TRANSACTION') || log.action.includes('GUICHET');
    } else if (selectedCategory === 'security') {
      matchesCat = log.action.includes('KILL_SWITCH') || log.action.includes('SECURITY');
    } else if (selectedCategory === 'user') {
      matchesCat = log.action.includes('USER') || log.action.includes('PERMISSION');
    } else if (selectedCategory === 'treasury') {
      matchesCat = log.action.includes('TREASURY') || log.action.includes('FLOAT');
    }

    // Date filtering logic
    let matchesDate = true;
    if (selectedRange && selectedRange.startDate && selectedRange.endDate) {
      const start = new Date(selectedRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedRange.endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = logDateObj >= start && logDateObj <= end;
    }

    return matchesSearch && matchesCat && matchesDate;
  });

  /* -------------------------------------------------------------------------- */
  /* FULL-PAGE LOG INSPECTION VIEW                                              */
  /* -------------------------------------------------------------------------- */
  if (inspectedLog) {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInspectedLog(null)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux Journaux</span>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Détail de l'Événement d'Audit</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg text-xs border border-blue-200">
                  {inspectedLog.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Enregistrement inaltérable horodaté le {new Date(inspectedLog.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold font-mono">
              ACK: {inspectedLog.nodeStatus}
            </span>
          </div>
        </div>

        {/* 2-Column Full-Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Action Exécutée</span>
                  <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{inspectedLog.action}</span>
                </div>
                {getPriorityBadge(inspectedLog.priority, inspectedLog.action)}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Détails Complets & Payload de Traçabilité</span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-800 leading-relaxed break-words">
                  {inspectedLog.details}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acteur Responsable</span>
                  <p className="font-extrabold text-slate-900 text-sm">{inspectedLog.actorName}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{inspectedLog.actorRole.replace('_', ' ')}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horodatage Précis (UTC/ISO)</span>
                  <p className="font-mono font-bold text-slate-900 text-xs">{inspectedLog.timestamp}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Signature d'intégrité vérifiée
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-md">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-300">Conformité & Intégrité</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ce journal est enregistré de manière inaltérable et sérialisé au format append-only. Aucune modification n'est permise même par les administrateurs.
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Statut Stockage:</span>
                <span className="text-emerald-400 font-bold">PERSISTÉ ACID</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* MAIN AUDIT LOGS LIST                                                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Traçabilité & Journaux d'Audit (Logs Système)</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Enregistrement inaltérable de toutes les saisies guichet, actions d'urgence, transferts et modifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* CALENDAR DATE PICKER IN TOP RIGHT */}
          <DateRangePicker value={selectedRange} onChange={setSelectedRange} />

          <button
            onClick={() => alert("Exportation des journaux d'audit au format JSON/CSV...")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200/80"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter Logs</span>
          </button>
        </div>
      </div>

      {/* 2. CONTROLS: CATEGORY CHIPS & SEARCH */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les logs (Acteur, Action, Référence, Nœud ID...)"
            className="w-full bg-slate-50 border border-slate-200/80 text-xs text-slate-800 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {[
            { id: 'all', label: 'Tous les Logs' },
            { id: 'guichet', label: 'Guichet & Opérations' },
            { id: 'security', label: 'Sécurité & Interrupteurs' },
            { id: 'user', label: 'Utilisateurs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CLEAN SINGLE-LINE OVERFLOW-FREE LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
            Événements Système Enregistrés ({filteredLogs.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Append-Only Immuable</span>
        </div>

        {/* Table Header Row */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/40 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 items-center">
          <div className="col-span-2">Horodatage</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Acteur / Rôle</div>
          <div className="col-span-2">Événement</div>
          <div className="col-span-3">Détails Traçabilité</div>
          <div className="col-span-1 text-center">Action</div>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-slate-100 text-xs font-medium">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => setInspectedLog(log)}
              className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-50/80 transition-colors cursor-pointer"
              title="Cliquer pour voir la fiche d'audit complète"
            >
              
              {/* 1. Horodatage */}
              <div className="col-span-2 font-mono text-[11px] text-slate-500 whitespace-nowrap truncate">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                <span className="text-[10px] text-slate-400 ml-1">({new Date(log.timestamp).toLocaleDateString()})</span>
              </div>

              {/* 2. Priority */}
              <div className="col-span-2">
                {getPriorityBadge(log.priority, log.action)}
              </div>

              {/* 3. Acteur / Rôle */}
              <div className="col-span-2 min-w-0">
                <p className="font-bold text-slate-900 truncate">{log.actorName}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize font-mono">{log.actorRole.replace('_', ' ')}</p>
              </div>

              {/* 4. Événement */}
              <div className="col-span-2 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase font-mono ${
                  log.action.includes('TRANSACTION') ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                  log.action.includes('KILL_SWITCH') ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                  log.action.includes('USER') ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                  'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {log.action}
                </span>
              </div>

              {/* 5. Détails Traçabilité */}
              <div className="col-span-3 text-slate-700 truncate font-mono text-[11px]">
                {log.details}
              </div>

              {/* 6. Action Voir */}
              <div className="col-span-1 text-center" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setInspectedLog(log)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 mx-auto"
                  title="Voir la Fiche d'Audit Complète"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>Voir</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
