import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge, Spinner, Alert,
  Carousel, ListGroup, Tab, Tabs, Image, Modal, Form, Toast, ToastContainer,
  OverlayTrigger, Tooltip, ProgressBar, Breadcrumb, Accordion
} from 'react-bootstrap';
import { 
  Star, StarFill, Heart, HeartFill, Truck, InfoCircle, 
  ArrowLeft, ZoomIn, Share, Check2Circle, CartPlus,
  ShieldCheck, CreditCard, ArrowRepeat, Gift
} from 'react-bootstrap-icons';

// Import images
import standardWheelchair from '../assets/wheelchair-standard.jpg';
import customWheelchair from '../assets/wheelchair-custom.jpg';
import sportWheelchair from '../assets/wheelchair-sport.jpg';
import defaultWheelchair from '../assets/brand.png';
import componentImage1 from '../assets/component1.jpg';
import componentImage2 from '../assets/component2.jpg';
import Twheel from '../assets/Twheel.jpg';
import { apiUrl } from '../config/api.js';

const WheelchairDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wheelchair, setWheelchair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedWheelchairs, setRelatedWheelchairs] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [reviewsCount] = useState(Math.floor(Math.random() * 100) + 5);
  const [rating] = useState((Math.random() * 2 + 3).toFixed(1));
  const [activeTab, setActiveTab] = useState('specs');

  // Image handling with multiple fallbacks
  const getWheelchairImage = (typeName) => {
    const imageMap = {
      'actif': standardWheelchair,
      'sur mesure': customWheelchair,
      'Haut de gamme': sportWheelchair,
      'traditionnel ': Twheel,
    };
    
    const normalizedType = typeName?.trim().toLowerCase();
    return imageMap[normalizedType] || defaultWheelchair;
  };

  // Handle quantity changes
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (wheelchair?.QT_STOCK || 10)) {
      setQuantity(value);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    setToastMessage(`${quantity} × ${wheelchair.NOM_TYPE} added to cart`);
    setShowToast(true);
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    setWishlist(!wishlist);
    setToastMessage(wishlist ? 'Removed from wishlist' : 'Added to wishlist');
    setShowToast(true);
  };

  // Expected delivery date (2 weeks from now)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Fetch wheelchair details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch main wheelchair data
        const wheelchairResponse = await fetch(apiUrl(`/wheelchairs/${id}`));
        if (!wheelchairResponse.ok) throw new Error('Wheelchair not found');
        const wheelchairData = await wheelchairResponse.json();

        const relatedResponse = await fetch(
          apiUrl(`/wheelchairs/related/list?type=${wheelchairData.ID_TYPE}&exclude=${id}`),
        );
        const relatedData = await relatedResponse.json();
        
        setWheelchair(wheelchairData);
        setRelatedWheelchairs(relatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Ratings display component
  const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          i < fullStars ? <StarFill key={i} className="text-warning me-1" /> :
          i === fullStars && hasHalfStar ? <Star key={i} className="text-warning me-1" /> :
          <Star key={i} className="text-muted me-1" />
        ))}
        <span className="ms-2 text-muted">{rating}/5 ({reviewsCount} reviews)</span>
      </div>
    );
  };

  // Loading state with skeleton loader
  if (loading) return (
    <Container className="py-5">
      <div className="placeholder-glow">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item className="placeholder col-2"></Breadcrumb.Item>
          <Breadcrumb.Item className="placeholder col-2"></Breadcrumb.Item>
          <Breadcrumb.Item className="placeholder col-2"></Breadcrumb.Item>
        </Breadcrumb>
        
        <Button variant="outline-primary" className="mb-4 placeholder col-2"></Button>
        
        <Row>
          <Col lg={6} className="mb-4">
            <div className="placeholder rounded-3" style={{ height: '450px' }}></div>
          </Col>
          <Col lg={6}>
            <div className="placeholder rounded-3 mb-3" style={{ height: '40px', width: '60%' }}></div>
            <div className="placeholder rounded-3 mb-4" style={{ height: '24px', width: '40%' }}></div>
            <div className="placeholder rounded-3 mb-4" style={{ height: '32px', width: '30%' }}></div>
            <div className="placeholder rounded-3 mb-4" style={{ height: '100px' }}></div>
            <div className="placeholder rounded-3 mb-4" style={{ height: '56px', width: '100%' }}></div>
            <div className="placeholder rounded-3" style={{ height: '200px' }}></div>
          </Col>
        </Row>
      </div>
    </Container>
  );

  // Error state with improved UI
  if (error) return (
    <Container className="py-5">
      <Alert variant="danger" className="shadow-sm rounded-3">
        <Alert.Heading className="d-flex align-items-center">
          <InfoCircle className="me-2" /> Error Loading Wheelchair
        </Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="danger" onClick={() => navigate('/wheelchairs')}>
            Browse Wheelchairs
          </Button>
        </div>
      </Alert>
    </Container>
  );

  // Not found state with improved UI
  if (!wheelchair) return (
    <Container className="py-5">
      <Alert variant="warning" className="shadow-sm rounded-3">
        <Alert.Heading className="d-flex align-items-center">
          <InfoCircle className="me-2" /> Wheelchair Not Found
        </Alert.Heading>
        <p>The requested wheelchair could not be found. It might have been removed or the ID is incorrect.</p>
        <hr />
        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-warning" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="warning" onClick={() => navigate('/wheelchairs')}>
            Browse Available Wheelchairs
          </Button>
        </div>
      </Alert>
    </Container>
  );

  // Create image gallery (main image + additional angles)
  const images = [
    getWheelchairImage(wheelchair.NOM_TYPE),
    componentImage1,
    componentImage2
  ].filter(Boolean);

  return (
    <>
      <Container className="py-4" style={{ maxWidth: 900 }}>
        {/* Back button with improved styling */}
        <Button 
          variant="light" 
          onClick={() => navigate('/wheelchairs')}
          className="mb-4 d-flex align-items-center gap-2 rounded-pill px-3"
        >
          <ArrowLeft size={18} /> Back to Wheelchairs
        </Button>
        
        {/* Main product section */}
        <Row className="mb-5 g-4 flex-column flex-lg-row">
          {/* Image Gallery Column */}
          <Col lg={5} className="mb-4 mb-lg-0" style={{ minWidth: 0, flex: 1 }}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <div className="position-relative d-flex flex-column h-100">
                {/* Main Carousel */}
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                  <Carousel 
                    activeIndex={activeImage} 
                    onSelect={setActiveImage}
                    interval={null}
                    indicators={images.length > 1}
                    controls={images.length > 1}
                    className="product-carousel flex-grow-1 w-100"
                    style={{ minHeight: 320, maxHeight: 400 }}
                  >
                    {images.map((img, idx) => (
                      <Carousel.Item key={idx} className="h-100">
                        <div 
                          className="d-flex justify-content-center align-items-center bg-light"
                          style={{ height: 320, minHeight: 220, maxHeight: 400, width: '100%' }}
                          onClick={() => setShowEnlargeModal(true)}
                        >
                          <img
                            src={img}
                            alt={`Wheelchair view ${idx + 1}`}
                            className="img-fluid"
                            style={{
                              maxHeight: 320,
                              maxWidth: '100%',
                              objectFit: 'contain',
                              cursor: 'zoom-in'
                            }}
                          />
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>
                
                {/* Quick action buttons - floating position */}
                <div className="position-absolute top-0 end-0 p-3 d-flex flex-column gap-2">
                  <OverlayTrigger overlay={<Tooltip>Zoom Image</Tooltip>}>
                    <Button 
                      variant="light" 
                      className="rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
                      onClick={() => setShowEnlargeModal(true)}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <ZoomIn size={18} />
                    </Button>
                  </OverlayTrigger>
                  
                  <OverlayTrigger overlay={<Tooltip>{wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</Tooltip>}>
                    <Button 
                      variant="light" 
                      className="rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
                      onClick={toggleWishlist}
                      style={{ width: '40px', height: '40px' }}
                    >
                      {wishlist ? <HeartFill size={18} className="text-danger" /> : <Heart size={18} />}
                    </Button>
                  </OverlayTrigger>
                </div>
                
                {/* Thumbnail navigation - improved layout */}
                {images.length > 1 && (
                  <Card.Footer className="bg-white border-0 pt-3 pb-4">
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                      {images.map((img, idx) => (
                        <div 
                          key={idx}
                          className={`thumbnail-container ${activeImage === idx ? 'active' : ''}`}
                          onClick={() => setActiveImage(idx)}
                          style={{
                            width: '60px',
                            height: '60px',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            padding: '2px',
                            border: activeImage === idx ? '2px solid var(--bs-primary)' : '2px solid transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="img-fluid h-100 w-100 object-fit-cover rounded-2"
                          />
                        </div>
                      ))}
                    </div>
                  </Card.Footer>
                )}
              </div>
            </Card>
          </Col>
          
          {/* Product Info Column */}
          <Col lg={4} style={{ minWidth: 0, flex: 1 }}>
            <div className="sticky-top" style={{ top: '20px' }}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="d-flex flex-column">
                  {/* Header section */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        {wheelchair.isNew && (
                          <Badge pill bg="danger" className="mb-2">NEW MODEL</Badge>
                        )}
                        <h1 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>{wheelchair.NOM_TYPE}</h1>
                        <RatingStars rating={rating} />
                      </div>
                    </div>
                    
                    {/* Price section */}
                    <div className="mb-4">
                      <h2 className="text-primary fw-bold mb-0" style={{ fontSize: '2rem' }}>
                        {Number(wheelchair.PRIX).toFixed(2)} DT
                      </h2>
                      <small className="text-muted">Tax included. Shipping calculated at checkout.</small>
                    </div>
                  </div>
                  
                  {/* Stock status with improved layout */}
                  <div className="mb-4 p-3 bg-light bg-opacity-25 rounded-3 border">
                    <div className="d-flex align-items-start">
                      {wheelchair.QT_STOCK > 0 ? (
                        <>
                          <Check2Circle className="text-success me-2 mt-1 flex-shrink-0" size={18} />
                          <div>
                            <span className="text-success fw-semibold">In Stock</span>
                            <small className="d-block text-muted">
                              {wheelchair.QT_STOCK} units available • Ready to ship
                            </small>
                          </div>
                        </>
                      ) : (
                        <>
                          <InfoCircle className="text-danger me-2 mt-1 flex-shrink-0" size={18} />
                          <div>
                            <span className="text-danger fw-semibold">Out of Stock</span>
                            <small className="d-block text-muted">
                              Expected restock in 2-3 weeks
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {wheelchair.QT_STOCK > 0 && (
                      <div className="mt-3 d-flex align-items-center">
                        <Truck className="text-muted me-2 flex-shrink-0" size={18} />
                        <small className="text-muted">
                          Free delivery estimated by <strong>{getDeliveryDate()}</strong>
                        </small>
                      </div>
                    )}
                  </div>
                  
                  {/* Purchase options */}
                  {wheelchair.QT_STOCK > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-semibold mb-3">Purchase Options</h5>
                      
                      {/* Quantity selector */}
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Quantity</Form.Label>
                        <div className="d-flex align-items-center" style={{ maxWidth: '120px' }}>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                            className="rounded-start rounded-end-0 px-2"
                            disabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <Form.Control
                            type="number"
                            min="1"
                            max={wheelchair.QT_STOCK}
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="text-center mx-0 rounded-0 border-start-0 border-end-0"
                            style={{ fontSize: 14, padding: '0.25rem 0.5rem' }}
                          />
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => quantity < wheelchair.QT_STOCK && setQuantity(quantity + 1)}
                            className="rounded-end rounded-start-0 px-2"
                            disabled={quantity >= wheelchair.QT_STOCK}
                          >
                            +
                          </Button>
                        </div>
                        <Form.Text className="text-muted">
                          Max {wheelchair.QT_STOCK} per order
                        </Form.Text>
                      </Form.Group>
                      
                      {/* Action buttons */}
                      <div className="d-grid gap-2 mb-4">
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={handleAddToCart}
                          className="d-flex align-items-center justify-content-center gap-2 rounded-pill py-2"
                          style={{ fontSize: 16 }}
                        >
                          <CartPlus size={18} />
                          Add to Cart • {(Number(wheelchair.PRIX) * quantity).toFixed(2)} DT
                        </Button>
                        
                        <div className="d-flex gap-2">
                          <Button 
                            variant={wishlist ? "outline-danger" : "outline-secondary"} 
                            className="flex-grow-1 rounded-pill py-2"
                            onClick={toggleWishlist}
                          >
                            {wishlist ? (
                              <>
                                <HeartFill className="me-2" /> Saved
                              </>
                            ) : (
                              <>
                                <Heart className="me-2" /> Save for Later
                              </>
                            )}
                          </Button>
                          
                          <OverlayTrigger overlay={<Tooltip>Share this product</Tooltip>}>
                            <Button 
                              variant="outline-secondary" 
                              className="rounded-pill py-2 px-3"
                            >
                              <Share size={18} />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Trust badges */}
                  <div className="mb-4 p-3 bg-light bg-opacity-10 rounded-3 border">
                    <Row className="g-2 text-center">
                      <Col xs={4}>
                        <div className="p-2">
                          <ShieldCheck size={24} className="text-primary mb-1" style={{ color: "var(--bs-light) !important" }} />
                          <div className="small" style={{ color: "var(--bs-light)" }}>2-Year Warranty</div>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className="p-2">
                          <CreditCard size={24} className="text-primary mb-1" style={{ color: "var(--bs-light) !important" }} />
                          <div className="small" style={{ color: "var(--bs-light)" }}>Secure Payment</div>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className="p-2">
                          <ArrowRepeat size={24} className="text-primary mb-1" style={{ color: "var(--bs-light) !important" }} />
                          <div className="small" style={{ color: "var(--bs-light)" }}>Easy Returns</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Specs/Options/Components Card */}
          <Col lg={3} style={{ minWidth: 0, flex: 1 }}>
            <Card className="border-0 shadow-sm rounded-4 h-100 mb-4">
              <Card.Body>
                <Accordion defaultActiveKey={activeTab} className="mb-4" onSelect={(k) => setActiveTab(k)}>
                  <Accordion.Item eventKey="specs" className="border-0">
                    <Accordion.Header className="bg-transparent rounded-3">
                      <span className="fw-semibold">Specifications</span>
                    </Accordion.Header>
                    <Accordion.Body className="px-0 pt-3">
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2 border-bottom">
                          <span className="text-muted">Type</span>
                          <span className="fw-semibold">{wheelchair.NOM_TYPE}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2 border-bottom">
                          <span className="text-muted">Propulsion</span>
                          <span className="fw-semibold">{wheelchair.PROPULTION ? "Electric" : "Manual"}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2 border-bottom">
                          <span className="text-muted">Weight Capacity</span>
                          <span className="fw-semibold">{wheelchair.POIDS_MAX || '150 kg'}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2 border-bottom">
                          <span className="text-muted">Dimensions</span>
                          <span className="fw-semibold">{wheelchair.DIMENSIONS || 'N/A'}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2">
                          <span className="text-muted">Weight</span>
                          <span className="fw-semibold">{wheelchair.POIDS || 'N/A'} kg</span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="options" className="border-0 mt-2">
                    <Accordion.Header className="bg-transparent rounded-3">
                      <span className="fw-semibold">Options & Accessories</span>
                    </Accordion.Header>
                    <Accordion.Body className="px-0 pt-3">
                      {wheelchair.options?.length > 0 ? (
                        <ListGroup variant="flush">
                          {wheelchair.options.map(option => (
                            <ListGroup.Item key={option.ID_OPTION} className="px-0 py-2 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-semibold">{option.NOM_OPTION}</span>
                                {option.TAILLE_OPTION && (
                                  <Badge bg="light" text="dark" className="rounded-pill">{option.TAILLE_OPTION}</Badge>
                                )}
                              </div>
                              {option.DESCRIPTION && (
                                <small className="text-muted d-block mt-1">{option.DESCRIPTION}</small>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <p className="text-muted">No additional options available for this model</p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="components" className="border-0 mt-2">
                    <Accordion.Header className="bg-transparent rounded-3">
                      <span className="fw-semibold">Components</span>
                    </Accordion.Header>
                    <Accordion.Body className="px-0 pt-3">
                      {wheelchair.components?.length > 0 ? (
                        <ListGroup variant="flush">
                          {wheelchair.components.map(comp => (
                            <ListGroup.Item key={comp.ID_COMPOSANT} className="px-0 py-2 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-semibold">{comp.NOM_COMP}</span>
                                {comp.TAILLE_COMP && (
                                  <Badge bg="light" text="dark" className="rounded-pill">Size: {comp.TAILLE_COMP}</Badge>
                                )}
                              </div>
                              {comp.DESCRIPTION && (
                                <small className="text-muted d-block mt-1">{comp.DESCRIPTION}</small>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <p className="text-muted">No component information available</p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                <Card 
                  className="border-0 rounded-3 mt-4"
                >
                  <Card.Body className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <InfoCircle size={24} />
                      </div>
                    </div>
                    <div className="ms-3">
                      <h5 className="mb-1">Need help choosing?</h5>
                      <p className="mb-2 small">Our mobility specialists can help you find the perfect wheelchair for your needs.</p>
                      <Button variant="light" size="sm" className="rounded-pill">
                        Contact Specialist
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Related Wheelchairs Section */}
        {relatedWheelchairs.length > 0 && (
          <section className="mt-5 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0 fw-bold" style={{ fontSize: '1.3rem' }}>You May Also Like</h3>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="rounded-pill"
                onClick={() => navigate('/wheelchairs')}
              >
                View All Wheelchairs
              </Button>
            </div>
            
            <Row className="g-3">
              {relatedWheelchairs.slice(0, 4).map(wheelchair => (
                <Col key={wheelchair.ID_FAUTEUIL} xs={12} sm={6} md={4} lg={3}>
                  <Card className="h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden transition-all">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={getWheelchairImage(wheelchair.NOM_TYPE)}
                        className="product-img"
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                      {wheelchair.PROPULTION === 1 && (
                        <Badge 
                          bg="primary" 
                          className="position-absolute top-0 end-0 m-2 rounded-pill d-flex align-items-center gap-1"
                        >
                          <span>⚡</span> Powered
                        </Badge>
                      )}
                      {wheelchair.isNew && (
                        <Badge 
                          bg="danger" 
                          className="position-absolute top-0 start-0 m-2 rounded-pill"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h6 mb-2">{wheelchair.NOM_TYPE}</Card.Title>
                      <div className="d-flex align-items-center mb-2">
                        <RatingStars rating={(Math.random() * 2 + 3).toFixed(1)} />
                      </div>
                      <Card.Text className="text-primary fw-bold mb-3" style={{ fontSize: '1rem' }}>
                        {Number(wheelchair.PRIX).toFixed(2)} DT
                      </Card.Text>
                      <Button 
                        variant="outline-primary"
                        className="mt-auto rounded-pill"
                        size="sm"
                        onClick={() => navigate(`/wheelchairs/${wheelchair.ID_FAUTEUIL}`)}
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        )}
        
        {/* Image Enlarge Modal */}
        <Modal 
          show={showEnlargeModal} 
          onHide={() => setShowEnlargeModal(false)}
          size="xl"
          centered
          className="image-zoom-modal"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">{wheelchair.NOM_TYPE} - Detailed View</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0 d-flex justify-content-center align-items-center bg-light">
            <img 
              src={images[activeImage]} 
              alt="Wheelchair enlarged view"
              className="img-fluid"
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          </Modal.Body>
          <Modal.Footer className="justify-content-between border-0 bg-light rounded-bottom-3">
            <div className="d-flex gap-2">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  className={`thumbnail-preview ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="img-fluid h-25 rounded-2"
                  />
                </div>
              ))}
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowEnlargeModal(false)} 
              className="rounded-pill px-4"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Toast notifications */}
        <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1090 }}>
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000} 
            autohide
            className="rounded-3 border-0 shadow"
            bg="dark"
          >
            <Toast.Header closeButton className="border-bottom-0 bg-dark text-white">
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </>
  );
};

export default WheelchairDetail;