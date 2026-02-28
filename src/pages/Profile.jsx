// ============================================
// Profile Page - Bootstrap Version
// ============================================

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Row, Col, Card, Form, Button, Nav, Badge, Spinner } from 'react-bootstrap';
import { updateProfile, changePassword } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/uiSlice';

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      dispatch(showNotification({ type: 'success', message: t('notifications.profile_updated') }));
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })).unwrap();
      dispatch(showNotification({ type: 'success', message: t('notifications.password_changed') }));
      resetPassword();
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'primary';
      case 'OWNER': return 'info';
      case 'TENANT': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex align-items-center">
            <div 
              className="avatar-primary d-flex align-items-center justify-content-center me-3"
              style={{ width: '64px', height: '64px', borderRadius: '50%', fontSize: '24px', fontWeight: 'bold' }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h4 className="mb-1" style={{ color: 'var(--navy-dark)' }}>
                {user?.firstName} {user?.lastName}
              </h4>
              <p className="text-muted mb-1">{user?.email}</p>
              <Badge bg={getRoleBadge(user?.role)}>{user?.role}</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            style={{ cursor: 'pointer' }}
          >
            {t('profile.profile_tab')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'password'} 
            onClick={() => setActiveTab('password')}
            style={{ cursor: 'pointer' }}
          >
            {t('profile.security_tab')}
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <Card.Header>
            <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>{t('profile.profile_tab')}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('profile.first_name')}</Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!profileErrors.firstName}
                      {...registerProfile('firstName', {
                        required: t('profile.first_name_required'),
                        minLength: { value: 2, message: t('profile.min_2_chars') },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {profileErrors.firstName?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('profile.last_name')}</Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!profileErrors.lastName}
                      {...registerProfile('lastName', {
                        required: t('profile.last_name_required'),
                        minLength: { value: 2, message: t('profile.min_2_chars') },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {profileErrors.lastName?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('profile.phone')}</Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!profileErrors.phone}
                      {...registerProfile('phone', {
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: t('profile.invalid_phone'),
                        },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {profileErrors.phone?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('profile.email')}</Form.Label>
                    <Form.Control
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-4 text-end">
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <Card.Header>
            <h5 className="mb-0" style={{ color: 'var(--navy-dark)' }}>{t('profile.security_tab')}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t('profile.current_password')}</Form.Label>
                    <Form.Control
                      type="password"
                      isInvalid={!!passwordErrors.currentPassword}
                      {...registerPassword('currentPassword', {
                        required: t('profile.current_password_required'),
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordErrors.currentPassword?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('profile.new_password')}</Form.Label>
                    <Form.Control
                      type="password"
                      isInvalid={!!passwordErrors.newPassword}
                      {...registerPassword('newPassword', {
                        required: t('profile.new_password_required'),
                        minLength: { value: 8, message: t('profile.min_8_chars') },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: t('profile.password_pattern'),
                        },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordErrors.newPassword?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('profile.confirm_password')}</Form.Label>
                    <Form.Control
                      type="password"
                      isInvalid={!!passwordErrors.confirmPassword}
                      {...registerPassword('confirmPassword', {
                        required: t('profile.confirm_password_required'),
                        validate: (value) =>
                          value === newPassword || t('profile.password_mismatch'),
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordErrors.confirmPassword?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-4 text-end">
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t('profile.changing')}
                    </>
                  ) : (
                    t('profile.change_password')
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Profile;
