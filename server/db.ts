import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { Task, Comment, ActivityLog, TeamMember } from './types.js';

const DB_PATH = path.resolve(process.cwd(), 'action_tracker.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      priority TEXT NOT NULL,
      start_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      category TEXT NOT NULL,
      remarks TEXT,
      completion_remarks TEXT,
      completed_at TEXT,
      attachments TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT,
      task_title TEXT,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      task_title TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_content TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DELIVERED',
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Check if users exist, if not seed users
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedInitialData();
  }
}

export function seedInitialData(preset: 'normal' | 'one-each-member' | 'one-each-status' | 'one-each-both' | 'full' = 'normal') {
  db.exec('DELETE FROM comments');
  db.exec('DELETE FROM activity_log');
  db.exec('DELETE FROM email_logs');
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM users');

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, avatar_color, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  insertUser.run('rahkesh', 'Rahkesh Kanna H', 'rahkesh@team.local', 'Co-Lead & Principal Architect', '#4f46e5', now);
  insertUser.run('fraaz', 'Fraaz Ahmed K', 'fraaz@team.local', 'Co-Lead & Operations Lead', '#059669', now);

  if (preset === 'normal') {
    logActivity('WORKSPACE_INITIALIZED', null, 'System', 'Workspace initialized in Normal Mode with 0 items assigned for Rahkesh Kanna H and Fraaz Ahmed K');
    return;
  }

  const insertTask = db.prepare(`
    INSERT INTO tasks (
      id, title, description, assigned_by, assigned_to, priority,
      start_date, due_date, status, category, remarks,
      completion_remarks, completed_at, attachments, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Calculate realistic dates (today, overdue, upcoming)
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const dMinus10 = new Date(today); dMinus10.setDate(today.getDate() - 10);
  const dMinus7 = new Date(today); dMinus7.setDate(today.getDate() - 7);
  const dMinus5 = new Date(today); dMinus5.setDate(today.getDate() - 5);
  const dMinus3 = new Date(today); dMinus3.setDate(today.getDate() - 3);
  const dMinus2 = new Date(today); dMinus2.setDate(today.getDate() - 2);
  const dMinus1 = new Date(today); dMinus1.setDate(today.getDate() - 1); // overdue
  const dPlus2 = new Date(today); dPlus2.setDate(today.getDate() + 2);
  const dPlus4 = new Date(today); dPlus4.setDate(today.getDate() + 4);
  const dPlus7 = new Date(today); dPlus7.setDate(today.getDate() + 7);
  const dPlus12 = new Date(today); dPlus12.setDate(today.getDate() + 12);

  let seedTasks: Partial<Task>[] = [];

  if (preset === 'one-each-member') {
    // Exactly ONE task for Rahkesh Kanna H and ONE task for Fraaz Ahmed K
    seedTasks = [
      {
        id: 'ACT-1001',
        title: 'Architect Real-Time Notification & Action Item Sync Engine',
        description: 'Design and benchmark WebSocket + SQLite event bus to stream instant task status shifts across all concurrent team sessions.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'Critical',
        start_date: formatDate(dMinus2),
        due_date: formatDate(dPlus2),
        status: 'In Progress',
        category: 'Engineering',
        remarks: 'Socket listeners benchmarked; currently testing live client reconnects.',
        attachments: [{ id: 'att-1', name: 'architecture_diagram.png', size: 124500, type: 'image/png', uploadedAt: formatDate(dMinus2) }],
        created_at: dMinus2.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1002',
        title: 'Finalize Q4 Milestone Deliverables & Resource Matrix',
        description: 'Consolidate sprint progress metrics, client deliverable timelines, and joint operational goals for executive alignment.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Fraaz Ahmed K',
        priority: 'High',
        start_date: formatDate(dMinus3),
        due_date: formatDate(dPlus4),
        status: 'In Progress',
        category: 'Operations',
        remarks: 'Draft deliverables deck ready for joint review.',
        attachments: [{ id: 'att-2', name: 'Q4_Milestone_Plan.pdf', size: 450200, type: 'application/pdf', uploadedAt: formatDate(dMinus3) }],
        created_at: dMinus3.toISOString(),
        updated_at: dMinus1.toISOString(),
      }
    ];
  } else if (preset === 'one-each-both') {
    // 1 for Rahkesh, 1 for Fraaz, 1 for Both
    seedTasks = [
      {
        id: 'ACT-1001',
        title: 'Architect Real-Time Notification & Action Item Sync Engine',
        description: 'Design and benchmark WebSocket + SQLite event bus to stream instant task status shifts across all concurrent team sessions.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'Critical',
        start_date: formatDate(dMinus2),
        due_date: formatDate(dPlus2),
        status: 'In Progress',
        category: 'Engineering',
        remarks: 'Socket listeners benchmarked; currently testing live client reconnects.',
        attachments: [{ id: 'att-1', name: 'architecture_diagram.png', size: 124500, type: 'image/png', uploadedAt: formatDate(dMinus2) }],
        created_at: dMinus2.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1002',
        title: 'Finalize Q4 Milestone Deliverables & Resource Matrix',
        description: 'Consolidate sprint progress metrics, client deliverable timelines, and joint operational goals for executive alignment.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Fraaz Ahmed K',
        priority: 'High',
        start_date: formatDate(dMinus3),
        due_date: formatDate(dPlus4),
        status: 'In Progress',
        category: 'Operations',
        remarks: 'Draft deliverables deck ready for joint review.',
        attachments: [{ id: 'att-2', name: 'Q4_Milestone_Plan.pdf', size: 450200, type: 'application/pdf', uploadedAt: formatDate(dMinus3) }],
        created_at: dMinus3.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1003',
        title: 'Enterprise Security Audit & Dependency Remediation',
        description: 'Audit npm dependency trees, verify zero CVEs, and configure strict CSP headers across all endpoints.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Both',
        priority: 'Critical',
        start_date: formatDate(dMinus5),
        due_date: formatDate(dMinus1),
        status: 'Completed',
        category: 'Security',
        remarks: 'Joint audit completed.',
        completion_remarks: 'Zero vulnerabilities found across all 261 dependencies.',
        completed_at: dMinus1.toISOString(),
        attachments: [],
        created_at: dMinus5.toISOString(),
        updated_at: dMinus1.toISOString(),
      }
    ];
  } else if (preset === 'one-each-status') {
    // Exactly ONE task for each of the 5 statuses: Not Started, In Progress, On Hold, Completed, Overdue
    seedTasks = [
      {
        id: 'ACT-1001',
        title: 'Automate Multi-Stage CI/CD Deployment with Health Probes',
        description: 'Script automated build, linting, migration check, and rollback mechanisms for cloud deployment.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'Low',
        start_date: formatDate(today),
        due_date: formatDate(dPlus12),
        status: 'Not Started',
        category: 'DevOps',
        remarks: 'Awaiting runner access.',
        attachments: [],
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
      },
      {
        id: 'ACT-1002',
        title: 'Architect Real-Time Notification & Action Item Sync Engine',
        description: 'Design and benchmark WebSocket + SQLite event bus to stream instant task status shifts across all concurrent team sessions.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'Critical',
        start_date: formatDate(dMinus2),
        due_date: formatDate(dPlus2),
        status: 'In Progress',
        category: 'Engineering',
        remarks: 'Socket benchmark running.',
        attachments: [{ id: 'att-1', name: 'architecture_diagram.png', size: 124500, type: 'image/png', uploadedAt: formatDate(dMinus2) }],
        created_at: dMinus2.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1003',
        title: 'Third-Party Webhook Integrations for Status Alerting',
        description: 'Support webhook callbacks triggered on task creation, status transition, and overdue warning events.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Both',
        priority: 'Medium',
        start_date: formatDate(dMinus5),
        due_date: formatDate(dPlus7),
        status: 'On Hold',
        category: 'Engineering',
        remarks: 'Waiting for partner API credential generation.',
        attachments: [],
        created_at: dMinus5.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1004',
        title: 'Database Indexing & Sub-millisecond Query Optimization',
        description: 'Created compound indexes on tasks(assigned_to, status, due_date) and activity_log to ensure high-speed querying.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'High',
        start_date: formatDate(dMinus10),
        due_date: formatDate(dMinus3),
        status: 'Completed',
        category: 'Engineering',
        remarks: 'Executed on local and staging instances.',
        completion_remarks: 'Average query latency dropped from 42ms to 1.8ms.',
        completed_at: dMinus3.toISOString(),
        attachments: [],
        created_at: dMinus10.toISOString(),
        updated_at: dMinus3.toISOString(),
      },
      {
        id: 'ACT-1005',
        title: 'Customer SLA Performance & Escalation Review',
        description: 'Review SLA adherence rates for pending client tickets, analyze response times, and establish escalation guidelines.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Fraaz Ahmed K',
        priority: 'High',
        start_date: formatDate(dMinus7),
        due_date: formatDate(dMinus1), // OVERDUE
        status: 'In Progress',
        category: 'Client / Business',
        remarks: 'Pending confirmation from external customer support team.',
        attachments: [],
        created_at: dMinus7.toISOString(),
        updated_at: dMinus1.toISOString(),
      }
    ];
  } else {
    // Full 10 tasks dataset
    seedTasks = [
      {
        id: 'ACT-1001',
        title: 'Architect Real-Time Notification & Action Item Sync Engine',
        description: 'Design and benchmark WebSocket + SQLite event bus to stream instant task status shifts across all concurrent team sessions.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'Critical',
        start_date: formatDate(dMinus5),
        due_date: formatDate(dPlus2),
        status: 'In Progress',
        category: 'Engineering',
        remarks: 'Benchmarking latency under concurrent writes.',
        attachments: [{ id: 'att-1', name: 'architecture_diagram.png', size: 124500, type: 'image/png', uploadedAt: formatDate(dMinus5) }],
        created_at: dMinus5.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1002',
        title: 'Finalize Q4 Milestone Deliverables & Resource Matrix',
        description: 'Consolidate progress reports, sprint metrics, and executive status slides for joint stakeholders review.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Fraaz Ahmed K',
        priority: 'High',
        start_date: formatDate(dMinus7),
        due_date: formatDate(dPlus4),
        status: 'In Progress',
        category: 'Operations',
        remarks: 'Draft deck ready for Rahkesh review.',
        attachments: [{ id: 'att-2', name: 'Q4_Milestone_Plan.pdf', size: 450200, type: 'application/pdf', uploadedAt: formatDate(dMinus7) }],
        created_at: dMinus7.toISOString(),
        updated_at: dMinus3.toISOString(),
      },
      {
        id: 'ACT-1003',
        title: 'Database Indexing & Sub-millisecond Query Optimization',
        description: 'Created compound indexes on tasks(assigned_to, status, due_date) and activity_log to ensure high-speed querying.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'High',
        start_date: formatDate(dMinus10),
        due_date: formatDate(dMinus3),
        status: 'Completed',
        category: 'Engineering',
        remarks: 'Executed on local and staging instances.',
        completion_remarks: 'Average query latency dropped from 42ms to 1.8ms across 50,000 synthetic records.',
        completed_at: dMinus3.toISOString(),
        attachments: [],
        created_at: dMinus10.toISOString(),
        updated_at: dMinus3.toISOString(),
      },
      {
        id: 'ACT-1004',
        title: 'Enterprise Security Audit & Dependency Vulnerability Remediation',
        description: 'Audit npm dependency trees, verify zero CVEs, and configure strict CSP headers across all endpoints.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Both',
        priority: 'Critical',
        start_date: formatDate(dMinus3),
        due_date: formatDate(dPlus7),
        status: 'In Progress',
        category: 'Security',
        remarks: 'Joint review scheduled for Friday morning.',
        attachments: [{ id: 'att-3', name: 'Audit_Checklist.xlsx', size: 84300, type: 'application/vnd.ms-excel', uploadedAt: formatDate(dMinus3) }],
        created_at: dMinus3.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1005',
        title: 'Customer SLA Performance & Escalation Review',
        description: 'Review SLA adherence rates for pending client tickets, analyze response times, and establish escalation guidelines.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Fraaz Ahmed K',
        priority: 'Medium',
        start_date: formatDate(dMinus7),
        due_date: formatDate(dMinus1), // OVERDUE
        status: 'In Progress',
        category: 'Client / Business',
        remarks: 'Pending confirmation from external customer support team.',
        attachments: [],
        created_at: dMinus7.toISOString(),
        updated_at: dMinus1.toISOString(),
      },
      {
        id: 'ACT-1006',
        title: 'Automate Multi-Stage CI/CD Deployment with Health Probes',
        description: 'Script automated build, linting, migration check, and rollback mechanisms for cloud deployment.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'High',
        start_date: formatDate(dMinus10),
        due_date: formatDate(dMinus1), // OVERDUE
        status: 'Not Started',
        category: 'DevOps',
        remarks: 'Needs runner machine access tokens.',
        attachments: [],
        created_at: dMinus10.toISOString(),
        updated_at: dMinus5.toISOString(),
      },
      {
        id: 'ACT-1007',
        title: 'Design System Polish: High-Contrast Badges & Dark Theme Tokens',
        description: 'Refined CSS design tokens with Slate and Emerald accents, ensuring WCAG AAA accessibility across light and dark modes.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Both',
        priority: 'Medium',
        start_date: formatDate(dMinus10),
        due_date: formatDate(dMinus5),
        status: 'Completed',
        category: 'Design',
        remarks: 'Design token sheet synced.',
        completion_remarks: 'Tokens verified and tested across multiple display resolutions and contrast checkers.',
        completed_at: dMinus5.toISOString(),
        attachments: [],
        created_at: dMinus10.toISOString(),
        updated_at: dMinus5.toISOString(),
      },
      {
        id: 'ACT-1008',
        title: 'Automated Daily Health Check Cron & Data Backup Scripts',
        description: 'Develop shell and Node cron workers to run daily SQLite database vacuuming and encrypted S3 uploads.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Fraaz Ahmed K',
        priority: 'Low',
        start_date: formatDate(today),
        due_date: formatDate(dPlus12),
        status: 'Not Started',
        category: 'Operations',
        remarks: 'Low urgency for now; target completion in 2 weeks.',
        attachments: [],
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
      },
      {
        id: 'ACT-1009',
        title: 'Interactive Monthly & Weekly Action Item Calendar',
        description: 'Implement responsive calendar engine to render tasks with color badges, overdue status highlights, and modal previews.',
        assigned_by: 'Fraaz Ahmed K',
        assigned_to: 'Rahkesh Kanna H',
        priority: 'High',
        start_date: formatDate(dMinus3),
        due_date: formatDate(dPlus4),
        status: 'In Progress',
        category: 'Engineering',
        remarks: 'Integrated with dynamic task store.',
        attachments: [],
        created_at: dMinus3.toISOString(),
        updated_at: today.toISOString(),
      },
      {
        id: 'ACT-1010',
        title: 'Third-Party Webhook Integrations for Status Alerting',
        description: 'Support webhook callbacks triggered on task creation, status transition, and overdue warning events.',
        assigned_by: 'Rahkesh Kanna H',
        assigned_to: 'Both',
        priority: 'Medium',
        start_date: formatDate(dMinus5),
        due_date: formatDate(dPlus7),
        status: 'On Hold',
        category: 'Engineering',
        remarks: 'Waiting for partner API credential generation.',
        attachments: [],
        created_at: dMinus5.toISOString(),
        updated_at: dMinus1.toISOString(),
      }
    ];
  }

  for (const t of seedTasks) {
    insertTask.run(
      t.id!,
      t.title!,
      t.description!,
      t.assigned_by!,
      t.assigned_to!,
      t.priority!,
      t.start_date!,
      t.due_date!,
      t.status!,
      t.category!,
      t.remarks || '',
      t.completion_remarks || '',
      t.completed_at || null,
      JSON.stringify(t.attachments || []),
      t.created_at!,
      t.updated_at!
    );
  }

  // Seed Comments
  const insertComment = db.prepare(`
    INSERT INTO comments (task_id, author_id, author_name, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertComment.run(
    'ACT-1001',
    'fraaz',
    'Fraaz Ahmed K',
    'Rahkesh, I checked the memory profiling during peak load. Looks very clean under 10k items.',
    dMinus1.toISOString()
  );

  insertComment.run(
    'ACT-1001',
    'rahkesh',
    'Rahkesh Kanna H',
    'Thanks Fraaz! Adding connection pooling for SQLite writes next.',
    now
  );

  if (seedTasks.some(t => t.id === 'ACT-1002')) {
    insertComment.run(
      'ACT-1002',
      'rahkesh',
      'Rahkesh Kanna H',
      'Fraaz, milestone plan structure looks solid. Ready to proceed.',
      now
    );
  }

  // Seed Activity Logs
  const insertActivity = db.prepare(`
    INSERT INTO activity_log (task_id, task_title, user_id, user_name, action_type, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertActivity.run('ACT-1001', 'Architect Real-Time Notification & Action Item Sync Engine', 'rahkesh', 'Rahkesh Kanna H', 'CREATE', 'Created action item for Rahkesh', dMinus2.toISOString());
  insertActivity.run('ACT-1002', 'Finalize Q4 Milestone Deliverables & Resource Matrix', 'fraaz', 'Fraaz Ahmed K', 'CREATE', 'Created action item for Fraaz', dMinus3.toISOString());
}

// Generate Next Task ID (e.g. ACT-1011)
export function getNextTaskId(): string {
  const row = db.prepare(`
    SELECT id FROM tasks 
    WHERE id LIKE 'ACT-%' 
    ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC 
    LIMIT 1
  `).get() as { id?: string } | undefined;

  if (!row || !row.id) {
    return 'ACT-1001';
  }

  const numPart = parseInt(row.id.replace('ACT-', ''), 10);
  const nextNum = isNaN(numPart) ? 1001 : numPart + 1;
  return `ACT-${nextNum}`;
}

// Parse Task from DB Row
function parseTask(row: any): Task {
  return {
    ...row,
    attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || [])
  };
}

// Query Tasks
export function getAllTasks(filters?: {
  assigned_to?: string;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}): Task[] {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params: any[] = [];

  if (filters?.assigned_to && filters.assigned_to !== 'All') {
    query += ' AND (assigned_to = ? OR assigned_to = "Both")';
    params.push(filters.assigned_to);
  }

  if (filters?.status && filters.status !== 'All') {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.priority && filters.priority !== 'All') {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }

  if (filters?.category && filters.category !== 'All') {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters?.search) {
    query += ' AND (id LIKE ? OR title LIKE ? OR description LIKE ? OR category LIKE ?)';
    const searchWildcard = `%${filters.search}%`;
    params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
  }

  query += ' ORDER BY due_date ASC, priority DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(parseTask);
}

export function getTaskById(id: string): Task | null {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return row ? parseTask(row) : null;
}

export function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }, author: { id: string; name: string }): Task {
  const id = taskData.id || getNextTaskId();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO tasks (
      id, title, description, assigned_by, assigned_to, priority,
      start_date, due_date, status, category, remarks,
      completion_remarks, completed_at, attachments, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const attachmentsStr = JSON.stringify(taskData.attachments || []);

  insert.run(
    id,
    taskData.title,
    taskData.description,
    taskData.assigned_by,
    taskData.assigned_to,
    taskData.priority,
    taskData.start_date,
    taskData.due_date,
    taskData.status,
    taskData.category,
    taskData.remarks || '',
    taskData.completion_remarks || '',
    taskData.status === 'Completed' ? now : null,
    attachmentsStr,
    now,
    now
  );

  // Log activity
  logActivity({
    task_id: id,
    task_title: taskData.title,
    user_id: author.id,
    user_name: author.name,
    action_type: 'CREATE',
    details: `Created action item ${id} assigned to ${taskData.assigned_to}`
  });

  return getTaskById(id)!;
}

export function updateTask(id: string, updates: Partial<Task>, author: { id: string; name: string }): Task {
  const existing = getTaskById(id);
  if (!existing) {
    throw new Error(`Task ${id} not found`);
  }

  const now = new Date().toISOString();
  const title = updates.title ?? existing.title;
  const description = updates.description ?? existing.description;
  const assigned_by = updates.assigned_by ?? existing.assigned_by;
  const assigned_to = updates.assigned_to ?? existing.assigned_to;
  const priority = updates.priority ?? existing.priority;
  const start_date = updates.start_date ?? existing.start_date;
  const due_date = updates.due_date ?? existing.due_date;
  const status = updates.status ?? existing.status;
  const category = updates.category ?? existing.category;
  const remarks = updates.remarks ?? existing.remarks;
  const completion_remarks = updates.completion_remarks ?? existing.completion_remarks;
  let completed_at = existing.completed_at;

  if (status === 'Completed' && existing.status !== 'Completed') {
    completed_at = now;
  } else if (status !== 'Completed') {
    completed_at = null;
  }

  const attachmentsStr = updates.attachments ? JSON.stringify(updates.attachments) : JSON.stringify(existing.attachments);

  const stmt = db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, assigned_by = ?, assigned_to = ?, priority = ?,
      start_date = ?, due_date = ?, status = ?, category = ?, remarks = ?,
      completion_remarks = ?, completed_at = ?, attachments = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    title,
    description,
    assigned_by,
    assigned_to,
    priority,
    start_date,
    due_date,
    status,
    category,
    remarks || '',
    completion_remarks || '',
    completed_at,
    attachmentsStr,
    now,
    id
  );

  // Generate audit activity log
  const changes: string[] = [];
  if (existing.status !== status) {
    changes.push(`status changed from '${existing.status}' to '${status}'`);
  }
  if (existing.priority !== priority) {
    changes.push(`priority changed from '${existing.priority}' to '${priority}'`);
  }
  if (existing.assigned_to !== assigned_to) {
    changes.push(`reassigned from '${existing.assigned_to}' to '${assigned_to}'`);
  }

  if (changes.length > 0) {
    logActivity({
      task_id: id,
      task_title: title,
      user_id: author.id,
      user_name: author.name,
      action_type: status === 'Completed' ? 'COMPLETED' : 'STATUS_CHANGE',
      details: changes.join(', ')
    });
  } else {
    logActivity({
      task_id: id,
      task_title: title,
      user_id: author.id,
      user_name: author.name,
      action_type: 'UPDATE',
      details: `Updated task details`
    });
  }

  return getTaskById(id)!;
}

export function deleteTask(id: string, author: { id: string; name: string }): boolean {
  const task = getTaskById(id);
  if (!task) return false;

  db.prepare('DELETE FROM comments WHERE task_id = ?').run(id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  logActivity({
    task_id: id,
    task_title: task.title,
    user_id: author.id,
    user_name: author.name,
    action_type: 'DELETE',
    details: `Deleted task ${id} (${task.title})`
  });

  return true;
}

// Comments
export function getComments(taskId: string): Comment[] {
  const rows = db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC').all(taskId);
  return rows as unknown as Comment[];
}

export function addComment(taskId: string, authorId: string, authorName: string, content: string): Comment {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO comments (task_id, author_id, author_name, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const res = insert.run(taskId, authorId, authorName, content, now);
  const newId = Number(res.lastInsertRowid);

  const task = getTaskById(taskId);
  logActivity({
    task_id: taskId,
    task_title: task?.title || '',
    user_id: authorId,
    user_name: authorName,
    action_type: 'COMMENT_ADDED',
    details: `Added a comment: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`
  });

  return {
    id: newId,
    task_id: taskId,
    author_id: authorId,
    author_name: authorName,
    content,
    created_at: now
  };
}

// Activity Log
export function logActivity(data: {
  task_id: string | null;
  task_title?: string | null;
  user_id: string;
  user_name: string;
  action_type: ActivityLog['action_type'];
  details: string;
}) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO activity_log (task_id, task_title, user_id, user_name, action_type, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.task_id,
    data.task_title || null,
    data.user_id,
    data.user_name,
    data.action_type,
    data.details,
    now
  );
}

export function getActivityLogs(limit = 50): ActivityLog[] {
  const rows = db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ?').all(limit);
  return rows as unknown as ActivityLog[];
}

// Team Members
export function getTeamMembers(): TeamMember[] {
  const rows = db.prepare('SELECT * FROM users ORDER BY name ASC').all();
  return rows as unknown as TeamMember[];
}

// Dashboard & Analytics Stats
export function getDashboardStats() {
  const allTasks = getAllTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  const total = allTasks.length;
  const pending = allTasks.filter(t => t.status === 'Not Started').length;
  const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
  const onHold = allTasks.filter(t => t.status === 'On Hold').length;
  const completed = allTasks.filter(t => t.status === 'Completed').length;

  const overdue = allTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length;

  const assignedToRahkesh = allTasks.filter(t => t.assigned_to === 'Rahkesh Kanna H' || t.assigned_to === 'Both').length;
  const assignedToFraaz = allTasks.filter(t => t.assigned_to === 'Fraaz Ahmed K' || t.assigned_to === 'Both').length;

  // Individual detailed metrics
  const rahkeshTasks = allTasks.filter(t => t.assigned_to === 'Rahkesh Kanna H' || t.assigned_to === 'Both');
  const fraazTasks = allTasks.filter(t => t.assigned_to === 'Fraaz Ahmed K' || t.assigned_to === 'Both');

  const rahkeshCompleted = rahkeshTasks.filter(t => t.status === 'Completed').length;
  const rahkeshPending = rahkeshTasks.filter(t => t.status !== 'Completed').length;
  const rahkeshOverdue = rahkeshTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length;

  const fraazCompleted = fraazTasks.filter(t => t.status === 'Completed').length;
  const fraazPending = fraazTasks.filter(t => t.status !== 'Completed').length;
  const fraazOverdue = fraazTasks.filter(t => t.status !== 'Completed' && t.due_date < todayStr).length;

  // Workload distribution
  const workload = {
    rahkeshOnly: allTasks.filter(t => t.assigned_to === 'Rahkesh Kanna H').length,
    fraazOnly: allTasks.filter(t => t.assigned_to === 'Fraaz Ahmed K').length,
    both: allTasks.filter(t => t.assigned_to === 'Both').length,
  };

  // Status distribution
  const statusDistribution = {
    notStarted: pending,
    inProgress: inProgress,
    onHold: onHold,
    completed: completed
  };

  // Priority distribution
  const priorityDistribution = {
    critical: allTasks.filter(t => t.priority === 'Critical').length,
    high: allTasks.filter(t => t.priority === 'High').length,
    medium: allTasks.filter(t => t.priority === 'Medium').length,
    low: allTasks.filter(t => t.priority === 'Low').length,
  };

  // Completion percentage
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Weekly productivity: Past 7 days
  const weeklyProductivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const createdOnDay = allTasks.filter(t => t.created_at.startsWith(dateStr)).length;
    const completedOnDay = allTasks.filter(t => t.completed_at && t.completed_at.startsWith(dateStr)).length;

    weeklyProductivity.push({
      date: dateStr,
      day: dayLabel,
      created: createdOnDay,
      completed: completedOnDay
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
    workload,
    statusDistribution,
    priorityDistribution,
    weeklyProductivity,
    memberStats: {
      rahkesh: {
        total: assignedToRahkesh,
        completed: rahkeshCompleted,
        pending: rahkeshPending,
        overdue: rahkeshOverdue,
        rate: assignedToRahkesh > 0 ? Math.round((rahkeshCompleted / assignedToRahkesh) * 100) : 0
      },
      fraaz: {
        total: assignedToFraaz,
        completed: fraazCompleted,
        pending: fraazPending,
        overdue: fraazOverdue,
        rate: assignedToFraaz > 0 ? Math.round((fraazCompleted / assignedToFraaz) * 100) : 0
      }
    }
  };
}
