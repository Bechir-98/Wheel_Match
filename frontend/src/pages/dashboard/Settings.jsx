import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Bell, Save, Palette, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import axios from "axios";
import { useTheme } from "next-themes";
import { apiUrl, authHeaders } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardShell from "../../components/dashboard/DashboardShell.jsx";
import { setLanguage } from "../../i18n/index.js";
import { useTranslation } from "react-i18next";

const selectClass = 'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none disabled:opacity-50';

const Toggle = ({ label, name, checked, onChange }) => (
  <div className="mb-3 flex items-center gap-2">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={!!checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-border"
    />
    <Label htmlFor={name}>{label}</Label>
  </div>
);

const Settings = () => {
  const { t } = useTranslation();
  const { setTheme } = useTheme();
  const { user: authUser } = useAuth();
  const shellRole =
    authUser?.userType === "patient" || authUser?.userType === "vendor"
      ? authUser.userType
      : null;
  const wrapLayout = (node) =>
    shellRole ? <DashboardShell role={shellRole}>{node}</DashboardShell> : node;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // {t("settings.account")}
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // {t("settings.notifications")}
    NOTIFICATIONS_EMAIL: true,
    NOTIFICATIONS_PUSH: true,
    APPOINTMENT_REMINDERS: true,
    SYSTEM_UPDATES: true,
    
    // {t("settings.display")}
    THEME: "light",
    LANGUAGE: "en",
    FONT_SIZE: "medium",
    
    // Privacy Settings
    DATA_SHARING: false,
    ACTIVITY_TRACKING: true,
    ONLINE_STATUS: true,
    
    // System Settings
    AUTO_BACKUP: true,
    BACKUP_FREQUENCY: "daily",
    DATA_RETENTION: "30"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!localStorage.getItem('token')) {
          throw new Error('Not authenticated');
        }
        const response = await axios.get(apiUrl('/users/me/settings'), {
          headers: authHeaders(),
        });
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        setFormData(prev => ({
          ...prev,
          ...response.data
        }));
        // ponytail: backend prefs are the source of truth, applied to live providers here
        if (response.data.THEME) setTheme(response.data.THEME);
        if (response.data.LANGUAGE) setLanguage(response.data.LANGUAGE);
      } catch (err) {
        setError(`Error loading settings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Not authenticated');
      }
      const response = await axios.put(apiUrl('/users/me/settings'), formData, {
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setSuccess(true);
      setTheme(formData.THEME);
      setLanguage(formData.LANGUAGE);
    } catch (err) {
      setError(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return wrapLayout(
      <div className="mx-auto max-w-6xl px-4 flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <Loader2 className="h-8 w-8 animate-spin" role="status" />
      </div>,
    );
  }

  return wrapLayout(
    <div className="mx-auto max-w-6xl px-4 py-4">
      <h1 className="mb-4 text-2xl font-bold">{t("settings.title")}</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4">
          {t("settings.updated")}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-4">
          {/* Account Settings */}
          <Card className="flex-grow-1 flex-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-3 flex flex-col gap-2">
                <Label className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  {t("settings.email")}
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 flex flex-col gap-2">
                <Label className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  {t("settings.currentPassword")}
                </Label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3 flex flex-col gap-2">
                <Label>{t("settings.newPassword")}</Label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3 flex flex-col gap-2">
                <Label>{t("settings.confirmPassword")}</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="flex-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Toggle label={t("settings.emailNotif")} name="NOTIFICATIONS_EMAIL" checked={formData.NOTIFICATIONS_EMAIL} onChange={handleChange} />
              <Toggle label={t("settings.pushNotif")} name="NOTIFICATIONS_PUSH" checked={formData.NOTIFICATIONS_PUSH} onChange={handleChange} />
              <Toggle label={t("settings.appointmentRem")} name="APPOINTMENT_REMINDERS" checked={formData.APPOINTMENT_REMINDERS} onChange={handleChange} />
              <Toggle label={t("settings.systemUpdates")} name="SYSTEM_UPDATES" checked={formData.SYSTEM_UPDATES} onChange={handleChange} />
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="flex-1" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-3 flex flex-col gap-2">
                <Label className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  {t("settings.theme")}
                </Label>
                <select
                  name="THEME"
                  value={formData.THEME}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="light">{t("settings.light")}</option>
                  <option value="dark">{t("settings.dark")}</option>
                  <option value="system">{t("settings.system")}</option>
                </select>
              </div>
              <div className="mb-3 flex flex-col gap-2">
                <Label className="flex items-center">
                  <Languages className="mr-2 h-4 w-4" />
                  {t("settings.language")}
                </Label>
                <select
                  name="LANGUAGE"
                  value={formData.LANGUAGE}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="en">{t("settings.english")}</option>
                  <option value="fr">{t("settings.french")}</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </div>,
  );
};

export default Settings;
