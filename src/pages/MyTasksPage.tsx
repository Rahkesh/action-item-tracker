import React, { useState } from 'react';
import {
  UserCheck,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Clock,
  Eye,
  Edit2
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { TaskStatus } from '../types/index.ts';

export const MyTasksPage: React.FC = () => {
  const {
    tasks,
    currentUser,
    openCreateTaskModal,
    openTaskDetail,
    openEditTaskModal,
    handleQuickStatusChange
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'pending' | 'completed' | 'overdue'>('all');
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter tasks where active user is assigned or it's both
  const myTasks = tasks.filter(
    t => t.assigned_to === currentUser.name || t.assigned_to === 'Both'
  );

  const completedCount = myTasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = myTasks.filter(t => t.status === 'In Progress').length;
  const pendingCount = myTasks.filter(t => t.status === 'Not Started').length;
  const overdueCount = myTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length;

  const displayedTasks = myTasks.filter(task => {
    if (activeFilter === 'completed') return task.status === 'Completed';
    if (activeFilter === 'in_progress') return task.status === 'In Progress';
    if (activeFilter === 'pending') return task.status === 'Not Started';
    if (activeFilter === 'overdue') return task.status !== 'Completed' && task.due_date < todayStr;
    return true;
  });

  return (
    <div className="page-container">
      {/* Banner with Active Member Context */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            className="user-avatar"
            style={{ backgroundColor: currentUser.avatar_color, width: 48, height: 48, fontSize: '1.2rem' }}
          >
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentUser.name}'s Workspace</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{currentUser.role} • {myTasks.length} Assigned Action Items</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={openCreateTaskModal}>
          <Plus size={16} /> New Action Item
        </button>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="My Total Tasks"
          value={myTasks.length}
          icon={UserCheck}
          iconBg="rgba(79, 70, 229, 0.12)"
          iconColor="#4f46e5"
          onClick={() => setActiveFilter('all')}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={PlayCircle}
          iconBg="rgba(2, 132, 199, 0.12)"
          iconColor="#0284c7"
          tagText="Active"
          tagType="info"
          onClick={() => setActiveFilter('in_progress')}
        />
        <StatCard
          label="Pending / Kickoff"
          value={pendingCount}
          icon={Clock}
          iconBg="rgba(100, 116, 139, 0.12)"
          iconColor="#64748b"
          onClick={() => setActiveFilter('pending')}
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="#10b981"
          tagText="Done"
          tagType="success"
          onClick={() => setActiveFilter('completed')}
        />
        <StatCard
          label="Overdue Items"
          value={overdueCount}
          icon={AlertTriangle}
          iconBg="rgba(225, 29, 72, 0.12)"
          iconColor="#e11d48"
          tagText={overdueCount > 0 ? 'Urgent' : 'Clear'}
          tagType={overdueCount > 0 ? 'danger' : 'success'}
          onClick={() => setActiveFilter('overdue')}
        />
      </div>

      {/* Task List */}
      <div className="table-wrapper">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'in_progress', 'pending', 'completed', 'overdue'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: activeFilter === tab ? 'var(--primary)' : 'var(--bg-muted)',
                  color: activeFilter === tab ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {displayedTasks.length} tasks
          </span>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action Item</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No tasks found under the "{activeFilter.replace('_', ' ')}" view.
                  </td>
                </tr>
              ) : (
                displayedTasks.map(task => {
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
