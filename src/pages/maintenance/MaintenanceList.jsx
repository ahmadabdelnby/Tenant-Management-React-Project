// ============================================
// Maintenance Requests List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner } from 'react-bootstrap';
import { fetchMaintenanceRequests, deleteMaintenanceRequest, updateMaintenanceRequest } from '../../store/slices/maintenanceSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { requests, isLoading } = useSelector((state) => state.maintenance);
  const { buildings } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', buildingId: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', resolutionNotes: '' });
  const [exporting, setExporting] = useState(false);

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';

  useEffect(() => {
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 100 }));
  }, [dispatch, isAdminOrOwner]);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
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
      dispatch(showNotification({ type: 'success', message: 'Report exported successfully' }));
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: 'Failed to export report' }));
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
      dispatch(showNotification({ type: 'success', message: 'Request deleted successfully' }));
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
      dispatch(showNotification({ type: 'success', message: 'Request updated successfully' }));
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
    return new Date(dateString).toLocaleDateString('en-EG', {
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
          <h1>Maintenance Requests</h1>
          <p className="mb-0">
            {user?.role === 'TENANT' 
              ? 'Submit and track your maintenance requests' 
              : 'View and manage maintenance requests'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <Button variant="success" onClick={handleExportExcel} disabled={exporting}>
              {exporting ? (
                <><Spinner animation="border" size="sm" className="me-2" />Exporting...</>
              ) : (
                <><i className="bi bi-file-earmark-excel me-2"></i>Export Excel</>
              )}
            </Button>
          )}
          {user?.role === 'TENANT' && (
            <Button variant="primary" onClick={() => navigate('/maintenance/new')}>
              <i className="bi bi-plus-lg me-2"></i>
              New Request
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
                  <option value="">All Buildings</option>
                  {buildings?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={3}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                <option value="PLUMBING">Plumbing (Water)</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="APPLIANCE">Appliance</option>
                <option value="STRUCTURAL">Structural</option>
                <option value="OTHER">Other</option>
              </Form.Select>
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
                  <th>Request</th>
                  {(user?.role === 'ADMIN' || user?.role === 'OWNER') && <th>Tenant</th>}
                  <th>Unit</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
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
                        {request.category}
                      </td>
                      <td>
                        <Badge bg={getPriorityBadge(request.priority)}>{request.priority}</Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(request.status)}>
                          {request.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <small>{formatDate(request.createdAt)}</small>
                      </td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-1"
                          onClick={() => navigate(`/maintenance/${request.id}`)}
                          title="View"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-1"
                            onClick={() => handleUpdateStatus(request)}
                            title="Update Status"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        )}
                        {user?.role === 'TENANT' && request.status === 'PENDING' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-1"
                            onClick={() => handleDelete(request)}
                            title="Cancel"
                          >
                            <i className="bi bi-x-circle"></i>
                          </Button>
                        )}
                        {user?.role === 'ADMIN' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-1"
                            onClick={() => handleDelete(request)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={(user?.role === 'ADMIN' || user?.role === 'OWNER') ? 8 : 7} className="text-center py-4 text-muted">
                      No maintenance requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {user?.role === 'TENANT' ? 'cancel' : 'delete'} this request?
          <br />
          <strong>{selectedRequest?.title}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {user?.role === 'TENANT' ? 'Cancel Request' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Request Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={updateData.status}
                onChange={(e) => setUpdateData((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Form.Group>
            {updateData.status === 'COMPLETED' && (
              <Form.Group className="mb-3">
                <Form.Label>Resolution Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={updateData.resolutionNotes}
                  onChange={(e) => setUpdateData((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
                  placeholder="Describe how the issue was resolved..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MaintenanceList;
