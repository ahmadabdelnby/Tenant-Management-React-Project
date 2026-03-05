// ============================================
// Unit Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchBuildings({ limit: 0 }));
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
        dispatch(showNotification({ type: 'success', message: t('notifications.unit_updated') }));
      } else {
        await dispatch(createUnit(formData)).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.unit_created') }));
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
          {t('units.back_to_units')}
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? t('units.edit_title') : t('units.create_title')}</h1>
          <p className="mb-0">{isEdit ? t('units.edit_subtitle') : t('units.create_subtitle')}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('units.building_label')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="buildingId"
                    control={control}
                    rules={{ required: t('units.select_building') }}
                    render={({ field }) => {
                      const buildingOptions = buildings.map((b) => ({
                        value: b.id,
                        label: isAr ? b.nameAr : b.nameEn,
                      }));
                      const selectedOption = buildingOptions.find(
                        (opt) => String(opt.value) === String(field.value)
                      ) || null;
                      return (
                        <Select
                          {...field}
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={buildingOptions}
                          placeholder={t('units.select_building')}
                          isClearable
                          isSearchable
                          isRtl={isAr}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '38px',
                              borderColor: errors.buildingId ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6',
                              boxShadow: errors.buildingId
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
                  {errors.buildingId && (
                    <div className="invalid-feedback d-block">{errors.buildingId.message}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('units.unit_number')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('units.unit_number_placeholder')}
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
                  <Form.Label>{t('units.floor')} <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>{t('units.bedrooms')} <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>{t('units.bathrooms')} <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>{t('units.area')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder={t('units.area_placeholder')}
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
                  <Form.Label>{t('units.rent_amount')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder={t('units.rent_placeholder')}
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
                  <Form.Label>{t('units.type')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: t('units.select_type') }}
                    render={({ field }) => {
                      const typeOptions = [
                        { value: 'APARTMENT', label: t('units.apartment') },
                        { value: 'STUDIO', label: t('units.studio') },
                        { value: 'VILLA', label: t('units.villa') },
                        { value: 'OFFICE', label: t('units.office') },
                        { value: 'SHOP', label: t('units.shop') },
                      ];
                      const selectedOption = typeOptions.find(
                        (opt) => opt.value === field.value
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={typeOptions}
                          placeholder={t('units.select_type')}
                          isClearable
                          isSearchable
                          isRtl={isAr}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '38px',
                              borderColor: errors.type ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6',
                              boxShadow: errors.type
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
                  {errors.type && (
                    <div className="invalid-feedback d-block">{errors.type.message}</div>
                  )}
                </Form.Group>
              </Col>
              {isEdit && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('units.status')}</Form.Label>
                    {currentUnit?.status === 'RENTED' ? (
                      <>
                        <Form.Control
                          type="text"
                          value={t('units.rented_managed')}
                          disabled
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          {t('units.end_tenancy_note')}
                        </Form.Text>
                      </>
                    ) : (
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => {
                          const statusOptions = [
                            { value: 'AVAILABLE', label: t('units.available') },
                            { value: 'UNAVAILABLE', label: t('units.unavailable') },
                          ];
                          const selectedOption = statusOptions.find(
                            (opt) => opt.value === field.value
                          ) || null;
                          return (
                            <Select
                              value={selectedOption}
                              onChange={(opt) => field.onChange(opt ? opt.value : '')}
                              options={statusOptions}
                              placeholder={t('units.status')}
                              isSearchable
                              isRtl={isAr}
                              styles={{
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: '38px',
                                  borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                                  boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                                  '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' },
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                              }}
                            />
                          );
                        }}
                      />
                    )}
                  </Form.Group>
                </Col>
              )}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/units')}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? t('units.updating') : t('units.creating')}
                  </>
                ) : (
                  isEdit ? t('units.update_unit') : t('units.create_unit')
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
