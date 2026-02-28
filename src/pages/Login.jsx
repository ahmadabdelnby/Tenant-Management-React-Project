// ============================================
// Login Page - Bootstrap Version
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { login, clearError } from '../store/slices/authSlice';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  return (
    <div className="login-container">
      {/* Language Switcher on Login Page */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <LanguageSwitcher />
      </div>

      <div className="login-card">
        {/* Logo & Title */}
        <div className="text-center mb-4">
          <div className="login-logo">
            <i className="bi bi-building"></i>
          </div>
          <h2 className="fw-bold" style={{ color: 'var(--navy-dark)' }}>{t('login.title')}</h2>
          <p className="text-muted">{t('login.subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>{t('login.email_label')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t('login.email_placeholder')}
              isInvalid={!!errors.email}
              {...register('email', {
                required: t('login.email_required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('login.email_invalid'),
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('login.password_label')}</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.password_placeholder')}
                isInvalid={!!errors.password}
                {...register('password', {
                  required: t('login.password_required'),
                  minLength: {
                    value: 6,
                    message: t('login.password_min'),
                  },
                })}
              />
              <Button
                variant="link"
                className={`position-absolute top-50 translate-middle-y text-muted ${i18n.language === 'ar' ? 'start-0' : 'end-0'}`}
                style={{ zIndex: 10 }}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
            </div>
            {errors.password && (
              <div className="text-danger small mt-1">{errors.password.message}</div>
            )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('login.signing_in')}
              </>
            ) : (
              t('login.sign_in')
            )}
          </Button>
        </Form>

        {/* Footer */}
        <div className="text-center mt-4">
          <small className="text-muted">
            © {new Date().getFullYear()} PropertyMS.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
