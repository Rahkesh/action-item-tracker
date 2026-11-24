# Action Item Tracker Web Application

> A professional, modern, responsive team action item tracker built for **Rahkesh Kanna H** and **Fraaz Ahmed K** with real-time administration switching, SLA overdue detection, automated email intimations, and visual productivity analytics.

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-f38020?logo=cloudflare&logoColor=white)](https://action-item-tracker.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🌐 Live Application

- **Live URL**: [https://action-item-tracker.pages.dev](https://action-item-tracker.pages.dev)
- **Deployment URL**: [https://122f9d3c.action-item-tracker.pages.dev](https://122f9d3c.action-item-tracker.pages.dev)

---

## ✨ Key Features

### 1. Dedicated Team Roles & Dynamic Admin Switching
- **Predefined Team Members**:
  - **Rahkesh Kanna H** &bull; Co-Lead & Principal Architect (`rahkesh@team.local`) &bull; *Signature Indigo*
  - **Fraaz Ahmed K** &bull; Co-Lead & Operations Lead (`fraaz@team.local`) &bull; *Signature Emerald*
- **Instant Admin Theme Adaptation**: Switching the active administrator dynamically transforms the UI accent palette, glowing indicators, admin status badge, personalized perspective banner, and delegation workflows.

### 2. Automated Overdue Email Intimation Engine
- **SLA Breach Monitoring**: Real-time evaluation of deadlines (`status !== 'Completed' && due_date < today`).
- **Targeted Notification Routing**: Automatically intimates the particular assigned member (`rahkesh@team.local` or `fraaz@team.local`, or both for shared tasks).
- **Interactive Email Client Modal**: Review dispatched notifications with rich HTML preview, overdue day counter, and 1-click resend capabilities.

### 3. Action Item Workflow & Views
- **Unique Auto-Increment IDs**: `ACT-1001`, `ACT-1002`, etc.
- **Workflow Stepper**: Not Started &rarr; In Progress &rarr; On Hold &rarr; Completed (with optional completion remarks and timestamps).
- **Multiple Visual Perspectives**:
  - **Dashboard**: 7 core metrics + 4 visual charts (Completion Radial Gauge, Workload Distribution, Status Doughnut, and 7-day Velocity Trend).
  - **All Action Items**: Dual view with sortable Table and Kanban drag-and-drop workflow.
  - **My Action Items**: Personalized view filtered by active admin.
  - **Team Member Dashboard**: Workload balance and completion performance comparison.
  - **Calendar**: Interactive monthly deadline tracker.
  - **Reports & Analytics**: Visual charts with CSV export.
  - **Activity History**: Complete audit trail.
  - **Settings & Config**: Workspace management and data backups.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vanilla CSS Design System (Custom HSL tokens, Light/Dark theme)
- **Icons**: Lucide React
- **Local Backend**: Node.js, Express, native `node:sqlite` (`DatabaseSync`)
- **Cloud Hosting**: Cloudflare Pages (`*.pages.dev`) with SPA redirects (`_redirects`) and security headers (`_headers`)
- **Persistence**: Dual-engine architecture with SQLite for local dev and resilient `ClientStorageService` with `localStorage` sync for standalone cloud hosting

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (Node.js 22+ recommended for native `node:sqlite`)
- npm 9+

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Rahkesh/action-item-tracker.git
cd action-item-tracker

# Install dependencies
npm install

# Start the development server (runs frontend + API on port 5173)
npm run dev

# Open in your browser
# http://localhost:5173
```

### Production Build

```bash
# Compile TypeScript and bundle with Vite
npm run build

# Preview the production build locally
npm run preview
```

---

## 📄 License

MIT &bull; Created for **Rahkesh Kanna H** & **Fraaz Ahmed K**
