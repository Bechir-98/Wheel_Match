import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, User, Pencil, Save, X, Phone, Mail, MapPin, Weight, Ruler, Stethoscope, Store, IdCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiUrl, authHeaders } from '../../config/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardShell from '../../components/dashboard/DashboardShell.jsx';

const selectClass = 'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none disabled:opacity-50';

const isPatient = (t) => String(t || '').toLowerCase() === 'patient';
const isVendor = (t) => {
  const x = String(t || '').toLowerCase();
  return x === 'vendor' || x === 'commercant';
};

function MyProfile() {
  const { t } = useTranslation();

  function typeLabel(ty) {
    if (isPatient(ty)) return t('profile.rolePatient');
    if (isVendor(ty)) return t('profile.roleVendor');
    return ty || '';
  }

  function apiErrorMessage(err) {
    const d = err.response?.data?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(', ');
    return err.response?.data?.message || err.response?.data?.error || err.message || t('profile.errGeneric');
  }

  const { refreshSession, user: authUser } = useAuth();
  const shellRole =
    authUser?.userType === 'patient' || authUser?.userType === 'vendor'
      ? authUser.userType
      : null;
  const wrapLayout = (node) =>
    shellRole ? <DashboardShell role={shellRole}>{node}</DashboardShell> : node;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const loadProfile = useCallback(async (opts = { quiet: false }) => {
    try {
      if (!opts.quiet) setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(t('profile.errNotAuth'));
      }

      const response = await axios.get(apiUrl('/users/me'), {
        headers: authHeaders(),
      });

      if (!response.data) {
        throw new Error(t('profile.errNoData'));
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const data = response.data;
      const ty = data.type;
      if (!isPatient(ty) && !isVendor(ty)) {
        throw new Error(t('profile.errUnknownType'));
      }

      setUserData(data);
      setFormData(profileToFormState(data));
      return data;
    } catch (err) {
      console.error('Error loading data:', err);
      setError(apiErrorMessage(err));
      return null;
    } finally {
      if (!opts.quiet) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setFormData(profileToFormState(userData));
      setIsEditing(false);
      setError(null);
    } else {
      setFormData(profileToFormState(userData));
      setIsEditing(true);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const ty = userData?.type;
      const submitData = { ...formData };
      if (isPatient(ty)) {
        submitData.AIDANT = !!formData.AIDANT;
      }

      const response = await axios.patch(apiUrl('/users/me'), submitData, {
        headers: {
          ...authHeaders({ 'Content-Type': 'application/json' }),
        },
      });

      if (response.data?.success) {
        const fresh = await loadProfile({ quiet: true });
        if (fresh) {
          const dn = displayNameFromMePayload(fresh);
          if (dn) localStorage.setItem('userDisplayName', dn);
        }
        refreshSession();
        setIsEditing(false);
      } else {
        throw new Error(response.data?.message || t('profile.errUpdate'));
      }
    } catch (err) {
      setError(apiErrorMessage(err));
      console.error(err);
    }
  };

  const renderPatientForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold mb-2 flex items-center">
              <User className="mr-2 h-4 w-4" />
              {t('profile.lastName')}
            </Label>
            <Input
              type="text"
              name="NOMP"
              value={formData.NOMP ?? ''}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold mb-2 flex items-center">
              <User className="mr-2 h-4 w-4" />
              {t('profile.firstName')}
            </Label>
            <Input
              type="text"
              name="PRENOMP"
              value={formData.PRENOMP ?? ''}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-bold mb-2 flex items-center">
          <IdCard className="mr-2 h-4 w-4" />
          {t('profile.nss')}
        </Label>
        <Input
          type="text"
          name="NSS"
          value={formData.NSS ?? ''}
          onChange={handleInputChange}
          required
          maxLength={64}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold mb-2 flex items-center">
              <Weight className="mr-2 h-4 w-4" />
              {t('profile.weight')}
            </Label>
            <Input
              type="number"
              name="POIDS"
              value={formData.POIDS ?? ''}
              onChange={handleInputChange}
              required
              min={0}
              step="0.01"
            />
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold mb-2 flex items-center">
              <Ruler className="mr-2 h-4 w-4" />
              {t('profile.height')}
            </Label>
            <Input
              type="number"
              name="TAILLE"
              value={formData.TAILLE ?? ''}
              onChange={handleInputChange}
              step="0.001"
              min={0}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-bold mb-2">{t('profile.propulsion')}</Label>
        <select
          name="UTILISATION_PRPL"
          value={formData.UTILISATION_PRPL || 'MANUELLE'}
          onChange={handleInputChange}
          required
          className={selectClass}
        >
          <option value="MANUELLE">{t('profile.manual')}</option>
          <option value="ELECTRIQUE">{t('profile.electric')}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="aidant-check"
          name="AIDANT"
          checked={!!formData.AIDANT}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-border"
        />
        <Label htmlFor="aidant-check">{t('profile.caregiver')}</Label>
      </div>
    </div>
  );

  const renderCommercantForm = () => (
    <div className="mb-3 flex flex-col gap-2">
      <Label>{t('profile.bizName')}</Label>
      <Input
        type="text"
        name="NOM_MARCHAND"
        value={formData.NOM_MARCHAND ?? ''}
        onChange={handleInputChange}
        required
      />
    </div>
  );

  const renderCommonFormFields = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="font-bold mb-2 flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          {t('profile.address')}
        </Label>
        <Input
          type="text"
          name="ADRESSE"
          value={formData.ADRESSE ?? ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold mb-2 flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              {t('profile.email')}
            </Label>
            <Input
              type="email"
              name="EMAIL"
              value={formData.EMAIL ?? ''}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold mb-2 flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              {t('profile.phone')}
            </Label>
            <Input
              type="tel"
              name="NUMTEL"
              value={formData.NUMTEL ?? ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const fmtNum = (v, suffix = '') => {
    if (v === '' || v === undefined || v === null) return '—';
    return `${v}${suffix}`;
  };

  const renderPatientInfo = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Card className="h-full shadow-sm">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center gap-2">
            <User className="h-4 w-4" />
            <CardTitle className="text-lg">{t('profile.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col pt-6">
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.lastName')}:</strong>
              <span>{userData.NOMP || '—'}</span>
            </div>
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.firstName')}:</strong>
              <span>{userData.PRENOMP || '—'}</span>
            </div>
            <div className="flex items-center">
              <strong className="mr-2">{t('profile.nss')}:</strong>
              <span>{userData.NSS || '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="h-full shadow-sm">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            <CardTitle className="text-lg">{t('profile.medicalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col pt-6">
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.weightShort')}:</strong>
              <span>{fmtNum(userData.POIDS, t('profile.kg'))}</span>
            </div>
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.heightShort')}:</strong>
              <span>{fmtNum(userData.TAILLE, t('profile.m'))}</span>
            </div>
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.propulsion')}:</strong>
              <span>{userData.UTILISATION_PRPL || '—'}</span>
            </div>
            <div className="flex items-center">
              <strong className="mr-2">{t('profile.caregiverShort')}:</strong>
              <span>{userData.AIDANT ? t('profile.yes') : t('profile.no')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="h-full shadow-sm">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center gap-2">
            <MapPin className="h-4 w-4" />
            <CardTitle className="text-lg">{t('profile.contactInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col pt-6">
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.address')}:</strong>
              <span>{userData.ADRESSE || '—'}</span>
            </div>
            <div className="mb-2 flex items-center">
              <strong className="mr-2">{t('profile.email')}:</strong>
              <span>{userData.EMAIL || '—'}</span>
            </div>
            <div className="flex items-center">
              <strong className="mr-2">{t('profile.phone')}:</strong>
              <span>{userData.NUMTEL || '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCommercantInfo = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Card className="mb-3">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center gap-2">
            <Store className="h-4 w-4" />
            <CardTitle className="text-lg">{t('profile.bizInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-0">
              <strong>{t('profile.bizName')}:</strong> {userData.NOM_MARCHAND || '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="mb-3">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center gap-2">
            <Mail className="h-4 w-4" />
            <CardTitle className="text-lg">{t('profile.contactInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-2">
              <strong>{t('profile.address')}:</strong> {userData.ADRESSE || '—'}
            </p>
            <p className="mb-2">
              <strong>{t('profile.email')}:</strong> {userData.EMAIL || '—'}
            </p>
            <p className="mb-0">
              <strong>{t('profile.phone')}:</strong> {userData.NUMTEL || '—'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return wrapLayout(
      <div className="mx-auto max-w-6xl px-4 flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" role="status" />
          <h4 className="mt-3 text-lg font-semibold">{t('profile.loading')}</h4>
        </div>
      </div>,
    );
  }

  if (error && !userData) {
    return wrapLayout(
      <div className="mx-auto max-w-6xl px-4 mt-4">
        <Alert variant="destructive" className="flex items-center gap-2">
          <X className="h-4 w-4" />
          <div>
            <h5 className="font-semibold">{t('profile.errorTitle')}</h5>
            <p className="mb-0">{error}</p>
          </div>
        </Alert>
      </div>,
    );
  }

  if (!userData) {
    return wrapLayout(null);
  }

  return wrapLayout(
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center flex-wrap">
          <h2 className="mb-0 flex items-center text-2xl font-bold">
            <User className="mr-2 h-5 w-5" />
            {t('profile.title')}
          </h2>
          <Badge className="ml-2">
            {typeLabel(userData.type)}
          </Badge>
        </div>
        <Button variant="outline" className={isEditing ? 'text-destructive flex items-center' : 'flex items-center'} onClick={handleToggleEdit} aria-label={isEditing ? t('profile.cancel') : t('profile.edit')}>
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" />
              {t('profile.cancel')}
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              {t('profile.edit')}
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert className="mb-3">
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-4 pt-4">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isPatient(userData.type) && renderPatientForm()}
              {isVendor(userData.type) && renderCommercantForm()}
              {renderCommonFormFields()}
              <div className="flex justify-end">
                <Button type="submit" className="flex items-center" size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  {t('profile.save')}
                </Button>
              </div>
            </form>
          ) : (
            <>
              {isPatient(userData.type) && renderPatientInfo()}
              {isVendor(userData.type) && renderCommercantInfo()}
            </>
          )}
        </CardContent>
      </Card>
    </div>,
  );
}

/** Sync nav label with /users/me payload (same rules as backend build_display_name). */
function displayNameFromMePayload(p) {
  if (!p || typeof p !== 'object') return '';
  const t = String(p.type || '').toLowerCase();
  if (t === 'patient') {
    const s = `${p.PRENOMP || ''} ${p.NOMP || ''}`.trim();
    return s || (p.EMAIL || '').split('@')[0] || '';
  }
  if (t === 'vendor') {
    return (p.NOM_MARCHAND || '').trim() || (p.EMAIL || '').split('@')[0] || '';
  }
  return (p.EMAIL || '').split('@')[0] || '';
}

function profileToFormState(data) {
  if (!data) return {};
  const userType = data.type;
  const base = {
    ADRESSE: data.ADRESSE ?? '',
    EMAIL: data.EMAIL ?? '',
    NUMTEL: data.NUMTEL ?? '',
  };

  if (isPatient(userType)) {
    return {
      ...base,
      NOMP: data.NOMP ?? '',
      PRENOMP: data.PRENOMP ?? '',
      NSS: data.NSS ?? '',
      POIDS: data.POIDS === '' || data.POIDS === undefined || data.POIDS === null ? '' : String(data.POIDS),
      TAILLE: data.TAILLE === '' || data.TAILLE === undefined || data.TAILLE === null ? '' : String(data.TAILLE),
      UTILISATION_PRPL: data.UTILISATION_PRPL || 'MANUELLE',
      AIDANT: Boolean(data.AIDANT),
    };
  }
  if (isVendor(userType)) {
    return {
      ...base,
      NOM_MARCHAND: data.NOM_MARCHAND ?? '',
    };
  }
  return base;
}

export default MyProfile;
