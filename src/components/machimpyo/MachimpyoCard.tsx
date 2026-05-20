import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
  featured?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 16,
  md: 24,
  lg: 32,
}

export function MachimpyoCard({ children, className, style, hover = false, featured = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: featured ? 'rgba(0,82,255,.03)' : 'rgba(255,255,255,.02)',
        border: `1px solid ${featured ? 'rgba(0,82,255,.3)' : 'rgba(255,255,255,.05)'}`,
        borderRadius: 18,
        padding: paddingMap[padding],
        transition: 'border-color .2s, transform .15s',
        cursor: hover ? 'pointer' : undefined,
        position: 'relative' as const,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = 'rgba(0,82,255,.2)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = featured ? 'rgba(0,82,255,.3)' : 'rgba(255,255,255,.05)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {children}
    </div>
  )
}

export function MachimpyoFeaturedBadge() {
  return (
    <div style={{
      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
      background: '#0052ff', color: '#fff', fontSize: 10, fontWeight: 600,
      padding: '3px 12px', borderRadius: 56, letterSpacing: 1,
    }}>
      추천
    </div>
  )
}
