import { useState, useEffect, useMemo } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Badge, 
  Alert,
  Placeholder,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  Offcanvas
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

// Import default images
import standardWheelchair from '../assets/wheelchair-standard.jpg';
import customWheelchair from '../assets/wheelchair-custom.jpg';
import sportWheelchair from '../assets/wheelchair-sport.jpg';
import defaultWheelchair from '../assets/brand.png';
import Twheel from '../assets/Twheel.jpg';
import { apiUrl } from '../config/api.js';

// Skeleton Loader Component
const WheelchairSkeleton = () => (
  <Col xs={12} sm={6} lg={4} className="mb-4">
    <Card className="h-100 shadow border-0 rounded-3">
      <div className="bg-light rounded-top" style={{ height: '200px' }} />
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder xs={7} /> <Placeholder xs={4} />
        </Placeholder>
        <Placeholder.Button variant="primary" xs={12} className="mb-2" />
        <Placeholder.Button variant="outline-primary" xs={12} />
      </Card.Body>
    </Card>
  </Col>
);

const WheelchairsPage = () => {
  const [filters, setFilters] = useState({
    type: "",
    inStockOnly: true,
    search: "",
    propulsion: "",
    showNewOnly: false,
    priceRange: [0, 5000],
    morphology: "",
    pathology: "",
    component: "",
    option: ""
  });

  const [wheelchairs, setWheelchairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Add these new state variables after the existing ones
  const [morphologies, setMorphologies] = useState([]);
  const [pathologies, setPathologies] = useState([]);
  const [components, setComponents] = useState([]);
  const [options, setOptions] = useState([]);

  // Enhanced image handling with multiple fallbacks
  const getWheelchairImage = (typeName) => {
    if (!typeName) return defaultWheelchair;
    
    // Normalize the type name for comparison
    const normalizedType = typeName.trim().toLowerCase();
    
    // Define image mappings (all lowercase for case-insensitive matching)
    const imageMap = {
      'leger': standardWheelchair,
      'haut de gamme': customWheelchair,
      'actif': sportWheelchair,
      'traditionnel':Twheel,
      // Add more mappings as needed
      'pediatric': defaultWheelchair,
      'luxe': defaultWheelchair
    };
    
    // Return matching image or default
    return imageMap[normalizedType] || defaultWheelchair;
  };

  // Fetch wheelchair data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/wheelchairs'));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Enhance data with additional fields
        const enhancedData = data.map(w => ({
          ...w,
          isNew: w.ID_FAUTEUIL > 103,
          imageUrl: getWheelchairImage(w.NOM_TYPE),
          hasOptions: w.options && w.options.length > 0
        }));
        
        setWheelchairs(enhancedData);
      } catch (error) {
        let errorMessage = "Failed to load wheelchairs";
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Network error - please check your connection";
        } else if (error.response?.status === 404) {
          errorMessage = "Data not found";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add this useEffect to fetch additional filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [morphRes, pathRes, compRes, optRes] = await Promise.all([
          fetch(apiUrl('/reference/morphologies')),
          fetch(apiUrl('/reference/pathologies')),
          fetch(apiUrl('/reference/components')),
          fetch(apiUrl('/reference/options')),
        ]);

        const [morphData, pathData, compData, optData] = await Promise.all([
          morphRes.json(),
          pathRes.json(),
          compRes.json(),
          optRes.json()
        ]);

        setMorphologies(morphData);
        setPathologies(pathData);
        setComponents(compData);
        setOptions(optData);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilterData();
  }, []);

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      inStockOnly: true,
      search: "",
      propulsion: "",
      showNewOnly: false,
      priceRange: [0, 5000],
      morphology: "",
      pathology: "",
      component: "",
      option: ""
    });
  };

  // Memoized filtered results
  const filteredWheelchairs = useMemo(() => {
    return wheelchairs.filter(w => {
      return (
        (!filters.type || w.NOM_TYPE === filters.type) &&
        (!filters.inStockOnly || w.QT_STOCK > 0) &&
        (!filters.search || w.NOM_TYPE.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.propulsion || w.PROPULTION.toString() === filters.propulsion) &&
        (!filters.showNewOnly || w.isNew) &&
        (!filters.morphology || w.morphologies?.includes(filters.morphology)) &&
        (!filters.pathology || w.pathologies?.includes(filters.pathology)) &&
        (!filters.component || w.components?.includes(filters.component)) &&
        (!filters.option || w.options?.includes(filters.option))
      );
    });
  }, [wheelchairs, filters]);

  const uniqueTypes = [...new Set(wheelchairs.map(w => w.NOM_TYPE))];

  // Loading state
  if (loading) return (
    <Container fluid className="py-5 bg-light">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Wheelchair Catalog</h1>
        <p className="lead">Loading our premium selection of mobility solutions...</p>
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <Row>
        <Col md={3} className="mb-4 d-none d-md-block">
          <div className="p-4 bg-white rounded-3 shadow">
            <Placeholder as="h4" animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Form} animation="glow">
              {[...Array(4)].map((_, i) => (
                <Placeholder key={i} as={Form.Group} className="mb-3">
                  <Placeholder as={Form.Label} xs={4} />
                  <Placeholder as={Form.Control} xs={12} />
                </Placeholder>
              ))}
            </Placeholder>
          </div>
        </Col>
        <Col md={9}>
          <Row className="g-4">
            {[...Array(6)].map((_, i) => <WheelchairSkeleton key={i} />)}
          </Row>
        </Col>
      </Row>
    </Container>
  );

  // Error state
  if (error) return (
    <Container className="py-5">
      <Alert variant="danger" className="shadow-sm rounded-3 border-0">
        <Alert.Heading>Error loading data</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant="secondary" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      </Alert>
    </Container>
  );

  return (
    <Container fluid className="py-5 bg-light">
      {/* Header Section */}
      <Container className="mb-5 text-center">
        <h1 className="display-4 fw-bold text-primary mb-3">Wheelchair Catalog</h1>
        <p className="lead mb-4">Browse our selection of high-quality mobility solutions</p>
        
        {/* Mobile Filter Toggle */}
        <Button 
          variant="primary" 
          className="d-md-none mb-4 shadow"
          onClick={() => setShowFilters(true)}
        >
          <i className="bi bi-funnel me-2"></i> Show Filters
        </Button>
        
        {/* Summary Stats */}
        <div className="d-flex justify-content-center gap-4 flex-wrap">
          <Badge bg="light" text="dark" className="px-3 py-2 fs-6 shadow-sm">
            <i className="bi bi-wheelchair me-2"></i>
            {wheelchairs.length} Total Products
          </Badge>
          <Badge bg="light" text="dark" className="px-3 py-2 fs-6 shadow-sm">
            <i className="bi bi-box-seam me-2"></i>
            {wheelchairs.filter(w => w.QT_STOCK > 0).length} In Stock
          </Badge>
        </div>
      </Container>

      <Row>
        {/* Filter Sidebar - Desktop */}
        <Col md={3} className="mb-4 d-none d-md-block">
          <div className="p-4 bg-white rounded-3 shadow sticky-top" style={{top: '20px'}}>
            <h4 className="mb-4 text-primary border-bottom pb-2">
              <i className="bi bi-funnel me-2"></i>
              Filters
            </h4>
            <Form>
              <Form.Group className="mb-4">
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name"
                    className="border-start-0"
                    aria-label="Search wheelchairs by name"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Wheelchair Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="shadow-sm"
                  aria-label="Filter by wheelchair type"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Morphology</Form.Label>
                <Form.Select
                  name="morphology"
                  value={filters.morphology}
                  onChange={handleFilterChange}
                  className="shadow-sm"
                  aria-label="Filter by morphology"
                >
                  <option value="">All Morphologies</option>
                  {morphologies.map(morph => (
                    <option key={morph.ID_MORPH} value={morph.ID_MORPH}>
                      {morph.NOM_MORPH}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Pathology</Form.Label>
                <Form.Select
                  name="pathology"
                  value={filters.pathology}
                  onChange={handleFilterChange}
                  className="shadow-sm"
                  aria-label="Filter by pathology"
                >
                  <option value="">All Pathologies</option>
                  {pathologies.map(path => (
                    <option key={path.ID_PATHOLOGIE} value={path.ID_PATHOLOGIE}>
                      {path.NOM_PAT}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Component</Form.Label>
                <Form.Select
                  name="component"
                  value={filters.component}
                  onChange={handleFilterChange}
                  className="shadow-sm"
                  aria-label="Filter by component"
                >
                  <option value="">All Components</option>
                  {components.map(comp => (
                    <option key={comp.ID_COMPOSANT} value={comp.ID_COMPOSANT}>
                      {comp.NOM_COMP}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Options</Form.Label>
                <Form.Select
                  name="option"
                  value={filters.option}
                  onChange={handleFilterChange}
                  className="shadow-sm"
                  aria-label="Filter by options"
                >
                  <option value="">All Options</option>
                  {options.map(opt => (
                    <option key={opt.ID_OPTION} value={opt.ID_OPTION}>
                      {opt.NOM_OPTION}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="fw-semibold">Price Range</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                    }))}
                    className="shadow-sm"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <Form.Control
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="shadow-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="mb-4 d-flex flex-column gap-2">
                <Form.Check
                  type="switch"
                  id="inStockOnly"
                  label="In Stock Only"
                  name="inStockOnly"
                  checked={filters.inStockOnly}
                  onChange={handleFilterChange}
                  className="fw-semibold"
                />

                <Form.Check
                  type="switch"
                  id="showNewOnly"
                  label="New Arrivals Only"
                  name="showNewOnly"
                  checked={filters.showNewOnly}
                  onChange={handleFilterChange}
                  className="fw-semibold"
                />

                <Form.Check
                  type="switch"
                  id="propulsion"
                  label="With Propulsion"
                  name="propulsion"
                  checked={filters.propulsion === "true"}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    propulsion: e.target.checked ? "true" : ""
                  }))}
                  className="fw-semibold"
                />
              </div>

              <Button
                variant="outline-primary"
                onClick={resetFilters}
                className="w-100 shadow-sm"
                aria-label="Reset all filters"
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Reset All Filters
              </Button>
            </Form>
          </div>
        </Col>

        {/* Mobile Filters Offcanvas */}
        <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start" className="w-75">
          <Offcanvas.Header closeButton className="bg-primary text-white">
            <Offcanvas.Title>Filter Options</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name"
                    aria-label="Search wheelchairs by name"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Wheelchair Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  aria-label="Filter by wheelchair type"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="mb-4">
                <Form.Check
                  type="switch"
                  id="mobileInStockOnly"
                  label="In Stock Only"
                  name="inStockOnly"
                  checked={filters.inStockOnly}
                  onChange={handleFilterChange}
                  className="mb-2 fw-semibold"
                />

                <Form.Check
                  type="switch"
                  id="mobileShowNewOnly"
                  label="New Arrivals Only"
                  name="showNewOnly"
                  checked={filters.showNewOnly}
                  onChange={handleFilterChange}
                  className="fw-semibold"
                />
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={resetFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            </Form>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Wheelchair Listings */}
        <Col md={9}>
          {/* Results Summary */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-3 shadow-sm">
            <span className="fw-semibold">
              {filteredWheelchairs.length} {filteredWheelchairs.length === 1 ? 'product' : 'products'} found
            </span>
            <div className="d-flex gap-1 align-items-center">
              <span className="text-muted d-none d-sm-block">Sort by:</span>
              <Form.Select size="sm" className="w-auto">
                <option>Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </Form.Select>
            </div>
          </div>

          {/* Product Grid */}
          <Row className="g-4">
            {filteredWheelchairs.length > 0 ? (
              filteredWheelchairs.map(wheelchair => (
                <Col key={wheelchair.ID_FAUTEUIL} xs={12} sm={6} lg={4}>
                  <Card className="h-100 w-100 shadow border-0 rounded-3 overflow-hidden transition-hover">
                    {/* Wheelchair Image */}
                    <div 
                      className="position-relative" 
                      style={{ height: "220px", overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => navigate(`/wheelchairs/${wheelchair.ID_FAUTEUIL}`)}
                    >
                      <div className="hover-zoom h-100">
                        <img
                          src={wheelchair.imageUrl}
                          alt={`${wheelchair.NOM_TYPE} wheelchair`}
                          className="img-fluid h-100 w-100 object-fit-cover"
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = defaultWheelchair;
                          }}
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Status Badges */}
                      <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
                        {wheelchair.isNew && (
                          <Badge 
                            pill 
                            bg="danger" 
                            className="px-2 py-1"
                            aria-label="New arrival"
                          >
                            <i className="bi bi-stars me-1"></i> New
                          </Badge>
                        )}
                      </div>
                      
                      <div className="position-absolute top-0 end-0 p-2 d-flex flex-column gap-1">
                        {wheelchair.hasOptions && (
                          <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip>Customization options available</Tooltip>}
                          >
                            <Badge 
                              pill 
                              bg="success" 
                              className="px-2 py-1"
                              aria-label="Has options"
                            >
                              <i className="bi bi-gear me-1"></i> Options
                            </Badge>
                          </OverlayTrigger>
                        )}
                      </div>
                      
                      {wheelchair.QT_STOCK <= 3 && wheelchair.QT_STOCK > 0 && (
                        <Badge 
                          pill 
                          bg="warning" 
                          text="dark"
                          className="position-absolute bottom-0 end-0 m-2 px-2 py-1"
                          aria-label="Low stock"
                        >
                          <i className="bi bi-exclamation-triangle me-1"></i> Low Stock
                        </Badge>
                      )}
                    </div>

                    <Card.Body className="d-flex flex-column p-4">
                      <Card.Title 
                        className="h5 mb-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/wheelchairs/${wheelchair.ID_FAUTEUIL}`)}
                      >
                        {wheelchair.NOM_TYPE}
                      </Card.Title>
                      
                      <div className="mb-3">
                        <span className="badge bg-light text-dark me-2">Type: {wheelchair.NOM_TYPE}</span>
                      </div>
                      
                      <div className="mt-auto "   >
                        <div className="d-flex justify-content-between align-items-center mb-3  flex-column">
                          <span className="text-success fw-bold fs-4">
                            {Number(wheelchair.PRIX).toFixed(2)} DT  
                          </span>
                          <br />  
                          <span 
                          
                            className={`badge ${wheelchair.QT_STOCK > 0 ? "bg-success" : "bg-danger"}`}
                            aria-label={`Stock status: ${wheelchair.QT_STOCK > 0 ? `${wheelchair.QT_STOCK} in stock` : 'Out of stock'}`}
                          >
                            {wheelchair.QT_STOCK > 0 ? `${wheelchair.QT_STOCK} in stock` : "Out of stock"}
                          </span>
                        </div>
                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary"
                            size="lg"
                            className="shadow-sm"
                            onClick={() => navigate(`/wheelchairs/${wheelchair.ID_FAUTEUIL}`)}
                            disabled={wheelchair.QT_STOCK <= 0}
                            aria-label={`View details for ${wheelchair.NOM_TYPE}`}
                          >
                            <i className="bi bi-info-circle me-2"></i> View Details
                          </Button>
                          {wheelchair.QT_STOCK > 0 && (
                            <Button 
                              variant="outline-primary"
                              className="shadow-sm"
                              aria-label={`Add ${wheelchair.NOM_TYPE} to cart`}
                            >
                              <i className="bi bi-cart-plus me-2"></i> Add to Cart
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col className="text-center py-5">
                <div className="p-5 bg-white rounded-3 shadow-sm">
                  <i className="bi bi-search display-1 text-muted mb-3"></i>
                  <h3 className="text-muted mb-3">No matching wheelchairs found</h3>
                  <p className="text-muted mb-4">Try adjusting your filters to find what you're looking for</p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={resetFilters}
                    className="shadow"
                    aria-label="Reset all filters"
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i> Reset All Filters
                  </Button>
                </div>
              </Col>
            )}
          </Row>
          
          {/* Pagination */}
          {filteredWheelchairs.length > 0 && (
            <nav className="mt-5 d-flex justify-content-center">
              <ul className="pagination pagination-lg">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex="-1">Previous</a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>
          )}
        </Col>
      </Row>
    </Container>
  );
};

WheelchairsPage.propTypes = {
  // Add prop types if needed
};

export default WheelchairsPage;