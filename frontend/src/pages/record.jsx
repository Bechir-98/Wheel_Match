import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Loader2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [morphOptions, setMorphOptions] = useState([]);
  const [pathOptions, setPathOptions] = useState([]);
  const [form, setForm] = useState({ morphologie: '', pathologie: '', notes: '' });
  const [formSource, setFormSource] = useState('self');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);

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
              : t('record.errLoad');
        throw new Error(msg);
      }
      setData(json);
    } catch (e) {
      setError(e.message || t('record.errFailed'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userType) return;
    if (user.userType === 'patient') {
      load();
      fetch(apiUrl('/reference/morphologies'), { headers: authHeaders() })
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => setMorphOptions(Array.isArray(list) ? list : []))
        .catch(() => {});
      fetch(apiUrl('/reference/pathologies'), { headers: authHeaders() })
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => setPathOptions(Array.isArray(list) ? list : []))
        .catch(() => {});
    } else {
      setLoading(false);
      setError(t('record.onlyPatients'));
    }
  }, [load, user?.userType, isAuthenticated, t]);

  // ponytail: form mirrors the saved snapshot; scan results overwrite it via prefill()
  useEffect(() => {
    if (data?.medical) {
      setForm((f) =>
        f.morphologie || f.pathologie || f.notes
          ? f
          : {
              morphologie: data.medical.MORPHOLOGIE || '',
              pathologie: data.medical.PATHOLOGIE || '',
              notes: data.medical.NOTES || '',
            }
      );
    }
  }, [data]);

  const prefill = useCallback((values) => {
    setForm((f) => ({ ...f, ...values }));
    setSaveMsg(null);
  }, []);

  const scanPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setScanning(true);
    setScanMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(apiUrl('/patient/medical/scan'), {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || `HTTP ${r.status}`);
      prefill({
        ...(json.morphology ? { morphologie: json.morphology } : {}),
        ...(json.pathology ? { pathologie: json.pathology } : {}),
      });
      setFormSource('pdf');
      setScanMsg({
        ok: !!(json.morphology && json.pathology),
        text: t('record.scanReview', {
          morph: json.morphology || '—',
          path: json.pathology || '—',
          conf: Math.round((json.confidence || 0) * 100),
        }),
      });
    } catch (err) {
      setScanMsg({ ok: false, text: err.message });
    } finally {
      setScanning(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const r = await fetch(apiUrl('/patient/medical'), {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...form, source: formSource }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || `HTTP ${r.status}`);
      setSaveMsg({ ok: true, text: t('record.saved') });
      load();
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user?.userType) {
    return (
      <div className="flex justify-center py-5">
        <Loader2 className="h-6 w-6 animate-spin" role="status" aria-label={t('record.loadingAria')} />
      </div>
    );
  }

  if (user.userType !== 'patient') {
    return (
      <div className="p-4" style={{ maxWidth: 560, margin: '0 auto' }}>
        <Alert>
          {t('record.onlyPatientsView')}{' '}
          <Link to="/">{t('record.returnHome')}</Link>
        </Alert>
      </div>
    );
  }

  const inner = (
    <div className="py-4 px-2" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText className="text-primary h-6 w-6" />
        {t('record.title')}
      </h1>

      {loading && (
        <div className="flex items-center gap-2 py-5">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('record.loading')}
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => load()}>
              {t('record.retry')}
            </Button>
          </div>
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          <Card className="mb-4 shadow-sm">
            <CardHeader className="font-semibold py-4"><CardTitle className="text-base">{t('record.summaryTitle')}</CardTitle></CardHeader>
            <CardContent>
              {data.medical ? (
                <ul className="divide-y">
                  <li className="px-0 py-3">
                    <strong>{t('record.morphology')}</strong>
                    <div className="text-muted-foreground">{data.medical.MORPHOLOGIE || '—'}</div>
                  </li>
                  <li className="px-0 py-3">
                    <strong>{t('record.pathology')}</strong>
                    <div className="text-muted-foreground">{data.medical.PATHOLOGIE || '—'}</div>
                  </li>
                  <li className="px-0 py-3">
                    <strong>{t('record.notes')}</strong>
                    <div className="text-muted-foreground" style={{ whiteSpace: 'pre-wrap' }}>
                      {data.medical.NOTES || '—'}
                    </div>
                  </li>
                  <li className="px-0 py-3 text-sm text-muted-foreground">
                    {t('record.lastUpdated', { date: formatDate(data.medical.UPDATED_AT) })}
                  </li>
                </ul>
              ) : (
                <p className="text-muted-foreground mb-0">{t('record.summaryEmpty')}</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4 shadow-sm">
            <CardHeader className="font-semibold py-4"><CardTitle className="text-base">{t('record.editTitle')}</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="rec-scan">{t('record.scanLabel')}</Label>
                <p className="text-sm text-muted-foreground">{t('record.scanHint')}</p>
                <input
                  id="rec-scan"
                  type="file"
                  accept="application/pdf,.pdf,image/jpeg,image/png,image/webp"
                  className="mt-2 text-sm"
                  disabled={scanning}
                  onChange={scanPdf}
                />
                {scanning && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />
                    {t('record.scanning')}
                  </p>
                )}
                {scanMsg && (
                  <Alert variant={scanMsg.ok ? 'default' : 'destructive'} className="mt-2">{scanMsg.text}</Alert>
                )}
              </div>
              <form onSubmit={save} className="flex flex-col gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-morph">{t('record.morphology')}</Label>
                  <select
                    id="rec-morph"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={form.morphologie}
                    onChange={(e) => setForm((f) => ({ ...f, morphologie: e.target.value }))}
                    required
                  >
                    <option value="">{t('record.selectMorphology')}</option>
                    {morphOptions.map((m) => (
                      <option key={m.NOM_ORG} value={m.NOM_ORG}>{m.NOM_ORG}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-path">{t('record.pathology')}</Label>
                  <select
                    id="rec-path"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={form.pathologie}
                    onChange={(e) => setForm((f) => ({ ...f, pathologie: e.target.value }))}
                    required
                  >
                    <option value="">{t('record.selectPathology')}</option>
                    {pathOptions.map((p) => (
                      <option key={p.ID_PATHOLOGIE} value={p.NOM_PAT}>{p.NOM_PAT}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-notes">{t('record.notes')}</Label>
                  <Textarea
                    id="rec-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                {saveMsg && (
                  <Alert variant={saveMsg.ok ? 'default' : 'destructive'}>{saveMsg.text}</Alert>
                )}
                <div>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('record.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="font-semibold flex flex-row justify-between items-center py-4">
              <CardTitle className="text-base">{t('record.historyTitle')}</CardTitle>
              <Badge variant="secondary">{(data.consultations || []).length}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {(data.consultations || []).length === 0 ? (
                <p className="text-muted-foreground p-3 mb-0">{t('record.historyEmpty')}</p>
              ) : (
                <ul className="divide-y">
                  {data.consultations.map((c) => (
                    <li key={c.num_consultation} className="py-3 px-6">
                      <div className="flex items-start gap-2">
                        <User className="text-primary shrink-0 mt-1 h-4 w-4" />
                        <div>
                          <div className="font-semibold">{c.pathology_name}</div>
                          <div className="small text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(c.date_consultation)}
                            {c.is_upcoming ? <Badge className="ml-2">{t('record.badgeUpcoming')}</Badge> : null}
                          </div>
                          <div className="small mt-1 text-sm">{t('record.clinician', { v: c.clinician_name })}</div>
                          <div className="small text-muted-foreground text-sm">{t('record.morphRecorded', { v: c.morphology })}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/patient-dashboard">{t('record.backDash')}</Link>
            </Button>
            <Button asChild>
              <Link to="/wheelchairs">{t('record.browse')}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return <DashboardShell role="patient">{inner}</DashboardShell>;
}
