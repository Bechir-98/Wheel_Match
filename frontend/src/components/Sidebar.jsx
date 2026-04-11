import { NavLink, useNavigate } from 'react-router-dom';
import "../styles/sidebar.css";
import { Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';

function Sidebar({ role, user: userProp }) {
  const navigate = useNavigate();
  const { user: sessionUser, logout } = useAuth();
  const user = userProp ?? sessionUser;
  let links = [];

  if (role === 'patient') {
    links = [
      { to: '/patient-dashboard', label: '📊 Dashboard' },
      { to: '/profile', label: '👤 My Profile' },
      { to: '/choisis', label: '🦽 My wheelchairs' },
      { to: '/record', label: '📋 Medical Records' },
      { to: '/messages', label: '💬 Messages' },
      { to: '/settings', label: '⚙️ Settings' },
    ];
  } else if (role === 'vendor') {
    links = [
      { to: '/vendor-dashboard', label: '📊 Dashboard' },
      { to: '/profile', label: '👤 My Profile' },
      { to: '/products', label: '📦 Products' },
      { to: '/settings', label: '⚙️ Settings' },
    ];
  } else if (role === 'clinician') {
    links = [
      { to: '/clinician-dashboard', label: '📊 Dashboard' },
      { to: '/profile', label: '👤 My Profile' },
      { to: '/patients', label: '👥 Patients' },
      { to: '/settings', label: '⚙️ Settings' },
    ];
  }

  return (
    <>

      <div className="sidebar">
        <div className="user-profile">
          <div className="avatar-container">
            <div className="user-avatar">{(user?.email || user?.name || '?').charAt(0).toUpperCase()}</div>
          </div>
          <h5>{(user?.displayName && String(user.displayName).trim()) || user?.email?.split('@')[0] || user?.name || 'User'}</h5>
          <p className="user-type">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
          <Button
            variant="outline-primary"
            size="sm"
            className="logout-btn"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="fa fa-sign-out"></i> Logout
          </Button>
        </div>
     
      <div className="sidebar-nav">
        <ul className="nav flex-column">
          {links.map((link, index) => (
            <li className="nav-item" key={index}>
              <NavLink to={link.to} className="nav-link">
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </>
  );
}

export default Sidebar;
