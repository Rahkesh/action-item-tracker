import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  tagText?: string;
  tagType?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
  subText?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconBg = 'var(--primary-light)',
  iconColor = 'var(--primary)',
  tagText,
  tagType = 'neutral',
  subText,
  onClick
}) => {
  const getTagStyle = () => {
    switch (tagType) {
      case 'danger':
        return { backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)' };
      case 'warning':
        return { backgroundColor: 'var(--priority-high-bg)', color: 'var(--priority-high-text)' };
      case 'success':
        return { backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' };
      case 'info':
        return { backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' };
      default:
        return { backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrap" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={20} />
        </div>
      </div>

      <div className="stat-value">{value}</div>

      {(tagText || subText) && (
        <div className="stat-footer">
          {tagText && (
            <span className="stat-tag" style={getTagStyle()}>
              {tagText}
            </span>
          )}
          {subText && <span>{subText}</span>}
        </div>
      )}
    </div>
  );
};
