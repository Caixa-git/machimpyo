import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/email/client'
import { ScanResultEmail } from '@/lib/email/templates/scan-result'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { scanId } = await request.json()

  if (!scanId) {
    return NextResponse.json({ error: 'scanId가 필요합니다' }, { status: 400 })
  }

  // get scan with exposures
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*, exposures(*)')
    .eq('id', scanId)
    .single()

  if (scanError || !scan) {
    return NextResponse.json({ error: '스캔을 찾을 수 없습니다' }, { status: 404 })
  }

  // get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', scan.user_id)
    .single()

  if (userError || !user?.email) {
    return NextResponse.json({ error: '사용자 이메일을 찾을 수 없습니다' }, { status: 400 })
  }

  // preview items (first 3)
  const exposures = scan.exposures || []
  const previewItems = exposures.slice(0, 3).map((e: any) => ({
    broker: e.broker_name,
    dataFound: `${e.data_found?.name || ''} ${e.data_found?.phone || ''}`.trim(),
  }))

  // send email
  const { error: emailError } = await resend.emails.send({
    from: '클리어미 <onboarding@resend.dev>',
    to: user.email,
    subject: `[클리어미] ${user.name || '고객'}님의 스캔 결과 — ${exposures.length}곳 발견`,
    react: ScanResultEmail({
      name: user.name || '고객',
      totalFound: exposures.length,
      previewItems,
      scanId: scan.id,
    }),
  })

  if (emailError) {
    console.error('Email error:', emailError)
    return NextResponse.json({ error: '이메일 발송 실패', details: emailError.message }, { status: 500 })
  }

  // update scan status + total_found
  const { error: updateError } = await supabase
    .from('scans')
    .update({ status: 'complete', total_found: exposures.length })
    .eq('id', scanId)

  if (updateError) {
    return NextResponse.json({ error: '스캔 상태 업데이트 실패' }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    scanId, 
    totalFound: exposures.length, 
    emailSent: true 
  })
}
