import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

function money(n) {
  if (n == null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
  } catch {
    return `${n} €`;
  }
}

function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl('/vendor/dashboard'), { headers: authHeaders() });
      const raw = await res.text();
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error('Invalid server response');
      }
      if (!res.ok) {
        const msg =
          typeof json.detail === 'string'
            ? json.detail
            : Array.isArray(json.detail)
              ? json.detail.map((d) => d.msg).join(', ')
              : 'Could not load dashboard';
        throw new Error(msg);
      }
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;
  const recent = data?.recent_products || [];
  const vendorName = data?.vendor_name || '';

  return (
    <DashboardShell role="vendor">
      <Container fluid>
        {vendorName ? (
          <p className="text-muted mb-3">
            <strong>{vendorName}</strong> — catalog overview
          </p>
        ) : null}

        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" className="me-2" />
            Loading dashboard…
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="mb-4">
            {error}
            <div className="mt-2">
              <Button size="sm" variant="outline-danger" onClick={() => load()}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {!loading && !error && stats && (
          <>
            <Row className="stat-cards mb-4">
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.products_count}</div>
                    <p className="stat-label mb-0">Active products</p>
                    <small className="text-muted">Wheelchairs you list</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{money(stats.inventory_value)}</div>
                    <p className="stat-label mb-0">Inventory value</p>
                    <small className="text-muted">List price × stock</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.total_stock_units}</div>
                    <p className="stat-label mb-0">Total units in stock</p>
                    <small className="text-muted">
                      {stats.low_stock_count} at or below {stats.low_stock_threshold} units
                    </small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.average_list_price ? `${stats.average_list_price} €` : '—'}</div>
                    <p className="stat-label mb-0">Avg. list price</p>
                    <small className="text-muted">Orders &amp; revenue not tracked in this build</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Card className="h-100 dashboard-card">
                  <Card.Header>
                    <strong>Product catalog</strong>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted">
                      Manage wheelchair listings tied to your vendor account ({stats.products_count} items).
                    </p>
                    <Button variant="primary" as={Link} to="/products">
                      Open products
                    </Button>
                    <Button variant="outline-primary" className="ms-2" as={Link} to="/wheelchairs">
                      Public catalog
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-3">
                <Card className="h-100 dashboard-card">
                  <Card.Header>
                    <strong>Stock alerts</strong>
                  </Card.Header>
                  <Card.Body>
                    {stats.low_stock_count === 0 ? (
                      <p className="text-muted mb-0">No products at or below the low-stock threshold.</p>
                    ) : (
                      <p className="mb-0">
                        <Badge bg="warning" text="dark">
                          {stats.low_stock_count}
                        </Badge>{' '}
                        product(s) at ≤ {stats.low_stock_threshold} units. Review pricing and restock in Products.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Card className="dashboard-card">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>Recent listings</strong>
                    <Badge bg="secondary">{recent.length}</Badge>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {recent.length === 0 ? (
                      <p className="text-muted p-3 mb-0">No products yet. Add wheelchairs from the Products page.</p>
                    ) : (
                      <Table responsive hover className="mb-0">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Propulsion</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {recent.map((p) => (
                            <tr key={p.ID_FAUTEUIL}>
                              <td>{p.ID_FAUTEUIL}</td>
                              <td>{p.NOM_TYPE}</td>
                              <td>{p.PROPULTION_TEXT}</td>
                              <td>{p.PRIX != null ? `${p.PRIX} €` : '—'}</td>
                              <td>{p.QT_STOCK}</td>
                              <td className="text-end">
                                <Button size="sm" variant="outline-primary" as={Link} to={`/wheelchairs/${p.ID_FAUTEUIL}`}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </DashboardShell>
  );
}

export default VendorDashboard;
