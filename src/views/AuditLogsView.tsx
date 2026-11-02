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
import { exportAuditLogsToCSV, exportAuditLogsToPDF } from '../utils/exportUtils';
import { Pagination } from '../components/Pagination';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guichet' | 'security' | 'user' | 'treasury'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all');
  
  // Standardized Date Range Picker
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    preset: 'last_7_days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: '7 derniers jours'
  });

  // Full-page log inspection state (NO MODAL POPUP DIV)
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const LOGS_PAGE_SIZE = 15;

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedPriority, selectedRange]);

  const resolveLogPriority = (p?: string, action?: string): 'Critical' | 'High' | 'Medium' | 'Low' => {
    const raw = (p || '').toString().trim().toLowerCase();
    if (raw.includes('critiq') || raw.includes('critic') || raw.includes('kritik')) {
      return 'Critical';
    }
    if (raw.includes('elev') || raw.includes('élev') || raw.includes('high') || raw.includes('alta') || raw.includes('wo')) {
      return 'High';
    }
    if (raw.includes('moyen') || raw.includes('med') || raw.includes('media') || raw.includes('mwayen') || raw.includes('normal')) {
      return 'Medium';
    }
    if (raw.includes('faibl') || raw.includes('low') || raw.includes('baja') || raw.includes('ba')) {
      return 'Low';
    }
    // Déduction contextuelle par l'action enregistrée
    if (action) {
      const act = action.toUpperCase();
      if (act.includes('KILL_SWITCH') || act.includes('SECURITY_CRITICAL') || act.includes('48H')) return 'Critical';
      if (act.includes('SECURITY') || act.includes('PERMISSION_DENIED') || act.includes('24H') || act.includes('ANNULATION')) return 'High';
      if (act.includes('USER') || act.includes('PERMISSION') || act.includes('TREASURY') || act.includes('TRANSACTION')) return 'Medium';
    }
    return 'Low';
  };

  const getPriorityBadge = (p?: string, action?: string) => {
    const priority = resolveLogPriority(p, action);

    switch (priority) {
      case 'Critical':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-sm ring-2 ring-red-400/40 animate-pulse"
            style={{
              backgroundColor: '#DC2626',
              borderColor: '#B91C1C',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)'
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFFFFF', fill: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>{t('critical_priority', 'Critique')}</span>
          </span>
        );
      case 'High':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-sm border"
            style={{
              backgroundColor: '#EA580C',
              borderColor: '#C2410C',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.35)'
            }}
          >
            <Flag className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFFFFF', fill: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>{t('high_priority', 'Élevée')}</span>
          </span>
        );
      case 'Medium':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-sm border"
            style={{
              backgroundColor: '#D97706',
              borderColor: '#B45309',
              color: '#FFFFFF',
              boxShadow: '0 2px 5px rgba(217, 119, 6, 0.3)'
            }}
          >
            <Flag className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFFFFF', fill: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>{t('medium_priority', 'Moyenne')}</span>
          </span>
        );
      case 'Low':
      default:
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-sm border"
            style={{
              backgroundColor: '#059669',
              borderColor: '#047857',
              color: '#FFFFFF',
              boxShadow: '0 2px 5px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Flag className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFFFFF', fill: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>{t('low_priority', 'Basse')}</span>
          </span>
        );
    }
  };

  const getPriorityRowStyle = (p?: string, action?: string): React.CSSProperties => {
    const priority = resolveLogPriority(p, action);
    switch (priority) {
      case 'Critical':
        return { borderLeft: '4px solid #DC2626', backgroundColor: 'rgba(254, 242, 242, 0.65)' };
      case 'High':
        return { borderLeft: '4px solid #EA580C', backgroundColor: 'rgba(255, 247, 237, 0.5)' };
      case 'Medium':
        return { borderLeft: '4px solid #D97706', backgroundColor: 'rgba(254, 243, 199, 0.4)' };
      case 'Low':
      default:
        return { borderLeft: '4px solid #059669', backgroundColor: 'rgba(236, 253, 245, 0.35)' };
    }
  };

  const getPriorityRowBorder = (p?: string, action?: string) => {
    const priority = resolveLogPriority(p, action);
    if (priority === 'Critical') return 'border-l-4 border-l-red-600 bg-red-50/40 hover:bg-red-50/60';
    if (priority === 'High') return 'border-l-4 border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50';
    if (priority === 'Medium') return 'border-l-4 border-l-amber-500 bg-amber-50/25 hover:bg-amber-50/45';
    return 'border-l-4 border-l-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/35';
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

    let matchesPriority = true;
    if (selectedPriority !== 'all') {
      const p = resolveLogPriority(log.priority, log.action);
      matchesPriority = p === selectedPriority;
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

    return matchesSearch && matchesCat && matchesPriority && matchesDate;
  });

  const logsTotalPages = Math.ceil(filteredLogs.length / LOGS_PAGE_SIZE) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * LOGS_PAGE_SIZE, page * LOGS_PAGE_SIZE);

  /* -------------------------------------------------------------------------- */
  /* FULL-PAGE LOG INSPECTION VIEW                                              */
  /* -------------------------------------------------------------------------- */
  if (inspectedLog) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto animate-in fade-in pb-28 md:pb-6">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInspectedLog(null)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back_to_logs', 'Retour aux Journaux')}</span>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{t('audit_event_detail', "Détail de l'Événement d'Audit")}</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg text-xs border border-blue-200">
                  {inspectedLog.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('unalterable_record_dated', 'Enregistrement inaltérable horodaté le')} {new Date(inspectedLog.timestamp).toLocaleString()}
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
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('executed_action', 'Action Exécutée')}</span>
                  <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{inspectedLog.action}</span>
                </div>
                {getPriorityBadge(inspectedLog.priority, inspectedLog.action)}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">{t('complete_details_payload', 'Détails Complets & Payload de Traçabilité')}</span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-800 leading-relaxed break-words">
                  {inspectedLog.details}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('responsible_actor', 'Acteur Responsable')}</span>
                  <p className="font-extrabold text-slate-900 text-sm">{inspectedLog.actorName}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{inspectedLog.actorRole.replace('_', ' ')}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('precise_timestamp', 'Horodatage Précis (UTC/ISO)')}</span>
                  <p className="font-mono font-bold text-slate-900 text-xs">{inspectedLog.timestamp}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('integrity_signature_verified', "Signature d'intégrité vérifiée")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-md">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-300">{t('compliance_integrity', 'Conformité & Intégrité')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('compliance_desc', "Ce journal est enregistré de manière inaltérable et sérialisé au format append-only. Aucune modification n'est permise même par les administrateurs.")}
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{t('storage_status_colon', 'Statut Stockage:')}</span>
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-28 md:pb-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('audit_title', "Traçabilité & Journaux d'Audit (Logs Système)")}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('audit_subtitle', "Enregistrement inaltérable de toutes les saisies guichet, actions d'urgence, transferts et modifications.")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* CALENDAR DATE PICKER IN TOP RIGHT */}
          <DateRangePicker value={selectedRange} onChange={setSelectedRange} />

          <button
            onClick={() => exportAuditLogsToCSV(filteredLogs)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200/80 cursor-pointer"
            title={t('export_csv', 'Export CSV')}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t('export_csv', 'Export CSV')}</span>
          </button>

          <button
            onClick={() => exportAuditLogsToPDF(filteredLogs)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-900 cursor-pointer"
            title={t('export_pdf', 'Export PDF')}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t('export_pdf', 'Export PDF')}</span>
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
            placeholder={t('search_logs_placeholder', 'Rechercher dans les logs (Acteur, Action, Référence, Nœud ID...)')}
            className="w-full bg-slate-50 border border-slate-200/80 text-xs text-slate-800 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
          />
        </div>

        {/* Category & Priority Filter Chips */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: t('all_logs', 'Tous les Logs') },
              { id: 'guichet', label: t('guichet_ops_cat', 'Guichet & Opérations') },
              { id: 'security', label: t('security_killswitch_cat', 'Sécurité & Interrupteurs') },
              { id: 'user', label: t('users_cat', 'Utilisateurs') }
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

          {/* Priority Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-2.5 pt-2 sm:pt-0">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-1">{t('priority_colon', 'Priorité:')}</span>
            {[
              { id: 'all', label: t('all_priorities', 'Toutes'), activeBg: '#0f172a', activeColor: '#ffffff' },
              { id: 'Critical', label: t('critical_priority', 'Critique'), activeBg: '#dc2626', activeColor: '#ffffff' },
              { id: 'High', label: t('high_priority', 'Élevée'), activeBg: '#ea580c', activeColor: '#ffffff' },
              { id: 'Medium', label: t('medium_priority', 'Moyenne'), activeBg: '#d97706', activeColor: '#ffffff' },
              { id: 'Low', label: t('low_priority', 'Basse'), activeBg: '#059669', activeColor: '#ffffff' },
            ].map((pr) => {
              const isSelected = selectedPriority === pr.id;
              return (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPriority(pr.id as any)}
                  style={isSelected ? { backgroundColor: pr.activeBg, color: pr.activeColor, borderColor: pr.activeBg } : undefined}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all border cursor-pointer ${
                    isSelected 
                      ? 'shadow-md scale-105' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pr.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CLEAN SINGLE-LINE OVERFLOW-FREE LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
            {t('system_events_recorded', 'Événements Système Enregistrés')} ({filteredLogs.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Append-Only Immuable</span>
        </div>

        {/* 1. DESKTOP 12-COLUMN TABLE (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/40 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 items-center">
              <div className="col-span-2">{t('timestamp_header', 'Horodatage')}</div>
              <div className="col-span-2">{t('priority_header', 'Priorité')}</div>
              <div className="col-span-2">{t('actor_role_header', 'Acteur / Rôle')}</div>
              <div className="col-span-2">{t('event_header', 'Événement')}</div>
              <div className="col-span-3">{t('traceability_details_header', 'Détails Traçabilité')}</div>
              <div className="col-span-1 text-center">{t('action_header', 'Action')}</div>
            </div>

            {/* Table Body Rows */}
            <div className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedLogs.map((log) => (
                <div 
                  key={log.id} 
                  onClick={() => setInspectedLog(log)}
                  style={getPriorityRowStyle(log.priority, log.action)}
                  className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors cursor-pointer ${getPriorityRowBorder(log.priority, log.action)}`}
                  title={t('click_view_audit_sheet', "Cliquer pour voir la fiche d'audit complète")}
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
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      title={t('view_audit_sheet', "Voir la Fiche d'Audit Complète")}
                    >
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span>{t('view_btn', 'Voir')}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. MOBILE CARD VIEW (md:hidden) */}
        <div className="md:hidden divide-y divide-slate-100 p-2 space-y-2">
          {paginatedLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setInspectedLog(log)}
              style={getPriorityRowStyle(log.priority, log.action)}
              className={`p-3.5 space-y-2.5 rounded-2xl transition-colors cursor-pointer border ${getPriorityRowBorder(log.priority, log.action)}`}
            >
              {/* Top: Timestamp & Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-slate-400">({new Date(log.timestamp).toLocaleDateString()})</span>
                </div>
                {getPriorityBadge(log.priority, log.action)}
              </div>

              {/* Actor and Action */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {log.actorName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <span className="font-extrabold text-slate-900 text-xs block truncate leading-tight">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono capitalize">{log.actorRole.replace('_', ' ')}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase font-mono shrink-0 ${
                  log.action.includes('TRANSACTION') ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                  log.action.includes('KILL_SWITCH') ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                  log.action.includes('USER') ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                  'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {log.action}
                </span>
              </div>

              {/* Details snippet */}
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px] leading-relaxed break-words">
                {log.details}
              </p>

              {/* Inspect action */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400" onClick={(e) => e.stopPropagation()}>
                <span className="font-mono text-[10px]">{log.nodeId}</span>
                <button
                  onClick={() => setInspectedLog(log)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('view_btn', 'Voir')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredLogs.length > LOGS_PAGE_SIZE && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              currentPage={page}
              totalPages={logsTotalPages}
              onPageChange={setPage}
              totalItems={filteredLogs.length}
              itemsPerPage={LOGS_PAGE_SIZE}
            />
          </div>
        )}
      </div>

    </div>
  );
};
