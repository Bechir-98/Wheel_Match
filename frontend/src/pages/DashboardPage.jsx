import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import ClinicianDashboard from '../components/dashboard/ClinicianDashboard';
import VendorDashboard from '../components/dashboard/VendorDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case '1':
        return <PatientDashboard />;
      case '2':
        return <ClinicianDashboard />;
      case '4':
        return <VendorDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  return renderDashboard();
};

export default DashboardPage;