import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import theme from '../../styles/theme';

// Button variants
const VARIANTS = {
  primary: {
    background: theme.colors.primary[500],
    color: theme.colors.white,
    hoverBg: theme.colors.primary[600],
    activeBg: theme.colors.primary[700]
  },
  secondary: {
    background: theme.colors.secondary[500],
    color: theme.colors.white,
    hoverBg: theme.colors.secondary[600],
    activeBg: theme.colors.secondary[700]
  },
  accent: {
    background: theme.colors.accent[500],
    color: theme.colors.white,
    hoverBg: theme.colors.accent[600],
    activeBg: theme.colors.accent[700]
  },
  success: {
    background: theme.colors.success.main,
    color: theme.colors.white,
    hoverBg: theme.colors.success.dark,
    activeBg: theme.colors.success.dark
  },
  warning: {
    background: theme.colors.warning.main,
    color: theme.colors.white,
    hoverBg: theme.colors.warning.dark,
    activeBg: theme.colors.warning.dark
  },
  error: {
    background: theme.colors.error.main,
    color: theme.colors.white,
    hoverBg: theme.colors.error.dark,
    activeBg: theme.colors.error.dark
  },
  outline: {
    background: 'transparent',
    color: theme.colors.primary[500],
    border: `2px solid ${theme.colors.primary[500]}`,
    hoverBg: theme.colors.primary[50],
    activeBg: theme.colors.primary[100]
  },
  text: {
    background: 'transparent',
    color: theme.colors.primary[500],
    hoverBg: theme.colors.primary[50],
    activeBg: theme.colors.primary[100]
  }
};

// Button sizes
const SIZES = {
  xs: {
    fontSize: theme.typography.fontSize.xs,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.sm
  },
  sm: {
    fontSize: theme.typography.fontSize.sm,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.sm
  },
  md: {
    fontSize: theme.typography.fontSize.md,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: theme.borderRadius.md
  },
  lg: {
    fontSize: theme.typography.fontSize.lg,
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    borderRadius: theme.borderRadius.md
  },
  xl: {
    fontSize: theme.typography.fontSize.xl,
    padding: `${theme.spacing[5]} ${theme.spacing[8]}`,
    borderRadius: theme.borderRadius.lg
  }
};

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  position: relative;
  overflow: hidden;
  
  /* Size styles */
  font-size: ${props => SIZES[props.size].fontSize};
  padding: ${props => SIZES[props.size].padding};
  border-radius: ${props => SIZES[props.size].borderRadius};
  
  /* Variant styles */
  background-color: ${props => VARIANTS[props.variant].background};
  color: ${props => VARIANTS[props.variant].color};
  border: ${props => VARIANTS[props.variant].border || 'none'};
  
  /* Full width */
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  /* Interaction states */
  &:hover {
    background-color: ${props => VARIANTS[props.variant].hoverBg};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    background-color: ${props => VARIANTS[props.variant].activeBg};
    transform: translateY(0);
    box-shadow: ${theme.shadows.sm};
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Icon spacing */
  svg {
    margin-right: ${props => props.iconPosition === 'left' ? theme.spacing[2] : 0};
    margin-left: ${props => props.iconPosition === 'right' ? theme.spacing[2] : 0};
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  onClick = () => {},
  ...props
}) => {
  // Animation for button
  const buttonVariants = {
    hover: { 
      scale: 1.03,
      transition: { 
        duration: 0.2, 
        ease: "easeInOut" 
      }
    },
    tap: { 
      scale: 0.97,
      transition: { 
        duration: 0.1, 
        ease: "easeInOut" 
      }
    }
  };
  
  return (
    <StyledButton
      as={motion.button}
      variant={variant}
      size={size}
      type={type}
      fullWidth={fullWidth}
      disabled={disabled}
      iconPosition={iconPosition}
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </StyledButton>
  );
};

export default Button;