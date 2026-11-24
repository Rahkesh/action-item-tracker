import React from 'react';

interface ProductivityChartProps {
  data: Array<{
    date: string;
    day: string;
    created: number;
    completed: number;
  }>;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No weekly data available</div>;
  }

  // Find max value to scale chart
  const maxVal = Math.max(3, ...data.map(d => Math.max(d.created, d.completed)));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#4f46e5' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Created</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, gap: '0.75rem', padding: '0 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {data.map((item, idx) => {
          const createdHeight = Math.max(4, (item.created / maxVal) * 120);
          const completedHeight = Math.max(4, (item.completed / maxVal) * 120);

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%' }}>
                {/* Created bar */}
                <div
                  title={`${item.day}: ${item.created} created`}
                  style={{
                    width: 14,
                    height: `${createdHeight}px`,
                    backgroundColor: '#4f46e5',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                />
                {/* Completed bar */}
                <div
                  title={`${item.day}: ${item.completed} completed`}
                  style={{
                    width: 14,
                    height: `${completedHeight}px`,
                    backgroundColor: '#10b981',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
