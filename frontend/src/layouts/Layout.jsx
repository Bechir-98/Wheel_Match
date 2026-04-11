import { useLocation } from 'react-router-dom';
import Navb from './nav';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navb />
      <main className={`flex-grow-1 ${isDashboard ? 'dashboard-layout' : 'main-layout'}`}>
        <div className="container-fluid py-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;