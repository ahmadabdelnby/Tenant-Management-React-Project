// ============================================
// Building Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createBuilding,
  updateBuilding,
  fetchBuildingById,
  clearCurrentBuilding,
} from '../../store/slices/buildingsSlice';
import { fetchUsers } from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';
import LocationPicker from '../../components/maps/LocationPicker';

const BuildingForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentBuilding, isLoading } = useSelector((state) => state.buildings);
  const { users } = useSelector((state) => state.users);
  const [owners, setOwners] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
        nameEn: currentBuilding.nameEn || '',
        nameAr: currentBuilding.nameAr || '',
        address: currentBuilding.address,
        city: currentBuilding.city,
        country: currentBuilding.country,
        postalCode: currentBuilding.postalCode || '',
        mapEmbed: currentBuilding.mapEmbed || '',
        descriptionEn: currentBuilding.descriptionEn || '',
        descriptionAr: currentBuilding.descriptionAr || '',
        ownerId: currentBuilding.owner?.id,
      });
      if (currentBuilding.latitude && currentBuilding.longitude) {
        setLocation({ lat: currentBuilding.latitude, lng: currentBuilding.longitude });
      }
    }
  }, [currentBuilding, isEdit, reset]);

  const handleLocationSelect = useCallback(({ lat, lng }) => {
    setLocation({ lat, lng });
  }, []);

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      ownerId: parseInt(data.ownerId),
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      if (isEdit) {
        await dispatch(updateBuilding({ id, data: formData })).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.building_updated') }));
      } else {
        await dispatch(createBuilding(formData)).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.building_created') }));
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
          {t('buildings.back_to_buildings')}
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? t('buildings.edit_title') : t('buildings.create_title')}</h1>
          <p className="mb-0">{isEdit ? t('buildings.edit_subtitle') : t('buildings.create_subtitle')}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              {/* Building Name (English) */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.building_name_en')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    dir="ltr"
                    placeholder={t('buildings.building_name_en_placeholder')}
                    isInvalid={!!errors.nameEn}
                    {...register('nameEn', {
                      required: t('common.name_en_required'),
                      minLength: { value: 2, message: t('common.min_chars', { count: 2 }) },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nameEn?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* Building Name (Arabic) */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.building_name_ar')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    dir="rtl"
                    placeholder={t('buildings.building_name_ar_placeholder')}
                    isInvalid={!!errors.nameAr}
                    {...register('nameAr', {
                      required: t('common.name_ar_required'),
                      minLength: { value: 2, message: t('common.min_chars', { count: 2 }) },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nameAr?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('buildings.address_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('buildings.address_placeholder')}
                    isInvalid={!!errors.address}
                    {...register('address', {
                      required: t('buildings.address_label') + ' is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.city_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('buildings.city_placeholder')}
                    isInvalid={!!errors.city}
                    {...register('city', {
                      required: t('buildings.city_label') + ' is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.city?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.country_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('buildings.country_placeholder')}
                    isInvalid={!!errors.country}
                    {...register('country', {
                      required: t('buildings.country_label') + ' is required',
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.country?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.postal_code_label')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('buildings.postal_code_placeholder')}
                    {...register('postalCode')}
                  />
                </Form.Group>
              </Col>
              {isEdit && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('buildings.total_units_label')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentBuilding?.totalUnits || 0}
                      disabled
                      readOnly
                    />
                    <Form.Text className="text-muted">
                      {t('buildings.total_units_note')}
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}
              <Col md={isEdit ? 12 : 6}>
                <Form.Group>
                  <Form.Label>{t('buildings.owner_label')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.ownerId}
                    {...register('ownerId', { required: t('buildings.owner_label') + ' is required' })}
                  >
                    <option value="">{t('buildings.select_owner')}</option>
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
              {/* Description (English) */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.description_en')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    dir="ltr"
                    placeholder={t('buildings.description_en_placeholder')}
                    {...register('descriptionEn')}
                  />
                </Form.Group>
              </Col>
              {/* Description (Arabic) */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('buildings.description_ar')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    dir="rtl"
                    placeholder={t('buildings.description_ar_placeholder')}
                    {...register('descriptionAr')}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    <i className="bi bi-geo-alt me-1"></i>
                    {t('buildings.building_location')}
                  </Form.Label>
                  <LocationPicker
                    latitude={location.lat}
                    longitude={location.lng}
                    onLocationSelect={handleLocationSelect}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/buildings')}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? t('buildings.updating') : t('buildings.creating')}
                  </>
                ) : (
                  isEdit ? t('buildings.update_btn') : t('buildings.create_btn')
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
