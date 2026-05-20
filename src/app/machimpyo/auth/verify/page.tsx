'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resendVerification } from '@/lib/auth/actions'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { Mail, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false)

  const checkVerification = async () => {
    setChecking(true)
    setError('')
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email_confirmed_at) {
      // Email is verified!
      router.push('/machimpyo/auth/profile')
      return
    }
    
    setChecked(true)
    setChecking(false)
  }

  const handleResend = async () => {
    if (!email) {
      setError('가입 시 사용한 이메일을 입력해주세요.')
      return
    }
    setResending(true)
    setError('')
    
    const formData = new FormData()
    formData.set('email', email)
    
    const result = await resendVerification(formData)
    setResending(false)
    
    if (result.error) {
      setError(result.error)
    } else {
      setResent(true)
      setChecked(false)
    }
  }

  return (
    <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(30,58,95,.08)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#1e3a5f', marginBottom: 20,
        }}>
          <Mail size={32} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2c2416', marginBottom: 8 }}>
          이메일 인증이 필요합니다
        </h1>
        <p style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
          가입하신 이메일로 인증 메일을 보냈습니다.<br />
          메일함을 확인하여 인증 링크를 클릭해주세요.
        </p>

        {/* Instructions card */}
        <div style={{
          background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
          borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left',
          fontSize: 13, color: '#5a4f42', lineHeight: 1.9,
        }}>
          <div style={{ fontWeight: 600, color: '#2c2416', marginBottom: 8 }}>✉️ 확인 방법</div>
          1. 이메일({email || '가입한 이메일'})의 받은편지함 확인<br />
          2. 스팸 폴더도 확인해보세요<br />
          3. 인증 링크를 클릭하면 자동으로 진행됩니다
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

        {checked && !error && (
          <div style={{
            background: 'rgba(46,125,50,.06)', border: '1px solid rgba(46,125,50,.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            fontSize: 13, color: '#2e7d32',
          }}>
            아직 인증이 완료되지 않았습니다. 메일함을 확인해주세요.
          </div>
        )}

        {resent && (
          <div style={{
            background: 'rgba(30,58,95,.06)', border: '1px solid rgba(30,58,95,.12)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            fontSize: 13, color: '#1e3a5f',
          }}>
            인증 메일을 다시 발송했습니다. 메일함을 확인해주세요.
          </div>
        )}

        {/* Email input for resend */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
          background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
          borderRadius: 12, padding: '0 14px', alignItems: 'center',
        }}>
          <Mail size={16} style={{ flex: '0 0 16px', color: '#8c8072' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입한 이메일 주소"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 14, color: '#2c2416', padding: '14px 0', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MachimpyoButton
            size="lg"
            onClick={checkVerification}
            disabled={checking}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {checking ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={16} className="animate-spin" /> 확인 중...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                인증 확인하기 <ArrowRight size={16} />
              </span>
            )}
          </MachimpyoButton>

          <MachimpyoButton
            variant="secondary"
            size="md"
            onClick={handleResend}
            disabled={resending}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {resending ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={14} className="animate-spin" /> 재발송 중...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={14} /> 인증 메일 다시 보내기
              </span>
            )}
          </MachimpyoButton>
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: '#8c8072' }}>
          메일이 오지 않으면 스팸 폴더를 확인하거나 help@machimpyo.kr로 문의해주세요.
        </p>
      </div>
    </div>
  )
}
