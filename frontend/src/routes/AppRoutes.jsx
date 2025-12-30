import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/home.jsx';
import Sign from '../pages/sign.jsx';
import Log from '../pages/log.jsx';
import Navb from '../layouts/nav.jsx';
import Footer from '../layouts/footer.jsx';
import FAQ from '../pages/Faq.jsx';
import About from '../pages/About.jsx';

import VendorDashboard from '../pages/VendorDashboard.jsx';
import PatientDashboard from '../pages/Patient_Dashboard.jsx';

import WheelchairDetails from '../pages/WheelchairsPage.jsx';
import WheelchairDetail from '../pages/WheelchairDetailPage.jsx';

import MyProfile from '../pages/dashboard/MyProfile.jsx';
import Messages from '../pages/dashboard/Messages.jsx';
import Settings from '../pages/dashboard/Settings.jsx';
import ProductsPage from '../pages/products.jsx';
import ChoisisPage from '../pages/choisis.jsx';

import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import GuestRoute from '../components/auth/GuestRoute.jsx';

function RouteR() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navb />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wheelchairs" element={<WheelchairDetails />} />
            <Route path="/wheelchairs/:id" element={<WheelchairDetail />} />

            <Route
              path="/sign"
              element={
                <GuestRoute>
                  <Sign />
                </GuestRoute>
              }
            />
            <Route
              path="/log"
              element={
                <GuestRoute>
                  <Log />
                </GuestRoute>
              }
            />

            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-dashboard"
              element={
                <ProtectedRoute>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/choisis"
              element={
                <ProtectedRoute>
                  <ChoisisPage />
                </ProtectedRoute>
              }
            />

            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default RouteR;