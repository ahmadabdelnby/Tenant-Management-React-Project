// ============================================
// Login Page - Bootstrap Version
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { login, clearError } from '../store/slices/authSlice';

const Login = () => {
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
      <div className="login-card">
        {/* Logo & Title */}
        <div className="text-center mb-4">
          <div className="login-logo">
            <i className="bi bi-building"></i>
          </div>
          <h2 className="fw-bold" style={{ color: 'var(--navy-dark)' }}>PropertyMS</h2>
          <p className="text-muted">Property Management System</p>
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
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              isInvalid={!!errors.email}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                isInvalid={!!errors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <Button
                variant="link"
                className="position-absolute top-50 end-0 translate-middle-y text-muted"
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

          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form.Check
              type="checkbox"
              label="Remember me"
              id="remember"
            />
            <a href="#" className="text-decoration-none" style={{ color: 'var(--bs-primary)' }}>
              Forgot password?
            </a>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Form>

        {/* Footer */}
        <div className="text-center mt-4">
          <small className="text-muted">
            © {new Date().getFullYear()} PropertyMS. All rights reserved.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
