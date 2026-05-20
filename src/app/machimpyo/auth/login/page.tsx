'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { Mail, Lock, AlertCircle } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const errorParam = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 일치하지 않습니다.'
        : signInError.message)
      return
    }

    router.push('/machimpyo/dashboard')
    router.refresh()
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
            마침표 로그인
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42' }}>
            다시 오신 것을 환영합니다
          </p>
        </div>

        {/* Error from URL param */}
        {errorParam && (
          <div style={{
            background: 'rgba(198,40,40,.06)', border: '1px solid rgba(198,40,40,.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c62828',
          }}>
            <AlertCircle size={16} />
            {errorParam === 'session_expired' ? '세션이 만료되었습니다. 다시 로그인해주세요.' : '로그인이 필요합니다.'}
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
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a4f42', marginBottom: 6, display: 'block' }}>
              이메일
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px',
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
              비밀번호
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px',
            }}>
              <Lock size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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
            {loading ? '처리 중...' : '로그인'}
          </MachimpyoButton>
        </form>

        {/* Signup link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8c8072' }}>
          아직 계정이 없으신가요?{' '}
          <a href="/machimpyo/auth/signup" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>
            가입하기
          </a>
        </p>
      </div>
    </div>
  )
}

export default function AuthLoginPage() {
  return (
    <Suspense fallback={
      <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#1e3a5f', fontSize: 14 }}>로딩 중...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
