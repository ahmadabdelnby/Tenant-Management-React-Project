// ============================================
// User Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createUser,
  updateUser,
  fetchUserById,
  clearCurrentUser,
} from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const UserForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentUser, isLoading } = useSelector((state) => state.users);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchUserById(id));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (currentUser && isEdit) {
      reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || '',
        role: currentUser.role,
      });
    }
  }, [currentUser, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const { password, ...updateData } = data;
        await dispatch(updateUser({ id, data: updateData })).unwrap();
        dispatch(showNotification({ type: 'success', message: 'User updated successfully' }));
      } else {
        await dispatch(createUser(data)).unwrap();
        dispatch(showNotification({ type: 'success', message: 'User created successfully' }));
      }
      navigate('/users');
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => navigate('/users')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Users
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? 'Edit User' : 'Create User'}</h1>
          <p className="mb-0">{isEdit ? 'Update user information' : 'Add a new user to the system'}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '600px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.firstName}
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.lastName}
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    isInvalid={!!errors.email}
                    disabled={isEdit}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {!isEdit && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      isInvalid={!!errors.password}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Min 8 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Must contain uppercase, lowercase and number',
                        },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.phone}
                    {...register('phone')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.role}
                    {...register('role', { required: 'Role is required' })}
                  >
                    <option value="">Select role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="OWNER">Owner</option>
                    <option value="TENANT">Tenant</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/users')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update User' : 'Create User'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm;
