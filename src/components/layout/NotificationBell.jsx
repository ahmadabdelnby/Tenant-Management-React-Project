// ============================================
// Notification Bell Component
// ============================================

import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../store/slices/notificationsSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const pollRef = useRef(null);

  // Fetch unread count periodically
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
      // Poll every 30 seconds
      pollRef.current = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [dispatch, isAuthenticated]);

  // Load notifications when dropdown opens
  const handleToggle = (nextShow) => {
    setIsOpen(nextShow);
    if (nextShow) {
      dispatch(fetchNotifications({ limit: 10 }));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }
    if (notification.link) {
      if (notification.link.startsWith('http')) {
        window.open(notification.link, '_blank');
      } else {
        navigate(notification.link);
      }
    } else {
      navigate('/payments');
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PAYMENT': return 'bi-check-circle-fill text-success';
      case 'PAYMENT_REMINDER': return 'bi-exclamation-circle-fill text-warning';
      case 'PAYMENT_LINK': return 'bi-link-45deg text-primary';
      case 'MAINTENANCE': return 'bi-tools text-info';
      default: return 'bi-bell-fill text-secondary';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dropdown align="end" show={isOpen} onToggle={handleToggle}>
      <Dropdown.Toggle
        variant="link"
        className="position-relative p-0 text-dark"
        id="notification-dropdown"
        style={{ border: 'none', boxShadow: 'none' }}
      >
        <i className="bi bi-bell fs-5"></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute"
            style={{ top: '-5px', right: '-8px', fontSize: '10px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          width: '360px',
          maxHeight: '450px',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2"
          style={{
            borderBottom: '1px solid #dee2e6',
            backgroundColor: 'var(--beige-light)',
          }}
        >
          <span className="fw-semibold" style={{ fontSize: '14px' }}>
            Notifications
            {unreadCount > 0 && (
              <Badge bg="primary" pill className="ms-2" style={{ fontSize: '10px' }}>
                {unreadCount}
              </Badge>
            )}
          </span>
          {unreadCount > 0 && (
            <button
              className="btn btn-link btn-sm text-primary p-0"
              onClick={handleMarkAllRead}
              style={{ fontSize: '12px' }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" variant="primary" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="d-flex align-items-start px-3 py-2"
                style={{
                  cursor: 'pointer',
                  backgroundColor: notification.isRead ? 'transparent' : 'rgba(26, 54, 93, 0.04)',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 184, 150, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.isRead ? 'transparent' : 'rgba(26, 54, 93, 0.04)'}
              >
                <div className="me-2 mt-1">
                  <i className={`bi ${getNotificationIcon(notification.type)}`} style={{ fontSize: '16px' }}></i>
                </div>
                <div className="flex-grow-1 min-width-0">
                  <div className="d-flex justify-content-between">
                    <span
                      className={`${!notification.isRead ? 'fw-semibold' : ''}`}
                      style={{ fontSize: '13px' }}
                    >
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span
                        className="rounded-circle bg-primary"
                        style={{ width: '8px', height: '8px', minWidth: '8px', marginTop: '6px', marginLeft: '8px' }}
                      ></span>
                    )}
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    {notification.message.length > 100
                      ? notification.message.substring(0, 100) + '...'
                      : notification.message}
                  </p>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    {formatTimeAgo(notification.createdAt)}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-bell-slash fs-3 d-block mb-2 opacity-50"></i>
              <small>No notifications yet</small>
            </div>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;
