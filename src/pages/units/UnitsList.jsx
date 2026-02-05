// ============================================
// Units List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { fetchUnits, deleteUnit } from '../../store/slices/unitsSlice';
import { showNotification } from '../../store/slices/uiSlice';

const UnitsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { units, isLoading } = useSelector((state) => state.units);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    dispatch(fetchUnits(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (unit) => {
    setSelectedUnit(unit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteUnit(selectedUnit.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: 'Unit deleted successfully' }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'info';
      case 'MAINTENANCE': return 'warning';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG').format(amount) + ' EGP';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>Units</h1>
          <p className="mb-0">Manage rental units</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button variant="primary" onClick={() => navigate('/units/new')}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Unit
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="STUDIO">Studio</option>
                <option value="VILLA">Villa</option>
                <option value="OFFICE">Office</option>
                <option value="SHOP">Shop</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Units Table */}
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
                  <th>Unit</th>
                  <th>Building</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Rent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.length > 0 ? (
                  units.map((unit) => (
                    <tr key={unit.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px',
                              backgroundColor: 'rgba(212, 184, 150, 0.3)',
                              color: 'var(--beige-dark)'
                            }}
                          >
                            <i className="bi bi-door-open"></i>
                          </div>
                          <div className="fw-semibold">{unit.unitNumber}</div>
                        </div>
                      </td>
                      <td>{unit.buildingName || 'N/A'}</td>
                      <td>{unit.type}</td>
                      <td>
                        <small>
                          <i className="bi bi-door-closed me-1"></i>{unit.bedrooms} bed
                          <i className="bi bi-droplet ms-2 me-1"></i>{unit.bathrooms} bath
                          <i className="bi bi-arrows-fullscreen ms-2 me-1"></i>{unit.area}m²
                        </small>
                      </td>
                      <td>{formatCurrency(unit.rentAmount)}</td>
                      <td>
                        <Badge bg={getStatusBadge(unit.status)}>{unit.status}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-1"
                          onClick={() => navigate(`/units/${unit.id}`)}
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
                              onClick={() => navigate(`/units/${unit.id}/edit`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-1"
                              onClick={() => handleDelete(unit)}
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
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No units found
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
          <Modal.Title>Delete Unit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete unit <strong>{selectedUnit?.unitNumber}</strong>?
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

export default UnitsList;
