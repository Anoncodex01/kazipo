import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick
}) => {
  const baseStyles = 'bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700';
  const hoverStyles = hoverable ? 'cursor-pointer transition-all duration-200' : '';
  
  return (
    <motion.div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      whileHover={hoverable ? { y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default Card;