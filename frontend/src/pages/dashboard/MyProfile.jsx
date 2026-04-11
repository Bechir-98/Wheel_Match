import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/DashboardPages.css';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWeight,
  FaRuler,
  FaUserMd,
  FaStore,
  FaIdCard,
} from 'react-icons/fa';
import { apiUrl, authHeaders } from '../../config/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardShell from '../../components/dashboard/DashboardShell.jsx';

const isPatient = (t) => String(t || '').toLowerCase() === 'patient';
const isClinician = (t) => {
  const x = String(t || '').toLowerCase();
  return x === 'clinician' || x === 'clinicien';
};
const isVendor = (t) => {
  const x = String(t || '').toLowerCase();
  return x === 'vendor' || x === 'commercant';
};

function typeLabel(t) {
  if (isPatient(t)) return 'Patient';
  if (isClinician(t)) return 'Clinicien';
  if (isVendor(t)) return 'Commerçant';
  return t || '';
}

function apiErrorMessage(err) {
  const d = err.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(', ');
  return err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur';
}

/** Sync nav label with /users/me payload (same rules as backend build_display_name). */
function displayNameFromMePayload(p) {
  if (!p || typeof p !== 'object') return '';
  const t = String(p.type || '').toLowerCase();
  if (t === 'patient') {
    const s = `${p.PRENOMP || ''} ${p.NOMP || ''}`.trim();
    return s || (p.EMAIL || '').split('@')[0] || '';
  }
  if (t === 'clinician') {
    const s = `${p.PRENOMC || ''} ${p.NOMC || ''}`.trim();
    return s || (p.EMAIL || '').split('@')[0] || '';
  }
  if (t === 'vendor') {
    return (p.NOM_MARCHAND || '').trim() || (p.EMAIL || '').split('@')[0] || '';
  }
  return (p.EMAIL || '').split('@')[0] || '';
}

function profileToFormState(data) {
  if (!data) return {};
  const userType = data.type;
  const base = {
    ADRESSE: data.ADRESSE ?? '',
    EMAIL: data.EMAIL ?? '',
    NUMTEL: data.NUMTEL ?? '',
  };

  if (isPatient(userType)) {
    return {
      ...base,
      NOMP: data.NOMP ?? '',
      PRENOMP: data.PRENOMP ?? '',
      NSS: data.NSS ?? '',
      POIDS: data.POIDS === '' || data.POIDS === undefined || data.POIDS === null ? '' : String(data.POIDS),
      TAILLE: data.TAILLE === '' || data.TAILLE === undefined || data.TAILLE === null ? '' : String(data.TAILLE),
      UTILISATION_PRPL: data.UTILISATION_PRPL || 'MANUELLE',
      AIDANT: Boolean(data.AIDANT),
    };
  }
  if (isClinician(userType)) {
    return {
      ...base,
      NOMC: data.NOMC ?? '',
      PRENOMC: data.PRENOMC ?? '',
      ID_SPEC: String(data.ID_SPEC ?? '1'),
    };
  }
  if (isVendor(userType)) {
    return {
      ...base,
      NOM_MARCHAND: data.NOM_MARCHAND ?? '',
    };
  }
  return base;
}

