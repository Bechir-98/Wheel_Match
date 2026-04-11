import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/dashboard/DashboardShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/DashboardPages.css';

const Messages = () => {
  const { user } = useAuth();
  const t = user?.userType;

  const dashboardLink =
    t === 'patient' ? '/patient-dashboard' : t === 'clinician' ? '/clinician-dashboard' : t === 'vendor' ? '/vendor-dashboard' : '/';

  const body = (
    <div className="dashboard-page">
      <h1>Messages</h1>
      <Alert variant="light" className="border message-list">
        <p className="mb-2">
          You do not have any messages yet. When other roles contact you through Wheel Match, threads will appear here.
        </p>
        <Button variant="primary" size="sm" as={Link} to={dashboardLink}>
          Back to dashboard
        </Button>
      </Alert>
    </div>
  );

  if (t === 'patient' || t === 'clinician' || t === 'vendor') {
    return <DashboardShell role={t}>{body}</DashboardShell>;
  }

  return body;
};

export default Messages;
