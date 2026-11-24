import React from 'react';
import {
  BarChart3,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { ProductivityChart } from '../components/Charts/ProductivityChart.tsx';
import { WorkloadChart } from '../components/Charts/WorkloadChart.tsx';

export const AnalyticsPage: React.FC = () => {
  const { tasks, stats, showToast } = useApp();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const overdue = tasks.filter(t => t.status !== 'Completed' && t.due_date < new Date().toISOString().split('T')[0]).length;
  const onTimeCompleted = tasks.filter(t => t.status === 'Completed' && t.completed_at && t.completed_at.split('T')[0] <= t.due_date).length;

  const slaRate = completed > 0 ? Math.round((onTimeCompleted / completed) * 100) : 100;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  tasks.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Assigned To', 'Assigned By', 'Priority', 'Start Date', 'Due Date', 'Status', 'Category', 'Remarks'];
    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.assigned_to}"`,
      `"${t.assigned_by}"`,
      t.priority,
      t.start_date,
      t.due_date,
      t.status,
      t.category,
      `"${(t.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `action_items_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported action items to CSV', 'success');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `action_items_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported action items to JSON backup', 'success');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      {/* Top Banner with Export Actions */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Productivity & SLA Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Executive performance reports and data exports for Rahkesh & Fraaz</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
            <FileCode size={16} /> Export JSON
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          label="SLA On-Time Completion Rate"
          value={`${slaRate}%`}
          icon={CheckCircle2}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="#10b981"
          tagText={slaRate >= 85 ? 'Healthy SLA' : 'Needs Optimization'}
          tagType={slaRate >= 85 ? 'success' : 'warning'}
        />
        <StatCard
          label="Total Velocity (Delivered)"
          value={`${completed} Tasks`}
          icon={BarChart3}
          iconBg="rgba(79, 70, 229, 0.12)"
          iconColor="#4f46e5"
          subText={`${total > 0 ? Math.round((completed / total) * 100) : 0}% delivery rate`}
        />
        <StatCard
          label="Active Overdue Risk"
          value={`${overdue} Tasks`}
          icon={AlertTriangle}
          iconBg="rgba(225, 29, 72, 0.12)"
          iconColor="#e11d48"
          tagText={overdue > 0 ? 'Action Needed' : 'Zero Breaches'}
          tagType={overdue > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Total Managed Tasks"
          value={total}
          icon={Clock}
          iconBg="rgba(2, 132, 199, 0.12)"
          iconColor="#0284c7"
          subText="Across all functional categories"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Weekly Delivery Velocity</h3>
              <p className="chart-subtitle">7-Day task throughput comparison</p>
            </div>
          </div>
          <div className="chart-body">
            <ProductivityChart data={stats?.weeklyProductivity ?? []} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Workload Distribution Balance</h3>
              <p className="chart-subtitle">Direct vs Shared task allocation</p>
            </div>
          </div>
          <div className="chart-body">
            <WorkloadChart
              rahkeshCount={stats?.workload.rahkeshOnly ?? 0}
              fraazCount={stats?.workload.fraazOnly ?? 0}
              bothCount={stats?.workload.both ?? 0}
              total={stats?.total ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="table-wrapper">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Functional Category Distribution</h3>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Tasks</th>
                <th>In Progress</th>
                <th>Completed</th>
                <th>Share of Workload</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const catTasks = tasks.filter(t => t.category === cat);
                const catCompleted = catTasks.filter(t => t.status === 'Completed').length;
                const catInProgress = catTasks.filter(t => t.status === 'In Progress').length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <tr key={cat}>
                    <td>
                      <span className="category-tag" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                        {cat}
                      </span>
                    </td>
                    <td><strong>{count}</strong></td>
                    <td>{catInProgress}</td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>{catCompleted}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: 140 }}>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: '#4f46e5' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
