import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Task } from '../types/index.ts';

export const CalendarPage: React.FC = () => {
  const { tasks, openTaskDetail } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [memberFilter, setMemberFilter] = useState<string>('All');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month and starting weekday
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter tasks by member if selected
  const activeTasks = tasks.filter(t => {
    if (memberFilter === 'All') return true;
    return t.assigned_to === memberFilter || t.assigned_to === 'Both';
  });

  // Build 42 grid cells (6 rows x 7 cols)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, d);
    calendarCells.push({
      dateStr: prevDate.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    calendarCells.push({
      dateStr: curDate.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: true
    });
  }

  // Next month leading days to pad 35 or 42 cells
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    calendarCells.push({
      dateStr: nextDate.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  return (
    <div className="page-container">
      {/* Calendar Controls & Member Filter */}
      <div className="calendar-controls" style={{ backgroundColor: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button className="theme-toggle-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <button className="theme-toggle-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>

          <h2 className="calendar-month-title">{monthName}</h2>

          <button className="btn btn-secondary btn-sm" onClick={handleToday}>
            Today
          </button>
        </div>

        {/* Member filter & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            className="select-control"
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
          >
            <option value="All">All Team Members</option>
            <option value="Rahkesh Kanna H">Rahkesh Kanna H</option>
            <option value="Fraaz Ahmed K">Fraaz Ahmed K</option>
            <option value="Both">Both (Shared)</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} /> Overdue
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Active
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} /> Done
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="calendar-wrapper">
        {/* Weekday headers */}
        <div className="calendar-weekdays-row">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* 42 Date cells */}
        <div className="calendar-grid">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const dueTasks = activeTasks.filter(t => t.due_date === cell.dateStr);
            const startTasks = activeTasks.filter(t => t.start_date === cell.dateStr && t.due_date !== cell.dateStr);

            return (
              <div
                key={idx}
                className={`calendar-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <span className="calendar-day-number">{cell.dayNumber}</span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 85 }}>
                  {/* Tasks Due on this day */}
                  {dueTasks.map(task => {
                    const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;
                    const isCompleted = task.status === 'Completed';

                    let chipClass = 'not-started';
                    if (isCompleted) chipClass = 'completed';
                    else if (isOverdue) chipClass = 'overdue';
                    else if (task.status === 'In Progress') chipClass = 'in-progress';

                    return (
                      <div
                        key={task.id}
                        className={`calendar-task-chip ${chipClass}`}
                        onClick={() => openTaskDetail(task)}
                        title={`[Due] ${task.id}: ${task.title} (${task.assigned_to})`}
                      >
                        <span>{isOverdue ? '⚠️' : isCompleted ? '✓' : '⏱'}</span>
                        <span>{task.title}</span>
                      </div>
                    );
                  })}

                  {/* Tasks Starting on this day */}
                  {startTasks.map(task => (
                    <div
                      key={`start-${task.id}`}
                      className="calendar-task-chip not-started"
                      onClick={() => openTaskDetail(task)}
                      title={`[Kickoff] ${task.id}: ${task.title}`}
                      style={{ opacity: 0.8, borderStyle: 'dashed' }}
                    >
                      <span>🚀</span>
                      <span>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
