import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

function initials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = iso.length === 10 ? `${iso}T12:00:00` : iso;
    return new Date(d).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ClinicianDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl('/clinician/dashboard'), { headers: authHeaders() });
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

      const reqRes = await fetch(apiUrl('/clinician/requests'), { headers: authHeaders() });
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
  const today = data?.consultations_today || [];
  const recent = data?.consultations_recent || [];
  const needing = data?.patients_needing_medical_file || [];

  const handleRequestAction = async (demandeId, action) => {
    try {
        const res = await fetch(apiUrl(`/clinician/requests/${demandeId}/status`), {
            method: 'PUT',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut: action })
        });
        if (res.ok) {
            setRequests(requests.map(r => r.ID_DEMANDE === demandeId ? { ...r, STATUT: action } : r));
        }
    } catch (e) {
        console.error(e);
    }
  };

  const pendingRequests = requests.filter(r => r.STATUT === 'EN_ATTENTE');

  return (
    <DashboardShell role="clinician">
      <Container fluid>
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
                    <div className="stat-value">{stats.registry_patients_total}</div>
                    <p className="stat-label mb-0">Patients in registry</p>
                    <small className="text-muted">{stats.patients_seen_distinct} with your consultations</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.consultations_this_month}</div>
                    <p className="stat-label mb-0">Consultations this month</p>
                    <small className="text-muted">{stats.consultations_total} all time</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.consultations_today}</div>
                    <p className="stat-label mb-0">Logged today</p>
                    <small className="text-muted">Same calendar day</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <div className="stat-value">{stats.pending_medical_assessments}</div>
                    <p className="stat-label mb-0">Patients missing medical file</p>
                    <small className="text-muted">Morphology / pathology / notes</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Card className="dashboard-card h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>Today&apos;s consultations</strong>
                    <Badge bg="primary">{today.length}</Badge>
                  </Card.Header>
                  <Card.Body>
                    {today.length === 0 ? (
                      <p className="text-muted mb-0">No consultations logged for today.</p>
                    ) : (
                      today.map((c) => (
                        <Card key={c.num_consultation} className="appointment-card mb-2">
                          <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div className="d-flex align-items-center">
                              <div className="patient-avatar me-3">{initials(c.patient_name)}</div>
                              <div>
                                <h6 className="mb-1">{c.patient_name}</h6>
                                <div className="small text-muted">{c.pathology_name}</div>
                                <div className="small">{formatDate(c.date_consultation)}</div>
                              </div>
                            </div>
                            <Button variant="outline-primary" size="sm" as={Link} to="/patients">
                              Patients
                            </Button>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-3">
                <Card className="dashboard-card h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>Recent consultations</strong>
                    <Badge bg="secondary">{recent.length}</Badge>
                  </Card.Header>
                  <Card.Body>
                    {recent.length === 0 ? (
                      <p className="text-muted mb-0">No consultations yet. Record one from the Patients workspace.</p>
                    ) : (
                      recent.map((c) => (
                        <Card key={`${c.num_consultation}-${c.date_consultation}`} className="appointment-card mb-2">
                          <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div className="d-flex align-items-center">
                              <div className="patient-avatar me-3">{initials(c.patient_name)}</div>
                              <div>
                                <h6 className="mb-1">{c.patient_name}</h6>
                                <span className="text-muted small">{c.pathology_name}</span>
                                <div className="small">{formatDate(c.date_consultation)}</div>
                              </div>
                            </div>
                            {c.is_today ? <Badge bg="success">Today</Badge> : null}
                          </Card.Body>
                        </Card>
                      ))
                    )}
                    <div className="text-center mt-3">
                      <Button variant="primary" as={Link} to="/patients">
                        Open patients
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Card className="dashboard-card">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>Pending Wheelchair Requests</strong>
                    <Badge bg="warning" text="dark">{pendingRequests.length}</Badge>
                  </Card.Header>
                  <Card.Body>
                    {pendingRequests.length === 0 ? (
                      <p className="text-muted mb-0">No pending wheelchair requests to review.</p>
                    ) : (
                      <Table responsive hover className="mb-0 align-middle">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Wheelchair</th>
                            <th>Date</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingRequests.map((r) => (
                            <tr key={r.ID_DEMANDE}>
                              <td>{r.patient_name}</td>
                              <td>{r.NOM_TYPE}</td>
                              <td className="text-muted small">{formatDate(r.DATE_DEMANDE)}</td>
                              <td className="text-end">
                                <Button 
                                  size="sm" 
                                  variant="success" 
                                  className="me-2"
                                  onClick={() => handleRequestAction(r.ID_DEMANDE, 'APPROUVE')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-danger"
                                  onClick={() => handleRequestAction(r.ID_DEMANDE, 'REJETE')}
                                >
                                  Reject
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

            <Row>
              <Col md={12}>
                <Card className="dashboard-card">
                  <Card.Header>
                    <strong>Patients needing a medical file</strong>
                  </Card.Header>
                  <Card.Body>
                    {needing.length === 0 ? (
                      <p className="text-muted mb-0">Every patient has at least some medical summary data, or the registry is empty.</p>
                    ) : (
                      <Table responsive hover size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Email</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {needing.map((p) => (
                            <tr key={p.id_utilisateur}>
                              <td>{p.name}</td>
                              <td className="text-muted small">{p.email || '—'}</td>
                              <td className="text-end">
                                <Button size="sm" variant="outline-primary" as={Link} to="/patients">
                                  Manage
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

export default ClinicianDashboard;
