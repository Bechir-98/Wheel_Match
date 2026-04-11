import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaWheelchair, FaHandshake, FaUserMd, FaChartLine } from 'react-icons/fa';
import theme from '../../styles/theme';
import Card from '../common/Card';

// Section container
const SectionContainer = styled.section`
  padding: ${theme.spacing[16]} ${theme.spacing[4]};
  background-color: ${theme.colors.background.light};
  
  @media (min-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[20]} ${theme.spacing[8]};
  }
`;

// Section heading container
const HeadingContainer = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto ${theme.spacing[12]};
`;

// Section title
const SectionTitle = styled(motion.h2)`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.neutral[900]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['4xl']};
  }
`;

// Section subtitle
const SectionSubtitle = styled(motion.p)`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.neutral[600]};
  max-width: 600px;
  margin: 0 auto;
  
  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

// Features grid
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;

// Feature card
const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing[6]};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Feature icon container
const IconContainer = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
  background-color: ${props => props.bgColor || theme.colors.primary[50]};
  color: ${props => props.iconColor || theme.colors.primary[500]};
  font-size: ${theme.typography.fontSize['3xl']};
`;

// Feature title
const FeatureTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[3]};
  color: ${theme.colors.neutral[900]};
`;

// Feature description
const FeatureDescription = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[600]};
  line-height: ${theme.typography.lineHeight.normal};
`;

const FeaturesSection = () => {
  // Features data
  const features = [
    {
      icon: <FaWheelchair />,
      title: "Perfect Wheelchair Match",
      description: "Our algorithm analyzes your needs and preferences to find the perfect wheelchair that fits your lifestyle.",
      iconColor: theme.colors.primary[500],
      bgColor: theme.colors.primary[50]
    },
    {
      icon: <FaUserMd />,
      title: "Expert Consultation",
      description: "Connect with healthcare professionals who specialize in mobility solutions and wheelchair fittings.",
      iconColor: theme.colors.secondary[500],
      bgColor: theme.colors.secondary[50]
    },
    {
      icon: <FaHandshake />,
      title: "Vendor Partnerships",
      description: "We partner with trusted wheelchair vendors to provide you with quality options and competitive pricing.",
      iconColor: theme.colors.accent[500],
      bgColor: theme.colors.accent[50]
    },
    {
      icon: <FaChartLine />,
      title: "Continuous Support",
      description: "Track your progress, schedule maintenance, and receive ongoing support for your mobility journey.",
      iconColor: theme.colors.success.main,
      bgColor: theme.colors.success.light
    }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };
  
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      rotate: 15,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <SectionContainer>
      <HeadingContainer
        as={motion.div}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <SectionTitle variants={itemVariants}>
          How Wheel Match Works
        </SectionTitle>
        <SectionSubtitle variants={itemVariants}>
          Our platform combines expertise, technology, and personalization to find the perfect mobility solution for you.
        </SectionSubtitle>
      </HeadingContainer>
      
      <FeaturesGrid
        as={motion.div}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
          >
            <FeatureCard>
              <IconContainer
                as={motion.div}
                variants={iconVariants}
                whileHover="hover"
                bgColor={feature.bgColor}
                iconColor={feature.iconColor}
              >
                {feature.icon}
              </IconContainer>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          </motion.div>
        ))}
      </FeaturesGrid>
    </SectionContainer>
  );
};

export default FeaturesSection;