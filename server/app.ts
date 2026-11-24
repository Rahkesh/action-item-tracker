import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  initDB,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getComments,
  addComment,
  getActivityLogs,
  getTeamMembers,
  getDashboardStats,
  seedInitialData,
  getNextTaskId
} from './db.js';
import {
  checkAndSendOverdueAlerts,
  sendTaskOverdueEmail,
  getEmailLogs,
  getEmailLogsForTask
} from './mailer.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Ensure DB initialized
  initDB();

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Team Members
  app.get('/api/members', (_req: Request, res: Response) => {
    try {
      const members = getTeamMembers();
      res.json(members);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Next Task ID
  app.get('/api/tasks/next-id', (_req: Request, res: Response) => {
    try {
      const nextId = getNextTaskId();
      res.json({ nextId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Tasks with Query Filters
  app.get('/api/tasks', (req: Request, res: Response) => {
    try {
      const { assigned_to, status, priority, category, search } = req.query;
      const tasks = getAllTasks({
        assigned_to: assigned_to as string,
        status: status as string,
        priority: priority as string,
        category: category as string,
        search: search as string,
      });
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Task by ID
  app.get('/api/tasks/:id', (req: Request, res: Response) => {
    try {
      const task = getTaskById(req.params.id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create Task
  app.post('/api/tasks', (req: Request, res: Response) => {
    try {
      const { title, description, assigned_by, assigned_to, priority, start_date, due_date, status, category, remarks, attachments, author } = req.body;

      if (!title || !assigned_to || !due_date) {
        res.status(400).json({ error: 'Title, assigned_to, and due_date are required' });
        return;
      }

      const newTask = createTask(
        {
          title,
          description: description || '',
          assigned_by: assigned_by || 'Rahkesh Kanna H',
          assigned_to,
          priority: priority || 'Medium',
          start_date: start_date || new Date().toISOString().split('T')[0],
          due_date,
          status: status || 'Not Started',
          category: category || 'General',
          remarks: remarks || '',
          attachments: attachments || []
        },
        author || { id: 'current', name: assigned_by || 'Team Member' }
      );

      res.status(201).json(newTask);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Task
  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { author, ...updates } = req.body;

      const updated = updateTask(
        id,
        updates,
        author || { id: 'current', name: 'Team Member' }
      );

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Task
  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const author = (req.body && req.body.author) || { id: 'current', name: 'Team Member' };
      const success = deleteTask(id, author);
      if (!success) {
        res.status(404).json({ error: 'Task not found or could not be deleted' });
        return;
      }
      res.json({ success: true, message: `Task ${id} deleted` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Comments for a task
  app.get('/api/tasks/:id/comments', (req: Request, res: Response) => {
    try {
      const comments = getComments(req.params.id);
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks/:id/comments', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { author_id, author_name, content } = req.body;

      if (!content || !author_name) {
        res.status(400).json({ error: 'Author name and content are required' });
        return;
      }

      const comment = addComment(id, author_id || 'user', author_name, content);
      res.status(201).json(comment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Activity logs
  app.get('/api/activity', (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = getActivityLogs(limit);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard stats
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset database or set demo preset
  app.post('/api/reset', (req: Request, res: Response) => {
    try {
      const preset = (req.body && req.body.preset) || 'one-each-member';
      seedInitialData(preset);
      res.json({ success: true, message: `Database reset to ${preset} preset` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/demo-preset', (req: Request, res: Response) => {
    try {
      const { preset } = req.body;
      seedInitialData(preset || 'one-each-member');
      res.json({ success: true, preset: preset || 'one-each-member' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Email Notification & Overdue Intimation Endpoints
  app.get('/api/emails', (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const emails = getEmailLogs(limit);
      res.json(emails);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/emails/check-overdue', (req: Request, res: Response) => {
    try {
      const force = Boolean(req.body && req.body.force);
      const sent = checkAndSendOverdueAlerts(force);
      res.json({ success: true, count: sent.length, sent });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks/:id/send-overdue-email', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sent = sendTaskOverdueEmail(id);
      res.json({ success: true, count: sent.length, sent });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tasks/:id/emails', (req: Request, res: Response) => {
    try {
      const emails = getEmailLogsForTask(req.params.id);
      res.json(emails);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}
