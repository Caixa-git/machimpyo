import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateOrderId, TOSS_PLANS } from '@/lib/payments/toss'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body as { planId: string }
    const plan = TOSS_PLANS[planId]

    if (!plan) {
      return NextResponse.json({ error: '올바르지 않은 요금제입니다.' }, { status: 400 })
    }

    // Check if user already has an active subscription
    const { data: existingProfile } = await supabase
      .from('legacy_users')
      .select('plan, subscription_started_at')
      .eq('id', user.id)
      .single()

    if (existingProfile?.subscription_started_at) {
      return NextResponse.json({
        message: '이미 구독 중입니다.',
        redirect: '/machimpyo/dashboard',
      })
    }

    const orderId = generateOrderId(user.id, planId)

    // Store pending order in database
    const admin = getAdminClient() as any
    const { error: insertError } = await admin
      .from('payment_orders')
      .insert({
        order_id: orderId,
        user_id: user.id,
        plan_id: planId,
        amount: plan.amount,
        status: 'pending',
      })

    if (insertError) {
      console.error('Failed to create payment order:', insertError)
      // Non-fatal — the order can be recovered from webhook
    }

    return NextResponse.json({
      orderId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      customerName: user.user_metadata?.name || '',
      customerEmail: user.email,
      successUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || ''}/machimpyo/signup/payment/result`,
      failUrl: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || ''}/machimpyo/signup/payment/result`,
    })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: '결제 초기화 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
