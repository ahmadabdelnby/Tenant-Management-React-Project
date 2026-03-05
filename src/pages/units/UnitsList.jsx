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
import SearchableSelect from '../../components/SearchableSelect';

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
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 0 }));
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
                <SearchableSelect
                  name="buildingId"
                  value={filters.buildingId}
                  onChange={handleFilterChange}
                  placeholder={t('units.all_buildings')}
                  options={[
                    { value: '', label: t('units.all_buildings') },
                    ...(buildings?.map((b) => ({ value: String(b.id), label: isAr ? b.nameAr : b.nameEn })) || []),
                  ]}
                />
              </Col>
            )}
            <Col md={3}>
              <SearchableSelect
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                placeholder={t('units.all_statuses')}
                options={[
                  { value: '', label: t('units.all_statuses') },
                  { value: 'AVAILABLE', label: t('units.available') },
                  { value: 'RENTED', label: t('units.rented') },
                  { value: 'UNAVAILABLE', label: t('units.unavailable') },
                ]}
              />
            </Col>
            <Col md={3}>
              <SearchableSelect
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                placeholder={t('units.all_types')}
                options={[
                  { value: '', label: t('units.all_types') },
                  { value: 'APARTMENT', label: t('units.apartment') },
                  { value: 'STUDIO', label: t('units.studio') },
                  { value: 'VILLA', label: t('units.villa') },
                  { value: 'OFFICE', label: t('units.office') },
                  { value: 'SHOP', label: t('units.shop') },
                ]}
              />
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
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => navigate(`/buildings/${unit.buildingId || unit.building?.id}`)}
                        >
                          {t('common.view')}
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-1"
                              onClick={() => navigate(`/units/${unit.id}/edit`)}
                            >
                              {t('common.edit')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(unit)}
                            >
                              {t('common.delete')}
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
