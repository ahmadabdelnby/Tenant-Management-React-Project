// ============================================
// Main Layout Component - Bootstrap Version
// ============================================

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer, Toast } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../../store/slices/uiSlice';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getToastVariant = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={!!notification} 
          onClose={() => dispatch(clearNotification())}
          delay={5000}
          autohide
          bg={notification ? getToastVariant(notification.type) : 'info'}
        >
          <Toast.Header>
            <i className={`bi ${notification?.type === 'success' ? 'bi-check-circle' : notification?.type === 'error' ? 'bi-x-circle' : 'bi-info-circle'} me-2`}></i>
            <strong className="me-auto">
              {notification?.type === 'success' ? 'Success' : notification?.type === 'error' ? 'Error' : 'Info'}
            </strong>
          </Toast.Header>
          <Toast.Body className={notification?.type === 'success' || notification?.type === 'danger' ? 'text-white' : ''}>
            {notification?.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MainLayout;
