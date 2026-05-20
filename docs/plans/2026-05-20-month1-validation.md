# 클리어미 MVP — Month 1 검증 단계 구현 계획

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 이메일 수집 → 수동 스캔 → 결과 이메일 발송까지의 핵심 플로우 구축. 첫 무료 사용자 10명 처리 가능 상태 만들기.

**Architecture:** Next.js 14 App Router + Supabase (Auth, DB, Edge Functions) + Resend (이메일). 프론트는 Vercel에 배포. 스캔은 반자동 (Playwright는 Month 2).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Resend

---

## Phase 0: 프로젝트 초기화

### Task 1: Next.js 프로젝트 생성

**Objective:** 클리어미 프로젝트 스캐폴딩 생성

**Files:**
- Create: `clearme/` (프로젝트 루트)

**Step 1: Next.js 앱 생성**
```bash
cd /mnt/c/Users/wlstn/Desktop
npx create-next-app@latest clearme --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Step 2: shadcn/ui 초기화**
```bash
cd clearme
npx shadcn@latest init -d
```

**Step 3: 필수 패키지 설치**
```bash
npm install @supabase/supabase-js @supabase/ssr resend zod react-hook-form @hookform/resolvers
```

**Step 4: Git 초기화 + 첫 커밋**
```bash
git init
git add .
git commit -m "init: Next.js 14 + shadcn/ui + Supabase + Resend"
```

**Step 5: GitHub 리포 생성 + 푸시**
```bash
gh repo create clearme-kr --private --source=. --push
```

---

### Task 2: Supabase 클라이언트 설정

**Objective:** Supabase 클라이언트 유틸리티 생성 (브라우저/서버 분리)

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `.env.local`

**Step 1: 환경변수 설정**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

**Step 2: 브라우저 클라이언트**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 3: 서버 클라이언트**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Step 4: 커밋**
```bash
git add .
git commit -m "feat: add Supabase client utilities (browser + server)"
```

---

## Phase 1: DB 스키마 + 이메일 수집

### Task 3: Supabase 마이그레이션 — 핵심 테이블

**Objective:** users, scans, exposures, brokers 테이블 생성

**Files:**
- Create: `supabase/migrations/20260520_initial_schema.sql`

**Step 1: SQL 마이그레이션 작성**
```sql
-- supabase/migrations/20260520_initial_schema.sql

-- 사용자
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  address text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
  created_at timestamptz default now()
);

-- 브로커 목록
create table brokers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text,
  removal_url text,
  method text check (method in ('form', 'email', 'manual')),
  avg_days int default 14,
  priority int default 2 check (priority between 1 and 3),
  active boolean default true
);

-- 스캔 결과
create table scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  scanned_at timestamptz default now(),
  total_found int default 0,
  status text default 'pending' check (status in ('pending', 'processing', 'complete'))
);

-- 발견된 항목
create table exposures (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references scans(id) on delete cascade,
  broker_id uuid references brokers(id),
  broker_name text not null,
  url text,
  data_found jsonb,
  status text default 'found' check (status in ('found', 'removal_requested', 'removed')),
  removal_requested_at timestamptz,
  removed_at timestamptz
);

-- RLS (Row Level Security)
alter table users enable row level security;
alter table scans enable row level security;
alter table exposures enable row level security;

create policy "Users can read own data" on users for select using (auth.uid() = id);
create policy "Users can read own scans" on scans for select using (auth.uid() = user_id);
create policy "Users can read own exposures" on exposures for select using (
  scan_id in (select id from scans where user_id = auth.uid())
);
```

**Step 2: Supabase에 마이그레이션 적용**
```bash
npx supabase db push
```

**Step 3: 브로커 시드 데이터**
```sql
-- supabase/seed.sql
insert into brokers (name, url, method, priority) values
  ('Spokeo', 'https://www.spokeo.com', 'form', 1),
  ('BeenVerified', 'https://www.beenverified.com', 'form', 1),
  ('Whitepages', 'https://www.whitepages.com', 'form', 1),
  ('FastPeopleSearch', 'https://www.fastpeoplesearch.com', 'form', 1),
  ('Radaris', 'https://radaris.com', 'form', 1),
  ('MyLife', 'https://www.mylife.com', 'form', 2),
  ('PeopleFinder', 'https://www.peoplefinder.com', 'form', 2),
  ('Intelius', 'https://www.intelius.com', 'form', 2),
  ('TruthFinder', 'https://www.truthfinder.com', 'form', 2),
  ('ZoomInfo', 'https://www.zoominfo.com', 'email', 2),
  ('Pipl', 'https://pipl.com', 'email', 2),
  ('네이버 인물검색', 'https://search.naver.com', 'manual', 1),
  ('카카오 검색', 'https://search.kakao.com', 'manual', 2),
  ('잡코리아', 'https://www.jobkorea.co.kr', 'form', 2),
  ('사람인', 'https://www.saramin.co.kr', 'form', 2),
  ('LinkedIn KR', 'https://kr.linkedin.com', 'manual', 2),
  ('블라인드', 'https://www.teamblind.com', 'manual', 3),
  ('페이스북', 'https://www.facebook.com', 'manual', 3),
  ('공공데이터포털', 'https://www.data.go.kr', 'manual', 3),
  ('원스톱 민원포털', 'https://www.epeople.go.kr', 'manual', 3);
