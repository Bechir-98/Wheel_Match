import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import Button from '../components/common/Button';
import theme from '../styles/theme';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing[8]};
  background-color: ${theme.colors.background.light};
`;

const Title = styled(motion.h1)`
  font-size: ${theme.typography.fontSize['4xl']};
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['5xl']};
  }
`;

const Subtitle = styled(motion.h3)`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.neutral[600]};
  margin-bottom: ${theme.spacing[8]};
  max-width: 600px;
`;

const WcPage = () => {
  return (
    <Container>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to Wheel Match
      </Title>
      <Subtitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        The home of wheelchairs where you find your match.
      </Subtitle>
      <Button
        variant="primary"
        size="lg"
        icon={<FaArrowRight />}
        iconPosition="right"
      >
        Get Started
      </Button>
    </Container>
  );
};

export default WcPage;