import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Shield, Users, CheckCircle2, Clock, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react'

// ─── Types ───────────────────────────────────────────

interface Account {
  id: string
  service_name: string
  category: string
  login_id: string | null
  status: 'pending' | 'deleting' | 'deleted' | 'failed'
  created_at: string
}

interface Guardian {
  id: string
  name: string
  relation: string
  phone: string | null
  email: string | null
}

interface CsvUpload {
  id: string
  file_name: string
  total_found: number
  total_saved: number
  duplicates_skipped: number
  created_at: string
}

interface Profile {
  id: string
  name: string | null
  email: string
  phone: string | null
  plan: string
  status: string
  subscription_started_at: string | null
  created_at: string
}

// ─── Category helpers ────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  sns: 'SNS',
  messenger: '메신저',
  portal: '포털',
  game: '게임',
  commerce: '커머스',
  broker: '정보중개',
  subscription: '구독',
  adult: '성인',
  other: '기타',
}

const CATEGORY_ICON: Record<string, string> = {
  sns: '🌐',
  messenger: '💬',
  portal: '🏛️',
  game: '🎮',
  commerce: '🛒',
  broker: '📋',
  subscription: '📺',
  adult: '🔞',
  other: '📁',
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: '대기', color: '#8c8072' },
  deleting: { label: '처리중', color: '#1e3a5f' },
  deleted: { label: '완료', color: '#2e7d32' },
  failed: { label: '실패', color: '#c62828' },
}

const RELATION_LABEL: Record<string, string> = {
  spouse: '배우자',
  child: '자녀',
  parent: '부모',
  sibling: '형제',
  friend: '친구',
  other: '기타',
}

const PLAN_LABEL: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  family: 'Family',
}

const PLAN_LIMITS: Record<string, string> = {
  basic: '최대 10개',
  pro: '무제한',
  family: '무제한',
}

// ─── Components ──────────────────────────────────────

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: '#faf7f2',
        border: '1px solid rgba(44,36,22,.08)',
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <Card style={{ padding: '18px 16px' }}>
      <div style={{ fontSize: 11, color: '#8c8072', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }} className="font-dm">{value}</div>
      <div style={{ fontSize: 12, color: '#8c8072', marginTop: 2 }}>{sub}</div>
    </Card>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2c2416' }}>{title}</h2>
      {action}
    </div>
  )
}

function PillButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        background: 'rgba(30,58,95,.08)', border: 'none', color: '#1e3a5f',
        borderRadius: 56, padding: '6px 16px', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', textDecoration: 'none', display: 'inline-flex',
        alignItems: 'center', gap: 4, fontFamily: 'inherit',
      }}
    >
      {children}
    </Link>
  )
}

