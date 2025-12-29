import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert } from './ui/alert.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

export default function RecommendationPanel() {
  const { t } = useTranslation();
  const [recs, setRecs] = useState([]);
  const [slmUsed, setSlmUsed] = useState(false);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch(apiUrl('/patient/recommendations?limit=3'), { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRecs(data.recommendations || []);
      setSlmUsed(!!data.slm_used);
      setDisclaimer(data.disclaimer || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Alert className="mb-4">{t('choisis.loading')}</Alert>;
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        {t('choisis.loadError', { msg: error })}{' '}
        <Button size="sm" variant="outline" onClick={load}>
          {t('choisis.retry')}
        </Button>
      </Alert>
    );
  }
  if (!recs.length) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h4 className="mb-0">{t('choisis.recommendedTitle', 'Recommended for you')}</h4>
        <Badge variant={slmUsed ? 'default' : 'secondary'}>
          {slmUsed ? t('choisis.slmBadge', 'AI') : t('choisis.ruleBadge', 'Rule-based')}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recs.map((c) => (
          <Card key={c.ID_FAUTEUIL} className="h-full shadow-sm">
            <CardContent className="flex h-full flex-col p-6">
              <h5 className="mb-2">{c.NOM_TYPE}</h5>
              <div className="mb-3 text-sm text-muted-foreground">
                {(c.reasons || []).map((reason, i) => (
                  <p key={i} className="mb-1">
                    {reason}
                  </p>
                ))}
                {c.PRIX != null && <p className="mb-1">{c.PRIX} TND</p>}
              </div>
              <div className="mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/wheelchairs/${c.ID_FAUTEUIL}`}>{t('choisis.view')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {disclaimer && <p className="mt-2 text-sm text-muted-foreground">{disclaimer}</p>}
    </div>
  );
}
