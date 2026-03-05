// ============================================
// Buildings List Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { fetchBuildings, deleteBuilding } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import Pagination from '../../components/Pagination';

const BuildingsList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { buildings, pagination, isLoading } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({ search: '' });
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const isAr = i18n.language?.startsWith('ar');

  useEffect(() => {
    dispatch(fetchBuildings({ ...filters, page, limit: 10 }));
  }, [dispatch, filters, page]);

  const handlePageChange = (newPage) => setPage(newPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (building) => {
    setSelectedBuilding(building);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteBuilding(selectedBuilding.id)).unwrap();
      dispatch(showNotification({ type: 'success', message: t('notifications.building_deleted') }));
      setShowDeleteModal(false);
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  // Helper to get localized building name
  const getBuildingName = (building) => isAr ? building.nameAr : building.nameEn;

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>{t('buildings.title')}</h1>
          <p className="mb-0">{t('buildings.subtitle')}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button variant="primary" onClick={() => navigate('/buildings/new')}>
            <i className="bi bi-plus-lg me-2"></i>
            {t('buildings.add_building')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={12}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="search"
                  placeholder={t('buildings.search_placeholder')}
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Buildings Table */}
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
                  <th>{t('buildings.building_col')}</th>
                  <th>{t('buildings.address_col')}</th>
                  <th>{t('buildings.city_col')}</th>
                  <th>{t('buildings.units_col')}</th>
                  <th>{t('buildings.owner_col')}</th>
                  <th>{t('buildings.actions_col')}</th>
                </tr>
              </thead>
              <tbody>
                {buildings.length > 0 ? (
                  buildings.map((building) => (
                    <tr key={building.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px',
                              backgroundColor: 'rgba(26, 54, 93, 0.1)',
                              color: 'var(--bs-primary)'
                            }}
                          >
                            <i className="bi bi-building"></i>
                          </div>
                          <div className="fw-semibold">{getBuildingName(building)}</div>
                        </div>
                      </td>
                      <td>{building.address}</td>
                      <td>{building.city}</td>
                      <td>
                        <Badge bg="secondary">{t('buildings.units_badge', { count: building.totalUnits || 0 })}</Badge>
                      </td>
                      <td>
                        {building.owner 
                          ? `${building.owner.firstName} ${building.owner.lastName}`
                          : t('common.na')}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => navigate(`/buildings/${building.id}`)}
                        >
                          {t('buildings.view')}
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-1"
                              onClick={() => navigate(`/buildings/${building.id}/edit`)}
                            >
                              {t('buildings.edit')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(building)}
                            >
                              {t('buildings.delete')}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {t('buildings.no_buildings')}
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
          <Modal.Title>{t('buildings.delete_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(t('buildings.delete_confirm', { name: selectedBuilding ? getBuildingName(selectedBuilding) : '' }))
          }} />
        </Modal.Body>
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

export default BuildingsList;
