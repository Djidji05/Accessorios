import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Printer, 
  Clock, 
  ArrowLeft,
  X,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  FileText,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportTransactionsToCSV, exportTransactionsToPDF } from '../utils/exportUtils';
import { OperatorBadge } from '../components/OperatorBadge';
import { Transaction } from '../types';
import { compressImage } from '../utils/imageCompressor';

export type TimeFilterPreset = 'all' | 'today' | 'week' | 'month' | 'year';

export const HistoryView: React.FC = () => {
  const { transactions, currentUser, setSelectedReceiptTx, completeTask, setIsTransactionDetailOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilterPreset>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  
  // Full-page inspection state
  const [inspectedTx, setInspectedTx] = useState<Transaction | null>(null);

  // Masquer la barre de navigation quand on inspecte les détails d'une transaction
  React.useEffect(() => {
    setIsTransactionDetailOpen(!!inspectedTx);
    return () => setIsTransactionDetailOpen(false);
  }, [inspectedTx, setIsTransactionDetailOpen]);

  // Proof Modal state inside HistoryView
  const [proofModalTx, setProofModalTx] = useState<Transaction | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);

  const isAgentHaiti = currentUser.role === 'agent_haiti';
  const isAgentRD = currentUser.role === 'agent_rd';

  // Périmètre strict selon le rôle : l'agent voit uniquement son propre historique
  const roleScopedTransactions = transactions.filter((tx) => {
    if (isAgentHaiti) {
      return (
        tx.operator === 'natcash' ||
        tx.operator === 'natcom' ||
        tx.operator === 'moncash' ||
        tx.operator === 'digicel' ||
        tx.channel === 'haiti_cash' ||
        tx.assignedToRole === 'agent_haiti'
      );
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
      <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto space-y-6 animate-in fade-in pb-28">
        
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
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
          
          {/* Header Row: Reference & Status */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Référence</span>
              <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                {inspectedTx.referenceNumber}
              </span>
            </div>

            {inspectedTx.status === 'completed' ? (
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/50">
                ✓ Clôturé
              </span>
            ) : (
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-200/50 flex items-center gap-1">
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

            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
              <span className="text-blue-700 dark:text-blue-400 font-bold">Commission Admin (DOP)</span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                +{(inspectedTx.commissionDOP || Math.round(inspectedTx.amountDOP * 0.01)).toLocaleString()} DOP
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
              <span className="text-blue-700 dark:text-blue-400 font-bold">Montant Reçu</span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-base">{inspectedTx.amountHTG.toLocaleString()} HTG</span>
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

            {/* Proof Section in Details */}
            {(inspectedTx.proofNotes || inspectedTx.proofUrl) && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Preuve de Clôture & Validation :</span>
                </div>
                {inspectedTx.proofNotes && (
                  <p className="text-[11px] font-mono text-blue-950 dark:text-blue-200 bg-white/90 dark:bg-slate-900 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 break-words">
                    {inspectedTx.proofNotes}
                  </p>
                )}
                {inspectedTx.proofUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-blue-300 dark:border-blue-700 max-h-52 bg-slate-900 flex items-center justify-center p-1">
                    <img 
                      src={inspectedTx.proofUrl} 
                      alt="Preuve de transaction" 
                      className="max-h-48 w-auto object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {(inspectedTx.status === 'in_progress' || inspectedTx.status === 'pending_routing') && (currentUser.role === 'admin' || currentUser.role === 'gestionnaire' || currentUser.role === 'agent_haiti') && (
            <button
              type="button"
              onClick={() => {
                setProofModalTx(inspectedTx);
                setProofNotes('');
                setProofImage(null);
                setProofError(null);
              }}
              className="w-full py-3.5 rounded-2xl font-black text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Valider avec Preuve</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedReceiptTx(inspectedTx)}
            className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
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

        {/* Proof Validation Modal inside HistoryView */}
        {proofModalTx && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar p-5 space-y-4 shadow-2xl text-slate-900 dark:text-white my-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Valider la Transaction #{proofModalTx.referenceNumber}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Opérateur : <strong className="uppercase text-slate-700 dark:text-slate-200">{proofModalTx.operator}</strong> • {proofModalTx.receiverName} ({proofModalTx.receiverPhone})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProofModalTx(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {proofError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{proofError}</span>
                </div>
              )}

              {/* Photo upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  1. Photo / Capture d'écran du reçu (Preuve OBLIGATOIRE 📷)
                </label>

                {proofImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                    <img src={proofImage} alt="Preuve" className="max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => setProofImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    <Camera className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cliquez pour importer la preuve photo MonCash / Reçu</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG ou WEBP (Max 10 Mo)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file);
                          setProofImage(compressed);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Note / Code SMS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  2. Code de Référence SMS / Note de confirmation
                </label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Ex: Réf MonCash #98421049 - Transfert exécuté avec succès..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (!proofModalTx) return;

                    if (!proofImage) {
                      setProofError('La preuve doit obligatoirement être une photo ou une capture d\'écran du reçu.');
                      return;
                    }

                    const proofSummary = proofNotes.trim()
                      ? proofNotes.trim()
                      : `Preuve validée par ${currentUser.name} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

                    const result = completeTask(proofModalTx.id, proofSummary, proofImage || undefined);

                    if (result.success) {
                      const updatedTx: Transaction = {
                        ...proofModalTx,
                        status: 'completed',
                        proofNotes: proofSummary,
                        proofUrl: proofImage || proofModalTx.proofUrl,
                        completedAt: new Date().toISOString()
                      };
                      setInspectedTx(updatedTx);
                      setProofModalTx(null);
                      setProofNotes('');
                      setProofImage(null);
                      setProofError(null);
                    } else {
                      setProofError(result.message || 'Erreur lors de la validation.');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer & Valider la Transaction</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* MAIN CLEAN TRANSACTION LIST VIEW WITH TIME FILTERS                         */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto space-y-6 font-sans animate-in fade-in pb-28">
      
      {/* Header Title, Count & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black shadow-xs">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Historique des Transactions
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs cursor-pointer"
            title="Exporter l'historique au format CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportTransactionsToPDF(filteredTransactions)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-900 shadow-sm hover:shadow-md cursor-pointer"
            title="Exporter l'historique au format PDF"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Full-width Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ou référence TRX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-blue-500/20"
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Operator Filter Dropdown */}
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les opérateurs</option>
              <option value="moncash">MonCash</option>
              <option value="natcash">Natcash</option>
              <option value="digicel">Digicel</option>
              <option value="natcom">Natcom</option>
              <option value="claro">Claro</option>
              <option value="altice">Altice</option>
              <option value="zelle">Zelle</option>
            </select>

            {/* Date Filters Bar (Tous, Jour, Semaine, Mois, Année) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar bg-slate-100/80 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    timeFilter === f.id
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredTransactions.length > 0 ? (
        <>
          {/* 1. DESKTOP VIEW: High-Density Full-Width Enterprise Data Table (hidden on mobile, visible md+) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-950/50">
                    <th className="py-4 px-5">Réf Transaction</th>
                    <th className="py-4 px-5">Date & Heure</th>
                    <th className="py-4 px-5">Opérateur</th>
                    <th className="py-4 px-5">Expéditeur (RD)</th>
                    <th className="py-4 px-5">Bénéficiaire (Haïti)</th>
                    <th className="py-4 px-5 text-right">Montant DOP</th>
                    <th className="py-4 px-5 text-right">Montant HTG</th>
                    <th className="py-4 px-5 text-right text-blue-600 dark:text-blue-400">Commission Admin</th>
                    <th className="py-4 px-5 text-center">Statut</th>
                    <th className="py-4 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-sans">
                  {filteredTransactions.map((tx) => (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Référence */}
                      <td className="py-3.5 px-5 font-mono font-black text-slate-900 dark:text-white text-xs">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {tx.referenceNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Opérateur */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <OperatorBadge operator={tx.operator} size="sm" />
                      </td>

                      {/* Expéditeur */}
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">{tx.senderName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-medium">{tx.senderPhone || '—'}</div>
                      </td>

                      {/* Bénéficiaire */}
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">{tx.receiverName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {tx.receiverPhone}
                        </div>
                      </td>

                      {/* Montant DOP */}
                      <td className="py-3.5 px-5 text-right font-black font-mono text-slate-900 dark:text-white text-sm whitespace-nowrap">
                        {tx.amountDOP.toLocaleString()} DOP
                      </td>

                      {/* Montant HTG */}
                      <td className="py-3.5 px-5 text-right font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {tx.amountHTG.toLocaleString()} HTG
                      </td>

                      {/* Commission Admin */}
                      <td className="py-3.5 px-5 text-right font-black font-mono text-blue-600 dark:text-blue-400 text-xs whitespace-nowrap">
                        +{(tx.commissionDOP || Math.round(tx.amountDOP * 0.01)).toLocaleString()} DOP
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        {tx.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Clôturé</span>
                          </span>
                        ) : tx.status === 'in_progress' || tx.status === 'pending_routing' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-800">
                            <Clock className="w-3 h-3 animate-pulse text-amber-500" />
                            <span>En attente</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200/60 dark:border-rose-800">
                            Annulé
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectedTx(tx)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                            title="Voir tous les détails"
                          >
                            Détails
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptTx(tx)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Imprimer le reçu client"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Reçu</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. MOBILE VIEW: Stacked Responsive Cards (visible on mobile <md) */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
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
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/50">
                      ✓ Clôturé
                    </span>
                  ) : tx.status === 'in_progress' || tx.status === 'pending_routing' ? (
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-900/50 flex items-center gap-1">
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
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
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
            ))}
          </div>
        </>
      ) : (
        /* Full-Width Empty State Card */
        <div className="p-12 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs w-full">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
            <FolderArchive className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Aucune transaction trouvée
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Aucun résultat ne correspond aux filtres de date, d'opérateur ou de recherche sélectionnés.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTimeFilter('all');
              setSearchQuery('');
              setOperatorFilter('all');
            }}
            className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-sm cursor-pointer inline-flex items-center gap-2"
          >
            <span>Réinitialiser tous les filtres</span>
          </button>
        </div>
      )}

      {/* Proof Validation Modal inside HistoryView */}
      {proofModalTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar p-5 space-y-4 shadow-2xl text-slate-900 dark:text-white my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Valider la Transaction #{proofModalTx.referenceNumber}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Opérateur : <strong className="uppercase text-slate-700 dark:text-slate-200">{proofModalTx.operator}</strong> • {proofModalTx.receiverName} ({proofModalTx.receiverPhone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProofModalTx(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {proofError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{proofError}</span>
              </div>
            )}

            {/* Photo upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                1. Photo / Capture d'écran du reçu (Preuve OBLIGATOIRE 📷)
              </label>

              {proofImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                  <img src={proofImage} alt="Preuve" className="max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={() => setProofImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-900/50">
                  <Camera className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cliquez pour importer la preuve photo MonCash / Reçu</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG ou WEBP (Max 10 Mo)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await compressImage(file);
                        setProofImage(compressed);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Note / Code SMS */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                2. Code de Référence SMS / Note de confirmation
              </label>
              <textarea
                rows={2}
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="Ex: Réf MonCash #98421049 - Transfert exécuté avec succès..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (!proofModalTx) return;

                  if (!proofImage) {
                    setProofError('La preuve doit obligatoirement être une photo ou une capture d\'écran du reçu.');
                    return;
                  }

                  const proofSummary = proofNotes.trim()
                    ? proofNotes.trim()
                    : `Preuve validée par ${currentUser.name} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

                  const result = completeTask(proofModalTx.id, proofSummary, proofImage || undefined);

                  if (result.success) {
                    const updatedTx: Transaction = {
                      ...proofModalTx,
                      status: 'completed',
                      proofNotes: proofSummary,
                      proofUrl: proofImage || proofModalTx.proofUrl,
                      completedAt: new Date().toISOString()
                    };
                    setInspectedTx(updatedTx);
                    setProofModalTx(null);
                    setProofNotes('');
                    setProofImage(null);
                    setProofError(null);
                  } else {
                    setProofError(result.message || 'Erreur lors de la validation.');
                  }
                }}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmer & Valider la Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
