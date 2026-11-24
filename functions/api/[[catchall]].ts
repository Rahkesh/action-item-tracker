interface Env {
  ACTION_TRACKER_KV?: any;
}

// In-memory fallback if KV binding is not provisioned
let memoryTasks: any[] = [];
let memoryComments: any[] = [];
let memoryActivity: any[] = [
  {
    id: 1,
    task_id: null,
    user_id: 'system',
    user_name: 'System',
    action_type: 'CREATE',
    details: 'Workspace initialized in Normal Mode with 0 items assigned for Rahkesh Kanna H and Fraaz Ahmed K',
    timestamp: new Date().toISOString()
  }
];
let memoryEmails: any[] = [];

const USER_EMAILS: Record<string, { name: string; email: string }> = {
  'Rahkesh Kanna H': { name: 'Rahkesh Kanna H', email: 'rahkesh@team.local' },
  'Fraaz Ahmed K': { name: 'Fraaz Ahmed K', email: 'fraaz@team.local' }
};

function generateOverdueEmailHTML(task: any, recipientName: string, daysOverdue: number): string {
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
    .alert-box { background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
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
          <tr><td class="meta-label">Action Item ID</td><td class="meta-value">${task.id}</td></tr>
          <tr><td class="meta-label">Priority</td><td class="meta-value"><span class="priority-pill">${task.priority}</span></td></tr>
          <tr><td class="meta-label">Category</td><td class="meta-value">${task.category}</td></tr>
          <tr><td class="meta-label">Assigned By</td><td class="meta-value">${task.assigned_by}</td></tr>
          <tr><td class="meta-label">Due Date</td><td class="meta-value" style="color: #be123c;">${task.due_date} (Overdue)</td></tr>
          <tr><td class="meta-label">Status</td><td class="meta-value">${task.status}</td></tr>
        </table>
        ${task.description ? `<div style="margin-top: 12px; font-size: 13px; color: #475569;"><strong>Description:</strong> ${task.description}</div>` : ''}
      </div>
      <div class="btn-wrap">
        <a href="https://action-item-tracker.pages.dev" class="cta-btn">Open Action Item in Workspace</a>
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

async function getStoredData(kv: any, key: string, fallback: any): Promise<any> {
  if (kv) {
    try {
      const data = await kv.get(key, 'json');
      if (data !== null && data !== undefined) return data;
    } catch {
      // Fall back to memory
    }
  }
  if (key === 'tasks') return memoryTasks;
  if (key === 'comments') return memoryComments;
  if (key === 'activity') return memoryActivity;
  if (key === 'emails') return memoryEmails;
  return fallback;
}

async function setStoredData(kv: any, key: string, value: any): Promise<void> {
  if (kv) {
    try {
      await kv.put(key, JSON.stringify(value));
    } catch {
      // Memory fallback
    }
  }
  if (key === 'tasks') memoryTasks = value;
  if (key === 'comments') memoryComments = value;
  if (key === 'activity') memoryActivity = value;
  if (key === 'emails') memoryEmails = value;
}

function computeStats(tasks: any[]): any {
  const today = new Date().toISOString().split('T')[0];
  const total = tasks.length;
  let pending = 0, inProgress = 0, onHold = 0, completed = 0, overdue = 0;
  let assignedToRahkesh = 0, assignedToFraaz = 0;
  let rahkeshOnly = 0, fraazOnly = 0, both = 0;
  const priorities = { critical: 0, high: 0, medium: 0, low: 0 };
  let rTotal = 0, rCompleted = 0, rPending = 0, rOverdue = 0;
  let fTotal = 0, fCompleted = 0, fPending = 0, fOverdue = 0;

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

  const weeklyProductivity = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    const created = tasks.filter(t => t.created_at && t.created_at.startsWith(dateStr)).length;
    const comp = tasks.filter(t => t.completed_at && t.completed_at.startsWith(dateStr)).length;
    weeklyProductivity.push({ date: dateStr, day: dayName, created, completed: comp });
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
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    workload: { rahkeshOnly, fraazOnly, both },
    statusDistribution: { notStarted: pending, inProgress, onHold, completed },
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

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const kv = env.ACTION_TRACKER_KV;

  try {
    // 1. GET /api/health
    if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), { headers: corsHeaders });
    }

    // 2. GET /api/tasks/next-id
    if (request.method === 'GET' && path === '/api/tasks/next-id') {
      const tasks = await getStoredData(kv, 'tasks', []);
      let maxNum = 1000;
      tasks.forEach((t: any) => {
        const m = t.id?.match(/ACT-(\d+)/);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      return new Response(JSON.stringify({ nextId: `ACT-${maxNum + 1}` }), { headers: corsHeaders });
    }

    // 3. GET /api/tasks/:id/comments
    if (request.method === 'GET' && path.match(/^\/api\/tasks\/([^/]+)\/comments$/)) {
      const match = path.match(/^\/api\/tasks\/([^/]+)\/comments$/);
      const taskId = match![1];
      const allComments = await getStoredData(kv, 'comments', []);
      const taskComments = allComments.filter((c: any) => c.task_id === taskId);
      return new Response(JSON.stringify(taskComments), { headers: corsHeaders });
    }

    // 4. POST /api/tasks/:id/comments
    if (request.method === 'POST' && path.match(/^\/api\/tasks\/([^/]+)\/comments$/)) {
      const match = path.match(/^\/api\/tasks\/([^/]+)\/comments$/);
      const taskId = match![1];
      const body = await request.json();
      const allComments = await getStoredData(kv, 'comments', []);
      const newComment = {
        id: Date.now(),
        task_id: taskId,
        author_id: body.author_id || 'user',
        author_name: body.author_name || 'Team Member',
        content: body.content,
        created_at: new Date().toISOString()
      };
      allComments.push(newComment);
      await setStoredData(kv, 'comments', allComments);

      // Activity log
      const activities = await getStoredData(kv, 'activity', []);
      activities.unshift({
        id: Date.now(),
        task_id: taskId,
        user_id: body.author_id || 'user',
        user_name: body.author_name || 'Team Member',
        action_type: 'COMMENT_ADDED',
        details: `Added comment on task ${taskId}`,
        timestamp: new Date().toISOString()
      });
      await setStoredData(kv, 'activity', activities.slice(0, 100));

      return new Response(JSON.stringify(newComment), { status: 201, headers: corsHeaders });
    }

    // 5. POST /api/tasks/:id/send-overdue-email
    if (request.method === 'POST' && path.match(/^\/api\/tasks\/([^/]+)\/send-overdue-email$/)) {
      const match = path.match(/^\/api\/tasks\/([^/]+)\/send-overdue-email$/);
      const taskId = match![1];
      const tasks = await getStoredData(kv, 'tasks', []);
      const task = tasks.find((t: any) => t.id === taskId);
      if (!task) {
        return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404, headers: corsHeaders });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(task.due_date).getTime());
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

      const emails = await getStoredData(kv, 'emails', []);
      const dispatched: any[] = [];

      recipients.forEach(rec => {
        const html = generateOverdueEmailHTML(task, rec.name, daysOverdue);
        const logEntry = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          task_id: task.id,
          task_title: task.title,
          recipient_name: rec.name,
          recipient_email: rec.email,
          subject: `⚠️ Overdue Notice: ${task.id} - ${task.title} (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)`,
          html_content: html,
          sent_at: new Date().toISOString(),
          status: 'DELIVERED'
        };
        emails.unshift(logEntry);
        dispatched.push(logEntry);
      });

      await setStoredData(kv, 'emails', emails.slice(0, 50));
      return new Response(JSON.stringify({ success: true, count: dispatched.length, sent: dispatched }), { headers: corsHeaders });
    }

    // 6. GET /api/tasks/:id
    if (request.method === 'GET' && path.match(/^\/api\/tasks\/([^/]+)$/) && !path.includes('/next-id')) {
      const match = path.match(/^\/api\/tasks\/([^/]+)$/);
      const taskId = match![1];
      const tasks = await getStoredData(kv, 'tasks', []);
      const task = tasks.find((t: any) => t.id === taskId);
      if (task) {
        return new Response(JSON.stringify(task), { headers: corsHeaders });
      }
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404, headers: corsHeaders });
    }

    // 7. PUT /api/tasks/:id
    if (request.method === 'PUT' && path.match(/^\/api\/tasks\/([^/]+)$/)) {
      const match = path.match(/^\/api\/tasks\/([^/]+)$/);
      const taskId = match![1];
      const updates = await request.json();
      const tasks = await getStoredData(kv, 'tasks', []);
      const idx = tasks.findIndex((t: any) => t.id === taskId);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404, headers: corsHeaders });
      }

      const existing = tasks[idx];
      const now = new Date().toISOString();
      const isCompleting = updates.status === 'Completed' && existing.status !== 'Completed';

      const updated = {
        ...existing,
        ...updates,
        id: existing.id,
        completed_at: isCompleting ? now : (updates.status === 'Completed' ? existing.completed_at || now : null),
        updated_at: now
      };

      tasks[idx] = updated;
      await setStoredData(kv, 'tasks', tasks);

      // Activity log
      const activities = await getStoredData(kv, 'activity', []);
      activities.unshift({
        id: Date.now(),
        task_id: taskId,
        user_id: updates.author?.id || 'user',
        user_name: updates.author?.name || updated.assigned_by,
        action_type: updates.status && updates.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATE',
        details: updates.status && updates.status !== existing.status
          ? `Updated status to "${updates.status}"`
          : `Updated task "${updated.title}"`,
        timestamp: now
      });
      await setStoredData(kv, 'activity', activities.slice(0, 100));

      return new Response(JSON.stringify(updated), { headers: corsHeaders });
    }

    // 8. DELETE /api/tasks/:id
    if (request.method === 'DELETE' && path.match(/^\/api\/tasks\/([^/]+)$/)) {
      const match = path.match(/^\/api\/tasks\/([^/]+)$/);
      const taskId = match![1];
      let tasks = await getStoredData(kv, 'tasks', []);
      const task = tasks.find((t: any) => t.id === taskId);
      tasks = tasks.filter((t: any) => t.id !== taskId);
      await setStoredData(kv, 'tasks', tasks);

      if (task) {
        const activities = await getStoredData(kv, 'activity', []);
        activities.unshift({
          id: Date.now(),
          task_id: taskId,
          user_id: 'user',
          user_name: 'Administrator',
          action_type: 'DELETE',
          details: `Deleted task "${task.title}"`,
          timestamp: new Date().toISOString()
        });
        await setStoredData(kv, 'activity', activities.slice(0, 100));
      }

      return new Response(JSON.stringify({ success: true, deleted: taskId }), { headers: corsHeaders });
    }

    // 9. GET /api/tasks or /api/sync
    if (request.method === 'GET' && (path === '/api/tasks' || path === '/api/sync')) {
      const tasks = await getStoredData(kv, 'tasks', []);
      return new Response(JSON.stringify(tasks), { headers: corsHeaders });
    }

    // 10. POST /api/sync
    if (request.method === 'POST' && path === '/api/sync') {
      const body = await request.json();
      if (Array.isArray(body)) {
        await setStoredData(kv, 'tasks', body);
      }
      return new Response(JSON.stringify({ success: true, count: Array.isArray(body) ? body.length : 0 }), { headers: corsHeaders });
    }

    // 11. POST /api/tasks
    if (request.method === 'POST' && path === '/api/tasks') {
      const taskData = await request.json();
      let tasks = await getStoredData(kv, 'tasks', []);

      if (Array.isArray(taskData)) {
        tasks = taskData;
        await setStoredData(kv, 'tasks', tasks);
        return new Response(JSON.stringify(tasks), { status: 200, headers: corsHeaders });
      }

      if (!taskData.id) {
        let maxNum = 1000;
        tasks.forEach((t: any) => {
          const m = t.id?.match(/ACT-(\d+)/);
          if (m) {
            const num = parseInt(m[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        taskData.id = `ACT-${maxNum + 1}`;
      }

      const now = new Date().toISOString();
      const newTask = {
        id: taskData.id,
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
        completion_remarks: taskData.completion_remarks || null,
        completed_at: taskData.status === 'Completed' ? now : null,
        attachments: taskData.attachments || [],
        created_at: now,
        updated_at: now
      };

      tasks.unshift(newTask);
      await setStoredData(kv, 'tasks', tasks);

      // Activity log
      const activities = await getStoredData(kv, 'activity', []);
      activities.unshift({
        id: Date.now(),
        task_id: newTask.id,
        user_id: taskData.author?.id || 'user',
        user_name: taskData.author?.name || newTask.assigned_by,
        action_type: 'CREATE',
        details: `Created action item "${newTask.title}"`,
        timestamp: now
      });
      await setStoredData(kv, 'activity', activities.slice(0, 100));

      return new Response(JSON.stringify(newTask), { status: 201, headers: corsHeaders });
    }

    // 12. GET /api/stats
    if (request.method === 'GET' && path === '/api/stats') {
      const tasks = await getStoredData(kv, 'tasks', []);
      const stats = computeStats(tasks);
      return new Response(JSON.stringify(stats), { headers: corsHeaders });
    }

    // 13. GET /api/activity
    if (request.method === 'GET' && path.startsWith('/api/activity')) {
      const activities = await getStoredData(kv, 'activity', []);
      return new Response(JSON.stringify(activities.slice(0, 50)), { headers: corsHeaders });
    }

    // 14. GET /api/emails
    if (request.method === 'GET' && path.startsWith('/api/emails')) {
      const emails = await getStoredData(kv, 'emails', []);
      return new Response(JSON.stringify(emails.slice(0, 30)), { headers: corsHeaders });
    }

    // 15. POST /api/emails/check-overdue
    if (request.method === 'POST' && path === '/api/emails/check-overdue') {
      const body = await request.json().catch(() => ({}));
      const force = Boolean(body?.force);
      const tasks = await getStoredData(kv, 'tasks', []);
      const emails = await getStoredData(kv, 'emails', []);
      const todayStr = new Date().toISOString().split('T')[0];
      const dispatched: any[] = [];

      tasks.forEach((task: any) => {
        const isOverdue = task.status !== 'Completed' && task.due_date < todayStr;
        if (!isOverdue) return;

        const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(task.due_date).getTime());
        const daysOverdue = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const recipients: Array<{ name: string; email: string }> = [];
        if (task.assigned_to === 'Both') {
          recipients.push(USER_EMAILS['Rahkesh Kanna H']);
          recipients.push(USER_EMAILS['Fraaz Ahmed K']);
        } else if (USER_EMAILS[task.assigned_to]) {
          recipients.push(USER_EMAILS[task.assigned_to]);
        }

        recipients.forEach(rec => {
          const alreadySent = emails.some(
            (e: any) => e.task_id === task.id && e.recipient_email === rec.email && e.sent_at.startsWith(todayStr)
          );

          if (!alreadySent || force) {
            const html = generateOverdueEmailHTML(task, rec.name, daysOverdue);
            const logEntry = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              task_id: task.id,
              task_title: task.title,
              recipient_name: rec.name,
              recipient_email: rec.email,
              subject: `⚠️ Overdue Notice: ${task.id} - ${task.title} (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)`,
              html_content: html,
              sent_at: new Date().toISOString(),
              status: 'DELIVERED'
            };
            emails.unshift(logEntry);
            dispatched.push(logEntry);
          }
        });
      });

      if (dispatched.length > 0) {
        await setStoredData(kv, 'emails', emails.slice(0, 50));
      }

      return new Response(JSON.stringify({ success: true, count: dispatched.length, sent: dispatched }), { headers: corsHeaders });
    }

    // 16. POST /api/reset or /api/demo-preset
    if (request.method === 'POST' && (path === '/api/reset' || path === '/api/demo-preset')) {
      await setStoredData(kv, 'tasks', []);
      await setStoredData(kv, 'comments', []);
      await setStoredData(kv, 'emails', []);
      const initAct = [{
        id: Date.now(),
        task_id: null,
        user_id: 'system',
        user_name: 'System',
        action_type: 'CREATE',
        details: 'Workspace reset to clean Normal Mode with 0 items assigned for Rahkesh Kanna H and Fraaz Ahmed K',
        timestamp: new Date().toISOString()
      }];
      await setStoredData(kv, 'activity', initAct);
      return new Response(JSON.stringify({ success: true, count: 0, message: 'Normal mode initialized with 0 items' }), { headers: corsHeaders });
    }

    // 17. GET /api/members
    if (path === '/api/members') {
      const members = [
        {
          id: 'rahkesh',
          name: 'Rahkesh Kanna H',
          email: 'rahkesh@team.local',
          role: 'Co-Lead & Principal Architect',
          avatar_color: '#4f46e5'
        },
        {
          id: 'fraaz',
          name: 'Fraaz Ahmed K',
          email: 'fraaz@team.local',
          role: 'Co-Lead & Operations Lead',
          avatar_color: '#059669'
        }
      ];
      return new Response(JSON.stringify(members), { headers: corsHeaders });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });
};
