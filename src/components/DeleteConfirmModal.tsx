import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const DeleteConfirmModal: React.FC = () => {
  const { taskToDelete, closeDeleteModal, handleDeleteTask } = useApp();

  if (!taskToDelete) return null;

  const handleConfirm = async () => {
    await handleDeleteTask(taskToDelete.id);
  };

  return (
    <div className="modal-backdrop" onClick={closeDeleteModal}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444' }}>
            <AlertTriangle size={20} />
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Delete Action Item</h3>
          </div>
          <button className="sidebar-collapse-btn" onClick={closeDeleteModal}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem', gap: '0.75rem' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Are you sure you want to delete action item <strong>{taskToDelete.id}</strong>?
          </p>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            "{taskToDelete.title}"
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            This action cannot be undone. All comments, attachments, and update history for this action item will be permanently removed.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeDeleteModal}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm}>
            <Trash2 size={16} /> Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};
