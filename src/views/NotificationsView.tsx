import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Filter, 
  CheckCheck,
  Zap,
  ChevronRight,
  UserCheck,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OperatorBadge } from '../components/OperatorBadge';
import { Transaction } from '../types';
import { Pagination } from '../components/Pagination';

export type NotificationFilterType = 'all' | 'transactions' | 'rate' | 'security';

export const NotificationsView: React.FC = () => {
  const { 
    currentUser, 
    transactions, 
    dopToHtgRate, 
    killSwitchList, 
    setSelectedReceiptTx, 
    setActiveTab,
    readNotificationIds,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentLang,
    t
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('all');
  const [page, setPage] = useState<number>(1);
  const NOTIF_PAGE_SIZE = 10;

  React.useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const isAgentRD = currentUser.role === 'agent_rd';
  const isAgentHaiti = currentUser.role === 'agent_haiti';

  const activeKillCount = killSwitchList.filter(k => !k.enabled).length;

  const notifLocale = currentLang === 'ES' ? 'es-DO' : currentLang === 'HT' ? 'fr-HT' : 'fr-FR';

  // Périmètre strict selon le rôle : l'agent RD ne voit que ses propres notifications de transactions
  const roleScopedTxs = transactions.filter((tx) => {
    if (isAgentRD) {
      return (
        tx.createdByName?.toLowerCase() === currentUser.name?.toLowerCase() ||
        tx.senderName?.toLowerCase() === currentUser.name?.toLowerCase() ||
        tx.createdByRole === 'agent_rd'
      );
    }
    if (isAgentHaiti) {
      return tx.operator === 'natcash' || tx.operator === 'natcom' || tx.channel === 'haiti_cash';
    }
    return true; // Admin & Gestionnaire voient tout
  });

  // Construction de la liste complète de notifications
  const allNotifications = React.useMemo(() => {
    const list: Array<{
      id: string;
      category: 'transactions' | 'rate' | 'security';
      title: string;
      message: string;
      time: string;
      icon: any;
      color: string;
      badgeText: string;
      badgeColor: string;
      tx?: Transaction;
    }> = [];

    // 1. Transactions notifications
    roleScopedTxs.forEach((tx) => {
      let icon = Clock;
      let color = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      let badgeText = t('in_progress_count');
      let badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
      let title = `${t('Transfert', 'Transfert')} ${tx.operator.toUpperCase()} ${t('En cours')}`;

      if (tx.status === 'completed') {
        icon = CheckCircle2;
        color = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        badgeText = t('Clôturée / Validée');
        badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
        title = `${t('Transfert', 'Transfert')} ${tx.operator.toUpperCase()} ${t('Validé')}`;
      } else if (tx.status === 'cancelled') {
        icon = ShieldAlert;
        color = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        badgeText = t('Annulé');
        badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
        title = `${t('Transfert', 'Transfert')} ${tx.operator.toUpperCase()} ${t('Annulé')}`;
      }

      const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return t('Récent', 'Récemment');
        return d.toLocaleDateString(notifLocale, {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      list.push({
        id: `notif_tx_${tx.id}`,
        category: 'transactions',
        title,
        message: `${t('beneficiary')} : ${tx.receiverName} (${tx.receiverPhone}) • ${t('amount')} : ${tx.amountHTG.toLocaleString()} HTG (${tx.amountDOP.toLocaleString()} DOP) • Réf : ${tx.referenceNumber}`,
        time: formatTime(tx.createdAt),
        icon,
        color,
        badgeText,
        badgeColor,
        tx
      });
    });

    // 2. Exchange Rate Notification
    list.push({
      id: 'notif_rate_current',
      category: 'rate',
      title: t('Taux de Change Actif', 'Taux de Change Actif'),
      message: `${t('rate_label')} : 100 Pesos (DOP) = ${Math.round(dopToHtgRate * 100)} Gourdes (HTG).`,
      time: t('today', "Aujourd'hui"),
      icon: DollarSign,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badgeText: t('rate_label'),
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
    });

    // 3. Security / Kill Switch Notification
    if (activeKillCount > 0) {
      list.push({
        id: 'notif_ks_alert',
        category: 'security',
        title: t('Alerte Sécurité des Services', 'Alerte Sécurité des Services'),
        message: `${activeKillCount} ${t('service(s) temporairement suspendu(s)', 'service(s) partenaire(s) temporairement suspendu(s) pour maintenance.')}`,
        time: t('En cours'),
        icon: Lock,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        badgeText: t('Critique'),
        badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
      });
    } else {
      list.push({
        id: 'notif_ks_ok',
        category: 'security',
        title: t('Système & Services Opérationnels', 'Système & Services Opérationnels'),
        message: t('Tous les canaux de transfert (MonCash, Natcash, Natcom, Claro, Altice, Zelle) fonctionnent normalement.', 'Tous les canaux de transfert (MonCash, Natcash, Natcom, Claro, Altice, Zelle) fonctionnent normalement.'),
        time: t('Actif'),
        icon: Zap,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        badgeText: t('Optimal'),
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
      });
    }

    return list;
  }, [roleScopedTxs, dopToHtgRate, activeKillCount, notifLocale, t]);

  // Filtering based on tab tab activeFilter : seules les notifications non lues sont conservées (une notification lue est immédiatement effacée)
  const filteredNotifications = allNotifications.filter((n) => {
    if (readNotificationIds.includes(n.id)) return false;
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const notifTotalPages = Math.ceil(filteredNotifications.length / NOTIF_PAGE_SIZE) || 1;
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * NOTIF_PAGE_SIZE,
    page * NOTIF_PAGE_SIZE
  );

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in pb-28">
      
      {/* Top Bar with Back Button & Mark All Read (Sticky Navbar en mode Mobile) */}
      <header className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-2xs">
        <button
          onClick={() => setActiveTab(isAgentRD ? 'guichet' : 'overview')}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-extrabold cursor-pointer transition-colors"
          title={t('back')}
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>{t('back')}</span>
        </button>

        {filteredNotifications.length > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead(filteredNotifications.map(n => n.id))}
            className="px-3 py-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-rose-200/60 dark:border-rose-900/40"
            title={t('Tout effacer', 'Effacer toutes les notifications affichées')}
          >
            <CheckCheck className="w-4 h-4 text-rose-500" />
            <span>{t('Tout effacer', 'Tout effacer')}</span>
          </button>
        )}
      </header>

      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('Centre de Notifications', 'Centre de Notifications')}
              </h2>
              <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">
                {filteredNotifications.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAgentRD ? t('Espace Agent RD — Notifications & suivis personnalisés', 'Espace Agent RD — Notifications & suivis personnalisés') : t('Suivi complet des alertes et des transferts', 'Suivi complet des alertes et des transferts')}
            </p>
          </div>
        </div>

        {/* Shortcut to History page */}
        <button
          onClick={() => setActiveTab('history')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>{t('Consulter l\'Historique', 'Consulter l\'Historique')}</span>
          <ChevronRight className="w-4 h-4 text-orange-500" />
        </button>
      </div>

      {/* 3. Notifications Cards List */}
      <div className="space-y-3">
        {paginatedNotifications.length > 0 ? (
          paginatedNotifications.map((notif) => {
            const IconComp = notif.icon;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.tx) {
                    const freshTx = transactions.find((t) => t.id === notif.tx?.id) || notif.tx;
                    setSelectedReceiptTx(freshTx);
                  }
                }}
                className="p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer space-y-3 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs group"
              >
                {/* Top Row: Icon, Title, Badge, Time */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {notif.title}
                        </h4>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${notif.badgeColor}`}>
                          {notif.badgeText}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        {notif.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notif.tx && (
                      <OperatorBadge operator={notif.tx.operator} size="sm" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Effacer cette notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body Message */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1 sm:pl-13">
                  {notif.message}
                </p>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCheck className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Aucune notification pour le moment
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Toutes vos alertes et activités apparaîtront directement ici en temps réel.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredNotifications.length > NOTIF_PAGE_SIZE && (
          <Pagination
            currentPage={page}
            totalPages={notifTotalPages}
            onPageChange={setPage}
            totalItems={filteredNotifications.length}
            itemsPerPage={NOTIF_PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
};
