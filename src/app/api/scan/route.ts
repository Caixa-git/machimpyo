import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { scanRequestSchema } from "@/lib/validations/scan"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = scanRequestSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message ?? "입력값이 올바르지 않습니다" },
        { status: 400 }
      )
    }

    const { name, email, phone } = parsed.data

    // Upsert user — match on email, update name/phone if changed
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert({ email, name, phone }, { onConflict: "email" })
      .select("id")
      .single()

    if (userError) {
      console.error("User upsert error:", userError)
      return NextResponse.json(
        { error: "사용자 정보 저장에 실패했습니다" },
        { status: 500 }
      )
    }

    // Create scan record with status 'pending'
    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .insert({ user_id: user.id, status: "pending" })
      .select("id")
      .single()

    if (scanError) {
      console.error("Scan insert error:", scanError)
      return NextResponse.json(
        { error: "스캔 요청 생성에 실패했습니다" },
        { status: 500 }
      )
    }

    return NextResponse.json({ scanId: scan.id }, { status: 201 })
  } catch (err) {
    console.error("Unexpected error:", err)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
