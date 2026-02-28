// ============================================
// Generate Payment Link Modal Component
// ============================================

import { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { paymentsService } from '../../services';

const GeneratePaymentLinkModal = ({ show, onHide }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedLink('');
    setCopied(false);

    if (!name.trim()) {
      setError(t('payments.name_required'));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError(t('payments.amount_positive'));
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsService.generateLink({
        name: name.trim(),
        amount: parseFloat(amount),
      });
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
      // Fallback for older browsers
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

  const handleClose = () => {
    setName('');
    setAmount('');
    setError('');
    setGeneratedLink('');
    setCopied(false);
    setLoading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
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
          <Form onSubmit={handleSubmit}>
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
                  setGeneratedLink('');
                  setName('');
                  setAmount('');
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
