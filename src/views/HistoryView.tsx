import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Printer, 
  Clock, 
  ArrowLeft,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from '../components/OperatorBadge';
import { Transaction } from '../types';
import { BottomNavBar } from '../components/BottomNavBar';

export type TimeFilterPreset = 'all' | 'today' | 'week' | 'month' | 'year';

export const HistoryView: React.FC = () => {
  const { transactions, currentUser, setSelectedReceiptTx } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilterPreset>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  
  // Full-page inspection state
  const [inspectedTx, setInspectedTx] = useState<Transaction | null>(null);

  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isAgentRD = currentUser.role === 'agent_rd';

  // Périmètre strict selon le rôle : l'agent voit uniquement son propre historique
  const roleScopedTransactions = transactions.filter((tx) => {
    if (isAgentHaiti) {
      return tx.operator === 'natcash' || tx.operator === 'natcom';
    }
    if (isAgentRD) {
      return (
        tx.createdByName?.toLowerCase() === currentUser.name?.toLowerCase() ||
        tx.senderName?.toLowerCase() === currentUser.name?.toLowerCase()
      );
    }
    return true; // Admin & Gestionnaire voient toutes les transactions
  });

  const filteredTransactions = roleScopedTransactions.filter((tx) => {
    const txDateObj = new Date(tx.createdAt);
    const now = new Date();

    // 1. Time Period Filter (Tous, Jour, Semaine, Mois, Année)
    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = txDateObj.toDateString() === now.toDateString();
    } else if (timeFilter === 'week') {
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      matchesTime = txDateObj >= startOfWeek;
    } else if (timeFilter === 'month') {
      matchesTime =
        txDateObj.getMonth() === now.getMonth() &&
        txDateObj.getFullYear() === now.getFullYear();
    } else if (timeFilter === 'year') {
      matchesTime = txDateObj.getFullYear() === now.getFullYear();
    }

    // 2. Search Query Filter
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      tx.referenceNumber.toLowerCase().includes(query) ||
      tx.receiverName.toLowerCase().includes(query) ||
      tx.senderName.toLowerCase().includes(query) ||
      tx.receiverPhone.includes(query) ||
      tx.senderPhone.includes(query);

    // 3. Operator Filter
    const matchesOperator = operatorFilter === 'all' || tx.operator === operatorFilter;

    return matchesTime && matchesSearch && matchesOperator;
  });

  /* -------------------------------------------------------------------------- */
  /* TRANSACTION DETAILS VIEW (STRUCTURED AS A CLEAN VERTICAL LIST)             */
  /* -------------------------------------------------------------------------- */
  if (inspectedTx) {
    return (
      <div className="p-4 max-w-xl mx-auto space-y-4 animate-in fade-in pb-28">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={() => setInspectedTx(null)}
            className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 cursor-pointer"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Détails de la Transaction
          </h3>

          <div className="w-9" />
        </div>

        {/* Main Details Card - Styled as a clean vertical list */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
          
          {/* Header Row: Reference & Status */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Référence</span>
              <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                {inspectedTx.referenceNumber}
              </span>
            </div>

            {inspectedTx.status === 'completed' ? (
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50">
                ✓ Clôturé
              </span>
            ) : (
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/50 flex items-center gap-1">
                <Clock className="w-3 h-3" /> En attente
              </span>
            )}
          </div>

          {/* Vertical Stacked Details List */}
          <div className="space-y-2 text-xs">
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Service / Opérateur</span>
              <OperatorBadge operator={inspectedTx.operator} size="sm" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Bénéficiaire</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{inspectedTx.receiverName}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Téléphone Bénéficiaire</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{inspectedTx.receiverPhone}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Expéditeur</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{inspectedTx.senderName}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Téléphone Expéditeur</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{inspectedTx.senderPhone}</span>
            </div>


            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Montant Envoyé</span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">{inspectedTx.amountDOP.toLocaleString()} DOP</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Montant Reçu</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">{inspectedTx.amountHTG.toLocaleString()} HTG</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 font-medium">Date & Heure</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {new Date(inspectedTx.createdAt).toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setSelectedReceiptTx(inspectedTx)}
            className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Reçu</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectedTx(null)}
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center block"
          >
            Retour à l'historique
          </button>
        </div>

      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* MAIN CLEAN TRANSACTION LIST VIEW WITH TIME FILTERS                         */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 animate-in fade-in pb-28">
      
      {/* Header Title & Count */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Historique des Transactions
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Date Filters Bar (Tous, Jour, Semaine, Mois, Année) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'today', label: 'Jour' },
          { id: 'week', label: 'Semaine' },
          { id: 'month', label: 'Mois' },
          { id: 'year', label: 'Année' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTimeFilter(f.id as TimeFilterPreset)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              timeFilter === f.id
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, ou référence TRX..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Streamlined Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Header Row: Operator + Reference + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <OperatorBadge operator={tx.operator} size="sm" />
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {tx.referenceNumber}
                  </span>
                </div>

                {tx.status === 'completed' ? (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-900/50">
                    ✓ Clôturé
                  </span>
                ) : tx.status === 'in_progress' || tx.status === 'pending_routing' ? (
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/50 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-pulse" /> En attente
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/50 dark:border-rose-900/50">
                    Annulé
                  </span>
                )}
              </div>

              {/* Beneficiary & Amount Info */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Bénéficiaire</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {tx.receiverName}
                  </h4>
                  <p className="text-xs font-mono font-bold text-slate-400">
                    {tx.receiverPhone}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                    {tx.amountDOP.toLocaleString()} DOP
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                    {tx.amountHTG.toLocaleString()} HTG
                  </span>
                </div>
              </div>

              {/* Footer Row: Date/Time + Receipt Button */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectedTx(tx)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Détails
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptTx(tx)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Reçu</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <FolderArchive className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              Aucune transaction trouvée
            </h4>
            <p className="text-xs text-slate-400">
              Aucun résultat pour le filtre de date ou de recherche sélectionné.
            </p>
            <button
              type="button"
              onClick={() => {
                setTimeFilter('all');
                setSearchQuery('');
                setOperatorFilter('all');
              }}
              className="mt-2 px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-bold hover:bg-orange-500/20 cursor-pointer inline-block"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on History List, hidden when inspecting transaction details) */}
      <BottomNavBar />
    </div>
  );
};
