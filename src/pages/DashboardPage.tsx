import React from 'react';
import {
  ListTodo,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  ArrowRight,
  Plus,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { CompletionGauge } from '../components/Charts/CompletionGauge.tsx';
import { WorkloadChart } from '../components/Charts/WorkloadChart.tsx';
import { StatusDistributionChart } from '../components/Charts/StatusDistributionChart.tsx';
import { ProductivityChart } from '../components/Charts/ProductivityChart.tsx';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    stats,
    currentUser,
    setCurrentUser,
    teamMembers,
    setActiveTab,
    setFilterOptions,
    openCreateTaskModal,
    openTaskDetail,
    activityLogs,
    showToast
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = tasks.filter(
    t => t.status !== 'Completed' && t.due_date < todayStr
  );

  const dueTodayTasks = tasks.filter(
    t => t.status !== 'Completed' && t.due_date === todayStr
  );

  const otherAdmin = teamMembers.find(m => m.id !== currentUser.id) || teamMembers[0];
  const myAssignedCount = tasks.filter(t => t.assigned_to === currentUser.name || t.assigned_to === 'Both').length;

  const handleFilterClick = (statusFilter?: string, assigneeFilter?: string) => {
    setFilterOptions(prev => ({
      ...prev,
      status: statusFilter || 'All',
      assigned_to: assigneeFilter || 'All'
    }));
    setActiveTab('all-tasks');
  };

  return (
    <div className="page-container">
      {/* Dynamic Admin Perspective Banner */}
      <div className="admin-perspective-banner">
        <div className="admin-banner-left">
          <div className="admin-banner-avatar">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="admin-banner-title">
              <span>{currentUser.name}</span>
              <span className="admin-role-badge">
                {currentUser.id === 'rahkesh' ? 'Principal Architect' : 'Operations Lead'} • Admin Session
              </span>
            </div>
            <div className="admin-banner-sub">
              {currentUser.id === 'rahkesh'
                ? 'Engineering & Architecture Console • Overseeing socket event bus, core API architecture, and database tuning.'
                : 'Operations & Delivery Console • Overseeing milestone execution, Q4 deliverables matrix, and client SLAs.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('my-tasks')}
            title="Focus strictly on tasks assigned to me"
          >
            My Assigned Tasks ({myAssignedCount})
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={openCreateTaskModal}
          >
            <Plus size={15} /> Create Action Item
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setCurrentUser(otherAdmin);
              showToast(`Switched admin perspective to ${otherAdmin.name}`, 'info');
            }}
            title={`Switch session to ${otherAdmin.name}`}
          >
            Switch to {otherAdmin.name.split(' ')[0]} →
          </button>
        </div>
      </div>
      {/* Urgent Warning Banner for Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="urgent-banner">
          <div className="urgent-banner-content">
            <AlertTriangle size={20} />
            <span>
              <strong>{overdueTasks.length} Action Item{overdueTasks.length > 1 ? 's' : ''} Overdue!</strong>{' '}
              Immediate follow-up required by Rahkesh & Fraaz.
            </span>
          </div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)', border: '1px solid var(--priority-critical-border)' }}
            onClick={() => handleFilterClick(undefined, undefined)}
          >
            Review Overdue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 7 Core Dashboard Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Action Items"
          value={stats?.total ?? 0}
          icon={ListTodo}
          iconBg="rgba(79, 70, 229, 0.12)"
          iconColor="#4f46e5"
          subText="Across all workflows"
          onClick={() => handleFilterClick('All')}
        />

        <StatCard
          label="Pending (Not Started)"
          value={stats?.pending ?? 0}
          icon={Clock}
          iconBg="rgba(100, 116, 139, 0.12)"
          iconColor="#64748b"
          subText="Awaiting kickoff"
          onClick={() => handleFilterClick('Not Started')}
        />

        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          icon={PlayCircle}
          iconBg="rgba(2, 132, 199, 0.12)"
          iconColor="#0284c7"
          tagText="Active"
          tagType="info"
          onClick={() => handleFilterClick('In Progress')}
        />

        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={CheckCircle2}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="#10b981"
          tagText={`${stats?.completionPercentage ?? 0}%`}
          tagType="success"
          onClick={() => handleFilterClick('Completed')}
        />

        <StatCard
          label="Overdue Tasks"
          value={stats?.overdue ?? 0}
          icon={AlertTriangle}
          iconBg="rgba(225, 29, 72, 0.12)"
          iconColor="#e11d48"
          tagText="Action Required"
          tagType="danger"
          onClick={() => handleFilterClick('All')}
        />

        <StatCard
          label="Assigned to Rahkesh"
          value={stats?.assignedToRahkesh ?? 0}
          icon={User}
          iconBg="rgba(79, 70, 229, 0.12)"
          iconColor="#4f46e5"
          subText="Rahkesh Kanna H"
          onClick={() => handleFilterClick(undefined, 'Rahkesh Kanna H')}
        />

        <StatCard
          label="Assigned to Fraaz"
          value={stats?.assignedToFraaz ?? 0}
          icon={User}
          iconBg="rgba(5, 150, 105, 0.12)"
          iconColor="#059669"
          subText="Fraaz Ahmed K"
          onClick={() => handleFilterClick(undefined, 'Fraaz Ahmed K')}
        />
      </div>

      {/* 4 Interactive Visual Charts */}
      <div className="charts-grid">
        {/* 1. Task Completion Percentage */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Task Completion Percentage</h3>
              <p className="chart-subtitle">Overall team delivery progress vs backlog</p>
            </div>
          </div>
          <div className="chart-body">
            <CompletionGauge
              percentage={stats?.completionPercentage ?? 0}
              completed={stats?.completed ?? 0}
              total={stats?.total ?? 0}
            />
          </div>
        </div>

        {/* 2. Individual Workload Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Individual Workload Distribution</h3>
              <p className="chart-subtitle">Allocation across Rahkesh, Fraaz, and Shared</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('team-tasks')}
            >
              Member Details
            </button>
          </div>
          <div className="chart-body">
            <WorkloadChart
              rahkeshCount={stats?.workload.rahkeshOnly ?? 0}
              fraazCount={stats?.workload.fraazOnly ?? 0}
              bothCount={stats?.workload.both ?? 0}
              total={stats?.total ?? 0}
            />
          </div>
        </div>

        {/* 3. Task Status Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Task Status Distribution</h3>
              <p className="chart-subtitle">Current health and lifecycle stage of action items</p>
            </div>
          </div>
          <div className="chart-body">
            <StatusDistributionChart
              distribution={stats?.statusDistribution ?? { notStarted: 0, inProgress: 0, onHold: 0, completed: 0 }}
              total={stats?.total ?? 0}
            />
          </div>
        </div>

        {/* 4. Weekly Productivity */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Weekly Productivity Trend</h3>
              <p className="chart-subtitle">Daily throughput: Created vs Completed action items</p>
            </div>
          </div>
          <div className="chart-body">
            <ProductivityChart data={stats?.weeklyProductivity ?? []} />
          </div>
        </div>
      </div>

      {/* Dual Section: Urgent/Upcoming Action Items & Live Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Urgent & Active Tasks Table */}
        <div className="table-wrapper">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Priority Action Items</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items requiring immediate team attention</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('all-tasks')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Action Item</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                        No Action Items Assigned Yet
                      </div>
                      <p style={{ fontSize: '0.85rem', maxWidth: 420, margin: '0 auto 1.25rem', color: 'var(--text-secondary)' }}>
                        Workspace is initialized in Normal Mode with 0 items assigned. Click below to create the first action item for Rahkesh or Fraaz.
                      </p>
                      <button className="btn btn-primary btn-sm" onClick={openCreateTaskModal}>
                        <Plus size={15} /> Create Action Item
                      </button>
                    </td>
                  </tr>
                ) : (
                  tasks.slice(0, 5).map(task => {
                    const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;
                    const isCompleted = task.status === 'Completed';

                    return (
                      <tr
                        key={task.id}
                        className={isOverdue ? 'row-overdue' : isCompleted ? 'row-completed' : ''}
                        onClick={() => openTaskDetail(task)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span className="task-id-badge">{task.id}</span>
                        </td>
                        <td>
                          <div className="task-title-cell">
                            <span className="task-title-text">{task.title}</span>
                            <span className="category-tag">{task.category}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{task.assigned_to}</span>
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
                          <span className={`badge-status ${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Activity</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('activity')}
            >
              Full Log
            </button>
          </div>

          <div className="timeline" style={{ maxHeight: 300, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="timeline-item">
                <div className="timeline-dot" />
                <span className="timeline-title">{log.user_name}</span>
                <span className="timeline-desc">{log.details}</span>
                <span className="timeline-time">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
