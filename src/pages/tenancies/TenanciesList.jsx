// ============================================
// Tenancies List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner } from 'react-bootstrap';
import { fetchTenancies, deleteTenancy } from '../../store/slices/tenanciesSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import Pagination from '../../components/Pagination';
import GeneratePaymentLinkModal from '../payments/GeneratePaymentLinkModal';

const TenanciesList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tenancies, pagination, isLoading } = useSelector((state) => state.tenancies);
  const { buildings } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({ isActive: '', buildingId: '' });
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';

  useEffect(() => {
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 100 }));
  }, [dispatch, isAdminOrOwner]);

  useEffect(() => {
    const queryFilters = {};
    if (filters.isActive !== '') {
      queryFilters.isActive = filters.isActive === 'true';
    }
    if (filters.buildingId) queryFilters.buildingId = filters.buildingId;
    dispatch(fetchTenancies({ ...queryFilters, page, limit: 10 }));
  }, [dispatch, filters, page]);

  const handlePageChange = (newPage) => setPage(newPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (tenancy) => {
    setSelectedTenancy(tenancy);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteTenancy(selectedTenancy.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: t('notifications.tenancy_deleted') }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-EG');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + t('common.kwd');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>{t('tenancies.title')}</h1>
          <p className="mb-0">{t('tenancies.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          {isAdminOrOwner && (
            <Button variant="outline-primary" onClick={() => setShowPaymentLinkModal(true)}>
              <i className="bi bi-link-45deg me-2"></i>
              {t('tenancies.generate_payment_link')}
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button variant="primary" onClick={() => navigate('/tenancies/new')}>
              <i className="bi bi-plus-lg me-2"></i>
              {t('tenancies.add_tenancy')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            {isAdminOrOwner && (
              <Col md={3}>
                <Form.Select
                  name="buildingId"
                  value={filters.buildingId}
                  onChange={handleFilterChange}
                >
                  <option value="">{t('tenancies.all_buildings')}</option>
                  {buildings?.map((b) => (
                    <option key={b.id} value={b.id}>{isAr ? b.nameAr : b.nameEn}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={3}>
              <Form.Select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
              >
                <option value="">{t('tenancies.all_statuses')}</option>
                <option value="true">{t('users.active')}</option>
                <option value="false">{t('users.inactive')}</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tenancies Table */}
      <Card>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>{t('tenancies.tenant_col')}</th>
                  <th>{t('tenancies.unit_col')}</th>
                  <th>{t('tenancies.period_col')}</th>
                  <th>{t('tenancies.rent_col')}</th>
                  <th>{t('tenancies.status_col')}</th>
                  <th>{t('tenancies.actions_col')}</th>
                </tr>
              </thead>
              <tbody>
                {tenancies.length > 0 ? (
                  tenancies.map((tenancy) => (
                    <tr key={tenancy.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-primary me-2">
                            {tenancy.tenant?.firstName?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {tenancy.tenant?.firstName} {tenancy.tenant?.lastName}
                            </div>
                            <small className="text-muted">{tenancy.tenant?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{tenancy.unit?.unitNumber}</div>
                          <small className="text-muted">{tenancy.unit?.buildingName}</small>
                        </div>
                      </td>
                      <td>
                        <small>
                          {formatDate(tenancy.startDate)}<br />
                          <span className="text-muted">to {formatDate(tenancy.endDate)}</span>
                        </small>
                      </td>
                      <td>{formatCurrency(tenancy.monthlyRent)}</td>
                      <td>
                        <Badge bg={tenancy.isActive ? 'success' : 'secondary'}>
                          {tenancy.isActive ? t('users.active') : t('users.inactive')}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-1"
                          onClick={() => navigate(`/tenancies/${tenancy.id}`)}
                          title="View"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primary p-1"
                              onClick={() => navigate(`/tenancies/${tenancy.id}/edit`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-1"
                              onClick={() => handleDelete(tenancy)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {t('tenancies.no_tenancies')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </Card>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('tenancies.delete_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('tenancies.delete_confirm', { name: selectedTenancy?.tenantName })) }}
        />
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Generate Payment Link Modal */}
      <GeneratePaymentLinkModal
        show={showPaymentLinkModal}
        onHide={() => setShowPaymentLinkModal(false)}
      />
    </div>
  );
};

export default TenanciesList;
