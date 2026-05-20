# AI Agent 설계 — 마침표(Fin.) 사망 감지 및 계정 정리 엔진

> **Version:** 1.0  
> **Stack:** Next.js 16 + TypeScript + Supabase + Resend  
> **Design Status:** Approved

---

## 1. 개요

AI Agent(이하 에이전트)는 마침표 서비스의 핵심 실행 엔진이다. 가입자가 사망했을 때 이를 감지하고, 등록된 계정에 대해 삭제·이전·통지 절차를 자동 수행한다. 사용자는 "자동으로 처리된다"는 경험만 알면 되며, 내부 메커니즘을 알 필요가 없다.

### 1.1 설계 원칙

| 원칙 | 설명 |
|---|---|
| **사용자는 모른다** | 모든 절차는 자동으로 백그라운드에서 실행. 사용자는 결과만 확인 |
| **그냥 삭제** | 포인트·캐시 신경 안 쓰고 그냥 삭제. 사전 제외 요청만 존중 |
| **법적 근거** | 모든 절차는 민법·개인정보보호법 등 현행법에 기반 |
| **유족 부담 제로** | 유족의 개입 없이 모든 절차가 완료되어야 함 |

---

## 2. 사망 감지 서브시스템 (Death Detection)

### 2.1 3가지 감지 신호

에이전트는 3개의 독립적인 신호를 통해 사망을 감지한다. 단일 신호만으로 확정하지 않으며, 최소 2개 신호 교차 검증 후 상태 전이한다.

#### 신호 1: 인액티비티 (Inactivity)

- 사용자의 마지막 로그인/활동으로부터 **일정 기간(기본 90일)** 경과 시 점검 시작
- 대시보드 접속, 이메일 클릭, 결제 등 모든 사용자 액션으로 카운터 리셋
- 단독으로는 사망으로 확정하지 않음 (장기 여행·입원 가능성)

#### 신호 2: 체크인 (Check-in)

- **주기:** 30일마다 이메일로 체크인 요청 발송
- **방식:** 이메일 내 링크 클릭 → "저는 아직 살아있습니다" 확인
- **N회(기본 3회)** 미응답 시 → 인액티비티 신호와 결합하여 사망 의심
- 체크인은 사용자가 직접 끌 수 있음 (설정에서 off 가능, 단 경고 표시)

#### 신호 3: 외부 확인 (External Verification)

- **공공 마이데이터 API:** 사망자 정보 조회 (행정안전부, 매일 1회 폴링)
- **유족 신고:** 유족이 별도 창구를 통해 사망 신고 (사망증명서 첨부 필수)
- **장례업체 연동:** 차후 파트너십을 통한 자동 통보

### 2.2 3단계 검증 파이프라인

```
[Trigger] → [Phase 1: 의심] → [Phase 2: 검증] → [Phase 3: 확정]
```

| 단계 | 조건 | 액션 |
|---|---|---|
| **의심** | 신호 1개 활성화 | 내부 플래그 설정, 추가 신호 대기 |
| **검증** | 신호 2개 이상 교차 | 관리자 알림, 2차 확인 대기 (48시간) |
| **확정** | 최소 2개 신호 + 48시간 대기 | 사망 상태 전이, 실행 엔진 호출 |

### 2.3 상태 머신

```
       ┌─────────┐
       │  정상   │ ←── 체크인 응답 / 로그인
       └────┬────┘
            │ 신호 감지
       ┌────▼────┐
       │  의심   │ ←── 추가 신호 대기 (타임아웃 7일)
       └────┬────┘
            │ 신호 교차
       ┌────▼────┐
       │  확인   │ ←── 48시간 대기 (false alarm 가능)
       └────┬────┘
            │ 확정
       ┌────▼────┐
       │  사망   │ → 실행 엔진 호출
       └─────────┘
```

#### False Alarm 복구