const MyProfile = () => {
  const { refreshSession, user: authUser } = useAuth();
  const shellRole =
    authUser?.userType === 'patient' || authUser?.userType === 'clinician' || authUser?.userType === 'vendor'
      ? authUser.userType
      : null;
  const wrapLayout = (node) =>
    shellRole ? <DashboardShell role={shellRole}>{node}</DashboardShell> : node;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const loadProfile = useCallback(async (opts = { quiet: false }) => {
    try {
      if (!opts.quiet) setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get(apiUrl('/users/me'), {
        headers: authHeaders(),
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const data = response.data;
      const t = data.type;
      if (!isPatient(t) && !isClinician(t) && !isVendor(t)) {
        throw new Error('Unrecognized user type');
      }

      setUserData(data);
      setFormData(profileToFormState(data));
      return data;
    } catch (err) {
      console.error('Error loading data:', err);
      setError(apiErrorMessage(err));
      return null;
    } finally {
      if (!opts.quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setFormData(profileToFormState(userData));
      setIsEditing(false);
      setError(null);
    } else {
      setFormData(profileToFormState(userData));
      setIsEditing(true);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const t = userData?.type;
      const submitData = { ...formData };
      if (isPatient(t)) {
        submitData.AIDANT = !!formData.AIDANT;
      }

      const response = await axios.patch(apiUrl('/users/me'), submitData, {
        headers: {
          ...authHeaders({ 'Content-Type': 'application/json' }),
        },
      });

      if (response.data?.success) {
        const fresh = await loadProfile({ quiet: true });
        if (fresh) {
          const dn = displayNameFromMePayload(fresh);
          if (dn) localStorage.setItem('userDisplayName', dn);
        }
        refreshSession();
        setIsEditing(false);
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la mise à jour des données');
      }
    } catch (err) {
      setError(apiErrorMessage(err));
      console.error(err);
    }
  };

  const renderPatientForm = () => (
    <div className="d-flex flex-column gap-4">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-bold mb-2">
              <FaUser className="me-2" />
              Nom
            </Form.Label>
            <Form.Control
              type="text"
              name="NOMP"
              value={formData.NOMP ?? ''}
              onChange={handleInputChange}
              required
              className="form-control-lg"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-bold mb-2">
              <FaUser className="me-2" />
              Prénom
            </Form.Label>
            <Form.Control
              type="text"
              name="PRENOMP"
              value={formData.PRENOMP ?? ''}
              onChange={handleInputChange}
              required
              className="form-control-lg"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="d-flex flex-column">
        <Form.Label className="fw-bold mb-2">
          <FaIdCard className="me-2" />
          NSS
        </Form.Label>
        <Form.Control
          type="text"
          name="NSS"
          value={formData.NSS ?? ''}
          onChange={handleInputChange}
          required
          maxLength={64}
          className="form-control-lg"
        />
      </Form.Group>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-bold mb-2">
              <FaWeight className="me-2" />
              Poids (kg)
            </Form.Label>
            <Form.Control
              type="number"
              name="POIDS"
              value={formData.POIDS ?? ''}
              onChange={handleInputChange}
              required
              min={0}
              step="0.01"
              className="form-control-lg"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-bold mb-2">
              <FaRuler className="me-2" />
              Taille (m)
            </Form.Label>
            <Form.Control
              type="number"
              name="TAILLE"
              value={formData.TAILLE ?? ''}
              onChange={handleInputChange}
              step="0.001"
              min={0}
              required
              className="form-control-lg"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="d-flex flex-column">
        <Form.Label className="fw-bold mb-2">Propulsion</Form.Label>
        <Form.Select
          name="UTILISATION_PRPL"
          value={formData.UTILISATION_PRPL || 'MANUELLE'}
          onChange={handleInputChange}
          required
          className="form-control-lg"
        >
          <option value="MANUELLE">Manuelle</option>
          <option value="ELECTRIQUE">Électrique</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="d-flex align-items-center gap-2">
        <Form.Check
          type="checkbox"
          id="aidant-check"
          name="AIDANT"
          label="Aidant / accompagnant"
          checked={!!formData.AIDANT}
          onChange={handleInputChange}
        />
      </Form.Group>
    </div>
  );

  const renderClinicienForm = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              name="NOMC"
              value={formData.NOMC ?? ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              name="PRENOMC"
              value={formData.PRENOMC ?? ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Spécialité</Form.Label>
        <Form.Select name="ID_SPEC" value={String(formData.ID_SPEC ?? '1')} onChange={handleInputChange} required>
          <option value="1">Rééducation</option>
          <option value="2">Orthopédie</option>
          <option value="3">Neurologie</option>
        </Form.Select>
      </Form.Group>
    </>
  );

  const renderCommercantForm = () => (
    <Form.Group className="mb-3">
      <Form.Label>Nom commercial</Form.Label>
      <Form.Control
        type="text"
        name="NOM_MARCHAND"
        value={formData.NOM_MARCHAND ?? ''}
        onChange={handleInputChange}
        required
      />
    </Form.Group>
  );

  const renderCommonFormFields = () => (
    <div className="d-flex flex-column gap-4">
      <Form.Group className="d-flex flex-column">
        <Form.Label className="fw-bold mb-2">
          <FaMapMarkerAlt className="me-2" />
          Adresse
        </Form.Label>
        <Form.Control
          type="text"
          name="ADRESSE"
          value={formData.ADRESSE ?? ''}
          onChange={handleInputChange}
          className="form-control-lg"
        />
      </Form.Group>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-bold mb-2">
              <FaEnvelope className="me-2" />
              Email
            </Form.Label>
            <Form.Control
              type="email"
              name="EMAIL"
              value={formData.EMAIL ?? ''}
              onChange={handleInputChange}
              required
              className="form-control-lg"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-bold mb-2">
              <FaPhone className="me-2" />
              Téléphone
            </Form.Label>
            <Form.Control
              type="tel"
              name="NUMTEL"
              value={formData.NUMTEL ?? ''}
              onChange={handleInputChange}
              className="form-control-lg"
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  const fmtNum = (v, suffix = '') => {
    if (v === '' || v === undefined || v === null) return '—';
    return `${v}${suffix}`;
  };

  const renderPatientInfo = () => (
    <Row className="g-4">
      <Col md={4}>
        <Card className="h-100 shadow-sm">
          <Card.Header className="bg-primary text-white d-flex align-items-center">
            <FaUser className="me-2" />
            <h5 className="mb-0">Informations personnelles</h5>
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Nom:</strong>
              <span>{userData.NOMP || '—'}</span>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Prénom:</strong>
              <span>{userData.PRENOMP || '—'}</span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-2">NSS:</strong>
              <span>{userData.NSS || '—'}</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="h-100 shadow-sm">
          <Card.Header className="bg-success text-white d-flex align-items-center">
            <FaUserMd className="me-2" />
            <h5 className="mb-0">Informations médicales</h5>
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Poids:</strong>
              <span>{fmtNum(userData.POIDS, ' kg')}</span>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Taille:</strong>
              <span>{fmtNum(userData.TAILLE, ' m')}</span>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Propulsion:</strong>
              <span>{userData.UTILISATION_PRPL || '—'}</span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-2">Aidant:</strong>
              <span>{userData.AIDANT ? 'Oui' : 'Non'}</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="h-100 shadow-sm">
          <Card.Header className="bg-info text-white d-flex align-items-center">
            <FaMapMarkerAlt className="me-2" />
            <h5 className="mb-0">Coordonnées</h5>
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Adresse:</strong>
              <span>{userData.ADRESSE || '—'}</span>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <strong className="me-2">Email:</strong>
              <span>{userData.EMAIL || '—'}</span>
            </div>
            <div className="d-flex align-items-center">
              <strong className="me-2">Téléphone:</strong>
              <span>{userData.NUMTEL || '—'}</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderClinicienInfo = () => (
    <Row>
      <Col md={6}>
        <Card className="mb-3">
          <Card.Header className="bg-primary text-white d-flex align-items-center">
            <FaUserMd className="me-2" />
            <h5 className="mb-0">Informations professionnelles</h5>
          </Card.Header>
          <Card.Body>
            <p className="mb-2">
              <strong>Nom:</strong> {userData.NOMC || '—'}
            </p>
            <p className="mb-2">
              <strong>Prénom:</strong> {userData.PRENOMC || '—'}
            </p>
            <p className="mb-0">
              <strong>Spécialité:</strong> {userData.specialite || '—'}
            </p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        <Card className="mb-3">
          <Card.Header className="bg-info text-white d-flex align-items-center">
            <FaEnvelope className="me-2" />
            <h5 className="mb-0">Coordonnées</h5>
          </Card.Header>
          <Card.Body>
            <p className="mb-2">
              <strong>Adresse:</strong> {userData.ADRESSE || '—'}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {userData.EMAIL || '—'}
            </p>
            <p className="mb-0">
              <strong>Téléphone:</strong> {userData.NUMTEL || '—'}
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderCommercantInfo = () => (
    <Row>
      <Col md={6}>
        <Card className="mb-3">
          <Card.Header className="bg-primary text-white d-flex align-items-center">
            <FaStore className="me-2" />
            <h5 className="mb-0">Informations commerciales</h5>
          </Card.Header>
          <Card.Body>
            <p className="mb-0">
              <strong>Nom commercial:</strong> {userData.NOM_MARCHAND || '—'}
            </p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        <Card className="mb-3">
          <Card.Header className="bg-info text-white d-flex align-items-center">
            <FaEnvelope className="me-2" />
            <h5 className="mb-0">Coordonnées</h5>
          </Card.Header>
          <Card.Body>
            <p className="mb-2">
              <strong>Adresse:</strong> {userData.ADRESSE || '—'}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {userData.EMAIL || '—'}
            </p>
            <p className="mb-0">
              <strong>Téléphone:</strong> {userData.NUMTEL || '—'}
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return wrapLayout(
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <h4 className="mt-3">Chargement de votre profil...</h4>
        </div>
      </Container>,
    );
  }

  if (error && !userData) {
    return wrapLayout(
      <Container className="mt-4">
        <Alert variant="danger" className="d-flex align-items-center">
          <FaTimes className="me-2" />
          <div>
            <h5 className="alert-heading">Erreur</h5>
            <p className="mb-0">{error}</p>
          </div>
        </Alert>
      </Container>,
    );
  }

  if (!userData) {
    return wrapLayout(null);
  }

  return wrapLayout(
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center flex-wrap">
          <h2 className="mb-0 d-flex align-items-center">
            <FaUser className="me-2" />
            Mon Profil
          </h2>
          <Badge bg="primary" className="ms-2">
            {typeLabel(userData.type)}
          </Badge>
        </div>
        <Button variant={isEditing ? 'outline-danger' : 'outline-primary'} onClick={handleToggleEdit} className="d-flex align-items-center">
          {isEditing ? (
            <>
              <FaTimes className="me-2" />
              Annuler
            </>
          ) : (
            <>
              <FaEdit className="me-2" />
              Modifier
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="warning" className="mb-3" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {isEditing ? (
            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              {isPatient(userData.type) && renderPatientForm()}
              {isClinician(userData.type) && renderClinicienForm()}
              {isVendor(userData.type) && renderCommercantForm()}
              {renderCommonFormFields()}
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" className="d-flex align-items-center" size="lg">
                  <FaSave className="me-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </Form>
          ) : (
            <>
              {isPatient(userData.type) && renderPatientInfo()}
              {isClinician(userData.type) && renderClinicienInfo()}
              {isVendor(userData.type) && renderCommercantInfo()}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>,
  );
};

export default MyProfile;
