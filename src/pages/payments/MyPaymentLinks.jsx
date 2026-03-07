// ============================================
// My Payment Links Page (Tenant View)
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Badge, Spinner, Button, InputGroup, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { paymentsService } from '../../services';
import { showNotification } from '../../store/slices/uiSlice';

const MyPaymentLinks = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dispatch = useDispatch();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [copiedId, setCopiedId] = useState(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      const response = await paymentsService.getMyPaymentLinks(params);
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
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
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

  const getBuildingName = (link) => {
    if (!link.building) return '-';
    return isAr ? (link.building.name_ar || link.building.name_en) : (link.building.name_en || link.building.name_ar);
  };

  const handleDownloadInvoice = async (link) => {
    try {
      const blob = await paymentsService.downloadInvoice(link.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${link.order_no}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      dispatch(showNotification({ type: 'error', message: t('payments.invoice_download_failed') }));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header mb-4">
        <h1>{t('payments.my_payments_title')}</h1>
        <p className="mb-0">{t('payments.my_payments_subtitle')}</p>
      </div>

      {/* Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--navy-dark)' }} />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-receipt" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">{t('payments.no_my_links')}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead style={{ backgroundColor: 'var(--navy-dark)', color: 'white' }}>
                  <tr>
                    <th>#</th>
                    <th>{t('payments.order_no')}</th>
                    <th>{t('buildings.building')}</th>
                    <th>{t('units.unit')}</th>
                    <th>{t('payments.amount')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('payments.created_at')}</th>
                    <th>{t('payments.payment_link')}</th>
                    <th>{t('payments.invoice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link, index) => (
                    <tr key={link.id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>
                        <code className="small">{link.order_no}</code>
                      </td>
                      <td>{getBuildingName(link)}</td>
                      <td>{link.unit?.unit_number || '-'}</td>
                      <td>{formatCurrency(link.amount)}</td>
                      <td>{getStatusBadge(link.status)}</td>
                      <td className="small text-muted">{formatDate(link.created_at)}</td>
                      <td>
                        {link.payment_url ? (
                          <InputGroup size="sm" style={{ maxWidth: '240px' }}>
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
                          </InputGroup>
                        ) : (
                          <span className="text-muted small">{t('payments.no_link')}</span>
                        )}
                      </td>
                      <td>
                        {link.status?.toLowerCase() === 'fulfilled' ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleDownloadInvoice(link)}
                          >
                            <i className="bi bi-download me-1"></i>
                            {t('payments.download_invoice')}
                          </Button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
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
    </div>
  );
};

export default MyPaymentLinks;