- 사망 확정 이후 사용자가 로그인/체크인 → 즉시 상태 복구
- 복구 시 모든 실행 대기열 취소, 알림 전송 ("잘못된 알림이었습니다")
- 복구 이력 로깅 (재발 방지용 학습 데이터)

---

## 3. 데이터 실행 엔진 (Data Execution Engine)

사망이 확정되면 에이전트는 등록된 계정에 대해 **카테고리별 삭제/이전/통지**를 수행한다.

### 3.1 카테고리별 처리

| 카테고리 | 기본 처리 | 비고 |
|---|---|---|
| SNS | 삭제 | 삭제 전 마지막 메시지 게시 옵션 |
| 메신저 | 삭제 | 카카오톡·텔레그램 등 |
| 포털 | 삭제 | 네이버·다음·구글 계정 |
| 게임 | 삭제 | 스팀·라이엇·넥슨 등 |
| 커머스 | 삭제 | 쿠팡·G마켓·11번가 등 |
| 정보중개 | 삭제 | 부동산·중고거래 플랫폼 |
| 구독 | 삭제+해지 | Netflix·Spotify 등 결제 해지 포함 |
| 성인 | 삭제 | |
| 기타 | 삭제 | |
| **제외 요청** | **보존** | 사용자가 대시보드에서 지정한 계정 |

### 3.2 Soft → Hard Delete 프로토콜

```
[1] Soft Delete 요청 (이메일 발송)
    ↓ 7일 대기
[2] Hard Delete 재요청 (내용증명)
    ↓ 23일 대기 (총 30일 마감)
[3] 법적 조치 (개인정보보호위 신고)
```

| 단계 | 기간 | 방법 | 내용 |
|---|---|---|---|
| 1차 요청 | Day 0 | 이메일 | 위임장 + 사망증명서 PDF 첨부, 각 플랫폼 고객센터 발송 |
| 2차 재요청 | Day 7 | 등기/이메일 | 미응답 시 재발송, 내용증명 포함 |
| 법적 조치 | Day 30 | 개인정보보호위 신고 | 제58조의2·제75조에 따른 신고 |
| 완료 | Day 30+ | — | 처리 완료 로깅, 유족 통지(옵션) |

### 3.3 암호화 전송

- 모든 요청 이메일은 TLS 전송
- 첨부 PDF(위임장·사망증명서)는 AES-256-GCM 암호화
- 비밀번호는 절대 평문으로 포함되지 않음 (위임장에 "비밀번호를 모릅니다" 명시)

---

## 4. 법적 통지 워크플로우

### 4.1 5가지 통지 유형

| 유형 | 대상 | 채널 | 시점 |
|---|---|---|---|
| 사망 확인 통지 | 유족(등록된 보호자) | 이메일 | 사망 확정 즉시 |
| 삭제 요청 | 각 플랫폼 고객센터 | 이메일 | 사망 확정 + 24시간 이내 |
| 진행 상황 업데이트 | 유족(옵션) | 이메일 | 주 1회 또는 상태 변경 시 |
| 미응답 경고 | 플랫폼 | 재이메일 + 등기 | Day 14, Day 25 |
| 법적 조치 개시 | 개인정보보호위원회 | 공문 | Day 30 |

### 4.2 법적 근거 (Korean PIPA Compliance)

| 조항 | 내용 |
|---|---|
| 개인정보보호법 제58조의2 | 고인 개인정보 처리 — 법정상속인 또는 위임받은 자의 요청 가능 |
| 개인정보보호법 제75조 | 과태료 — 정당한 요청 3년 이상 미응답 시 3천만원 이하 |
| 민법 제680조 | 위임 — 본인 대리 권한 |
| 민법 제147조 | 정지조건부 — 사망 시 효력 발생 |
| KISO 정책규정 제28~29조 | 상속인 권리, 계정 폐쇄 요구 절차 |
| 전자상거래법 제12조 | 통신판매업 신고 근거 |

### 4.3 컴플라이언스 로그

모든 법적 절차는 감사 가능한 로그로 남긴다:

