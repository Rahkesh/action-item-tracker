import React from 'react';

interface StatusDistributionChartProps {
  distribution: {
    notStarted: number;
    inProgress: number;
    onHold: number;
    completed: number;
  };
  total: number;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  distribution,
  total
}) => {
  const safeTotal = total > 0 ? total : 1;
  const segments = [
    { label: 'Completed', count: distribution.completed, color: '#10b981' },
    { label: 'In Progress', count: distribution.inProgress, color: '#3b82f6' },
    { label: 'On Hold', count: distribution.onHold, color: '#f97316' },
    { label: 'Not Started', count: distribution.notStarted, color: '#64748b' }
  ];

  // SVG Donut calculation
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* Donut SVG */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--bg-muted)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {segments.map((seg, idx) => {
            if (seg.count === 0) return null;
            const pct = seg.count / safeTotal;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += pct;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                fill="transparent"
                style={{ transition: 'all 0.5s ease' }}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: 140 }}>
        {segments.map((seg, idx) => {
          const pct = Math.round((seg.count / safeTotal) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: seg.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {seg.count} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
