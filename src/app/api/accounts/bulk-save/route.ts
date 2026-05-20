import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { accounts } = body as {
      accounts: { service_name: string; category: string; login_id?: string }[]
    }

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json({ error: '저장할 계정이 없습니다.' }, { status: 400 })
    }

    // Validate plan limits
    const { data: profile } = await supabase
      .from('legacy_users')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan || 'basic'
    const maxAccounts = plan === 'basic' ? 10
      : plan === 'family' ? 999
      : 999 // pro = unlimited

    // Check current count
    const { count: currentCount } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const remaining = maxAccounts - (currentCount || 0)
    if (accounts.length > remaining) {
      return NextResponse.json({
        error: `${
          plan === 'basic'
            ? `Basic 요금제는 최대 10개 계정까지 등록 가능합니다. (현재 ${currentCount || 0}개, 추가 가능 ${remaining}개)`
            : `계정을 더 이상 추가할 수 없습니다. (현재 ${currentCount || 0}개)`
        }`,
        maxAccounts,
        currentCount: currentCount || 0,
        remaining,
      }, { status: 400 })
    }

    // Deduplicate against existing accounts
    const { data: existing } = await supabase
      .from('accounts')
      .select('service_name')
      .eq('user_id', user.id)

    const existingNames = new Set((existing || []).map(a => a.service_name.toLowerCase()))

    const newAccounts = accounts
      .filter(a => !existingNames.has(a.service_name.toLowerCase()))
      .map(a => ({
        user_id: user.id,
        service_name: a.service_name,
        category: a.category || 'other',
        login_id: a.login_id || '',
        status: 'pending' as const,
      }))

    if (newAccounts.length === 0) {
      return NextResponse.json({
        message: '모든 계정이 이미 등록되어 있습니다. 중복이 제거되었습니다.',
        saved: 0,
        duplicates: accounts.length,
      })
    }

    const remainingAfterDedup = maxAccounts - (currentCount || 0)
    const toInsert = newAccounts.slice(0, remainingAfterDedup)
    const skipped = newAccounts.length - toInsert.length

    const { data: inserted, error: insertError } = await supabase
      .from('accounts')
      .insert(toInsert)
      .select()

    if (insertError) {
      console.error('Failed to save accounts:', insertError)
      return NextResponse.json({ error: '계정 저장 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      message: `${toInsert.length}개 계정이 등록되었습니다.`,
      saved: toInsert.length,
      duplicates: accounts.length - newAccounts.length + skipped,
      skipped: skipped > 0 ? skipped : undefined,
      accounts: inserted,
    })
  } catch (error) {
    console.error('Bulk save accounts error:', error)
    return NextResponse.json({ error: '계정 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('id, service_name, category, login_id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: '계정 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: '계정 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
