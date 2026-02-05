// ============================================
// Maintenance Request Form Page - Bootstrap Version
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { createMaintenanceRequest } from '../../store/slices/maintenanceSlice';
import { showNotification } from '../../store/slices/uiSlice';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.maintenance);
  
  const [myUnits, setMyUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      priority: 'MEDIUM',
      category: 'OTHER',
      unitId: '',
    },
  });

  // Only tenants can create maintenance requests
  useEffect(() => {
    if (user?.role !== 'TENANT') {
      navigate('/maintenance');
    }
  }, [user, navigate]);

  // Fetch tenant's units
  useEffect(() => {
    const fetchMyUnits = async () => {
      try {
        setLoadingUnits(true);
        const response = await maintenanceService.getMyUnits();
        console.log('My units response:', response);
        const units = response.data || [];
        setMyUnits(units);
        // Auto-select if only one unit
        if (units.length === 1) {
          setValue('unitId', units[0].unitId.toString());
        }
      } catch (error) {
        console.error('Failed to fetch units:', error);
        dispatch(showNotification({ type: 'error', message: 'Failed to load your units' }));
      } finally {
        setLoadingUnits(false);
      }
    };
    
    if (user?.role === 'TENANT') {
      fetchMyUnits();
    }
  }, [user, dispatch, setValue]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createMaintenanceRequest({
        ...data,
        unitId: parseInt(data.unitId, 10),
      })).unwrap();
      dispatch(showNotification({ type: 'success', message: 'Maintenance request submitted successfully' }));
      navigate('/maintenance');
    } catch (error) {
      dispatch(showNotification({ type: 'error', message: error }));
    }
  };

  const categories = [
    { value: 'PLUMBING', label: 'Plumbing (Water Issues)', icon: 'bi-droplet', description: 'Leaks, clogged drains, water heater problems' },
    { value: 'ELECTRICAL', label: 'Electrical', icon: 'bi-lightning', description: 'Power outages, faulty outlets, lighting issues' },
    { value: 'HVAC', label: 'HVAC', icon: 'bi-thermometer', description: 'Heating, ventilation, air conditioning' },
    { value: 'APPLIANCE', label: 'Appliance', icon: 'bi-gear', description: 'Refrigerator, stove, washing machine' },
    { value: 'STRUCTURAL', label: 'Structural', icon: 'bi-house', description: 'Walls, floors, doors, windows' },
    { value: 'OTHER', label: 'Other', icon: 'bi-tools', description: 'Any other maintenance issues' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none mb-3"
          onClick={() => navigate('/maintenance')}
          style={{ color: 'var(--navy-dark)' }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Requests
        </Button>
        <div className="page-header mb-0">
          <h1>New Maintenance Request</h1>
          <p className="mb-0">Submit a maintenance request for your unit</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Your request will be sent to the property manager and building owner for review.
        They will contact you or schedule a maintenance visit.
      </Alert>

      {/* Form Card */}
      <Card style={{ maxWidth: '700px' }}>
        <Card.Body>
          {loadingUnits ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--navy-dark)' }} />
              <p className="mt-2 text-muted">Loading your units...</p>
            </div>
          ) : myUnits.length === 0 ? (
            <Alert variant="warning" className="mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              You don't have any active rentals. Please contact the property manager if you believe this is an error.
            </Alert>
          ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              {/* Unit Selection */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Select Unit <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.unitId}
                    {...register('unitId', { required: 'Please select a unit' })}
                  >
                    {myUnits.length > 1 && <option value="">-- Select the unit with the issue --</option>}
                    {myUnits.map((unit) => (
                      <option key={unit.unitId} value={unit.unitId}>
                        {unit.buildingName} - Unit {unit.unitNumber}
                        {unit.floor && ` (Floor ${unit.floor})`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.unitId?.message}
                  </Form.Control.Feedback>
                  {myUnits.length > 1 && (
                    <Form.Text className="text-muted">
                      You have {myUnits.length} active rentals. Please select which unit has the issue.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              {/* Title */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Request Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Brief description of the issue"
                    isInvalid={!!errors.title}
                    {...register('title', { 
                      required: 'Title is required',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Category */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Row className="g-2">
                    {categories.map((cat) => (
                      <Col md={4} key={cat.value}>
                        <Form.Check
                          type="radio"
                          id={`category-${cat.value}`}
                          className="category-card"
                        >
                          <Form.Check.Input
                            type="radio"
                            value={cat.value}
                            {...register('category', { required: 'Category is required' })}
                          />
                          <Form.Check.Label className="w-100">
                            <Card className="h-100 text-center p-2" style={{ cursor: 'pointer' }}>
                              <i className={`bi ${cat.icon} fs-4 mb-1`} style={{ color: 'var(--navy-dark)' }}></i>
                              <div className="small fw-semibold">{cat.label}</div>
                            </Card>
                          </Form.Check.Label>
                        </Form.Check>
                      </Col>
                    ))}
                  </Row>
                  {errors.category && (
                    <div className="text-danger small mt-1">{errors.category.message}</div>
                  )}
                </Form.Group>
              </Col>

              {/* Priority */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Priority <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    isInvalid={!!errors.priority}
                    {...register('priority', { required: 'Priority is required' })}
                  >
                    <option value="LOW">Low - Can wait a few days</option>
                    <option value="MEDIUM">Medium - Should be fixed soon</option>
                    <option value="HIGH">High - Affecting daily life</option>
                    <option value="URGENT">Urgent - Emergency situation</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.priority?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Description */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Please describe the issue in detail. Include location within the unit, when it started, and any other relevant information..."
                    isInvalid={!!errors.description}
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Please provide more details (at least 20 characters)' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => navigate('/maintenance')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MaintenanceForm;
