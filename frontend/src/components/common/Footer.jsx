import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaWheelchair, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import theme from '../../styles/theme';

// Footer container
const FooterContainer = styled.footer`
  background-color: ${theme.colors.neutral[900]};
  color: ${theme.colors.white};
  padding: ${theme.spacing[12]} ${theme.spacing[4]} ${theme.spacing[6]};
`;

// Footer content wrapper
const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Top section with grid layout
const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[8]};
  margin-bottom: ${theme.spacing[8]};
  border-bottom: 1px solid ${theme.colors.neutral[700]};
  padding-bottom: ${theme.spacing[8]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
`;

// About section
const AboutSection = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

// Logo container
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
`;

// Logo icon
const LogoIcon = styled(FaWheelchair)`
  margin-right: ${theme.spacing[2]};
  color: ${theme.colors.primary[500]};
`;

// Footer description
const Description = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[400]};
  margin-bottom: ${theme.spacing[4]};
  line-height: ${theme.typography.lineHeight.normal};
`;

// Social media container
const SocialContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
`;

// Social link
const SocialLink = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.neutral[800]};
  color: ${theme.colors.white};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  
  &:hover {
    background-color: ${theme.colors.primary[500]};
    transform: translateY(-3px);
  }
`;

// Footer column
const Column = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

// Column title
const ColumnTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.white};
`;

// Link list
const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Link item
const LinkItem = styled.li`
  margin-bottom: ${theme.spacing[2]};
`;

// Footer link
const FooterLink = styled.a`
  color: ${theme.colors.neutral[400]};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.md};
  transition: color ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  
  &:hover {
    color: ${theme.colors.primary[400]};
  }
`;

// Contact item
const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[3]};
  
  svg {
    margin-right: ${theme.spacing[2]};
    color: ${theme.colors.primary[400]};
    margin-top: 4px;
  }
  
  p {
    color: ${theme.colors.neutral[400]};
    font-size: ${theme.typography.fontSize.md};
  }
`;

// Bottom section
const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
`;

// Copyright text
const Copyright = styled.p`
  color: ${theme.colors.neutral[500]};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[3]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    margin-bottom: 0;
  }
`;

// Terms links
const TermsLinks = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
`;

// Terms link
const TermsLink = styled.a`
  color: ${theme.colors.neutral[500]};
  font-size: ${theme.typography.fontSize.sm};
  text-decoration: none;
  transition: color ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  
  &:hover {
    color: ${theme.colors.primary[400]};
  }
`;

const Footer = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  const socialVariants = {
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <FooterContainer>
      <FooterContent
        as={motion.div}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <TopSection>
          <AboutSection as={motion.div} variants={itemVariants}>
            <LogoContainer>
              <LogoIcon />
              <span>WheelMatch</span>
            </LogoContainer>
            <Description>
              WheelMatch is dedicated to helping individuals find the perfect wheelchair match for their unique needs. We connect patients, clinicians, and vendors to create the best mobility solutions.
            </Description>
            <SocialContainer>
              <SocialLink 
                href="#" 
                as={motion.a}
                variants={socialVariants}
                whileHover="hover"
              >
                <FaFacebook />
              </SocialLink>
              <SocialLink 
                href="#" 
                as={motion.a}
                variants={socialVariants}
                whileHover="hover"
              >
                <FaTwitter />
              </SocialLink>
              <SocialLink 
                href="#" 
                as={motion.a}
                variants={socialVariants}
                whileHover="hover"
              >
                <FaInstagram />
              </SocialLink>
              <SocialLink 
                href="#" 
                as={motion.a}
                variants={socialVariants}
                whileHover="hover"
              >
                <FaLinkedin />
              </SocialLink>
            </SocialContainer>
          </AboutSection>
          
          <Column as={motion.div} variants={itemVariants}>
            <ColumnTitle>Quick Links</ColumnTitle>
            <LinkList>
              <LinkItem>
                <FooterLink href="/">Home</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="/wheelchairs">Wheelchairs</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="/pricing">Pricing</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="/about">About Us</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="/contact">Contact</FooterLink>
              </LinkItem>
            </LinkList>
          </Column>
          
          <Column as={motion.div} variants={itemVariants}>
            <ColumnTitle>Resources</ColumnTitle>
            <LinkList>
              <LinkItem>
                <FooterLink href="#">Wheelchair Guide</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="#">Accessories</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="#">Maintenance Tips</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="#">Blog</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink href="#">FAQs</FooterLink>
              </LinkItem>
            </LinkList>
          </Column>
          
          <Column as={motion.div} variants={itemVariants}>
            <ColumnTitle>Contact Us</ColumnTitle>
            <ContactItem>
              <FaMapMarkerAlt />
              <p>123 Mobility Street, Suite 100<br />San Francisco, CA 94103</p>
            </ContactItem>
            <ContactItem>
              <FaPhone />
              <p>+1 (555) 123-4567</p>
            </ContactItem>
            <ContactItem>
              <FaEnvelope />
              <p>info@wheelmatch.com</p>
            </ContactItem>
          </Column>
        </TopSection>
        
        <BottomSection as={motion.div} variants={itemVariants}>
          <Copyright>
            &copy; {new Date().getFullYear()} WheelMatch. All rights reserved.
          </Copyright>
          <TermsLinks>
            <TermsLink href="#">Privacy Policy</TermsLink>
            <TermsLink href="#">Terms of Service</TermsLink>
            <TermsLink href="#">Accessibility</TermsLink>
          </TermsLinks>
        </BottomSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;