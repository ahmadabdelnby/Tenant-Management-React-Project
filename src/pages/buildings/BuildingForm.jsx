// ============================================
// Building Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createBuilding,
  updateBuilding,
  fetchBuildingById,
  clearCurrentBuilding,
} from '../../store/slices/buildingsSlice';
import { fetchUsers } from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const BuildingForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentBuilding, isLoading } = useSelector((state) => state.buildings);
  const { users } = useSelector((state) => state.users);
  const [owners, setOwners] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchUsers({ role: 'OWNER' }));
    if (isEdit) {
      dispatch(fetchBuildingById(id));
    }
    return () => {
      dispatch(clearCurrentBuilding());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    const ownerUsers = users.filter((u) => u.role === 'OWNER');
    setOwners(ownerUsers);
  }, [users]);

  useEffect(() => {
    if (currentBuilding && isEdit) {
      reset({
        name: currentBuilding.name,
        address: currentBuilding.address,
        city: currentBuilding.city,
        country: currentBuilding.country,
        postalCode: currentBuilding.postalCode || '',
        description: currentBuilding.description || '',
        ownerId: currentBuilding.ownerId,
      });
    }
  }, [currentBuilding, isEdit, reset]);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      ownerId: parseInt(data.ownerId),
    };

    try {
      if (isEdit) {
        await dispatch(updateBuilding({ id, data: formData })).unwrap();
        dispatch(showNotification({ type: 'success', message: 'Building updated successfully' }));
      } else {
        await dispatch(createBuilding(formData)).unwrap();
        dispatch(showNotification({ type: 'success', message: 'Building created successfully' }));
      }
      navigate('/buildings');
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
          onClick={() => navigate('/buildings')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Buildings
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? 'Edit Building' : 'Create Building'}</h1>
          <p className="mb-0">{isEdit ? 'Update building information' : 'Add a new property'}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Building Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Sunrise Tower"
                    isInvalid={!!errors.name}
                    {...register('name', {
                      required: 'Building name is required',
                      minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 123 Main Street"
                    isInvalid={!!errors.address}
                    {...register('address', {
                      required: 'Address is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Cairo"
                    isInvalid={!!errors.city}
                    {...register('city', {
                      required: 'City is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.city?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Egypt"
                    isInvalid={!!errors.country}
                    {...register('country', {
                      required: 'Country is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.country?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 11511"
                    {...register('postalCode')}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Owner <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.ownerId}
                    {...register('ownerId', { required: 'Owner is required' })}
                  >
                    <option value="">Select owner</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.ownerId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Building description..."
                    {...register('description')}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/buildings')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Building' : 'Create Building'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BuildingForm;
