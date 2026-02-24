// ============================================
// Building Details Page - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { fetchBuildingById, clearCurrentBuilding } from '../../store/slices/buildingsSlice';

const BuildingDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentBuilding, isLoading } = useSelector((state) => state.buildings);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBuildingById(id));
    return () => {
      dispatch(clearCurrentBuilding());
    };
  }, [dispatch, id]);

  /**
   * Extract src URL from an iframe embed string
   */
  const extractMapSrc = (embedCode) => {
    if (!embedCode) return null;
    const match = embedCode.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  };

  if (isLoading || !currentBuilding) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading building details...</p>
      </div>
    );
  }

  const mapSrc = extractMapSrc(currentBuilding.mapEmbed);

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
        <div className="d-flex justify-content-between align-items-center">
          <div className="page-header mb-0">
            <h1>
              <i className="bi bi-building me-2"></i>
              {currentBuilding.name}
            </h1>
            <p className="mb-0">{currentBuilding.address}, {currentBuilding.city}</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button
              variant="primary"
              onClick={() => navigate(`/buildings/${id}/edit`)}
            >
              <i className="bi bi-pencil me-2"></i>
              Edit Building
            </Button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* Building Info Card */}
        <Col lg={mapSrc ? 6 : 12}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Building Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Building Name</small>
                <span className="fw-semibold">{currentBuilding.name}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Address</small>
                <span>{currentBuilding.address}</span>
              </div>
              <Row>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">City</small>
                    <span>{currentBuilding.city}</span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Country</small>
                    <span>{currentBuilding.country}</span>
                  </div>
                </Col>
              </Row>
              {currentBuilding.postalCode && (
                <div className="mb-3">
                  <small className="text-muted d-block">Postal Code</small>
                  <span>{currentBuilding.postalCode}</span>
                </div>
              )}
              <div className="mb-3">
                <small className="text-muted d-block">Total Units</small>
                <Badge bg="secondary">{currentBuilding.totalUnits || 0} units</Badge>
              </div>
              {currentBuilding.owner && (
                <div className="mb-0">
                  <small className="text-muted d-block">Owner</small>
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
        {mapSrc && (
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
                  Location
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '380px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Building Location"
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
