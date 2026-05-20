interface DeathNoticeEmailProps {
  deceasedName: string
  guardianName: string
  accounts: { name: string; icon: string; status: string }[]
  stopPermission: string
  completedAt: string
}

export function DeathNoticeEmail({ deceasedName, guardianName, accounts, stopPermission, completedAt }: DeathNoticeEmailProps) {
  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif",
      maxWidth: 520, margin: '0 auto', padding: 32,
      backgroundColor: '#0b0b0c', color: '#e8e8e8',
      borderRadius: 12, lineHeight: 1.8, fontSize: 14,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', backgroundColor: '#0052ff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#fff', marginBottom: 8,
        }}>。</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', letterSpacing: 2 }}>마침표</div>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
        {guardianName} 님께
      </div>

      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#fff' }}>
        {deceasedName} 님의 디지털 흔적 정리를 완료했습니다
      </div>

      <div style={{ color: 'rgba(255,255,255,.5)', marginBottom: 20 }}>
        {deceasedName} 님께서 마침표 서비스에 가입해 계셨으며,<br />
        생전에 서명하신 위임장에 따라 모든 계정 정리를 완료했습니다.
      </div>

      {/* Account list */}
      {accounts.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 12, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0052ff', marginBottom: 10 }}>
            정리 내역
          </div>
          {accounts.map((acc, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderTop: '1px solid rgba(255,255,255,.04)',
              fontSize: 13,
            }}>
              <span>{acc.icon} {acc.name}</span>
              <span style={{
                color: acc.status === 'completed' ? '#00c853' : acc.status === 'failed' ? '#ff4444' : 'rgba(255,255,255,.3)',
                fontSize: 11, fontWeight: 600,
              }}>
                {acc.status === 'completed' ? '✓ 삭제 완료' : acc.status === 'failed' ? '✗ 실패' : '- 처리 중'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Permission notice */}
      <div style={{
        backgroundColor: stopPermission === 'forbidden' ? 'rgba(0,82,255,.05)' : 'rgba(255,255,255,.02)',
        border: `1px solid ${stopPermission === 'forbidden' ? 'rgba(0,82,255,.12)' : 'rgba(255,255,255,.06)'}`,
        borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.7,
      }}>
        {stopPermission === 'forbidden'
          ? `${deceasedName} 님께서는 '유족 중단 불가'를 선택하셨기에, 유족의 요청과 관계없이 정리가 완료되었습니다. 고인의 뜻입니다.`
          : stopPermission === 'allowed'
          ? `${deceasedName} 님께서는 '유족 중단 가능'을 선택하셨습니다. 정리를 원하지 않으시면 7일 내로 연락주십시오.`
          : `${deceasedName} 님께서는 '데이터 전달 후 중단'을 선택하셨습니다. 계정 데이터는 별도로 전달드립니다.`}
      </div>

      <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, lineHeight: 1.7 }}>
        정리 완료일: {completedAt}<br />
        문의: notice@machimpyo.kr
      </div>

      <div style={{
        marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.04)',
        fontSize: 12, color: 'rgba(255,255,255,.2)', textAlign: 'center',
      }}>
        삼가 고인의 명복을 빕니다.
      </div>
    </div>
  )
}
