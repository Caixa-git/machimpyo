'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from '@/lib/auth/actions'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

export default function AuthCompletePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth().then((result) => {
      setLoading(false)
      if (!result.authenticated) {
        router.push('/machimpyo/auth/signup')
      } else {
        setUserName(result.user?.name || '')
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#1e3a5f' }} />
      </div>
    )
  }

  return (
    <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        {/* Step indicator - all completed */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {['이메일 인증', '프로필', '완료'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#1e3a5f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#fff', fontWeight: 600,
              }}>
                {i < 2 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, color: '#2c2416', fontWeight: 600 }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 20, height: 1, background: 'rgba(30,58,95,.3)' }} />}
            </div>
          ))}
        </div>

        {/* Success icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#1e3a5f',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 0 40px rgba(30,58,95,.2)',
        }}>
          <CheckCircle size={36} color="#fff" />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c2416', marginBottom: 8 }}>
          {userName ? `${userName}님, 가입을 환영합니다` : '가입을 환영합니다'}
        </h1>
        <p style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
          이제 당신의 디지털 유산을 준비할 시간입니다.<br />
          아래 버튼을 눌러 서비스 설정을 시작하세요.
        </p>

        {/* Summary card */}
        <div style={{
          background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
          borderRadius: 14, padding: 20, marginBottom: 28, textAlign: 'left',
          fontSize: 13, color: '#5a4f42', lineHeight: 2,
        }}>
          <div style={{ fontWeight: 600, color: '#2c2416', marginBottom: 8, fontSize: 14 }}>
            ✓ 완료된 단계
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2e7d32' }}>
            <CheckCircle size={14} /> 이메일 인증 완료
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2e7d32' }}>
            <CheckCircle size={14} /> 기본 정보 등록
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c8072' }}>
            <span style={{ width: 14, display: 'inline-flex', justifyContent: 'center', fontSize: 14 }}>·</span> 요금제 · 계정 · 유족 설정
          </div>
        </div>

        {/* CTA */}
        <MachimpyoButton
          size="lg"
          onClick={() => router.push('/machimpyo/signup')}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            서비스 설정 시작하기 <ArrowRight size={18} />
          </span>
        </MachimpyoButton>

        <p style={{ marginTop: 16, fontSize: 13, color: '#8c8072' }}>
          <a href="/machimpyo/dashboard" style={{ color: '#5a4f42', textDecoration: 'none' }}>
            나중에 설정하기 (대시보드로 이동)
          </a>
        </p>
      </div>
    </div>
  )
}
