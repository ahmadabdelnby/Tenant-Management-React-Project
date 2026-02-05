// ============================================
// Header Component - Bootstrap Version
// ============================================

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

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
        {/* Notifications */}
        <button className="btn btn-link text-dark position-relative p-0">
          <i className="bi bi-bell fs-5"></i>
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{ backgroundColor: 'var(--bs-secondary)', color: 'var(--navy-dark)', fontSize: '10px' }}
          >
            3
          </span>
        </button>

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
              My Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/profile')}>
              <i className="bi bi-gear me-2"></i>
              Settings
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate('/login')} className="text-danger">
              <i className="bi bi-box-arrow-left me-2"></i>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
