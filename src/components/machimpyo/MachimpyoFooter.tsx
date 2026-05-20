import Link from 'next/link'

export function MachimpyoFooter() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,.03)',
      padding: '32px 24px',
      textAlign: 'center',
      fontSize: 12,
      color: 'rgba(255,255,255,.2)',
    }}>
      <p>
        <span className="fd"></span>
        {' '}마침표{' '}
        <span className="fd"></span>
      </p>
      <p style={{ marginTop: 6 }}>
        <Link href="#" style={{ color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>이용약관</Link>
        <span className="fd"></span>
        <Link href="#" style={{ color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>개인정보처리방침</Link>
        <span className="fd"></span>
        <Link href="#" style={{ color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>문의</Link>
      </p>
      <p style={{ marginTop: 8 }}>&copy; 2026 마침표</p>
    </footer>
  )
}
