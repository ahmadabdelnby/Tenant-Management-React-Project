// ============================================
// Maintenance Requests List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner } from 'react-bootstrap';
import { fetchMaintenanceRequests, deleteMaintenanceRequest, updateMaintenanceRequest } from '../../store/slices/maintenanceSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import Select from 'react-select';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { requests, pagination, isLoading } = useSelector((state) => state.maintenance);
  const { buildings } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', buildingId: '' });
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', resolutionNotes: '' });
  const [exporting, setExporting] = useState(false);

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';

  useEffect(() => {
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 0 }));
  }, [dispatch, isAdminOrOwner]);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests({ ...filters, page, limit: 10 }));
  }, [dispatch, filters, page]);

  const handlePageChange = (newPage) => setPage(newPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.buildingId) params.buildingId = filters.buildingId;
      const blob = await maintenanceService.exportExcel(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Maintenance_Report_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch(showNotification({ type: 'success', message: t('maintenance.export_success') }));
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: t('maintenance.export_fail') }));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = (request) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteMaintenanceRequest(selectedRequest.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: t('maintenance.delete_success') }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setUpdateData({ status: request.status, resolutionNotes: request.resolutionNotes || '' });
    setShowUpdateModal(true);
  };

  const confirmUpdate = async () => {
    try {
      await dispatch(updateMaintenanceRequest({ 
        id: selectedRequest.id, 
        data: updateData 
      })).unwrap();
      dispatch(showNotification({ type: 'success', message: t('maintenance.update_success') }));
      setShowUpdateModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'LOW': return 'secondary';
      case 'MEDIUM': return 'primary';
      case 'HIGH': return 'warning';
      case 'URGENT': return 'danger';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PLUMBING': return 'bi-droplet';
      case 'ELECTRICAL': return 'bi-lightning';
      case 'HVAC': return 'bi-thermometer';
      case 'APPLIANCE': return 'bi-gear';
      case 'STRUCTURAL': return 'bi-house';
      default: return 'bi-tools';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>{t('maintenance.title')}</h1>
          <p className="mb-0">
            {user?.role === 'TENANT' 
              ? t('maintenance.tenant_subtitle') 
              : t('maintenance.admin_subtitle')}
          </p>
        </div>
        <div className="d-flex gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <Button variant="success" onClick={handleExportExcel} disabled={exporting}>
              {exporting ? (
                <><Spinner animation="border" size="sm" className="me-2" />{t('maintenance.exporting')}...</>
              ) : (
                <><i className="bi bi-file-earmark-excel me-2"></i>{t('maintenance.export_excel')}</>
              )}
            </Button>
          )}
          {user?.role === 'TENANT' && (
            <Button variant="primary" onClick={() => navigate('/maintenance/new')}>
              <i className="bi bi-plus-lg me-2"></i>
              {t('maintenance.new_request')}
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
                <SearchableSelect
                  name="buildingId"
                  value={filters.buildingId}
                  onChange={handleFilterChange}
                  placeholder={t('maintenance.all_buildings')}
                  options={buildings?.map((b) => ({ value: String(b.id), label: isAr ? b.nameAr : b.nameEn })) || []}
                />
              </Col>
            )}
            <Col md={3}>
              <SearchableSelect
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                placeholder={t('maintenance.all_statuses')}
                options={[
                  { value: 'PENDING', label: t('maintenance.status_pending') },
                  { value: 'IN_PROGRESS', label: t('maintenance.status_in_progress') },
                  { value: 'COMPLETED', label: t('maintenance.status_completed') },
                  { value: 'CANCELLED', label: t('maintenance.status_cancelled') },
                ]}
              />
            </Col>
            <Col md={3}>
              <SearchableSelect
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                placeholder={t('maintenance.all_priorities')}
                options={[
                  { value: 'LOW', label: t('maintenance.priority_low') },
                  { value: 'MEDIUM', label: t('maintenance.priority_medium') },
                  { value: 'HIGH', label: t('maintenance.priority_high') },
                  { value: 'URGENT', label: t('maintenance.priority_urgent') },
                ]}
              />
            </Col>
            <Col md={3}>
              <SearchableSelect
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder={t('maintenance.all_categories')}
                options={[
                  { value: 'PLUMBING', label: t('maintenance.cat_plumbing') },
                  { value: 'ELECTRICAL', label: t('maintenance.cat_electrical') },
                  { value: 'HVAC', label: t('maintenance.cat_hvac') },
                  { value: 'APPLIANCE', label: t('maintenance.cat_appliance') },
                  { value: 'STRUCTURAL', label: t('maintenance.cat_structural') },
                  { value: 'OTHER', label: t('maintenance.cat_other') },
                ]}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Requests Table */}
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
                  <th>{t('maintenance.request')}</th>
                  {(user?.role === 'ADMIN' || user?.role === 'OWNER') && <th>{t('tenancies.tenant')}</th>}
                  <th>{t('units.unit')}</th>
                  <th>{t('maintenance.category')}</th>
                  <th>{t('maintenance.priority')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('maintenance.date')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="fw-semibold">{request.title}</div>
                        <small className="text-muted">
                          {request.description?.substring(0, 50)}
                          {request.description?.length > 50 ? '...' : ''}
                        </small>
                      </td>
                      {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-primary me-2" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {request.tenant?.firstName?.charAt(0) || 'T'}
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {request.tenant?.firstName} {request.tenant?.lastName}
                              </div>
                              <small className="text-muted">{request.tenant?.phone}</small>
                            </div>
                          </div>
                        </td>
                      )}
                      <td>
                        <div className="fw-semibold">{request.unit?.unitNumber}</div>
                        <small className="text-muted">{request.unit?.buildingName}</small>
                      </td>
                      <td>
                        <i className={`bi ${getCategoryIcon(request.category)} me-2`}></i>
                        {t(`maintenance.cat_${request.category?.toLowerCase()}`)}
                      </td>
                      <td>
                        <Badge bg={getPriorityBadge(request.priority)}>{t(`maintenance.priority_${request.priority?.toLowerCase()}`)}</Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(request.status)}>
                          {t(`maintenance.status_${request.status?.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td>
                        <small>{formatDate(request.createdAt)}</small>
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => navigate(`/maintenance/${request.id}`)}
                        >
                          {t('common.view')}
                        </Button>
                        {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleUpdateStatus(request)}
                          >
                            {t('maintenance.update_status')}
                          </Button>
                        )}
                        {user?.role === 'TENANT' && request.status === 'PENDING' && (
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-1"
                            onClick={() => handleDelete(request)}
                          >
                            {t('common.cancel')}
                          </Button>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(request)}
                          >
                            {t('common.delete')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={(user?.role === 'ADMIN' || user?.role === 'OWNER') ? 8 : 7} className="text-center py-4 text-muted">
                      {t('maintenance.no_requests')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('common.confirm_delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user?.role === 'TENANT' ? t('maintenance.confirm_cancel_request') : t('maintenance.confirm_delete_request')}
          <br />
          <strong>{selectedRequest?.title}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {user?.role === 'TENANT' ? t('maintenance.cancel_request') : t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('maintenance.update_request_status')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('common.status')}</Form.Label>
              <Select
                value={[
                  { value: 'PENDING', label: t('maintenance.status_pending') },
                  { value: 'IN_PROGRESS', label: t('maintenance.status_in_progress') },
                  { value: 'COMPLETED', label: t('maintenance.status_completed') },
                  { value: 'CANCELLED', label: t('maintenance.status_cancelled') },
                ].find((opt) => opt.value === updateData.status) || null}
                onChange={(opt) => setUpdateData((prev) => ({ ...prev, status: opt ? opt.value : '' }))}
                options={[
                  { value: 'PENDING', label: t('maintenance.status_pending') },
                  { value: 'IN_PROGRESS', label: t('maintenance.status_in_progress') },
                  { value: 'COMPLETED', label: t('maintenance.status_completed') },
                  { value: 'CANCELLED', label: t('maintenance.status_cancelled') },
                ]}
                isSearchable
                isRtl={isAr}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: '38px',
                    borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                    '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' },
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </Form.Group>
            {updateData.status === 'COMPLETED' && (
              <Form.Group className="mb-3">
                <Form.Label>{t('maintenance.resolution_notes')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={updateData.resolutionNotes}
                  onChange={(e) => setUpdateData((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
                  placeholder={t('maintenance.resolution_placeholder')}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={confirmUpdate}>
            {t('maintenance.update')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MaintenanceList;
