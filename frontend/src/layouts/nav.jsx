import { useEffect, useState } from 'react';
import brand from '../assets/brand.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, authHeaders } from '../config/api.js';
import { Button } from '../components/ui/button.jsx';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../components/ui/dropdown-menu.jsx';
import { ThemeToggle } from '../components/theme-toggle.jsx';
import { cn } from '@/lib/utils';

function displayNameFromProfile(p) {
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

const LINKS = [
  { to: '/', key: 'home' },
  { to: '/wheelchairs', key: 'wheelchairs' },
  { to: '/faq', key: 'faq' },
  { to: '/about', key: 'about' },
];

function Navb() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshSession } = useAuth();
  const [open, setOpen] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleLogout = () => {
    logout();
    navigate('/');
    scrollToTop();
  };

  const menuTitle =
    (user?.displayName && String(user.displayName).trim()) ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Account';

  useEffect(() => {
    if (!isAuthenticated) return;
    const hasName = user?.displayName && String(user.displayName).trim().length > 0;
    if (hasName) return;

    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(apiUrl('/users/me'), { headers: authHeaders() });
        if (!r.ok || cancelled) return;
        const data = await r.json();
        const dn = displayNameFromProfile(data);
        if (dn && !cancelled) {
          localStorage.setItem('userDisplayName', dn);
          refreshSession();
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.displayName, refreshSession]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
          <Link to="/" onClick={scrollToTop} className="mr-auto flex items-center gap-2 font-semibold">
            <img src={brand} width="30" height="30" alt="Wheel Match Logo" loading="lazy" />
            <span>Wheel Match</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Button key={l.to} variant="ghost" asChild className={cn(location.pathname === l.to && 'bg-accent')}>
                <Link to={l.to} onClick={scrollToTop}>
                  {t(`nav.${l.key}`)}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/log" onClick={scrollToTop}>
                    {t('nav.signIn')}
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/sign" onClick={scrollToTop}>
                    {t('nav.signUp')}
                  </Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="max-w-48">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{menuTitle}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" onClick={scrollToTop}>
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" onClick={scrollToTop}>
                      {t('nav.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label={t("nav.menu")} onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t bg-background p-4 lg:hidden">
            {LINKS.map((l) => (
              <Button key={l.to} variant="ghost" asChild className="justify-start">
                <Link
                  to={l.to}
                  onClick={() => {
                    setOpen(false);
                    scrollToTop();
                  }}
                >
                  {t(`nav.${l.key}`)}
                </Link>
              </Button>
            ))}
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/log" onClick={() => setOpen(false)}>
                    {t('nav.signIn')}
                  </Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link to="/sign" onClick={() => setOpen(false)}>
                    {t('nav.signUp')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    {t('nav.profile')}
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/settings" onClick={() => setOpen(false)}>
                    {t('nav.settings')}
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start text-destructive" onClick={handleLogout}>
                  {t('nav.logout')}
                </Button>
              </>
            )}
          </nav>
        )}
      </header>

      <div className="pt-16" />
    </>
  );
}

export default Navb;
