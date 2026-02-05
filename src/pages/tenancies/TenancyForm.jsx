// ============================================
// Tenancy Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createTenancy,
  updateTenancy,
  fetchTenancyById,
  clearCurrentTenancy,
} from '../../store/slices/tenanciesSlice';
import { fetchUnits } from '../../store/slices/unitsSlice';
import { fetchUsers } from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const TenancyForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentTenancy, isLoading } = useSelector((state) => state.tenancies);
  const { units } = useSelector((state) => state.units);
  const { users } = useSelector((state) => state.users);

  const [availableUnits, setAvailableUnits] = useState([]);
  const [tenants, setTenants] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedUnitId = watch('unitId');

  useEffect(() => {
    dispatch(fetchUnits({ limit: 100 }));
    dispatch(fetchUsers({ role: 'TENANT', limit: 100 }));
    if (isEdit) {
      dispatch(fetchTenancyById(id));
    }
    return () => {
      dispatch(clearCurrentTenancy());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    // Filter available units or include the current unit in edit mode
    const available = units.filter((u) => u.status === 'AVAILABLE' || (isEdit && u.id === currentTenancy?.unit?.id));
    setAvailableUnits(available);

    const tenantUsers = users.filter((u) => u.role === 'TENANT');
    setTenants(tenantUsers);
  }, [units, users, isEdit, currentTenancy]);

  useEffect(() => {
    if (currentTenancy && isEdit) {
      reset({
        tenantId: currentTenancy.tenant?.id,
        unitId: currentTenancy.unit?.id,
        startDate: currentTenancy.startDate?.split('T')[0],
        endDate: currentTenancy.endDate?.split('T')[0],
        monthlyRent: currentTenancy.monthlyRent,
        depositAmount: currentTenancy.depositAmount,
        isActive: currentTenancy.isActive,
      });
    }
  }, [currentTenancy, isEdit, reset]);

  // Auto-fill rent amount from unit
  useEffect(() => {
    if (selectedUnitId && !isEdit) {
      const unit = units.find((u) => u.id === parseInt(selectedUnitId));
      if (unit) {
        setValue('monthlyRent', unit.rentAmount);
      }
    }
  }, [selectedUnitId, units, setValue, isEdit]);

  const onSubmit = async (data) => {
    const formData = {
      tenantId: parseInt(data.tenantId),
      unitId: parseInt(data.unitId),
      startDate: data.startDate,
      endDate: data.endDate,
      monthlyRent: parseFloat(data.monthlyRent),
      depositAmount: parseFloat(data.depositAmount),
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    try {
      if (isEdit) {
        await dispatch(updateTenancy({ id, data: formData })).unwrap();
        dispatch(showNotification({ type: 'success', message: 'Tenancy updated successfully' }));
      } else {
        await dispatch(createTenancy(formData)).unwrap();
        dispatch(showNotification({ type: 'success', message: 'Tenancy created successfully' }));
      }
      navigate('/tenancies');
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
          onClick={() => navigate('/tenancies')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Tenancies
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? 'Edit Tenancy' : 'Create Tenancy'}</h1>
          <p className="mb-0">{isEdit ? 'Update tenancy contract' : 'Create a new rental contract'}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tenant <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.tenantId}
                    {...register('tenantId', { required: 'Tenant is required' })}
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName} ({tenant.email})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tenantId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.unitId}
                    {...register('unitId', { required: 'Unit is required' })}
                  >
                    <option value="">Select a unit</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber} - {unit.buildingName || 'Building'} ({unit.type})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.unitId?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    isInvalid={!!errors.startDate}
                    {...register('startDate', { required: 'Start date is required' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.startDate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    isInvalid={!!errors.endDate}
                    {...register('endDate', { required: 'End date is required' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.endDate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Monthly Rent (EGP) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    isInvalid={!!errors.monthlyRent}
                    {...register('monthlyRent', {
                      required: 'Monthly rent is required',
                      min: { value: 0, message: 'Min 0' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.monthlyRent?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Deposit Amount (EGP) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    isInvalid={!!errors.depositAmount}
                    {...register('depositAmount', {
                      required: 'Deposit is required',
                      min: { value: 0, message: 'Min 0' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.depositAmount?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {isEdit && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Check
                      type="switch"
                      id="isActive"
                      label={watch('isActive') ? 'Active' : 'Inactive'}
                      {...register('isActive')}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/tenancies')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Tenancy' : 'Create Tenancy'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TenancyForm;
