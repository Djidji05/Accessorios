import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, FileText, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from './OperatorBadge';
import { DateRange } from './DateRangePicker';
import { Pagination } from './Pagination';

interface TransactionsTableProps {
  dateRange?: DateRange;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ dateRange }) => {
  const { setSelectedReceiptTx, transactions, serviceCommissionRates, adminCommissionRate, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, dateRange]);

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

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  const paginatedTransactions = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getSlaStatus = (createdAtIso: string, status: string) => {
    if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>{t('cancelled', 'Annulé')}</span>
        </span>
      );
    }

    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{t('completed', 'Traité / Validé')}</span>
        </span>
      );
    }

    const minutes = Math.floor((Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60));
    if (minutes >= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>SLA ({minutes}m)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-900 border border-orange-300">
        <Clock className="w-3 h-3 text-orange-600 animate-pulse" />
        <span>{t('in_progress', 'En cours')} ({15 - minutes}m)</span>
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
              {t('network_activity', 'Surveillance des Flux en Direct')} ({filteredTransactions.length})
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">{t('operational_portal', 'Contrôle en temps réel des transactions du réseau')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="all">{t('all', 'Tous les Statuts')}</option>
            <option value="in_progress">🟠 {t('in_progress', 'En Cours / En Attente')}</option>
            <option value="completed">🟢 {t('completed', 'Clôturés / Certifiés')}</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'Rechercher #TX, nom, tél...')}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-900 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-slate-400 w-48"
            />
          </div>
        </div>
      </div>

      {/* 1. DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3.5 px-5">{t('reference', 'Réf Transaction')}</th>
              <th className="py-3.5 px-5">{t('operator', 'Opérateur')}</th>
              <th className="py-3.5 px-5 text-center text-emerald-700">{t('admin_comm', 'Commission Opérateur')}</th>
              <th className="py-3.5 px-5">{t('beneficiary', 'Bénéficiaire (Haïti)')}</th>
              <th className="py-3.5 px-5 text-right">{t('amount_dop', 'Montant Pesos')}</th>
              <th className="py-3.5 px-5 text-right text-blue-600">{t('admin_comm', 'Commission Admin')}</th>
              <th className="py-3.5 px-5 text-right">{t('received_htg', 'Montant HTG')}</th>
              <th className="py-3.5 px-5 text-center">{t('status', 'Suivi SLA & Statut')}</th>
              <th className="py-3.5 px-5 text-center">{t('actions', 'Action Reçu')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {paginatedTransactions.map((tx) => {
              const commRate = serviceCommissionRates[tx.operator] ?? adminCommissionRate ?? 1.0;
              const opCommDOP = tx.commissionDOP || Math.round(tx.amountDOP * (commRate / 100));

              return (
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

                  {/* Commission Opérateur */}
                  <td className="py-3.5 px-5 text-center">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                      +{opCommDOP.toLocaleString()} DOP
                    </span>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Taux: {commRate}%</div>
                  </td>

                  {/* Bénéficiaire */}
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900">{tx.receiverName}</div>
                    <div className="text-[10px] text-slate-600 font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded inline-block">
                      {tx.receiverPhone}
                    </div>
                  </td>

                  {/* Montant DOP */}
                  <td className="py-3.5 px-5 text-right font-bold text-slate-900">
                    {tx.amountDOP.toLocaleString()} DOP
                  </td>

                  {/* Commission Admin */}
                  <td className="py-3.5 px-5 text-right font-black text-blue-600">
                    +{(tx.commissionDOP || Math.round(tx.amountDOP * 0.01)).toLocaleString()} DOP
                  </td>

                  {/* Montant HTG */}
                  <td className="py-3.5 px-5 text-right font-black text-emerald-600">
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
                      title="Télécharger ou partager le Reçu PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reçu PDF</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE CARD VIEW (md:hidden) */}
      <div className="md:hidden divide-y divide-slate-100">
        {paginatedTransactions.map((tx) => {
          const commRate = serviceCommissionRates[tx.operator] ?? adminCommissionRate ?? 1.0;
          const opCommDOP = tx.commissionDOP || Math.round(tx.amountDOP * (commRate / 100));

          return (
            <div
              key={tx.id}
              onClick={() => setSelectedReceiptTx(tx)}
              className="p-3.5 space-y-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {/* Top: Reference + Operator + SLA status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {tx.referenceNumber}
                  </span>
                  <OperatorBadge operator={tx.operator} size="sm" />
                </div>
                {getSlaStatus(tx.createdAt, tx.status)}
              </div>

              {/* Receiver Info */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 text-xs block">{tx.receiverName}</span>
                  <span className="text-[11px] text-slate-500 font-mono font-semibold">{tx.receiverPhone}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-emerald-600 text-sm block leading-tight">
                    {tx.amountHTG.toLocaleString()} HTG
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ({tx.amountDOP.toLocaleString()} DOP)
                  </span>
                </div>
              </div>

              {/* Commission & Action */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  Com. : <strong className="text-emerald-700">+{opCommDOP.toLocaleString()} DOP</strong> ({commRate}%)
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReceiptTx(tx);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-bold text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reçu PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > PAGE_SIZE && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredTransactions.length}
            itemsPerPage={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
};
