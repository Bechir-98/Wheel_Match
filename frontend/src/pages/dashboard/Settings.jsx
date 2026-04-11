import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from "react-bootstrap";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaBell, 
  FaSave, 
  FaPalette,
  FaLanguage,
  FaShieldAlt,
  FaHistory,
  FaDatabase
} from "react-icons/fa";
import axios from "axios";
import "../../styles/DashboardPages.css";
import { apiUrl, authHeaders } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardShell from "../../components/dashboard/DashboardShell.jsx";

const Settings = () => {
  const { user: authUser } = useAuth();
  const shellRole =
    authUser?.userType === "patient" || authUser?.userType === "clinician" || authUser?.userType === "vendor"
      ? authUser.userType
      : null;
  const wrapLayout = (node) =>
    shellRole ? <DashboardShell role={shellRole}>{node}</DashboardShell> : node;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Account Settings
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // Notification Settings
    NOTIFICATIONS_EMAIL: true,
    NOTIFICATIONS_PUSH: true,
    APPOINTMENT_REMINDERS: true,
    SYSTEM_UPDATES: true,
    
    // Display Settings
    THEME: "light",
    LANGUAGE: "en",
    FONT_SIZE: "medium",
    
    // Privacy Settings
    DATA_SHARING: false,
    ACTIVITY_TRACKING: true,
    ONLINE_STATUS: true,
    
    // System Settings
    AUTO_BACKUP: true,
    BACKUP_FREQUENCY: "daily",
    DATA_RETENTION: "30"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!localStorage.getItem('token')) {
          throw new Error('Not authenticated');
        }
        const response = await axios.get(apiUrl('/users/me/settings'), {
          headers: authHeaders(),
        });
        console.log('Settings response:', response.data);
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        setFormData(prev => ({
          ...prev,
          ...response.data
        }));
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(`Error loading settings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Not authenticated');
      }
      const response = await axios.put(apiUrl('/users/me/settings'), formData, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });
      console.log('Save response:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return wrapLayout(
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>,
    );
  }

  return wrapLayout(
    <Container className="py-4">
      <h1 className="mb-4">Settings</h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Settings have been successfully updated!
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <div className="d-flex flex-wrap gap-4">
          {/* Account Settings */}
          <Card className="flex-grow-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Account Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaEnvelope className="me-2" />
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="me-2" />
                  Current Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Notification Settings */}
          <Card className="flex-grow-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaBell className="me-2" />
                Notification Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Email Notifications"
                  name="NOTIFICATIONS_EMAIL"
                  checked={formData.NOTIFICATIONS_EMAIL}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Push Notifications"
                  name="NOTIFICATIONS_PUSH"
                  checked={formData.NOTIFICATIONS_PUSH}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Appointment Reminders"
                  name="APPOINTMENT_REMINDERS"
                  checked={formData.APPOINTMENT_REMINDERS}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="System Updates"
                  name="SYSTEM_UPDATES"
                  checked={formData.SYSTEM_UPDATES}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Display Settings */}
          <Card className="flex-grow-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaPalette className="me-2" />
                Display Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPalette className="me-2" />
                  Theme
                </Form.Label>
                <Form.Select
                  name="THEME"
                  value={formData.THEME}
                  onChange={handleChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLanguage className="me-2" />
                  Language
                </Form.Label>
                <Form.Select
                  name="LANGUAGE"
                  value={formData.LANGUAGE}
                  onChange={handleChange}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Font Size</Form.Label>
                <Form.Select
                  name="FONT_SIZE"
                  value={formData.FONT_SIZE}
                  onChange={handleChange}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Privacy Settings */}
          <Card className="flex-grow-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaShieldAlt className="me-2" />
                Privacy Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Share Anonymous Data"
                  name="DATA_SHARING"
                  checked={formData.DATA_SHARING}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Activity Tracking"
                  name="ACTIVITY_TRACKING"
                  checked={formData.ACTIVITY_TRACKING}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Show Online Status"
                  name="ONLINE_STATUS"
                  checked={formData.ONLINE_STATUS}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* System Settings */}
          <Card className="flex-grow-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaDatabase className="me-2" />
                System Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Auto Backup"
                  name="AUTO_BACKUP"
                  checked={formData.AUTO_BACKUP}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Backup Frequency</Form.Label>
                <Form.Select
                  name="BACKUP_FREQUENCY"
                  value={formData.BACKUP_FREQUENCY}
                  onChange={handleChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Data Retention (days)</Form.Label>
                <Form.Control
                  type="number"
                  name="DATA_RETENTION"
                  value={formData.DATA_RETENTION}
                  onChange={handleChange}
                  min="1"
                  max="365"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center gap-2"
          >
            <FaSave />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </Container>,
  );
};

export default Settings;
