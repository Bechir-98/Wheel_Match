import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog.jsx';
import { cn } from '@/lib/utils';

import standardWheelchair from '../assets/wheelchair-standard.jpg';
import customWheelchair from '../assets/wheelchair-custom.jpg';
import sportWheelchair from '../assets/wheelchair-sport.jpg';
import defaultWheelchair from '../assets/brand.png';
import Twheel from '../assets/Twheel.jpg';
import componentImage1 from '../assets/component1.jpg';
import componentImage2 from '../assets/component2.jpg';
import { apiUrl, authHeaders } from '../config/api.js';

const getWheelchairImage = (w) => {
  if (w?.IMAGE) return w.IMAGE;
  const imageMap = {
    'leger': standardWheelchair,
    'haut de gamme': customWheelchair,
    'actif': sportWheelchair,
    'traditionnel': Twheel,
  };
  return imageMap[w?.NOM_TYPE?.trim().toLowerCase()] || defaultWheelchair;
};

const WheelchairDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isPatient = localStorage.getItem('userType') === 'patient';
  const [requestState, setRequestState] = useState(null); // null | {STATUT} | 'sent'
  const [requestError, setRequestError] = useState('');
  const [wheelchair, setWheelchair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedWheelchairs, setRelatedWheelchairs] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/wheelchairs/${id}`));
        if (!res.ok) throw new Error(t('detail.notFoundError'));
        const data = await res.json();

        const relatedRes = await fetch(apiUrl(`/wheelchairs?type=${data.ID_TYPE}&exclude=${id}`));
        setRelatedWheelchairs(relatedRes.ok ? (await relatedRes.json()).slice(0, 4) : []);

        setWheelchair(data);

        // ponytail: existing demande lookup rides along the detail fetch, no extra spinner
        if (isPatient && localStorage.getItem('token')) {
          try {
            const rr = await fetch(apiUrl('/patient/requests'), { headers: authHeaders() });
            if (rr.ok) {
              const list = await rr.json();
              const hit = list.find(
                (d) => d.ID_FAUTEUIL === data.ID_FAUTEUIL && ['EN_ATTENTE', 'APPROUVE'].includes(d.STATUT)
              );
              if (hit) setRequestState(hit);
            }
          } catch {
            /* request button stays */
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isPatient, t]);

  const sendRequest = async () => {
    try {
      setRequestError('');
      const r = await fetch(apiUrl('/patient/requests'), {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ id_fauteuil: wheelchair.ID_FAUTEUIL }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
      setRequestState('sent');
    } catch (e) {
      setRequestError(e.message);
    }
  };

  if (loading) return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-5 lg:grid-cols-2">
      <Skeleton className="h-[400px] rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-3/5" />
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-24" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <Alert variant="destructive">
        <p className="font-semibold">{t('detail.errorTitle')}</p>
        <p>{error}</p>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>{t('detail.goBack')}</Button>
          <Button variant="destructive" onClick={() => navigate('/wheelchairs')}>{t('detail.browseWheelchairs')}</Button>
        </div>
      </Alert>
    </div>
  );

  if (!wheelchair) return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <Alert>
        <p className="font-semibold">{t('detail.notFoundTitle')}</p>
        <p>{t('detail.notFoundBody')}</p>
        <Button className="mt-2" onClick={() => navigate('/wheelchairs')}>{t('detail.browseAvailable')}</Button>
      </Alert>
    </div>
  );

  const images = [getWheelchairImage(wheelchair), componentImage1, componentImage2].filter(Boolean);
  const prev = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveImage((i) => (i + 1) % images.length);
  const inStock = wheelchair.QT_STOCK > 0;

  return (
    <div className="mx-auto max-w-5xl bg-background px-4 py-4">
      <Button variant="outline" onClick={() => navigate('/wheelchairs')} className="mb-4 rounded-full">
        <ArrowLeft className="h-4 w-4" /> {t('detail.backToWheelchairs')}
      </Button>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative cursor-zoom-in bg-muted" onClick={() => setShowEnlargeModal(true)}>
            <img
              src={images[activeImage]}
              alt={t('detail.altView', { name: wheelchair.NOM_TYPE, idx: activeImage + 1 })}
              className="max-h-[400px] w-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('detail.prevImage')}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-background shadow-sm"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('detail.nextImage')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-background shadow-sm"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="flex justify-center gap-2 border-t p-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={t('detail.thumbnail', { idx: idx + 1 })}
                onClick={() => setActiveImage(idx)}
                className={cn('overflow-hidden rounded-md border-2', activeImage === idx ? 'border-primary' : 'border-transparent')}
                style={{ width: 60, height: 60 }}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div>
              <h1 className="text-2xl font-bold">{wheelchair.NOM_TYPE}</h1>
              <p className="text-sm text-muted-foreground">{wheelchair.PROPULTION ? t('detail.electricPropulsion') : t('detail.manualPropulsion')}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{Number(wheelchair.PRIX).toFixed(2)} DT</span>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold text-white', inStock ? 'bg-green-600' : 'bg-red-600')}>
                {inStock ? t('detail.inStock', { count: wheelchair.QT_STOCK }) : t('detail.outOfStock')}
              </span>
            </div>

            {isPatient && (
              requestState ? (
                <Alert>
                  {requestState === 'sent' || requestState.STATUT === 'EN_ATTENTE'
                    ? t('detail.requestPending')
                    : requestState.STATUT === 'APPROUVE'
                      ? t('detail.requestApproved')
                      : t('detail.requestDecided')}
                </Alert>
              ) : (
                <>
                  <Button size="lg" onClick={sendRequest}>
                    {t('detail.requestApproval')}
                  </Button>
                  {requestError && <p className="text-sm text-destructive">{requestError}</p>}
                  {!inStock && (
                    <p className="text-sm text-muted-foreground">
                      {t('detail.outOfStockNote')}
                    </p>
                  )}
                </>
              )
            )}

            {(isPatient || !localStorage.getItem('token')) && wheelchair.ID_UTILISATUER && (
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    localStorage.getItem('token')
                      ? `/messages?to=${wheelchair.ID_UTILISATUER}`
                      : '/log'
                  )
                }
              >
                <MessageCircle className="h-4 w-4" /> {t('detail.contactVendor')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-6">
          <details open className="mb-2 rounded-lg border px-3 py-2">
            <summary className="cursor-pointer font-semibold">{t('detail.specs')}</summary>
            <ul className="divide-y pt-2">
              {[
                [t('detail.type'), wheelchair.NOM_TYPE],
                [t('detail.propulsion'), wheelchair.PROPULTION ? t('detail.electric') : t('detail.manual')],
                [t('detail.price'), `${Number(wheelchair.PRIX).toFixed(2)} DT`],
                [t('detail.stock'), inStock ? t('detail.stockUnits', { count: wheelchair.QT_STOCK }) : t('detail.outOfStock')],
              ].map(([label, value]) => (
                <li key={label} className="flex justify-between py-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </li>
              ))}
            </ul>
          </details>

          <details className="mb-2 rounded-lg border px-3 py-2">
            <summary className="cursor-pointer font-semibold">
              {t('detail.suitablePathologies')} {(wheelchair.pathologies?.length > 0) && `(${(wheelchair.pathologies || []).length})`}
            </summary>
            <div className="pt-2">
              {(wheelchair.pathologies?.length || 0) > 0 ? (
                <ul className="divide-y">
                  {wheelchair.pathologies.map((p) => (
                    <li key={p.ID_PATHOLOGIE} className="py-2">
                      <span className="font-semibold">{p.NOM_PAT}</span>
                      {p.DESCRIPTION && <p className="text-sm text-muted-foreground">{p.DESCRIPTION}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('detail.noPathology')}</p>
              )}
            </div>
          </details>

          <details className="mb-2 rounded-lg border px-3 py-2">
            <summary className="cursor-pointer font-semibold">
              {t('detail.optionsComponents')} {((wheelchair.options?.length || 0) + (wheelchair.components?.length || 0)) > 0 && `(${(wheelchair.options?.length || 0) + (wheelchair.components?.length || 0)})`}
            </summary>
            <div className="pt-2">
              {(wheelchair.options?.length || 0) > 0 && (
                <ul className="divide-y">
                  {wheelchair.options.map((o) => (
                    <li key={o.ID_OPTION} className="flex items-center justify-between py-2">
                      <span className="font-medium">{o.NOM_OPTION}</span>
                      {o.TAILLE_OPTION && <Badge variant="secondary">{o.TAILLE_OPTION}</Badge>}
                    </li>
                  ))}
                </ul>
              )}
              {(wheelchair.components?.length || 0) > 0 && (
                <ul className="divide-y">
                  {wheelchair.components.map((c) => (
                    <li key={c.ID_COMPOSANT} className="flex items-center justify-between py-2">
                      <span className="font-medium">{c.NOM_COMP}</span>
                      {c.TAILLE_COMP && <Badge variant="secondary">{t('detail.size', { size: c.TAILLE_COMP })}</Badge>}
                    </li>
                  ))}
                </ul>
              )}
              {(wheelchair.options?.length || 0) + (wheelchair.components?.length || 0) === 0 && (
                <p className="text-sm text-muted-foreground">{t('detail.noOptions')}</p>
              )}
            </div>
          </details>
        </CardContent>
      </Card>

      {relatedWheelchairs.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-bold">{t('detail.related')}</h3>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/wheelchairs')}>
              {t('detail.viewAll')}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedWheelchairs.slice(0, 4).map((item) => (
              <Card key={item.ID_FAUTEUIL} className="overflow-hidden">
                <img
                  src={getWheelchairImage(item)}
                  alt={item.NOM_TYPE}
                  className="h-[120px] w-full object-cover"
                />
                <CardContent className="flex flex-col gap-2 p-4">
                  <h6 className="font-semibold">{item.NOM_TYPE}</h6>
                  <p className="font-bold text-primary">{Number(item.PRIX).toFixed(2)} DT</p>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(`/wheelchairs/${item.ID_FAUTEUIL}`)}>
                    {t('detail.viewDetails')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Dialog open={showEnlargeModal} onOpenChange={setShowEnlargeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('detail.enlargeTitle', { name: wheelchair.NOM_TYPE })}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-muted">
            <img src={images[activeImage]} alt={t('detail.enlargeAlt')} className="max-h-[70vh] object-contain" />
          </div>
          <div className="flex justify-center gap-2 p-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={t('detail.thumbnail', { idx: idx + 1 })}
                onClick={() => setActiveImage(idx)}
                className={cn('overflow-hidden rounded-md border-2', activeImage === idx ? 'border-primary' : 'border-transparent')}
                style={{ width: 48, height: 48 }}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {!inStock && (
        <Alert className="mt-4">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            {t('detail.outOfStockBanner')}
          </span>
        </Alert>
      )}
    </div>
  );
};

export default WheelchairDetail;
