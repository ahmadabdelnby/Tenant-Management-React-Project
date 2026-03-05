// ============================================
// Building Payment Summary Page
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card, Table, Button, Form, Row, Col, Badge, Spinner, ProgressBar,
} from 'react-bootstrap';
import { fetchBuildingSummary, createPaymentLink } from '../../store/slices/paymentsSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { paymentsService } from '../../services';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_AR = [
  '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const BuildingPaymentSummary = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const monthNames = isAr ? MONTH_NAMES_AR : MONTH_NAMES;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { buildingSummary, isLoading } = useSelector((state) => state.payments);
  const { buildings } = useSelector((state) => state.buildings);

  const now = new Date();
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [exporting, setExporting] = useState(false);
  const [creatingLink, setCreatingLink] = useState(null);

  useEffect(() => {
    dispatch(fetchBuildings({ limit: 0 }));
  }, [dispatch]);

  const loadSummary = useCallback(() => {
    if (selectedBuilding && month && year) {
      dispatch(fetchBuildingSummary({
        buildingId: selectedBuilding,
        month,
        year,
      }));
    }
  }, [dispatch, selectedBuilding, month, year]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleCreateLink = async (paymentId) => {
    setCreatingLink(paymentId);
    try {
      await dispatch(createPaymentLink(paymentId)).unwrap();
      dispatch(showNotification({
        type: 'success',
        message: t('notifications.payment_link_created'),
      }));
      loadSummary();
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    } finally {
      setCreatingLink(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await paymentsService.exportExcel({
        buildingId: selectedBuilding,
        month,
        year,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Building_Payment_${MONTH_NAMES[month]}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      dispatch(showNotification({ type: 'success', message: t('notifications.excel_downloaded') }));
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: t('notifications.export_failed') }));
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PAID: 'success',
      PENDING: 'warning',
      OVERDUE: 'danger',
      PARTIALLY_PAID: 'info',
      NO_RECORD: 'secondary',
    };
    const labels = {
      PAID: t('payments_page.status_paid'),
      PENDING: t('payments_page.status_pending'),
      OVERDUE: t('payments_page.status_overdue'),
      PARTIALLY_PAID: t('payments_page.status_partial'),
      NO_RECORD: t('payments_page.status_no_record'),
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const summary = buildingSummary?.summary;
  const paidPercentage = summary && summary.totalTenants > 0
    ? Math.round((summary.paidCount / summary.totalTenants) * 100)
    : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1><i className="bi bi-building me-2"></i>{t('building_summary.title')}</h1>
          <p className="mb-0">{t('building_summary.subtitle')}</p>
        </div>
        {selectedBuilding && (
          <Button
            variant="outline-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>
            {exporting ? t('payments_page.exporting') : t('payments_page.export_excel')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="small text-muted">{t('payments_page.building')}</Form.Label>
              <Select
                value={(buildings || []).map(b => ({
                  value: b.id,
                  label: isAr ? (b.nameAr || b.nameEn || b.name) : (b.nameEn || b.name),
                })).find(opt => String(opt.value) === String(selectedBuilding)) || null}
                onChange={(opt) => setSelectedBuilding(opt ? opt.value : '')}
                options={(buildings || []).map(b => ({
                  value: b.id,
                  label: isAr ? (b.nameAr || b.nameEn || b.name) : (b.nameEn || b.name),
                }))}
                placeholder={t('building_summary.select_building')}
                isClearable
                isSearchable
                isRtl={isAr}
                styles={{
                  control: (base, state) => ({
                    ...base, minHeight: '38px',
                    borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="small text-muted">{t('payments_page.month')}</Form.Label>
              <Select
                value={monthNames.slice(1).map((name, i) => ({ value: i + 1, label: name })).find(opt => opt.value === month) || null}
                onChange={(opt) => setMonth(opt ? opt.value : '')}
                options={monthNames.slice(1).map((name, i) => ({ value: i + 1, label: name }))}
                isSearchable
                isRtl={isAr}
                styles={{
                  control: (base, state) => ({
                    ...base, minHeight: '38px',
                    borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">{t('payments_page.year')}</Form.Label>
              <Select
                value={[2024, 2025, 2026].map(y => ({ value: y, label: String(y) })).find(opt => opt.value === year) || null}
                onChange={(opt) => setYear(opt ? opt.value : '')}
                options={[2024, 2025, 2026].map(y => ({ value: y, label: String(y) }))}
                isSearchable
                isRtl={isAr}
                styles={{
                  control: (base, state) => ({
                    ...base, minHeight: '38px',
                    borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
                    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1" style={{ color: 'var(--navy-dark)' }}>
                  {summary.totalTenants}
                </h3>
                <small className="text-muted">{t('building_summary.total_tenants')}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-success">{summary.paidCount}</h3>
                <small className="text-muted">{t('payments_page.status_paid')}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-warning">{summary.totalPending}</h3>
                <small className="text-muted">{t('payments_page.status_pending')}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-danger">{summary.totalOverdue}</h3>
                <small className="text-muted">{t('payments_page.status_overdue')}</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Progress Bar */}
      {summary && summary.totalTenants > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-semibold">{t('building_summary.collection_progress')}</span>
              <span className="fw-semibold">{paidPercentage}%</span>
            </div>
            <ProgressBar>
              <ProgressBar striped variant="success" now={paidPercentage} key={1} />
            </ProgressBar>
            <div className="d-flex justify-content-between mt-2">
              <small className="text-muted">
                {t('building_summary.collected')}: {summary.totalPaid?.toFixed(3)} {t('common.kwd')}
              </small>
              <small className="text-muted">
                {t('building_summary.expected')}: {summary.totalExpected?.toFixed(3)} {t('common.kwd')}
              </small>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tenant Payment Details */}
      {!selectedBuilding ? (
        <Card>
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-building fs-1 d-block mb-2 opacity-50"></i>
            {t('building_summary.select_building_hint')}
          </Card.Body>
        </Card>
      ) : isLoading ? (
        <Card>
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header className="fw-semibold" style={{ backgroundColor: 'var(--beige-light)' }}>
            {monthNames[month]} {year} — {t('building_summary.payment_details')}
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>{t('building_summary.unit')}</th>
                  <th>{t('payments_page.tenant')}</th>
                  <th>{t('building_summary.contact')}</th>
                  <th>{t('building_summary.monthly_rent')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('payments_page.method')}</th>
                  <th>{t('building_summary.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {buildingSummary?.tenants?.length > 0 ? (
                  buildingSummary.tenants.map((tenant, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{tenant.unitNumber}</td>
                      <td>{tenant.tenantName}</td>
                      <td>
                        <small>
                          {tenant.tenantEmail}<br />
                          {tenant.tenantPhone || '-'}
                        </small>
                      </td>
                      <td className="fw-semibold">{tenant.monthlyRent?.toFixed(3)} {t('common.kwd')}</td>
                      <td>{getStatusBadge(tenant.paymentStatus)}</td>
                      <td><small>{tenant.paymentMethod || '-'}</small></td>
                      <td>
                        {tenant.paymentId && tenant.paymentStatus !== 'PAID' && (
                          <div className="d-flex gap-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-success p-1"
                              onClick={() => handleCreateLink(tenant.paymentId)}
                              disabled={creatingLink === tenant.paymentId}
                              title={t('payments_page.create_link_notify')}
                            >
                              {creatingLink === tenant.paymentId ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-link-45deg"></i>
                              )}
                            </Button>
                            {tenant.tahseeelPaymentLink && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-info p-1"
                                onClick={() => window.open(tenant.tahseeelPaymentLink, '_blank')}
                                title={t('payments_page.open_payment_link')}
                              >
                                <i className="bi bi-box-arrow-up-right"></i>
                              </Button>
                            )}
                          </div>
                        )}
                        {tenant.paymentStatus === 'PAID' && (
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            {tenant.paidAt ? new Date(tenant.paidAt).toLocaleDateString() : t('payments_page.status_paid')}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      {t('building_summary.no_tenancies')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default BuildingPaymentSummary;
