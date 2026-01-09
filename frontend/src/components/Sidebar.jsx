import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function Sidebar({ role, user: userProp }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: sessionUser, logout } = useAuth();
  const user = userProp ?? sessionUser;
  let links = [];

  if (role === 'patient') {
    links = [
      { to: '/patient-dashboard', label: t('sidebar.dashboard') },
      { to: '/profile', label: t('sidebar.profile') },
      { to: '/choisis', label: t('sidebar.myWheelchairs') },
      { to: '/messages', label: t('sidebar.messages') },
      { to: '/settings', label: t('sidebar.settings') },
    ];
  } else if (role === 'vendor') {
    links = [
      { to: '/vendor-dashboard', label: t('sidebar.dashboard') },
      { to: '/profile', label: 'My Profile' },
      { to: '/products', label: t('sidebar.products') },
      { to: '/messages', label: 'Messages' },
      { to: '/settings', label: 'Settings' },
    ];
  }

  const displayName =
    (user?.displayName && String(user.displayName).trim()) ||
    user?.email?.split('@')[0] ||
    user?.name ||
    'User';

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r bg-card p-4 md:flex">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h5 className="font-semibold">{displayName}</h5>
          <p className="text-sm capitalize text-muted-foreground">{t(`sidebar.${role}`)}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut /> {t('sidebar.logout')}
        </Button>
      </div>
      <Separator />
      <ul className="flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to}>
              {({ isActive }) => (
                <span
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent font-medium text-accent-foreground'
                  )}
                >
                  {link.label}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
