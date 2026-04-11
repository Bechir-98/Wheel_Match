import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaWheelchair, FaUsers, FaHandshake } from 'react-icons/fa';
import theme from '../styles/theme';

const PageContainer = styled.div`
  min-height: calc(100vh - 76px);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  background-color: ${theme.colors.background.light};
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled(motion.h1)`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
  color: ${theme.colors.neutral[900]};
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing[12]};
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const Text = styled.p`
  color: ${theme.colors.neutral[700]};
  line-height: ${theme.typography.lineHeight.loose};
  margin-bottom: ${theme.spacing[4]};
`;

const AboutPage = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About WheelMatch
        </Title>
        
        <Section>
          <SectionTitle>
            <FaWheelchair />
            Our Mission
          </SectionTitle>
          <Text>
            WheelMatch is dedicated to revolutionizing how people find their perfect wheelchair match. 
            We believe that mobility solutions should be personalized, accessible, and empowering.
          </Text>
        </Section>
        
        <Section>
          <SectionTitle>
            <FaUsers />
            Who We Are
          </SectionTitle>
          <Text>
            We're a team of healthcare professionals, technology experts, and accessibility advocates 
            working together to create the best possible wheelchair matching experience.
          </Text>
        </Section>
        
        <Section>
          <SectionTitle>
            <FaHandshake />
            Our Commitment
          </SectionTitle>
          <Text>
            We're committed to providing personalized mobility solutions that enhance independence 
            and quality of life. Our platform connects users with the right wheelchair through 
            advanced matching algorithms and expert guidance.
          </Text>
        </Section>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AboutPage;