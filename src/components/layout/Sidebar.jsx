// ============================================
// Sidebar Component - Bootstrap Version
// ============================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Nav } from 'react-bootstrap';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      roles: ['ADMIN', 'OWNER', 'TENANT'],
    },
    {
      path: '/users',
      icon: 'bi-people',
      label: 'Users',
      roles: ['ADMIN'],
    },
    {
      path: '/buildings',
      icon: 'bi-building',
      label: 'Buildings',
      roles: ['ADMIN', 'OWNER'],
    },
    {
      path: '/units',
      icon: 'bi-door-open',
      label: 'Units',
      roles: ['ADMIN', 'OWNER'],
    },
    {
      path: '/tenancies',
      icon: 'bi-file-earmark-text',
      label: 'Tenancies',
      roles: ['ADMIN', 'OWNER', 'TENANT'],
    },
    {
      path: '/maintenance',
      icon: 'bi-tools',
      label: 'Maintenance',
      roles: ['ADMIN', 'OWNER', 'TENANT'],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.includes(user?.role)
  );

  return (
    <div className={`sidebar ${isOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Logo */}
      <div className="p-4 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: 'var(--bs-secondary)' 
            }}
          >
            <i className="bi bi-building" style={{ color: 'var(--navy-dark)', fontSize: '20px' }}></i>
          </div>
          <div>
            <h5 className="mb-0 text-white fw-bold">PropertyMS</h5>
            <small className="text-white-50">Management</small>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column py-3">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </NavLink>
        ))}
      </Nav>

      {/* Logout Button */}
      <div className="mt-auto p-3 border-top border-secondary" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <button
          onClick={handleLogout}
          className="nav-link text-danger w-100 text-start"
          style={{ background: 'none', border: 'none' }}
        >
          <i className="bi bi-box-arrow-left"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
