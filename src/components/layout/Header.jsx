// ============================================
// Header Component - Bootstrap Version
// ============================================

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="header d-flex align-items-center justify-content-between">
      {/* Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="btn btn-link text-dark p-0"
      >
        <i className="bi bi-list fs-4"></i>
      </button>

      {/* Right Side */}
      <div className="d-flex align-items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle 
            variant="link" 
            className="d-flex align-items-center text-decoration-none text-dark p-0"
            id="user-dropdown"
          >
            <div className="avatar avatar-primary me-2">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold" style={{ fontSize: '14px' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-muted" style={{ fontSize: '12px' }}>
                {user?.role}
              </div>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/profile')}>
              <i className="bi bi-person me-2"></i>
              {t('header.my_profile')}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <i className="bi bi-box-arrow-left me-2"></i>
              {t('header.logout')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
