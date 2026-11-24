import React from 'react';
import { useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { TaskDetailSlideover } from './components/TaskDetailSlideover.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { EmailModal } from './components/EmailModal.tsx';
import { ToastContainer } from './components/Toast.tsx';

// Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AllTasksPage } from './pages/AllTasksPage.tsx';
import { MyTasksPage } from './pages/MyTasksPage.tsx';
import { TeamTasksPage } from './pages/TeamTasksPage.tsx';
import { CalendarPage } from './pages/CalendarPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

export const App: React.FC = () => {
  const { activeTab, loading } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'all-tasks':
        return <AllTasksPage />;
      case 'my-tasks':
        return <MyTasksPage />;
      case 'team-tasks':
        return <TeamTasksPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'activity':
        return <ActivityHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Page Layout */}
      <div className="main-wrapper">
        <Header />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <span>Loading workspace action items...</span>
              </div>
            </div>
          ) : (
            renderActivePage()
          )}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <TaskModal />
      <TaskDetailSlideover />
      <DeleteConfirmModal />
      <EmailModal />
      <ToastContainer />
    </div>
  );
};
