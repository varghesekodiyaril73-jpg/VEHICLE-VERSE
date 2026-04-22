import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyVehicles from './pages/customer/MyVehicles';
import ViewMechanics from './pages/customer/ViewMechanics';
import MechanicProfile from './pages/customer/MechanicProfile';
import BookService from './pages/customer/BookService';

// Customer Booking Pages
import EmergencyBookingFlow from './pages/customer/EmergencyBookingFlow';
import RegularBookingFlow from './pages/customer/RegularBookingFlow';
import MyBookings from './pages/customer/MyBookings';
import CustomerProfile from './pages/customer/CustomerProfile';

// Mechanic Pages
import JobsAvailable from './pages/mechanic/JobsAvailable';
import MechanicProfilePage from './pages/mechanic/MechanicProfilePage';

// Admin Pages
import MechanicApproval from './pages/admin/MechanicApproval';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCustomers from './pages/admin/AdminCustomers';

function App() {
  return (
    <AuthProvider>
      <div className="liquid-bg"></div>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mechanics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MechanicApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Mechanic Routes */}
          <Route
            path="/mechanic"
            element={
              <ProtectedRoute allowedRoles={['MECHANIC']}>
                <MechanicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/jobs"
            element={
              <ProtectedRoute allowedRoles={['MECHANIC']}>
                <JobsAvailable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/profile"
            element={
              <ProtectedRoute allowedRoles={['MECHANIC']}>
                <MechanicProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/*"
            element={
              <ProtectedRoute allowedRoles={['MECHANIC']}>
                <MechanicDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/vehicles"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <MyVehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/mechanics"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <ViewMechanics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/mechanics/:id"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <MechanicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/services"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <BookService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/book/emergency"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <EmergencyBookingFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/book/regular"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <RegularBookingFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

