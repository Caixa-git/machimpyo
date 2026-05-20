import { NextRequest, NextResponse } from 'next/server'
import { parseCSV } from '@/lib/csv-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'CSV 파일을 업로드해주세요.' }, { status: 400 })
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.tsv') && !fileName.endsWith('.txt')) {
      return NextResponse.json({
        error: 'CSV(.csv), TSV(.tsv) 또는 텍스트(.txt) 파일만 업로드 가능합니다.',
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 })
    }

    const content = await file.text()

    if (!content.trim()) {
      return NextResponse.json({ error: '파일이 비어있습니다.' }, { status: 400 })
    }

    const accounts = parseCSV(content)

    if (accounts.length === 0) {
      return NextResponse.json({
        error: 'CSV에서 서비스를 찾을 수 없습니다. 서비스명이 포함된 CSV 파일인지 확인해주세요.',
      }, { status: 400 })
    }

    // Limit to reasonable number
    const MAX_ACCOUNTS = 200
    const trimmed = accounts.slice(0, MAX_ACCOUNTS)

    // Count by category
    const categoryCount: Record<string, number> = {}
    for (const acc of trimmed) {
      categoryCount[acc.category] = (categoryCount[acc.category] || 0) + 1
    }

    return NextResponse.json({
      accounts: trimmed,
      total: trimmed.length,
      truncated: accounts.length > MAX_ACCOUNTS,
      original_total: accounts.length,
      category_count: categoryCount,
    })
  } catch (error) {
    console.error('CSV parse error:', error)
    return NextResponse.json({ error: 'CSV 파일을 처리하는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
