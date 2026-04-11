import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import theme from '../../styles/theme';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing[4]};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.neutral[700]};
  margin-bottom: ${theme.spacing[2]};
`;

const StyledInput = styled(motion.input)`
  font-size: ${theme.typography.fontSize.md};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${props => 
    props.error 
      ? theme.colors.error.main 
      : props.focus 
        ? theme.colors.primary[500]
        : theme.colors.neutral[300]
  };
  outline: none;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  width: 100%;
  box-shadow: ${props => props.focus ? theme.shadows.sm : 'none'};
  background-color: ${theme.colors.white};
  
  &:hover {
    border-color: ${props => 
      props.error 
        ? theme.colors.error.main 
        : theme.colors.primary[400]
    };
  }
  
  &:focus {
    border-color: ${props => 
      props.error 
        ? theme.colors.error.main 
        : theme.colors.primary[500]
    };
    box-shadow: ${theme.shadows.sm};
  }
  
  &:disabled {
    background-color: ${theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: ${theme.colors.neutral[400]};
  }
`;

const HelperText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing[1]};
  color: ${props => 
    props.error 
      ? theme.colors.error.main 
      : theme.colors.neutral[500]
  };
`;

const Input = forwardRef(({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  helperText,
  error = false,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [focus, setFocus] = React.useState(false);

  // Animations for input focus
  const inputVariants = {
    focus: { 
      scale: 1.01,
      transition: { duration: 0.2 }
    },
    blur: { 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span style={{ color: theme.colors.error.main }}> *</span>}
        </Label>
      )}
      
      <StyledInput
        as={motion.input}
        id={id}
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={(e) => {
          setFocus(false);
          if (onBlur) onBlur(e);
        }}
        animate={focus ? "focus" : "blur"}
        variants={inputVariants}
        error={error}
        focus={focus}
        disabled={disabled}
        required={required}
        {...props}
      />
      
      {helperText && (
        <HelperText error={error}>
          {helperText}
        </HelperText>
      )}
    </InputWrapper>
  );
});

Input.displayName = 'Input';

export default Input;