```

**Step 4: 커밋**
```bash
git add .
git commit -m "feat: add DB schema + broker seed data"
```

---

### Task 4: 대기자 명단 이메일 수집 폼

**Objective:** 랜딩 페이지에 이메일 수집 폼 연결 (Supabase에 저장)

**Files:**
- Create: `src/app/page.tsx` (또는 기존 랜딩 수정)
- Create: `src/components/waitlist-form.tsx`
- Create: `src/app/api/waitlist/route.ts`

**Step 1: 대기자 명단 테이블 추가**
```sql
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);
```

**Step 2: API 라우트**
```typescript
// src/app/api/waitlist/route.ts
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

  return NextResponse.json({ message: '대기자 명단에 등록되었습니다!' })
}
```

**Step 3: 폼 컴포넌트**
```typescript
// src/components/waitlist-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    
    if (res.ok) {
      setStatus('success')
      setMessage(data.message)
      setEmail('')
    } else {
      setStatus('error')
      setMessage(data.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === 'loading' || status === 'success'}
      />
      <Button type="submit" disabled={status === 'loading' || status === 'success'}>
        {status === 'loading' ? '등록 중...' : '대기자 등록'}
      </Button>
    </form>
  )
}
```

**Step 4: 커밋**
```bash
git add .
git commit -m "feat: add waitlist email collection form"
```

---

### Task 5: 개인정보 입력 폼 (스캔 요청)

**Objective:** 이름 + 이메일 + 전화번호 입력 → Supabase에 scan 레코드 생성

**Files:**
- Create: `src/app/scan/page.tsx`
- Create: `src/components/scan-request-form.tsx`
- Create: `src/app/api/scan/route.ts`
- Create: `src/lib/validations/scan.ts`

**Step 1: Zod 검증 스키마**
```typescript
// src/lib/validations/scan.ts
import { z } from 'zod'

