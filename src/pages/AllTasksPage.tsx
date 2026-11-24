import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Task, TaskStatus } from '../types/index.ts';

export const AllTasksPage: React.FC = () => {
  const {
    tasks,
    filterOptions,
    setFilterOptions,
    resetFilters,
    openCreateTaskModal,
    openEditTaskModal,
    openTaskDetail,
    openDeleteModal,
    handleQuickStatusChange
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering & Searching Logic
  const filteredTasks = tasks.filter(task => {
    // Search
    if (filterOptions.search.trim()) {
      const q = filterOptions.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchId && !matchCat) return false;
    }

    // Assigned To
    if (filterOptions.assigned_to !== 'All') {
      if (task.assigned_to !== filterOptions.assigned_to && task.assigned_to !== 'Both') {
        return false;
      }
    }

    // Priority
    if (filterOptions.priority !== 'All' && task.priority !== filterOptions.priority) {
      return false;
    }

    // Status
    if (filterOptions.status !== 'All' && task.status !== filterOptions.status) {
      return false;
    }

    // Category
    if (filterOptions.category !== 'All' && task.category !== filterOptions.category) {
      return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (filterOptions.sortBy === 'due_date_asc') {
      return a.due_date.localeCompare(b.due_date);
    }
    if (filterOptions.sortBy === 'due_date_desc') {
      return b.due_date.localeCompare(a.due_date);
    }
    if (filterOptions.sortBy === 'priority') {
      const pWeights: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (filterOptions.sortBy === 'id') {
      return b.id.localeCompare(a.id);
    }
    return b.created_at.localeCompare(a.created_at);
  });

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(tasks.map(t => t.category))).filter(Boolean);

  return (
    <div className="page-container">
      {/* Filter and Control Toolbar */}
      <div className="filter-toolbar">
        {/* Search */}
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search action items by ID, title, keyword..."
            value={filterOptions.search}
            onChange={e => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        {/* Filter Controls */}
        <div className="filter-controls-group">
          {/* Member Filter */}
          <select
            className="select-control"
            value={filterOptions.assigned_to}
            onChange={e => setFilterOptions(prev => ({ ...prev, assigned_to: e.target.value }))}
          >
            <option value="All">All Members</option>
            <option value="Rahkesh Kanna H">Rahkesh Kanna H</option>
            <option value="Fraaz Ahmed K">Fraaz Ahmed K</option>
            <option value="Both">Both (Shared)</option>
          </select>

          {/* Priority Filter */}
          <select
            className="select-control"
            value={filterOptions.priority}
            onChange={e => setFilterOptions(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            className="select-control"
            value={filterOptions.status}
            onChange={e => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Sort By */}
          <select
            className="select-control"
            value={filterOptions.sortBy}
            onChange={e => setFilterOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
          >
            <option value="due_date_asc">Sort: Due Date (Earliest)</option>
            <option value="due_date_desc">Sort: Due Date (Latest)</option>
            <option value="priority">Sort: Priority</option>
            <option value="id">Sort: ID</option>
          </select>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Add Action Item CTA */}
          <button className="btn btn-primary btn-sm" onClick={openCreateTaskModal}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Results Header / Active Filter Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Showing <strong>{sortedTasks.length}</strong> of <strong>{tasks.length}</strong> action items
        </span>
        {(filterOptions.search || filterOptions.assigned_to !== 'All' || filterOptions.priority !== 'All' || filterOptions.status !== 'All') && (
          <button
            onClick={resetFilters}
            style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No action items match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map(task => {
                    const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;
                    const isCompleted = task.status === 'Completed';

                    return (
                      <tr
                        key={task.id}
                        className={isOverdue ? 'row-overdue' : isCompleted ? 'row-completed' : ''}
                      >
                        {/* ID Column */}
                        <td>
                          <span
                            className="task-id-badge"
                            onClick={() => openTaskDetail(task)}
                            style={{ cursor: 'pointer' }}
                          >
                            {task.id}
                          </span>
                        </td>

                        {/* Action Item Title + Category */}
                        <td>
                          <div
                            className="task-title-cell"
                            onClick={() => openTaskDetail(task)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="task-title-text">{task.title}</span>
                            <div className="task-meta-sub">
                              <span className="category-tag">{task.category}</span>
                              {task.attachments && task.attachments.length > 0 && (
                                <span>📎 {task.attachments.length}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assigned To */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div
                              className="avatar-chip"
                              style={{
                                backgroundColor: task.assigned_to === 'Rahkesh Kanna H'
                                  ? '#4f46e5'
                                  : task.assigned_to === 'Fraaz Ahmed K'
                                  ? '#059669'
                                  : '#d97706',
                                width: 24,
                                height: 24,
                                fontSize: '0.7rem'
                              }}
                            >
                              {task.assigned_to === 'Rahkesh Kanna H' ? 'RK' : task.assigned_to === 'Fraaz Ahmed K' ? 'FA' : '👥'}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{task.assigned_to}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td>
                          <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </td>

                        {/* Due Date with Overdue Highlight */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {isOverdue && <AlertTriangle size={14} color="var(--overdue-text)" />}
                            <span style={{ fontWeight: 600, color: isOverdue ? 'var(--overdue-text)' : 'inherit' }}>
                              {task.due_date}
                            </span>
                          </div>
                        </td>

                        {/* Status (with quick-switch select) */}
                        <td>
                          <select
                            value={task.status}
                            onChange={e => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                            className={`badge-status ${task.status.toLowerCase().replace(' ', '-')}`}
                            style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        {/* Actions */}
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
                              title="Edit Action Item"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="table-action-btn delete"
                              onClick={() => openDeleteModal(task)}
                              title="Delete Action Item"
                            >
                              <Trash2 size={16} />
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
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          {(['Not Started', 'In Progress', 'On Hold', 'Completed'] as TaskStatus[]).map(columnStatus => {
            const columnTasks = sortedTasks.filter(t => t.status === columnStatus);

            return (
              <div key={columnStatus} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">
                    <span className={`badge-status ${columnStatus.toLowerCase().replace(' ', '-')}`} style={{ padding: '0.15rem 0.4rem' }}>
                      ●
                    </span>
                    {columnStatus}
                  </span>
                  <span className="kanban-count-pill">{columnTasks.length}</span>
                </div>

                <div className="kanban-cards-list">
                  {columnTasks.map(task => {
                    const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;

                    return (
                      <div
                        key={task.id}
                        className={`kanban-card ${isOverdue ? 'overdue' : ''}`}
                        onClick={() => openTaskDetail(task)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="task-id-badge">{task.id}</span>
                          <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="kanban-card-title">{task.title}</div>

                        <div className="kanban-card-footer">
                          <span className="category-tag">{task.category}</span>
                          <span style={{ fontWeight: 600, color: isOverdue ? 'var(--overdue-text)' : 'inherit' }}>
                            {task.due_date} {isOverdue && '⚠️'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
