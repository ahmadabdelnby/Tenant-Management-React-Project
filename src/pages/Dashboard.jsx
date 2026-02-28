// ============================================
// Dashboard Page - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { fetchBuildings } from '../store/slices/buildingsSlice';
import { fetchUnits } from '../store/slices/unitsSlice';
import { fetchTenancies } from '../store/slices/tenanciesSlice';
import { fetchUsers } from '../store/slices/usersSlice';

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { buildings } = useSelector((state) => state.buildings);
  const { units } = useSelector((state) => state.units);
  const { tenancies } = useSelector((state) => state.tenancies);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
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
      titleKey: 'dashboard.total_buildings',
      value: buildings.length || 0,
      icon: 'bi-building',
      color: 'primary',
      link: '/buildings',
      roles: ['ADMIN', 'OWNER'],
    },
    {
      titleKey: 'dashboard.total_units',
      value: units.length || 0,
      icon: 'bi-door-open',
      color: 'secondary',
      link: '/units',
      roles: ['ADMIN', 'OWNER'],
    },
    {
      titleKey: 'dashboard.active_tenancies',
      value: tenancies.filter(tn => tn.isActive).length || 0,
      icon: 'bi-file-earmark-text',
      color: 'success',
      link: '/tenancies',
      roles: ['ADMIN', 'OWNER', 'TENANT'],
    },
    {
      titleKey: 'dashboard.total_users',
      value: users.length || 0,
      icon: 'bi-people',
      color: 'info',
      link: '/users',
      roles: ['ADMIN'],
    },
  ];

  const filteredStats = statsCards.filter(stat => stat.roles.includes(user?.role));

  const recentTenancies = tenancies.slice(0, 5);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.welcome', { name: user?.firstName })}</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {filteredStats.map((stat, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '14px' }}>{t(stat.titleKey)}</p>
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
                {t('dashboard.view_all')} <i className="bi bi-arrow-right"></i>
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
              <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>{t('dashboard.recent_tenancies')}</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/tenancies')}
              >
                {t('dashboard.view_all')}
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>{t('dashboard.tenant')}</th>
                    <th>{t('dashboard.unit')}</th>
                    <th>{t('tenancies.rent_col')}</th>
                    <th>{t('dashboard.status')}</th>
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
                        <td>{tenancy.monthlyRent?.toLocaleString()} {t('common.kwd')}</td>
                        <td>
                          <span className={`badge bg-${tenancy.isActive ? 'success' : 'secondary'}`}>
                            {tenancy.isActive ? t('users.active') : t('users.inactive')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        {t('dashboard.no_recent_tenancies')}
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
              <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>{t('dashboard.quick_actions')}</h5>
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
                      {t('users.add_user')}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/buildings/new')}
                    >
                      <i className="bi bi-building-add me-2"></i>
                      {t('buildings.add_building')}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/units/new')}
                    >
                      <i className="bi bi-plus-square me-2"></i>
                      {t('units.add_unit')}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/tenancies/new')}
                    >
                      <i className="bi bi-file-earmark-plus me-2"></i>
                      {t('tenancies.add_tenancy')}
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
                      {t('sidebar.buildings')}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/units')}
                    >
                      <i className="bi bi-door-open me-2"></i>
                      {t('sidebar.units')}
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
                      {t('sidebar.tenancies')}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => navigate('/profile')}
                    >
                      <i className="bi bi-person me-2"></i>
                      {t('header.my_profile')}
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
