import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Task,
  TeamMember,
  DashboardStats,
  ActivityLog,
  NavigationPage,
  TaskFilterOptions,
  TaskStatus,
  Priority,
  AssigneeOption,
  EmailLog
} from '../types/index.ts';
import { ClientStorageService } from '../services/clientStorage.ts';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: TeamMember;
  setCurrentUser: (member: TeamMember) => void;
  teamMembers: TeamMember[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: NavigationPage;
  setActiveTab: (tab: NavigationPage) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;

  // Data
  tasks: Task[];
  stats: DashboardStats | null;
  activityLogs: ActivityLog[];
  loading: boolean;
  refreshData: () => Promise<void>;

  // Filters
  filterOptions: TaskFilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  resetFilters: () => void;

  // Modals & Sliders
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  openCreateTaskModal: () => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;

  selectedTaskDetail: Task | null;
  openTaskDetail: (task: Task) => void;
  closeTaskDetail: () => void;

  taskToDelete: Task | null;
  openDeleteModal: (task: Task) => void;
  closeDeleteModal: () => void;

  // CRUD Operations
  handleSaveTask: (taskData: any) => Promise<boolean>;
  handleDeleteTask: (taskId: string) => Promise<boolean>;
  handleQuickStatusChange: (taskId: string, newStatus: TaskStatus, completionRemarks?: string) => Promise<void>;
  handleAddComment: (taskId: string, content: string) => Promise<void>;
  handleResetDatabase: () => Promise<void>;
  // Demo Presets
  demoPreset: 'one-each-member' | 'one-each-status' | 'one-each-both' | 'full';
  handleSetDemoPreset: (preset: 'one-each-member' | 'one-each-status' | 'one-each-both' | 'full') => Promise<void>;

  // Email Notifications
  emailLogs: EmailLog[];
  isEmailModalOpen: boolean;
  selectedEmailPreview: EmailLog | null;
  openEmailModal: () => void;
  closeEmailModal: () => void;
  previewEmail: (email: EmailLog) => void;
  closeEmailPreview: () => void;
  handleCheckOverdueEmails: (force?: boolean) => Promise<void>;
  handleSendTaskOverdueEmail: (taskId: string) => Promise<void>;
  fetchEmailLogs: () => Promise<void>;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PREDEFINED_MEMBERS: TeamMember[] = [
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

const initialFilters: TaskFilterOptions = {
  search: '',
  assigned_to: 'All',
  priority: 'All',
  status: 'All',
  category: 'All',
  sortBy: 'due_date_asc'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    const saved = localStorage.getItem('action_tracker_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return PREDEFINED_MEMBERS.find(m => m.id === parsed.id) || PREDEFINED_MEMBERS[0];
      } catch (e) {
        return PREDEFINED_MEMBERS[0];
      }
    }
    return PREDEFINED_MEMBERS[0];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('action_tracker_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [activeTab, setActiveTab] = useState<NavigationPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filterOptions, setFilterOptions] = useState<TaskFilterOptions>(initialFilters);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Email Notification States
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<EmailLog | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('action_tracker_theme', theme);
  }, [theme]);

  // Sync current user and data-user attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-user', currentUser.id);
    localStorage.setItem('action_tracker_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const resetFilters = () => {
    setFilterOptions(initialFilters);
  };

  // Fetch all data from REST API with seamless ClientStorage fallback
  const refreshData = async () => {
    const loadFromClientStorage = () => {
      const tasksData = ClientStorageService.getTasks();
      setTasks(tasksData);
      setStats(ClientStorageService.calculateStats());
      setActivityLogs(ClientStorageService.getActivityLogs(50));
      setEmailLogs(ClientStorageService.getEmailLogs(30));
      if (selectedTaskDetail) {
        const fresh = tasksData.find((t: Task) => t.id === selectedTaskDetail.id);
        if (fresh) setSelectedTaskDetail(fresh);
      }
    };

    try {
      const [tasksRes, statsRes, activityRes, emailsRes] = await Promise.all([
        fetch('/api/tasks').catch(() => null),
        fetch('/api/stats').catch(() => null),
        fetch('/api/activity?limit=50').catch(() => null),
        fetch('/api/emails?limit=30').catch(() => null)
      ]);

      if (tasksRes && tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);

        if (selectedTaskDetail) {
          const fresh = tasksData.find((t: Task) => t.id === selectedTaskDetail.id);
          if (fresh) setSelectedTaskDetail(fresh);
        }

        if (statsRes && statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (activityRes && activityRes.ok) {
          setActivityLogs(await activityRes.json());
        }
        if (emailsRes && emailsRes.ok) {
          setEmailLogs(await emailsRes.json());
        }
      } else {
        loadFromClientStorage();
      }
    } catch {
      loadFromClientStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // When Rahkesh or colleague focuses/opens the window, auto-sync latest updates from cloud
    const handleFocus = async () => {
      await ClientStorageService.syncWithCloud();
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Modal Handlers
  const openCreateTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTaskDetail(task);
  };

  const closeTaskDetail = () => {
    setSelectedTaskDetail(null);
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
  };

  const closeDeleteModal = () => {
    setTaskToDelete(null);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (taskData: any): Promise<boolean> => {
    const isEdit = Boolean(editingTask);
    try {
      const url = isEdit ? `/api/tasks/${editingTask!.id}` : '/api/tasks';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...taskData,
        author: {
          id: currentUser.id,
          name: currentUser.name
        }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API request failed');

      const saved = await res.json();
      showToast(
        isEdit ? `Action item ${saved.id} updated successfully` : `Action item ${saved.id} created successfully`,
        'success'
      );
    } catch {
      // ClientStorage Fallback
      const saved = isEdit
        ? ClientStorageService.updateTask(editingTask!.id, taskData)
        : ClientStorageService.createTask(taskData);
      showToast(
        isEdit ? `Action item ${saved.id} updated successfully` : `Action item ${saved.id} created successfully`,
        'success'
      );
    }

    closeTaskModal();
    await refreshData();
    return true;
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: { id: currentUser.id, name: currentUser.name }
        })
      });

      if (!res.ok) throw new Error('Delete API failed');
    } catch {
      ClientStorageService.deleteTask(taskId);
    }

    showToast(`Action item ${taskId} deleted`, 'info');
    closeDeleteModal();
    if (selectedTaskDetail?.id === taskId) {
      closeTaskDetail();
    }
    await refreshData();
    return true;
  };

  // Quick Status Change (from table, card, or slideover)
  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus, completionRemarks?: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const payload: any = {
        status: newStatus,
        author: { id: currentUser.id, name: currentUser.name }
      };

      if (newStatus === 'Completed' && completionRemarks) {
        payload.completion_remarks = completionRemarks;
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Status update failed');
    } catch {
      ClientStorageService.updateTaskStatus(taskId, newStatus, completionRemarks);
    }

    showToast(`Status updated to "${newStatus}"`, 'success');
    await refreshData();
  };

  // Add Comment
  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          author_name: currentUser.name,
          content
        })
      });

      if (!res.ok) throw new Error('Failed to post comment');
    } catch {
      ClientStorageService.addComment(taskId, currentUser.name, content);
    }

    showToast('Comment posted', 'success');
    await refreshData();
  };

  // Reset DB
  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
    } catch {
      ClientStorageService.resetData();
    }

    showToast('Database reset to initial sample tasks', 'success');
    await refreshData();
  };

  const [demoPreset, setDemoPreset] = useState<'one-each-member' | 'one-each-status' | 'one-each-both' | 'full'>('one-each-member');

  const handleSetDemoPreset = async (preset: 'one-each-member' | 'one-each-status' | 'one-each-both' | 'full') => {
    try {
      const res = await fetch('/api/demo-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      if (!res.ok) throw new Error('Failed to set demo preset');
    } catch {
      ClientStorageService.setDemoPreset(preset);
    }

    setDemoPreset(preset);
    showToast(`Loaded ${preset.replace(/-/g, ' ')} demo dataset`, 'success');
    await refreshData();
  };

  // Email Notification Handlers
  const openEmailModal = () => setIsEmailModalOpen(true);
  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setSelectedEmailPreview(null);
  };
  const previewEmail = (email: EmailLog) => setSelectedEmailPreview(email);
  const closeEmailPreview = () => setSelectedEmailPreview(null);

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch('/api/emails?limit=30');
      if (res.ok) {
        setEmailLogs(await res.json());
        return;
      }
    } catch {}
    setEmailLogs(ClientStorageService.getEmailLogs(30));
  };

  const handleCheckOverdueEmails = async (force: boolean = false) => {
    try {
      const res = await fetch('/api/emails/check-overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      if (!res.ok) throw new Error('Overdue email scan failed');
      const data = await res.json();
      if (data.count > 0) {
        showToast(`Intimated ${data.count} overdue action item(s) via email`, 'info');
      } else {
        showToast('No new overdue action items require email intimation', 'info');
      }
    } catch {
      const dispatches = ClientStorageService.checkAndSendOverdueAlerts(force);
      if (dispatches.length > 0) {
        showToast(`Intimated ${dispatches.length} overdue action item(s) via email`, 'info');
      } else {
        showToast('No new overdue action items require email intimation', 'info');
      }
    }
    await fetchEmailLogs();
  };

  const handleSendTaskOverdueEmail = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/send-overdue-email`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to send overdue email');
    } catch {
      ClientStorageService.sendTaskOverdueEmail(taskId);
    }
    showToast(`Overdue email alert dispatched for task ${taskId}`, 'success');
    await fetchEmailLogs();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        teamMembers: PREDEFINED_MEMBERS,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        tasks,
        stats,
        activityLogs,
        loading,
        refreshData,
        filterOptions,
        setFilterOptions,
        resetFilters,
        isTaskModalOpen,
        editingTask,
        openCreateTaskModal,
        openEditTaskModal,
        closeTaskModal,
        selectedTaskDetail,
        openTaskDetail,
        closeTaskDetail,
        taskToDelete,
        openDeleteModal,
        closeDeleteModal,
        handleSaveTask,
        handleDeleteTask,
        handleQuickStatusChange,
        handleAddComment,
        handleResetDatabase,
        demoPreset,
        handleSetDemoPreset,
        emailLogs,
        isEmailModalOpen,
        selectedEmailPreview,
        openEmailModal,
        closeEmailModal,
        previewEmail,
        closeEmailPreview,
        handleCheckOverdueEmails,
        handleSendTaskOverdueEmail,
        fetchEmailLogs,
        toasts,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
