'use client'

import { useEffect, useRef, useState } from 'react'
import { getTossClientKey, isTossTestMode } from '@/lib/payments/toss'

declare global {
  interface Window {
    TossPayments: new (clientKey: string) => TossPaymentsInstance
  }
}

interface TossPaymentsInstance {
  requestPayment(method: string, options: Record<string, any>): Promise<void>
}

interface TossPaymentsWidgetProps {
  amount: number
  orderId: string
  orderName: string
  customerName: string
  customerEmail: string
  successUrl: string
  failUrl: string
  onError?: (error: string) => void
}

export function TossPaymentsWidget({
  amount,
  orderId,
  orderName,
  customerName,
  customerEmail,
  successUrl,
  failUrl,
  onError,
}: TossPaymentsWidgetProps) {
  const [loaded, setLoaded] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'KAKAO_PAY'>('CARD')
  const [paying, setPaying] = useState(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    // Load Toss Payments SDK
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment-widget'
    script.onload = () => setLoaded(true)
    script.onerror = () => {
      onError?.('토스페이먼츠 SDK를 불러오지 못했습니다.')
    }
    document.head.appendChild(script)

    return () => {
      // Don't remove script on unmount — other components may need it
    }
  }, [onError])

  const handlePayment = async () => {
    if (!loaded || !window.TossPayments) {
      onError?.('결제 모듈이 아직 로드되지 않았습니다.')
      return
    }

    setPaying(true)

    try {
      const tossPayments = new window.TossPayments(getTossClientKey())

      await tossPayments.requestPayment(selectedMethod, {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl,
        failUrl,
        // Flow mode — Toss handles redirect
        flowMode: 'DEFAULT',
        // Easy pay settings
        easyPay: selectedMethod === 'KAKAO_PAY' ? 'KAKAOPAY' : undefined,
      })
    } catch (error: any) {
      if (error?.code === 'USER_CANCEL') {
        onError?.('결제가 취소되었습니다.')
      } else {
        onError?.(error?.message || '결제 처리 중 오류가 발생했습니다.')
      }
      setPaying(false)
    }
  }

  return (
    <div>
      {/* Payment method selector */}
      <div style={{
        background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
        borderRadius: 14, padding: 20, marginBottom: 20, textAlign: 'left',
        boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
        opacity: loaded ? 1 : 0.5,
        transition: 'opacity .3s',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          {loaded ? '결제 수단' : '결제 모듈 로딩 중...'}
        </div>

        {/* Card payment */}
        <label
          onClick={() => { if (loaded) setSelectedMethod('CARD') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderTop: '1px solid rgba(44,36,22,.06)',
            cursor: loaded ? 'pointer' : 'not-allowed',
            opacity: loaded ? 1 : 0.5,
          }}
        >
          <input
            type="radio"
            checked={selectedMethod === 'CARD'}
            readOnly
            style={{ accentColor: '#1e3a5f' }}
          />
          <span style={{ fontSize: 14 }}>💳</span>
          <span style={{ fontSize: 14 }}>카드 결제</span>
          <span style={{ fontSize: 11, color: '#8c8072', marginLeft: 'auto' }}>
            {isTossTestMode() ? '테스트 모드' : '토스페이먼츠'}
          </span>
        </label>

        {/* Kakao Pay */}
        <label
          onClick={() => { if (loaded) setSelectedMethod('KAKAO_PAY') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderTop: '1px solid rgba(44,36,22,.06)',
            cursor: loaded ? 'pointer' : 'not-allowed',
            opacity: loaded ? 1 : 0.5,
          }}
        >
          <input
            type="radio"
            checked={selectedMethod === 'KAKAO_PAY'}
            readOnly
            style={{ accentColor: '#1e3a5f' }}
          />
          <span style={{ fontSize: 14 }}>📱</span>
          <span style={{ fontSize: 14 }}>카카오페이</span>
        </label>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePayment}
        disabled={!loaded || paying}
        style={{
          width: '100%', padding: '16px 40px',
          background: loaded && !paying ? '#1e3a5f' : 'rgba(44,36,22,.12)',
          color: loaded && !paying ? '#fff' : '#8c8072',
          border: 'none', borderRadius: 56, fontSize: 16, fontWeight: 600,
          cursor: loaded && !paying ? 'pointer' : 'not-allowed',
          transition: 'background .2s',
          fontFamily: 'inherit',
        }}
      >
        {!loaded ? '결제 모듈 로딩 중...'
          : paying ? '결제 처리 중...'
          : `${amount.toLocaleString()}원 결제하기`}
      </button>

      {!loaded && (
        <p style={{ fontSize: 11, color: '#b0a694', marginTop: 8, textAlign: 'center' }}>
          토스페이먼츠 SDK를 불러오는 중입니다.
        </p>
      )}

      {isTossTestMode() && (
        <p style={{ fontSize: 11, color: '#b0a694', marginTop: 8, textAlign: 'center' }}>
          🔧 테스트 모드 — 실제 결제가 이루어지지 않습니다.
          <br />
          테스트 카드: 1111-1111-1111-1111 / 모든 정보 0 또는 1
        </p>
      )}
    </div>
  )
}
