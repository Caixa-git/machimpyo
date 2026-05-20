import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: '유효한 이메일을 입력해주세요' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('waitlist').insert({ email })
  
  if (error?.code === '23505') {
    return NextResponse.json({ message: '이미 등록된 이메일입니다' })
  }
  if (error) {
    return NextResponse.json({ error: '등록 중 오류가 발생했습니다' }, { status: 500 })
  }

  return NextResponse.json({ message: '대기자 명단에 등록되었습니다!' }, { status: 201 })
}
