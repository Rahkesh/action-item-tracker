import { Task, TaskStatus, Priority, Comment, ActivityLog, EmailLog, DashboardStats } from '../types/index.ts';

const TASKS_KEY = 'action_tracker_tasks';
const COMMENTS_KEY = 'action_tracker_comments';
const ACTIVITY_KEY = 'action_tracker_activity';
const EMAILS_KEY = 'action_tracker_emails';
const VERSION_KEY = 'action_tracker_version';
const VERSION_VALUE = '2.0-normal';

// Shared Cloud Sync Endpoint for Rahkesh Kanna H & Fraaz Ahmed K
// Ensures that whenever either team member opens the site on any device, they share the exact same action items
const CLOUD_SYNC_ENDPOINT = 'https://kvdb.io/8xV6QJ74UhyV3MhVcx8Uo6/action_tracker_prod_v2';

export const USER_EMAILS: Record<string, { name: string; email: string }> = {
  'Rahkesh Kanna H': { name: 'Rahkesh Kanna H', email: 'rahkesh@team.local' },
  'Fraaz Ahmed K': { name: 'Fraaz Ahmed K', email: 'fraaz@team.local' }
};

export function generateOverdueEmailHTML(task: Task, recipientName: string, daysOverdue: number): string {
  const priorityColor =
    task.priority === 'Critical' ? '#be123c' :
    task.priority === 'High' ? '#b45309' :
    task.priority === 'Medium' ? '#0369a1' : '#64748b';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://action-item-tracker.pages.dev';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; }
    .email-container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #be123c, #9f1239); color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 24px; }
    .greeting { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
    .alert-box { background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
    .alert-text { font-size: 13px; color: #9f1239; font-weight: 600; }
    .task-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
    .task-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .task-meta-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .task-meta-table td { padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
    .meta-label { color: #64748b; font-weight: 500; width: 38%; }
    .meta-value { color: #0f172a; font-weight: 600; }
    .priority-pill { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: ${priorityColor}; background-color: #fff; border: 1px solid ${priorityColor}; }
    .btn-wrap { text-align: center; margin: 24px 0 16px; }
    .cta-btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3); }
    .footer { background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Action Item Overdue Alert</h1>
      <p>Automated SLA Notification for Rahkesh & Fraaz Team</p>
    </div>
    <div class="body">
      <div class="greeting">Hello ${recipientName},</div>
      
      <div class="alert-box">
        <div class="alert-text">
          ⚠️ Action item <strong>${task.id}</strong> has exceeded its deadline by <strong>${daysOverdue} day${daysOverdue > 1 ? 's' : ''}</strong> and remains in <strong>${task.status}</strong> status.
        </div>
      </div>

      <div class="task-card">
        <div class="task-title">${task.title}</div>
        <table class="task-meta-table">
          <tr>
            <td class="meta-label">Action Item ID</td>
            <td class="meta-value">${task.id}</td>
          </tr>
          <tr>
            <td class="meta-label">Priority</td>
            <td class="meta-value"><span class="priority-pill">${task.priority}</span></td>
          </tr>
          <tr>
            <td class="meta-label">Category</td>
            <td class="meta-value">${task.category}</td>
          </tr>
          <tr>
            <td class="meta-label">Assigned By</td>
            <td class="meta-value">${task.assigned_by}</td>
          </tr>
          <tr>
            <td class="meta-label">Original Due Date</td>
            <td class="meta-value" style="color: #be123c;">${task.due_date} (Overdue)</td>
          </tr>
          <tr>
            <td class="meta-label">Current Status</td>
            <td class="meta-value">${task.status}</td>
          </tr>
        </table>

        ${task.description ? `
        <div style="margin-top: 14px; font-size: 13px; color: #475569; background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong>Description:</strong> ${task.description}
        </div>
        ` : ''}
      </div>

      <p style="font-size: 13px; color: #475569;">
        Please review this pending action item and update its progress notes or mark it as completed to keep project delivery on schedule.
      </p>

      <div class="btn-wrap">
        <a href="${origin}" class="cta-btn">Open Action Item in Workspace</a>
      </div>
    </div>
    <div class="footer">
      Action Item Tracker &bull; Automated Intimation Engine for Rahkesh Kanna H & Fraaz Ahmed K
    </div>
  </div>
</body>
</html>
  `.trim();
}

export class ClientStorageService {
  private static getStoredTasks(): Task[] {
    const version = localStorage.getItem(VERSION_KEY);

    // If upgrading from demo mode, clear out demo items and initialize fresh normal mode
    if (version !== VERSION_VALUE) {
      localStorage.setItem(VERSION_KEY, VERSION_VALUE);
      localStorage.setItem(TASKS_KEY, JSON.stringify([]));
      localStorage.setItem(COMMENTS_KEY, JSON.stringify([]));
      localStorage.setItem(EMAILS_KEY, JSON.stringify([]));
      this.initActivityLog();
      this.syncWithCloud();
      return [];
    }

    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_KEY, JSON.stringify([]));
      this.initActivityLog();
      return [];
    }

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static setStoredTasks(tasks: Task[]): void {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    this.pushToCloud(tasks);
  }

  private static initActivityLog(): void {
    if (!localStorage.getItem(ACTIVITY_KEY)) {
      const initialLogs: ActivityLog[] = [
        {
          id: 1,
          task_id: null,
          user_id: 'system',
          user_name: 'System',
          action_type: 'CREATE',
          details: 'Initialized Normal Mode Workspace with 0 items assigned for Rahkesh Kanna H and Fraaz Ahmed K',
          timestamp: new Date().toISOString()
        }
      ];
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(initialLogs));
    }
  }

  // Real-Time Team Cloud Sync
  public static async syncWithCloud(): Promise<Task[]> {
    try {
      const res = await fetch(CLOUD_SYNC_ENDPOINT, { cache: 'no-store' });
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData)) {
          localStorage.setItem(TASKS_KEY, JSON.stringify(cloudData));
          return cloudData;
        }
      }
    } catch {
      // In case network/cloud is unreachable, uses localStorage smoothly
    }
    return this.getStoredTasks();
  }

  public static async pushToCloud(tasks: Task[]): Promise<void> {
    try {
      await fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks)
      });
    } catch {
      // Silently fall back to localStorage
    }
  }

  public static getTasks(): Task[] {
    return this.getStoredTasks();
  }

  public static getTask(id: string): Task | null {
    const tasks = this.getStoredTasks();
    return tasks.find(t => t.id === id) || null;
  }

  public static createTask(taskData: Partial<Task>): Task {
    const tasks = this.getStoredTasks();
    let maxNum = 1000;
    tasks.forEach(t => {
      const match = t.id.match(/ACT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const newId = `ACT-${maxNum + 1}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      id: newId,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      assigned_by: taskData.assigned_by || 'Rahkesh Kanna H',
      assigned_to: taskData.assigned_to || 'Rahkesh Kanna H',
      priority: taskData.priority || 'Medium',
      start_date: taskData.start_date || now.split('T')[0],
      due_date: taskData.due_date || now.split('T')[0],
      status: taskData.status || 'Not Started',
      category: taskData.category || 'Engineering',
      remarks: taskData.remarks || '',
      completion_remarks: taskData.completion_remarks,
      completed_at: taskData.status === 'Completed' ? now : null,
      attachments: taskData.attachments || [],
      created_at: now,
      updated_at: now
    };

    tasks.unshift(newTask);
    this.setStoredTasks(tasks);

    this.logActivity('CREATE', newTask.id, newTask.assigned_by, `Created action item "${newTask.title}"`);
    return newTask;
  }

  public static updateTask(id: string, taskData: Partial<Task>): Task {
    const tasks = this.getStoredTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Task ${id} not found`);

    const existing = tasks[idx];
    const now = new Date().toISOString();

    const isCompleting = taskData.status === 'Completed' && existing.status !== 'Completed';

    const updated: Task = {
      ...existing,
      ...taskData,
      id: existing.id,
      completed_at: isCompleting ? now : (taskData.status === 'Completed' ? existing.completed_at || now : null),
      completion_remarks: taskData.completion_remarks !== undefined ? taskData.completion_remarks : existing.completion_remarks,
      updated_at: now
    };

    tasks[idx] = updated;
    this.setStoredTasks(tasks);

    this.logActivity('UPDATE', id, updated.assigned_by, `Updated task "${updated.title}"`);
    return updated;
  }

  public static deleteTask(id: string): void {
    let tasks = this.getStoredTasks();
    const task = tasks.find(t => t.id === id);
    tasks = tasks.filter(t => t.id !== id);
    this.setStoredTasks(tasks);

    if (task) {
      this.logActivity('DELETE', id, 'Administrator', `Deleted task "${task.title}"`);
    }
  }

  public static updateTaskStatus(id: string, status: TaskStatus, remarks?: string): Task {
    const tasks = this.getStoredTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Task ${id} not found`);

    const task = tasks[idx];
    const now = new Date().toISOString();
    const wasCompleted = task.status === 'Completed';
    const isNowCompleted = status === 'Completed';

    task.status = status;
    task.updated_at = now;

    if (isNowCompleted && !wasCompleted) {
      task.completed_at = now;
      if (remarks) task.completion_remarks = remarks;
    } else if (!isNowCompleted) {
      task.completed_at = null;
    }

    tasks[idx] = task;
    this.setStoredTasks(tasks);

    this.logActivity('STATUS_CHANGE', id, task.assigned_by, `Updated status to "${status}"`);
    return task;
  }

  public static getComments(taskId: string): Comment[] {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const comments: Comment[] = raw ? JSON.parse(raw) : [];
    return comments.filter(c => c.task_id === taskId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public static addComment(taskId: string, authorName: string, content: string): Comment {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const comments: Comment[] = raw ? JSON.parse(raw) : [];

    const newComment: Comment = {
      id: Date.now(),
      task_id: taskId,
      author_id: authorName.toLowerCase().includes('rahkesh') ? 'rahkesh' : 'fraaz',
      author_name: authorName,
      content,
      created_at: new Date().toISOString()
    };

    comments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

    this.logActivity('COMMENT_ADDED', taskId, authorName, `Added comment on task ${taskId}`);
    return newComment;
  }

  public static getActivityLogs(limit: number = 50): ActivityLog[] {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const logs: ActivityLog[] = raw ? JSON.parse(raw) : [];
    return logs.slice(0, limit);
  }

  public static logActivity(action_type: ActivityLog['action_type'], taskId: string | null, userName: string, details: string): void {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const logs: ActivityLog[] = raw ? JSON.parse(raw) : [];

    const newLog: ActivityLog = {
      id: Date.now(),
      action_type,
      task_id: taskId,
      user_id: userName.toLowerCase().includes('rahkesh') ? 'rahkesh' : userName.toLowerCase().includes('fraaz') ? 'fraaz' : 'system',
      user_name: userName,
      details,
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs.slice(0, 100)));
  }

  public static getEmailLogs(limit: number = 30): EmailLog[] {
    const raw = localStorage.getItem(EMAILS_KEY);
    const emails: EmailLog[] = raw ? JSON.parse(raw) : [];
    return emails.slice(0, limit);
  }

  public static checkAndSendOverdueAlerts(force: boolean = false): EmailLog[] {
    const tasks = this.getStoredTasks();
    const rawEmails = localStorage.getItem(EMAILS_KEY);
    const emails: EmailLog[] = rawEmails ? JSON.parse(rawEmails) : [];

    const todayStr = new Date().toISOString().split('T')[0];
    const newDispatches: EmailLog[] = [];

    tasks.forEach(task => {
      const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;
      if (!isOverdue) return;

      const due = new Date(task.due_date);
      const now = new Date(todayStr);
      const diffTime = Math.abs(now.getTime() - due.getTime());
      const daysOverdue = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const recipients: Array<{ name: string; email: string }> = [];
      if (task.assigned_to === 'Both') {
        recipients.push(USER_EMAILS['Rahkesh Kanna H']);
        recipients.push(USER_EMAILS['Fraaz Ahmed K']);
      } else if (USER_EMAILS[task.assigned_to]) {
        recipients.push(USER_EMAILS[task.assigned_to]);
      }

      recipients.forEach(rec => {
        const alreadySentToday = emails.some(
          e => e.task_id === task.id && e.recipient_email === rec.email && e.sent_at.startsWith(todayStr)
        );

        if (!alreadySentToday || force) {
          const subject = `⚠️ Overdue Notice: ${task.id} - ${task.title} (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)`;
          const html = generateOverdueEmailHTML(task, rec.name, daysOverdue);

          const logEntry: EmailLog = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            task_id: task.id,
            task_title: task.title,
            recipient_name: rec.name,
            recipient_email: rec.email,
            subject,
            html_content: html,
            sent_at: new Date().toISOString(),
            status: 'DELIVERED'
          };

          emails.unshift(logEntry);
          newDispatches.push(logEntry);
        }
      });
    });

    if (newDispatches.length > 0) {
      localStorage.setItem(EMAILS_KEY, JSON.stringify(emails.slice(0, 50)));
    }

    return newDispatches;
  }

  public static sendTaskOverdueEmail(taskId: string): EmailLog[] {
    const tasks = this.getStoredTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const rawEmails = localStorage.getItem(EMAILS_KEY);
    const emails: EmailLog[] = rawEmails ? JSON.parse(rawEmails) : [];

    const todayStr = new Date().toISOString().split('T')[0];
    const due = new Date(task.due_date);
    const now = new Date(todayStr);
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const daysOverdue = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const recipients: Array<{ name: string; email: string }> = [];
    if (task.assigned_to === 'Both') {
      recipients.push(USER_EMAILS['Rahkesh Kanna H']);
      recipients.push(USER_EMAILS['Fraaz Ahmed K']);
    } else if (USER_EMAILS[task.assigned_to]) {
      recipients.push(USER_EMAILS[task.assigned_to]);
    } else {
      recipients.push({ name: 'Rahkesh Kanna H', email: 'rahkesh@team.local' });
    }

    const sent: EmailLog[] = [];
    recipients.forEach(rec => {
      const subject = `⚠️ Overdue Notice: ${task.id} - ${task.title} (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)`;
      const html = generateOverdueEmailHTML(task, rec.name, daysOverdue);

      const logEntry: EmailLog = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        task_id: task.id,
        task_title: task.title,
        recipient_name: rec.name,
        recipient_email: rec.email,
        subject,
        html_content: html,
        sent_at: new Date().toISOString(),
        status: 'DELIVERED'
      };

      emails.unshift(logEntry);
      sent.push(logEntry);
    });

    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails.slice(0, 50)));
    this.logActivity('UPDATE', taskId, 'System', `Dispatched overdue intimation to ${recipients.map(r => r.email).join(', ')}`);
    return sent;
  }

  public static resetData(): void {
    localStorage.setItem(VERSION_KEY, VERSION_VALUE);
    localStorage.setItem(TASKS_KEY, JSON.stringify([]));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(EMAILS_KEY, JSON.stringify([]));
    this.pushToCloud([]);
    this.logActivity('DELETE', null, 'Administrator', 'Cleared workspace to clean normal mode with 0 action items');
  }

  public static setDemoPreset(_preset?: string): void {
    this.resetData();
  }

  public static calculateStats(): DashboardStats {
    const tasks = this.getStoredTasks();
    const today = new Date().toISOString().split('T')[0];

    const total = tasks.length;
    let pending = 0;
    let inProgress = 0;
    let onHold = 0;
    let completed = 0;
    let overdue = 0;

    let assignedToRahkesh = 0;
    let assignedToFraaz = 0;

    let rahkeshOnly = 0;
    let fraazOnly = 0;
    let both = 0;

    const priorities = { critical: 0, high: 0, medium: 0, low: 0 };

    let rTotal = 0;
    let rCompleted = 0;
    let rPending = 0;
    let rOverdue = 0;

    let fTotal = 0;
    let fCompleted = 0;
    let fPending = 0;
    let fOverdue = 0;

    tasks.forEach(t => {
      const isOver = t.status !== 'Completed' && t.due_date < today;

      if (t.status === 'Completed') completed++;
      else if (t.status === 'In Progress') inProgress++;
      else if (t.status === 'On Hold') onHold++;
      else pending++;

      if (isOver) overdue++;

      if (t.priority === 'Critical') priorities.critical++;
      else if (t.priority === 'High') priorities.high++;
      else if (t.priority === 'Medium') priorities.medium++;
      else if (t.priority === 'Low') priorities.low++;

      if (t.assigned_to === 'Rahkesh Kanna H') {
        assignedToRahkesh++;
        rahkeshOnly++;
        rTotal++;
        if (t.status === 'Completed') rCompleted++;
        else rPending++;
        if (isOver) rOverdue++;
      } else if (t.assigned_to === 'Fraaz Ahmed K') {
        assignedToFraaz++;
        fraazOnly++;
        fTotal++;
        if (t.status === 'Completed') fCompleted++;
        else fPending++;
        if (isOver) fOverdue++;
      } else if (t.assigned_to === 'Both') {
        assignedToRahkesh++;
        assignedToFraaz++;
        both++;
        rTotal++;
        fTotal++;
        if (t.status === 'Completed') {
          rCompleted++;
          fCompleted++;
        } else {
          rPending++;
          fPending++;
        }
        if (isOver) {
          rOverdue++;
          fOverdue++;
        }
      }
    });

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 7-day productivity
    const weeklyProductivity = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const created = tasks.filter(t => t.created_at.startsWith(dateStr)).length;
      const comp = tasks.filter(t => t.completed_at && t.completed_at.startsWith(dateStr)).length;

      weeklyProductivity.push({
        date: dateStr,
        day: dayName,
        created,
        completed: comp
      });
    }

    return {
      total,
      pending,
      inProgress,
      onHold,
      completed,
      overdue,
      assignedToRahkesh,
      assignedToFraaz,
      completionPercentage,
      workload: {
        rahkeshOnly,
        fraazOnly,
        both
      },
      statusDistribution: {
        notStarted: pending,
        inProgress,
        onHold,
        completed
      },
      priorityDistribution: priorities,
      weeklyProductivity,
      memberStats: {
        rahkesh: {
          total: rTotal,
          completed: rCompleted,
          pending: rPending,
          overdue: rOverdue,
          rate: rTotal > 0 ? Math.round((rCompleted / rTotal) * 100) : 0
        },
        fraaz: {
          total: fTotal,
          completed: fCompleted,
          pending: fPending,
          overdue: fOverdue,
          rate: fTotal > 0 ? Math.round((fCompleted / fTotal) * 100) : 0
        }
      }
    };
  }
}
