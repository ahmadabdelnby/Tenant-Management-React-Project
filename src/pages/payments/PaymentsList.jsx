// ============================================
// Payments List Page - Monthly Payment Tracking
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card, Table, Button, Form, Row, Col, Badge, Modal, Spinner, Alert,
} from 'react-bootstrap';
import {
  fetchPayments, generateMonthlyPayments, updatePayment, createPaymentLink,
} from '../../store/slices/paymentsSlice';
import { fetchBuildings } from '../../store/slices/buildingsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { paymentsService } from '../../services';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PaymentsList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { payments, pagination, isLoading } = useSelector((state) => state.payments);
  const { buildings } = useSelector((state) => state.buildings);

  const now = new Date();
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    status: '',
    buildingId: '',
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateData, setGenerateData] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    paymentMethod: '',
    notes: '',
  });
  const [exporting, setExporting] = useState(false);
  const [creatingLink, setCreatingLink] = useState(null);

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';

  const loadPayments = useCallback(() => {
    const queryFilters = {};
    if (filters.month) queryFilters.month = filters.month;
    if (filters.year) queryFilters.year = filters.year;
    if (filters.status) queryFilters.status = filters.status;
    if (filters.buildingId) queryFilters.buildingId = filters.buildingId;
    dispatch(fetchPayments(queryFilters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 100 }));
  }, [dispatch, isAdminOrOwner]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Generate monthly payments
  const handleGenerate = async () => {
    try {
      await dispatch(generateMonthlyPayments(generateData)).unwrap();
      dispatch(showNotification({
        type: 'success',
        message: `Payment records generated for ${MONTH_NAMES[generateData.month]} ${generateData.year}`,
      }));
      setShowGenerateModal(false);
      loadPayments();
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  // Open update modal
  const handleUpdateClick = (payment) => {
    setSelectedPayment(payment);
    setUpdateData({
      status: payment.status,
      paymentMethod: payment.paymentMethod || '',
      notes: payment.notes || '',
    });
    setShowUpdateModal(true);
  };

  // Submit update
  const handleUpdate = async () => {
    try {
      const data = {};
      if (updateData.status) data.status = updateData.status;
      if (updateData.paymentMethod) data.paymentMethod = updateData.paymentMethod;
      if (updateData.notes !== undefined) data.notes = updateData.notes;

      await dispatch(updatePayment({ id: selectedPayment.id, data })).unwrap();
      dispatch(showNotification({ type: 'success', message: 'Payment updated successfully' }));
      setShowUpdateModal(false);
      loadPayments();
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  // Create payment link
  const handleCreateLink = async (paymentId) => {
    setCreatingLink(paymentId);
    try {
      const result = await dispatch(createPaymentLink(paymentId)).unwrap();
      dispatch(showNotification({
        type: 'success',
        message: 'Payment link created and notification sent to tenant',
      }));
      loadPayments();
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    } finally {
      setCreatingLink(null);
    }
  };

  // Export to Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.status) params.status = filters.status;
      if (filters.buildingId) params.buildingId = filters.buildingId;

      const blob = await paymentsService.exportExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payment_Report_${filters.month || 'All'}_${filters.year || 'All'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      dispatch(showNotification({ type: 'success', message: 'Excel report downloaded' }));
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: 'Failed to export report' }));
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
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1><i className="bi bi-cash-stack me-2"></i>Payments</h1>
          <p className="mb-0">Track monthly rent payments</p>
        </div>
        <div className="d-flex gap-2">
          {isAdminOrOwner && (
            <Button
              variant="outline-primary"
              onClick={handleExport}
              disabled={exporting}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              {exporting ? 'Exporting...' : 'Export Excel'}
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              Generate Monthly
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            {isAdminOrOwner && (
              <Col md={3}>
                <Form.Label className="small text-muted">Building</Form.Label>
                <Form.Select name="buildingId" value={filters.buildingId} onChange={handleFilterChange}>
                  <option value="">All Buildings</option>
                  {buildings?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={2}>
              <Form.Label className="small text-muted">Month</Form.Label>
              <Form.Select name="month" value={filters.month} onChange={handleFilterChange}>
                <option value="">All Months</option>
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">Year</Form.Label>
              <Form.Select name="year" value={filters.year} onChange={handleFilterChange}>
                <option value="">All Years</option>
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">Status</Form.Label>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Payments Table */}
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
                  <th>Tenant</th>
                  <th>Unit / Building</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Paid At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments && payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-primary me-2">
                            {payment.tenant?.firstName?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {payment.tenant?.firstName} {payment.tenant?.lastName}
                            </div>
                            <small className="text-muted">{payment.tenant?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{payment.unit?.unitNumber}</div>
                          <small className="text-muted">{payment.unit?.buildingName}</small>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold">
                          {MONTH_NAMES[payment.month]} {payment.year}
                        </span>
                      </td>
                      <td className="fw-semibold">
                        {parseFloat(payment.amount).toFixed(3)} KWD
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>
                        <small>{payment.paymentMethod || '-'}</small>
                      </td>
                      <td>
                        {payment.paidAt ? (
                          <small>{new Date(payment.paidAt).toLocaleDateString('en-US')}</small>
                        ) : '-'}
                      </td>
                      <td>
                          <div className="d-flex gap-1">
                            {isAdminOrOwner && (
                              <>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-primary p-1"
                                  onClick={() => handleUpdateClick(payment)}
                                  title="Update Payment"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                {payment.status !== 'PAID' && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-success p-1"
                                    onClick={() => handleCreateLink(payment.id)}
                                    disabled={creatingLink === payment.id}
                                    title="Create Payment Link & Notify"
                                  >
                                    {creatingLink === payment.id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <i className="bi bi-link-45deg"></i>
                                    )}
                                  </Button>
                                )}
                                {payment.tahseeelPaymentLink && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-info p-1"
                                    onClick={() => window.open(payment.tahseeelPaymentLink, '_blank')}
                                    title="Open Payment Link"
                                  >
                                    <i className="bi bi-box-arrow-up-right"></i>
                                  </Button>
                                )}
                              </>
                            )}
                            {user?.role === 'TENANT' && payment.tahseeelPaymentLink && payment.status !== 'PAID' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => window.open(payment.tahseeelPaymentLink, '_blank')}
                                title="Pay Now"
                              >
                                <i className="bi bi-credit-card me-1"></i>
                                Pay
                              </Button>
                            )}
                            {user?.role === 'TENANT' && !payment.tahseeelPaymentLink && payment.status !== 'PAID' && (
                              <span className="text-muted small align-self-center">
                                <i className="bi bi-clock me-1"></i>Awaiting link
                              </span>
                            )}
                            {user?.role === 'TENANT' && payment.status === 'PAID' && (
                              <span className="text-success small align-self-center">
                                <i className="bi bi-check-circle me-1"></i>Paid
                              </span>
                            )}
                          </div>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      <i className="bi bi-cash-stack fs-1 d-block mb-2 opacity-50"></i>
                      No payment records found. 
                      {user?.role === 'ADMIN' && ' Click "Generate Monthly" to create records for the current month.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Generate Monthly Payments Modal */}
      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate Monthly Payments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            This will create payment records for all active tenancies for the selected month.
            Amount will be taken from each tenancy's monthly rent.
          </p>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={generateData.month}
                onChange={(e) => setGenerateData({ ...generateData, month: parseInt(e.target.value) })}
              >
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Year</Form.Label>
              <Form.Select
                value={generateData.year}
                onChange={(e) => setGenerateData({ ...generateData, year: parseInt(e.target.value) })}
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerate}>
            <i className="bi bi-gear me-2"></i>Generate
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Payment Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--beige-light)' }}>
              <strong>{selectedPayment.tenant?.firstName} {selectedPayment.tenant?.lastName}</strong>
              <br />
              <small className="text-muted">
                {selectedPayment.unit?.unitNumber} - {selectedPayment.unit?.buildingName}
                {' | '}{MONTH_NAMES[selectedPayment.month]} {selectedPayment.year}
                {' | '}{parseFloat(selectedPayment.amount).toFixed(3)} KWD
              </small>
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={updateData.status}
              onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={updateData.paymentMethod}
              onChange={(e) => setUpdateData({ ...updateData, paymentMethod: e.target.value })}
            >
              <option value="">Select method</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="TAHSEEEL">Tahseeel (Apple Pay)</option>
              <option value="OTHER">Other</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={updateData.notes}
              onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
              placeholder="Optional notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentsList;
