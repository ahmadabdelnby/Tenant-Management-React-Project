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
import { useTranslation } from 'react-i18next';
import SearchableSelect from '../../components/SearchableSelect';
import Select from 'react-select';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_AR = [
  '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const PaymentsList = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const monthNames = isAr ? MONTH_NAMES_AR : MONTH_NAMES;
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
    if (isAdminOrOwner) dispatch(fetchBuildings({ limit: 0 }));
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
        message: t('notifications.payments_generated', { month: monthNames[generateData.month], year: generateData.year }),
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
      dispatch(showNotification({ type: 'success', message: t('notifications.payment_updated') }));
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
        message: t('notifications.payment_link_created'),
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
    };
    return <Badge bg={variants[status] || 'secondary'}>{
      status === 'PAID' ? t('payments_page.status_paid') :
      status === 'PENDING' ? t('payments_page.status_pending') :
      status === 'OVERDUE' ? t('payments_page.status_overdue') :
      status === 'PARTIALLY_PAID' ? t('payments_page.status_partial') : status
    }</Badge>;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1><i className="bi bi-cash-stack me-2"></i>{t('payments_page.title')}</h1>
          <p className="mb-0">{t('payments_page.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          {isAdminOrOwner && (
            <Button
              variant="outline-primary"
              onClick={handleExport}
              disabled={exporting}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              {exporting ? t('payments_page.exporting') : t('payments_page.export_excel')}
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              {t('payments_page.generate_monthly')}
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
                <Form.Label className="small text-muted">{t('payments_page.building')}</Form.Label>
                <SearchableSelect
                  name="buildingId"
                  value={filters.buildingId}
                  onChange={handleFilterChange}
                  placeholder={t('payments_page.all_buildings')}
                  options={buildings?.map((b) => ({ value: String(b.id), label: isAr ? (b.nameAr || b.nameEn) : (b.nameEn || b.name) })) || []}
                />
              </Col>
            )}
            <Col md={2}>
              <Form.Label className="small text-muted">{t('payments_page.month')}</Form.Label>
              <SearchableSelect
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                placeholder={t('payments_page.all_months')}
                options={monthNames.slice(1).map((name, i) => ({ value: String(i + 1), label: name }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">{t('payments_page.year')}</Form.Label>
              <SearchableSelect
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                placeholder={t('payments_page.all_years')}
                options={[2024, 2025, 2026].map(y => ({ value: String(y), label: String(y) }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted">{t('common.status')}</Form.Label>
              <SearchableSelect
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                placeholder={t('payments_page.all_statuses')}
                options={[
                  { value: 'PAID', label: t('payments_page.status_paid') },
                  { value: 'PENDING', label: t('payments_page.status_pending') },
                  { value: 'OVERDUE', label: t('payments_page.status_overdue') },
                  { value: 'PARTIALLY_PAID', label: t('payments_page.status_partial') },
                ]}
              />
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
                  <th>{t('payments_page.tenant')}</th>
                  <th>{t('payments_page.unit_building')}</th>
                  <th>{t('payments_page.period')}</th>
                  <th>{t('payments_page.amount')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('payments_page.method')}</th>
                  <th>{t('payments_page.paid_at')}</th>
                  <th>{t('common.actions')}</th>
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
                          {monthNames[payment.month]} {payment.year}
                        </span>
                      </td>
                      <td className="fw-semibold">
                        {parseFloat(payment.amount).toFixed(3)} {t('common.kwd')}
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
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleUpdateClick(payment)}
                                >
                                  {t('payments_page.update_payment')}
                                </Button>
                                {payment.status !== 'PAID' && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleCreateLink(payment.id)}
                                    disabled={creatingLink === payment.id}
                                  >
                                    {creatingLink === payment.id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      t('payments_page.create_link_notify')
                                    )}
                                  </Button>
                                )}
                                {payment.tahseeelPaymentLink && (
                                  <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => window.open(payment.tahseeelPaymentLink, '_blank')}
                                  >
                                    {t('payments_page.open_payment_link')}
                                  </Button>
                                )}
                              </>
                            )}
                            {user?.role === 'TENANT' && payment.tahseeelPaymentLink && payment.status !== 'PAID' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => window.open(payment.tahseeelPaymentLink, '_blank')}
                              >
                                {t('payments_page.pay')}
                              </Button>
                            )}
                            {user?.role === 'TENANT' && !payment.tahseeelPaymentLink && payment.status !== 'PAID' && (
                              <span className="text-muted small align-self-center">
                                <i className="bi bi-clock me-1"></i>{t('payments_page.awaiting_link')}
                              </span>
                            )}
                            {user?.role === 'TENANT' && payment.status === 'PAID' && (
                              <span className="text-success small align-self-center">
                                <i className="bi bi-check-circle me-1"></i>{t('payments_page.status_paid')}
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
                      {t('payments_page.no_records')}
                      {user?.role === 'ADMIN' && ` ${t('payments_page.no_records_hint')}`}
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
          <Modal.Title>{t('payments_page.generate_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            {t('payments_page.generate_desc')}
          </p>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>{t('payments_page.month')}</Form.Label>
              <Select
                value={monthNames.slice(1).map((name, i) => ({ value: i + 1, label: name })).find(opt => opt.value === generateData.month) || null}
                onChange={(opt) => setGenerateData({ ...generateData, month: opt ? opt.value : '' })}
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
            <Col md={6}>
              <Form.Label>{t('payments_page.year')}</Form.Label>
              <Select
                value={[2024, 2025, 2026].map(y => ({ value: y, label: String(y) })).find(opt => opt.value === generateData.year) || null}
                onChange={(opt) => setGenerateData({ ...generateData, year: opt ? opt.value : '' })}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleGenerate}>
            <i className="bi bi-gear me-2"></i>{t('payments_page.generate')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Payment Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('payments_page.update_payment')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--beige-light)' }}>
              <strong>{selectedPayment.tenant?.firstName} {selectedPayment.tenant?.lastName}</strong>
              <br />
              <small className="text-muted">
                {selectedPayment.unit?.unitNumber} - {selectedPayment.unit?.buildingName}
                {' | '}{monthNames[selectedPayment.month]} {selectedPayment.year}
                {' | '}{parseFloat(selectedPayment.amount).toFixed(3)} {t('common.kwd')}
              </small>
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>{t('common.status')}</Form.Label>
            <Select
              value={[
                { value: 'PENDING', label: t('payments_page.status_pending') },
                { value: 'PAID', label: t('payments_page.status_paid') },
                { value: 'OVERDUE', label: t('payments_page.status_overdue') },
                { value: 'PARTIALLY_PAID', label: t('payments_page.status_partial') },
              ].find(opt => opt.value === updateData.status) || null}
              onChange={(opt) => setUpdateData({ ...updateData, status: opt ? opt.value : '' })}
              options={[
                { value: 'PENDING', label: t('payments_page.status_pending') },
                { value: 'PAID', label: t('payments_page.status_paid') },
                { value: 'OVERDUE', label: t('payments_page.status_overdue') },
                { value: 'PARTIALLY_PAID', label: t('payments_page.status_partial') },
              ]}
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
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('payments_page.payment_method')}</Form.Label>
            <Select
              value={[
                { value: 'CASH', label: t('payments_page.method_cash') },
                { value: 'BANK_TRANSFER', label: t('payments_page.method_bank') },
                { value: 'TAHSEEEL', label: t('payments_page.method_tahseeel') },
                { value: 'OTHER', label: t('payments_page.method_other') },
              ].find(opt => opt.value === updateData.paymentMethod) || null}
              onChange={(opt) => setUpdateData({ ...updateData, paymentMethod: opt ? opt.value : '' })}
              options={[
                { value: 'CASH', label: t('payments_page.method_cash') },
                { value: 'BANK_TRANSFER', label: t('payments_page.method_bank') },
                { value: 'TAHSEEEL', label: t('payments_page.method_tahseeel') },
                { value: 'OTHER', label: t('payments_page.method_other') },
              ]}
              placeholder={t('payments_page.select_method')}
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
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('payments_page.notes')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={updateData.notes}
              onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
              placeholder={t('payments_page.notes_placeholder')}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            {t('payments_page.update_payment')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentsList;
