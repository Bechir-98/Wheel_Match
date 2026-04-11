import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap';
import { FaUser, FaWeight, FaRulerVertical, FaWheelchair, FaUserNurse, FaPlus, FaEdit, FaTrash, FaStethoscope } from 'react-icons/fa';
import { apiUrl, authHeaders } from '../config/api.js';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [newPatient, setNewPatient] = useState({
    ADRESSE: '',
    EMAIL: '',
    PASSWORD: '',
    NUMTEL: '',
    NOMP: '',
    PRENOMP: '',
    NSS: '',
    POIDS: '',
    TAILLE: '',
    UTILISATION_PRPL: '',
    AIDANT: false
  });

  const [medicalData, setMedicalData] = useState({
    MORPHOLOGIE: '',
    PATHOLOGIE: '',
    NOTES: ''
  });
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(apiUrl('/patients'), {
        method: 'GET',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setPatients(data);
    } catch (error) {
      console.error('Error details:', error);
      showAlert('danger', `Error fetching patients: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMedicalDataChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/patients'), {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(newPatient),
      });

      if (response.ok) {
        setShowModal(false);
        setNewPatient({
          ADRESSE: '',
          EMAIL: '',
          PASSWORD: '',
          NUMTEL: '',
          NOMP: '',
          PRENOMP: '',
          NSS: '',
          POIDS: '',
          TAILLE: '',
          UTILISATION_PRPL: '',
          AIDANT: false
        });
        fetchPatients();
        showAlert('success', 'Patient added successfully');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      showAlert('danger', 'Error adding patient');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        apiUrl(`/patients/${selectedPatient.ID_UTILISATUER}`),
        {
          method: 'PUT',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(newPatient),
        },
      );

      if (response.ok) {
        setShowUpdateModal(false);
        fetchPatients();
        showAlert('success', 'Patient updated successfully');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      showAlert('danger', 'Error updating patient');
    }
  };

  const handleDelete = async (id_utilisateur) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(apiUrl(`/patients/${id_utilisateur}`), {
          method: 'DELETE',
          headers: authHeaders(),
        });

        if (response.ok) {
          fetchPatients();
          showAlert('success', 'Patient deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        showAlert('danger', 'Error deleting patient');
      }
    }
  };

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        apiUrl(`/patients/${selectedPatient.ID_UTILISATUER}/medical`),
        {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(medicalData),
        },
      );

      if (response.ok) {
        setShowMedicalModal(false);
        setMedicalData({
          MORPHOLOGIE: '',
          PATHOLOGIE: '',
          NOTES: ''
        });
        showAlert('success', 'Medical data updated successfully');
      }
    } catch (error) {
      console.error('Error updating medical data:', error);
      showAlert('danger', 'Error updating medical data');
    }
  };

  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-4">
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible className="mt-3">
          {alert.message}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Patients Management</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <FaPlus />
          Add New Patient
        </Button>
      </div>

      <Row className="g-4">
        {patients.map((patient) => (
          <Col key={patient.ID_UTILISATUER} xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <FaUser className="text-primary fs-4" />
                  </div>
                  <div>
                    <h5 className="mb-1">{patient.NOMP} {patient.PRENOMP}</h5>
                    <p className="text-muted mb-0">NSS: {patient.NSS}</p>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center text-muted">
                      <FaWeight className="me-2" />
                      <span>{patient.POIDS} kg</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center text-muted">
                      <FaRulerVertical className="me-2" />
                      <span>{patient.TAILLE} cm</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center text-muted">
                      <FaWheelchair className="me-2" />
                      <span>{patient.UTILISATION_PRPL}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center text-muted">
                      <FaUserNurse className="me-2" />
                      <span>Caregiver: {patient.AIDANT ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowMedicalModal(true);
                    }}
                  >
                    <FaStethoscope />
                    Medical Data
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setNewPatient(patient);
                      setShowUpdateModal(true);
                    }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => handleDelete(patient.ID_UTILISATUER)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Patient Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add New Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="NOMP"
                    value={newPatient.NOMP}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="PRENOMP"
                    value={newPatient.PRENOMP}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>NSS</Form.Label>
              <Form.Control
                type="text"
                name="NSS"
                value={newPatient.NSS}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="POIDS"
                    value={newPatient.POIDS}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="TAILLE"
                    value={newPatient.TAILLE}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Wheelchair Usage</Form.Label>
              <Form.Control
                type="text"
                name="UTILISATION_PRPL"
                value={newPatient.UTILISATION_PRPL}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Has Caregiver"
                name="AIDANT"
                checked={newPatient.AIDANT}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Patient
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Patient Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Update Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="NOMP"
                    value={newPatient.NOMP}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="PRENOMP"
                    value={newPatient.PRENOMP}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>NSS</Form.Label>
              <Form.Control
                type="text"
                name="NSS"
                value={newPatient.NSS}
                onChange={handleInputChange}
                required
                disabled
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="POIDS"
                    value={newPatient.POIDS}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="TAILLE"
                    value={newPatient.TAILLE}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Wheelchair Usage</Form.Label>
              <Form.Control
                type="text"
                name="UTILISATION_PRPL"
                value={newPatient.UTILISATION_PRPL}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Has Caregiver"
                name="AIDANT"
                checked={newPatient.AIDANT}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Patient
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Medical Data Modal */}
      <Modal show={showMedicalModal} onHide={() => setShowMedicalModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Medical Data for {selectedPatient?.NOMP} {selectedPatient?.PRENOMP}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMedicalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Morphology</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="MORPHOLOGIE"
                value={medicalData.MORPHOLOGIE}
                onChange={handleMedicalDataChange}
                placeholder="Enter morphological details"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pathology</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="PATHOLOGIE"
                value={medicalData.PATHOLOGIE}
                onChange={handleMedicalDataChange}
                placeholder="Enter pathological details"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="NOTES"
                value={medicalData.NOTES}
                onChange={handleMedicalDataChange}
                placeholder="Enter additional notes"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowMedicalModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Medical Data
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PatientsPage;