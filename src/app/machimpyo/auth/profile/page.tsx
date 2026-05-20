'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, checkAuth } from '@/lib/auth/actions'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { User, Phone, AlertCircle, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth().then((result) => {
      setPageLoading(false)
      if (!result.authenticated) {
        router.push('/machimpyo/auth/signup')
      } else if (result.user?.name) {
        setName(result.user.name)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.set('name', name)
    formData.set('phone', phone)

    const result = await updateProfile(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    }
  }

  if (pageLoading) {
    return (
      <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#1e3a5f' }} />
      </div>
    )
  }

  return (
    <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#1e3a5f',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, marginBottom: 16,
          }}>。</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c2416', marginBottom: 4 }}>
            프로필 정보
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42' }}>
            위임장 작성을 위한 기본 정보입니다
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {['이메일 인증', '프로필', '완료'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= 1 ? '#1e3a5f' : 'rgba(44,36,22,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: i <= 1 ? '#fff' : '#8c8072', fontWeight: 600,
              }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: i <= 1 ? '#2c2416' : '#8c8072', fontWeight: i <= 1 ? 600 : 400 }}>
                {label}
              </span>
              {i < 2 && <div style={{ width: 20, height: 1, background: 'rgba(44,36,22,.08)' }} />}
            </div>
          ))}
        </div>

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
              이름 *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px',
            }}>
              <User size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#2c2416', padding: '14px 0', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a4f42', marginBottom: 6, display: 'block' }}>
              전화번호 (선택)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10,
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 12, padding: '0 14px',
            }}>
              <Phone size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#2c2416', padding: '14px 0', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MachimpyoButton
              type="submit"
              size="lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? '저장 중...' : '저장하고 다음으로'}
            </MachimpyoButton>

            <MachimpyoButton
              variant="secondary"
              type="button"
              size="md"
              onClick={() => router.push('/machimpyo/auth/complete')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              건너뛰기 (나중에 입력)
            </MachimpyoButton>
          </div>
        </form>
      </div>
    </div>
  )
}
