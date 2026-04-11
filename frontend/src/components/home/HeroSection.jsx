import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaWheelchair } from 'react-icons/fa';
import theme from '../../styles/theme';
import Button from '../common/Button';

// Hero container with background image
const HeroContainer = styled.section`
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1618498082410-b4aa22193b38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80');
    background-size: cover;
    background-position: center;
    filter: brightness(0.6);
    z-index: -1;
  }
`;

// Content container
const HeroContent = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: ${theme.spacing[4]};
  color: ${theme.colors.white};
  text-align: center;
  z-index: 1;
  
  @media (min-width: ${theme.breakpoints.md}) {
    text-align: left;
    padding: ${theme.spacing[8]};
  }
`;

// Hero grid
const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[8]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

// Text container
const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// Hero heading
const HeroHeading = styled(motion.h1)`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[4]};
  line-height: 1.1;
  
  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['5xl']};
  }
`;

// Hero subheading
const HeroSubheading = styled(motion.p)`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.normal};
  margin-bottom: ${theme.spacing[6]};
  line-height: ${theme.typography.lineHeight.normal};
  opacity: 0.9;
  
  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

// Button container
const ButtonContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    flex-direction: row;
  }
`;

// Image container
const ImageContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 3D Wheelchair illustration
const Wheelchair3D = styled(motion.div)`
  width: 300px;
  height: 300px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  svg {
    font-size: 120px;
    color: ${theme.colors.white};
  }
  
  @media (min-width: ${theme.breakpoints.md}) {
    width: 400px;
    height: 400px;
    
    svg {
      font-size: 160px;
    }
  }
`;

// Stats container
const StatsContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[8]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    justify-content: flex-start;
  }
`;

// Stat item
const StatItem = styled(motion.div)`
  text-align: center;
  
  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.white};
    margin-bottom: ${theme.spacing[1]};
  }
  
  p {
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.white};
    opacity: 0.8;
  }
`;

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
  
  const wheelchairVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.5
      }
    },
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };
  
  const statsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.8,
        staggerChildren: 0.2
      }
    }
  };
  
  const statItemVariants = {
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
  
  return (
    <HeroContainer>
      <HeroContent>
        <HeroGrid
          as={motion.div}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <TextContainer>
            <HeroHeading variants={itemVariants}>
              Find Your Perfect Wheelchair Match
            </HeroHeading>
            <HeroSubheading variants={itemVariants}>
              We connect you with the right wheelchair that fits your unique needs, lifestyle, and preferences. Experience mobility freedom like never before.
            </HeroSubheading>
            <ButtonContainer variants={itemVariants}>
              <Button 
                size="lg" 
                variant="primary"
                icon={<FaArrowRight />}
                iconPosition="right"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleLearnMore}
              >
                Learn More
              </Button>
            </ButtonContainer>
            
            <StatsContainer variants={statsVariants}>
              <StatItem variants={statItemVariants}>
                <h3>5000+</h3>
                <p>Happy Users</p>
              </StatItem>
              <StatItem variants={statItemVariants}>
                <h3>200+</h3>
                <p>Wheelchair Models</p>
              </StatItem>
              <StatItem variants={statItemVariants}>
                <h3>98%</h3>
                <p>Match Success</p>
              </StatItem>
            </StatsContainer>
          </TextContainer>
          
          <ImageContainer>
            <Wheelchair3D
              variants={wheelchairVariants}
              whileHover="hover"
            >
              <FaWheelchair />
            </Wheelchair3D>
          </ImageContainer>
        </HeroGrid>
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;