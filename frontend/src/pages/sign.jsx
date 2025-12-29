import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Alert } from '../components/ui/alert.jsx';

const inputCls = 'mt-1';
const selectCls = 'mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50';

function Sign() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profession: '',
    address: '',
    phone: '',
    // Patient fields
    nomp: '',
    prenomp: '',
    nss: '',
    poids: '',
    taille: '',
    utilisation_prpl: 'MANUELLE',
    aidant: false,
    // Vendor fields
    nom_commercial: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  // Log to check if this component is mounted
  console.log('Sign Component Rendered');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    // Basic validation
    if (!formData.email || !formData.password || !formData.profession ||
        !formData.address || !formData.phone) {
      setError(t('auth.requiredFields'));
      return;
    }

    // Profession-specific validation
    switch (formData.profession) {
      case '1': // Patient
        if (!formData.nomp || !formData.prenomp || !formData.nss ||
            !formData.poids || !formData.taille || !formData.utilisation_prpl) {
          setError(t('auth.patientIncomplete'));
          return;
        }
        break;
      case '4': // Vendor
        if (!formData.nom_commercial) {
          setError(t('auth.vendorNameRequired'));
          return;
        }
        break;
    }

    try {
      console.log('Form data:', formData);
      const { confirmPassword: _c, ...registerPayload } = formData;
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Language': localStorage.getItem('wm-lang') || 'en',
        },
        body: JSON.stringify(registerPayload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setError(response.ok ? t('auth.invalidResponse') : t('auth.serverError', { status: response.status }));
        return;
      }

      if (!response.ok) {
        const detail = data.detail;
        const msg =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg || d).join(', ')
              : data.error || t('auth.requestFailed', { status: response.status });
        setError(msg);
        return;
      }

      if (data.success) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user_id != null) localStorage.setItem('userId', String(data.user_id));
        if (data.user_type) localStorage.setItem('userType', data.user_type);
        if (data.email) localStorage.setItem('userEmail', data.email);
        if (data.display_name != null) localStorage.setItem('userDisplayName', String(data.display_name));
        refreshSession();
        const dest =
          data.redirect ||
          (formData.profession === '1'
            ? '/patient-dashboard'
            : formData.profession === '4'
              ? '/vendor-dashboard'
              : null);
        if (dest) {
          navigate(dest);
        } else {
          setError(t('auth.invalidProfession'));
        }
      } else {
        setError(data.error || t('auth.registrationFailed'));
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(t('auth.errorGeneric', { message: err.message }));
    }
  };

  const renderProfessionFields = () => {
    switch (formData.profession) {
      case '1': // Patient
        return (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="nomp">{t('auth.lastName')}</Label>
              <Input type="text" id="nomp" name="nomp" value={formData.nomp} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="prenomp">{t('auth.firstName')}</Label>
              <Input type="text" id="prenomp" name="prenomp" value={formData.prenomp} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nss">{t('auth.ssn')}</Label>
              <Input type="text" id="nss" name="nss" value={formData.nss} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="poids">{t('auth.weight')}</Label>
              <Input type="number" id="poids" name="poids" value={formData.poids} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="taille">{t('auth.height')}</Label>
              <Input type="number" id="taille" name="taille" value={formData.taille} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="utilisation_prpl">{t('auth.propulsion')}</Label>
              <select id="utilisation_prpl" name="utilisation_prpl" value={formData.utilisation_prpl} onChange={handleChange} required className={selectCls}>
                <option value="MANUELLE">{t('auth.manual')}</option>
                <option value="ELECTRIQUE">{t('auth.electric')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="aidant" name="aidant" checked={formData.aidant} onChange={handleChange} className="h-4 w-4 rounded border-border" />
              <Label htmlFor="aidant">{t('auth.caregiver')}</Label>
            </div>
          </>
        );
      case '4': // Vendor
        return (
          <div className="grid gap-1.5">
            <Label htmlFor="nom_commercial">{t('auth.commercialName')}</Label>
            <Input type="text" id="nom_commercial" name="nom_commercial" value={formData.nom_commercial} onChange={handleChange} required className={inputCls} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{t('auth.signUp')}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">{t('auth.address')}</Label>
              <Input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="profession">{t('auth.profession')}</Label>
              <select id="profession" name="profession" value={formData.profession} onChange={handleChange} required className={selectCls}>
                <option value="">{t('auth.selectProfession')}</option>
                <option value="1">{t('auth.patient')}</option>
                <option value="4">{t('auth.vendor')}</option>
              </select>
            </div>

            {renderProfessionFields()}

            <Button type="submit" className="w-full">{t('auth.signUp')}</Button>
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHave')} <Link to="/log" className="text-primary underline-offset-4 hover:underline">{t('auth.loginHere')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Sign;
