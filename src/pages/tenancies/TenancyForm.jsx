// ============================================
// Tenancy Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
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

const quillToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'list', 'link'];

const QuillEditor = ({ value = '', onChange, placeholder, isRtl = false }) => {
  const editorContainerRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorContainerRef.current || quillInstanceRef.current) {
      return undefined;
    }

    const quill = new Quill(editorContainerRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: quillToolbar,
      },
      formats: quillFormats,
    });

    quillInstanceRef.current = quill;
    quill.root.innerHTML = value || '';
    quill.root.style.direction = isRtl ? 'rtl' : 'ltr';
    quill.root.style.textAlign = isRtl ? 'right' : 'left';

    const handleChange = () => {
      const html = quill.root.innerHTML;
      const empty = quill.getLength() <= 1;
      onChangeRef.current(empty ? '' : html);
    };

    quill.on('text-change', handleChange);

    return () => {
      quill.off('text-change', handleChange);
      quillInstanceRef.current = null;
      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = '';
      }
    };
  }, [isRtl, placeholder]);

  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (!quill) return;

    const currentValue = quill.root.innerHTML;
    const nextValue = value || '';

    if (currentValue !== nextValue) {
      const selection = quill.getSelection();
      quill.root.innerHTML = nextValue;
      if (selection) {
        quill.setSelection(selection);
      }
    }
  }, [value]);

  return <div ref={editorContainerRef} />;
};

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
    control,
    formState: { errors },
  } = useForm();

  const selectedBuildingId = watch('buildingId');
  const selectedUnitId = watch('unitId');

  useEffect(() => {
    dispatch(fetchBuildings({ limit: 0 }));
    dispatch(fetchUsers({ role: 'TENANT', limit: 0 }));
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
      dispatch(fetchUnits({ buildingId: selectedBuildingId, limit: 0 }));
    }
  }, [dispatch, selectedBuildingId]);

  // When editing, set the building from the current tenancy
  useEffect(() => {
    if (currentTenancy && isEdit) {
      // Set buildingId first so units load
      setValue('buildingId', currentTenancy.unit?.buildingId?.toString() || '');
      // Then fetch units for that building
      if (currentTenancy.unit?.buildingId) {
        dispatch(fetchUnits({ buildingId: currentTenancy.unit.buildingId, limit: 0 }));
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
        firstPartyName: currentTenancy.firstPartyName || '',
        firstPartyId: currentTenancy.firstPartyId || '',
        secondPartyName: currentTenancy.secondPartyName || '',
        secondPartyId: currentTenancy.secondPartyId || '',
        contractDuration: currentTenancy.contractDuration || '',
        contractNotes: currentTenancy.contractNotes || '',
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
      firstPartyName: data.firstPartyName || '',
      firstPartyId: data.firstPartyId || '',
      secondPartyName: data.secondPartyName || '',
      secondPartyId: data.secondPartyId || '',
      contractDuration: data.contractDuration || '',
      contractNotes: data.contractNotes || '',
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
                  <Controller
                    name="tenantId"
                    control={control}
                    rules={{ required: t('tenancies.select_tenant') }}
                    render={({ field }) => {
                      const tenantOptions = tenants.map((tenant) => ({
                        value: tenant.id,
                        label: `${tenant.firstName} ${tenant.lastName} (${tenant.email})`,
                      }));
                      const selectedOption = tenantOptions.find(
                        (opt) => String(opt.value) === String(field.value)
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={tenantOptions}
                          placeholder={t('tenancies.select_tenant')}
                          isClearable
                          isSearchable
                          isRtl={isAr}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '38px',
                              borderColor: errors.tenantId ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6',
                              boxShadow: errors.tenantId
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
                  {errors.tenantId && (
                    <div className="invalid-feedback d-block">{errors.tenantId.message}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('tenancies.building_label')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="buildingId"
                    control={control}
                    rules={{ required: t('tenancies.select_building') }}
                    render={({ field }) => {
                      const buildingOptions = buildings.map((b) => ({
                        value: b.id,
                        label: `${isAr ? b.nameAr : b.nameEn} — ${b.address}`,
                      }));
                      const selectedOption = buildingOptions.find(
                        (opt) => String(opt.value) === String(field.value)
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => {
                            field.onChange(opt ? opt.value : '');
                            setValue('unitId', '');
                          }}
                          options={buildingOptions}
                          placeholder={t('tenancies.select_building')}
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
                  <Form.Label>{t('tenancies.unit_label')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="unitId"
                    control={control}
                    rules={{ required: t('tenancies.select_unit') }}
                    render={({ field }) => {
                      const unitOptions = availableUnits.map((unit) => ({
                        value: unit.id,
                        label: `${unit.unitNumber} (${unit.type}) — ${unit.status}`,
                      }));
                      const selectedOption = unitOptions.find(
                        (opt) => String(opt.value) === String(field.value)
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={unitOptions}
                          placeholder={selectedBuildingId ? t('tenancies.select_unit') : t('tenancies.select_building_first')}
                          isClearable
                          isSearchable
                          isDisabled={!selectedBuildingId}
                          isRtl={isAr}
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

            {/* Contract Details Section */}
            <div className="mt-4 pt-3 border-top">
              <h5 className="mb-3">تفاصيل العقد</h5>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>اسم الطرف الأول (المؤجر)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="أدخل اسم المؤجر"
                      {...register('firstPartyName')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم هوية الطرف الأول</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="أدخل رقم الهوية"
                      {...register('firstPartyId')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>اسم الطرف الثاني (المستأجر)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="أدخل اسم المستأجر"
                      {...register('secondPartyName')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم هوية الطرف الثاني</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="أدخل رقم الهوية"
                      {...register('secondPartyId')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>مدة التعاقد</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="مثال: سنة واحدة / 12 شهراً"
                      {...register('contractDuration')}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Rich Text Editor for Contract Notes */}
              <Form.Group className="mt-3">
                <Form.Label>ملاحظات العقد</Form.Label>
                <Controller
                  name="contractNotes"
                  control={control}
                  render={({ field }) => (
                    <div style={{ marginBottom: '40px' }}>
                      <QuillEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="أدخل ملاحظات العقد..."
                        isRtl={isAr}
                      />
                    </div>
                  )}
                />
              </Form.Group>
            </div>

            <Row className="g-3">
              <Col md={12}>
                {isEdit && (
                  <Form.Group>
                    <Form.Label>{t('tenancies.status_col')}</Form.Label>
                    <Form.Check
                      type="switch"
                      id="isActive"
                      label={watch('isActive') ? t('users.active') : t('users.inactive')}
                      {...register('isActive')}
                    />
                  </Form.Group>
                )}
              </Col>
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
