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
import { SupervisionAgentsView } from './views/SupervisionAgentsView';
import { WeeklySettlementsView } from './views/WeeklySettlementsView';
import { NotificationsView } from './views/NotificationsView';
import { ReceiptModal } from './components/ReceiptModal';
import { CommandPalette } from './components/CommandPalette';
import { LoginView } from './views/LoginView';
import { BottomNavBar } from './components/BottomNavBar';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isAuthenticated } = useApp();

  const role = currentUser.role;
  const isAdmin = role === 'admin';
  const isAgentRD = role === 'agent_rd';
  const isAgentHaiti = role === 'agent_haiti';
  const isGestionnaire = role === 'gestionnaire';

  // Guarding automatique : redirection si tentative d'accès à un onglet interdit
  React.useEffect(() => {
    if (isAgentRD) {
      // Pour Agent RD : Guichet, Historique, Trésorerie, Mes Transactions, Notifications, Versements & Liquidations, Paramètres
      const allowedForRD: typeof activeTab[] = ['guichet', 'history', 'treasury', 'tasks', 'notifications', 'settlements', 'settings'];
      if (!allowedForRD.includes(activeTab)) {
        setActiveTab('guichet');
      }
    } else if (isAgentHaiti) {
      // Pour Agent Haïti : Flux en Temps Réel, Historique, Notifications, Trésorerie, Paramètres
      const allowedForHaiti: typeof activeTab[] = ['tasks', 'history', 'notifications', 'treasury', 'settings'];
      if (!allowedForHaiti.includes(activeTab)) {
        setActiveTab('tasks');
      }
    } else if (isGestionnaire) {
      // Pour Gestionnaire : Tableau de bord, Tâches numériques, Notifications, Saisie Directe (guichet), Trésorerie, Supervision, Historique, Versements, Paramètres
      const allowedForGestionnaire: typeof activeTab[] = ['overview', 'tasks', 'notifications', 'guichet', 'treasury', 'supervision', 'history', 'settlements', 'settings'];
      if (!allowedForGestionnaire.includes(activeTab)) {
        setActiveTab('overview');
      }
    }
  }, [role, activeTab, setActiveTab, isAgentRD, isAgentHaiti, isGestionnaire]);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview': 
        return isAgentHaiti ? <TaskQueueView /> : isAgentRD ? <OperationsGuichetView /> : <DashboardView />;
      case 'tasks': return <TaskQueueView />;
      case 'notifications': return <NotificationsView />;
      case 'treasury': return <TreasuryView />;
      case 'supervision': 
        return (isAdmin || isGestionnaire) ? <SupervisionAgentsView /> : <DashboardView />;
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
    <div className="flex h-screen bg-white dark:bg-[#070B14] overflow-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-blue-600">
      {/* Sidebar matching D'Alexis Transferencia structure */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-[#FAFAFC] dark:bg-[#070B14] pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Rendered for mobile devices) */}
      <BottomNavBar />


      {/* Printable Receipt Modal */}
      <ReceiptModal />

      {/* Global Command Palette / Search (⌘K / Ctrl+K) */}
      <CommandPalette />
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
