import React from 'react';
import {
  Search,
  Sun,
  Moon,
  Plus,
  Menu,
  ShieldCheck,
  UserCheck,
  Mail
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

const PAGE_TITLES: Record<string, string> = {
  'dashboard': 'Dashboard',
  'all-tasks': 'All Action Items',
  'my-tasks': 'My Action Items',
  'team-tasks': 'Team Member Dashboard',
  'calendar': 'Action Items Calendar',
  'analytics': 'Reports & Analytics',
  'activity': 'Workspace Activity History',
  'settings': 'Settings & Team Config'
};

export const Header: React.FC = () => {
  const {
    activeTab,
    theme,
    toggleTheme,
    currentUser,
    setCurrentUser,
    teamMembers,
    setMobileMenuOpen,
    openCreateTaskModal,
    filterOptions,
    setFilterOptions,
    setActiveTab,
    showToast,
    emailLogs,
    openEmailModal
  } = useApp();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilterOptions(prev => ({ ...prev, search: val }));
    if (activeTab === 'dashboard' && val.trim().length > 0) {
      setActiveTab('all-tasks');
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <h1 className="page-title">{PAGE_TITLES[activeTab] || 'Action Item Tracker'}</h1>
      </div>

      <div className="header-right">
        {/* Global Quick Search */}
        <div className="search-input-wrap" style={{ minWidth: 200, maxWidth: 280, display: 'none' /* visible on >= 768px */ }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search action items..."
            value={filterOptions.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Active Admin Indicator Pill */}
        <div className="admin-header-pill" title={`Active Administrator: ${currentUser.name}`}>
          <div className="admin-live-dot" />
          <span>Admin: {currentUser.name.split(' ')[0]}</span>
          <span style={{ opacity: 0.75, fontWeight: 500, fontSize: '0.72rem' }}>
            ({currentUser.id === 'rahkesh' ? 'Architect' : 'Operations'})
          </span>
        </div>

        {/* User Switcher Toolbar */}
        <div className="user-switcher-wrap" title="Switch Active Administrator Session">
          {teamMembers.map(member => {
            const isActive = currentUser.id === member.id;
            const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2);

            return (
              <button
                key={member.id}
                className={`user-switch-btn ${isActive ? 'active' : ''} user-${member.id}`}
                onClick={() => {
                  setCurrentUser(member);
                  showToast(
                    `Switched Administrator to ${member.name} (${member.id === 'rahkesh' ? 'Principal Architect' : 'Operations Lead'})`,
                    'info'
                  );
                }}
              >
                <div
                  className="user-avatar"
                  style={{ backgroundColor: member.avatar_color }}
                >
                  {initials}
                </div>
                <span className="user-name-full" style={{ display: 'inline' }}>
                  {member.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-Time Team Sync Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.8rem',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}
          title="Team Cloud Sync Active - All changes are saved persistently for Rahkesh & Fraaz"
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span>Team Sync</span>
        </div>

        {/* Overdue Email Intimations Button */}
        <button
          className="theme-toggle-btn"
          onClick={openEmailModal}
          title={`Automated Email Intimations (${emailLogs.length} dispatched)`}
          style={{ position: 'relative' }}
        >
          <Mail size={18} />
          {emailLogs.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 16,
                height: 16,
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 700,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--bg-surface)'
              }}
            >
              {emailLogs.length > 9 ? '9+' : emailLogs.length}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Add Action Item CTA */}
        <button
          className="btn btn-primary"
          onClick={openCreateTaskModal}
        >
          <Plus size={18} />
          <span>New Action Item</span>
        </button>
      </div>
    </header>
  );
};
