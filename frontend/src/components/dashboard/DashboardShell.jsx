import React from 'react';
import Sidebar from '../Sidebar.jsx';

/**
 * Shared layout: sidebar + scrollable main (matches patient/vendor dashboards).
 */
export default function DashboardShell({ role, children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar role={role} />
      <div className="min-w-0 flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
