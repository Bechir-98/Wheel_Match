import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLE_HOME = {
  patient: '/patient-dashboard',
  clinician: '/clinician-dashboard',
  vendor: '/vendor-dashboard',
};

export default function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const dest = ROLE_HOME[user?.userType] || '/';
    return <Navigate to={dest} replace />;
  }

  return children;
}
