'use client'

import { useState } from 'react'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { MachimpyoCard, MachimpyoFeaturedBadge } from '@/components/machimpyo/MachimpyoCard'

const PLANS = [
  {
    id: 'basic', name: 'Basic', price: 2900,
    features: ['계정 10개', '등기우편 삭제 요청 포함', '사망정보 API', 'SNS·포털·커머스 정리', '개인정보 DB 업체 15곳', '유족 통지'],
  },
  {
    id: 'pro', name: 'Pro', price: 6900, featured: true,
    features: ['계정 무제한', '게임 계정 포함', '해외 EMS 발송', '계정 정보 조회 대행', '데이터 백업', '등기우편 통지', '24시간 속성 처리'],
  },
  {
    id: 'family', name: 'Family', price: 12900,
    features: ['가족 4인', 'Pro 기능 전부', '가족 계정 동기화', '가족 대시보드', '30일 무료'],
  },
]

const ACCOUNT_TEMPLATES = [
  { name: '네이버', icon: '🌐', category: 'portal' as const },
  { name: '카카오', icon: '💬', category: 'messenger' as const },
  { name: '인스타그램', icon: '📱', category: 'sns' as const },
  { name: '페이스북', icon: '📘', category: 'sns' as const },
  { name: '트위터(X)', icon: '🐦', category: 'sns' as const },
  { name: '구글', icon: '🔍', category: 'portal' as const },
  { name: '쿠팡', icon: '🛒', category: 'commerce' as const },
  { name: '배달의민족', icon: '🍚', category: 'commerce' as const },
  { name: '리그오브레전드', icon: '🎮', category: 'game' as const },
  { name: '넥슨', icon: '🎯', category: 'game' as const },
  { name: '넷플릭스', icon: '📺', category: 'subscription' as const },
  { name: '기타', icon: '📋', category: 'other' as const },
]

type Step = 'plan' | 'accounts' | 'guardians' | 'waiver' | 'complete'

