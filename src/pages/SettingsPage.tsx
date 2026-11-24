import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Database,
  RefreshCw,
  Download,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    teamMembers,
    theme,
    toggleTheme,
    handleResetDatabase,
    demoPreset,
    handleSetDemoPreset,
    tasks,
    showToast,
    emailLogs,
    openEmailModal,
    handleCheckOverdueEmails
  } = useApp();

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `action_tracker_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Database backup downloaded', 'success');
  };

  const handleConfirmReset = async () => {
    await handleResetDatabase();
    setResetConfirmOpen(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Team Profiles Section */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Team Member Profiles</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Two-member core team workspace configuration</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {teamMembers.map(member => {
            const isCurrent = currentUser.id === member.id;
            return (
              <div
                key={member.id}
                style={{
                  border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: isCurrent ? 'var(--primary-light)' : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      className="user-avatar"
                      style={{ backgroundColor: member.avatar_color, width: 40, height: 40, fontSize: '0.95rem' }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                      Active
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Role:</strong> {member.role}
                </div>

                {!isCurrent && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setCurrentUser(member);
                      showToast(`Switched active session to ${member.name}`, 'info');
                    }}
                  >
                    Switch to {member.name.split(' ')[0]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appearance & Preferences */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Display & Appearance</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customize interface theme and visual preferences</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Theme Mode</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Currently in <strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong> mode
            </div>
          </div>

          <button className="btn btn-secondary" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
          </button>
        </div>
      </div>

      {/* Automated Email Intimations & Mailer Settings */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Automated Email Intimations</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Automatically intimates the particular assigned team member whenever an action item is pending past its due date
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleCheckOverdueEmails(true)}>
              <RefreshCw size={14} /> Scan Overdue Items Now
            </button>
            <button className="btn btn-primary btn-sm" onClick={openEmailModal}>
              <Mail size={14} /> View Dispatched Emails ({emailLogs.length})
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-muted)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Assigned Member Intimation Rules
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>• <strong>Rahkesh Kanna H</strong> &rarr; <code>rahkesh@team.local</code></div>
              <div>• <strong>Fraaz Ahmed K</strong> &rarr; <code>fraaz@team.local</code></div>
              <div>• <strong>Both (Shared Tasks)</strong> &rarr; Intimates both inboxes</div>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-muted)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Overdue Engine Status
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ color: '#10b981', fontWeight: 600 }}>● Background Engine: Active & Monitoring</div>
              <div style={{ color: 'var(--text-secondary)' }}>• Intimation Frequency: Automatic on due date breach</div>
              <div style={{ color: 'var(--text-secondary)' }}>• Total Logged Dispatches: <strong>{emailLogs.length}</strong> alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management & Backups */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Database & Persistence</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage SQLite local storage, automated backups, and seed data</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Export JSON Backup</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Download all {tasks.length} action items with attachments and metadata
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleDownloadBackup}>
            <Download size={15} /> Download Backup
          </button>
        </div>

        {/* Workspace Mode & Team Cloud Sync Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Workspace Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Normal Production Mode &bull; Real-time cloud sync enabled
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
              ● Normal Mode Active
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.2rem 0 0' }}>
            The tracker is in active production mode. Any action item created by <strong>Rahkesh Kanna H</strong> or <strong>Fraaz Ahmed K</strong> is automatically saved and synchronized across sessions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#ef4444' }}>Clear Workspace (0 Action Items)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Removes all existing action items and resets the workspace to a pristine clean slate
            </div>
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => setResetConfirmOpen(true)}
          >
            <RefreshCw size={15} /> Clear All Tasks
          </button>
        </div>
      </div>

      {/* Confirmation Modal for DB Reset */}
      {resetConfirmOpen && (
        <div className="modal-backdrop" onClick={() => setResetConfirmOpen(false)}>
          <div className="modal-panel" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#ef4444' }}>Clear Workspace to 0 Tasks</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to clear all action items and start fresh with 0 items assigned?</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                This will reset the workspace to a clean slate. You and your colleague can create new action items anytime.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResetConfirmOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmReset}>Confirm & Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