```sql
-- compliance_logs (신규 테이블)
- id: UUID
- user_id: UUID → legacy_users
- action_type: 'death_confirmed' | 'email_sent' | 'legal_notice' | 'pipa_report'
- target: text (플랫폰명 또는 기관명)
- evidence_url: text (PDF 보관 경로)
- law_reference: text (해당 법조문)
- created_at: timestamptz
```

---

## 5. 데이터베이스 스키마

기존 `legacy_users`·`accounts`·`guardians`·`legal_waivers`·`death_detections`·`deletion_requests`·`deletion_logs`·`notification_logs` 8개 테이블에 더해 AI Agent 전용 테이블:

### 5.1 신규 테이블

#### `user_death_status`

```sql
create table user_death_status (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade unique,
  status text not null default 'active'
    check (status in ('active', 'suspected', 'verifying', 'confirmed', 'false_alarm')),
  suspicion_reason text,        -- 최초 의심 사유
  suspicion_at timestamptz,
  verified_at timestamptz,
  confirmed_at timestamptz,
  false_alarm_at timestamptz,
  check_in_consecutive_miss int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `digital_wills`

```sql
create table digital_wills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  content_type text not null check (content_type in ('text', 'image')),
  content text,
  image_url text,
  target_service text,          -- 특정 SNS 지정 (null = 전체)
  scheduled_at timestamptz,     -- 사망 확정 시 게시 예약
  posted_at timestamptz,
  status text default 'pending' check (status in ('pending', 'posted', 'failed')),
  created_at timestamptz default now()
);
```

#### `data_instructions`

```sql
create table data_instructions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  action text not null check (action in ('delete', 'preserve', 'transfer')),
  transfer_email text,          -- 이전 대상 (action='transfer' 시)
  note text,                    -- 사용자 메모
  created_at timestamptz default now()
);
```

#### `verifiers`

```sql
create table verifiers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  name text not null,
  relation text not null,
  phone text,
  email text,
  verified_at timestamptz,
  created_at timestamptz default now()
);
```

#### `death_certificates`

```sql
create table death_certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  file_url text not null,       -- Supabase Storage URL
  verified_by uuid references verifiers(id),
  verified_at timestamptz,
  source text not null check (source in ('guardian_upload', 'gov_api', 'funeral_partner')),
  created_at timestamptz default now()
);
```

#### `check_in_log`

```sql
create table check_in_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  responded boolean not null default false,
  check_in_at timestamptz default now(),
  ip_address text,
  user_agent text
);
```

### 5.2 인덱스

```sql
create index idx_death_status_user on user_death_status(user_id);
create index idx_death_status_status on user_death_status(status);
create index idx_check_in_user on check_in_log(user_id, check_in_at);
create index idx_wills_user on digital_wills(user_id);
create index idx_instructions_account on data_instructions(account_id);
```

### 5.3 RLS 정책

```sql
-- user_death_status: 본인만 읽기, 서비스 role만 쓰기
create policy "Users can read own death status" on user_death_status
  for select using (auth.uid() = user_id);

-- digital_wills: 본인만 CRUD
create policy "Users can manage own digital wills" on digital_wills
  for all using (auth.uid() = user_id);

-- data_instructions: 본인만 CRUD
create policy "Users can manage own instructions" on data_instructions
  for all using (
    auth.uid() = user_id
    or auth.uid() in (select user_id from accounts where id = account_id)
  );

-- check_in_log: 서비스 role만 쓰기, 본인만 읽기
create policy "Users can read own check-ins" on check_in_log
  for select using (auth.uid() = user_id);
