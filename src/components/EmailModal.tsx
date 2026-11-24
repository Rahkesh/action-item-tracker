import React, { useState } from 'react';
import {
  X,
  Mail,
  RefreshCw,
  Send,
  Calendar,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
  Inbox
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { EmailLog } from '../types/index.ts';

export const EmailModal: React.FC = () => {
  const {
    emailLogs,
    isEmailModalOpen,
    closeEmailModal,
    selectedEmailPreview,
    previewEmail,
    handleCheckOverdueEmails,
    handleSendTaskOverdueEmail,
    openTaskDetail,
    tasks,
    teamMembers
  } = useApp();

  const [filterRecipient, setFilterRecipient] = useState<string>('all');
  const [scanning, setScanning] = useState<boolean>(false);

  if (!isEmailModalOpen) return null;

  const filteredLogs = emailLogs.filter(log => {
    if (filterRecipient === 'all') return true;
    return log.recipient_email.toLowerCase().includes(filterRecipient.toLowerCase());
  });

  const activeEmail = selectedEmailPreview || (filteredLogs.length > 0 ? filteredLogs[0] : null);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      await handleCheckOverdueEmails(true);
    } finally {
      setScanning(false);
    }
  };

  const getRecipientMember = (email: string) => {
    return teamMembers.find(m => m.email.toLowerCase() === email.toLowerCase());
  };

  return (
    <div className="modal-backdrop" onClick={closeEmailModal}>
      <div
        className="modal-panel"
        style={{
          maxWidth: 1040,
          width: '95vw',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>
                  Automated Overdue Email Intimations
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--danger)'
                  }}
                >
                  {emailLogs.length} Dispatched
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Intimates assigned members whenever action items remain pending past their due date
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRunScan}
              disabled={scanning}
              title="Scan all action items and intimate users for any pending overdue items"
            >
              <RefreshCw size={14} className={scanning ? 'spin' : ''} />
              <span>{scanning ? 'Scanning...' : 'Scan Overdue Now'}</span>
            </button>
            <button className="sidebar-collapse-btn" onClick={closeEmailModal} title="Close Modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Content Split: List on Left, Preview on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: Email Dispatches Feed */}
          <div
            style={{
              borderRight: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Filter Bar */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Recipient:</span>
                <select
                  className="select-control"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                  value={filterRecipient}
                  onChange={e => setFilterRecipient(e.target.value)}
                >
                  <option value="all">All Recipients ({emailLogs.length})</option>
                  <option value="rahkesh">Rahkesh (rahkesh@team.local)</option>
                  <option value="fraaz">Fraaz (fraaz@team.local)</option>
                </select>
              </div>
            </div>

            {/* Email Dispatches List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Inbox size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No Email Intimations</div>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    {emailLogs.length === 0
                      ? 'When action items pass their due date, automated notification emails will be recorded here.'
                      : 'No emails match the selected filter.'}
                  </p>
                </div>
              ) : (
                filteredLogs.map(log => {
                  const isSelected = activeEmail?.id === log.id;
                  const member = getRecipientMember(log.recipient_email);
                  const isRahkesh = log.recipient_email.toLowerCase().includes('rahkesh');

                  return (
                    <div
                      key={log.id}
                      onClick={() => previewEmail(log)}
                      style={{
                        padding: '0.85rem',
                        marginBottom: '0.4rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid transparent',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            className="user-avatar"
                            style={{
                              backgroundColor: isRahkesh ? '#4f46e5' : '#059669',
                              width: 24,
                              height: 24,
                              fontSize: '0.65rem'
                            }}
                          >
                            {isRahkesh ? 'RK' : 'FA'}
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {member ? member.name.split(' ')[0] : log.recipient_email}
                          </span>
                        </div>
                        <span className="task-id-badge" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                          {log.task_id}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '0.3rem'
                        }}
                      >
                        {log.subject}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>{new Date(log.sent_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 600 }}>
                          <CheckCircle2 size={12} /> Delivered
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Interactive Email Preview Client */}
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
            {activeEmail ? (
              <>
                {/* Email Viewer Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '0.3rem' }}>
                        {activeEmail.subject}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge-priority critical" style={{ fontSize: '0.7rem' }}>
                          ACTION REQUIRED
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Message ID: <code style={{ fontSize: '0.7rem' }}>MSG-EMAIL-{activeEmail.id}</code>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSendTaskOverdueEmail(activeEmail.task_id)}
                        title="Resend overdue intimation to the assigned member"
                      >
                        <Send size={13} /> Resend Email
                      </button>

                      {tasks.find(t => t.id === activeEmail.task_id) && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const t = tasks.find(item => item.id === activeEmail.task_id);
                            if (t) {
                              closeEmailModal();
                              openTaskDetail(t);
                            }
                          }}
                        >
                          <ExternalLink size={13} /> View Task
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mail Envelope Meta */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>From: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>Action Item Tracker &lt;alerts@tracker.team&gt;</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>To: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{activeEmail.recipient_email}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Delivered: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{new Date(activeEmail.sent_at).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Associated Task: </span>
                      <strong style={{ color: 'var(--primary)' }}>{activeEmail.task_id}</strong>
                    </div>
                  </div>
                </div>

                {/* Rendered HTML Email Content Preview */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f1f5f9' }}>
                  <div
                    style={{
                      maxWidth: 640,
                      margin: '0 auto',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      backgroundColor: '#ffffff'
                    }}
                    dangerouslySetInnerHTML={{ __html: activeEmail.html_content }}
                  />
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.75rem' }}>
                <Mail size={40} style={{ opacity: 0.4 }} />
                <div style={{ fontWeight: 600 }}>Select an email intimation from the left pane to view message details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