export default function SignupPage() {
  const [step, setStep] = useState<Step>('plan')
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [accounts, setAccounts] = useState<{ name: string; id: string; pw: string }[]>([])
  const [guardians, setGuardians] = useState<{ name: string; relation: string; phone: string }[]>([])
  const [stopPermission, setStopPermission] = useState('forbidden')
  const [mydataConsent, setMydataConsent] = useState(true)

  const steps = [
    { id: 'plan', label: '요금제', icon: '💳' },
    { id: 'accounts', label: '계정', icon: '📱' },
    { id: 'guardians', label: '유족', icon: '👨‍👩‍👧' },
    { id: 'waiver', label: '위임', icon: '📜' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Progress bar */}
      <div style={{
        position: 'fixed', top: 56, left: 0, right: 0, height: 3,
        background: 'rgba(44,36,22,.06)', zIndex: 99,
      }}>
        <div style={{
          height: '100%', background: '#1e3a5f',
          width: `${progress}%`,
          transition: 'width .5s ease',
        }} />
      </div>

      {/* Step indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 24, padding: '24px 24px 40px',
      }}>
        {steps.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: step === s.id ? '#1e3a5f' : i < currentStepIndex ? '#1e3a5f' : 'rgba(44,36,22,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#fff', fontWeight: 600,
              transition: 'background .3s',
            }}>{s.icon}</div>
            <span style={{
              fontSize: 13, color: step === s.id ? '#2c2416' : '#8c8072',
              fontWeight: step === s.id ? 600 : 400,
              display: 'none',
            }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step: Plan Selection */}
      {step === 'plan' && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            요금제를 선택하세요
          </h2>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 28, textAlign: 'center' }}>
            위임장 한 장으로 디지털 흔적을 완전 소멸합니다. 언제든 해지 가능합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  background: selectedPlan === plan.id ? 'rgba(30,58,95,.05)' : '#faf7f2',
                  border: `1px solid ${selectedPlan === plan.id ? 'rgba(30,58,95,.4)' : 'rgba(44,36,22,.08)'}`,
                  borderRadius: 18, padding: '24px 20px',
                  cursor: 'pointer', position: 'relative',
                  transition: 'border-color .2s',
                }}
              >
                {plan.featured && <MachimpyoFeaturedBadge />}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#7a6e5e', marginBottom: 4, letterSpacing: 1 }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.5, marginBottom: 2 }}>
                  {plan.price.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400, color: '#8c8072' }}>원/월</span>
                </div>
                <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#5a4f42', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#1e3a5f' }}>·</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <MachimpyoButton size="lg" onClick={() => setStep('accounts')}>
              {selectedPlan === 'basic' ? '2,900' : selectedPlan === 'pro' ? '4,900' : '9,900'}원으로 시작하기
            </MachimpyoButton>
          </div>
        </div>
      )}

      {/* Step: Account Registration */}
      {step === 'accounts' && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            사용하는 서비스를 골라주세요
          </h2>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 20, textAlign: 'center' }}>
            아이디·비밀번호 필요 없습니다. 위임장으로 각 서비스 고객센터에 직접 삭제 요청합니다.
          </p>

          {/* Bulk paste textarea */}
          <textarea
            placeholder="여러 서비스를 한 번에 입력: 네이버, 카카오, 인스타그램, 롤, 넷플릭스…"
            rows={2}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text')
              const items = pasted.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
              if (items.length > 1) {
                e.preventDefault()
                const existingNames = new Set(accounts.map(a => a.name))
                const newAccounts = items
                  .map(name => ({ name, id: '', pw: '' }))
                  .filter(a => !existingNames.has(a.name))
                setAccounts([...accounts, ...newAccounts])
              }
            }}
            style={{
              width: '100%', background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#5a4f42',
              outline: 'none', resize: 'none', marginBottom: 16, fontFamily: 'inherit',
            }}
          />

          {/* Service chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {ACCOUNT_TEMPLATES.map((tmpl) => {
              const isSelected = accounts.some(a => a.name === tmpl.name)
              return (
                <div
                  key={tmpl.name}
                  onClick={() => {
                    if (isSelected) {
                      setAccounts(accounts.filter(a => a.name !== tmpl.name))
                    } else {
                      setAccounts([...accounts, { name: tmpl.name, id: '', pw: '' }])
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: isSelected ? 'rgba(30,58,95,.12)' : 'rgba(30,58,95,.04)',
                    border: `1px solid ${isSelected ? 'rgba(30,58,95,.3)' : 'rgba(44,36,22,.08)'}`,
                    borderRadius: 56, padding: '7px 14px',
                    cursor: 'pointer', fontSize: 13,
                    transition: 'all .15s',
                  }}
                >
                  <span>{tmpl.icon}</span>
                  <span>{tmpl.name}</span>
                  {isSelected && <span style={{ fontSize: 11, marginLeft: 2, color: '#7a6e5e' }}>✓</span>}
                </div>
              )
            })}
          </div>

          {/* CSV Upload button */}
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv,.tsv,.txt'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (!file) return
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    const res = await fetch('/api/csv-parse', { method: 'POST', body: formData })
                    const data = await res.json()
                    if (res.ok && data.accounts) {
                      const existingNames = new Set(accounts.map(a => a.name))
                      const newOnes = data.accounts
                        .filter((a: any) => !existingNames.has(a.service_name))
                        .map((a: any) => ({ name: a.service_name, id: '', pw: '' }))
                      setAccounts([...accounts, ...newOnes])
                    }
                  } catch {}
                }
                input.click()
              }}
              style={{
                width: '100%', background: 'rgba(30,58,95,.04)', border: '1px dashed rgba(30,58,95,.15)',
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                fontSize: 13, color: '#5a4f42', fontFamily: 'inherit',
                transition: 'border-color .2s',
              }}
            >
              📄 CSV 파일로 불러오기 — e프라이버시 클린서비스 CSV 업로드
            </button>
            <p style={{ fontSize: 11, color: '#b0a694', marginTop: 4 }}>
              e프라이버시 클린서비스에서 내려받은 CSV를 업로드하면 자동으로 서비스를 찾아냅니다.
            </p>
          </div>

          {/* Selected account tags (no ID/pw input) */}
          {accounts.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20,
              padding: 12, background: 'rgba(250,247,242,0.5)', borderRadius: 12,
            }}>
              {accounts.map((acc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(44,36,22,.06)', borderRadius: 56,
                  padding: '5px 10px 5px 12px', fontSize: 13,
                }}>
                  <span>{ACCOUNT_TEMPLATES.find(t => t.name === acc.name)?.icon || '📋'}</span>
                  <span>{acc.name}</span>
                  <button
                    onClick={() => setAccounts(accounts.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', color: '#8c8072', cursor: 'pointer', fontSize: 14, padding: 0, marginLeft: 2 }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: 'rgba(124,58,237,.04)', border: '1px solid rgba(124,58,237,.08)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 20,
            fontSize: 12, color: '#7a6e5e', lineHeight: 1.7,
          }}>
            ⚖️ <strong style={{color: '#5a4f42'}}>위임장</strong> — 아이디나 비밀번호를 알려주실 필요가 없습니다.<br />
            가입 시 서명한 위임장과 사망증명서를 각 서비스 고객센터에 제출하여 계정을 삭제합니다.<br />
            📝 서비스만 골라주시면 됩니다. 계정 정보는 저희가 알아서 처리합니다.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <MachimpyoButton variant="secondary" onClick={() => setStep('plan')}>뒤로</MachimpyoButton>
            <MachimpyoButton onClick={() => setStep('guardians')}>
              {accounts.length > 0 ? `${accounts.length}개 서비스 선택됨` : '건너뛰기 (나중에 추가)'}
            </MachimpyoButton>
          </div>
        </div>
      )}

      {/* Step: Guardians */}
      {step === 'guardians' && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            유족 연락처를 등록하세요
          </h2>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, textAlign: 'center' }}>
            사망 감지 시 이 분들께 먼저 연락드립니다. 최대 3명.
          </p>

          {guardians.map((g, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center',
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '12px 14px',
            }}>
              <input placeholder="이름" value={g.name}
                onChange={(e) => { const n = [...guardians]; n[i] = { ...n[i], name: e.target.value }; setGuardians(n) }}
                style={{ flex: 1, background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#2c2416', outline: 'none', }}
              />
              <select value={g.relation} onChange={(e) => { const n = [...guardians]; n[i] = { ...n[i], relation: e.target.value }; setGuardians(n) }}
                style={{ background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
                  borderRadius: 8, padding: '6px 8px', fontSize: 12, color: '#2c2416', outline: 'none', }}
              >
                <option value="spouse">배우자</option><option value="child">자녀</option>
                <option value="parent">부모</option><option value="sibling">형제</option><option value="friend">친구</option>
              </select>
              <input placeholder="전화번호" value={g.phone}
                onChange={(e) => { const n = [...guardians]; n[i] = { ...n[i], phone: e.target.value }; setGuardians(n) }}
                style={{ flex: 1, background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#2c2416', outline: 'none', }}
              />
              <button onClick={() => setGuardians(guardians.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', color: '#8c8072', cursor: 'pointer' }}>✕</button>
            </div>
          ))}

          {guardians.length < 3 && (
            <button onClick={() => setGuardians([...guardians, { name: '', relation: 'spouse', phone: '' }])}
              style={{ width: '100%', background: 'rgba(30,58,95,.04)', border: '1px dashed rgba(30,58,95,.12)',
                borderRadius: 12, padding: 14, color: '#7a6e5e', cursor: 'pointer', fontSize: 13, marginBottom: 20 }}
            >+ 유족 추가</button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <MachimpyoButton variant="secondary" onClick={() => setStep('accounts')}>뒤로</MachimpyoButton>
            <MachimpyoButton onClick={() => setStep('waiver')}>
              {guardians.length > 0 ? `${guardians.length}명 등록 완료` : '건너뛰기 (나중에 추가)'}
            </MachimpyoButton>
          </div>
        </div>
      )}

      {/* Step: Waiver + Permission */}
      {step === 'waiver' && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            마지막 단계입니다
          </h2>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, textAlign: 'center' }}>
            법적 효력이 있는 위임장입니다. 신중히 선택하세요.
          </p>

          {/* Waiver preview */}
          <div style={{
            background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
            borderRadius: 14, padding: 20, marginBottom: 20,
            fontSize: 13, color: '#5a4f42', lineHeight: 1.8,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#8c8072', letterSpacing: 2 }}>개인정보 처리 위임장</span>
            </div>
            본인(이하 "위임인")은 사망 시 아래의 권한을<br />
            마침표(이하 "수탁사")에 부여합니다.<br /><br />
            <strong style={{fontSize: 14, fontWeight: 600, color: '#5a4f42', display: 'block', marginBottom: 8}}>
              위임장으로 각 서비스 고객센터에 직접 계정 삭제 요청
            </strong>
            1. 위임인이 등록한 모든 온라인 서비스 계정의 삭제<br />
            2. 국내외 개인정보 DB 업체 삭제 요청<br />
            3. 검색엔진 결과 삭제 요청<br /><br />
            본 위임장은 위임인의 사망과 동시에 효력이 발생합니다.
          </div>

          {/* Stop permission */}
          <div style={{
            background: '#faf7f2', border: '1px solid rgba(0,82,255,.15)',
            borderRadius: 14, padding: 20, marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              유족의 정리 중단 요청 권한
            </h3>
            {[
              { value: 'forbidden', label: '중단 불가 — 고인의 의사가 최우선입니다', desc: '유족이 요청해도 정리를 완료합니다. 제가 결정한 일입니다.' },
              { value: 'allowed', label: '중단 가능 — 유족의 결정을 존중합니다', desc: '유족이 요청하면 정리를 중단합니다.' },
              { value: 'allowed_with_data', label: '데이터 전달 후 중단 (Pro)', desc: '계정 데이터를 유족에게 전달한 후 정리합니다.' },
            ].map((opt) => (
              <div key={opt.value} onClick={() => setStopPermission(opt.value)} style={{
                display: 'flex', gap: 12, padding: '10px 0', cursor: 'pointer',
                borderTop: '1px solid rgba(44,36,22,.06)',
                alignItems: 'flex-start', opacity: stopPermission === opt.value ? 1 : 0.5,
              }}>
                <div style={{ flex: '0 0 16px', marginTop: 3 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `2px solid ${stopPermission === opt.value ? '#1e3a5f' : 'rgba(44,36,22,.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {stopPermission === opt.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e3a5f' }} />}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 1 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: '#7a6e5e' }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* MyData consent */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
            borderRadius: 12, padding: '14px 16px', cursor: 'pointer', marginBottom: 24,
          }}>
            <input type="checkbox" checked={mydataConsent}
              onChange={(e) => setMydataConsent(e.target.checked)}
              style={{ accentColor: '#1e3a5f' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>공공 마이데이터 사망정보 조회 동의</div>
              <div style={{ fontSize: 11, color: '#7a6e5e' }}>
                행정안전부를 통해 주기적으로 사망 여부를 확인하는 데 동의합니다. 이 정보는 사망 확인 외에 사용되지 않습니다.
              </div>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <MachimpyoButton variant="secondary" onClick={() => setStep('guardians')}>뒤로</MachimpyoButton>
            <MachimpyoButton onClick={() => setStep('complete')}>
              {stopPermission === 'forbidden' ? '동의하고 가입 완료' : '동의하고 가입 완료'}
            </MachimpyoButton>
          </div>
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#1e3a5f',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', marginBottom: 24,
            boxShadow: '0 0 40px rgba(0,82,255,.2)',
          }}>。</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            가입 완료
          </h2>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, lineHeight: 1.8 }}>
            이제 잊고 사세요.<br />
            저희가 당신의 디지털 흔적을 지킬게요.
          </p>
          <div style={{
            background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
            borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left',
            fontSize: 13, color: '#5a4f42', lineHeight: 1.8,
          }}>
            <div style={{ fontWeight: 600, color: '#2c2416', marginBottom: 8 }}>가입 요약</div>
            요금제: {PLANS.find(p => p.id === selectedPlan)?.name} ({PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()}원/월)<br />
            등록 계정: {accounts.length}개<br />
            유족 연락처: {guardians.length}명<br />
            유족 중단 권한: {stopPermission === 'forbidden' ? '중단 불가' : stopPermission === 'allowed' ? '중단 가능' : '데이터 전달 후 중단'}<br />
            공공 마이데이터: {mydataConsent ? '동의' : '미동의'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <a href="/machimpyo">
              <MachimpyoButton variant="secondary">홈으로</MachimpyoButton>
            </a>
            <a href="/machimpyo/dashboard">
              <MachimpyoButton>대시보드로</MachimpyoButton>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
