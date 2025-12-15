import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button.jsx';
import { useTranslation } from 'react-i18next';
import { apiUrl, authHeaders } from '../config/api.js';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    // ponytail: fire-and-forget prefs sync, next visit restores from backend
    if (localStorage.getItem('token')) {
      fetch(apiUrl('/users/me/settings'), {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ THEME: next }),
      }).catch(() => {});
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("nav.toggleTheme")}
      onClick={flip}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
