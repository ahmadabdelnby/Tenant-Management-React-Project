// ============================================
// Units List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { fetchUnits, deleteUnit } from '../../store/slices/unitsSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import Pagination from '../../components/Pagination';

const UnitsList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { units, pagination, isLoading } = useSelector((state) => state.units);
  const { buildings } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({ status: '', type: '', buildingId: '' });
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';

  useEffect(() => {
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 100 }));
  }, [dispatch, isAdminOrOwner]);

  useEffect(() => {
    dispatch(fetchUnits({ ...filters, page, limit: 10 }));
  }, [dispatch, filters, page]);

  const handlePageChange = (newPage) => setPage(newPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (unit) => {
    setSelectedUnit(unit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteUnit(selectedUnit.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: t('notifications.unit_deleted') }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'RENTED': return 'primary';
      case 'UNAVAILABLE': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + t('common.kwd');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>{t('units.title')}</h1>
          <p className="mb-0">{t('units.subtitle')}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button variant="primary" onClick={() => navigate('/units/new')}>
            <i className="bi bi-plus-lg me-2"></i>
            {t('units.add_unit')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            {isAdminOrOwner && (
              <Col md={3}>
                <Form.Select
                  name="buildingId"
                  value={filters.buildingId}
                  onChange={handleFilterChange}
                >
                  <option value="">{t('units.all_buildings')}</option>
                  {buildings?.map((b) => (
                    <option key={b.id} value={b.id}>{isAr ? b.nameAr : b.nameEn}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={3}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">{t('units.all_statuses')}</option>
                <option value="AVAILABLE">{t('units.available')}</option>
                <option value="RENTED">{t('units.rented')}</option>
                <option value="UNAVAILABLE">{t('units.unavailable')}</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">{t('units.all_types')}</option>
                <option value="APARTMENT">{t('units.apartment')}</option>
                <option value="STUDIO">{t('units.studio')}</option>
                <option value="VILLA">{t('units.villa')}</option>
                <option value="OFFICE">{t('units.office')}</option>
                <option value="SHOP">{t('units.shop')}</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Units Table */}
      <Card>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>{t('units.unit_col')}</th>
                  <th>{t('units.building_col')}</th>
                  <th>{t('units.type_col')}</th>
                  <th>{t('units.details_col')}</th>
                  <th>{t('units.rent_col')}</th>
                  <th>{t('units.status_col')}</th>
                  <th>{t('units.actions_col')}</th>
                </tr>
              </thead>
              <tbody>
                {units.length > 0 ? (
                  units.map((unit) => (
                    <tr key={unit.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px',
                              backgroundColor: 'rgba(212, 184, 150, 0.3)',
                              color: 'var(--beige-dark)'
                            }}
                          >
                            <i className="bi bi-door-open"></i>
                          </div>
                          <div className="fw-semibold">{unit.unitNumber}</div>
                        </div>
                      </td>
                      <td>{isAr ? (unit.building?.nameAr || unit.building?.nameEn) : (unit.building?.nameEn || unit.building?.name) || t('common.na')}</td>
                      <td>{t(`units.${unit.type?.toLowerCase()}`) || unit.type}</td>
                      <td>
                        <small>
                          <i className="bi bi-door-closed me-1"></i>{unit.bedrooms} {t('units.bed')}
                          <i className="bi bi-droplet ms-2 me-1"></i>{unit.bathrooms} {t('units.bath')}
                          <i className="bi bi-arrows-fullscreen ms-2 me-1"></i>{unit.area}m²
                        </small>
                      </td>
                      <td>{formatCurrency(unit.rentAmount)}</td>
                      <td>
                        <Badge bg={getStatusBadge(unit.status)}>{t(`units.${unit.status?.toLowerCase()}`) || unit.status}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-1"
                          onClick={() => navigate(`/buildings/${unit.buildingId || unit.building?.id}`)}
                          title="View Building"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primary p-1"
                              onClick={() => navigate(`/units/${unit.id}/edit`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-1"
                              onClick={() => handleDelete(unit)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      {t('units.no_units')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </Card>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('units.delete_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('units.delete_confirm', { name: selectedUnit?.unitNumber })) }}
        />
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UnitsList;
