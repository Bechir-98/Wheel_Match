import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiUrl, authHeaders } from '../config/api.js';

export default function MedicalRecordForm({ initial, onSaved }) {
  const { t } = useTranslation();
  const [morphOptions, setMorphOptions] = useState([]);
  const [pathOptions, setPathOptions] = useState([]);
  const [form, setForm] = useState({
    morphologie: initial?.MORPHOLOGIE || '',
    pathologie: initial?.PATHOLOGIE || '',
    notes: initial?.NOTES || '',
  });
  const [formSource, setFormSource] = useState('self');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/reference/morphologies'), { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setMorphOptions(Array.isArray(list) ? list : []))
      .catch(() => {});
    fetch(apiUrl('/reference/pathologies'), { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setPathOptions(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, []);

  // ponytail: form mirrors the saved snapshot; scan results overwrite it via prefill()
  useEffect(() => {
    if (initial) {
      setForm((f) =>
        f.morphologie || f.pathologie || f.notes
          ? f
          : {
              morphologie: initial.MORPHOLOGIE || '',
              pathologie: initial.PATHOLOGIE || '',
              notes: initial.NOTES || '',
            }
      );
    }
  }, [initial]);

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
      onSaved?.(json);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Label htmlFor="mrf-scan">{t('record.scanLabel')}</Label>
        <p className="text-sm text-muted-foreground">{t('record.scanHint')}</p>
        <input
          id="mrf-scan"
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
          <Label htmlFor="mrf-morph">{t('record.morphology')}</Label>
          <select
            id="mrf-morph"
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
          <Label htmlFor="mrf-path">{t('record.pathology')}</Label>
          <select
            id="mrf-path"
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
          <Label htmlFor="mrf-notes">{t('record.notes')}</Label>
          <Textarea
            id="mrf-notes"
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
    </div>
  );
}