```

---

## 6. 보안 모델

### 6.1 위협 식별

| # | 위협 | 심각도 | 대응 |
|---|---|---|---|
| 1 | 사망 위조 (타인이 사망 신고) | 높음 | 2차 검증 + 48시간 쿨링 |
| 2 | 체크인 우회 (이메일 해킹) | 중간 | IP + User-Agent 로깅, 이상 징후 탐지 |
| 3 | 내부자 데이터 유출 | 높음 | Supabase RLS + 서비스 role 분리 |
| 4 | API 남용 (무한 체크인 전송) | 낮음 | Rate limiting (1회/24시간) |
| 5 | 사망증명서 위조 | 높음 | 정부 API 검증 또는 공문 확인 |
| 6 | 유족 사칭 (계정 인계 요청) | 중간 | 사전 등록된 verifier만 인계 가능 |
| 7 | 비밀번호 노출 (이메일 등) | 높음 | 위임장에 비밀번호 미포함 정책 |
| 8 | 재생 공격 (재전송) | 낮음 | Nonce + 타임스탬프 검증 |
| 9 | 서비스 거부 (대량 삭제 요청) | 중간 | Rate limiting + 관리자 승인 |
| 10 | 삭제 취소 불가 (복구 불가) | 높음 | Soft delete 선행 + 복구 윈도우 |

### 6.2 보안 통제

| 통제 | 설명 |
|---|---|
| Supabase RLS | 모든 테이블에 Row-Level Security 적용 |
| 서비스 role 분리 | `service_role` key는 서버에서만 사용, 클라이언트는 `anon key` |
| 2-팩터 검증 | 사망 확정에 최소 2개 독립 신호 필요 |
| 감사 로그 | 모든 상태 전이·데이터 변경 로깅 |
| Rate Limiting | 체크인·API 호출에 사용자별 Rate Limiting |
| False Alarm 복구 | 잘못된 확정 시 즉시 복구 프로토콜 |
| 암호화 전송 | 모든 이메일·API 통신 TLS, 첨부 PDF AES-256-GCM |
| 접근 로그 | 서비스 role 작업 내역 로깅 (Cloudwatch / Supabase Audit) |

### 6.3 False Positive 복구 절차

```
[사망 확정]
   ↓
[사용자 로그인 감지]
   ↓
[자동 복구]
   1. user_death_status → 'false_alarm'
   2. 모든 pending deletion → cancel
   3. 유족 통지 취소
   4. 사용자에게 알림: "잘못된 알림이었습니다"
   5. 사유 로깅 (재발 방지)
