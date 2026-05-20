     1|# 클리어미 MVP — Month 1 검증 단계 구현 계획
     2|
     3|> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
     4|
     5|**Goal:** 이메일 수집 → 수동 스캔 → 결과 이메일 발송까지의 핵심 플로우 구축. 첫 무료 사용자 10명 처리 가능 상태 만들기.
     6|
     7|**Architecture:** Next.js 14 App Router + Supabase (Auth, DB, Edge Functions) + Resend (이메일). 프론트는 Vercel에 배포. 스캔은 반자동 (Playwright는 Month 2).
     8|
     9|**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Resend
    10|
    11|---
    12|
    13|## Phase 0: 프로젝트 초기화
    14|
    15|### Task 1: Next.js 프로젝트 생성
    16|
    17|**Objective:** 클리어미 프로젝트 스캐폴딩 생성
    18|
    19|**Files:**
    20|- Create: `machimpyo/` (프로젝트 루트)
    21|
    22|**Step 1: Next.js 앱 생성**
    23|```bash
    24|cd /mnt/c/Users/wlstn/Desktop
    25|npx create-next-app@latest clearme --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
    26|```
    27|
    28|**Step 2: shadcn/ui 초기화**
    29|```bash
    30|cd clearme
    31|npx shadcn@latest init -d
    32|```
    33|
    34|**Step 3: 필수 패키지 설치**
    35|```bash
    36|npm install @supabase/supabase-js @supabase/ssr resend zod react-hook-form @hookform/resolvers
    37|```
    38|
    39|**Step 4: Git 초기화 + 첫 커밋**
    40|```bash
    41|git init
    42|git add .
    43|git commit -m "init: Next.js 14 + shadcn/ui + Supabase + Resend"
    44|```
    45|
    46|**Step 5: GitHub 리포 생성 + 푸시**
    47|```bash
    48|gh repo create machimpyo --private --source=. --push
    49|```
    50|
    51|---
    52|
    53|### Task 2: Supabase 클라이언트 설정
    54|
    55|**Objective:** Supabase 클라이언트 유틸리티 생성 (브라우저/서버 분리)
    56|
    57|**Files:**
    58|- Create: `src/lib/supabase/client.ts`
    59|- Create: `src/lib/supabase/server.ts`
    60|- Create: `src/lib/supabase/middleware.ts`
    61|- Create: `.env.local`
    62|
    63|**Step 1: 환경변수 설정**
    64|```bash
    65|# .env.local
    66|NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
    67|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
    68|SUPABASE_SERVICE_ROLE_KEY=eyJxxx
    69|```
    70|
    71|**Step 2: 브라우저 클라이언트**
    72|```typescript
    73|// src/lib/supabase/client.ts
    74|import { createBrowserClient } from '@supabase/ssr'
    75|
    76|export function createClient() {
    77|  return createBrowserClient(
    78|    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    79|    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    80|  )
    81|}
    82|```
    83|
    84|**Step 3: 서버 클라이언트**
    85|```typescript
    86|// src/lib/supabase/server.ts
    87|import { createServerClient } from '@supabase/ssr'
    88|import { cookies } from 'next/headers'
    89|
    90|export async function createClient() {
    91|  const cookieStore = await cookies()
    92|  return createServerClient(
    93|    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    94|    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    95|    {
    96|      cookies: {
    97|        getAll() { return cookieStore.getAll() },
    98|        setAll(cookiesToSet) {
    99|          cookiesToSet.forEach(({ name, value, options }) =>
   100|            cookieStore.set(name, value, options)
   101|          )
   102|        },
   103|      },
   104|    }
   105|  )
   106|}
   107|```
   108|
   109|**Step 4: 커밋**
   110|```bash
   111|git add .
   112|git commit -m "feat: add Supabase client utilities (browser + server)"
   113|```
   114|
   115|---
   116|
   117|## Phase 1: DB 스키마 + 이메일 수집
   118|
   119|### Task 3: Supabase 마이그레이션 — 핵심 테이블
   120|
   121|**Objective:** users, scans, exposures, brokers 테이블 생성
   122|
   123|**Files:**
   124|- Create: `supabase/migrations/20260520_initial_schema.sql`
   125|
   126|**Step 1: SQL 마이그레이션 작성**
   127|```sql
   128|-- supabase/migrations/20260520_initial_schema.sql
   129|
   130|-- 사용자
   131|create table users (
   132|  id uuid default gen_random_uuid() primary key,
   133|  email text unique not null,
   134|  name text,
   135|  phone text,
   136|  address text,
   137|  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
   138|  created_at timestamptz default now()
   139|);
   140|
   141|-- 브로커 목록
   142|create table brokers (
   143|  id uuid default gen_random_uuid() primary key,
   144|  name text not null,
   145|  url text,
   146|  removal_url text,
   147|  method text check (method in ('form', 'email', 'manual')),
   148|  avg_days int default 14,
   149|  priority int default 2 check (priority between 1 and 3),
   150|  active boolean default true
   151|);
   152|
   153|-- 스캔 결과
   154|create table scans (
   155|  id uuid default gen_random_uuid() primary key,
   156|  user_id uuid references users(id) on delete cascade,
   157|  scanned_at timestamptz default now(),
   158|  total_found int default 0,
   159|  status text default 'pending' check (status in ('pending', 'processing', 'complete'))
   160|);
   161|
   162|-- 발견된 항목
   163|create table exposures (
   164|  id uuid default gen_random_uuid() primary key,
   165|  scan_id uuid references scans(id) on delete cascade,
   166|  broker_id uuid references brokers(id),
   167|  broker_name text not null,
   168|  url text,
   169|  data_found jsonb,
   170|  status text default 'found' check (status in ('found', 'removal_requested', 'removed')),
   171|  removal_requested_at timestamptz,
   172|  removed_at timestamptz
   173|);
   174|
   175|-- RLS (Row Level Security)
   176|alter table users enable row level security;
   177|alter table scans enable row level security;
   178|alter table exposures enable row level security;
   179|
   180|create policy "Users can read own data" on users for select using (auth.uid() = id);
   181|create policy "Users can read own scans" on scans for select using (auth.uid() = user_id);
   182|create policy "Users can read own exposures" on exposures for select using (
   183|  scan_id in (select id from scans where user_id = auth.uid())
   184|);
   185|```
   186|
   187|**Step 2: Supabase에 마이그레이션 적용**
   188|```bash
   189|npx supabase db push
   190|```
   191|
   192|**Step 3: 브로커 시드 데이터**
   193|```sql
   194|-- supabase/seed.sql
   195|insert into brokers (name, url, method, priority) values
   196|  ('Spokeo', 'https://www.spokeo.com', 'form', 1),
   197|  ('BeenVerified', 'https://www.beenverified.com', 'form', 1),
   198|  ('Whitepages', 'https://www.whitepages.com', 'form', 1),
   199|  ('FastPeopleSearch', 'https://www.fastpeoplesearch.com', 'form', 1),
   200|  ('Radaris', 'https://radaris.com', 'form', 1),
   201|  ('MyLife', 'https://www.mylife.com', 'form', 2),
   202|  ('PeopleFinder', 'https://www.peoplefinder.com', 'form', 2),
   203|  ('Intelius', 'https://www.intelius.com', 'form', 2),
   204|  ('TruthFinder', 'https://www.truthfinder.com', 'form', 2),
   205|  ('ZoomInfo', 'https://www.zoominfo.com', 'email', 2),
   206|  ('Pipl', 'https://pipl.com', 'email', 2),
   207|  ('네이버 인물검색', 'https://search.naver.com', 'manual', 1),
   208|  ('카카오 검색', 'https://search.kakao.com', 'manual', 2),
   209|  ('잡코리아', 'https://www.jobkorea.co.kr', 'form', 2),
   210|  ('사람인', 'https://www.saramin.co.kr', 'form', 2),
   211|  ('LinkedIn KR', 'https://kr.linkedin.com', 'manual', 2),
   212|  ('블라인드', 'https://www.teamblind.com', 'manual', 3),
   213|  ('페이스북', 'https://www.facebook.com', 'manual', 3),
   214|  ('공공데이터포털', 'https://www.data.go.kr', 'manual', 3),
   215|  ('원스톱 민원포털', 'https://www.epeople.go.kr', 'manual', 3);
   216|```
   217|
   218|**Step 4: 커밋**
   219|```bash
   220|git add .
   221|git commit -m "feat: add DB schema + broker seed data"
   222|```
   223|
   224|---
   225|
   226|### Task 4: 대기자 명단 이메일 수집 폼
   227|
   228|**Objective:** 랜딩 페이지에 이메일 수집 폼 연결 (Supabase에 저장)
   229|
   230|**Files:**
   231|- Create: `src/app/page.tsx` (또는 기존 랜딩 수정)
   232|- Create: `src/components/waitlist-form.tsx`
   233|- Create: `src/app/api/waitlist/route.ts`
   234|
   235|**Step 1: 대기자 명단 테이블 추가**
   236|```sql
   237|create table waitlist (
   238|  id uuid default gen_random_uuid() primary key,
   239|  email text unique not null,
   240|  created_at timestamptz default now()
   241|);
   242|```
   243|
   244|**Step 2: API 라우트**
   245|```typescript
   246|// src/app/api/waitlist/route.ts
   247|import { createClient } from '@/lib/supabase/server'
   248|import { NextRequest, NextResponse } from 'next/server'
   249|
   250|export async function POST(request: NextRequest) {
   251|  const { email } = await request.json()
   252|  
   253|  if (!email || !email.includes('@')) {
   254|    return NextResponse.json({ error: '유효한 이메일을 입력해주세요' }, { status: 400 })
   255|  }
   256|
   257|  const supabase = await createClient()
   258|  const { error } = await supabase.from('waitlist').insert({ email })
   259|  
   260|  if (error?.code === '23505') {
   261|    return NextResponse.json({ message: '이미 등록된 이메일입니다' })
   262|  }
   263|  if (error) {
   264|    return NextResponse.json({ error: '등록 중 오류가 발생했습니다' }, { status: 500 })
   265|  }
   266|
   267|  return NextResponse.json({ message: '대기자 명단에 등록되었습니다!' })
   268|}
   269|```
   270|
   271|**Step 3: 폼 컴포넌트**
   272|```typescript
   273|// src/components/waitlist-form.tsx
   274|'use client'
   275|
   276|import { useState } from 'react'
   277|import { Button } from '@/components/ui/button'
   278|import { Input } from '@/components/ui/input'
   279|
   280|export function WaitlistForm() {
   281|  const [email, setEmail] = useState('')
   282|  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
   283|  const [message, setMessage] = useState('')
   284|
   285|  async function handleSubmit(e: React.FormEvent) {
   286|    e.preventDefault()
   287|    setStatus('loading')
   288|    
   289|    const res = await fetch('/api/waitlist', {
   290|      method: 'POST',
   291|      headers: { 'Content-Type': 'application/json' },
   292|      body: JSON.stringify({ email }),
   293|    })
   294|    const data = await res.json()
   295|    
   296|    if (res.ok) {
   297|      setStatus('success')
   298|      setMessage(data.message)
   299|      setEmail('')
   300|    } else {
   301|      setStatus('error')
   302|      setMessage(data.error)
   303|    }
   304|  }
   305|
   306|  return (
   307|    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
   308|      <Input
   309|        type="email"
   310|        placeholder="이메일을 입력하세요"
   311|        value={email}
   312|        onChange={(e) => setEmail(e.target.value)}
   313|        required
   314|        disabled={status === 'loading' || status === 'success'}
   315|      />
   316|      <Button type="submit" disabled={status === 'loading' || status === 'success'}>
   317|        {status === 'loading' ? '등록 중...' : '대기자 등록'}
   318|      </Button>
   319|    </form>
   320|  )
   321|}
   322|```
   323|
   324|**Step 4: 커밋**
   325|```bash
   326|git add .
   327|git commit -m "feat: add waitlist email collection form"
   328|```
   329|
   330|---
   331|
   332|### Task 5: 개인정보 입력 폼 (스캔 요청)
   333|
   334|**Objective:** 이름 + 이메일 + 전화번호 입력 → Supabase에 scan 레코드 생성
   335|
   336|**Files:**
   337|- Create: `src/app/scan/page.tsx`
   338|- Create: `src/components/scan-request-form.tsx`
   339|- Create: `src/app/api/scan/route.ts`
   340|- Create: `src/lib/validations/scan.ts`
   341|
   342|**Step 1: Zod 검증 스키마**
   343|```typescript
   344|// src/lib/validations/scan.ts
   345|import { z } from 'zod'
   346|
   347|export const scanRequestSchema = z.object({
   348|  name: z.string().min(2, '이름을 입력해주세요'),
   349|  email: z.string().email('유효한 이메일을 입력해주세요'),
   350|  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 전화번호를 입력해주세요'),
   351|})
   352|```
   353|
   354|**Step 2: API 라우트**
   355|```typescript
   356|// src/app/api/scan/route.ts
   357|import { createClient } from '@/lib/supabase/server'
   358|import { scanRequestSchema } from '@/lib/validations/scan'
   359|import { NextRequest, NextResponse } from 'next/server'
   360|
   361|export async function POST(request: NextRequest) {
   362|  const body = await request.json()
   363|  const parsed = scanRequestSchema.safeParse(body)
   364|  
   365|  if (!parsed.success) {
   366|    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
   367|  }
   368|
   369|  const { name, email, phone } = parsed.data
   370|  const supabase = await createClient()
   371|
   372|  // upsert user
   373|  const { data: user, error: userError } = await supabase
   374|    .from('users')
   375|    .upsert({ email, name, phone }, { onConflict: 'email' })
   376|    .select()
   377|    .single()
   378|
   379|  if (userError) {
   380|    return NextResponse.json({ error: '사용자 등록 실패' }, { status: 500 })
   381|  }
   382|
   383|  // create scan
   384|  const { data: scan, error: scanError } = await supabase
   385|    .from('scans')
   386|    .insert({ user_id: user.id, status: 'pending' })
   387|    .select()
   388|    .single()
   389|
   390|  if (scanError) {
   391|    return NextResponse.json({ error: '스캔 생성 실패' }, { status: 500 })
   392|  }
   393|
   394|  return NextResponse.json({ 
   395|    scanId: scan.id, 
   396|    message: '스캔이 요청되었습니다. 24시간 이내 결과를 이메일로 발송합니다.' 
   397|  })
   398|}
   399|```
   400|
   401|**Step 3: 폼 컴포넌트**
   402|```typescript
   403|// src/components/scan-request-form.tsx
   404|'use client'
   405|
   406|import { useState } from 'react'
   407|import { Button } from '@/components/ui/button'
   408|import { Input } from '@/components/ui/input'
   409|import { Label } from '@/components/ui/label'
   410|import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
   411|
   412|export function ScanRequestForm() {
   413|  const [form, setForm] = useState({ name: '', email: '', phone: '' })
   414|  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
   415|  const [message, setMessage] = useState('')
   416|
   417|  async function handleSubmit(e: React.FormEvent) {
   418|    e.preventDefault()
   419|    setStatus('loading')
   420|    
   421|    const res = await fetch('/api/scan', {
   422|      method: 'POST',
   423|      headers: { 'Content-Type': 'application/json' },
   424|      body: JSON.stringify(form),
   425|    })
   426|    const data = await res.json()
   427|    
   428|    if (res.ok) {
   429|      setStatus('success')
   430|      setMessage(data.message)
   431|    } else {
   432|      setStatus('error')
   433|      setMessage(data.error?.message || '오류가 발생했습니다')
   434|    }
   435|  }
   436|
   437|  return (
   438|    <Card className="max-w-md mx-auto">
   439|      <CardHeader>
   440|        <CardTitle>무료 노출 검사</CardTitle>
   441|      </CardHeader>
   442|      <CardContent>
   443|        <form onSubmit={handleSubmit} className="space-y-4">
   444|          <div>
   445|            <Label htmlFor="name">이름</Label>
   446|            <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
   447|          </div>
   448|          <div>
   449|            <Label htmlFor="email">이메일</Label>
   450|            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
   451|          </div>
   452|          <div>
   453|            <Label htmlFor="phone">전화번호</Label>
   454|            <Input id="phone" placeholder="01012345678" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
   455|          </div>
   456|          <Button type="submit" className="w-full" disabled={status === 'loading' || status === 'success'}>
   457|            {status === 'loading' ? '요청 중...' : '스캔 요청하기'}
   458|          </Button>
   459|          {message && <p className={status === 'success' ? 'text-green-600' : 'text-red-600'}>{message}</p>}
   460|        </form>
   461|      </CardContent>
   462|    </Card>
   463|  )
   464|}
   465|```
   466|
   467|**Step 4: 커밋**
   468|```bash
   469|git add .
   470|git commit -m "feat: add scan request form with validation"
   471|```
   472|
   473|---
   474|
   475|## Phase 2: 결과 이메일 발송
   476|
   477|### Task 6: Resend 이메일 설정
   478|
   479|**Objective:** Resend 클라이언트 유틸리티 + 스캔 결과 이메일 템플릿
   480|
   481|**Files:**
   482|- Create: `src/lib/email/client.ts`
   483|- Create: `src/lib/email/templates/scan-result.tsx`
   484|- Create: `src/app/api/scan/notify/route.ts`
   485|
   486|**Step 1: Resend 클라이언트**
   487|```typescript
   488|// src/lib/email/client.ts
   489|import Resend from 'resend'
   490|
   491|export const resend = new Resend(process.env.RESEND_API_KEY)
   492|```
   493|
   494|**Step 2: 스캔 결과 이메일 템플릿**
   495|```typescript
   496|// src/lib/email/templates/scan-result.tsx
   497|import { Html, Body, Container, Text, Heading, Hr, Button } from '@react-email/components'
   498|
   499|interface ScanResultEmailProps {
   500|  name: string
   501|