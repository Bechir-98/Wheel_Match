import React from 'react';
import Sidebar from '../Sidebar.jsx';
import '../../styles/sidebar.css';

/**
 * Shared layout: sidebar + scrollable main (matches patient/clinician/vendor dashboards).
 */
export default function DashboardShell({ role, children }) {
  return (
    <div className="dashboard-wrapper">
      <Sidebar role={role} />
      <div className="main-content">{children}</div>
    </div>
  );
}
