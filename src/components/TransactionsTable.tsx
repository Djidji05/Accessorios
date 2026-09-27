import React, { useState } from 'react';
import { Search, Filter, Flag, Clock, CheckCircle2, Eye, Printer, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from './OperatorBadge';
import { DateRange } from './DateRangePicker';

interface TransactionsTableProps {
  dateRange?: DateRange;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ dateRange }) => {
  const { setSelectedReceiptTx, transactions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.receiverPhone.includes(searchQuery) ||
      tx.operator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    let matchesDate = true;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const txDate = new Date(tx.createdAt);
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = txDate >= start && txDate <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getSlaStatus = (createdAtIso: string, status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Traité / Validé</span>
        </span>
      );
    }

    const minutes = Math.floor((Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60));
    if (minutes >= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>SLA Dépassé ({minutes}m)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>En cours ({15 - minutes}m restants)</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden font-sans">
      
      {/* Table Header */}
      <div className="bg-slate-50 border-b border-slate-200/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-slate-900 animate-ping" />
          <div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
              Surveillance des SLA & Flux Opérationnels en Direct ({filteredTransactions.length})
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Contrôle en temps réel des transactions du réseau</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="all">Tous les Statuts</option>
            <option value="in_progress">🟠 En Cours / En Attente</option>
            <option value="completed">🟢 Clôturés / Certifiés</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher #TX, nom, tél..."
              className="bg-white border border-slate-200 text-xs font-bold text-slate-900 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-slate-400 w-48"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3.5 px-5">Réf Transaction</th>
              <th className="py-3.5 px-5">Opérateur</th>
              <th className="py-3.5 px-5">Expéditeur (RD)</th>
              <th className="py-3.5 px-5">Bénéficiaire (Haïti)</th>
              <th className="py-3.5 px-5 text-right">Montant Pesos</th>
              <th className="py-3.5 px-5 text-right text-blue-600 dark:text-blue-400">Commission Admin</th>
              <th className="py-3.5 px-5 text-right">Montant HTG</th>
              <th className="py-3.5 px-5 text-center">Suivi SLA & Statut</th>
              <th className="py-3.5 px-5 text-center">Action Reçu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                
                {/* Réf */}
                <td className="py-3.5 px-5">
                  <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {tx.referenceNumber}
                  </span>
                </td>

                {/* Opérateur Badge */}
                <td className="py-3.5 px-5">
                  <OperatorBadge operator={tx.operator} size="sm" />
                </td>

                {/* Expéditeur */}
                <td className="py-3.5 px-5">
                  <div className="font-bold text-slate-900">{tx.senderName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{tx.senderPhone}</div>
                </td>

                {/* Bénéficiaire */}
                <td className="py-3.5 px-5">
                  <div className="font-bold text-slate-900">{tx.receiverName}</div>
                  <div className="text-[10px] text-slate-600 font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded inline-block">
                    {tx.receiverPhone}
                  </div>
                </td>

                {/* Montant DOP */}
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">
                  {tx.amountDOP.toLocaleString()} DOP
                </td>

                {/* Commission Admin */}
                <td className="py-3.5 px-5 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                  +{(tx.commissionDOP || Math.round(tx.amountDOP * 0.01)).toLocaleString()} DOP
                </td>

                {/* Montant HTG */}
                <td className="py-3.5 px-5 text-right font-mono font-black text-emerald-600">
                  {tx.amountHTG.toLocaleString()} HTG
                </td>

                {/* SLA Badge */}
                <td className="py-3.5 px-5 text-center">
                  {getSlaStatus(tx.createdAt, tx.status)}
                </td>

                {/* Action Reçu PDF */}
                <td className="py-3.5 px-5 text-center">
                  <button
                    onClick={() => setSelectedReceiptTx(tx)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-bold text-xs"
                    title="Générer & Imprimer le Reçu PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reçu</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

