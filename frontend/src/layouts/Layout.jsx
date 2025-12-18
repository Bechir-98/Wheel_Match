import { useLocation } from 'react-router-dom';
import Navb from './nav.jsx';
import Footer from './footer.jsx';

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navb />
      <main className={`flex-1 ${isDashboard ? 'dashboard-layout' : 'main-layout'}`}>
        <div className="container mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