// ─── Main page ──────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/machimpyo/auth/signup')
  }

  // 2. Fetch all data in parallel
  const [
    profileRes,
    accountsRes,
    guardiansRes,
    uploadsRes,
  ] = await Promise.all([
    supabase
      .from('legacy_users')
      .select('id, name, email, phone, plan, status, subscription_started_at, created_at')
      .eq('id', user.id)
      .single<Profile>(),
    supabase
      .from('accounts')
      .select('id, service_name, category, login_id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<Account[]>(),
    supabase
      .from('guardians')
      .select('id, name, relation, phone, email')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .returns<Guardian[]>(),
    supabase
      .from('csv_uploads')
      .select('id, file_name, total_found, total_saved, duplicates_skipped, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<CsvUpload[]>(),
  ])

  if (profileRes.error) {
    console.error('Failed to fetch profile:', profileRes.error)
  }

  const profile = profileRes.data
  const accounts = accountsRes.data || []
  const guardians = guardiansRes.data || []
  const uploads = uploadsRes.data || []

  // Computed stats
  const pendingCount = accounts.filter(a => a.status === 'pending').length
  const deletingCount = accounts.filter(a => a.status === 'deleting').length
  const deletedCount = accounts.filter(a => a.status === 'deleted').length
  const failedCount = accounts.filter(a => a.status === 'failed').length

  // Category breakdown
  const categoryCounts = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1
    return acc
  }, {})

  // Total upload stats
  const totalFound = uploads.reduce((sum, u) => sum + u.total_found, 0)
  const totalSaved = uploads.reduce((sum, u) => sum + u.total_saved, 0)
  const totalDuplicates = uploads.reduce((sum, u) => sum + u.duplicates_skipped, 0)

  // Date formatting
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
  }

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div style={{ padding: '86px 24px 40px', maxWidth: 800, margin: '0 auto' }}>
      {/* ── Welcome ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#1e3a5f', letterSpacing: 3, marginBottom: 6, fontWeight: 600 }}>
          DASHBOARD
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2c2416', lineHeight: 1.3 }}>
          {profile?.name || user.email?.split('@')[0] || '사용자'} 님의{' '}
          <span style={{ color: '#1e3a5f' }}>마침표</span>
        </h1>
        <p style={{ fontSize: 14, color: '#5a4f42', marginTop: 4 }}>
          당신의 디지털 흔적은 안전하게 보관되어 있습니다.
        </p>
      </div>

      {/* ── Status cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}>
        <StatCard
          label="가입 상태"
          value={profile?.status === 'active' ? '정상' : profile?.status || '-'}
          sub={`${PLAN_LABEL[profile?.plan || 'basic'] || 'Basic'} · ${profile?.subscription_started_at ? formatDate(profile.subscription_started_at) : formatDate(profile?.created_at)}`}
          color="#2e7d32"
        />
        <StatCard
          label="등록 계정"
          value={`${accounts.length}개`}
          sub={`${PLAN_LIMITS[profile?.plan || 'basic'] || '최대 10개'}`}
          color="#1e3a5f"
        />
        <StatCard
          label="계정 처리 진행"
          value={`${deletedCount}개`}
          sub={deletingCount > 0 ? `처리중 ${deletingCount}개` : pendingCount > 0 ? `대기 ${pendingCount}개` : '전체 등록 완료'}
          color={deletedCount === accounts.length && accounts.length > 0 ? '#2e7d32' : '#1e3a5f'}
        />
        <StatCard
          label="유족 연락처"
          value={`${guardians.length}명`}
          sub="사망 시 연락"
          color="#1e3a5f"
        />
      </div>

      {/* ── Quick actions ── */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28,
      }}>
        <Link
          href="/machimpyo/accounts/upload"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#1e3a5f', color: '#fff', border: 'none',
            borderRadius: 56, padding: '10px 20px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
            transition: 'transform .2s, background .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#16304d'; e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1e3a5f'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Upload size={14} />
          CSV 업로드
        </Link>
        <Link
          href="/machimpyo/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', color: '#5a4f42', border: '1px solid rgba(44,36,22,.12)',
            borderRadius: 56, padding: '10px 20px', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
            transition: 'all .25s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.color = '#1e3a5f'; e.currentTarget.style.background = 'rgba(30,58,95,.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(44,36,22,.12)'; e.currentTarget.style.color = '#5a4f42'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Shield size={14} />
          위임장 보기
        </Link>
      </div>

      {/* ── Account category breakdown ── */}
      {Object.keys(categoryCounts).length > 0 && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <SectionHeader title="계정 카테고리" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(categoryCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <div
                  key={cat}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(30,58,95,.06)', borderRadius: 56,
                    padding: '4px 10px', fontSize: 12, color: '#5a4f42',
                  }}
                >
                  <span>{CATEGORY_ICON[cat] || '📁'}</span>
                  <span>{CATEGORY_LABEL[cat] || cat}</span>
                  <span style={{ fontWeight: 600, color: '#1e3a5f', marginLeft: 2 }}>{count}개</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* ── Registered accounts ── */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionHeader
          title="등록된 계정"
          action={<PillButton href="/machimpyo/accounts/upload">+ 계정 추가</PillButton>}
        />

        {accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <FileText size={32} style={{ color: '#b0a694', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#8c8072', marginBottom: 8 }}>
              아직 등록된 계정이 없습니다.
            </div>
            <Link
              href="/machimpyo/accounts/upload"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#1e3a5f', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              CSV 업로드로 계정 등록하기 <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {accounts.slice(0, 50).map((acc, i) => (
              <div
                key={acc.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(44,36,22,.06)' : 'none',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>
                    {CATEGORY_ICON[acc.category] || '📁'}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#2c2416', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {acc.service_name}
                    </div>
                    {acc.login_id && (
                      <div style={{ fontSize: 11, color: '#b0a694' }}>{acc.login_id}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, color: '#8c8072', flexShrink: 0,
                    background: 'rgba(44,36,22,.06)', borderRadius: 56,
                    padding: '1px 8px',
                  }}>
                    {CATEGORY_LABEL[acc.category] || acc.category}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, flexShrink: 0,
                  color: STATUS_BADGE[acc.status]?.color || '#8c8072',
                  background: `${STATUS_BADGE[acc.status]?.color || '#8c8072'}12`,
                  borderRadius: 56, padding: '2px 10px',
                }}>
                  {STATUS_BADGE[acc.status]?.label || acc.status}
                </span>
              </div>
            ))}
            {accounts.length > 50 && (
              <div style={{ textAlign: 'center', padding: '10px', fontSize: 12, color: '#8c8072' }}>
                외 {accounts.length - 50}개 계정
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── CSV Upload history ── */}
      {uploads.length > 0 && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <SectionHeader title="CSV 업로드 이력" />

          {/* Upload summary mini-stats */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 14,
            flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(30,58,95,.06)', borderRadius: 10,
              padding: '8px 12px', fontSize: 12, color: '#5a4f42',
            }}>
              <Upload size={14} style={{ color: '#1e3a5f' }} />
              <span>총 <strong style={{ color: '#1e3a5f' }}>{uploads.length}회</strong> 업로드</span>
            </div>
            {totalFound > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(30,58,95,.06)', borderRadius: 10,
                padding: '8px 12px', fontSize: 12, color: '#5a4f42',
              }}>
                <FileText size={14} style={{ color: '#1e3a5f' }} />
                <span><strong style={{ color: '#1e3a5f' }}>{totalSaved}개</strong> 저장됨</span>
              </div>
            )}
            {totalDuplicates > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(44,36,22,.06)', borderRadius: 10,
                padding: '8px 12px', fontSize: 12, color: '#5a4f42',
              }}>
                <span><strong style={{ color: '#8c8072' }}>{totalDuplicates}개</strong> 중복 제외</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {uploads.map((upload, i) => (
              <div
                key={upload.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderTop: i > 0 ? '1px solid rgba(44,36,22,.06)' : 'none',
                  gap: 8, flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(30,58,95,.08)', fontSize: 11, flexShrink: 0,
                    color: '#1e3a5f', fontWeight: 600,
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2c2416' }}>
                      {upload.file_name}
                    </div>
                    <div style={{ fontSize: 11, display: 'flex', gap: 8, color: '#8c8072', marginTop: 2 }}>
                      <span>발견 {upload.total_found}개</span>
                      <span>저장 {upload.total_saved}개</span>
                      {upload.duplicates_skipped > 0 && <span>중복 {upload.duplicates_skipped}개</span>}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#b0a694', flexShrink: 0 }}>
                  {formatDateTime(upload.created_at)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Guardians ── */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionHeader title="유족 연락처" />

        {guardians.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <Users size={32} style={{ color: '#b0a694', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#8c8072' }}>
              등록된 유족 연락처가 없습니다.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {guardians.map((g, i) => (
              <div
                key={g.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', borderTop: i > 0 ? '1px solid rgba(44,36,22,.06)' : 'none',
                }}
              >
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#2c2416' }}>{g.name}</span>
                  <span style={{
                    fontSize: 11, color: '#8c8072', marginLeft: 8,
                    background: 'rgba(44,36,22,.06)', borderRadius: 56,
                    padding: '1px 8px',
                  }}>
                    {RELATION_LABEL[g.relation] || g.relation}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: '#8c8072' }}>{g.phone || g.email || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Waiver info ── */}
      <div style={{
        background: 'rgba(30,58,95,.04)', border: '1px solid rgba(30,58,95,.12)',
        borderRadius: 14, padding: '16px 20', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <CheckCircle2 size={18} style={{ color: '#1e3a5f', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: '#5a4f42', lineHeight: 1.7 }}>
            <span style={{ fontWeight: 600, color: '#2c2416' }}>위임장</span>이 법적 효력을 가지고 있습니다.
            유족이 정리 중단을 요청해도{' '}
            <span style={{ fontWeight: 600, color: '#1e3a5f' }}>고인의 의사가 최우선</span>으로 실행됩니다.
          </div>
        </div>
      </div>

      {/* ── CSV upload stats (if none yet) ── */}
      {uploads.length === 0 && accounts.length === 0 && (
        <Card style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, marginBottom: 16 }}>
            아직 등록된 데이터가 없습니다.
          </div>
          <Link
            href="/machimpyo/accounts/upload"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#1e3a5f', color: '#fff', border: 'none',
              borderRadius: 56, padding: '12px 24px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
              transition: 'transform .2s, background .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#16304d'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e3a5f'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Upload size={16} />
            첫 CSV 업로드 시작하기
          </Link>
        </Card>
      )}

      {/* ── Account status summary (if there are accounts) ── */}
      {accounts.length > 0 && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <SectionHeader title="계정 처리 현황" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(44,36,22,.04)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#8c8072' }}>{pendingCount}</div>
              <div style={{ fontSize: 11, color: '#8c8072', marginTop: 2 }}>대기</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(30,58,95,.06)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f' }}>{deletingCount}</div>
              <div style={{ fontSize: 11, color: '#8c8072', marginTop: 2 }}>처리중</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(46,125,50,.06)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2e7d32' }}>{deletedCount}</div>
              <div style={{ fontSize: 11, color: '#8c8072', marginTop: 2 }}>완료</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: failedCount > 0 ? 'rgba(198,40,40,.06)' : 'rgba(44,36,22,.04)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: failedCount > 0 ? '#c62828' : '#8c8072' }}>{failedCount}</div>
              <div style={{ fontSize: 11, color: '#8c8072', marginTop: 2 }}>실패</div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Plan info ── */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionHeader title="요금제 정보" />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(30,58,95,.08)', borderRadius: 10,
            padding: '8px 14px', fontSize: 14, fontWeight: 600, color: '#1e3a5f',
          }}>
            {PLAN_LABEL[profile?.plan || 'basic'] || 'Basic'}
          </div>
          <div style={{ fontSize: 12, color: '#8c8072' }}>
            가입일: {formatDate(profile?.subscription_started_at || profile?.created_at)}
          </div>
          <div style={{ fontSize: 12, color: '#8c8072' }}>
            계정 제한: {PLAN_LIMITS[profile?.plan || 'basic']}
          </div>
        </div>
      </Card>

      {/* ── Footer links ── */}
      <div style={{ borderTop: '1px solid rgba(44,36,22,.06)', paddingTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/machimpyo/dashboard" style={{ fontSize: 13, color: '#8c8072', textDecoration: 'none' }}>
          대시보드 새로고침
        </Link>
        <Link href="/machimpyo/accounts/upload" style={{ fontSize: 13, color: '#8c8072', textDecoration: 'none' }}>
          CSV 업로드
        </Link>
      </div>
    </div>
  )
}
