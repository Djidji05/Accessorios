import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { OperationsGuichetView } from './views/OperationsGuichetView';
import { TaskQueueView } from './views/TaskQueueView';
import { TreasuryView } from './views/TreasuryView';
import { UserManagementView } from './views/UserManagementView';
import { KillSwitchView } from './views/KillSwitchView';
import { AuditLogsView } from './views/AuditLogsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { WeeklySettlementsView } from './views/WeeklySettlementsView';
import { NotificationsView } from './views/NotificationsView';
import { ReceiptModal } from './components/ReceiptModal';
import { CommandPalette } from './components/CommandPalette';
import { LoginView } from './views/LoginView';
import { BottomNavBar } from './components/BottomNavBar';
import { GlobalToast } from './components/GlobalToast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isAuthenticated } = useApp();

  const role = currentUser.role;
  const isAdmin = role === 'admin';
  const isAgentRD = role === 'agent_rd';
  const isAgentHaiti = role === 'agent_haiti';
  const isGestionnaire = role === 'gestionnaire';

  // Résolution synchrone immédiate de l'onglet effectif
  // Évite tout clignotement ou rendu temporaire de la vue Dashboard PC sur mobile lors du login
  const effectiveTab: typeof activeTab = React.useMemo(() => {
    if (isAgentRD) {
      const allowedForRD: typeof activeTab[] = ['guichet', 'history', 'treasury', 'tasks', 'notifications', 'settlements', 'settings'];
      return allowedForRD.includes(activeTab) ? activeTab : 'guichet';
    }
    if (isAgentHaiti) {
      const allowedForHaiti: typeof activeTab[] = ['tasks', 'history', 'notifications', 'treasury', 'settings'];
      return allowedForHaiti.includes(activeTab) ? activeTab : 'tasks';
    }
    if (isGestionnaire) {
      const allowedForGestionnaire: typeof activeTab[] = ['overview', 'tasks', 'notifications', 'guichet', 'treasury', 'history', 'settlements', 'settings'];
      return allowedForGestionnaire.includes(activeTab) ? activeTab : 'overview';
    }
    return activeTab;
  }, [isAgentRD, isAgentHaiti, isGestionnaire, activeTab]);

  // Synchronisation d'état automatique en tâche de fond
  React.useEffect(() => {
    if (activeTab !== effectiveTab) {
      setActiveTab(effectiveTab);
    }
  }, [activeTab, effectiveTab, setActiveTab]);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (effectiveTab) {
      case 'overview': 
        return isAgentHaiti ? <TaskQueueView /> : isAgentRD ? <OperationsGuichetView /> : <DashboardView />;
      case 'tasks': return <TaskQueueView />;
      case 'notifications': return <NotificationsView />;
      case 'treasury': return <TreasuryView />;
      case 'history': return <HistoryView />;
      case 'guichet': 
        return (isAdmin || isAgentRD || isGestionnaire) ? <OperationsGuichetView /> : <TaskQueueView />;
      case 'settlements': return <WeeklySettlementsView />;
      case 'users':
      case 'user_list':
      case 'create_user':
      case 'permissions_matrix': 
        return isAdmin ? <UserManagementView /> : isAgentHaiti ? <TaskQueueView /> : <DashboardView />;
      case 'kill_switch': 
        return isAdmin ? <KillSwitchView /> : isAgentHaiti ? <TaskQueueView /> : <DashboardView />;
      case 'audit_logs': 
        return isAdmin ? <AuditLogsView /> : isAgentHaiti ? <TaskQueueView /> : <DashboardView />;
      case 'settings': return <SettingsView />;
      default: return isAgentHaiti ? <TaskQueueView /> : isAgentRD ? <OperationsGuichetView /> : <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-blue-600">
      {/* Sidebar matching D'Alexis Transferencia structure */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Rendered for mobile devices) */}
      <BottomNavBar />


      {/* Printable Receipt Modal */}
      <ReceiptModal />

      {/* Global Command Palette / Search (⌘K / Ctrl+K) */}
      <CommandPalette />

      {/* Global Confirmation Toast Notification System */}
      <GlobalToast />

      {/* PWA Install Banner */}
      <PWAInstallPrompt />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
