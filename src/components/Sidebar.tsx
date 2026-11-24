import React from 'react';
import {
  LayoutDashboard,
  ListTodo,
  UserCheck,
  Users,
  Calendar,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { NavigationPage } from '../types/index.ts';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    tasks,
    currentUser
  } = useApp();

  const totalTasks = tasks.length;
  const myTasksCount = tasks.filter(
    t => t.assigned_to === currentUser.name || t.assigned_to === 'Both'
  ).length;
  const overdueCount = tasks.filter(
    t => t.status !== 'Completed' && t.due_date < new Date().toISOString().split('T')[0]
  ).length;

  const navItems: Array<{
    id: NavigationPage;
    label: string;
    icon: any;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-tasks', label: 'All Action Items', icon: ListTodo, badge: totalTasks },
    { id: 'my-tasks', label: 'My Tasks', icon: UserCheck, badge: myTasksCount },
    { id: 'team-tasks', label: 'Team Tasks', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'activity', label: 'Activity History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: NavigationPage) => {
    setActiveTab(id);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header / Brand */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            {!sidebarCollapsed && <span>ActionTracker</span>}
          </div>

          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(prev => !prev)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {!sidebarCollapsed && <div className="nav-section-title">Navigation</div>}

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={19} className="nav-item-icon" />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Active Admin Session */}
        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <div
              className="sidebar-team-badge"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem'
              }}
            >
              <div
                className="avatar-chip"
                style={{
                  backgroundColor: currentUser.avatar_color,
                  width: 34,
                  height: 34,
                  fontSize: '0.8rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0
                }}
              >
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {currentUser.id === 'rahkesh' ? 'Principal Architect' : 'Operations Lead'}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 35 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
