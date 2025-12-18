import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Alert } from '../components/ui/alert.jsx';

function Log() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      console.log('Sending login request...');
      console.log('Form data:', Object.fromEntries(formData));

      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'Accept-Language': localStorage.getItem('wm-lang') || 'en',
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setError(t('auth.serverErrorApi', { status: response.status }));
        return;
      }

      if (!response.ok) {
        const detail = data.detail;
        setError(
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
              : `HTTP ${response.status}`,
        );
        return;
      }
      console.log('Response data:', data);      if (data.success) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user_id != null) {
          localStorage.setItem('userId', String(data.user_id));
        }
        if (data.user_type) {
          localStorage.setItem('userType', data.user_type);
        }
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        }
        if (data.display_name != null) {
          localStorage.setItem('userDisplayName', String(data.display_name));
        }
        refreshSession();
        const from = location.state?.from;
        const dest =
          data.redirect || (typeof from === 'string' && from !== '/log' ? from : null) || '/patient-dashboard';
        navigate(dest);
      } else {
        // Login failed
        setError(data.error || t('auth.invalidCredentials'));
        setDebugInfo(data.debug);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError(t('auth.cannotConnect'));
      } else if (err.message.includes('HTTP error')) {
        setError(t('auth.serverErrorLater'));
      } else {
        setError(t('auth.loginErrorGeneric'));
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-4 pt-6">
          {error && <Alert variant="destructive">{error}</Alert>}

          {debugInfo && (
            <div className="rounded-md border bg-muted p-2.5">
              <h4 className="font-medium">{t('auth.debugInfo')}</h4>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="mail">{t('auth.email')}</Label>
              <Input type="email" id="mail" name="mail" placeholder={t('auth.email')} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input type="password" id="password" name="password" placeholder={t('auth.password')} required />
            </div>
            <Button type="submit" className="w-full">{t('auth.login')}</Button>
            <p className="text-sm text-muted-foreground">
              {t('auth.noAccount')} <Link to="/sign" className="text-primary underline-offset-4 hover:underline">{t('auth.signHere')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Log;
