import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaUserMd } from 'react-icons/fa';
import theme from '../../styles/theme';
import Button from '../common/Button';
import Input from '../common/Input';

// Form container
const FormContainer = styled(motion.div)`
  max-width: 500px;
  width: 100%;
  padding: ${theme.spacing[8]};
  margin: 0 auto;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
`;

// Form header
const FormHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[6]};
`;

// Avatar container
const AvatarContainer = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]};
  color: ${theme.colors.primary[500]};
  font-size: ${theme.typography.fontSize['3xl']};
`;

// Form title
const FormTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.neutral[900]};
  margin-bottom: ${theme.spacing[2]};
`;

// Form subtitle
const FormSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.neutral[600]};
`;

// Form element
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

// Select container
const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing[4]};
  width: 100%;
`;

// Select label
const SelectLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.neutral[700]};
  margin-bottom: ${theme.spacing[2]};
`;

// Select element
const Select = styled.select`
  font-size: ${theme.typography.fontSize.md};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.neutral[300]};
  outline: none;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
  width: 100%;
  background-color: ${theme.colors.white};
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
  }
  
  &:focus {
    border-color: ${theme.colors.primary[500]};
    box-shadow: ${theme.shadows.sm};
  }
`;

// Footer text
const FooterText = styled.p`
  text-align: center;
  margin-top: ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.neutral[600]};
  
  a {
    color: ${theme.colors.primary[500]};
    font-weight: ${theme.typography.fontWeight.medium};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SignUpForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '1'
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate user registration
      const userData = {
        email: formData.email,
        role: formData.role,
      };
      
      // Store user data in context
      login(userData);
      
      // Redirect based on role
      switch (formData.role) {
        case '1':
          navigate('/patient');
          break;
        case '2':
          navigate('/clinician');
          break;
        case '4':
          navigate('/vendor');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };
  
  // Animation variants
  const containerVariants = {
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
  
  const avatarVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      rotate: 10,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <FormContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <FormHeader>
        <AvatarContainer
          variants={avatarVariants}
          whileHover="hover"
        >
          <FaUser />
        </AvatarContainer>
        <FormTitle>Create Your Account</FormTitle>
        <FormSubtitle>Join WheelMatch and find your perfect mobility solution</FormSubtitle>
      </FormHeader>
      
      <Form onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          required
          icon={<FaEnvelope />}
        />
        
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          required
          icon={<FaLock />}
        />
        
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          required
          icon={<FaLock />}
        />
        
        <SelectContainer>
          <SelectLabel htmlFor="role">
            Profession
          </SelectLabel>
          <Select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="1">Patient</option>
            <option value="2">Clinician</option>
            <option value="4">Vendor</option>
          </Select>
        </SelectContainer>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          icon={<FaUserMd />}
          iconPosition="left"
        >
          Sign Up
        </Button>
      </Form>
      
      <FooterText>
        Already have an account? <a href="/login">Sign In</a>
      </FooterText>
    </FormContainer>
  );
};

export default SignUpForm;