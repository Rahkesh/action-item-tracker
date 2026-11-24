import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        const iconColor =
          toast.type === 'success'
            ? '#10b981'
            : toast.type === 'error'
            ? '#ef4444'
            : '#4f46e5';

        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
