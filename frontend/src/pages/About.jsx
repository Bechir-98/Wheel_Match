import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartHandshake, Sparkles, Store, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ROLE_KEYS = [
  { icon: HeartHandshake, key: 'patients' },
  { icon: Sparkles, key: 'ai' },
  { icon: Store, key: 'vendors' },
];

function About() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold">{t('about.title')}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        {t('about.tagline')}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ROLE_KEYS.map((r) => (
          <Card key={r.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <r.icon className="h-5 w-5 text-primary" />
                {t(`about.roles.${r.key}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t(`about.roles.${r.key}.text`)}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('about.support')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a href="mailto:support@wheelmatch.com" className="flex items-center gap-1 hover:underline">
              <Mail className="h-4 w-4" /> support@wheelmatch.com
            </a>
            <a href="tel:+21692195666" className="flex items-center gap-1 hover:underline">
              <Phone className="h-4 w-4" /> +216 92195666
            </a>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/sign">{t('about.getStarted')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/faq">{t('about.faqButton')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default About;
