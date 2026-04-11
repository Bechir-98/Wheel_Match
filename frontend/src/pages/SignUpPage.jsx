import React from 'react';
import styled from 'styled-components';
import SignUpForm from '../components/auth/SignUpForm';
import theme from '../styles/theme';

const PageContainer = styled.div`
  min-height: calc(100vh - 76px); /* Account for navbar */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.neutral[100]};
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
`;

const SignUpPage = () => {
  return (
    <PageContainer>
      <SignUpForm />
    </PageContainer>
  );
};

export default SignUpPage;