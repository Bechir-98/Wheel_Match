import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { ArrowRight, HeartPulse, Sparkles, Store } from 'lucide-react';
import ReactCardFlip from 'react-card-flip';
import chair from '../assets/chair.svg';
import patient from '../assets/patient.svg';
import vendor from '../assets/vendor.svg';
import './home.css';

function Home() {
  const { t } = useTranslation();
  const [isFlippedP, setIsFlippedP] = useState(false);
  const [isFlippedC, setIsFlippedC] = useState(false);
  const [isFlippedV, setIsFlippedV] = useState(false);

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="mx-auto max-w-6xl px-4">
          <div className="home-hero__grid">
            <div>
              <p className="home-hero__eyebrow">
                <Sparkles aria-hidden className="flex-shrink-0" />
                Wheel Match
              </p>
              <h1 id="home-hero-title" className="home-hero__title">
                {t('home.title')}
              </h1>
              <p className="home-hero__lead">
                {t('home.lead')}
              </p>
              <div className="home-hero__actions">
                <Button asChild>
                  <Link to="/wheelchairs">{t('home.browse')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/sign">{t('home.createAccount')}</Link>
                </Button>
              </div>
              <Link to="/log" className="home-hero__link">
                {t('home.signInLink')}
              </Link>
              <p className="home-hero__sub mb-3 mt-3">{t('home.registeredNote')}</p>
              <div className="home-hero__actions">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/patient-dashboard">
                    <HeartPulse className="me-1" aria-hidden />
                    {t('home.patientSpace')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/wheelchairs">{t('home.aiSpace', 'AI recommendations')}</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/vendor-dashboard">
                    <Store className="me-1" aria-hidden />
                    {t('home.vendorSpace')}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="home-hero__visual" aria-hidden>
              <div className="home-hero__visual-inner">
                <div className="home-hero__glow" />
                <img src={chair} alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section--muted" aria-labelledby="home-how-title">
        <div className="mx-auto max-w-6xl px-4">
          <header className="home-section__head">
            <p className="home-section__kicker">{t('home.howKicker')}</p>
            <h2 id="home-how-title" className="home-section__title">
              {t('home.howTitle')}
            </h2>
            <p className="home-section__desc">
              {t('home.howDesc')}
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch justify-center">
            <div>
              <article className="home-step">
                <div className="home-step__num" aria-hidden>
                  1
                </div>
                <img src={patient} alt="" />
                <h3>{t('home.stepPatientTitle')}</h3>
                <p>{t('home.stepPatientText')}</p>
              </article>
            </div>
            <div className="hidden md:flex items-center text-muted-foreground px-0">
              <ArrowRight size={28} aria-hidden />
            </div>
            <div>
              <article className="home-step">
                <div className="home-step__num" aria-hidden>
                  2
                </div>
                <img src={chair} alt="" />
                <h3>{t('home.stepAiTitle', 'AI matching')}</h3>
                <p>{t('home.stepAiText', 'Get your wheelchair ranked from your medical profile — no appointment needed.')}</p>
              </article>
            </div>
            <div className="hidden md:flex items-center text-muted-foreground px-0">
              <ArrowRight size={28} aria-hidden />
            </div>
            <div>
              <article className="home-step">
                <div className="home-step__num" aria-hidden>
                  3
                </div>
                <img src={vendor} alt="" />
                <h3>{t('home.stepVendorTitle')}</h3>
                <p>{t('home.stepVendorText')}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-roles-title">
        <div className="mx-auto max-w-6xl px-4">
          <header className="home-section__head">
            <p className="home-section__kicker">{t('home.forKicker')}</p>
            <h2 id="home-roles-title" className="home-section__title">
              {t('home.forTitle')}
            </h2>
            <p className="home-section__desc">{t('home.forDesc')}</p>
          </header>

          <p className="home-flip-hint">{t('home.flipHint')}</p>

          <div className="home-flip-wrap">
            <div className="home-flip-card">
              <ReactCardFlip isFlipped={isFlippedP} flipDirection="horizontal">
                <button
                  type="button"
                  className="home-flip-face home-flip-face--front"
                  onClick={() => setIsFlippedP(true)}
                  aria-expanded={isFlippedP}
                >
                  <img src={patient} alt="" />
                  <h2>{t('home.cardPatientTitle')}</h2>
                  <span className="home-flip-badge">{t('home.details')}</span>
                </button>
                <button
                  type="button"
                  className="home-flip-face home-flip-face--back"
                  onClick={() => setIsFlippedP(false)}
                  aria-expanded={isFlippedP}
                >
                  <p>
                    {t('home.cardPatientText')}
                  </p>
                  <span className="home-flip-badge">{t('home.goBack')}</span>
                </button>
              </ReactCardFlip>
            </div>

            <div className="home-flip-card">
              <ReactCardFlip isFlipped={isFlippedC} flipDirection="horizontal">
                <button
                  type="button"
                  className="home-flip-face home-flip-face--front"
                  onClick={() => setIsFlippedC(true)}
                  aria-expanded={isFlippedC}
                >
                  <img src={chair} alt="" />
                  <h2>{t('home.cardAiTitle', 'AI matching')}</h2>
                  <span className="home-flip-badge">{t('home.details')}</span>
                </button>
                <button
                  type="button"
                  className="home-flip-face home-flip-face--back"
                  onClick={() => setIsFlippedC(false)}
                  aria-expanded={isFlippedC}
                >
                  <p>
                    {t('home.cardAiText', 'Answer a few questions about your needs and get AI-ranked wheelchairs with clear reasons.')}
                  </p>
                  <span className="home-flip-badge">{t('home.goBack')}</span>
                </button>
              </ReactCardFlip>
            </div>

            <div className="home-flip-card">
              <ReactCardFlip isFlipped={isFlippedV} flipDirection="horizontal">
                <button
                  type="button"
                  className="home-flip-face home-flip-face--front"
                  onClick={() => setIsFlippedV(true)}
                  aria-expanded={isFlippedV}
                >
                  <img src={vendor} alt="" />
                  <h2>{t('home.cardVendorTitle')}</h2>
                  <span className="home-flip-badge">{t('home.details')}</span>
                </button>
                <button
                  type="button"
                  className="home-flip-face home-flip-face--back"
                  onClick={() => setIsFlippedV(false)}
                  aria-expanded={isFlippedV}
                >
                  <p>
                    {t('home.cardVendorText')}
                  </p>
                  <span className="home-flip-badge">{t('home.goBack')}</span>
                </button>
              </ReactCardFlip>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
