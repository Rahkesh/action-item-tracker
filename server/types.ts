export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
export type AssigneeOption = 'Rahkesh Kanna H' | 'Fraaz Ahmed K' | 'Both';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_by: string;
  assigned_to: AssigneeOption;
  priority: Priority;
  start_date: string;
  due_date: string;
  status: TaskStatus;
  category: string;
  remarks?: string;
  completion_remarks?: string;
  completed_at?: string | null;
  attachments: TaskAttachment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  task_id: string | null;
  task_title?: string | null;
  user_id: string;
  user_name: string;
  action_type: 'CREATE' | 'STATUS_CHANGE' | 'PRIORITY_CHANGE' | 'ASSIGNMENT_CHANGE' | 'COMMENT_ADDED' | 'UPDATE' | 'DELETE' | 'COMPLETED';
  details: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_color: string;
}
