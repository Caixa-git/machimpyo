'use client'

import Link from 'next/link'

interface HeaderProps {
  current?: 'landing' | 'dashboard' | 'signup'
}

export function MachimpyoHeader({ current = 'landing' }: HeaderProps) {
  const isDark = current !== 'landing'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: isDark ? 'rgba(11,11,12,.95)' : 'rgba(11,11,12,.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,.04)'
    }}>
      <Link href="/machimpyo" className="nav-l">
        <span className="nav-d"></span>
        <span className="nav-w">마침표</span>
      </Link>

      {current === 'landing' && (
        <div className="nav-a">
          <a href="#target">대상</a>
          <a href="#how">방식</a>
          <a href="#pricing">가격</a>
          <a href="#faq">FAQ</a>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {current !== 'landing' && (
          <Link href="/machimpyo" style={{
            color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontSize: 14, transition: 'color .2s'
          }}>홈</Link>
        )}
        <Link href="/machimpyo/signup">
          <button className="nav-b">시작하기</button>
        </Link>
      </div>
    </nav>
  )
}
