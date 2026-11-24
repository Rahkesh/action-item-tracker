import React, { useState } from 'react';
import {
  User,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Eye,
  Edit2,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { TaskStatus } from '../types/index.ts';

export const TeamTasksPage: React.FC = () => {
  const {
    tasks,
    stats,
    teamMembers,
    openTaskDetail,
    openEditTaskModal,
    handleQuickStatusChange
  } = useApp();

  const [selectedMember, setSelectedMember] = useState<'Rahkesh Kanna H' | 'Fraaz Ahmed K' | 'Comparison'>('Rahkesh Kanna H');
  const todayStr = new Date().toISOString().split('T')[0];

  const getMemberTasks = (name: 'Rahkesh Kanna H' | 'Fraaz Ahmed K') => {
    return tasks.filter(t => t.assigned_to === name || t.assigned_to === 'Both');
  };

  const rahkeshTasks = getMemberTasks('Rahkesh Kanna H');
  const fraazTasks = getMemberTasks('Fraaz Ahmed K');

  const currentTasks = selectedMember === 'Rahkesh Kanna H' ? rahkeshTasks : fraazTasks;

  const currentMemberInfo = teamMembers.find(m => m.name === selectedMember);

  const completedCount = currentTasks.filter(t => t.status === 'Completed').length;
  const pendingCount = currentTasks.filter(t => t.status === 'Not Started').length;
  const inProgressCount = currentTasks.filter(t => t.status === 'In Progress').length;
  const overdueCount = currentTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length;

  return (
    <div className="page-container">
      {/* Member Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedMember('Rahkesh Kanna H')}
          className={`btn ${selectedMember === 'Rahkesh Kanna H' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <div className="avatar-chip" style={{ width: 20, height: 20, fontSize: '0.65rem', backgroundColor: '#4f46e5' }}>RK</div>
          Rahkesh Kanna H ({rahkeshTasks.length})
        </button>

        <button
          onClick={() => setSelectedMember('Fraaz Ahmed K')}
          className={`btn ${selectedMember === 'Fraaz Ahmed K' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <div className="avatar-chip" style={{ width: 20, height: 20, fontSize: '0.65rem', backgroundColor: '#059669' }}>FA</div>
          Fraaz Ahmed K ({fraazTasks.length})
        </button>

        <button
          onClick={() => setSelectedMember('Comparison')}
          className={`btn ${selectedMember === 'Comparison' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} /> Side-by-Side Comparison
        </button>
      </div>

      {selectedMember !== 'Comparison' ? (
        <>
          {/* Member Profile Header */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                className="user-avatar"
                style={{ backgroundColor: selectedMember === 'Rahkesh Kanna H' ? '#4f46e5' : '#059669', width: 44, height: 44, fontSize: '1.1rem' }}
              >
                {selectedMember === 'Rahkesh Kanna H' ? 'RK' : 'FA'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedMember}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {currentMemberInfo?.role || 'Co-Lead'} • Action Item Allocation & Delivery
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Completion Rate</span>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                  {currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* 4 Required Metric Cards */}
          <div className="stats-grid">
            <StatCard
              label={`Tasks Assigned to ${selectedMember.split(' ')[0]}`}
              value={currentTasks.length}
              icon={User}
              iconBg={selectedMember === 'Rahkesh Kanna H' ? 'rgba(79, 70, 229, 0.12)' : 'rgba(5, 150, 105, 0.12)'}
              iconColor={selectedMember === 'Rahkesh Kanna H' ? '#4f46e5' : '#059669'}
              subText="Direct & Shared"
            />
            <StatCard
              label={`Tasks Completed by ${selectedMember.split(' ')[0]}`}
              value={completedCount}
              icon={CheckCircle2}
              iconBg="rgba(16, 185, 129, 0.12)"
              iconColor="#10b981"
              tagText={`${currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0}%`}
              tagType="success"
            />
            <StatCard
              label="Pending Tasks"
              value={pendingCount}
              icon={Clock}
              iconBg="rgba(100, 116, 139, 0.12)"
              iconColor="#64748b"
              subText="Awaiting start"
            />
            <StatCard
              label="Overdue Tasks"
              value={overdueCount}
              icon={AlertTriangle}
              iconBg="rgba(225, 29, 72, 0.12)"
              iconColor="#e11d48"
              tagText={overdueCount > 0 ? 'Urgent Attention' : 'All On Track'}
              tagType={overdueCount > 0 ? 'danger' : 'success'}
            />
          </div>

          {/* Member's Task Table */}
          <div className="table-wrapper">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                {selectedMember}'s Action Items ({currentTasks.length})
              </h3>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Action Item</th>
                    <th>Assignment</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.map(task => {
                    const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;
                    const isCompleted = task.status === 'Completed';

                    return (
                      <tr
                        key={task.id}
                        className={isOverdue ? 'row-overdue' : isCompleted ? 'row-completed' : ''}
                      >
                        <td>
                          <span
                            className="task-id-badge"
                            onClick={() => openTaskDetail(task)}
                            style={{ cursor: 'pointer' }}
                          >
                            {task.id}
                          </span>
                        </td>
                        <td>
                          <div
                            className="task-title-cell"
                            onClick={() => openTaskDetail(task)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="task-title-text">{task.title}</span>
                            <span className="category-tag">{task.category}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {task.assigned_to === 'Both' ? '👥 Shared (Both)' : 'Single Assignee'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: isOverdue ? 'var(--overdue-text)' : 'inherit' }}>
                            {task.due_date} {isOverdue && '⚠️'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={task.status}
                            onChange={e => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                            className={`badge-status ${task.status.toLowerCase().replace(' ', '-')}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td>
                          <div className="row-actions-wrap" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="table-action-btn"
                              onClick={() => openTaskDetail(task)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="table-action-btn"
                              onClick={() => openEditTaskModal(task)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Side by Side Comparative Dashboard */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {/* Rahkesh Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', borderTop: '4px solid #4f46e5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="avatar-chip" style={{ backgroundColor: '#4f46e5', width: 34, height: 34 }}>RK</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Rahkesh Kanna H</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Co-Lead & Architect</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Tasks</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{rahkeshTasks.length}</div>
                </div>
                <div style={{ backgroundColor: 'var(--status-completed-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-completed-text)' }}>Completed</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-completed-text)' }}>
                    {rahkeshTasks.filter(t => t.status === 'Completed').length}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--status-in-progress-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-in-progress-text)' }}>In Progress</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-in-progress-text)' }}>
                    {rahkeshTasks.filter(t => t.status === 'In Progress').length}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--overdue-row-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--overdue-text)' }}>Overdue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--overdue-text)' }}>
                    {rahkeshTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Rahkesh's Top Priorities */}
            <div className="table-wrapper">
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem' }}>
                Rahkesh's Active Queue
              </div>
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {rahkeshTasks.slice(0, 5).map(t => (
                  <div
                    key={t.id}
                    onClick={() => openTaskDetail(t)}
                    style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <span className="task-id-badge" style={{ marginRight: '0.4rem' }}>{t.id}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{t.title}</span>
                    </div>
                    <span className={`badge-status ${t.status.toLowerCase().replace(' ', '-')}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fraaz Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', borderTop: '4px solid #059669' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="avatar-chip" style={{ backgroundColor: '#059669', width: 34, height: 34 }}>FA</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Fraaz Ahmed K</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Co-Lead & Operations</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Tasks</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{fraazTasks.length}</div>
                </div>
                <div style={{ backgroundColor: 'var(--status-completed-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-completed-text)' }}>Completed</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-completed-text)' }}>
                    {fraazTasks.filter(t => t.status === 'Completed').length}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--status-in-progress-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-in-progress-text)' }}>In Progress</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-in-progress-text)' }}>
                    {fraazTasks.filter(t => t.status === 'In Progress').length}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--overdue-row-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--overdue-text)' }}>Overdue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--overdue-text)' }}>
                    {fraazTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Fraaz's Top Priorities */}
            <div className="table-wrapper">
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem' }}>
                Fraaz's Active Queue
              </div>
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {fraazTasks.slice(0, 5).map(t => (
                  <div
                    key={t.id}
                    onClick={() => openTaskDetail(t)}
                    style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <span className="task-id-badge" style={{ marginRight: '0.4rem' }}>{t.id}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{t.title}</span>
                    </div>
                    <span className={`badge-status ${t.status.toLowerCase().replace(' ', '-')}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
