import React, { ReactNode } from 'react'
import './GradientDiv.sass'

interface GradientDivProps {
    children: ReactNode
    className?: string
    onClick?: () => void
}

const GradientDiv: React.FC<GradientDivProps> = ({ children, className = '', onClick }) => {
    return (
        <div className={`gradient-container ${className}`} onClick={onClick}>
            {children}
        </div>
    )
}

export default GradientDiv
