'use client'

import { useState } from 'react'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { MachimpyoCard, MachimpyoFeaturedBadge } from '@/components/machimpyo/MachimpyoCard'

const PLANS = [
  { id: 'basic', name: 'Basic', price: 2900, features: ['계정 10개', '등기우편 포함', 'SNS·커머스 정리', '개인정보 DB 업체 15곳', '유족 통지'] },
  { id: 'pro', name: 'Pro', price: 6900, features: ['계정 무제한', '게임 포함', '해외 EMS', '계정 정보 조회', '데이터 백업', '등기우편 통지', '24시간 속성'] },
]

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [loading, setLoading] = useState(false)
  const plan = PLANS.find(p => p.id === selectedPlan)!

  const handlePayment = async () => {
    setLoading(true)
    // TODO: Integrate Toss Payments widget
    // const toss = new TossWidget('live_xxx')
    // await toss.requestPayment({
    //   amount: plan.price,
    //   orderId: crypto.randomUUID(),
    //   orderName: `마침표 ${plan.name}`,
    //   successUrl: `${window.location.origin}/machimpyo/signup/payment/success`,
    //   failUrl: `${window.location.origin}/machimpyo/signup/payment/fail`,
    // })
    setTimeout(() => {
      alert(`[MVP] ${plan.name} (${plan.price.toLocaleString()}원/월) 결제 처리됨`)
      setLoading(false)
    }, 1500)
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: '#1e3a5f',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: '#fff', marginBottom: 20,
      }}>。</div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>결제</h1>
      <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 28, lineHeight: 1.8 }}>
        가입은 5분. 위임장 한 장으로 디지털 흔적을 완전 소멸합니다.<br />
        30일 내 해지 시 전액 환불.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {PLANS.map((p) => (
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
              {p.price.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: '#8c8072' }}>원/월</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div style={{
        background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
        borderRadius: 14, padding: 20, marginBottom: 20, textAlign: 'left',
        boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>결제 수단</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderTop: '1px solid rgba(44,36,22,.06)',
        }}>
          <input type="radio" checked={true} readOnly style={{ accentColor: '#1e3a5f' }} />
          <span style={{ fontSize: 14 }}>💳</span>
          <span style={{ fontSize: 14 }}>카드 결제</span>
          <span style={{ fontSize: 11, color: '#8c8072', marginLeft: 'auto' }}>
            토스페이먼츠
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderTop: '1px solid rgba(44,36,22,.06)',
        }}>
          <input type="radio" style={{ accentColor: '#1e3a5f' }} />
          <span style={{ fontSize: 14 }}>📱</span>
          <span style={{ fontSize: 14 }}>카카오페이</span>
        </div>
      </div>

      {/* Totals */}
      <div style={{
        background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
        borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left',
        fontSize: 14, lineHeight: 2,
        boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#5a4f42' }}>요금제</span>
          <span>{plan.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#5a4f42' }}>월 결제액</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#1e3a5f' }}>
            {plan.price.toLocaleString()}원
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c8072' }}>
          <span>연 결제 시 (17% 할인)</span>
          <span>{(plan.price * 10).toLocaleString()}원/년</span>
        </div>
      </div>

      <MachimpyoButton size="lg" style={{ width: '100%' }}
        onClick={handlePayment}
        disabled={loading}>
        {loading ? '처리 중...' : `${plan.price.toLocaleString()}원 결제하고 시작하기`}
      </MachimpyoButton>

      <p style={{ fontSize: 11, color: '#b0a694', marginTop: 12 }}>
        결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
      </p>
    </div>
  )
}
