import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer id="about" className="mt-10 bg-secondary px-5 py-10 text-center text-sm text-secondary-foreground">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-xl font-semibold">{t('about.title')}</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t('about.tagline')}</p>
        <p className="mt-6">
          {t('about.contact')}: <a href="mailto:support@wheelmatch.com" className="hover:underline">support@wheelmatch.com</a> |{' '}
          <a href="tel:+21692195666" className="hover:underline">+216 92195666</a>
        </p>
        <p className="mt-2 text-muted-foreground">&copy; {new Date().getFullYear()} WheelMatch. {t('about.rights')}</p>
      </div>
    </footer>
  );
}

export default Footer;
