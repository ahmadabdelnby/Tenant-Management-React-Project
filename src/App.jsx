// ============================================
// App.jsx - Main Application with Routing
// ============================================

import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe, logout } from './store/slices/authSlice';
import { MainLayout } from './components/layout';
import { Spinner } from './components/common';
import {
  Login,
  Dashboard,
  Profile,
  UsersList,
  UserForm,
  BuildingsList,
  BuildingForm,
  BuildingDetails,
  UnitsList,
  UnitForm,
  TenanciesList,
  TenancyForm,
  TenancyDetail,
  MaintenanceList,
  MaintenanceForm,
  MaintenanceDetail,
  PaymentsList,
  BuildingPaymentSummary,
  PaymentResult,
} from './pages';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" style={{ color: 'var(--navy-dark)' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // Check authentication on app load
  useEffect(() => {
    if (token) {
      dispatch(getMe())
        .unwrap()
        .catch(() => {
          // Token expired or invalid
          dispatch(logout());
          navigate('/login');
        });
    }
  }, [dispatch, token, navigate]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Users - Admin Only */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserForm />
              </ProtectedRoute>
            }
          />

          {/* Buildings - Admin, Owner & Tenant */}
          <Route
            path="buildings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']}>
                <BuildingsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="buildings/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']}>
                <BuildingDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="buildings/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <BuildingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="buildings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <BuildingForm />
              </ProtectedRoute>
            }
          />

          {/* Units - Admin, Owner & Tenant */}
          <Route
            path="units"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']}>
                <UnitsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="units/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UnitForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="units/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UnitForm />
              </ProtectedRoute>
            }
          />

          {/* Tenancies - All authenticated users */}
          <Route path="tenancies" element={<TenanciesList />} />
          <Route path="tenancies/:id" element={<TenancyDetail />} />
          <Route
            path="tenancies/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <TenancyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="tenancies/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <TenancyForm />
              </ProtectedRoute>
            }
          />

          {/* Maintenance - All authenticated users */}
          <Route path="maintenance" element={<MaintenanceList />} />
          <Route path="maintenance/:id" element={<MaintenanceDetail />} />
          <Route
            path="maintenance/new"
            element={
              <ProtectedRoute allowedRoles={['TENANT']}>
                <MaintenanceForm />
              </ProtectedRoute>
            }
          />

          {/* Payments - Admin, Owner, Tenant */}
          <Route
            path="payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'TENANT']}>
                <PaymentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments/building-summary"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                <BuildingPaymentSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments/result"
            element={<PaymentResult />}
          />
        </Route>

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--beige-light)' }}>
              <div className="text-center">
                <h1 className="display-1 fw-bold" style={{ color: 'var(--navy-light)' }}>404</h1>
                <p className="fs-4 mt-3" style={{ color: 'var(--navy-dark)' }}>Page not found</p>
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="btn btn-primary mt-3"
                >
                  Go Home
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
