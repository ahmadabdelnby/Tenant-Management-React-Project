// ============================================
// Building Details Page - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { fetchBuildingById, clearCurrentBuilding } from '../../store/slices/buildingsSlice';
import LocationViewer from '../../components/maps/LocationViewer';

const BuildingDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentBuilding, isLoading } = useSelector((state) => state.buildings);
  const { user } = useSelector((state) => state.auth);

  const isAr = i18n.language?.startsWith('ar');

  useEffect(() => {
    dispatch(fetchBuildingById(id));
    return () => {
      dispatch(clearCurrentBuilding());
    };
  }, [dispatch, id]);

  const hasLocation = currentBuilding?.latitude && currentBuilding?.longitude;

  // Get localized fields
  const buildingName = isAr ? currentBuilding?.nameAr : currentBuilding?.nameEn;
  const buildingDesc = isAr ? currentBuilding?.descriptionAr : currentBuilding?.descriptionEn;

  if (isLoading || !currentBuilding) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => user?.role === 'TENANT' ? navigate(-1) : navigate('/buildings')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {user?.role === 'TENANT' ? t('buildings.back_to_tenancy') : t('buildings.back_to_buildings')}
        </Button>
        <div className="d-flex justify-content-between align-items-center">
          <div className="page-header mb-0">
            <h1>
              <i className="bi bi-building me-2"></i>
              {buildingName}
            </h1>
            <p className="mb-0">{currentBuilding.address}, {currentBuilding.city}</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button
              variant="primary"
              onClick={() => navigate(`/buildings/${id}/edit`)}
            >
              <i className="bi bi-pencil me-2"></i>
              {t('buildings.edit_building')}
            </Button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* Building Info Card */}
        <Col lg={hasLocation ? 6 : 12}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                {t('buildings.building_info')}
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">{t('buildings.building_name')}</small>
                <span className="fw-semibold">{buildingName}</span>
                {/* Show the other language name as secondary */}
                <br />
                <small className="text-muted">{isAr ? currentBuilding.nameEn : currentBuilding.nameAr}</small>
              </div>
              {buildingDesc && (
                <div className="mb-3">
                  <small className="text-muted d-block">{t('buildings.description_label')}</small>
                  <span>{buildingDesc}</span>
                </div>
              )}
              <div className="mb-3">
                <small className="text-muted d-block">{t('buildings.address_label')}</small>
                <span>{currentBuilding.address}</span>
              </div>
              <Row>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">{t('buildings.city_label')}</small>
                    <span>{currentBuilding.city}</span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">{t('buildings.country_label')}</small>
                    <span>{currentBuilding.country}</span>
                  </div>
                </Col>
              </Row>
              {currentBuilding.postalCode && (
                <div className="mb-3">
                  <small className="text-muted d-block">{t('buildings.postal_code_label')}</small>
                  <span>{currentBuilding.postalCode}</span>
                </div>
              )}
              <div className="mb-3">
                <small className="text-muted d-block">{t('buildings.total_units_label')}</small>
                <Badge bg="secondary">{t('buildings.units_badge', { count: currentBuilding.totalUnits || 0 })}</Badge>
              </div>
              {currentBuilding.owner && (
                <div className="mb-0">
                  <small className="text-muted d-block">{t('buildings.owner_label')}</small>
                  <span className="fw-semibold">
                    {currentBuilding.owner.firstName} {currentBuilding.owner.lastName}
                  </span>
                  <br />
                  <small className="text-muted">{currentBuilding.owner.email}</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Map Card */}
        {hasLocation && (
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
                  {t('buildings.location')}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <LocationViewer
                  lat={currentBuilding.latitude}
                  lng={currentBuilding.longitude}
                />
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BuildingDetails;
