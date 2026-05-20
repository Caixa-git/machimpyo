import Link from 'next/link'

// Mock data for now — will connect to Supabase in v1.5
const MOCK_USER = {
  name: '홍길동',
  email: 'hong@example.com',
  plan: 'Pro',
  planPrice: '4,900',
  since: '2026. 5.',
  status: 'active' as const,
}

const MOCK_ACCOUNTS = [
  { name: '네이버', icon: '🌐', category: 'portal', status: 'pending' as const },
  { name: '카카오톡', icon: '💬', category: 'messenger', status: 'pending' as const },
  { name: '인스타그램', icon: '📱', category: 'sns', status: 'pending' as const },
  { name: '쿠팡', icon: '🛒', category: 'commerce', status: 'pending' as const },
]

const MOCK_GUARDIANS = [
  { name: '홍영희', relation: 'spouse', phone: '010-****-5678' },
  { name: '홍철수', relation: 'child', phone: '010-****-9012' },
]

const statusBadge: Record<string, { label: string; color: string }> = {
  pending: { label: '대기', color: '#8c8072' },
  deleting: { label: '처리중', color: '#1e3a5f' },
  deleted: { label: '완료', color: '#2e7d32' },
  failed: { label: '실패', color: '#c62828' },
}

export default function DashboardPage() {
  return (
    <div style={{ padding: '80px 24px 40px', maxWidth: 800, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#1e3a5f', letterSpacing: 3, marginBottom: 6 }}>
          DASHBOARD
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2c2416' }}>
          {MOCK_USER.name} 님의 <span style={{ color: '#1e3a5f' }}>마침표</span>
        </h1>
        <p style={{ fontSize: 14, color: '#5a4f42', marginTop: 4 }}>
          당신의 디지털 흔적은 안전하게 보관되어 있습니다.
        </p>
      </div>

      {/* Status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: '가입 상태', value: '정상', sub: `${MOCK_USER.plan} · ${MOCK_USER.since}`, color: '#2e7d32' },
          { label: '등록 계정', value: `${MOCK_ACCOUNTS.length}개`, sub: '최대 무제한', color: '#1e3a5f' },
          { label: '유족 연락처', value: `${MOCK_GUARDIANS.length}명`, sub: '사망 시 연락', color: '#1e3a5f' },
          { label: '유족 중단 권한', value: '중단 불가', sub: '고인 의사 최우선', color: '#1e3a5f' },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
            borderRadius: 14, padding: '18px 16px',
            boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
          }}>
            <div style={{ fontSize: 11, color: '#8c8072', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#8c8072', marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Accounts */}
      <div style={{
        background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
        borderRadius: 14, padding: 20, marginBottom: 16,
        boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2c2416' }}>등록된 계정</h2>
          <button style={{
            background: 'rgba(30,58,95,.08)', border: 'none', color: '#1e3a5f',
            borderRadius: 56, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>+ 계정 추가</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_ACCOUNTS.map((acc, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderTop: '1px solid rgba(44,36,22,.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{acc.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#2c2416' }}>{acc.name}</span>
                <span style={{ fontSize: 11, color: '#8c8072' }}>{acc.category}</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: statusBadge[acc.status].color,
                background: `${statusBadge[acc.status].color}12`,
                borderRadius: 56, padding: '2px 10px',
              }}>{statusBadge[acc.status].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guardians */}
      <div style={{
        background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
        borderRadius: 14, padding: 20, marginBottom: 16,
        boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2c2416' }}>유족 연락처</h2>
          <button style={{
            background: 'rgba(30,58,95,.08)', border: 'none', color: '#1e3a5f',
            borderRadius: 56, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>+ 추가</button>
        </div>
        {MOCK_GUARDIANS.map((g, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderTop: '1px solid rgba(44,36,22,.06)',
          }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#2c2416' }}>{g.name}</span>
              <span style={{ fontSize: 12, color: '#8c8072', marginLeft: 8 }}>
                {g.relation === 'spouse' ? '배우자' : g.relation === 'child' ? '자녀' : g.relation === 'parent' ? '부모' : '형제'}
              </span>
            </div>
            <span style={{ fontSize: 13, color: '#8c8072' }}>{g.phone}</span>
          </div>
        ))}
      </div>

      {/* Waiver info */}
      <div style={{
        background: 'rgba(30,58,95,.04)', border: '1px solid rgba(30,58,95,.12)',
        borderRadius: 14, padding: '16px 20', marginBottom: 32,
      }}>
        <div style={{ fontSize: 13, color: '#5a4f42', lineHeight: 1.7 }}>
          <span style={{ fontWeight: 600, color: '#2c2416' }}>위임장</span>이 법적 효력을 가지고 있습니다.
          유족이 정리 중단을 요청해도 <span style={{ fontWeight: 600, color: '#1e3a5f' }}>고인의 의사가 최우선</span>으로 실행됩니다.
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ borderTop: '1px solid rgba(44,36,22,.06)', paddingTop: 20 }}>
        <Link href="#" style={{ fontSize: 13, color: '#8c8072', textDecoration: 'none' }}>
          회원탈퇴 및 데이터 삭제
        </Link>
      </div>
    </div>
  )
}
