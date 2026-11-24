import { db, getAllTasks, getTaskById, logActivity } from './db.js';
import { Task } from './types.js';

export interface EmailLog {
  id: number;
  task_id: string;
  task_title: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  html_content: string;
  sent_at: string;
  status: string;
}

// User email configuration lookup
export const USER_EMAILS: Record<string, { name: string; email: string }> = {
  'Rahkesh Kanna H': { name: 'Rahkesh Kanna H', email: 'rahkesh@team.local' },
  'Fraaz Ahmed K': { name: 'Fraaz Ahmed K', email: 'fraaz@team.local' }
};

// Generate high-converting, professional HTML email template
export function generateOverdueEmailHTML(task: Task, recipientName: string, daysOverdue: number): string {
  const priorityColor =
    task.priority === 'Critical' ? '#be123c' :
    task.priority === 'High' ? '#b45309' :
    task.priority === 'Medium' ? '#0369a1' : '#64748b';

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
    .alert-icon { font-size: 20px; }
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
        <a href="http://localhost:5173" class="cta-btn">Open Action Item in Workspace</a>
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

// Check and dispatch overdue emails
export function checkAndSendOverdueAlerts(force: boolean = false): EmailLog[] {
  const allTasks = getAllTasks();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const overdueTasks = allTasks.filter(
    t => t.status !== 'Completed' && t.due_date < todayStr
  );

  const sentLogs: EmailLog[] = [];

  for (const task of overdueTasks) {
    const dueTime = new Date(task.due_date).getTime();
    const nowTime = new Date(todayStr).getTime();
    const daysOverdue = Math.max(1, Math.round((nowTime - dueTime) / (1000 * 60 * 60 * 24)));

    // Target recipients
    const recipients: Array<{ name: string; email: string }> = [];
    if (task.assigned_to === 'Rahkesh Kanna H' || task.assigned_to === 'Both') {
      recipients.push(USER_EMAILS['Rahkesh Kanna H']);
    }
    if (task.assigned_to === 'Fraaz Ahmed K' || task.assigned_to === 'Both') {
      recipients.push(USER_EMAILS['Fraaz Ahmed K']);
    }

    for (const recipient of recipients) {
      // Check if email was already sent today for this task unless force = true
      if (!force) {
        const recent = db.prepare(`
          SELECT id FROM email_logs 
          WHERE task_id = ? AND recipient_email = ? AND sent_at LIKE ?
        `).get(task.id, recipient.email, `${todayStr}%`);

        if (recent) continue; // Already intimated today
      }

      const subject = `🚨 Overdue Action Item Alert: [${task.id}] ${task.title}`;
      const htmlContent = generateOverdueEmailHTML(task, recipient.name, daysOverdue);
      const nowIso = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO email_logs (
          task_id, task_title, recipient_name, recipient_email, subject, html_content, sent_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const res = stmt.run(
        task.id,
        task.title,
        recipient.name,
        recipient.email,
        subject,
        htmlContent,
        nowIso,
        'DELIVERED'
      );

      const newId = Number(res.lastInsertRowid);

      logActivity({
        task_id: task.id,
        task_title: task.title,
        user_id: 'system',
        user_name: 'Overdue Mail Engine',
        action_type: 'UPDATE',
        details: `Intimated ${recipient.name} via email (${recipient.email}) for overdue task ${task.id}`
      });

      sentLogs.push({
        id: newId,
        task_id: task.id,
        task_title: task.title,
        recipient_name: recipient.name,
        recipient_email: recipient.email,
        subject,
        html_content: htmlContent,
        sent_at: nowIso,
        status: 'DELIVERED'
      });
    }
  }

  return sentLogs;
}

// Manual email trigger for specific task
export function sendTaskOverdueEmail(taskId: string): EmailLog[] {
  const task = getTaskById(taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  const todayStr = new Date().toISOString().split('T')[0];
  const dueTime = new Date(task.due_date).getTime();
  const nowTime = new Date(todayStr).getTime();
  const daysOverdue = Math.max(1, Math.round((nowTime - dueTime) / (1000 * 60 * 60 * 24)));

  const recipients: Array<{ name: string; email: string }> = [];
  if (task.assigned_to === 'Rahkesh Kanna H' || task.assigned_to === 'Both') {
    recipients.push(USER_EMAILS['Rahkesh Kanna H']);
  }
  if (task.assigned_to === 'Fraaz Ahmed K' || task.assigned_to === 'Both') {
    recipients.push(USER_EMAILS['Fraaz Ahmed K']);
  }

  const sentLogs: EmailLog[] = [];

  for (const recipient of recipients) {
    const subject = `🚨 Overdue Action Item Alert: [${task.id}] ${task.title}`;
    const htmlContent = generateOverdueEmailHTML(task, recipient.name, daysOverdue);
    const nowIso = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO email_logs (
        task_id, task_title, recipient_name, recipient_email, subject, html_content, sent_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const res = stmt.run(
      task.id,
      task.title,
      recipient.name,
      recipient.email,
      subject,
      htmlContent,
      nowIso,
      'DELIVERED'
    );

    const newId = Number(res.lastInsertRowid);

    logActivity({
      task_id: task.id,
      task_title: task.title,
      user_id: 'system',
      user_name: 'Overdue Mail Engine',
      action_type: 'UPDATE',
      details: `Intimated ${recipient.name} via email (${recipient.email}) for overdue task ${task.id}`
    });

    sentLogs.push({
      id: newId,
      task_id: task.id,
      task_title: task.title,
      recipient_name: recipient.name,
      recipient_email: recipient.email,
      subject,
      html_content: htmlContent,
      sent_at: nowIso,
      status: 'DELIVERED'
    });
  }

  return sentLogs;
}

// Retrieve email logs
export function getEmailLogs(limit: number = 30): EmailLog[] {
  const rows = db.prepare(`
    SELECT * FROM email_logs 
    ORDER BY sent_at DESC 
    LIMIT ?
  `).all(limit);
  return rows as unknown as EmailLog[];
}

export function getEmailLogsForTask(taskId: string): EmailLog[] {
  const rows = db.prepare(`
    SELECT * FROM email_logs 
    WHERE task_id = ? 
    ORDER BY sent_at DESC
  `).all(taskId);
  return rows as unknown as EmailLog[];
}
