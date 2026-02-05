// ============================================
// Unit Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createUnit,
  updateUnit,
  fetchUnitById,
  clearCurrentUnit,
} from '../../store/slices/unitsSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';

const UnitForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentUnit, isLoading } = useSelector((state) => state.units);
  const { buildings } = useSelector((state) => state.buildings);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchBuildings());
    if (isEdit) {
      dispatch(fetchUnitById(id));
    }
    return () => {
      dispatch(clearCurrentUnit());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (currentUnit && isEdit) {
      reset({
        buildingId: currentUnit.buildingId,
        unitNumber: currentUnit.unitNumber,
        floor: currentUnit.floor,
        bedrooms: currentUnit.bedrooms,
        bathrooms: currentUnit.bathrooms,
        area: currentUnit.area,
        rentAmount: currentUnit.rentAmount,
        type: currentUnit.type,
        status: currentUnit.status,
      });
    }
  }, [currentUnit, isEdit, reset]);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      buildingId: parseInt(data.buildingId),
      floor: parseInt(data.floor),
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      area: parseFloat(data.area),
      rentAmount: parseFloat(data.rentAmount),
    };

    try {
      if (isEdit) {
        await dispatch(updateUnit({ id, data: formData })).unwrap();
        dispatch(showNotification({ type: 'success', message: 'Unit updated successfully' }));
      } else {
        await dispatch(createUnit(formData)).unwrap();
        dispatch(showNotification({ type: 'success', message: 'Unit created successfully' }));
      }
      navigate('/units');
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
          onClick={() => navigate('/units')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Units
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? 'Edit Unit' : 'Create Unit'}</h1>
          <p className="mb-0">{isEdit ? 'Update unit information' : 'Add a new unit to a building'}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Building <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.buildingId}
                    {...register('buildingId', { required: 'Building is required' })}
                  >
                    <option value="">Select a building</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.buildingId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., A101"
                    isInvalid={!!errors.unitNumber}
                    {...register('unitNumber', {
                      required: 'Unit number is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.unitNumber?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Floor <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    isInvalid={!!errors.floor}
                    {...register('floor', {
                      required: 'Floor is required',
                      min: { value: 0, message: 'Min 0' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.floor?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bedrooms <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    isInvalid={!!errors.bedrooms}
                    {...register('bedrooms', {
                      required: 'Bedrooms is required',
                      min: { value: 0, message: 'Min 0' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.bedrooms?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bathrooms <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    isInvalid={!!errors.bathrooms}
                    {...register('bathrooms', {
                      required: 'Bathrooms is required',
                      min: { value: 1, message: 'Min 1' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.bathrooms?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Area (m²) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g., 120.5"
                    isInvalid={!!errors.area}
                    {...register('area', {
                      required: 'Area is required',
                      min: { value: 1, message: 'Min 1' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.area?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rent Amount (EGP) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="e.g., 5000"
                    isInvalid={!!errors.rentAmount}
                    {...register('rentAmount', {
                      required: 'Rent amount is required',
                      min: { value: 0, message: 'Min 0' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.rentAmount?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.type}
                    {...register('type', { required: 'Type is required' })}
                  >
                    <option value="">Select type</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="STUDIO">Studio</option>
                    <option value="VILLA">Villa</option>
                    <option value="OFFICE">Office</option>
                    <option value="SHOP">Shop</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {isEdit && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select {...register('status')}>
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/units')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Unit' : 'Create Unit'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UnitForm;
