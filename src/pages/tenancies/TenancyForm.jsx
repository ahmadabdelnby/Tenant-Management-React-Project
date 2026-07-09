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

const moneyToArabicWords = (amount) => {
  const value = Number(amount || 0);
  if (!value) return 'صفر دينار كويتي';
  return `${new Intl.NumberFormat('ar-EG').format(value)} دينار كويتي`;
};

const QuillEditor = ({ value = '', onChange, placeholder, isRtl = false }) => {
  const editorContainerRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorContainerRef.current || quillInstanceRef.current) return undefined;

    const quill = new Quill(editorContainerRef.current, {
      theme: 'snow',
      placeholder,
      modules: { toolbar: quillToolbar },
      formats: quillFormats,
    });

    quillInstanceRef.current = quill;
    quill.root.innerHTML = value || '';
    quill.root.style.direction = isRtl ? 'rtl' : 'ltr';
    quill.root.style.textAlign = isRtl ? 'right' : 'left';

    const handleChange = () => {
      const html = quill.root.innerHTML;
      onChangeRef.current(quill.getLength() <= 1 ? '' : html);
    };

    quill.on('text-change', handleChange);

    return () => {
      quill.off('text-change', handleChange);
      quillInstanceRef.current = null;
      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = '';
      }
    };
  }, [isRtl, placeholder, value]);

  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (!quill) return;

    const currentValue = quill.root.innerHTML;
    const nextValue = value || '';
    if (currentValue !== nextValue) {
      const selection = quill.getSelection();
      quill.root.innerHTML = nextValue;
      if (selection) quill.setSelection(selection);
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
  const today = new Date().toISOString().split('T')[0];

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
  } = useForm({
    defaultValues: {
      contractPlace: 'الكويت',
      contractDate: today,
    },
  });

  const selectedBuildingId = watch('buildingId');
  const selectedUnitId = watch('unitId');
  const selectedBuilding = buildings.find((building) => String(building.id) === String(selectedBuildingId));
  const selectedUnit = availableUnits.find((unit) => String(unit.id) === String(selectedUnitId));

  useEffect(() => {
    dispatch(fetchBuildings({ limit: 0 }));
    dispatch(fetchUsers({ role: 'TENANT', limit: 0 }));
    if (isEdit) dispatch(fetchTenancyById(id));
    return () => dispatch(clearCurrentTenancy());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (selectedBuildingId) {
      dispatch(fetchUnits({ buildingId: selectedBuildingId, limit: 0 }));
    }
  }, [dispatch, selectedBuildingId]);

  useEffect(() => {
    if (currentTenancy && isEdit) {
      setValue('buildingId', currentTenancy.unit?.buildingId?.toString() || '');
      if (currentTenancy.unit?.buildingId) {
        dispatch(fetchUnits({ buildingId: currentTenancy.unit.buildingId, limit: 0 }));
      }
    }
  }, [currentTenancy, isEdit, setValue, dispatch]);

  useEffect(() => {
    const available = units.filter((unit) => unit.status === 'AVAILABLE' || (isEdit && unit.id === currentTenancy?.unit?.id));
    setAvailableUnits(available);
    setTenants(users.filter((user) => user.role === 'TENANT'));
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
        contractNumber: currentTenancy.contractNumber || '',
        contractPlace: currentTenancy.contractPlace || '',
        contractDate: currentTenancy.contractDate?.split('T')[0] || currentTenancy.contractDate || '',
        firstPartyName: currentTenancy.firstPartyName || '',
        firstPartyId: currentTenancy.firstPartyId || '',
        firstPartyNationality: currentTenancy.firstPartyNationality || '',
        firstPartyPhone: currentTenancy.firstPartyPhone || '',
        firstPartyAddress: currentTenancy.firstPartyAddress || '',
        secondPartyName: currentTenancy.secondPartyName || '',
        secondPartyId: currentTenancy.secondPartyId || '',
        secondPartyRepresentativeName: currentTenancy.secondPartyRepresentativeName || '',
        secondPartyRepresentativeCivilId: currentTenancy.secondPartyRepresentativeCivilId || '',
        secondPartyRepresentativeNationality: currentTenancy.secondPartyRepresentativeNationality || '',
        secondPartyRepresentativePhone: currentTenancy.secondPartyRepresentativePhone || '',
        secondPartyRepresentativeAddress: currentTenancy.secondPartyRepresentativeAddress || '',
        secondPartyNationality: currentTenancy.secondPartyNationality || '',
        secondPartyPhone: currentTenancy.secondPartyPhone || '',
        secondPartyAddress: currentTenancy.secondPartyAddress || '',
        contractDuration: currentTenancy.contractDuration || '',
        contractNotes: currentTenancy.contractNotes || '',
      });
    }
  }, [currentTenancy, isEdit, reset]);

  useEffect(() => {
    if (selectedUnitId && !isEdit) {
      const unit = units.find((item) => item.id === parseInt(selectedUnitId, 10));
      if (unit) setValue('monthlyRent', unit.rentAmount);
    }
  }, [selectedUnitId, units, setValue, isEdit]);

  const onSubmit = async (data) => {
    const formData = {
      tenantId: parseInt(data.tenantId, 10),
      unitId: parseInt(data.unitId, 10),
      startDate: data.startDate,
      endDate: data.endDate,
      monthlyRent: parseFloat(data.monthlyRent),
      depositAmount: parseFloat(data.depositAmount),
      isActive: isEdit ? Boolean(data.isActive) : true,
      contractNumber: data.contractNumber || '',
      contractPlace: data.contractPlace || '',
      contractDate: data.contractDate || '',
      firstPartyName: data.firstPartyName || '',
      firstPartyId: data.firstPartyId || '',
      firstPartyNationality: data.firstPartyNationality || '',
      firstPartyPhone: data.firstPartyPhone || '',
      firstPartyAddress: data.firstPartyAddress || '',
      secondPartyName: data.secondPartyName || '',
      secondPartyId: data.secondPartyId || '',
      secondPartyRepresentativeName: data.secondPartyRepresentativeName || '',
      secondPartyRepresentativeCivilId: data.secondPartyRepresentativeCivilId || '',
      secondPartyRepresentativeNationality: data.secondPartyRepresentativeNationality || '',
      secondPartyRepresentativePhone: data.secondPartyRepresentativePhone || '',
      secondPartyRepresentativeAddress: data.secondPartyRepresentativeAddress || '',
      secondPartyNationality: data.secondPartyNationality || '',
      secondPartyPhone: data.secondPartyPhone || '',
      secondPartyAddress: data.secondPartyAddress || '',
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
      <div className="mb-4">
        <Button variant="link" className="p-0 text-decoration-none mb-3" onClick={() => navigate('/tenancies')} style={{ color: 'var(--navy-dark)' }}>
          <i className="bi bi-arrow-left me-2"></i>
          {t('tenancies.back_to_tenancies')}
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? t('tenancies.edit_title') : t('tenancies.create_title')}</h1>
          <p className="mb-0">{isEdit ? t('tenancies.edit_subtitle') : t('tenancies.create_subtitle')}</p>
        </div>
      </div>

      <Card style={{ maxWidth: '980px' }}>
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
                      const selectedOption = tenantOptions.find((option) => String(option.value) === String(field.value)) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(option) => field.onChange(option ? option.value : '')}
                          options={tenantOptions}
                          placeholder={t('tenancies.select_tenant')}
                          isClearable
                          isSearchable
                          isRtl={isAr}
                        />
                      );
                    }}
                  />
                  {errors.tenantId && <div className="invalid-feedback d-block">{errors.tenantId.message}</div>}
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
                      const buildingOptions = buildings.map((building) => ({
                        value: building.id,
                        label: `${isAr ? building.nameAr : building.nameEn}${building.area ? ` - ${building.area}` : ''}`,
                      }));
                      const selectedOption = buildingOptions.find((option) => String(option.value) === String(field.value)) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(option) => {
                            field.onChange(option ? option.value : '');
                            setValue('unitId', '');
                          }}
                          options={buildingOptions}
                          placeholder={t('tenancies.select_building')}
                          isClearable
                          isSearchable
                          isRtl={isAr}
                        />
                      );
                    }}
                  />
                  {errors.buildingId && <div className="invalid-feedback d-block">{errors.buildingId.message}</div>}
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
                        label: `${unit.unitNumber} (${unit.type || 'UNIT'}) — ${unit.status}`,
                      }));
                      const selectedOption = unitOptions.find((option) => String(option.value) === String(field.value)) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(option) => field.onChange(option ? option.value : '')}
                          options={unitOptions}
                          placeholder={selectedBuildingId ? t('tenancies.select_unit') : t('tenancies.select_building_first')}
                          isClearable
                          isSearchable
                          isDisabled={!selectedBuildingId}
                          isRtl={isAr}
                        />
                      );
                    }}
                  />
                  {errors.unitId && <div className="invalid-feedback d-block">{errors.unitId.message}</div>}
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>{t('tenancies.start_date')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" isInvalid={!!errors.startDate} {...register('startDate', { required: 'Start date is required' })} />
                  <Form.Control.Feedback type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>{t('tenancies.end_date')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" isInvalid={!!errors.endDate} {...register('endDate', { required: 'End date is required' })} />
                  <Form.Control.Feedback type="invalid">{errors.endDate?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>{t('tenancies.monthly_rent_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" min="0" isInvalid={!!errors.monthlyRent} {...register('monthlyRent', { required: 'Monthly rent is required', min: { value: 0, message: 'Min 0' } })} />
                  <Form.Control.Feedback type="invalid">{errors.monthlyRent?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>{t('tenancies.deposit_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" min="0" isInvalid={!!errors.depositAmount} {...register('depositAmount', { required: 'Deposit is required', min: { value: 0, message: 'Min 0' } })} />
                  <Form.Control.Feedback type="invalid">{errors.depositAmount?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {isEdit && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t('tenancies.status_col')}</Form.Label>
                    <Form.Check type="switch" id="isActive" label={watch('isActive') ? t('users.active') : t('users.inactive')} {...register('isActive')} />
                  </Form.Group>
                </Col>
              )}
            </Row>

            <div className="mt-4 pt-3 border-top">
              <h5 className="mb-3">بيانات العقد</h5>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>رقم العقد</Form.Label>
                    <Form.Control type="text" placeholder="مثال: 593" {...register('contractNumber')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>مكان تحرير العقد</Form.Label>
                    <Form.Control type="text" placeholder="مثال: الكويت" {...register('contractPlace')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>يوم تحرير العقد</Form.Label>
                    <Form.Control type="date" {...register('contractDate')} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>اسم الطرف الأول</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الاسم" {...register('firstPartyName')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الرقم المدني للطرف الأول</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الرقم المدني" {...register('firstPartyId')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>جنسية الطرف الأول</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الجنسية" {...register('firstPartyNationality')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>هاتف الطرف الأول</Form.Label>
                    <Form.Control type="text" placeholder="أدخل رقم الهاتف" {...register('firstPartyPhone')} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>محل إقامة الطرف الأول</Form.Label>
                    <Form.Control type="text" placeholder="أدخل محل الإقامة" {...register('firstPartyAddress')} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>اسم الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل اسم الطرف الثاني" {...register('secondPartyName')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الرقم المدني للطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الرقم المدني" {...register('secondPartyId')} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>اسم ممثل الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل اسم الممثل" {...register('secondPartyRepresentativeName')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الرقم المدني لممثل الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الرقم المدني" {...register('secondPartyRepresentativeCivilId')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>جنسية ممثل الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الجنسية" {...register('secondPartyRepresentativeNationality')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>هاتف ممثل الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل رقم الهاتف" {...register('secondPartyRepresentativePhone')} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>محل إقامة ممثل الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل محل الإقامة" {...register('secondPartyRepresentativeAddress')} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>جنسية الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل الجنسية" {...register('secondPartyNationality')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>هاتف الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل رقم الهاتف" {...register('secondPartyPhone')} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>محل إقامة الطرف الثاني</Form.Label>
                    <Form.Control type="text" placeholder="أدخل محل الإقامة" {...register('secondPartyAddress')} />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-3">عنوان الوحدة السكنية</h6>
                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label>رقم الوحدة السكنية</Form.Label><Form.Control type="text" placeholder="اكتب رقم الوحدة" {...register('unitNumberManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>الرقم الآلي للعنوان</Form.Label><Form.Control type="text" placeholder="اكتب الرقم الآلي" {...register('buildingNumberManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>اسم المنطقة</Form.Label><Form.Control type="text" placeholder="اكتب اسم المنطقة" {...register('buildingAreaManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>رقم القطعة</Form.Label><Form.Control type="text" placeholder="اكتب رقم القطعة" {...register('buildingBlockManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>رقم الشارع</Form.Label><Form.Control type="text" placeholder="اكتب رقم الشارع" {...register('buildingStreetManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>رقم القسيمة</Form.Label><Form.Control type="text" placeholder="اكتب رقم القسيمة" {...register('buildingPlotManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>الدور</Form.Label><Form.Control type="text" placeholder="اكتب الدور" {...register('unitFloorManual')} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>الأجرة الشهرية بالأرقام</Form.Label><Form.Control type="text" placeholder="اكتب الأجرة الشهرية بالأرقام" defaultValue={watch('monthlyRent') || ''} /></Form.Group></Col>
                  <Col md={12}><Form.Group><Form.Label>الأجرة الشهرية بالكلمات</Form.Label><Form.Control type="text" placeholder="اكتب الأجرة الشهرية بالكلمات" defaultValue={moneyToArabicWords(watch('monthlyRent'))} /></Form.Group></Col>
                </Row>
              </div>

              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-3">مدة العقد</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>تاريخ بداية العقد</Form.Label>
                      <Form.Control type="date" isInvalid={!!errors.startDate} {...register('startDate', { required: 'Start date is required' })} />
                      <Form.Control.Feedback type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>تاريخ نهاية العقد</Form.Label>
                      <Form.Control type="date" isInvalid={!!errors.endDate} {...register('endDate', { required: 'End date is required' })} />
                      <Form.Control.Feedback type="invalid">{errors.endDate?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>مدة التعاقد</Form.Label>
                      <Form.Control type="text" placeholder="مثال: سنة واحدة / 12 شهراً" {...register('contractDuration')} />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-3">ملاحظات العقد</h6>
                <Form.Group>
                  <Controller
                    name="contractNotes"
                    control={control}
                    render={({ field }) => (
                      <div style={{ marginBottom: '40px' }}>
                        <QuillEditor value={field.value} onChange={field.onChange} placeholder="أدخل ملاحظات العقد..." isRtl={isAr} />
                      </div>
                    )}
                  />
                </Form.Group>
              </div>

            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/tenancies')}>{t('common.cancel')}</Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (<><Spinner animation="border" size="sm" className="me-2" />{isEdit ? t('tenancies.updating') : t('tenancies.creating')}</>) : (isEdit ? t('tenancies.update_tenancy') : t('tenancies.create_tenancy'))}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TenancyForm;