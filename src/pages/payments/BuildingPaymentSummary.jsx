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

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BuildingPaymentSummary = () => {
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
    dispatch(fetchBuildings({}));
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
        message: 'Payment link created & notification sent',
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
      dispatch(showNotification({ type: 'success', message: 'Report downloaded' }));
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: 'Failed to export' }));
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
      PAID: 'Paid',
      PENDING: 'Pending',
      OVERDUE: 'Overdue',
      PARTIALLY_PAID: 'Partial',
      NO_RECORD: 'No Record',
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
          <h1><i className="bi bi-building me-2"></i>Building Payment Summary</h1>
          <p className="mb-0">View payment status per building</p>
        </div>
        {selectedBuilding && (
          <Button
            variant="outline-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="small text-muted">Building</Form.Label>
              <Form.Select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                <option value="">Select Building</option>
                {buildings?.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small text-muted">Month</Form.Label>
              <Form.Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">Year</Form.Label>
              <Form.Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
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
                <small className="text-muted">Total Tenants</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-success">{summary.paidCount}</h3>
                <small className="text-muted">Paid</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-warning">{summary.totalPending}</h3>
                <small className="text-muted">Pending</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <h3 className="mb-1 text-danger">{summary.totalOverdue}</h3>
                <small className="text-muted">Overdue</small>
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
              <span className="fw-semibold">Collection Progress</span>
              <span className="fw-semibold">{paidPercentage}%</span>
            </div>
            <ProgressBar>
              <ProgressBar striped variant="success" now={paidPercentage} key={1} />
            </ProgressBar>
            <div className="d-flex justify-content-between mt-2">
              <small className="text-muted">
                Collected: {summary.totalPaid?.toFixed(3)} KWD
              </small>
              <small className="text-muted">
                Expected: {summary.totalExpected?.toFixed(3)} KWD
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
            Select a building to view payment details
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
            {MONTH_NAMES[month]} {year} — Payment Details
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Tenant</th>
                  <th>Contact</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildingSummary?.tenants?.length > 0 ? (
                  buildingSummary.tenants.map((t, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{t.unitNumber}</td>
                      <td>{t.tenantName}</td>
                      <td>
                        <small>
                          {t.tenantEmail}<br />
                          {t.tenantPhone || '-'}
                        </small>
                      </td>
                      <td className="fw-semibold">{t.monthlyRent?.toFixed(3)} KWD</td>
                      <td>{getStatusBadge(t.paymentStatus)}</td>
                      <td><small>{t.paymentMethod || '-'}</small></td>
                      <td>
                        {t.paymentId && t.paymentStatus !== 'PAID' && (
                          <div className="d-flex gap-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-success p-1"
                              onClick={() => handleCreateLink(t.paymentId)}
                              disabled={creatingLink === t.paymentId}
                              title="Create Payment Link"
                            >
                              {creatingLink === t.paymentId ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-link-45deg"></i>
                              )}
                            </Button>
                            {t.tahseeelPaymentLink && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-info p-1"
                                onClick={() => window.open(t.tahseeelPaymentLink, '_blank')}
                                title="Open Payment Link"
                              >
                                <i className="bi bi-box-arrow-up-right"></i>
                              </Button>
                            )}
                          </div>
                        )}
                        {t.paymentStatus === 'PAID' && (
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            {t.paidAt ? new Date(t.paidAt).toLocaleDateString() : 'Paid'}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No active tenancies found for this building
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