```

---

## 7. MVP 구현 계획 (4단계, 8주)

### Phase 1: 코어 인프라 (2주)

**목표:** DB 마이그레이션 + 상태 머신 + 체크인 크론 + 대시보드 설정

| 작업 | 파일/컴포넌트 | 비고 |
|---|---|---|
| DB 마이그레이션 | `supabase/migrations/` | 신규 6개 테이블 + 인덱스 + RLS |
| 상태 머신 | `src/lib/agent/state-machine.ts` | 사망 감지 상태 전이 로직 |
| 체크인 크론 | `src/lib/agent/check-in.ts` | 30일 주기 이메일 발송 스케줄러 |
| 체크인 API | `src/app/api/agent/check-in/route.ts` | POST: 체크인 응답 수신 |
| 대시보드 설정 UI | `src/app/machimpyo/dashboard/settings/` | 체크인 설정, 보호자 관리 |
| 유닛 테스트 | `src/lib/agent/__tests__/` | 상태 머신 전이 커버리지 100% |

### Phase 2: 사망 감지 + 실행 엔진 (2주)

**목표:** 3신호 감지 + 삭제 실행 파이프라인

| 작업 | 비고 |
|---|---|
| 인액티비티 감지 | 마지막 활동 기준 90일 체크 cron |
| 정부 API 연동 (Mock → Real) | 공공 마이데이터 API 폴링 |
| 유족 신고 API | 사망증명서 업로드 + 관리자 확인 |
| 삭제 실행 엔진 | 이메일 발송 (위임장 PDF + 사망증명서 PDF) |
| 이메일 템플릿 | 위임장 PDF (React-PDF) + 사망증명서 PDF |
| 통합 테스트 | 사망 감지 → 실행 → 완료 E2E |

### Phase 3: 법적 조치 (2주)

**목표:** 미응답 플랫폼 법적 대응 자동화

| 작업 | 비고 |
|---|---|
| 30일 마감 트래커 | 각 플랫폼별 응답 상태 추적 cron |
| 2차 이메일/등기 자동 발송 | Day 7, Day 14, Day 25 |
| 법적 조치 템플릿 | 개인정보보호위 신고서 자동 생성 |
| 컴플라이언스 로깅 | 모든 법적 절차 감사 로그 |

### Phase 4: 고도화 (2주)

**목표:** 디지털 유언장 + 데이터 이전 + 모니터링

| 작업 | 비고 |
|---|---|
| 디지털 유언장 엔진 | SNS 마지막 메시지 게시 (Playwright) |
| 데이터 이전 | transfer_email로 계정 데이터 전송 |
| 관리자 대시보드 | 전체 사망 감지·처리 현황 |
| 알림 개선 | 유족 SMS + 카카오톡 알림 |
| 부하 테스트 | 1,000명 동시 사망 처리 시나리오 |

---

## 8. ADR (Architecture Decision Records)

### ADR-001: 사망 감지는 Pull 기반 (Push 아님)

**결정:** 정부 API를 일 1회 폴링하며, 유족 신고는 별도 웹훅으로 수신

**이유:**
- 정부 API는 Push를 지원하지 않음
- 유족 신고는 비동기 이벤트이므로 웹훅이 적합
- Pull 기반은 지연이 발생하지만 (최대 24시간), 사망 처리에 실시간성은 불필요

**결과:** 최대 24시간 감지 지연 가능, 유족 신고 시 즉시 처리

### ADR-002: 삭제는 Soft Delete → Hard Delete 2단계

**결정:** 1차 이메일 요청 후 7일 대기, 이후 최종 삭제

**이유:**
- 법적 요건 (30일 통지 기간)
- 사용자 오류 복구 가능 (false alarm 시 취소)
- 플랫폼 응답 대기 시간 확보

**결과:** 총 처리 기간 최대 30일, 복구 가능 윈도우 7일

### ADR-003: 위임장 PDF 암호화 (AES-256-GCM)

**결정:** 모든 첨부 PDF는 AES-256-GCM으로 암호화하여 전송

**이유:**
- 개인정보 포함 (사망증명서, 주민등록번호 등)
- 이메일 전송 시 TLS 종단 후 평문 노출 방지
- 금융권 수준 암호화로 법적 신뢰성 확보

**결과:** 복호화 키는 별도 채널 (SMS)로 유족에게 전달

### ADR-004: 체크인 실패 N회 = 의심 (N=3)

**결정:** 연속 3회 체크인 미응답 시 사망 의심 상태로 전이

**이유:**
- 1회 누락은 단순 실수 가능 (스팸함, 여행)
- 2회 누락은 가능하나 낮음
- 3회 누락 시 교차 검증 필요 (90일 인액티비티와 결합)

**결과:** 최소 90일 (인액티비티) + 90일 (체크인 3회) = 최소 180일 후 사망 확정 가능

### ADR-005: 서비스 role과 사용자 role 엄격 분리

**결정:** 사망 감지·삭제 실행은 Supabase Service Role로만 수행, 사용자는 읽기만 가능

**이유:**
- 사용자가 자신의 사망 상태를 조작할 수 없음
- 삭제 실행 권한이 사용자에게 노출되지 않음
- 감사 추적성 확보

**결과:** 모든 Agent 작업은 서버 API route에서만 수행, Supabase RLS로 보호

---

## 9. 향후 과제

- [ ] Playwright 기반 자동 계정 삭제 스크립트 (Phase 2+)
- [ ] 공공 마이데이터 API 실제 연동 (행정안전부, 사망자 정보조회)
- [ ] 장례업체 파트너십 연동
- [ ] 다국어 지원 (영문 서비스 대비)
- [ ] AI 기반 사망 기사 스크래핑 감지
- [ ] 보험사 연동 (사망 통보 자동 수신)
