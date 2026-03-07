// ============================================
// Generate Payment Link Modal Component
// ============================================

import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert, InputGroup, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { paymentsService, tenanciesService } from '../../services';

const GeneratePaymentLinkModal = ({ show, onHide }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  // Tab mode
  const [mode, setMode] = useState('tenant');

  // Tenant mode state
  const [tenanciesList, setTenanciesList] = useState([]);
  const [loadingTenancies, setLoadingTenancies] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState(null);
  const [tenantAmount, setTenantAmount] = useState('');

  // Custom mode state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Common
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Load all active tenancies on mount
  useEffect(() => {
    if (!show) return;
    setLoadingTenancies(true);
    tenanciesService.getAll({ isActive: true, limit: 0 })
      .then((res) => setTenanciesList(res.data?.data || []))
      .catch(() => setTenanciesList([]))
      .finally(() => setLoadingTenancies(false));
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedLink('');
    setCopied(false);

    let payload;
    if (mode === 'tenant') {
      if (!selectedTenancy) {
        setError(t('payments.select_tenant_required'));
        return;
      }
      if (!tenantAmount || parseFloat(tenantAmount) <= 0) {
        setError(t('payments.amount_positive'));
        return;
      }
      payload = {
        name: `${selectedTenancy.tenant?.firstName || ''} ${selectedTenancy.tenant?.lastName || ''}`.trim(),
        amount: parseFloat(tenantAmount),
        tenantId: selectedTenancy.tenant?.id,
        unitId: selectedTenancy.unit?.id,
        buildingId: selectedTenancy.unit?.buildingId,
      };
    } else {
      if (!name.trim()) {
        setError(t('payments.name_required'));
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setError(t('payments.amount_positive'));
        return;
      }
      payload = {
        name: name.trim(),
        amount: parseFloat(amount),
      };
    }

    setLoading(true);
    try {
      const response = await paymentsService.generateLink(payload);
      setGeneratedLink(response.data.link);
    } catch (err) {
      setError(err.message || t('payments.generate_fail'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setMode('tenant');
    setSelectedTenancy(null);
    setTenantAmount('');
    setName('');
    setAmount('');
    setError('');
    setGeneratedLink('');
    setCopied(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '38px',
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  const buildingName = (tn) => isAr
    ? (tn.unit?.buildingNameAr || tn.unit?.buildingNameEn || '')
    : (tn.unit?.buildingNameEn || tn.unit?.buildingNameAr || '');

  const tenancyOptions = tenanciesList.map((tn) => ({
    value: tn.id,
    label: `${tn.tenant?.firstName || ''} ${tn.tenant?.lastName || ''} - ${buildingName(tn)} - ${t('payments.unit')} ${tn.unit?.unitNumber || ''}`.trim(),
    tenancy: tn,
  }));

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: 'var(--navy)', color: 'white' }}>
        <Modal.Title>
          <i className="bi bi-link-45deg me-2"></i>
          {t('payments.generate_title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        {!generatedLink ? (
          <>
            <Nav variant="tabs" className="mb-3" activeKey={mode} onSelect={setMode}>
              <Nav.Item>
                <Nav.Link eventKey="tenant">
                  <i className="bi bi-person me-1"></i>
                  {t('payments.tenant_mode')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="custom">
                  <i className="bi bi-pencil me-1"></i>
                  {t('payments.custom_mode')}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Form onSubmit={handleSubmit}>
              {mode === 'tenant' ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">{t('payments.select_tenancy')}</Form.Label>
                    <Select
                      value={tenancyOptions.find((o) => o.tenancy === selectedTenancy) || null}
                      onChange={(opt) => {
                        const tn = opt?.tenancy || null;
                        setSelectedTenancy(tn);
                        if (tn) setTenantAmount(parseFloat(tn.monthlyRent || 0).toFixed(3));
                        else setTenantAmount('');
                      }}
                      options={tenancyOptions}
                      placeholder={loadingTenancies ? t('common.loading') : t('payments.select_tenancy_placeholder')}
                      isClearable
                      isSearchable
                      isLoading={loadingTenancies}
                      isRtl={isAr}
                      styles={selectStyles}
                    />
                  </Form.Group>

                  {selectedTenancy && (
                    <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f0f4f8' }}>
                      <div className="fw-semibold mb-1">
                        <i className="bi bi-person-fill me-1"></i>
                        {selectedTenancy.tenant?.firstName} {selectedTenancy.tenant?.lastName}
                      </div>
                      <small className="text-muted d-block">{selectedTenancy.tenant?.email}</small>
                      <small className="text-muted">
                        <i className="bi bi-building me-1"></i>
                        {buildingName(selectedTenancy)} - {t('payments.unit')} {selectedTenancy.unit?.unitNumber}
                      </small>
                    </div>
                  )}

                  {selectedTenancy && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">{t('payments.amount')} ({t('common.kwd')})</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          step="0.001"
                          min="0.001"
                          placeholder="0.000"
                          value={tenantAmount}
                          onChange={(e) => setTenantAmount(e.target.value)}
                          disabled={loading}
                        />
                        <InputGroup.Text>{t('common.kwd')}</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  )}

                </>
              ) : (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">{t('payments.customer_name')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('payments.enter_customer_name')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">{t('payments.amount')} ({t('common.kwd')})</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="0.000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                      />
                      <InputGroup.Text>{t('common.kwd')}</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </>
              )}

              <div className="d-grid">
                <Button type="submit" variant="primary" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t('payments.generating')}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lightning-charge me-2"></i>
                      {t('payments.generate')}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </>
        ) : (
          <div>
            <Alert variant="success" className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              {t('payments.generate_success')}
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-muted small">{t('payments.payment_url')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={generatedLink}
                  readOnly
                  style={{ fontSize: '13px', backgroundColor: '#f8f9fa' }}
                />
                <Button
                  variant={copied ? 'success' : 'outline-primary'}
                  onClick={handleCopy}
                  style={{ minWidth: '120px' }}
                >
                  {copied ? (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      {t('payments.copied')}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-clipboard me-1"></i>
                      {t('payments.copy')}
                    </>
                  )}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                className="flex-grow-1"
                onClick={() => window.open(generatedLink, '_blank')}
              >
                <i className="bi bi-box-arrow-up-right me-1"></i>
                {t('payments.open_link')}
              </Button>
              <Button
                variant="primary"
                className="flex-grow-1"
                onClick={() => {
                  resetForm();
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>
                {t('payments.generate_another')}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default GeneratePaymentLinkModal;
