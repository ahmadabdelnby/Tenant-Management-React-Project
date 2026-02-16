// ============================================
// Payment Result Page - After Tahseeel callback redirect
// ============================================

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status');
  const paymentId = searchParams.get('paymentId');

  const isSuccess = status === 'success';

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card className="border-0 shadow-sm text-center" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="p-5">
          {isSuccess ? (
            <>
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: '80px', height: '80px', backgroundColor: '#d4edda' }}
              >
                <i className="bi bi-check-lg text-success" style={{ fontSize: '40px' }}></i>
              </div>
              <h3 className="mb-3" style={{ color: 'var(--navy-dark)' }}>Payment Successful!</h3>
              <p className="text-muted mb-4">
                Your rent payment has been processed successfully. A confirmation notification has been sent.
              </p>
            </>
          ) : (
            <>
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: '80px', height: '80px', backgroundColor: '#f8d7da' }}
              >
                <i className="bi bi-x-lg text-danger" style={{ fontSize: '40px' }}></i>
              </div>
              <h3 className="mb-3" style={{ color: 'var(--navy-dark)' }}>Payment Failed</h3>
              <p className="text-muted mb-4">
                {status === 'error'
                  ? 'An error occurred during the payment process. Please try again.'
                  : 'Your payment was not completed. You can try again from the payments page.'}
              </p>
            </>
          )}
          <Button variant="primary" onClick={() => navigate('/payments')}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Payments
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentResult;
