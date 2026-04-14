import React from 'react';
import './ui.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className = '',
  hoverable = false 
}) => {
  return (
    <div className={`glass card ${hoverable ? 'hoverable' : ''} ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
};
