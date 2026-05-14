import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Alert,
  Carousel, ListGroup, Tab, Tabs, Image, Modal
} from 'react-bootstrap';

import standardWheelchair from '../assets/wheelchair-standard.jpg';
import customWheelchair from '../assets/wheelchair-custom.jpg';
import sportWheelchair from '../assets/wheelchair-sport.jpg';
import defaultWheelchair from '../assets/brand.png';
import componentImage1 from '../assets/component1.jpg';
import componentImage2 from '../assets/component2.jpg';
import { apiUrl, authHeaders } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const WheelchairDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wheelchair, setWheelchair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedWheelchairs, setRelatedWheelchairs] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);
  const { user } = useAuth();
  const [requestStatus, setRequestStatus] = useState(null);

  const handleRequest = async () => {
    try {
      setRequestStatus('loading');
      const res = await fetch(apiUrl('/patient/requests'), {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_fauteuil: wheelchair.ID_FAUTEUIL })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erreur lors de la demande');
      }
      setRequestStatus('success');
    } catch (err) {
      setRequestStatus('error');
      alert(err.message);
    }
  };

  const getWheelchairImage = (typeName) => {
    const imageMap = {
      'standard': standardWheelchair,
      'sur mesure': customWheelchair,
      'sportif': sportWheelchair,
    };
    const normalizedType = typeName?.trim().toLowerCase();
    return imageMap[normalizedType] || defaultWheelchair;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Appel pour les détails du fauteuil
        const res = await fetch(apiUrl(`/wheelchairs/${id}`));
        if (!res.ok) throw new Error('Erreur lors de la récupération des données.');
        const data = await res.json();

        const relatedRes = await fetch(
          apiUrl(`/wheelchairs/related/list?type=${data.ID_TYPE}&exclude=${id}`),
        );
        if (!relatedRes.ok) throw new Error('Erreur lors de la récupération des fauteuils similaires.');
        const relatedData = await relatedRes.json();

        setWheelchair(data);
        setRelatedWheelchairs(relatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des détails du fauteuil...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => navigate('/wheelchairs')}>Retour</Button>
        </Alert>
      </Container>
    );
  }

  if (!wheelchair) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Fauteuil introuvable</Alert.Heading>
          <p>Ce fauteuil n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/wheelchairs')}>Retour</Button>
        </Alert>
      </Container>
    );
  }

  const images = [
    getWheelchairImage(wheelchair.NOM_TYPE),
    componentImage1,
    componentImage2
  ].filter(Boolean);

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" onClick={() => navigate('/wheelchairs')} className="mb-4">
        &larr; Retour
      </Button>

      <Row className="mb-5">
        <Col lg={6}>
          <Card className="mb-4 shadow-sm">
            <Carousel
              activeIndex={activeImage}
              onSelect={setActiveImage}
              interval={null}
              indicators={images.length > 1}
              controls={images.length > 1}
            >
              {images.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <div
                    style={{
                      height: '400px',
                      background: `url(${img}) center/contain no-repeat`,
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowEnlargeModal(true)}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            {images.length > 1 && (
              <div className="d-flex justify-content-center p-2">
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    thumbnail
                    style={{
                      width: '60px',
                      height: '60px',
                      margin: '0 5px',
                      cursor: 'pointer',
                      opacity: activeImage === idx ? 1 : 0.6
                    }}
                    onClick={() => setActiveImage(idx)}
                    alt={`Image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Card.Title className="d-flex justify-content-between align-items-start">
                <h2>{wheelchair.NOM_TYPE || 'Type inconnu'}</h2>
                <div>
                  {wheelchair.isNew && <Badge bg="danger" className="me-2">Nouveau</Badge>}
                  {wheelchair.PROPULTION === 1 && <Badge bg="info">⚡ Motorisé</Badge>}
                </div>
              </Card.Title>

              <div className="mb-4">
                <h3 className="text-success mb-2">${Number(wheelchair.PRIX).toFixed(2)}</h3>
                <p className={wheelchair.QT_STOCK > 0 ? 'text-success' : 'text-danger'}>
                  <strong>Disponibilité :</strong> {wheelchair.QT_STOCK > 0
                    ? `${wheelchair.QT_STOCK} en stock`
                    : 'Rupture de stock'}
                </p>
              </div>

              <Tabs defaultActiveKey="specs" className="mb-4">
                <Tab eventKey="specs" title="Spécifications">
                  <ListGroup variant="flush" className="mt-3">
                    <ListGroup.Item><strong>Type:</strong> {wheelchair.NOM_TYPE}</ListGroup.Item>
                    <ListGroup.Item><strong>Propulsion:</strong> {wheelchair.PROPULTION ? 'Oui' : 'Non'}</ListGroup.Item>
                    <ListGroup.Item><strong>Poids supporté:</strong> {wheelchair.POIDS_MAX || '150 kg'}</ListGroup.Item>
                    <ListGroup.Item><strong>Dimensions:</strong> {wheelchair.DIMENSIONS || 'Non spécifiées'}</ListGroup.Item>
                    <ListGroup.Item><strong>Poids:</strong> {wheelchair.POIDS ? `${wheelchair.POIDS} kg` : 'Non spécifié'}</ListGroup.Item>
                  </ListGroup>
                </Tab>

                <Tab eventKey="options" title="Options">
                  {Array.isArray(wheelchair.options) && wheelchair.options.length > 0 ? (
                    <ListGroup variant="flush" className="mt-3">
                      {wheelchair.options.map(option => (
                        <ListGroup.Item key={option.ID_OPTION}>
                          <strong>{option.NOM_OPTION}</strong>
                          {option.TAILLE_OPTION && <span className="text-muted"> ({option.TAILLE_OPTION})</span>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="mt-3">Aucune option disponible.</p>
                  )}
                </Tab>

                <Tab eventKey="components" title="Composants">
                  {Array.isArray(wheelchair.components) && wheelchair.components.length > 0 ? (
                    <ListGroup variant="flush" className="mt-3">
                      {wheelchair.components.map(comp => (
                        <ListGroup.Item key={comp.ID_COMPOSANT}>
                          <strong>{comp.NOM_COMP}</strong>
                          {comp.TAILLE_COMP && <span className="text-muted"> - Taille : {comp.TAILLE_COMP}</span>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="mt-3">Aucun composant spécifié.</p>
                  )}
                </Tab>

                <Tab eventKey="pathologies" title="Pathologies">
                  {Array.isArray(wheelchair.pathologies) && wheelchair.pathologies.length > 0 ? (
                    <div className="mt-3">
                      <p>Ce fauteuil est recommandé pour :</p>
                      <ul>
                        {wheelchair.pathologies.map(path => (
                          <li key={path.ID_PATHOLOGIE}>
                            <strong>{path.NOM_PAT}</strong>
                            <p className="text-muted small">{path.DESCRIPTION}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3">Aucune recommandation spécifique.</p>
                  )}
                </Tab>
              </Tabs>

              <div className="mt-auto d-grid gap-2">
                {user?.userType === 'patient' ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    disabled={wheelchair.QT_STOCK <= 0 || requestStatus === 'loading' || requestStatus === 'success'}
                    onClick={handleRequest}
                  >
                    {requestStatus === 'success' ? 'Demande envoyée !' : 
                     requestStatus === 'loading' ? 'Envoi...' : 
                     'Demander l\'approbation du clinicien'}
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" disabled={wheelchair.QT_STOCK <= 0}>
                    {wheelchair.QT_STOCK > 0 ? 'Ajouter au panier' : 'Notifier en cas de disponibilité'}
                  </Button>
                )}
                <Button variant="outline-secondary">Contacter un spécialiste</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {relatedWheelchairs.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-4">Fauteuils similaires</h3>
          <Row className="g-4">
            {relatedWheelchairs.map(rel => (
              <Col key={rel.ID_FAUTEUIL} xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={getWheelchairImage(rel.NOM_TYPE)}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between">
                      <span>{rel.NOM_TYPE}</span>
                      {rel.PROPULTION === 1 && <Badge bg="info">⚡</Badge>}
                    </Card.Title>
                    <Card.Text className="text-success fw-bold">${Number(rel.PRIX).toFixed(2)}</Card.Text>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                      onClick={() => navigate(`/wheelchairs/${rel.ID_FAUTEUIL}`)}
                    >
                      Voir détails
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      )}

      <Modal show={showEnlargeModal} onHide={() => setShowEnlargeModal(false)} size="lg" centered>
        <Modal.Body className="p-0">
          <img src={images[activeImage]} alt="Agrandissement" style={{ width: '100%', height: 'auto' }} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default WheelchairDetail;
