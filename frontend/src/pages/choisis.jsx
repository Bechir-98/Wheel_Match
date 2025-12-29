import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog.jsx';
import { CheckCircle2, XCircle, Hourglass, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

function ChoisisInner() {
  const { t } = useTranslation();
  const STATUS_META = {
    APPROUVE: { label: t('choisis.statusApproved'), variant: 'default', icon: CheckCircle2 },
    EN_ATTENTE: { label: t('choisis.statusPending'), variant: 'secondary', icon: Hourglass },
    REJETE: { label: t('choisis.statusRejected'), variant: 'destructive', icon: XCircle },
  };
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch(apiUrl('/patient/requests'), { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRequests(await r.json());
    } catch (e) {
      setError(t('choisis.loadError', { msg: e.message }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async (req) => {
    try {
      const r = await fetch(apiUrl(`/patient/requests/${req.ID_DEMANDE}/accept`), {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRequests((list) => list.map((x) => (x.ID_DEMANDE === req.ID_DEMANDE ? { ...x, PATIENT_ACCEPT: true } : x)));
    } catch (e) {
      setError(t('choisis.acceptFailed', { msg: e.message }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" role="status" aria-label={t('choisis.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4">
        <Alert variant="destructive" className="mt-3">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={load}>
              {t('choisis.retry')}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <h2 className="mb-4">{t('choisis.title')}</h2>
      <RecommendationPanel />

      {requests.length === 0 ? (
        <Alert>
          <p className="mb-2">{t('choisis.empty')}</p>
          <Button size="sm" asChild>
            <Link to="/wheelchairs">{t('choisis.browse')}</Link>
          </Button>
        </Alert>
      ) : (
        <>
          <Alert className="mb-4">{t('choisis.hint')}</Alert>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => {
              const meta = STATUS_META[req.STATUT] || STATUS_META.EN_ATTENTE;
              const Icon = meta.icon;
              return (
                <Card key={req.ID_DEMANDE} className="h-full shadow-sm">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h5 className="mb-0">{req.NOM_TYPE}</h5>
                      <Badge variant={meta.variant} className="inline-flex items-center gap-1">
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="mb-3 text-sm text-muted-foreground">
                      <p className="mb-1">{t('choisis.requested', { date: req.DATE_DEMANDE ? new Date(req.DATE_DEMANDE).toLocaleDateString() : '—' })}</p>
                      {req.ORIGIN === 'clinician' && <p className="mb-1">{t('choisis.recommended')}</p>}
                      {req.ORIGIN === 'slm' && (
                        <p className="mb-1">{t('choisis.slmRecommended', 'Recommended by AI')}</p>
                      )}
                      {req.NOTES_CLINICIEN && <p className="mb-1">{t('choisis.clinicianNote', { note: req.NOTES_CLINICIEN })}</p>}
                      {req.PATIENT_ACCEPT && <p className="mb-1">{t('choisis.acceptedFinal')}</p>}
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/wheelchairs/${req.ID_FAUTEUIL}`}>{t('choisis.view')}</Link>
                      </Button>
                      {(req.ORIGIN === 'clinician' || req.ORIGIN === 'slm') && req.STATUT === 'APPROUVE' && !req.PATIENT_ACCEPT ? (
                        <Button className="flex-1" onClick={() => accept(req)}>
                          {t('choisis.accept')}
                        </Button>
                      ) : (
                        <Button
                          className="flex-1"
                          disabled={req.STATUT !== 'APPROUVE'}
                          onClick={() => {
                            setSelected(req);
                            setShowConfirmModal(true);
                          }}
                        >
                          {t('choisis.select')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('choisis.confirmTitle')}</DialogTitle>
          </DialogHeader>
          <p>{t('choisis.confirmBody', { name: selected?.NOM_TYPE })}</p>
          <p className="text-muted-foreground">{t('choisis.confirmNote')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              {t('choisis.cancel')}
            </Button>
            <Button onClick={() => navigate(`/wheelchairs/${selected?.ID_FAUTEUIL}`)}>
              {t('choisis.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ChoisisPage = () => {
  const { user } = useAuth();
  const role = user?.userType;
  if (role === 'patient') return <DashboardShell role="patient"><ChoisisInner /></DashboardShell>;
  return <ChoisisInner />;
};

export default ChoisisPage;
