// ============================================
// Dashboard Page - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { fetchBuildings } from '../store/slices/buildingsSlice';
import { fetchUnits } from '../store/slices/unitsSlice';
import { fetchTenancies } from '../store/slices/tenanciesSlice';
import { fetchUsers } from '../store/slices/usersSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { buildings } = useSelector((state) => state.buildings);
  const { units } = useSelector((state) => state.units);
  const { tenancies } = useSelector((state) => state.tenancies);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
    // Fetch data based on user role
    if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
      dispatch(fetchBuildings());
      dispatch(fetchUnits());
    }
    dispatch(fetchTenancies());
    if (user?.role === 'ADMIN') {
      dispatch(fetchUsers());
    }
  }, [dispatch, user]);

  const statsCards = [
    {
      title: 'Total Buildings',
      value: buildings.length || 0,
      icon: 'bi-building',
      color: 'primary',
      link: '/buildings',
      roles: ['ADMIN', 'OWNER'],
    },
    {
      title: 'Total Units',
      value: units.length || 0,
      icon: 'bi-door-open',
      color: 'secondary',
      link: '/units',
      roles: ['ADMIN', 'OWNER'],
    },
    {
      title: 'Active Tenancies',
      value: tenancies.filter(t => t.isActive).length || 0,
      icon: 'bi-file-earmark-text',
      color: 'success',
      link: '/tenancies',
      roles: ['ADMIN', 'OWNER', 'TENANT'],
    },
    {
      title: 'Total Users',
      value: users.length || 0,
      icon: 'bi-people',
      color: 'info',
      link: '/users',
      roles: ['ADMIN'],
    },
  ];

  const filteredStats = statsCards.filter(stat => stat.roles.includes(user?.role));

  const recentTenancies = tenancies.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'EXPIRED': return 'secondary';
      case 'TERMINATED': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Here's what's happening.</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {filteredStats.map((stat, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '14px' }}>{stat.title}</p>
                  <h3 className="mb-0 fw-bold" style={{ color: 'var(--navy-dark)' }}>{stat.value}</h3>
                </div>
                <div className={`icon ${stat.color === 'primary' ? 'primary' : 'secondary'}`}>
                  <i className={`bi ${stat.icon} fs-4`}></i>
                </div>
              </div>
              <Button 
                variant="link" 
                className="p-0 mt-3 text-decoration-none"
                style={{ color: 'var(--bs-primary)' }}
                onClick={() => navigate(stat.link)}
              >
                View all <i className="bi bi-arrow-right"></i>
              </Button>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Recent Tenancies */}
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>Recent Tenancies</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/tenancies')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Unit</th>
                    <th>Rent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTenancies.length > 0 ? (
                    recentTenancies.map((tenancy) => (
                      <tr key={tenancy.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-primary me-2" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {tenancy.tenant?.firstName?.charAt(0) || 'T'}
                            </div>
                            <span>{tenancy.tenant?.firstName} {tenancy.tenant?.lastName}</span>
                          </div>
                        </td>
                        <td>{tenancy.unit?.unitNumber}</td>
                        <td>{tenancy.monthlyRent?.toLocaleString()} EGP</td>
                        <td>
                          <span className={`badge bg-${tenancy.isActive ? 'success' : 'secondary'}`}>
                            {tenancy.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No tenancies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {user?.role === 'ADMIN' && (
                  <>
                    <Button 
                      variant="primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/users/new')}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add New User
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/buildings/new')}
                    >
                      <i className="bi bi-building-add me-2"></i>
                      Add New Building
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/units/new')}
                    >
                      <i className="bi bi-plus-square me-2"></i>
                      Add New Unit
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/tenancies/new')}
                    >
                      <i className="bi bi-file-earmark-plus me-2"></i>
                      Create Tenancy
                    </Button>
                  </>
                )}
                {user?.role === 'OWNER' && (
                  <>
                    <Button 
                      variant="primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/buildings')}
                    >
                      <i className="bi bi-building me-2"></i>
                      View My Buildings
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/units')}
                    >
                      <i className="bi bi-door-open me-2"></i>
                      View My Units
                    </Button>
                  </>
                )}
                {user?.role === 'TENANT' && (
                  <>
                    <Button 
                      variant="primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/tenancies')}
                    >
                      <i className="bi bi-file-earmark-text me-2"></i>
                      My Tenancy
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/profile')}
                    >
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
