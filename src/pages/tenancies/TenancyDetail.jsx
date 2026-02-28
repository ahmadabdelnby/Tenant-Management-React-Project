// ============================================
// Tenancy Detail Page - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { fetchTenancyById, clearCurrentTenancy } from '../../store/slices/tenanciesSlice';

const TenancyDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentTenancy, isLoading } = useSelector((state) => state.tenancies);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTenancyById(id));
    return () => {
      dispatch(clearCurrentTenancy());
    };
  }, [dispatch, id]);

  /**
   * Extract src URL from an iframe embed string
   */
  const extractMapSrc = (embedCode) => {
    if (!embedCode) return null;
    const match = embedCode.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-EG');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + t('common.kwd');
  };

  if (isLoading || !currentTenancy) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  const mapSrc = extractMapSrc(currentTenancy.unit?.buildingMapEmbed);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => navigate('/tenancies')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {t('tenancies.back_to_tenancies')}
        </Button>
        <div className="d-flex justify-content-between align-items-center">
          <div className="page-header mb-0">
            <h1>
              <i className="bi bi-file-earmark-text me-2"></i>
              {t('tenancies.tenancy_details')}
            </h1>
            <p className="mb-0">
              {currentTenancy.tenant?.firstName} {currentTenancy.tenant?.lastName} — {currentTenancy.unit?.unitNumber}
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button
              variant="primary"
              onClick={() => navigate(`/tenancies/${id}/edit`)}
            >
              <i className="bi bi-pencil me-2"></i>
              {t('tenancies.edit_tenancy')}
            </Button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* Tenant Info Card */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                {t('tenancies.tenant_info')}
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">{t('tenancies.tenant_name')}</small>
                <span className="fw-semibold">
                  {currentTenancy.tenant?.firstName} {currentTenancy.tenant?.lastName}
                </span>
              </div>
              <div className="mb-0">
                <small className="text-muted d-block">{t('users.email')}</small>
                <span>{currentTenancy.tenant?.email}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Unit & Building Info Card */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-building me-2"></i>
                {t('tenancies.unit_building')}
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">{t('tenancies.unit_number')}</small>
                <span className="fw-semibold">{currentTenancy.unit?.unitNumber}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">{t('tenancies.building')}</small>
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() => navigate(`/buildings/${currentTenancy.unit?.buildingId}`)}
                >
                  {currentTenancy.unit?.buildingName}
                  <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.75rem' }}></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contract Details Card */}
        <Col lg={mapSrc ? 6 : 12}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-range me-2"></i>
                {t('tenancies.contract_details')}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">{t('tenancies.start_date')}</small>
                    <span>{formatDate(currentTenancy.startDate)}</span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">{t('tenancies.end_date')}</small>
                    <span>{formatDate(currentTenancy.endDate)}</span>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">{t('tenancies.monthly_rent')}</small>
                    <span className="fw-semibold">{formatCurrency(currentTenancy.monthlyRent)}</span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">{t('tenancies.deposit_amount')}</small>
                    <span>{formatCurrency(currentTenancy.depositAmount)}</span>
                  </div>
                </Col>
              </Row>
              <div className="mb-0">
                <small className="text-muted d-block">Status</small>
                <Badge bg={currentTenancy.isActive ? 'success' : 'secondary'} className="fs-6">
                  {currentTenancy.isActive ? t('users.active') : t('users.inactive')}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Map Card */}
        {mapSrc && (
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
                  {t('tenancies.building_location')}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '380px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Building Location"
                />
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default TenancyDetail;
