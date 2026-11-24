import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Priority, TaskStatus, AssigneeOption, TaskAttachment } from '../types/index.ts';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    editingTask,
    closeTaskModal,
    handleSaveTask,
    currentUser,
    tasks
  } = useApp();

  const [id, setId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assignedBy, setAssignedBy] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<AssigneeOption>('Rahkesh Kanna H');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [category, setCategory] = useState<string>('Engineering');
  const [remarks, setRemarks] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch next ID or load existing task
  useEffect(() => {
    if (!isTaskModalOpen) return;

    if (editingTask) {
      setId(editingTask.id);
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setAssignedBy(editingTask.assigned_by);
      setAssignedTo(editingTask.assigned_to);
      setPriority(editingTask.priority);
      setStartDate(editingTask.start_date);
      setDueDate(editingTask.due_date);
      setStatus(editingTask.status);
      setCategory(editingTask.category);
      setRemarks(editingTask.remarks || '');
      setAttachments(editingTask.attachments || []);
    } else {
      // New task
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      setTitle('');
      setDescription('');
      setAssignedBy(currentUser.name);
      setAssignedTo(currentUser.id === 'rahkesh' ? 'Fraaz Ahmed K' : 'Rahkesh Kanna H');
      setPriority('Medium');
      setStartDate(today);
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setStatus('Not Started');
      setCategory('Engineering');
      setRemarks('');
      setAttachments([]);

      fetch('/api/tasks/next-id')
        .then(r => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(d => {
          if (d.nextId) setId(d.nextId);
        })
        .catch(() => {
          let max = 1000;
          tasks.forEach(t => {
            const m = t.id.match(/ACT-(\d+)/);
            if (m) {
              const n = parseInt(m[1], 10);
              if (n > max) max = n;
            }
          });
          setId(`ACT-${max + 1}`);
        });
    }

    setErrors({});
  }, [isTaskModalOpen, editingTask, currentUser]);

  if (!isTaskModalOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Task title is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (startDate && dueDate && dueDate < startDate) {
      newErrors.dueDate = 'Due date cannot be before start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await handleSaveTask({
      id,
      title: title.trim(),
      description: description.trim(),
      assigned_by: assignedBy,
      assigned_to: assignedTo,
      priority,
      start_date: startDate,
      due_date: dueDate,
      status,
      category,
      remarks: remarks.trim(),
      attachments
    });

    setIsSubmitting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newAtt: TaskAttachment = {
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setAttachments(prev => [...prev, newAtt]);
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  return (
    <div className="modal-backdrop" onClick={closeTaskModal}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 className="modal-title">{editingTask ? 'Edit Action Item' : 'Add New Action Item'}</h2>
            <span className="task-id-badge">{id || '...'}</span>
          </div>
          <button className="sidebar-collapse-btn" onClick={closeTaskModal}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Title */}
          <div className="form-group form-full">
            <label className="form-label form-label-required">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement Webhook notification pipeline"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            {errors.title && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={12} /> {errors.title}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group form-full">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              placeholder="Provide clear technical context, acceptance criteria, or key dependencies..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-grid">
            {/* Assigned By */}
            <div className="form-group">
              <label className="form-label">Assigned By</label>
              <select
                className="form-select"
                value={assignedBy}
                onChange={e => setAssignedBy(e.target.value)}
              >
                <option value="Rahkesh Kanna H">Rahkesh Kanna H</option>
                <option value="Fraaz Ahmed K">Fraaz Ahmed K</option>
              </select>
            </div>

            {/* Assigned To */}
            <div className="form-group">
              <label className="form-label form-label-required">Assigned To</label>
              <select
                className="form-select"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value as AssigneeOption)}
              >
                <option value="Rahkesh Kanna H">Rahkesh Kanna H</option>
                <option value="Fraaz Ahmed K">Fraaz Ahmed K</option>
                <option value="Both">Both (Shared Collaboration)</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label form-label-required">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              {errors.dueDate && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} /> {errors.dueDate}
                </span>
              )}
            </div>

            {/* Category */}
            <div className="form-group form-full">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Design">Design</option>
                <option value="Security">Security</option>
                <option value="DevOps">DevOps</option>
                <option value="Client / Business">Client / Business</option>
                <option value="QA & Testing">QA & Testing</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="form-group form-full">
              <label className="form-label">Additional Remarks</label>
              <textarea
                className="form-textarea"
                placeholder="Optional notes, blockers, or reference links..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                rows={2}
              />
            </div>

            {/* Attachments Upload */}
            <div className="form-group form-full">
              <label className="form-label">Attachments</label>
              <label className="file-upload-box" style={{ display: 'block' }}>
                <Upload size={22} style={{ color: 'var(--text-muted)', margin: '0 auto 0.4rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click or drop files to attach</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF, Images, DOCX, ZIP up to 10MB</div>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>

              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {attachments.map(att => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <FileText size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {att.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          ({(att.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ margin: '-1.5rem -1.5rem -1.5rem -1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeTaskModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingTask ? 'Update Action Item' : 'Create Action Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
