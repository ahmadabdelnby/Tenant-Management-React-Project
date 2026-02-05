// ============================================
// Users List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import {
  fetchUsers,
  deleteUser,
  activateUser,
  deactivateUser,
} from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const UsersList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.users);
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: 'User deleted successfully' }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.isActive) {
        await dispatch(deactivateUser(user.id)).unwrap();
        dispatch(showNotification({ type: 'success', message: 'User deactivated' }));
      } else {
        await dispatch(activateUser(user.id)).unwrap();
        dispatch(showNotification({ type: 'success', message: 'User activated' }));
      }
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'primary';
      case 'OWNER': return 'info';
      case 'TENANT': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>Users</h1>
          <p className="mb-0">Manage system users</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/users/new')}>
          <i className="bi bi-plus-lg me-2"></i>
          Add User
        </Button>
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
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Owner</option>
                <option value="TENANT">Tenant</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
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
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-primary me-2">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                            <small className="text-muted">{user.phone || 'No phone'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={getRoleBadge(user.role)}>{user.role}</Badge>
                      </td>
                      <td>
                        <Badge bg={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary p-1"
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className={user.isActive ? 'text-warning p-1' : 'text-success p-1'}
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`bi ${user.isActive ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-1"
                          onClick={() => handleDelete(user)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No users found
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
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
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

export default UsersList;
