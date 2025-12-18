import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-muted/40 px-4 py-12 text-center">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-semibold">WheelMatch</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t('about.tagline')}</p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link to="/faq" className="hover:underline">
            FAQ
          </Link>
          <a href="mailto:support@wheelmatch.com" className="hover:underline">
            support@wheelmatch.com
          </a>
          <a href="tel:+21692195666" className="hover:underline">
            +216 92195666
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">&copy; {new Date().getFullYear()} WheelMatch. {t('about.rights')}</p>
      </div>
    </footer>
  );
}

export default Footer;
