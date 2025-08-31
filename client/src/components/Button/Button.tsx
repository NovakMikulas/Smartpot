import React, { ReactNode } from 'react'
import './Button.sass'

interface ButtonProps {
    onClick?: () => void
    className?: string
    children: ReactNode
    variant?: 'default' | 'warning' | 'success' | 'text'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    className = '',
    children,
    variant = 'default',
    disabled = false,
    type = 'button',
}) => {
    return (
        <button
            type={type}
            className={`button ${variant} ${className} ${disabled ? 'disabled' : ''}`}
            onClick={onClick}
            disabled={disabled}>
            {children}
        </button>
    )
}

export default Button