export const scanRequestSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 전화번호를 입력해주세요'),
})
```

**Step 2: API 라우트**
```typescript
// src/app/api/scan/route.ts
import { createClient } from '@/lib/supabase/server'
import { scanRequestSchema } from '@/lib/validations/scan'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = scanRequestSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, phone } = parsed.data
  const supabase = await createClient()

  // upsert user
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({ email, name, phone }, { onConflict: 'email' })
    .select()
    .single()

  if (userError) {
    return NextResponse.json({ error: '사용자 등록 실패' }, { status: 500 })
  }

  // create scan
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .insert({ user_id: user.id, status: 'pending' })
    .select()
    .single()

  if (scanError) {
    return NextResponse.json({ error: '스캔 생성 실패' }, { status: 500 })
  }

  return NextResponse.json({ 
    scanId: scan.id, 
    message: '스캔이 요청되었습니다. 24시간 이내 결과를 이메일로 발송합니다.' 
  })
}
```

**Step 3: 폼 컴포넌트**
```typescript
// src/components/scan-request-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ScanRequestForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    
    if (res.ok) {
      setStatus('success')
      setMessage(data.message)
    } else {
      setStatus('error')
      setMessage(data.error?.message || '오류가 발생했습니다')
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>무료 노출 검사</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="phone">전화번호</Label>
            <Input id="phone" placeholder="01012345678" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
          </div>
          <Button type="submit" className="w-full" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? '요청 중...' : '스캔 요청하기'}
          </Button>
          {message && <p className={status === 'success' ? 'text-green-600' : 'text-red-600'}>{message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 4: 커밋**
```bash
git add .
git commit -m "feat: add scan request form with validation"
```

---

## Phase 2: 결과 이메일 발송

### Task 6: Resend 이메일 설정

**Objective:** Resend 클라이언트 유틸리티 + 스캔 결과 이메일 템플릿

**Files:**
- Create: `src/lib/email/client.ts`
- Create: `src/lib/email/templates/scan-result.tsx`
- Create: `src/app/api/scan/notify/route.ts`

**Step 1: Resend 클라이언트**
```typescript
// src/lib/email/client.ts
import Resend from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

**Step 2: 스캔 결과 이메일 템플릿**
```typescript
// src/lib/email/templates/scan-result.tsx
import { Html, Body, Container, Text, Heading, Hr, Button } from '@react-email/components'

interface ScanResultEmailProps {
  name: string
  totalFound: number
  previewItems: { broker: string; dataFound: string }[]
  scanId: string
}

export function ScanResultEmail({ name, totalFound, previewItems, scanId }: ScanResultEmailProps) {
  return (
    <Html>
      <Body style={{ fontFamily: 'system-ui' }}>
        <Container>
          <Heading>클리어미 스캔 결과</Heading>
          <Text>{name}님, 개인정보 노출 스캔이 완료되었습니다.</Text>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            총 {totalFound}곳에서 발견됨
          </Text>
          <Hr />
          <Heading as="h3">미리보기 ({previewItems.length}건)</Heading>
          {previewItems.map((item, i) => (
            <Container key={i}>
              <Text><strong>{item.broker}</strong>: {item.dataFound}</Text>
            </Container>
          ))}
          <Hr />
          <Text>나머지 {totalFound - previewItems.length}건의 결과는 결제 후 확인 가능합니다.</Text>
          <Button href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?scan=${scanId}`}>
            지금 삭제 시작하기
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

**Step 3: React Email 패키지 설치**
```bash
npm install @react-email/components resend
```

**Step 4: 커밋**
```bash
git add .
git commit -m "feat: add Resend client + scan result email template"
```

---

### Task 7: 스캔 완료 알림 API

**Objective:** 수동 스캔 완료 후 관리자가 호출 → 사용자에게 결과 이메일 발송

**Files:**
- Create: `src/app/api/admin/scan-complete/route.ts`

**Step 1: 관리자 API (Service Role Key 사용)**
```typescript
// src/app/api/admin/scan-complete/route.ts
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

  // get scan with exposures
  const { data: scan } = await supabase
    .from('scans')
    .select('*, exposures(*)')
    .eq('id', scanId)
    .single()

  if (!scan) {
    return NextResponse.json({ error: '스캔을 찾을 수 없습니다' }, { status: 404 })
  }

  // get user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', scan.user_id)
    .single()

  if (!user?.email) {
    return NextResponse.json({ error: '사용자 이메일 없음' }, { status: 400 })
  }

  // preview items (first 3)
  const previewItems = scan.exposures.slice(0, 3).map((e: any) => ({
    broker: e.broker_name,
    dataFound: `${e.data_found?.name || ''} ${e.data_found?.phone || ''}`,
  }))

  // send email
  await resend.emails.send({
    from: '클리어미 <noreply@clearme.kr>',
    to: user.email,
    subject: `[클리어미] ${user.name}님의 스캔 결과 — ${scan.exposures.length}곳 발견`,
    react: ScanResultEmail({
      name: user.name,
      totalFound: scan.exposures.length,
      previewItems,
      scanId: scan.id,
    }),
  })

  // update scan status
  await supabase.from('scans').update({ status: 'complete' }).eq('id', scanId)

  return NextResponse.json({ message: '이메일 발송 완료' })
}
```

**Step 2: 커밋**
```bash
git add .
git commit -m "feat: add admin scan-complete API with email notification"
```

---

## Phase 3: 관리자 도구 (수동 스캔 워크플로우)

### Task 8: 관리자 대시보드 — 스캔 대기 목록

**Objective:** 대기 중인 스캔 목록 보기 + exposure 수동 입력

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/scan/[id]/page.tsx`
- Create: `src/components/admin/scan-list.tsx`
- Create: `src/components/admin/exposure-form.tsx`

**Step 1: 관리자 대시보드 (간단한 목록)**
```typescript
// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: pendingScans } = await supabase
    .from('scans')
    .select('*, users(name, email, phone)')
    .eq('status', 'pending')
    .order('scanned_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">관리자 — 대기 중 스캔</h1>
      <table className="w-full">
        <thead>
          <tr><th>이름</th><th>이메일</th><th>전화번호</th><th>요청일</th><th></th></tr>
        </thead>
        <tbody>
          {pendingScans?.map((scan: any) => (
            <tr key={scan.id}>
              <td>{scan.users?.name}</td>
              <td>{scan.users?.email}</td>
              <td>{scan.users?.phone}</td>
              <td>{new Date(scan.scanned_at).toLocaleDateString()}</td>
              <td><a href={`/admin/scan/${scan.id}`} className="text-blue-600">처리</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Step 2: 스캔 처리 페이지 (exposure 입력)**
```typescript
// src/app/admin/scan/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ExposureForm } from '@/components/admin/exposure-form'

export default async function ScanDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: scan } = await supabase
    .from('scans')
    .select('*, users(*), exposures(*)')
    .eq('id', params.id)
    .single()

  if (!scan) return <div>스캔을 찾을 수 없습니다</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>스캔 처리 — {scan.users?.name}</h1>
      <p className="text-sm text-gray-500">전화번호: {scan.users?.phone}</p>
      <ExposureForm scanId={scan.id} exposures={scan.exposures} />
    </div>
  )
}
```

**Step 3: Exposure 입력 폼**
```typescript
// src/components/admin/exposure-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ExposureForm({ scanId, exposures: initialExposures }: { scanId: string; exposures: any[] }) {
  const [entries, setEntries] = useState(initialExposures || [])
  const [newEntry, setNewEntry] = useState({ broker: '', url: '', name: '', phone: '' })

  async function addExposure() {
    const res = await fetch('/api/admin/exposure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId, ...newEntry }),
    })
    if (res.ok) {
      const data = await res.json()
      setEntries([...entries, data])
      setNewEntry({ broker: '', url: '', name: '', phone: '' })
    }
  }

  async function completeScan() {
    await fetch('/api/admin/scan-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId }),
    })
    alert('이메일 발송 완료!')
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-4 gap-2">
        <Input placeholder="브로커명" value={newEntry.broker} onChange={(e) => setNewEntry({...newEntry, broker: e.target.value})} />
        <Input placeholder="URL" value={newEntry.url} onChange={(e) => setNewEntry({...newEntry, url: e.target.value})} />
        <Input placeholder="노출된 이름" value={newEntry.name} onChange={(e) => setNewEntry({...newEntry, name: e.target.value})} />
        <Input placeholder="노출된 전화번호" value={newEntry.phone} onChange={(e) => setNewEntry({...newEntry, phone: e.target.value})} />
      </div>
      <Button onClick={addExposure}>항목 추가</Button>

      <div className="mt-6">
        <h3>발견된 항목 ({entries.length})</h3>
        {entries.map((e: any, i: number) => (
          <div key={i} className="border p-2 mt-2">{e.broker_name} — {e.data_found?.name}</div>
        ))}
      </div>

      {entries.length > 0 && (
        <Button onClick={completeScan} variant="default">스캔 완료 + 이메일 발송</Button>
      )}
    </div>
  )
}
```

**Step 4: 커밋**
```bash
git add .
git commit -m "feat: add admin dashboard for manual scan processing"
```

---

### Task 9: Vercel 배포

**Objective:** 프로덕션 배포 + 환경변수 설정

**Step 1: Vercel 프로젝트 연결**
```bash
npx vercel --prod
```

**Step 2: 환경변수 설정** (Vercel 대시보드에서)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_BASE_URL=https://clearme.kr (또는 vercel 도메인)
```

**Step 3: 배포 확인**
```bash
curl -s https://your-domain.vercel.app/api/waitlist -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com"}'
```

**Step 4: 커밋**
```bash
git add .
git commit -m "chore: configure Vercel deployment"
```

---

## 체크리스트 — Month 1 완료 기준

- [ ] 랜딩 페이지에 이메일 수집 폼 동작
- [ ] `/scan`에서 개인정보 입력 → DB 저장
- [ ] 관리자 대시보드에서 대기 스캔 확인
- [ ] 관리자가 exposure 항목 수동 입력
- [ ] "스캔 완료" 클릭 → 사용자에게 이메일 발송
- [ ] Vercel에 배포됨
- [ ] 지인 10명에게 공유 + 클릭률 측정
