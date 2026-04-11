import React, { useEffect } from 'react';
import brand from '../assets/brand.png';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, authHeaders } from '../config/api.js';

function displayNameFromProfile(p) {
  if (!p || typeof p !== 'object') return '';
  const t = String(p.type || '').toLowerCase();
  if (t === 'patient') {
    const s = `${p.PRENOMP || ''} ${p.NOMP || ''}`.trim();
    return s || (p.EMAIL || '').split('@')[0] || '';
  }
  if (t === 'clinician') {
    const s = `${p.PRENOMC || ''} ${p.NOMC || ''}`.trim();
    return s || (p.EMAIL || '').split('@')[0] || '';
  }
  if (t === 'vendor') {
    return (p.NOM_MARCHAND || '').trim() || (p.EMAIL || '').split('@')[0] || '';
  }
  return (p.EMAIL || '').split('@')[0] || '';
}

function Navb() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, refreshSession } = useAuth();

  const scrollToFooter = (e) => {
    e.preventDefault();
    const footer = document.getElementById('about');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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
      <Navbar
        bg="dark"
        data-bs-theme="dark"
        fixed="top"
        expand="lg"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      >
        <Container fluid style={{ padding: '0 20px' }}>
          <Navbar.Brand as={Link} to="/" style={{ marginRight: 'auto' }} onClick={scrollToTop}>
            <img
              src={brand}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Wheel Match Logo"
              loading="lazy"
            />
            <span style={{ marginLeft: '10px' }}>Wheel Match</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="border-0" />

          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link
                as={Link}
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
                onClick={scrollToTop}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/wheelchairs"
                className={location.pathname === '/wheelchairs' ? 'active' : ''}
                onClick={scrollToTop}
              >
                Wheelchairs
              </Nav.Link>
              <Nav.Link as={Link} to="/faq" onClick={scrollToTop}>
                FAQ
              </Nav.Link>
              <Nav.Link
                href="#about"
                onClick={(e) => {
                  scrollToTop();
                  scrollToFooter(e);
                }}
              >
                About
              </Nav.Link>
            </Nav>

            <Nav className="ms-lg-auto align-items-lg-center flex-column flex-lg-row py-2 py-lg-0">
              {!isAuthenticated ? (
                <>
                  <Nav.Link
                    as={Link}
                    to="/log"
                    className={location.pathname === '/log' ? 'active' : ''}
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={scrollToTop}
                  >
                    Sign in
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/sign"
                    className={location.pathname === '/sign' ? 'active' : ''}
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={scrollToTop}
                  >
                    Sign up
                  </Nav.Link>
                </>
              ) : (
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-1">
                      <PersonCircle className="flex-shrink-0" aria-hidden />
                      <span className="text-truncate" style={{ maxWidth: '12rem' }}>
                        {menuTitle}
                      </span>
                    </span>
                  }
                  id="nav-profile-dropdown"
                  align="end"
                  menuVariant="dark"
                  className="w-100 w-lg-auto"
                >
                  <NavDropdown.Item as={Link} to="/profile" onClick={scrollToTop}>
                    My profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings" onClick={scrollToTop}>
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as="button" type="button" className="text-danger" onClick={handleLogout}>
                    Log out
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ paddingTop: '70px' }} />
    </>
  );
}

export default Navb;
