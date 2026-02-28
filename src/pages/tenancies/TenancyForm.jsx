// ============================================
// Tenancy Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createTenancy,
  updateTenancy,
  fetchTenancyById,
  clearCurrentTenancy,
} from '../../store/slices/tenanciesSlice';
import { fetchUnits } from '../../store/slices/unitsSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { fetchUsers } from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const TenancyForm = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentTenancy, isLoading } = useSelector((state) => state.tenancies);
  const { units } = useSelector((state) => state.units);
  const { buildings } = useSelector((state) => state.buildings);
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

  const selectedBuildingId = watch('buildingId');
  const selectedUnitId = watch('unitId');

  useEffect(() => {
    dispatch(fetchBuildings({ limit: 100 }));
    dispatch(fetchUsers({ role: 'TENANT', limit: 100 }));
    if (isEdit) {
      dispatch(fetchTenancyById(id));
    }
    return () => {
      dispatch(clearCurrentTenancy());
    };
  }, [dispatch, id, isEdit]);

  // When building is selected, fetch units for that building
  useEffect(() => {
    if (selectedBuildingId) {
      dispatch(fetchUnits({ buildingId: selectedBuildingId, limit: 100 }));
    }
  }, [dispatch, selectedBuildingId]);

  // When editing, set the building from the current tenancy
  useEffect(() => {
    if (currentTenancy && isEdit) {
      // Set buildingId first so units load
      setValue('buildingId', currentTenancy.unit?.buildingId?.toString() || '');
      // Then fetch units for that building
      if (currentTenancy.unit?.buildingId) {
        dispatch(fetchUnits({ buildingId: currentTenancy.unit.buildingId, limit: 100 }));
      }
    }
  }, [currentTenancy, isEdit, setValue, dispatch]);

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
        buildingId: currentTenancy.unit?.buildingId?.toString() || '',
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
      isActive: isEdit ? Boolean(data.isActive) : true,
    };

    try {
      if (isEdit) {
        await dispatch(updateTenancy({ id, data: formData })).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.tenancy_updated') }));
      } else {
        await dispatch(createTenancy(formData)).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.tenancy_created') }));
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
          {t('tenancies.back_to_tenancies')}
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? t('tenancies.edit_title') : t('tenancies.create_title')}</h1>
          <p className="mb-0">{isEdit ? t('tenancies.edit_subtitle') : t('tenancies.create_subtitle')}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('tenancies.tenant_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.tenantId}
                    {...register('tenantId', { required: t('tenancies.select_tenant') })}
                  >
                    <option value="">{t('tenancies.select_tenant')}</option>
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
                  <Form.Label>{t('tenancies.building_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.buildingId}
                    {...register('buildingId', { required: t('tenancies.select_building') })}
                    onChange={(e) => {
                      setValue('buildingId', e.target.value);
                      setValue('unitId', '');
                    }}
                  >
                    <option value="">{t('tenancies.select_building')}</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {isAr ? building.nameAr : building.nameEn} — {building.address}
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
                  <Form.Label>{t('tenancies.unit_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.unitId}
                    disabled={!selectedBuildingId}
                    {...register('unitId', { required: t('tenancies.select_unit') })}
                  >
                    <option value="">{selectedBuildingId ? t('tenancies.select_unit') : t('tenancies.select_building_first')}</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber} ({unit.type}) — {unit.status}
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
                  <Form.Label>{t('tenancies.start_date')} <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>{t('tenancies.end_date')} <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>{t('tenancies.monthly_rent_label')} <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>{t('tenancies.deposit_label')} <span className="text-danger">*</span></Form.Label>
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
                    <Form.Label>{t('tenancies.status_col')}</Form.Label>
                    <Form.Check
                      type="switch"
                      id="isActive"
                      label={watch('isActive') ? t('users.active') : t('users.inactive')}
                      {...register('isActive')}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/tenancies')}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? t('tenancies.updating') : t('tenancies.creating')}
                  </>
                ) : (
                  isEdit ? t('tenancies.update_tenancy') : t('tenancies.create_tenancy')
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
