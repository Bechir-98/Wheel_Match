import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

function money(n) {
  if (n == null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
  } catch {
    return `${n} €`;
  }
}

function VendorDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demandes, setDemandes] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl('/vendor/dashboard'), { headers: authHeaders() });
      const raw = await res.text();
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error(t('vendorDash.errInvalid'));
      }
      if (!res.ok) {
        const msg =
          typeof json.detail === 'string'
            ? json.detail
            : Array.isArray(json.detail)
              ? json.detail.map((d) => d.msg).join(', ')
              : t('vendorDash.errLoad');
        throw new Error(msg);
      }
      setData(json);

      const dRes = await fetch(apiUrl('/vendor/requests'), { headers: authHeaders() });
      if (dRes.ok) setDemandes(await dRes.json());
    } catch (e) {
      setError(e.message || t('vendorDash.errFailed'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;
  const recent = data?.recent_products || [];
  const vendorName = data?.vendor_name || '';

  return (
    <DashboardShell role="vendor">
      <div className="mx-auto max-w-6xl px-4">
        {vendorName ? (
          <p className="text-muted-foreground mb-3">
            <strong>{vendorName}</strong> — {t('vendorDash.catalogOverview')}
          </p>
        ) : null}

        {loading && (
          <div className="flex justify-center items-center py-5">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('vendorDash.loading')}
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive" className="mb-4">
            {error}
            <div className="mt-2">
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => load()}>
                {t('vendorDash.retry')}
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
                    <div className="text-2xl font-bold">{stats.products_count}</div>
                    <p className="font-medium mb-0">{t('vendorDash.statProducts')}</p>
                    <small className="text-muted-foreground">{t('vendorDash.statProductsSub')}</small>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{money(stats.inventory_value)}</div>
                    <p className="font-medium mb-0">{t('vendorDash.statValue')}</p>
                    <small className="text-muted-foreground">{t('vendorDash.statValueSub')}</small>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{stats.total_stock_units}</div>
                    <p className="font-medium mb-0">{t('vendorDash.statStock')}</p>
                    <small className="text-muted-foreground">
                      {t('vendorDash.statStockSub', { count: stats.low_stock_count, threshold: stats.low_stock_threshold })}
                    </small>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="flex flex-col justify-center pt-6">
                    <div className="text-2xl font-bold">{stats.average_list_price ? `${stats.average_list_price} €` : '—'}</div>
                    <p className="font-medium mb-0">{t('vendorDash.statAvg')}</p>
                    <small className="text-muted-foreground">{t('vendorDash.statAvgSub')}</small>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{t('vendorDash.catalogTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t('vendorDash.catalogText', { count: stats.products_count })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link to="/products">{t('vendorDash.openProducts')}</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/wheelchairs">{t('vendorDash.publicCatalog')}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{t('vendorDash.alertsTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.low_stock_count === 0 ? (
                      <p className="text-muted-foreground mb-0">{t('vendorDash.alertsEmpty')}</p>
                    ) : (
                      <p className="mb-3">
                        <Badge variant="secondary">
                          {stats.low_stock_count}
                        </Badge>{' '}
                        {t('vendorDash.alertsText', { threshold: stats.low_stock_threshold })}
                      </p>
                    )}
                    <form
                      className="flex items-center gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const v = Number(e.target.threshold.value);
                        if (!Number.isFinite(v) || v < 0) return;
                        await fetch(apiUrl('/users/me/settings'), {
                          method: 'PUT',
                          headers: authHeaders({ 'Content-Type': 'application/json' }),
                          body: JSON.stringify({ LOW_STOCK: v }),
                        });
                        load();
                      }}
                    >
                      <Label htmlFor="low-stock">{t('vendorDash.thresholdLabel')}</Label>
                      <Input
                        id="low-stock"
                        name="threshold"
                        type="number"
                        min={0}
                        defaultValue={stats.low_stock_threshold}
                        key={stats.low_stock_threshold}
                        className="h-8 w-20"
                      />
                      <Button size="sm" type="submit">{t('common.save')}</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-base">{t('vendorDash.recentTitle')}</CardTitle>
                    <Badge variant="secondary">{recent.length}</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    {recent.length === 0 ? (
                      <p className="text-muted-foreground p-3 mb-0">{t('vendorDash.recentEmpty')}</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('vendorDash.thId')}</TableHead>
                            <TableHead>{t('vendorDash.thType')}</TableHead>
                            <TableHead>{t('vendorDash.thPropulsion')}</TableHead>
                            <TableHead>{t('vendorDash.thPrice')}</TableHead>
                            <TableHead>{t('vendorDash.thStock')}</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recent.map((p) => (
                            <TableRow key={p.ID_FAUTEUIL}>
                              <TableCell>{p.ID_FAUTEUIL}</TableCell>
                              <TableCell>{p.NOM_TYPE}</TableCell>
                              <TableCell>{p.PROPULTION_TEXT}</TableCell>
                              <TableCell>{p.PRIX != null ? `${p.PRIX} €` : '—'}</TableCell>
                              <TableCell>{p.QT_STOCK}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/wheelchairs/${p.ID_FAUTEUIL}`}>{t('vendorDash.view')}</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 mb-4">
              <div>
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-base">{t('vendorDash.reqTitle')}</CardTitle>
                    <Badge variant="secondary">{demandes.length}</Badge>
                  </CardHeader>
                  <CardContent>
                    {demandes.length === 0 ? (
                      <p className="text-muted-foreground mb-0">{t('vendorDash.reqEmpty')}</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('vendorDash.thPatient')}</TableHead>
                            <TableHead>{t('vendorDash.thWheelchair')}</TableHead>
                            <TableHead>{t('vendorDash.thStatus')}</TableHead>
                            <TableHead>{t('vendorDash.thDate')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {demandes.map((d) => (
                            <TableRow key={d.ID_DEMANDE}>
                              <TableCell>{d.patient_name}</TableCell>
                              <TableCell>{d.NOM_TYPE}</TableCell>
                              <TableCell>
                                <Badge variant={d.STATUT === 'APPROUVE' ? 'default' : d.STATUT === 'REJETE' ? 'destructive' : 'secondary'}>
                                  {d.STATUT}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {d.DATE_DEMANDE ? new Date(d.DATE_DEMANDE).toLocaleDateString() : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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

export default VendorDashboard;
