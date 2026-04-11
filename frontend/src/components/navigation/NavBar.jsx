import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaWheelchair, FaUserCircle } from 'react-icons/fa';
import theme from '../../styles/theme';
import Button from '../common/Button';

// Navbar Container
const NavContainer = styled(motion.nav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background-color: ${props => props.isScrolled ? theme.colors.white : 'transparent'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.default};
  box-shadow: ${props => props.isScrolled ? theme.shadows.md : 'none'};

  @media (min-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[4]} ${theme.spacing[6]};
  }
`;

// Logo Container
const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
  color: ${props => props.isScrolled ? theme.colors.primary[500] : theme.colors.white};
  transition: color ${theme.transitions.duration.normal} ${theme.transitions.easing.default};
`;

// Logo Icon
const LogoIcon = styled(FaWheelchair)`
  margin-right: ${theme.spacing[2]};
  color: ${theme.colors.primary[500]};
`;

// Links Container (Desktop)
const LinksContainer = styled.div`
  display: none;
  
  @media (min-width: ${theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[6]};
  }
`;

// Nav Link
const NavLink = styled(motion(Link))`
  color: ${props => props.isactive === 'true' 
    ? theme.colors.primary[500] 
    : props.isscrolled === 'true' 
      ? theme.colors.neutral[800]
      : theme.colors.white};
  text-decoration: none;
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.md};
  padding: ${theme.spacing[2]};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.isactive === 'true' ? '100%' : '0%'};
    height: 2px;
    background-color: ${theme.colors.primary[500]};
    transition: width ${theme.transitions.duration.normal} ${theme.transitions.easing.default};
  }
  
  &:hover::after {
    width: 100%;
  }
`;

// Mobile Menu Button
const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.isscrolled === 'true' ? theme.colors.neutral[800] : theme.colors.white};
  font-size: ${theme.typography.fontSize['2xl']};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  
  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

// Mobile Menu
const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.colors.white};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[6]};
`;

// Mobile Menu Links
const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[10]};
`;

// Mobile Nav Link
const MobileNavLink = styled(Link)`
  color: ${theme.colors.neutral[800]};
  text-decoration: none;
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.xl};
  
  &.active {
    color: ${theme.colors.primary[500]};
  }
`;

// Auth Buttons Container
const AuthButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
`;

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current path matches link path
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const logoVariants = {
    hover: { 
      scale: 1.1,
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        yoyo: Infinity
      }
    }
  };
  
  const linkVariants = {
    hover: { 
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };
  
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };
  
  const mobileNavLinkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
    
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [mobileMenuOpen]);

  const handleSignUp = () => {
    navigate('/signup');
    setMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/signin');
    setMobileMenuOpen(false);
  };
  
  return (
    <>
      <NavContainer
        initial="hidden"
        animate="visible"
        variants={navVariants}
        isScrolled={isScrolled}
      >
        <LogoContainer
          as={motion.div}
          whileHover="hover"
          variants={logoVariants}
          isScrolled={isScrolled}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <LogoIcon />
            <span>WheelMatch</span>
          </Link>
        </LogoContainer>
        
        <LinksContainer>
          <NavLink 
            to="/" 
            isactive={isActive('/') ? 'true' : 'false'}
            isscrolled={isScrolled ? 'true' : 'false'}
            whileHover="hover"
            variants={linkVariants}
          >
            Home
          </NavLink>
          <NavLink 
            to="/wheelchairs" 
            isactive={isActive('/wheelchairs') ? 'true' : 'false'}
            isscrolled={isScrolled ? 'true' : 'false'}
            whileHover="hover"
            variants={linkVariants}
          >
            Wheelchairs
          </NavLink>
          <NavLink 
            to="/faq" 
            isactive={isActive('/faq') ? 'true' : 'false'}
            isscrolled={isScrolled ? 'true' : 'false'}
            whileHover="hover"
            variants={linkVariants}
          >
            FAQ
          </NavLink>
          <NavLink 
            to="/about" 
            isactive={isActive('/about') ? 'true' : 'false'}
            isscrolled={isScrolled ? 'true' : 'false'}
            whileHover="hover"
            variants={linkVariants}
          >
            About
          </NavLink>
          
          <AuthButtonsContainer>
            <Button 
              variant="text" 
              size="sm"
              onClick={handleSignIn}
              icon={<FaUserCircle />}
              iconPosition="left"
            >
              Sign In
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          </AuthButtonsContainer>
        </LinksContainer>
        
        <MenuButton 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          isscrolled={isScrolled ? 'true' : 'false'}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </MenuButton>
      </NavContainer>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            <MobileNavLinks>
              {[
                { path: '/', name: 'Home' },
                { path: '/wheelchairs', name: 'Wheelchairs' },
                { path: '/faq', name: 'Faq' },
                { path: '/about', name: 'About' }
              ].map((link, i) => (
                <motion.div
                  key={link.path}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={mobileNavLinkVariants}
                >
                  <MobileNavLink 
                    to={link.path}
                    className={isActive(link.path) ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </MobileNavLink>
                </motion.div>
              ))}
            </MobileNavLinks>
            
            <AuthButtonsContainer>
              <Button 
                variant="outline" 
                size="md"
                onClick={handleSignIn}
                style={{ marginRight: theme.spacing[3] }}
              >
                Sign In
              </Button>
              <Button 
                variant="primary" 
                size="md"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </AuthButtonsContainer>
          </MobileMenu>
        )}
      </AnimatePresence>
      
      <div style={{ height: isScrolled ? '72px' : '76px' }} />
    </>
  );
};

export default NavBar;