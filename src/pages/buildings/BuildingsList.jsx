// ============================================
// Buildings List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { fetchBuildings, deleteBuilding } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';

const BuildingsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { buildings, isLoading } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({ search: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    dispatch(fetchBuildings(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (building) => {
    setSelectedBuilding(building);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteBuilding(selectedBuilding.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: 'Building deleted successfully' }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>Buildings</h1>
          <p className="mb-0">Manage your properties</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button variant="primary" onClick={() => navigate('/buildings/new')}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Building
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="search"
                  placeholder="Search buildings..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Buildings Table */}
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
                  <th>Building</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Units</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildings.length > 0 ? (
                  buildings.map((building) => (
                    <tr key={building.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px',
                              backgroundColor: 'rgba(26, 54, 93, 0.1)',
                              color: 'var(--bs-primary)'
                            }}
                          >
                            <i className="bi bi-building"></i>
                          </div>
                          <div className="fw-semibold">{building.name}</div>
                        </div>
                      </td>
                      <td>{building.address}</td>
                      <td>{building.city}</td>
                      <td>
                        <Badge bg="secondary">{building.totalUnits || 0} units</Badge>
                      </td>
                      <td>{building.ownerName || 'N/A'}</td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-1"
                          onClick={() => navigate(`/buildings/${building.id}`)}
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
                              onClick={() => navigate(`/buildings/${building.id}/edit`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-1"
                              onClick={() => handleDelete(building)}
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
                      No buildings found
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
          <Modal.Title>Delete Building</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedBuilding?.name}</strong>?
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

export default BuildingsList;
