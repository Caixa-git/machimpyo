import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { scanId, brokerName, url, name, phone } = await request.json()

  if (!scanId || !brokerName) {
    return NextResponse.json({ error: 'scanId와 brokerName은 필수입니다' }, { status: 400 })
  }

  // verify scan exists
  const { data: scan } = await supabase
    .from('scans')
    .select('id')
    .eq('id', scanId)
    .single()

  if (!scan) {
    return NextResponse.json({ error: '스캔을 찾을 수 없습니다' }, { status: 404 })
  }

  // insert exposure
  const { data: exposure, error } = await supabase
    .from('exposures')
    .insert({
      scan_id: scanId,
      broker_name: brokerName,
      url: url || null,
      data_found: { name: name || '', phone: phone || '' },
      status: 'found',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '항목 추가 실패', details: error.message }, { status: 500 })
  }

  return NextResponse.json(exposure, { status: 201 })
}
