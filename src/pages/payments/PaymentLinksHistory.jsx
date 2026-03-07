// ============================================
// Payment Links History Page
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Badge, Spinner, Form, Row, Col, Button, InputGroup, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import paymentsService from '../../services/paymentsService';
import { showNotification } from '../../store/slices/uiSlice';

const PaymentLinksHistory = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dispatch = useDispatch();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (statusFilter) params.status = statusFilter;

      const response = await paymentsService.getPaymentLinks(params);
      const result = response.data;
      setLinks(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
      }));
    } catch {
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning" text="dark">{t('payments.status_pending')}</Badge>;
      case 'fulfilled':
      case 'paid':
        return <Badge bg="success">{t('payments.status_fulfilled')}</Badge>;
      case 'expired':
        return <Badge bg="danger">{t('payments.status_expired')}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    return parseFloat(amount).toFixed(3) + ' ' + t('common.kwd');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const blob = await paymentsService.exportExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payment_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // silent fail
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateClick = (link) => {
    setSelectedLink(link);
    setNewStatus(link.status);
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await paymentsService.updatePaymentLink(selectedLink.id, { status: newStatus });
      dispatch(showNotification({ type: 'success', message: t('payments.status_updated') }));
      setShowUpdateModal(false);
      fetchLinks();
    } catch {
      dispatch(showNotification({ type: 'error', message: t('payments.status_update_failed') }));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-header mb-0">
          <h1>{t('payments.title')}</h1>
          <p className="mb-0">{t('payments.subtitle')}</p>
        </div>
        <Button
          variant="outline-success"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t('maintenance.exporting')}...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-excel me-2"></i>
              {t('payments.export_report')}
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small text-muted mb-1">{t('common.status')}</Form.Label>
              <Select
                value={[
                  { value: 'Pending', label: t('payments.status_pending') },
                  { value: 'Fulfilled', label: t('payments.status_fulfilled') },
                  { value: 'Expired', label: t('payments.status_expired') },
                ].find(opt => opt.value === statusFilter) || null}
                onChange={(opt) => {
                  const val = opt ? opt.value : '';
                  setStatusFilter(val);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                options={[
                  { value: 'Pending', label: t('payments.status_pending') },
                  { value: 'Fulfilled', label: t('payments.status_fulfilled') },
                  { value: 'Expired', label: t('payments.status_expired') },
                ]}
                placeholder={t('maintenance.all_statuses')}
                isClearable
                isSearchable
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter('');
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                {t('common.clear')}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--navy-dark)' }} />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-link-45deg" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">{t('payments.no_links')}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead style={{ backgroundColor: 'var(--navy-dark)', color: 'white' }}>
                  <tr>
                    <th>#</th>
                    <th>{t('payments.order_no')}</th>
                    <th>{t('payments.customer_name')}</th>
                    <th>{t('payments.amount')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('payments.created_at')}</th>
                    <th>{t('payments.payment_link')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link, index) => (
                    <tr key={link.id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>
                        <code className="small">{link.order_no}</code>
                      </td>
                      <td className="fw-semibold">{link.cust_name}</td>
                      <td>{formatCurrency(link.amount)}</td>
                      <td>{getStatusBadge(link.status)}</td>
                      <td className="small text-muted">{formatDate(link.created_at)}</td>
                      <td>
                        {link.payment_url ? (
                          <InputGroup size="sm" style={{ maxWidth: '280px' }}>
                            <Form.Control
                              readOnly
                              value={link.payment_url}
                              className="small"
                              style={{ fontSize: '0.75rem' }}
                            />
                            <Button
                              variant={copiedId === link.id ? 'success' : 'outline-primary'}
                              size="sm"
                              onClick={() => handleCopy(link.payment_url, link.id)}
                              title={t('payments.copy_link')}
                            >
                              <i className={`bi ${copiedId === link.id ? 'bi-check-lg' : 'bi-clipboard'}`}></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => window.open(link.payment_url, '_blank')}
                              title={t('payments.open_link')}
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </Button>
                          </InputGroup>
                        ) : (
                          <span className="text-muted small">{t('payments.no_link')}</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateClick(link)}
                        >
                          {t('payments.update_status')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card.Footer className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {t('payments.showing')} {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} {t('payments.of')} {pagination.total}
            </small>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <i className="bi bi-chevron-left"></i> {t('payments.previous')}
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                {t('payments.next')} <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Update Status Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('payments.update_status')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLink && (
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--beige-light)' }}>
              <strong>{selectedLink.cust_name}</strong>
              <br />
              <small className="text-muted">
                {t('payments.order_no')}: {selectedLink.order_no}
                {' | '}{formatCurrency(selectedLink.amount)}
              </small>
            </div>
          )}
          <Form.Group>
            <Form.Label>{t('common.status')}</Form.Label>
            <Select
              value={[
                { value: 'Pending', label: t('payments.status_pending') },
                { value: 'Fulfilled', label: t('payments.status_fulfilled') },
                { value: 'Expired', label: t('payments.status_expired') },
              ].find(opt => opt.value === newStatus) || null}
              onChange={(opt) => setNewStatus(opt ? opt.value : '')}
              options={[
                { value: 'Pending', label: t('payments.status_pending') },
                { value: 'Fulfilled', label: t('payments.status_fulfilled') },
                { value: 'Expired', label: t('payments.status_expired') },
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus} disabled={!newStatus}>
            {t('payments.update_status')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentLinksHistory;
