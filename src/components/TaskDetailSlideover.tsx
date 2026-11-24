import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  History,
  FileText,
  Edit2,
  Trash2,
  Send,
  Check,
  Mail
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { TaskStatus, Priority, Comment } from '../types/index.ts';
import { ClientStorageService } from '../services/clientStorage.ts';

export const TaskDetailSlideover: React.FC = () => {
  const {
    selectedTaskDetail,
    closeTaskDetail,
    openEditTaskModal,
    openDeleteModal,
    handleQuickStatusChange,
    handleAddComment,
    currentUser,
    handleSendTaskOverdueEmail,
    openEmailModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const task = selectedTaskDetail;

  useEffect(() => {
    if (!task) return;
    setLoadingComments(true);
    fetch(`/api/tasks/${task.id}/comments`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setComments(data))
      .catch(() => {
        setComments(ClientStorageService.getComments(task.id));
      })
      .finally(() => setLoadingComments(false));
  }, [task]);

  if (!task) return null;

  const isOverdue = task.status !== 'Completed' && task.due_date < new Date().toISOString().split('T')[0];

  const handleStatusClick = (newStatus: TaskStatus) => {
    if (newStatus === 'Completed' && task.status !== 'Completed') {
      setShowCompletionPrompt(true);
    } else {
      handleQuickStatusChange(task.id, newStatus);
    }
  };

  const handleConfirmCompletion = () => {
    handleQuickStatusChange(task.id, 'Completed', completionRemarks);
    setShowCompletionPrompt(false);
    setCompletionRemarks('');
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await handleAddComment(task.id, commentText.trim());
    setCommentText('');

    // Reload comments
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`);
      if (res.ok) {
        setComments(await res.json());
        return;
      }
    } catch {}
    setComments(ClientStorageService.getComments(task.id));
  };

  return (
    <div className="modal-backdrop" onClick={closeTaskDetail}>
      <div className="slideover-panel" onClick={e => e.stopPropagation()}>
        {/* Slideover Header */}
        <div className="slideover-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="task-id-badge">{task.id}</span>
            <span className={`badge-status ${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </span>
            {isOverdue && (
              <span className="badge-priority critical" style={{ fontSize: '0.7rem' }}>
                OVERDUE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="table-action-btn"
              onClick={() => {
                closeTaskDetail();
                openEditTaskModal(task);
              }}
              title="Edit Task"
            >
              <Edit2 size={16} />
            </button>
            <button
              className="table-action-btn delete"
              onClick={() => {
                openDeleteModal(task);
              }}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
            <button className="sidebar-collapse-btn" onClick={closeTaskDetail}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 1.5rem', backgroundColor: 'var(--bg-muted)' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: activeTab === 'details' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'details' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Comments ({comments.length})
          </button>
        </div>

        {/* Slideover Content */}
        <div className="slideover-body">
          {activeTab === 'details' && (
            <>
              {/* Task Title */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  {task.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <span className="category-tag">{task.category}</span>
                  <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>

              {/* Overdue Email Intimation Banner */}
              {isOverdue && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Mail size={16} />
                      <span>Overdue Email Intimation Active</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSendTaskOverdueEmail(task.id)}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                        title="Dispatch email notification to assigned member immediately"
                      >
                        <Send size={12} /> Resend Mail
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={openEmailModal}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                        title="View dispatched emails log"
                      >
                        View Inbox
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    This action item is pending past its due date ({task.due_date}). Automated notification email has been intimated to{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {task.assigned_to === 'Both'
                        ? 'Rahkesh (rahkesh@team.local) & Fraaz (fraaz@team.local)'
                        : task.assigned_to === 'Rahkesh Kanna H'
                        ? 'rahkesh@team.local'
                        : 'fraaz@team.local'}
                    </strong>.
                  </div>
                </div>
              )}

              {/* Status Stepper Buttons */}
              <div style={{ backgroundColor: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Update Workflow Status
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {(['Not Started', 'In Progress', 'On Hold', 'Completed'] as TaskStatus[]).map(st => {
                    const isCurrent = task.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusClick(st)}
                        style={{
                          padding: '0.4rem 0.2rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          backgroundColor: isCurrent ? 'var(--primary)' : 'var(--bg-surface)',
                          color: isCurrent ? '#ffffff' : 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Completion prompt */}
              {showCompletionPrompt && (
                <div style={{ backgroundColor: 'var(--completed-row-bg)', border: '1px solid var(--completed-border)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--completed-text)', fontSize: '0.9rem' }}>
                    Mark Action Item as Completed
                  </div>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter completion remarks, outcomes, or verification metrics (optional)..."
                    value={completionRemarks}
                    onChange={e => setCompletionRemarks(e.target.value)}
                    rows={2}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowCompletionPrompt(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleConfirmCompletion} style={{ backgroundColor: '#10b981' }}>
                      <Check size={14} /> Confirm Completion
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Description
                </h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {task.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Key Metadata Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned To</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {task.assigned_to}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned By</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {task.assigned_by}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start Date</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {task.start_date || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date</span>
                  <div style={{ fontWeight: 600, color: isOverdue ? 'var(--overdue-text)' : 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {task.due_date} {isOverdue && '(Overdue)'}
                  </div>
                </div>

                {task.completed_at && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed At</span>
                    <div style={{ fontWeight: 600, color: '#10b981', marginTop: '0.2rem' }}>
                      {new Date(task.completed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Remarks */}
              {task.remarks && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Additional Remarks
                  </h4>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    {task.remarks}
                  </div>
                </div>
              )}

              {/* Completion Remarks */}
              {task.completion_remarks && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', marginBottom: '0.4rem' }}>
                    Completion Remarks
                  </h4>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--completed-row-bg)', border: '1px solid var(--completed-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--completed-text)' }}>
                    {task.completion_remarks}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Attachments ({task.attachments.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {task.attachments.map(att => (
                      <div
                        key={att.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'var(--bg-muted)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <FileText size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 600 }}>{att.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          ({(att.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                <span>Last Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
              </div>
            </>
          )}

          {activeTab === 'comments' && (
            <div className="comments-section">
              {/* Comment form */}
              <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea
                  className="form-textarea"
                  placeholder={`Comment as ${currentUser.name}...`}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={2}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} /> Post Comment
                  </button>
                </div>
              </form>

              {/* Comment list */}
              <div className="comment-list">
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="comment-item">
                      <div
                        className="user-avatar"
                        style={{
                          backgroundColor: c.author_name.includes('Rahkesh') ? '#4f46e5' : '#059669',
                          width: 30,
                          height: 30,
                          fontSize: '0.75rem'
                        }}
                      >
                        {c.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="comment-bubble">
                        <div className="comment-header">
                          <span className="comment-author-name">{c.author_name}</span>
                          <span className="comment-time">{new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <div className="comment-content">{c.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
