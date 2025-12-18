import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  const { t } = useTranslation();
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
        throw new Error(t('patientDash.errInvalid'));
      }
      if (!res.ok) {
        const msg =
          typeof json.detail === 'string'
            ? json.detail
            : Array.isArray(json.detail)
              ? json.detail.map((d) => d.msg).join(', ')
              : t('patientDash.errLoad');
        throw new Error(msg);
      }
      setData(json);

      const reqRes = await fetch(apiUrl('/patient/requests'), { headers: authHeaders() });
      if (reqRes.ok) {
        setRequests(await reqRes.json());
      }
    } catch (e) {
      setError(e.message || t('patientDash.errFailed'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;
  const consultations = data?.consultations || [];
  const medical = data?.medical;
  const upcomingList = consultations.filter((c) => c.is_upcoming).slice(0, 5);
  const recentList = consultations.slice(0, 5);

  const checklist = [
    { label: t('patientDash.check1'), done: !!stats?.medical_record_filled },
    { label: t('patientDash.check2'), done: (stats?.consultations_total || 0) > 0 },
    { label: t('patientDash.check3'), done: (stats?.matched_wheelchairs || 0) > 0 },
  ];

  return (
    <DashboardShell role="patient">
      <div className="mx-auto max-w-6xl px-4">
        {loading && (
          <div className="flex justify-center items-center py-5">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>{t('patientDash.loading')}</span>
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive" className="mb-4">
            {error}
            <div className="mt-2">
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => load()}>
                {t('patientDash.retry')}
              </Button>
            </div>
          </Alert>
        )}

        {!loading && !error && stats && (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{stats.consultations_upcoming}</div>
                    <p className="font-medium mb-0">{t('patientDash.statUpcoming')}</p>
                    <small className="text-muted-foreground">{t('patientDash.statUpcomingTotal', { count: stats.consultations_total })}</small>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{stats.consultations_total}</div>
                    <p className="font-medium mb-0">{t('patientDash.statVisits')}</p>
                    <small className="text-muted-foreground">{t('patientDash.statVisitsSub')}</small>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{stats.messages_unread}</div>
                    <p className="font-medium mb-0">{t('patientDash.statMessages')}</p>
                    <Button variant="link" className="p-0 self-start" size="sm" asChild>
                      <Link to="/messages">{t('patientDash.openMessages')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{stats.profile_completion_pct}%</div>
                    <p className="font-medium mb-0">{t('patientDash.statReadiness')}</p>
                    <small className="text-muted-foreground">{t('patientDash.statReadinessSub')}</small>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <Card className="w-full h-full">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-base">{t('patientDash.consultTitle')}</CardTitle>
                    <Badge variant="secondary">{consultations.length}</Badge>
                  </CardHeader>
                  <CardContent>
                    {upcomingList.length === 0 && recentList.length === 0 && (
                      <p className="text-muted-foreground mb-0">
                        {t('patientDash.consultEmpty')}
                      </p>
                    )}
                    {(upcomingList.length ? upcomingList : recentList).map((c) => (
                      <Card key={c.num_consultation} className="mb-2">
                        <CardContent className="flex flex-wrap justify-between items-center gap-2 pt-6">
                          <div className="flex items-center">
                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">{initials(c.clinician_name)}</div>
                            <div>
                              <h6 className="mb-1 font-semibold">{c.pathology_name}</h6>
                              <div className="small text-muted-foreground text-sm">
                                {c.clinician_name} · {formatDate(c.date_consultation)}
                              </div>
                              <div className="small text-sm">{t('patientDash.morphology', { v: c.morphology })}</div>
                            </div>
                          </div>
                          {c.is_upcoming ? <Badge>{t('patientDash.badgeUpcoming')}</Badge> : <Badge variant="outline">{t('patientDash.badgePast')}</Badge>}
                        </CardContent>
                      </Card>
                    ))}
                    <div className="text-center mt-3 flex flex-wrap gap-2 justify-center">
                      <Button asChild>
                        <Link to="/record">{t('patientDash.fullRecord')}</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/wheelchairs">{t('patientDash.browseCatalog', { count: stats.catalog_wheelchairs })}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="mb-3">
                  <CardHeader>
                    <CardTitle className="text-base">{t('patientDash.msgTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{t('patientDash.msgDisabled')}</p>
                    <Button size="sm" asChild>
                      <Link to="/messages">{t('patientDash.goMessages')}</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('patientDash.medTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {medical ? (
                      <>
                        <p className="text-muted-foreground text-sm mb-2">
                          {t('patientDash.lastUpdated', { date: medical.UPDATED_AT ? formatDate(medical.UPDATED_AT.slice(0, 10)) : '—' })}
                        </p>
                        <ul className="mb-0 space-y-2">
                          <li className="flex items-start mb-2">
                            <span className="mr-2">{medical.MORPHOLOGIE ? '✓' : '○'}</span>
                            <span>{t('patientDash.medMorphology', { v: medical.MORPHOLOGIE || '—' })}</span>
                          </li>
                          <li className="flex items-start mb-2">
                            <span className="mr-2">{medical.PATHOLOGIE ? '✓' : '○'}</span>
                            <span>{t('patientDash.medPathology', { v: medical.PATHOLOGIE || '—' })}</span>
                          </li>
                          <li className="flex items-start mb-2">
                            <span className="mr-2">{medical.NOTES ? '✓' : '○'}</span>
                            <span>{t('patientDash.medNotes')}</span>
                          </li>
                        </ul>
                      </>
                    ) : (
                      <p className="text-muted-foreground mb-0">{t('patientDash.medEmpty')}</p>
                    )}
                    <div className="text-center mt-3">
                      <Button variant="outline" asChild>
                        <Link to="/record">{t('patientDash.viewDetails')}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-3">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-base">{t('patientDash.reqTitle')}</CardTitle>
                    <Badge variant="secondary">{requests.length}</Badge>
                  </CardHeader>
                  <CardContent>
                    {requests.length === 0 ? (
                      <p className="text-muted-foreground mb-0">{t('patientDash.reqEmpty')}</p>
                    ) : (
                      requests.map((r) => (
                        <Card key={r.ID_DEMANDE} className="mb-2 shadow-sm">
                          <CardContent className="p-3 flex justify-between items-center pt-3">
                            <div>
                              <strong>{r.NOM_TYPE}</strong>
                              <div className="small text-muted-foreground text-sm">{formatDate(r.DATE_DEMANDE)}</div>
                              {r.NOTES_CLINICIEN && <div className="small text-amber-600 mt-1 text-sm">{t('patientDash.reqNote', { v: r.NOTES_CLINICIEN })}</div>}
                            </div>
                            <Badge
                              variant={r.STATUT === 'APPROUVE' ? 'default' : r.STATUT === 'REJETE' ? 'destructive' : 'secondary'}
                            >
                              {r.STATUT}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))
                    )}
                    <div className="text-center mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/wheelchairs">{t('patientDash.browseShort')}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-base">{t('patientDash.checklistTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3 mb-4">
                      {checklist.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center p-3 rounded border bg-muted/50">
                            <span className="mr-2 text-lg">{item.done ? '✓' : '○'}</span>
                            <span>{item.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      <strong>{t('patientDash.tipPrefix')}</strong> {t('patientDash.tip', { count: stats.matched_wheelchairs })}{' '}
                      (
                      <Link to="/wheelchairs">{t('patientDash.exploreCatalog')}</Link>).
                    </p>
                    <p className="text-muted-foreground text-sm mb-0">
                      {t('patientDash.careTip')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

export default PatientDashboard;
