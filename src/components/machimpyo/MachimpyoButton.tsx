'use client'

import { ReactNode } from 'react'

interface BtnProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

const baseStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 56,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background .2s, transform .15s',
  fontFamily: 'inherit',
  letterSpacing: '.3px',
}

const variants: Record<string, React.CSSProperties> = {
  primary: { background: '#1e3a5f', color: '#fff' },
  secondary: { background: 'transparent', color: '#5a4f42', border: '1px solid rgba(44,36,22,.12)' },
}

const sizes: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 20px', fontSize: 13 },
  md: { padding: '12px 28px', fontSize: 15 },
  lg: { padding: '16px 40px', fontSize: 16 },
}

export function MachimpyoButton({
  children, variant = 'primary', size = 'md',
  onClick, type = 'button', disabled, className, style
}: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = '#16304d'
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = '#1e3a5f'
      }}
    >
      {children}
    </button>
  )
}
