'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#1e3a5f' }} />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  )
}

function PaymentResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'fail'>('verifying')
  const [message, setMessage] = useState('')

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const code = searchParams.get('code')

  const verifyPayment = useCallback(async () => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('fail')
      setMessage('결제 정보가 올바르지 않습니다.')
      return
    }

    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount, 10) }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || '결제가 완료되었습니다!')
      } else {
        setStatus('fail')
        setMessage(data.error || '결제 승인에 실패했습니다.')
      }
    } catch {
      setStatus('fail')
      setMessage('결제 확인 중 오류가 발생했습니다.')
    }
  }, [paymentKey, orderId, amount])

  useEffect(() => {
    if (code) {
      // Failed payment redirected from Toss
      const codeMsg: Record<string, string> = {
        USER_CANCEL: '사용자가 결제를 취소했습니다.',
        NOT_ALLOWED_POINT_USE: '포인트 사용이 불가능합니다.',
        INVALID_CARD: '카드 정보가 올바르지 않습니다.',
        TIMEOUT: '결제 시간이 초과되었습니다.',
      }
      setStatus('fail')
      setMessage(codeMsg[code] || `결제 오류 (${code})`)
    } else {
      verifyPayment()
    }
  }, [code, verifyPayment])

  return (
    <div className="machimpyo" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#1e3a5f',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <Loader2 size={36} color="#fff" className="animate-spin" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2c2416', marginBottom: 8 }}>
              결제 확인 중...
            </h1>
            <p style={{ fontSize: 14, color: '#5a4f42' }}>
              잠시만 기다려주세요.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#2e7d32',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              boxShadow: '0 0 40px rgba(46,125,50,.2)',
            }}>
              <CheckCircle size={36} color="#fff" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c2416', marginBottom: 8 }}>
              결제 완료
            </h1>
            <p style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, marginBottom: 28 }}>
              {message}
            </p>
            <div style={{
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 14, padding: 20, marginBottom: 28, textAlign: 'left',
              fontSize: 13, color: '#5a4f42', lineHeight: 2,
            }}>
              <div style={{ fontWeight: 600, color: '#2c2416', marginBottom: 4 }}>
                ✓ 구독이 시작되었습니다
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2e7d32' }}>
                <CheckCircle size={14} /> 가입 완료
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2e7d32' }}>
                <CheckCircle size={14} /> 결제 완료
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8c8072' }}>
                <span style={{ width: 14, display: 'inline-flex', justifyContent: 'center' }}>·</span> 계정 등록 및 설정
              </div>
            </div>
            <MachimpyoButton size="lg" onClick={() => router.push('/machimpyo/dashboard')} style={{ width: '100%', justifyContent: 'center' }}>
              대시보드로 이동
            </MachimpyoButton>
          </>
        )}

        {status === 'fail' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#c62828',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              boxShadow: '0 0 40px rgba(198,40,40,.2)',
            }}>
              <XCircle size={36} color="#fff" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c2416', marginBottom: 8 }}>
              결제 실패
            </h1>
            <p style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, marginBottom: 28 }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <MachimpyoButton variant="secondary" onClick={() => router.push('/machimpyo/signup/payment')}>
                다시 시도
              </MachimpyoButton>
              <MachimpyoButton onClick={() => router.push('/machimpyo/dashboard')}>
                대시보드로
              </MachimpyoButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
