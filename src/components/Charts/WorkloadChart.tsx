import React from 'react';

interface WorkloadChartProps {
  rahkeshCount: number;
  fraazCount: number;
  bothCount: number;
  total: number;
}

export const WorkloadChart: React.FC<WorkloadChartProps> = ({
  rahkeshCount,
  fraazCount,
  bothCount,
  total
}) => {
  const safeTotal = total > 0 ? total : 1;
  const rahkeshPct = Math.round((rahkeshCount / safeTotal) * 100);
  const fraazPct = Math.round((fraazCount / safeTotal) * 100);
  const bothPct = Math.round((bothCount / safeTotal) * 100);

  return (
    <div className="workload-bars-wrap">
      {/* Rahkesh */}
      <div className="workload-bar-item">
        <div className="workload-bar-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#4f46e5' }} />
            Rahkesh Kanna H
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>{rahkeshCount}</strong> tasks ({rahkeshPct}%)
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${rahkeshPct}%`, backgroundColor: '#4f46e5' }}
          />
        </div>
      </div>

      {/* Fraaz */}
      <div className="workload-bar-item">
        <div className="workload-bar-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#059669' }} />
            Fraaz Ahmed K
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>{fraazCount}</strong> tasks ({fraazPct}%)
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${fraazPct}%`, backgroundColor: '#059669' }}
          />
        </div>
      </div>

      {/* Both */}
      <div className="workload-bar-item">
        <div className="workload-bar-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#d97706' }} />
            Shared / Both Members
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>{bothCount}</strong> tasks ({bothPct}%)
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${bothPct}%`, backgroundColor: '#d97706' }}
          />
        </div>
      </div>
    </div>
  );
};
