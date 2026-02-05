// ============================================
// Maintenance Request Detail Page - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { fetchMaintenanceById, clearCurrentRequest } from '../../store/slices/maintenanceSlice';

const MaintenanceDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentRequest, isLoading } = useSelector((state) => state.maintenance);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMaintenanceById(id));
    return () => {
      dispatch(clearCurrentRequest());
    };
  }, [dispatch, id]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="text-center py-5">
        <h4>Request not found</h4>
        <Button variant="primary" onClick={() => navigate('/maintenance')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => navigate('/maintenance')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Requests
        </Button>
        <div className="d-flex justify-content-between align-items-start">
          <div className="page-header mb-0">
            <h1>{currentRequest.title}</h1>
            <div className="d-flex gap-2 mt-2">
              <Badge bg={getStatusBadge(currentRequest.status)}>
                {currentRequest.status?.replace('_', ' ')}
              </Badge>
              <Badge bg={getPriorityBadge(currentRequest.priority)}>
                {currentRequest.priority} Priority
              </Badge>
              <Badge bg="dark">
                <i className={`bi ${getCategoryIcon(currentRequest.category)} me-1`}></i>
                {currentRequest.category}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* Request Details */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>Request Details</h5>
            </Card.Header>
            <Card.Body>
              <h6 className="text-muted mb-2">Description</h6>
              <p style={{ whiteSpace: 'pre-wrap' }}>{currentRequest.description}</p>
            </Card.Body>
          </Card>

          {/* Resolution (if completed) */}
          {currentRequest.status === 'COMPLETED' && currentRequest.resolutionNotes && (
            <Card className="border-success">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Resolution
                </h5>
              </Card.Header>
              <Card.Body>
                <p style={{ whiteSpace: 'pre-wrap' }}>{currentRequest.resolutionNotes}</p>
                {currentRequest.resolvedBy && (
                  <div className="text-muted small mt-3">
                    <i className="bi bi-person me-1"></i>
                    Resolved by: {currentRequest.resolvedBy.name}
                    <br />
                    <i className="bi bi-calendar me-1"></i>
                    Resolved on: {formatDate(currentRequest.resolvedAt)}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Side Info */}
        <Col lg={4}>
          {/* Unit Info */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0" style={{ color: 'var(--navy-dark)' }}>Unit Information</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Unit Number</small>
                <span className="fw-semibold">{currentRequest.unit?.unitNumber}</span>
              </div>
              <div>
                <small className="text-muted d-block">Building</small>
                <span className="fw-semibold">{currentRequest.unit?.buildingName}</span>
              </div>
            </Card.Body>
          </Card>

          {/* Tenant Info (for Admin/Owner) */}
          {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0" style={{ color: 'var(--navy-dark)' }}>Tenant Information</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar avatar-primary me-3">
                    {currentRequest.tenant?.firstName?.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {currentRequest.tenant?.firstName} {currentRequest.tenant?.lastName}
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Email</small>
                  <a href={`mailto:${currentRequest.tenant?.email}`}>
                    {currentRequest.tenant?.email}
                  </a>
                </div>
                {currentRequest.tenant?.phone && (
                  <div>
                    <small className="text-muted d-block">Phone</small>
                    <a href={`tel:${currentRequest.tenant?.phone}`}>
                      {currentRequest.tenant?.phone}
                    </a>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <Card.Header>
              <h6 className="mb-0" style={{ color: 'var(--navy-dark)' }}>Timeline</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Submitted</small>
                <span>{formatDate(currentRequest.createdAt)}</span>
              </div>
              {currentRequest.updatedAt !== currentRequest.createdAt && (
                <div className="mb-3">
                  <small className="text-muted d-block">Last Updated</small>
                  <span>{formatDate(currentRequest.updatedAt)}</span>
                </div>
              )}
              {currentRequest.resolvedAt && (
                <div>
                  <small className="text-muted d-block">Resolved</small>
                  <span className="text-success">{formatDate(currentRequest.resolvedAt)}</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MaintenanceDetail;
