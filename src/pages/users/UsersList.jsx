// ============================================
// Users List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import {
  fetchUsers,
  deleteUser,
  activateUser,
  deactivateUser,
} from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const UsersList = () => {
  const { t } = useTranslation();
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
      dispatch(showNotification({ type: 'success', message: t('notifications.user_deleted') }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.isActive) {
        await dispatch(deactivateUser(user.id)).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.user_deactivated') }));
      } else {
        await dispatch(activateUser(user.id)).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.user_activated') }));
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
          <h1>{t('users.title')}</h1>
          <p className="mb-0">{t('users.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/users/new')}>
          <i className="bi bi-plus-lg me-2"></i>
          {t('users.add_user')}
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
                  placeholder={t('users.search_placeholder')}
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
                <option value="">{t('users.all_roles')}</option>
                <option value="ADMIN">{t('users.admin')}</option>
                <option value="OWNER">{t('users.owner')}</option>
                <option value="TENANT">{t('users.tenant')}</option>
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
                  <th>{t('users.user_col')}</th>
                  <th>{t('users.email_col')}</th>
                  <th>{t('users.role_col')}</th>
                  <th>{t('users.status_col')}</th>
                  <th>{t('users.actions_col')}</th>
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
                            <small className="text-muted">{user.phone || t('users.no_phone')}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={getRoleBadge(user.role)}>{t(`users.${user.role.toLowerCase()}`)}</Badge>
                      </td>
                      <td>
                        <Badge bg={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? t('users.active') : t('users.inactive')}
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
                      {t('users.no_users')}
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
          <Modal.Title>{t('users.delete_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          dangerouslySetInnerHTML={{ __html: t('users.delete_confirm', { name: `${selectedUser?.firstName} ${selectedUser?.lastName}` }) }}
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
    </div>
  );
};

export default UsersList;
