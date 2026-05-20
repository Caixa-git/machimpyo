'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { MachimpyoFeaturedBadge } from '@/components/machimpyo/MachimpyoCard'
import { TossPaymentsWidget } from '@/components/payments/TossWidget'
import { TOSS_PLANS } from '@/lib/payments/toss'

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  )
}

function PaymentPageContent() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [step, setStep] = useState<'select' | 'pay'>('select')
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string
    amount: number
    orderName: string
    customerName: string
    customerEmail: string
    successUrl: string
    failUrl: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = TOSS_PLANS[selectedPlan]

  const handleSelectPlan = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.redirect) {
          // Already subscribed — redirect to dashboard
          router.push(data.redirect)
          return
        }
        setError(data.error || '결제 초기화에 실패했습니다.')
        setLoading(false)
        return
      }

      setPaymentInfo({
        orderId: data.orderId,
        amount: data.amount,
        orderName: `마침표 ${data.planName}`,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        successUrl: data.successUrl,
        failUrl: data.failUrl,
      })
      setStep('pay')
    } catch {
      setError('결제 서버에 연결할 수 없습니다.')
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: '#1e3a5f',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: '#fff', marginBottom: 20,
      }}>。</div>

      {step === 'select' ? (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>요금제 선택</h1>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 28, lineHeight: 1.8 }}>
            가입은 5분. 위임장 한 장으로 디지털 흔적을 완전 소멸합니다.<br />
            30일 내 해지 시 전액 환불.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: error ? 12 : 20 }}>
            {Object.values(TOSS_PLANS).map((p) => (
              <div key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                style={{
                  flex: 1, padding: '20px 16px', borderRadius: 14, cursor: 'pointer',
                  background: selectedPlan === p.id ? 'rgba(30,58,95,.05)' : '#faf7f2',
                  border: `1px solid ${selectedPlan === p.id ? 'rgba(30,58,95,.3)' : 'rgba(44,36,22,.08)'}`,
                  position: 'relative', transition: 'border-color .2s',
                }}
              >
                {p.id === 'pro' && <MachimpyoFeaturedBadge />}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#7a6e5e', letterSpacing: 1, marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {p.amount.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: '#8c8072' }}>원/월</span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#c62828', marginBottom: 16 }}>{error}</p>
          )}

          <MachimpyoButton size="lg" style={{ width: '100%' }}
            onClick={handleSelectPlan}
            disabled={loading}>
            {loading ? '처리 중...' : `${plan.amount.toLocaleString()}원으로 시작하기`}
          </MachimpyoButton>
        </>
      ) : paymentInfo && (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>결제</h1>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 20, lineHeight: 1.8 }}>
            마지막 단계입니다. 안전하게 결제를 진행합니다.
          </p>

          {/* Order summary */}
          <div style={{
            background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
            borderRadius: 14, padding: 20, marginBottom: 20, textAlign: 'left',
            fontSize: 14, lineHeight: 2,
            boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#5a4f42' }}>상품</span>
              <span>{paymentInfo.orderName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#5a4f42' }}>월 결제액</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#1e3a5f' }}>
                {paymentInfo.amount.toLocaleString()}원
              </span>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#c62828', marginBottom: 16 }}>{error}</p>
          )}

          {/* Toss Payments Widget */}
          <TossPaymentsWidget
            amount={paymentInfo.amount}
            orderId={paymentInfo.orderId}
            orderName={paymentInfo.orderName}
            customerName={paymentInfo.customerName}
            customerEmail={paymentInfo.customerEmail}
            successUrl={paymentInfo.successUrl}
            failUrl={paymentInfo.failUrl}
            onError={(msg) => setError(msg)}
          />

          <div style={{ marginTop: 12 }}>
            <MachimpyoButton variant="secondary" size="sm"
              onClick={() => { setStep('select'); setError('') }}>
              요금제 다시 선택
            </MachimpyoButton>
          </div>
        </>
      )}
    </div>
  )
}
