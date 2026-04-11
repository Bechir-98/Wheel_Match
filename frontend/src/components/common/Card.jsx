import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import theme from '../../styles/theme';

// Card variants
const VARIANTS = {
  default: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    shadow: theme.shadows.md
  },
  elevated: {
    background: theme.colors.white,
    border: 'none',
    shadow: theme.shadows.lg
  },
  flat: {
    background: theme.colors.neutral[100],
    border: 'none',
    shadow: 'none'
  },
  outlined: {
    background: theme.colors.white,
    border: `2px solid ${theme.colors.primary[500]}`,
    shadow: 'none'
  }
};

const StyledCard = styled(motion.div)`
  background-color: ${props => VARIANTS[props.variant].background};
  border: ${props => VARIANTS[props.variant].border};
  box-shadow: ${props => VARIANTS[props.variant].shadow};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  width: 100%;
  
  /* Interactive card */
  cursor: ${props => props.interactive ? 'pointer' : 'default'};
  
  /* Padding for content, header, and footer */
  .card-header {
    padding: ${theme.spacing[4]};
    border-bottom: 1px solid ${theme.colors.neutral[200]};
    font-weight: ${theme.typography.fontWeight.semibold};
  }
  
  .card-content {
    padding: ${theme.spacing[4]};
  }
  
  .card-footer {
    padding: ${theme.spacing[4]};
    border-top: 1px solid ${theme.colors.neutral[200]};
  }
`;

const Card = ({
  children,
  variant = 'default',
  interactive = false,
  header = null,
  footer = null,
  onClick = () => {},
  ...props
}) => {
  // Animation variants
  const cardVariants = {
    hover: interactive ? { 
      y: -4,
      boxShadow: theme.shadows.xl,
      transition: {
        y: { duration: 0.2, ease: "easeOut" },
        boxShadow: { duration: 0.2, ease: "easeOut" }
      }
    } : {},
    tap: interactive ? { 
      y: -2,
      boxShadow: theme.shadows.md,
      transition: {
        y: { duration: 0.1, ease: "easeOut" },
        boxShadow: { duration: 0.1, ease: "easeOut" }
      }
    } : {}
  };

  return (
    <StyledCard
      as={motion.div}
      variant={variant}
      interactive={interactive}
      onClick={interactive ? onClick : undefined}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </StyledCard>
  );
};

export default Card;