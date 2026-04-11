import React from 'react';
import { motion } from 'framer-motion'; // For animations
import styled from 'styled-components'; // Optional for CSS-in-JS

// Styled component (optional)
const ArrowButtonStyled = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px; 
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const ArrowIcon = ({ direction = 'right' }) => {
  const rotation = {
    right: 0,
    left: 180,
    up: -90,
    down: 90
  };

  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotation[direction]}deg)` }}
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="black" // Teal color (matches WheelMatch brand)
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

function ArrowButton({ 
  direction = 'right', 
  onClick, 
  ariaLabel 
}) {
  return (
    <ArrowButtonStyled
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowIcon direction={direction} />
    </ArrowButtonStyled>
  );
}

export default ArrowButton;