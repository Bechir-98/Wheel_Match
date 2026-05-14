import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function initials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl('/patient/dashboard'), { headers: authHeaders() });
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

      const reqRes = await fetch(apiUrl('/patient/requests'), { headers: authHeaders() });
      if (reqRes.ok) {
        setRequests(await reqRes.json());
      }
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
  const consultations = data?.consultations || [];
  const medical = data?.medical;
  const upcomingList = consultations.filter((c) => c.is_upcoming).slice(0, 5);
  const recentList = consultations.slice(0, 5);

  const checklist = [
    { label: 'Medical summary on file', done: !!stats?.medical_record_filled },
    { label: 'At least one consultation', done: (stats?.consultations_total || 0) > 0 },
    { label: 'Wheelchairs linked to your case file', done: (stats?.matched_wheelchairs || 0) > 0 },
  ];

  return (
    <DashboardShell role="patient">
      <Container fluid>
        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Loading your dashboard…</span>
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
                    <div className="stat-value">{stats.consultations_upcoming}</div>
                    <p className="stat-label mb-0">Upcoming consultations</p>
                    <small className="text-muted">{stats.consultations_total} total on file</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.consultations_total}</div>
                    <p className="stat-label mb-0">Consultation visits</p>
                    <small className="text-muted">Logged by your care team</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.messages_unread}</div>
                    <p className="stat-label mb-0">New messages</p>
                    <Button variant="link" className="p-0 align-self-start" size="sm" as={Link} to="/messages">
                      Open messages
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.profile_completion_pct}%</div>
                    <p className="stat-label mb-0">Case readiness</p>
                    <small className="text-muted">Medical file, visits & matches</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Card className="dashboard-card w-100 h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>Consultations</strong>
                    <Badge bg="secondary">{consultations.length}</Badge>
                  </Card.Header>
                  <Card.Body>
                    {upcomingList.length === 0 && recentList.length === 0 && (
                      <p className="text-muted mb-0">
                        No consultations yet. When your clinician logs a visit, it will appear here.
                      </p>
                    )}
                    {(upcomingList.length ? upcomingList : recentList).map((c) => (
                      <Card key={c.num_consultation} className="appointment-card mb-2">
                        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <div className="d-flex align-items-center">
                            <div className="patient-avatar me-3">{initials(c.clinician_name)}</div>
                            <div>
                              <h6 className="mb-1">{c.pathology_name}</h6>
                              <div className="small text-muted">
                                {c.clinician_name} · {formatDate(c.date_consultation)}
                              </div>
                              <div className="small">Morphology: {c.morphology}</div>
                            </div>
                          </div>
                          {c.is_upcoming ? <Badge bg="primary">Upcoming</Badge> : <Badge bg="light" text="dark">Past</Badge>}
                        </Card.Body>
                      </Card>
                    ))}
                    <div className="text-center mt-3 d-flex flex-wrap gap-2 justify-content-center">
                      <Button variant="primary" as={Link} to="/record">
                        Full medical record
                      </Button>
                      <Button variant="outline-primary" as={Link} to="/wheelchairs">
                        Browse wheelchairs ({stats.catalog_wheelchairs})
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-3">
                <Card className="dashboard-card mb-3">
                  <Card.Header>
                    <strong>Messages</strong>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted mb-2">In-app messaging is not enabled for your account yet.</p>
                    <Button variant="primary" size="sm" as={Link} to="/messages">
                      Go to messages
                    </Button>
                  </Card.Body>
                </Card>

                <Card className="dashboard-card">
                  <Card.Header>
                    <strong>Medical summary</strong>
                  </Card.Header>
                  <Card.Body>
                    {medical ? (
                      <>
                        <p className="text-muted small mb-2">
                          Last updated: {medical.UPDATED_AT ? formatDate(medical.UPDATED_AT.slice(0, 10)) : '—'}
                        </p>
                        <ul className="records-list mb-0">
                          <li className="record-item d-flex align-items-start mb-2">
                            <span className="check-icon me-2">{medical.MORPHOLOGIE ? '✓' : '○'}</span>
                            <span>Morphology: {medical.MORPHOLOGIE || '—'}</span>
                          </li>
                          <li className="record-item d-flex align-items-start mb-2">
                            <span className="check-icon me-2">{medical.PATHOLOGIE ? '✓' : '○'}</span>
                            <span>Pathology context: {medical.PATHOLOGIE || '—'}</span>
                          </li>
                          <li className="record-item d-flex align-items-start mb-2">
                            <span className="check-icon me-2">{medical.NOTES ? '✓' : '○'}</span>
                            <span>Clinical notes recorded</span>
                          </li>
                        </ul>
                      </>
                    ) : (
                      <p className="text-muted mb-0">Your clinician has not filed a medical summary yet.</p>
                    )}
                    <div className="text-center mt-3">
                      <Button variant="outline-primary" as={Link} to="/record">
                        View details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="dashboard-card mt-3">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>My Wheelchair Requests</strong>
                    <Badge bg="info">{requests.length}</Badge>
                  </Card.Header>
                  <Card.Body>
                    {requests.length === 0 ? (
                      <p className="text-muted mb-0">No wheelchair requests yet.</p>
                    ) : (
                      requests.map((r) => (
                        <Card key={r.ID_DEMANDE} className="mb-2 shadow-sm">
                          <Card.Body className="p-3 d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{r.NOM_TYPE}</strong>
                              <div className="small text-muted">{formatDate(r.DATE_DEMANDE)}</div>
                              {r.NOTES_CLINICIEN && <div className="small text-warning mt-1">Note: {r.NOTES_CLINICIEN}</div>}
                            </div>
                            <Badge 
                              bg={r.STATUT === 'APPROUVE' ? 'success' : r.STATUT === 'REJETE' ? 'danger' : 'warning'}
                            >
                              {r.STATUT}
                            </Badge>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                    <div className="text-center mt-3">
                      <Button variant="outline-primary" as={Link} to="/wheelchairs" size="sm">
                        Browse wheelchairs
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={12} className="mb-3">
                <Card className="dashboard-card w-100">
                  <Card.Header>
                    <strong>Case checklist & tips</strong>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3 mb-4">
                      {checklist.map((item) => (
                        <Col md={4} key={item.label}>
                          <div className="d-flex align-items-center p-3 rounded border bg-light">
                            <span className="check-icon me-2 fs-5">{item.done ? '✓' : '○'}</span>
                            <span>{item.label}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <p className="text-muted small mb-2">
                      <strong>Tip:</strong> Wheelchairs linked to pathologies discussed in your consultations:{' '}
                      <strong>{stats.matched_wheelchairs}</strong> models may be especially relevant (
                      <Link to="/wheelchairs">explore catalog</Link>).
                    </p>
                    <p className="text-muted small mb-0">
                      Stay hydrated and keep moving within your care plan. Inspect tires, brakes, and upholstery on
                      your device regularly.
                    </p>
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

export default PatientDashboard;
