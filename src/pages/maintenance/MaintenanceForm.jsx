// ============================================
// Maintenance Request Form Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { createMaintenanceRequest } from '../../store/slices/maintenanceSlice';
import { showNotification } from '../../store/slices/uiSlice';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.maintenance);
  
  const [myUnits, setMyUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    defaultValues: {
      priority: 'MEDIUM',
      category: 'OTHER',
      unitId: '',
    },
  });

  // Only tenants can create maintenance requests
  useEffect(() => {
    if (user?.role !== 'TENANT') {
      navigate('/maintenance');
    }
  }, [user, navigate]);

  // Fetch tenant's units
  useEffect(() => {
    const fetchMyUnits = async () => {
      try {
        setLoadingUnits(true);
        const response = await maintenanceService.getMyUnits();
        console.log('My units response:', response);
        const units = response.data || [];
        setMyUnits(units);
        // Auto-select if only one unit
        if (units.length === 1) {
          setValue('unitId', units[0].unitId.toString());
        }
      } catch (error) {
        console.error('Failed to fetch units:', error);
        dispatch(showNotification({ type: 'error', message: t('maintenance.load_units_fail') }));
      } finally {
        setLoadingUnits(false);
      }
    };
    
    if (user?.role === 'TENANT') {
      fetchMyUnits();
    }
  }, [user, dispatch, setValue]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createMaintenanceRequest({
        ...data,
        unitId: parseInt(data.unitId, 10),
      })).unwrap();
      dispatch(showNotification({ type: 'success', message: t('maintenance.submit_success') }));
      navigate('/maintenance');
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const categories = [
    { value: 'PLUMBING', label: t('maintenance.cat_plumbing'), icon: 'bi-droplet', description: t('maintenance.cat_plumbing_desc') },
    { value: 'ELECTRICAL', label: t('maintenance.cat_electrical'), icon: 'bi-lightning', description: t('maintenance.cat_electrical_desc') },
    { value: 'HVAC', label: t('maintenance.cat_hvac'), icon: 'bi-thermometer', description: t('maintenance.cat_hvac_desc') },
    { value: 'APPLIANCE', label: t('maintenance.cat_appliance'), icon: 'bi-gear', description: t('maintenance.cat_appliance_desc') },
    { value: 'STRUCTURAL', label: t('maintenance.cat_structural'), icon: 'bi-house', description: t('maintenance.cat_structural_desc') },
    { value: 'OTHER', label: t('maintenance.cat_other'), icon: 'bi-tools', description: t('maintenance.cat_other_desc') },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => navigate('/maintenance')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {t('maintenance.back_to_requests')}
        </Button>
        <div className="page-header mb-0">
          <h1>{t('maintenance.new_request')}</h1>
          <p className="mb-0">{t('maintenance.new_request_subtitle')}</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        {t('maintenance.info_alert')}
      </Alert>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          {loadingUnits ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--navy-dark)' }} />
              <p className="mt-2 text-muted">{t('maintenance.loading_units')}</p>
            </div>
          ) : myUnits.length === 0 ? (
            <Alert variant="warning" className="mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {t('maintenance.no_active_rentals')}
            </Alert>
          ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              {/* Unit Selection */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('maintenance.select_unit')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="unitId"
                    control={control}
                    rules={{ required: t('maintenance.select_unit_required') }}
                    render={({ field }) => {
                      const unitOptions = myUnits.map((unit) => ({
                        value: unit.unitId,
                        label: `${unit.buildingName} - ${t('units.unit')} ${unit.unitNumber}${unit.floor ? ` (${t('units.floor')} ${unit.floor})` : ''}`,
                      }));
                      const selectedOption = unitOptions.find(
                        (opt) => String(opt.value) === String(field.value)
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={unitOptions}
                          placeholder={`-- ${t('maintenance.select_unit_placeholder')} --`}
                          isClearable
                          isSearchable
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '38px',
                              borderColor: errors.unitId ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6',
                              boxShadow: errors.unitId
                                ? '0 0 0 0.25rem rgba(220,53,69,.25)'
                                : state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                              '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' },
                            }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
                      );
                    }}
                  />
                  {errors.unitId && (
                    <div className="invalid-feedback d-block">{errors.unitId.message}</div>
                  )}
                  {myUnits.length > 1 && (
                    <Form.Text className="text-muted">
                      {t('maintenance.multiple_units_hint', { count: myUnits.length })}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              {/* Title */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('maintenance.request_title')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('maintenance.request_title_placeholder')}
                    isInvalid={!!errors.title}
                    {...register('title', { 
                      required: t('maintenance.title_required'),
                      minLength: { value: 5, message: t('maintenance.title_min_length') },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Category */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('maintenance.category')} <span className="text-danger">*</span></Form.Label>
                  <Row className="g-2">
                    {categories.map((cat) => (
                      <Col md={4} key={cat.value}>
                        <Form.Check
                          type="radio"
                          id={`category-${cat.value}`}
                          className="category-card"
                        >
                          <Form.Check.Input
                            type="radio"
                            value={cat.value}
                            {...register('category', { required: t('maintenance.category_required') })}
                          />
                          <Form.Check.Label className="w-100">
                            <Card className="h-100 text-center p-2" style={{ cursor: 'pointer' }}>
                              <i className={`bi ${cat.icon} fs-4 mb-1`} style={{ color: 'var(--navy-dark)' }}></i>
                              <div className="small fw-semibold">{cat.label}</div>
                            </Card>
                          </Form.Check.Label>
                        </Form.Check>
                      </Col>
                    ))}
                  </Row>
                  {errors.category && (
                    <div className="text-danger small mt-1">{errors.category.message}</div>
                  )}
                </Form.Group>
              </Col>

              {/* Priority */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('maintenance.priority')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: t('maintenance.priority_required') }}
                    render={({ field }) => {
                      const priorityOptions = [
                        { value: 'LOW', label: `${t('maintenance.priority_low')} - ${t('maintenance.priority_low_desc')}` },
                        { value: 'MEDIUM', label: `${t('maintenance.priority_medium')} - ${t('maintenance.priority_medium_desc')}` },
                        { value: 'HIGH', label: `${t('maintenance.priority_high')} - ${t('maintenance.priority_high_desc')}` },
                        { value: 'URGENT', label: `${t('maintenance.priority_urgent')} - ${t('maintenance.priority_urgent_desc')}` },
                      ];
                      const selectedOption = priorityOptions.find(
                        (opt) => opt.value === field.value
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={priorityOptions}
                          placeholder={t('maintenance.priority')}
                          isSearchable
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '38px',
                              borderColor: errors.priority ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6',
                              boxShadow: errors.priority
                                ? '0 0 0 0.25rem rgba(220,53,69,.25)'
                                : state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                              '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' },
                            }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
                      );
                    }}
                  />
                  {errors.priority && (
                    <div className="invalid-feedback d-block">{errors.priority.message}</div>
                  )}
                </Form.Group>
              </Col>

              {/* Description */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('maintenance.description')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder={t('maintenance.description_placeholder')}
                    isInvalid={!!errors.description}
                    {...register('description', { 
                      required: t('maintenance.description_required'),
                      minLength: { value: 20, message: t('maintenance.description_min_length') },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/maintenance')}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t('maintenance.submitting')}
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    {t('maintenance.submit_request')}
                  </>
                )}
              </Button>
            </div>
          </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MaintenanceForm;
