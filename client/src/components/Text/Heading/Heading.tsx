import React from 'react';
import './Heading.sass';

interface HeadingProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'warning' | 'success';
}

const getColorClass = (variant: string | undefined) => {
    switch (variant) {
        case 'primary':
            return 'primary-text';
        case 'secondary':
            return 'secondary-text';
        case 'warning':
            return 'warning-text';
        case 'success':
            return 'success-text';
        default:
            return 'primary-text';
    }
};

export const H1: React.FC<HeadingProps> = ({ children, className, variant }) => (
    <h1 className={`h1 ${getColorClass(variant)} ${className}`}>{children}</h1>
);

export const H2: React.FC<HeadingProps> = ({ children, className, variant }) => (
    <h2 className={`h2 ${getColorClass(variant)} ${className}`}>{children}</h2>
);

export const H3: React.FC<HeadingProps> = ({ children, className, variant }) => (
    <h3 className={`h3 ${getColorClass(variant)} ${className}`}>{children}</h3>
);

export const H4: React.FC<HeadingProps> = ({ children, className, variant }) => (
    <h4 className={`h4 ${getColorClass(variant)} ${className}`}>{children}</h4>
);

export const H5: React.FC<HeadingProps> = ({ children, className, variant }) => (
    <h5 className={`h5 ${getColorClass(variant)} ${className}`}>{children}</h5>
);

export const H6: React.FC<HeadingProps> = ({ children, className, variant }) => (
    <h6 className={`h6 ${getColorClass(variant)} ${className}`}>{children}</h6>
);
