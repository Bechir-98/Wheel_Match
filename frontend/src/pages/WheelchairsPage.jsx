import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Search, Filter, Accessibility, Package, Sparkles, Settings, TriangleAlert, Info, RotateCcw } from 'lucide-react';
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Alert } from "../components/ui/alert.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog.jsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select.jsx";
import { cn } from "@/lib/utils";

import standardWheelchair from '../assets/wheelchair-standard.jpg';
import customWheelchair from '../assets/wheelchair-custom.jpg';
import sportWheelchair from '../assets/wheelchair-sport.jpg';
import defaultWheelchair from '../assets/brand.png';
import Twheel from '../assets/Twheel.jpg';
import { apiUrl } from '../config/api.js';

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

const emptyFilters = {
  search: "",
  type: "",
  inStockOnly: true,
  propulsion: "",
  showNewOnly: false,
  minPrice: "",
  maxPrice: "",
  pathology: "",
  component: "",
  option: "",
};

const WheelchairsPage = () => {
  const { t } = useTranslation();
  const SORTS = {
    latest: t('catalog.sorts.latest'),
    priceAsc: t('catalog.sorts.priceAsc'),
    priceDesc: t('catalog.sorts.priceDesc'),
  };
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState("latest");
  const [wheelchairs, setWheelchairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pathologies, setPathologies] = useState([]);
  const [components, setComponents] = useState([]);
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl('/wheelchairs'));
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const list = await res.json();

        // ponytail: N+1 detail fan-out for pathology/component/option filters, server-side when catalog grows
        const enriched = await Promise.all(
          list.map(async (w) => {
            try {
              const r = await fetch(apiUrl(`/wheelchairs/${w.ID_FAUTEUIL}`));
              if (!r.ok) return w;
              const d = await r.json();
              return {
                ...w,
                pathologyIds: (d.pathologies || []).map((p) => p.ID_PATHOLOGIE),
                componentIds: (d.components || []).map((c) => c.ID_COMPOSANT),
                optionIds: (d.options || []).map((o) => o.ID_OPTION),
                hasOptions: (d.options || []).length > 0,
              };
            } catch {
              return w;
            }
          })
        );
        setWheelchairs(enriched.map((w) => ({
          ...w,
          isNew: w.ID_FAUTEUIL > 103,
          imageUrl: getWheelchairImage(w),
        })));

        try {
          const [pRes, cRes, oRes] = await Promise.all([
            fetch(apiUrl('/reference/pathologies')),
            fetch(apiUrl('/reference/components')),
            fetch(apiUrl('/reference/options')),
          ]);
          if (pRes.ok) setPathologies(await pRes.json());
          if (cRes.ok) setComponents(await cRes.json());
          if (oRes.ok) setOptions(await oRes.json());
        } catch {
          /* selects stay empty */
        }
      } catch (e) {
        setError(e.message.includes('Failed to fetch') ? t('catalog.networkError') : t('catalog.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const set = (patch) => setFilters((p) => ({ ...p, ...patch }));
  const reset = () => { setFilters(emptyFilters); setSort("latest"); };

  const filtered = useMemo(() => {
    const min = parseFloat(filters.minPrice);
    const max = parseFloat(filters.maxPrice);
    const list = wheelchairs.filter((w) =>
      (!filters.search || w.NOM_TYPE.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.type || w.NOM_TYPE === filters.type) &&
      (!filters.inStockOnly || w.QT_STOCK > 0) &&
      (!filters.propulsion || w.PROPULTION.toString() === filters.propulsion) &&
      (!filters.showNewOnly || w.isNew) &&
      (Number.isNaN(min) || Number(w.PRIX) >= min) &&
      (Number.isNaN(max) || Number(w.PRIX) <= max) &&
      (!filters.pathology || (w.pathologyIds || []).includes(Number(filters.pathology))) &&
      (!filters.component || (w.componentIds || []).includes(Number(filters.component))) &&
      (!filters.option || (w.optionIds || []).includes(Number(filters.option)))
    );
    if (sort === 'priceAsc') list.sort((a, b) => a.PRIX - b.PRIX);
    if (sort === 'priceDesc') list.sort((a, b) => b.PRIX - a.PRIX);
    return list;
  }, [wheelchairs, filters, sort]);

  const uniqueTypes = useMemo(() => [...new Set(wheelchairs.map((w) => w.NOM_TYPE))], [wheelchairs]);
  const activeCount = Object.values(filters).filter((v) => v !== "" && v !== false).length;

  const filterForm = (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{t('catalog.search')}</Label>
        <div className="flex">
          <span className="flex items-center rounded-l-md border border-r-0 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </span>
          <Input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder={t('catalog.searchPlaceholder')}
            className="rounded-l-none"
            aria-label={t('catalog.searchAria')}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>{t('catalog.type')}</Label>
        <Select value={filters.type || 'all'} onValueChange={(v) => set({ type: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder={t('catalog.allTypes')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('catalog.allTypes')}</SelectItem>
            {uniqueTypes.map((t2) => <SelectItem key={t2} value={t2}>{t2}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>{t('catalog.pathology')}</Label>
        <Select value={filters.pathology || 'all'} onValueChange={(v) => set({ pathology: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder={t('catalog.allPathologies')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('catalog.allPathologies')}</SelectItem>
            {pathologies.map((p) => <SelectItem key={p.ID_PATHOLOGIE} value={String(p.ID_PATHOLOGIE)}>{p.NOM_PAT}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>{t('catalog.component')}</Label>
        <Select value={filters.component || 'all'} onValueChange={(v) => set({ component: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder={t('catalog.allComponents')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('catalog.allComponents')}</SelectItem>
            {components.map((c) => <SelectItem key={c.ID_COMPOSANT} value={String(c.ID_COMPOSANT)}>{c.NOM_COMP}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>{t('catalog.option')}</Label>
        <Select value={filters.option || 'all'} onValueChange={(v) => set({ option: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder={t('catalog.allOptions')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('catalog.allOptions')}</SelectItem>
            {options.map((o) => <SelectItem key={o.ID_OPTION} value={String(o.ID_OPTION)}>{o.NOM_OPTION}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>{t('catalog.priceRange')}</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min="0" value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })} placeholder={t('catalog.min')} aria-label={t('catalog.min')} />
          <span className="text-muted-foreground">-</span>
          <Input type="number" min="0" value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} placeholder={t('catalog.max')} aria-label={t('catalog.max')} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>{t('catalog.propulsion')}</Label>
        <Select value={filters.propulsion || 'all'} onValueChange={(v) => set({ propulsion: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder={t('catalog.all')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('catalog.all')}</SelectItem>
            <SelectItem value="0">{t('catalog.manual')}</SelectItem>
            <SelectItem value="1">{t('catalog.electric')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => set({ inStockOnly: e.target.checked })} className="h-4 w-4 accent-primary" />
        {t('catalog.inStockOnly')}
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={filters.showNewOnly} onChange={(e) => set({ showNewOnly: e.target.checked })} className="h-4 w-4 accent-primary" />
        {t('catalog.newOnly')}
      </label>

      <Button variant="outline" onClick={reset} className="w-full">
        <RotateCcw className="h-4 w-4" /> {activeCount > 0 ? t('catalog.resetFiltersCount', { count: activeCount }) : t('catalog.resetFilters')}
      </Button>
    </div>
  );

  if (loading) return (
    <div className="mx-auto max-w-6xl bg-muted px-4 py-5">
      <div className="mb-5 text-center">
        <Skeleton className="mx-auto h-9 w-64" />
        <Skeleton className="mx-auto mt-2 h-5 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="hidden md:block">
          <div className="space-y-3 rounded-lg bg-card p-4 shadow">
            <Skeleton className="h-6 w-1/2" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-[200px] w-full rounded-none" />
                <CardContent className="space-y-2 p-4">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <Alert variant="destructive">
        <p className="font-semibold">{t('catalog.errorTitle')}</p>
        <p>{error}</p>
        <Button className="mt-2" onClick={() => window.location.reload()}>{t('catalog.retry')}</Button>
      </Alert>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl bg-muted px-4 py-5">
      <div className="mx-auto mb-5 max-w-2xl text-center">
        <h1 className="mb-2 text-3xl font-bold text-primary">{t('catalog.title')}</h1>
        <p className="mb-4 text-muted-foreground">{t('catalog.subtitle')}</p>
        <Button className="mb-4 md:hidden" onClick={() => setShowFilters(true)}>
          <Filter className="h-4 w-4" /> {activeCount > 0 ? t('catalog.showFiltersCount', { count: activeCount }) : t('catalog.showFilters')}
        </Button>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="px-3 py-2 shadow-sm">
            <Accessibility className="mr-2 h-4 w-4" /> {t('catalog.totalProducts', { count: wheelchairs.length })}
          </Badge>
          <Badge variant="secondary" className="px-3 py-2 shadow-sm">
            <Package className="mr-2 h-4 w-4" /> {t('catalog.inStockBadge', { count: wheelchairs.filter((w) => w.QT_STOCK > 0).length })}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="hidden md:block">
          <div className="sticky top-20 rounded-lg bg-card p-4 shadow">
            <h4 className="mb-4 border-b pb-2 text-primary">
              <Filter className="mr-2 inline h-4 w-4" /> {t('catalog.filters')}
            </h4>
            {filterForm}
          </div>
        </div>

        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <div className="mb-4 border-b pb-2 font-semibold text-primary">{t('catalog.filterOptions')}</div>
            {filterForm}
            <Button className="mt-4 w-full" onClick={() => setShowFilters(false)}>{t('catalog.applyFilters')}</Button>
          </DialogContent>
        </Dialog>

        <div className="md:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-card p-3 shadow-sm">
            <span className="text-sm font-semibold">
              {t('catalog.found', { count: filtered.length })}
            </span>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:block">{t('catalog.sortBy')}</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-auto text-sm" aria-label={t('catalog.sortBy')}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SORTS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg bg-card p-8 text-center shadow-sm">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-2">{t('catalog.noResults')}</h3>
              <p className="mb-4 text-muted-foreground">{t('catalog.adjustFilters')}</p>
              <Button onClick={reset}><RotateCcw className="h-4 w-4" /> {t('catalog.resetFilters')}</Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((w) => (
                <Card key={w.ID_FAUTEUIL} className="flex flex-col overflow-hidden">
                  <div className="relative cursor-pointer overflow-hidden" onClick={() => navigate(`/wheelchairs/${w.ID_FAUTEUIL}`)}>
                    <img
                      src={w.imageUrl}
                      alt={t('catalog.altWheelchair', { name: w.NOM_TYPE })}
                      className="h-[220px] w-full object-cover transition-transform hover:scale-105"
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultWheelchair; }}
                    />
                    <div className="absolute left-0 top-0 flex flex-col gap-1 p-2">
                      {w.isNew && (
                        <Badge variant="destructive"><Sparkles className="mr-1 h-3 w-3" /> {t('catalog.newBadge')}</Badge>
                      )}
                    </div>
                    <div className="absolute right-0 top-0 flex flex-col gap-1 p-2">
                      {w.hasOptions && (
                        <Badge className="bg-green-600 hover:bg-green-600" title={t('catalog.optionsTitle')}>
                          <Settings className="mr-1 h-3 w-3" /> {t('catalog.optionsBadge')}
                        </Badge>
                      )}
                    </div>
                    {w.QT_STOCK <= 3 && w.QT_STOCK > 0 && (
                      <Badge variant="secondary" className="absolute bottom-2 right-2 bg-yellow-400 text-yellow-950 hover:bg-yellow-400">
                        <TriangleAlert className="mr-1 h-3 w-3" /> {t('catalog.lowStock')}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="flex flex-1 flex-col p-4">
                    <h5 className="mb-1 cursor-pointer text-lg font-semibold" onClick={() => navigate(`/wheelchairs/${w.ID_FAUTEUIL}`)}>
                      {w.NOM_TYPE}
                    </h5>
                    <p className="mb-3 text-sm text-muted-foreground">{w.PROPULTION ? t('catalog.electric') : t('catalog.manual')}</p>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="text-xl font-bold">{Number(w.PRIX).toFixed(2)} DT</span>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold text-white', w.QT_STOCK > 0 ? 'bg-green-600' : 'bg-red-600')}>
                        {w.QT_STOCK > 0 ? t('catalog.inStockCount', { count: w.QT_STOCK }) : t('catalog.outOfStock')}
                      </span>
                    </div>
                    <Button className="mt-3" onClick={() => navigate(`/wheelchairs/${w.ID_FAUTEUIL}`)}>
                      <Info className="h-4 w-4" /> {t('catalog.viewDetails')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WheelchairsPage;
