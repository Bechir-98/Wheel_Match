import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { FaWheelchair, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaHourglassHalf } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const mockWheelchairs = [
  {
    ID_FAUTEUIL: 1,
    NOM_TYPE: 'Manual Wheelchair',
    PROPULTION_TEXT: 'Manual',
    PRIX: 1200,
    QT_STOCK: 10,
    APPROVED: true,
    STATUS: 'approved',
  },
  {
    ID_FAUTEUIL: 2,
    NOM_TYPE: 'Electric Wheelchair',
    PROPULTION_TEXT: 'Electric',
    PRIX: 3500,
    QT_STOCK: 5,
    APPROVED: false,
    STATUS: 'pending',
  },
  {
    ID_FAUTEUIL: 3,
    NOM_TYPE: 'Sports Wheelchair',
    PROPULTION_TEXT: 'Manual',
    PRIX: 2200,
    QT_STOCK: 2,
    APPROVED: false,
    STATUS: 'rejected',
  },
];

const ChoisisPage = () => {
  const [wheelchairs, setWheelchairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWheelchair, setSelectedWheelchair] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setWheelchairs(mockWheelchairs);
      setLoading(false);
    }, 500);
  }, []);

  const handleSelectWheelchair = (wheelchair) => {
    setSelectedWheelchair(wheelchair);
    setShowConfirmModal(true);
  };

  const handleConfirmSelection = async () => {
    setShowConfirmModal(false);
    navigate('/dashboard');
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

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  const getBadge = (wheelchair) => {
    if (wheelchair.STATUS === 'approved') {
      return (
        <Badge bg="success" className="d-flex align-items-center gap-1">
          <FaCheckCircle />
          Approved
        </Badge>
      );
    }
    if (wheelchair.STATUS === 'pending') {
      return (
        <Badge bg="warning" className="d-flex align-items-center gap-1 text-dark">
          <FaHourglassHalf />
          Pending
        </Badge>
      );
    }
    return (
      <Badge bg="danger" className="d-flex align-items-center gap-1">
        <FaTimesCircle />
        Rejected
      </Badge>
    );
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Make Your Final Wheelchair Choice</h2>
      
      <Alert variant="info" className="mb-4">
        <FaInfoCircle className="me-2" />
        Please review the wheelchairs below and select your final choice. 
        The approval status from your clinician is shown for each option.
      </Alert>

      <Row className="g-4">
        {wheelchairs.map((wheelchair) => (
          <Col key={wheelchair.ID_FAUTEUIL} xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="mb-0">{wheelchair.NOM_TYPE}</h5>
                  {getBadge(wheelchair)}
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1">Type: {wheelchair.PROPULTION_TEXT}</p>
                  <p className="text-muted mb-1">Price: ${wheelchair.PRIX}</p>
                  <p className="text-muted mb-1">Stock: {wheelchair.QT_STOCK} available</p>
                </div>

                <div className="mt-auto">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => handleSelectWheelchair(wheelchair)}
                    disabled={wheelchair.STATUS !== 'approved'}
                  >
                    Select This Wheelchair
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Your Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to select the {selectedWheelchair?.NOM_TYPE} as your final choice?</p>
          <p className="text-muted">
            This selection will be final and cannot be changed without consulting your clinician.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmSelection}>
            Confirm Selection
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ChoisisPage;
