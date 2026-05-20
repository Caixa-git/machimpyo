'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signup } from '@/lib/auth/actions'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const errorParam = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.set('email', email)
    formData.set('password', password)
    formData.set('name', name)

    const result = await signup(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(true)
      // Redirect to verify page after short delay
      router.push('/machimpyo/auth/verify')
    }
  }

  if (success) {
    return (
      <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#1e3a5f',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', marginBottom: 20,
          }}>
            <Mail size={28} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#2c2416' }}>
            인증 이메일을 발송했습니다
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, marginBottom: 20 }}>
            <strong style={{ color: '#1e3a5f' }}>{email}</strong>로 인증 메일을 보냈습니다.<br />
            메일함을 확인하여 가입을 완료해주세요.
          </p>
          <MachimpyoButton onClick={() => router.push('/machimpyo/auth/verify')}>
            확인 완료
          </MachimpyoButton>
        </div>
      </div>
    )
  }

  return (
    <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#1e3a5f',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, marginBottom: 16,
          }}>。</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c2416', marginBottom: 4 }}>
            마침표 가입하기
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42' }}>
            당신의 디지털 유산을 지키는 첫 걸음
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {['이메일 인증', '프로필', '완료'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i === 0 ? '#1e3a5f' : 'rgba(44,36,22,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: i === 0 ? '#fff' : '#8c8072', fontWeight: 600,
              }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: i === 0 ? '#2c2416' : '#8c8072', fontWeight: i === 0 ? 600 : 400 }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 20, height: 1, background: 'rgba(44,36,22,.08)' }} />}
            </div>
          ))}
        </div>

        {/* Error from URL param */}
        {errorParam === 'verification_failed' && (
          <div style={{
            background: 'rgba(198,40,40,.06)', border: '1px solid rgba(198,40,40,.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c62828',
          }}>
            <AlertCircle size={16} />
            이메일 인증에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        {/* Error from form */}
        {error && (
          <div style={{
            background: 'rgba(198,40,40,.06)', border: '1px solid rgba(198,40,40,.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c62828',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a4f42', marginBottom: 6, display: 'block' }}>
              이름 (선택)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px', transition: 'border-color .2s',
            }}>
              <User size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#2c2416', padding: '14px 0', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a4f42', marginBottom: 6, display: 'block' }}>
              이메일 *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px', transition: 'border-color .2s',
            }}>
              <Mail size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#2c2416', padding: '14px 0', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a4f42', marginBottom: 6, display: 'block' }}>
              비밀번호 * (6자 이상)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px', transition: 'border-color .2s',
            }}>
              <Lock size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#2c2416', padding: '14px 0', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <MachimpyoButton
            type="submit"
            size="lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? '처리 중...' : '이메일로 가입하기'}
          </MachimpyoButton>
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8c8072' }}>
          이미 계정이 있으신가요?{' '}
          <a href="/machimpyo/auth/login" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>
            로그인
          </a>
        </p>
      </div>
    </div>
  )
}

export default function AuthSignupPage() {
  return (
    <Suspense fallback={
      <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#1e3a5f', fontSize: 14 }}>로딩 중...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
