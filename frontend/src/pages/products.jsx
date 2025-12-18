import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, DollarSign, Loader2, Upload } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table.jsx';
import { Separator } from '../components/ui/separator.jsx';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

const emptyForm = { ID_TYPE: '', PROPULTION: false, PRIX: '', QT_STOCK: '' };

const ProductsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [notice, setNotice] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [types, setTypes] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dRes, tRes] = await Promise.all([
        fetch(apiUrl('/vendor/dashboard'), { headers: authHeaders() }),
        fetch(apiUrl('/reference/types'), { headers: authHeaders() }),
      ]);
      if (dRes.ok) {
        const d = await dRes.json();
        setProducts(d.recent_products || []);
      }
      if (tRes.ok) setTypes(await tRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormValues(emptyForm);
    setImageFile(null);
    setIsModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormValues({
      ID_TYPE: product.ID_TYPE ?? '',
      PROPULTION: !!product.PROPULTION,
      PRIX: product.PRIX ?? '',
      QT_STOCK: product.QT_STOCK ?? '',
    });
    setImageFile(null);
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const r = await fetch(apiUrl(`/wheelchairs/${deleteId}`), { method: 'DELETE', headers: authHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
      showNotice(t('products.deleted'));
      load();
    } catch (e) {
      showNotice(e.message);
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id_type: Number(formValues.ID_TYPE),
        propulsion: formValues.PROPULTION ? 1 : 0,
        prix: Number(formValues.PRIX),
        qt_stock: Number(formValues.QT_STOCK),
      };
      let id = editingProduct?.ID_FAUTEUIL;
      if (editingProduct) {
        const r = await fetch(apiUrl(`/wheelchairs/${id}`), {
          method: 'PUT',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
        showNotice(t('products.updated'));
      } else {
        const r = await fetch(apiUrl('/wheelchairs'), {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
        id = (await r.json()).ID_FAUTEUIL;
        showNotice(t('products.added'));
      }
      if (imageFile && id) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const token = localStorage.getItem('token');
        const r = await fetch(apiUrl(`/wheelchairs/${id}/image`), {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
      }
      setIsModalVisible(false);
      load();
    } catch (err) {
      showNotice(err.message);
    } finally {
      setSaving(false);
    }
  };

  const revenue = products.reduce((sum, p) => sum + (parseFloat(p.PRIX) || 0) * (parseInt(p.QT_STOCK) || 0), 0);
  const role = user?.userType === 'vendor' ? 'vendor' : null;
  const body = (
    <div className="min-h-screen bg-background p-6">
      {notice && <Alert className="mb-4">{notice}</Alert>}

      <Card className="mb-6 max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-green-700" /> {t('products.totalRevenue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-700">{t('products.revenueValue', { value: revenue.toFixed(2) })}</p>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center gap-4">
        <h2 className="text-lg font-bold">{t('products.inventory')}</h2>
        <Separator className="flex-1" />
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-4 w-4" /> {t('products.addWheelchair')}
        </Button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {t('common.loading')}</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.colType')}</TableHead>
                <TableHead>{t('products.colPrice')}</TableHead>
                <TableHead>{t('products.colStock')}</TableHead>
                <TableHead>{t('products.colPropulsion')}</TableHead>
                <TableHead>{t('products.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.ID_FAUTEUIL}>
                  <TableCell>{p.NOM_TYPE}</TableCell>
                  <TableCell>{t('products.priceValue', { value: Number(p.PRIX).toFixed(2) })}</TableCell>
                  <TableCell>{p.QT_STOCK}</TableCell>
                  <TableCell>{p.PROPULTION_TEXT || (p.PROPULTION ? t('products.yes') : t('products.no'))}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(p)} aria-label={t('products.edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(p.ID_FAUTEUIL)} aria-label={t('products.delete')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('products.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>{t('products.noBtn')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('products.yesBtn')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t('products.editTitle') : t('products.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="f-type">{t('products.typeLabel')}</Label>
              <select id="f-type" name="ID_TYPE" value={formValues.ID_TYPE} onChange={handleField} required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="">{t('products.selectType')}</option>
                {types.map((ty) => (
                  <option key={ty.ID_TYPE} value={ty.ID_TYPE}>{ty.NOM_TYPE}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="f-prop">
              <input id="f-prop" type="checkbox" name="PROPULTION" checked={!!formValues.PROPULTION} onChange={handleField} className="h-4 w-4 accent-primary" />
              {t('products.propulsionLabel')}
            </label>

            <div className="space-y-2">
              <Label htmlFor="f-price">{t('products.priceLabel')}</Label>
              <Input id="f-price" name="PRIX" type="number" min={0} step={0.01} value={formValues.PRIX} onChange={handleField} placeholder={t('products.pricePlaceholder')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-stock">{t('products.stockLabel')}</Label>
              <Input id="f-stock" name="QT_STOCK" type="number" min={0} value={formValues.QT_STOCK} onChange={handleField} placeholder={t('products.stockPlaceholder')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-image">{t('products.imageLabel')}</Label>
              <label htmlFor="f-image" className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                {imageFile ? imageFile.name : t('products.imagePlaceholder')}
              </label>
              <Input
                id="f-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="" className="h-24 w-24 rounded-md object-cover" />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {editingProduct ? t('products.update') : t('products.add')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (role) return <DashboardShell role={role}>{body}</DashboardShell>;
  return body;
};

export default ProductsPage;
