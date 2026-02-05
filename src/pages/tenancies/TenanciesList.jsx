// ============================================
// Tenancies List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner } from 'react-bootstrap';
import { fetchTenancies, deleteTenancy } from '../../store/slices/tenanciesSlice';
import { showNotification } from '../../store/slices/uiSlice';

const TenanciesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tenancies, isLoading } = useSelector((state) => state.tenancies);
  const [filters, setFilters] = useState({ isActive: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState(null);

  useEffect(() => {
    const queryFilters = {};
    if (filters.isActive !== '') {
      queryFilters.isActive = filters.isActive === 'true';
    }
    dispatch(fetchTenancies(queryFilters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (tenancy) => {
    setSelectedTenancy(tenancy);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteTenancy(selectedTenancy.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: 'Tenancy deleted successfully' }));
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
    return new Intl.NumberFormat('en-EG').format(amount) + ' EGP';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>Tenancies</h1>
          <p className="mb-0">Manage rental contracts</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button variant="primary" onClick={() => navigate('/tenancies/new')}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Tenancy
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Period</th>
                  <th>Rent</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                          {tenancy.isActive ? 'Active' : 'Inactive'}
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
                      No tenancies found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Tenancy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the tenancy for <strong>{selectedTenancy?.tenantName}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TenanciesList;
