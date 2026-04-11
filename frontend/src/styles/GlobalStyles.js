import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  /* Reset styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
    height: 100%;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: ${theme.typography.fontFamily};
    color: ${theme.colors.neutral[800]};
    background-color: ${theme.colors.background.light};
    line-height: ${theme.typography.lineHeight.normal};
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${theme.spacing[4]};
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    color: ${theme.colors.neutral[900]};
  }
  
  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
    
    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.fontSize['5xl']};
    }
  }
  
  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
  }
  
  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
  }
  
  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }
  
  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }
  
  h6 {
    font-size: ${theme.typography.fontSize.md};
  }
  
  p {
    margin-bottom: ${theme.spacing[4]};
  }
  
  a {
    color: ${theme.colors.primary[500]};
    text-decoration: none;
    transition: color ${theme.transitions.duration.fast} ${theme.transitions.easing.default};
    
    &:hover {
      color: ${theme.colors.primary[700]};
    }
  }
  
  /* Form elements */
  input, 
  select, 
  textarea, 
  button {
    font-family: inherit;
    font-size: inherit;
  }
  
  /* Custom classes */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing[4]};
  }
  
  /* Utility classes */
  .text-center {
    text-align: center;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Animation classes */
  .fade-in {
    animation: fadeIn ${theme.transitions.duration.normal} ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .slide-in {
    animation: slideIn ${theme.transitions.duration.normal} ${theme.transitions.easing.out};
  }
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export default GlobalStyles;