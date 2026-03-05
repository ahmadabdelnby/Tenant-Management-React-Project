// ============================================
// User Form Page (Create/Edit) - Bootstrap Version
// ============================================

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createUser,
  updateUser,
  fetchUserById,
  clearCurrentUser,
} from '../../store/slices/usersSlice';
import { showNotification } from '../../store/slices/uiSlice';

const UserForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentUser, isLoading } = useSelector((state) => state.users);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchUserById(id));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (currentUser && isEdit) {
      reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || '',
        role: currentUser.role,
      });
    }
  }, [currentUser, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const { password, ...updateData } = data;
        await dispatch(updateUser({ id, data: updateData })).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.user_updated') }));
      } else {
        await dispatch(createUser(data)).unwrap();
        dispatch(showNotification({ type: 'success', message: t('notifications.user_created') }));
      }
      navigate('/users');
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => navigate('/users')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {t('users.back_to_users')}
        </Button>
        <div className="page-header mb-0">
          <h1>{isEdit ? t('users.edit_title') : t('users.create_title')}</h1>
          <p className="mb-0">{isEdit ? t('users.edit_subtitle') : t('users.create_subtitle')}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card style={{ maxWidth: '600px' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('users.first_name')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.firstName}
                    {...register('firstName', {
                      required: t('users.first_name_required'),
                      minLength: { value: 2, message: t('users.min_2_chars') },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('users.last_name')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.lastName}
                    {...register('lastName', {
                      required: t('users.last_name_required'),
                      minLength: { value: 2, message: t('users.min_2_chars') },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t('users.email')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    isInvalid={!!errors.email}
                    disabled={isEdit}
                    {...register('email', {
                      required: t('users.email_required'),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('users.email_invalid'),
                      },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {!isEdit && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t('users.password')} <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      isInvalid={!!errors.password}
                      {...register('password', {
                        required: t('users.password_required'),
                        minLength: { value: 8, message: t('users.min_8_chars') },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: t('users.password_pattern'),
                        },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('users.phone')}</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.phone}
                    {...register('phone')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('users.role')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: t('users.role_required') }}
                    render={({ field }) => {
                      const roleOptions = [
                        { value: 'ADMIN', label: t('users.admin') },
                        { value: 'OWNER', label: t('users.owner') },
                        { value: 'TENANT', label: t('users.tenant') },
                      ];
                      const selectedOption = roleOptions.find(
                        (opt) => opt.value === field.value
                      ) || null;
                      return (
                        <Select
                          value={selectedOption}
                          onChange={(opt) => field.onChange(opt ? opt.value : '')}
                          options={roleOptions}
                          placeholder={t('users.select_role')}
                          isClearable
                          isSearchable
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '38px',
                              borderColor: errors.role ? '#dc3545' : state.isFocused ? '#86b7fe' : '#dee2e6',
                              boxShadow: errors.role
                                ? '0 0 0 0.25rem rgba(220,53,69,.25)'
                                : state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
                              '&:hover': { borderColor: state.isFocused ? '#86b7fe' : '#adb5bd' },
                            }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
                      );
                    }}
                  />
                  {errors.role && (
                    <div className="invalid-feedback d-block">{errors.role.message}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/users')}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? t('users.updating') : t('users.creating')}
                  </>
                ) : (
                  isEdit ? t('users.update_user') : t('users.create_user')
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm;
