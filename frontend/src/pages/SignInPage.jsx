import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { apiUrl } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const SignInPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError(t('auth.fillEmailPassword'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

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
              : t('auth.loginFailed'),
        );
        return;
      }

      if (data.success) {
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user_id != null) localStorage.setItem('userId', String(data.user_id));
        if (data.user_type) localStorage.setItem('userType', data.user_type);
        if (data.email) localStorage.setItem('userEmail', data.email);
        if (data.display_name != null) localStorage.setItem('userDisplayName', String(data.display_name));
        refreshSession();
        navigate(data.redirect || '/patient-dashboard');
      } else {
        setError(data.error || data.message || t('auth.loginFailed'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-background px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('auth.welcomeBack')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('auth.signInPasswordPlaceholder')}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              {error && <Alert variant="destructive">{error}</Alert>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignInPage;
