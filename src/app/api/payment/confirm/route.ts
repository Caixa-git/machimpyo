import { NextRequest, NextResponse } from 'next/server'
import { confirmPayment, parseOrderId, TOSS_PLANS } from '@/lib/payments/toss'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentKey, orderId, amount } = body as {
      paymentKey: string
      orderId: string
      amount: number
    }

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '결제 정보가 올바르지 않습니다.' }, { status: 400 })
    }

    // Verify the payment with Toss API
    const result = await confirmPayment(paymentKey, orderId, amount)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Parse order ID to get user and plan
    const parsed = parseOrderId(orderId)
    if (!parsed) {
      return NextResponse.json({ error: '올바르지 않은 주문입니다.' }, { status: 400 })
    }

    const { userId, planId } = parsed
    const plan = TOSS_PLANS[planId]
    if (!plan) {
      return NextResponse.json({ error: '올바르지 않은 요금제입니다.' }, { status: 400 })
    }

    const admin = getAdminClient() as any

    // Update the payment order status
    const { error: orderError } = await admin
      .from('payment_orders')
      .update({
        status: 'completed',
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
        toss_response: result.data,
      })
      .eq('order_id', orderId)

    if (orderError) {
      console.error('Failed to update payment order:', orderError)
      // Non-fatal — order recovery possible from webhook
    }

    // Create or update user subscription
    const { error: upsertError } = await admin
      .from('legacy_users')
      .upsert({
        id: userId,
        plan: planId,
        status: 'active',
        subscription_started_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (upsertError) {
      console.error('Failed to update subscription:', upsertError)
      return NextResponse.json({ error: '구독 갱신 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${plan.name} 요금제 구독이 시작되었습니다.`,
      plan: planId,
    })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json({ error: '결제 승인 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
