import React, { useState } from 'react';
import { Search, Ticket, CheckCircle2, Clock, ShieldCheck, Activity, Landmark } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LatestUpdatesPanel: React.FC = () => {
  const { auditLogs, transactions, setSelectedReceiptTx } = useApp();
  const [filterPill, setFilterPill] = useState<'today' | 'yesterday' | 'week'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Today reference: 2026-09-12 / current date
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 7 * 86400000;

  // Map audit logs and transactions to dynamic activities
  const dynamicActivities = auditLogs.map((log) => {
    const rawTime = new Date(log.timestamp).getTime();
    return {
      id: log.id,
      timestamp: rawTime,
      title: log.action.replace(/_/g, ' '),
      subtext: log.details,
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: log.action.includes('CLOTURE') || log.action.includes('VALIDATION') ? CheckCircle2 : Activity,
      iconBg: log.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800',
      txRef: log.details.match(/#TX-\d+/)?.[0]
    };
  });

  // Add recent transaction events if audit logs are few
  const txActivities = transactions.map((tx) => {
    const rawTime = new Date(tx.createdAt).getTime();
    return {
      id: `tx-act-${tx.id}`,
      timestamp: rawTime,
      title: tx.status === 'completed' ? 'Transaction Clôturée' : 'Nouvelle Transaction Saisie',
      subtext: `${tx.referenceNumber} - ${tx.senderName} ➔ ${tx.receiverName} (${tx.amountDOP.toLocaleString()} DOP)`,
      time: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: tx.status === 'completed' ? ShieldCheck : Clock,
      iconBg: tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800',
      txObj: tx,
      txRef: tx.referenceNumber
    };
  });

  const allActivities = [...dynamicActivities, ...txActivities].sort((a, b) => b.timestamp - a.timestamp);

  const filtered = allActivities.filter(a => {
    // 1. Date filter pill
    if (filterPill === 'today') {
      const todayItems = allActivities.filter(item => item.timestamp >= startOfToday);
      if (todayItems.length >= 2 && !todayItems.some(i => i.id === a.id)) {
        return false;
      }
    } else if (filterPill === 'yesterday') {
      const yesterdayItems = allActivities.filter(item => item.timestamp < startOfToday);
      if (yesterdayItems.length > 0 && !yesterdayItems.some(i => i.id === a.id)) {
        return false;
      }
    }
    // 'week' shows all activities within the week

    // 2. Search query
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subtext.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleActivityClick = (item: any) => {
    if (item.txObj) {
      setSelectedReceiptTx(item.txObj);
    } else if (item.txRef) {
      const foundTx = transactions.find(t => t.referenceNumber === item.txRef);
      if (foundTx) {
        setSelectedReceiptTx(foundTx);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden h-full min-h-0 flex flex-col font-sans">
      
      {/* Header Bar */}
      <div className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-slate-200/70 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
        <h3 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <span>Activité Réseau en Temps Réel</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {filtered.length} événements
        </span>
      </div>

      {/* Main Content Area with Flex-1 scroll */}
      <div className="p-4 bg-white dark:bg-[#0F172A] flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Fixed controls: Pills & Search */}
        <div className="flex-shrink-0 space-y-3 mb-3">
          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              onClick={() => setFilterPill('today')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all text-center cursor-pointer ${
                filterPill === 'today' 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setFilterPill('yesterday')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                filterPill === 'yesterday' 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Hier
            </button>
            <button
              onClick={() => setFilterPill('week')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                filterPill === 'week' 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Semaine
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer l'activité (nom, réf, agent)..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        {/* Scrollable Activity Items List */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                onClick={() => handleActivityClick(item)}
                className="flex items-start justify-between text-xs p-2.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group"
                title={item.txRef ? "Cliquer pour afficher le reçu" : undefined}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 font-bold`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate capitalize">{item.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 line-clamp-2">
                      {item.subtext}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap pl-2">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

