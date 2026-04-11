import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { ArrowRight, HeartPulse, ShopWindow, Stars } from 'react-bootstrap-icons';
import ReactCardFlip from 'react-card-flip';
import chair from '../assets/chair.svg';
import patient from '../assets/patient.svg';
import clinician from '../assets/clinician.svg';
import vendor from '../assets/vendor.svg';
import './home.css';

function Home() {
  const [isFlippedP, setIsFlippedP] = useState(false);
  const [isFlippedC, setIsFlippedC] = useState(false);
  const [isFlippedV, setIsFlippedV] = useState(false);

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <Container>
          <div className="home-hero__grid">
            <div>
              <p className="home-hero__eyebrow">
                <Stars aria-hidden className="flex-shrink-0" />
                Wheel Match
              </p>
              <h1 id="home-hero-title" className="home-hero__title">
                Find the perfect wheelchair for your needs
              </h1>
              <p className="home-hero__lead">
                Personalized recommendations based on your condition, lifestyle, and preferences — with clinicians and
                vendors on the same platform.
              </p>
              <div className="home-hero__actions">
                <Button variant="primary" as={Link} to="/wheelchairs">
                  Browse wheelchairs
                </Button>
                <Button variant="outline-light" as={Link} to="/sign">
                  Create account
                </Button>
              </div>
              <Link to="/log" className="home-hero__link">
                Already have an account? Sign in
              </Link>
              <p className="home-hero__sub mb-3 mt-3">Registered users: open your role workspace below (sign-in may be required).</p>
              <div className="home-hero__actions">
                <Button variant="outline-light" size="sm" as={Link} to="/patient-dashboard">
                  <HeartPulse className="me-1" aria-hidden />
                  Patient space
                </Button>
                <Button variant="outline-light" size="sm" as={Link} to="/clinician-dashboard">
                  Clinician space
                </Button>
                <Button variant="outline-light" size="sm" as={Link} to="/vendor-dashboard">
                  <ShopWindow className="me-1" aria-hidden />
                  Vendor space
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
        </Container>
      </section>

      <section className="home-section home-section--muted" aria-labelledby="home-how-title">
        <Container>
          <header className="home-section__head">
            <p className="home-section__kicker">How it works</p>
            <h2 id="home-how-title" className="home-section__title">
              From profile to fitting in three steps
            </h2>
            <p className="home-section__desc">
              Patients share context, clinicians enrich the medical picture, and vendors match real equipment to real
              needs.
            </p>
          </header>

          <Row className="g-4 align-items-stretch justify-content-center">
            <Col xs={12} md>
              <article className="home-step">
                <div className="home-step__num" aria-hidden>
                  1
                </div>
                <img src={patient} alt="" />
                <h3>Patient</h3>
                <p>Enters profile, preferences, and mobility context.</p>
              </article>
            </Col>
            <Col xs="auto" className="d-none d-md-flex align-items-center text-muted px-0">
              <ArrowRight size={28} aria-hidden />
            </Col>
            <Col xs={12} md>
              <article className="home-step">
                <div className="home-step__num" aria-hidden>
                  2
                </div>
                <img src={clinician} alt="" />
                <h3>Clinician</h3>
                <p>Adds clinical input so recommendations stay safe and relevant.</p>
              </article>
            </Col>
            <Col xs="auto" className="d-none d-md-flex align-items-center text-muted px-0">
              <ArrowRight size={28} aria-hidden />
            </Col>
            <Col xs={12} md>
              <article className="home-step">
                <div className="home-step__num" aria-hidden>
                  3
                </div>
                <img src={vendor} alt="" />
                <h3>Vendor</h3>
                <p>Proposes equipment, trials, and follow-up tailored to the case.</p>
              </article>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home-section" aria-labelledby="home-roles-title">
        <Container>
          <header className="home-section__head">
            <p className="home-section__kicker">Who is it for?</p>
            <h2 id="home-roles-title" className="home-section__title">
              Built for everyone in the mobility journey
            </h2>
            <p className="home-section__desc">Flip each card to see how Wheel Match supports that role.</p>
          </header>

          <p className="home-flip-hint">Click a card to flip · Click again to return</p>

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
                  <h2>Patient</h2>
                  <span className="home-flip-badge">Details</span>
                </button>
                <button
                  type="button"
                  className="home-flip-face home-flip-face--back"
                  onClick={() => setIsFlippedP(false)}
                  aria-expanded={isFlippedP}
                >
                  <p>
                    Find the wheelchair that best suits your physical condition, lifestyle, and preferences. Simple
                    onboarding and results you can act on.
                  </p>
                  <span className="home-flip-badge">Tap to go back</span>
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
                  <img src={clinician} alt="" />
                  <h2>Clinician</h2>
                  <span className="home-flip-badge">Details</span>
                </button>
                <button
                  type="button"
                  className="home-flip-face home-flip-face--back"
                  onClick={() => setIsFlippedC(false)}
                  aria-expanded={isFlippedC}
                >
                  <p>
                    Support patients with structured medical context and assessments. Stay aligned with vendors so
                    fittings stay clinically sound.
                  </p>
                  <span className="home-flip-badge">Tap to go back</span>
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
                  <h2>Vendor</h2>
                  <span className="home-flip-badge">Details</span>
                </button>
                <button
                  type="button"
                  className="home-flip-face home-flip-face--back"
                  onClick={() => setIsFlippedV(false)}
                  aria-expanded={isFlippedV}
                >
                  <p>
                    Receive better-qualified context from patients and clinicians. Plan trials, stock, and follow-up
                    from one place.
                  </p>
                  <span className="home-flip-badge">Tap to go back</span>
                </button>
              </ReactCardFlip>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Home;
