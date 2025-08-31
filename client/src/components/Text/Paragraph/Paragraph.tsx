import React from 'react';
import './Paragraph.sass';

interface ParagraphProps {
    children: React.ReactNode;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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

const getSizeClass = (size: string | undefined) => {
    switch (size) {
        case 'xs':
            return 'text-xs';
        case 'sm':
            return 'text-sm';
        case 'md':
            return 'text-md';
        case 'lg':
            return 'text-lg';
        case 'xl':
            return 'text-xl';
        default:
            return 'text-md';
    }
};

export const Paragraph: React.FC<ParagraphProps> = ({ children, className, variant, size }) => (
    <p className={`${getColorClass(variant)} ${getSizeClass(size)} ${className}`}>{children}</p>
);