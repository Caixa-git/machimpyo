/**
 * 토스페이먼츠 (Toss Payments) Integration
 *
 * Uses Toss Payments JavaScript SDK for client-side payment widget,
 * and server-side API for payment confirmation and webhooks.
 *
 * Docs: https://docs.tosspayments.com/
 */

export type TossPlan = {
  id: string
  name: string
  amount: number
}

export const TOSS_PLANS: Record<string, TossPlan> = {
  basic: { id: 'basic', name: 'Basic', amount: 2900 },
  pro: { id: 'pro', name: 'Pro', amount: 6900 },
  family: { id: 'family', name: 'Family', amount: 12900 },
}

export function getTossClientKey(): string {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
}

export function getTossSecretKey(): string {
  return process.env.TOSS_SECRET_KEY || 'test_sk_Z1Q2pe8N8qKaN2wRwX3W7bGNY0qy'
}

export function getTossBaseUrl(): string {
  return process.env.TOSS_API_URL || 'https://api.tosspayments.com/v1'
}

export function isTossTestMode(): boolean {
  const key = getTossClientKey()
  return key.startsWith('test_')
}

/**
 * Generate a unique order ID.
 * Used to identify the payment in Toss system.
 */
export function generateOrderId(userId: string, planId: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `machimpyo-${planId}-${userId.substring(0, 8)}-${timestamp}-${random}`
}

export function parseOrderId(orderId: string): {
  planId: string
  userId: string
} | null {
  const parts = orderId.split('-')
  if (parts.length < 3 || parts[0] !== 'machimpyo') return null
  return {
    planId: parts[1],
    userId: parts[2],
  }
}

/**
 * Confirm payment with Toss Payments API.
 * Called server-side after client completes payment.
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  const secretKey = getTossSecretKey()
  const baseUrl = getTossBaseUrl()

  try {
    const response = await fetch(`${baseUrl}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || '결제 승인에 실패했습니다.',
        data,
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Toss payment confirmation error:', error)
    return {
      success: false,
      error: '결제 승인 중 오류가 발생했습니다.',
    }
  }
}

/**
 * Cancel a payment (refund).
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const secretKey = getTossSecretKey()
  const baseUrl = getTossBaseUrl()

  try {
    const response = await fetch(`${baseUrl}/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || '결제 취소에 실패했습니다.',
        data,
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Toss payment cancel error:', error)
    return {
      success: false,
      error: '결제 취소 중 오류가 발생했습니다.',
    }
  }
}
