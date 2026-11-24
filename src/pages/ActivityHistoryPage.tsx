import React, { useState } from 'react';
import {
  History,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  Trash2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ActivityLog } from '../types/index.ts';

export const ActivityHistoryPage: React.FC = () => {
  const { activityLogs, refreshData } = useApp();

  const [memberFilter, setMemberFilter] = useState<string>('All');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filteredLogs = activityLogs.filter(log => {
    if (memberFilter !== 'All' && !log.user_name.includes(memberFilter)) return false;
    if (actionFilter !== 'All' && log.action_type !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchTask = log.task_title ? log.task_title.toLowerCase().includes(q) : false;
      const matchId = log.task_id ? log.task_id.toLowerCase().includes(q) : false;
      if (!matchDetails && !matchTask && !matchId) return false;
    }
    return true;
  });

  const getActionBadge = (type: ActivityLog['action_type']) => {
    switch (type) {
      case 'COMPLETED':
        return { label: 'Completed', bg: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' };
      case 'CREATE':
        return { label: 'Created', bg: 'var(--primary-light)', color: 'var(--primary)' };
      case 'STATUS_CHANGE':
        return { label: 'Status Update', bg: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' };
      case 'COMMENT_ADDED':
        return { label: 'Comment', bg: 'var(--bg-muted)', color: 'var(--text-secondary)' };
      case 'DELETE':
        return { label: 'Deleted', bg: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)' };
      default:
        return { label: 'Modified', bg: 'var(--bg-muted)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="page-container">
      {/* Filter Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search audit trail by task or event..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls-group">
          <select
            className="select-control"
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
          >
            <option value="All">All Team Members</option>
            <option value="Rahkesh">Rahkesh Kanna H</option>
            <option value="Fraaz">Fraaz Ahmed K</option>
          </select>

          <select
            className="select-control"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="All">All Action Types</option>
            <option value="CREATE">Created</option>
            <option value="STATUS_CHANGE">Status Changes</option>
            <option value="COMPLETED">Completed</option>
            <option value="COMMENT_ADDED">Comments</option>
            <option value="DELETE">Deletions</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={refreshData} title="Refresh Live Audit Trail">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Activity Timeline Table */}
      <div className="table-wrapper">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Workspace Audit Log</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Granular timeline of all actions and collaboration</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filteredLogs.length} Events Logged
          </span>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Team Member</th>
                <th>Action Type</th>
                <th>Action Item</th>
                <th>Activity Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No audit records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badge = getActionBadge(log.action_type);
                  return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div
                            className="avatar-chip"
                            style={{
                              backgroundColor: log.user_name.includes('Rahkesh') ? '#4f46e5' : '#059669',
                              width: 24,
                              height: 24,
                              fontSize: '0.65rem'
                            }}
                          >
                            {log.user_name.includes('Rahkesh') ? 'RK' : 'FA'}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{log.user_name}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: badge.bg,
                            color: badge.color
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        {log.task_id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span className="task-id-badge">{log.task_id}</span>
                            {log.task_title && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {log.task_title}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Workspace</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
