import React, { useEffect, useState, useCallback } from 'react';
import { Card, Spinner, Alert, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Calendar3, FileEarmarkMedical, PersonBadge } from 'react-bootstrap-icons';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { apiUrl, authHeaders } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = iso.length === 10 ? `${iso}T12:00:00` : iso;
    return new Date(d).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Record() {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl('/patient/dashboard'), { headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof json.detail === 'string'
            ? json.detail
            : Array.isArray(json.detail)
              ? json.detail.map((d) => d.msg).join(', ')
              : 'Unable to load medical record';
        throw new Error(msg);
      }
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.userType) return;
    if (user.userType === 'patient') {
      load();
    } else {
      setLoading(false);
      setError('This page is for patient accounts.');
    }
  }, [load, user?.userType, isAuthenticated]);

  if (!isAuthenticated || !user?.userType) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (user.userType !== 'patient') {
    return (
      <div className="p-4" style={{ maxWidth: 560, margin: '0 auto' }}>
        <Alert variant="info">
          Medical record view is only available to patients.{' '}
          <Link to="/">Return home</Link>
        </Alert>
      </div>
    );
  }

  const inner = (
    <div className="py-4 px-2" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="h3 mb-4 d-flex align-items-center gap-2">
        <FileEarmarkMedical className="text-primary" />
        Medical record
      </h1>

      {loading && (
        <div className="d-flex align-items-center gap-2 py-5">
          <Spinner animation="border" size="sm" />
          Loading…
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="outline-danger" onClick={() => load()}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="fw-semibold">Clinical summary</Card.Header>
            <Card.Body>
              {data.medical ? (
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0">
                    <strong>Morphology</strong>
                    <div className="text-muted">{data.medical.MORPHOLOGIE || '—'}</div>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0">
                    <strong>Pathology context</strong>
                    <div className="text-muted">{data.medical.PATHOLOGIE || '—'}</div>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0">
                    <strong>Notes</strong>
                    <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                      {data.medical.NOTES || '—'}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 small text-muted">
                    Last updated: {formatDate(data.medical.UPDATED_AT)}
                  </ListGroup.Item>
                </ListGroup>
              ) : (
                <p className="text-muted mb-0">No clinical summary has been filed yet.</p>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="fw-semibold d-flex justify-content-between align-items-center">
              <span>Consultation history</span>
              <Badge bg="secondary">{(data.consultations || []).length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {(data.consultations || []).length === 0 ? (
                <p className="text-muted p-3 mb-0">No consultations recorded.</p>
              ) : (
                <ListGroup variant="flush">
                  {data.consultations.map((c) => (
                    <ListGroup.Item key={c.num_consultation} className="py-3">
                      <div className="d-flex align-items-start gap-2">
                        <PersonBadge className="text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="fw-semibold">{c.pathology_name}</div>
                          <div className="small text-muted d-flex align-items-center gap-1 mt-1">
                            <Calendar3 />
                            {formatDate(c.date_consultation)}
                            {c.is_upcoming ? <Badge bg="primary ms-2">Upcoming</Badge> : null}
                          </div>
                          <div className="small mt-1">Clinician: {c.clinician_name}</div>
                          <div className="small text-muted">Morphology recorded: {c.morphology}</div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          <div className="mt-4 d-flex flex-wrap gap-2">
            <Button variant="outline-primary" as={Link} to="/patient-dashboard">
              Back to dashboard
            </Button>
            <Button variant="primary" as={Link} to="/wheelchairs">
              Browse wheelchairs
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return <DashboardShell role="patient">{inner}</DashboardShell>;
}
