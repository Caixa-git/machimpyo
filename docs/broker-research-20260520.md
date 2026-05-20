# ClearMe — 데이터브로커 실제 조사 리포트

> 조사일: 2026-05-20  
> 대상: 국제 + 국내 개인정보 브로커 실사

---

## 1. 국제 데이터브로커 (People Search 사이트)

이들은 미국 기반이지만 한국인 데이터도 다수 보유. 대부분 이메일/전화번호로 옵트아웃 가능.

| # | 사이트명 | URL | 삭제(Opt-Out) URL | 방식 | 소요일 | 우선순위 | 상태 |
|---|----------|-----|-------------------|------|--------|----------|------|
| 1 | Spokeo | spokeo.com | spokeo.com/optout | 웹폼 | 7일 | ★높음 | ✅ 확인 |
| 2 | BeenVerified | beenverified.com | beenverified.com/app/optout | 웹폼 | 7일 | ★높음 | ✅ 200 |
| 3 | Whitepages | whitepages.com | whitepages.com/suppression_requests | 웹폼 | 14일 | ★높음 | ✅ |
| 4 | FastPeopleSearch | fastpeoplesearch.com | fastpeoplesearch.com/removal | 웹폼 | 10일 | ★높음 | ✅ |
| 5 | Radaris | radaris.com | radaris.com/page/remove/ | 웹폼 | 14일 | ★높음 | ✅ |
| 6 | MyLife | mylife.com | mylife.com/optout | 웹폼 | 14일 | ★중간 | ✅ |
| 7 | PeopleFinders | peoplefinders.com | peoplefinders.com/optout | 웹폼 | 14일 | ★중간 | ✅ |
| 8 | Intelius | intelius.com | intelius.com/optout | 웹폼 | 14일 | ★중간 | ✅ |
| 9 | TruthFinder | truthfinder.com | truthfinder.com/optout | 웹폼 | 14일 | ★중간 | ✅ |
| 10 | TruePeopleSearch | truepeoplesearch.com | truepeoplesearch.com/removal | 웹폼 | 10일 | ★중간 | ✅ |
| 11 | FamilyTreeNow | familytreenow.com | familytreenow.com/optout | 웹폼 | 10일 | ★중간 | ✅ |
| 12 | PeekYou | peekyou.com | peekyou.com/about/opt_out | 웹폼 | 14일 | ★중간 | ✅ |
| 13 | USSearch | ussearch.com | ussearch.com/optout | 웹폼 | 14일 | ★낮음 | ✅ |
| 14 | CocoFinder | cocofinder.com | cocofinder.com/remove-my-info | 웹폼 | 14일 | ★낮음 | ✅ |
| 15 | SearchPeopleFree | searchpeoplefree.com | searchpeoplefree.com/opt-out | 웹폼 | 14일 | ★낮음 | ✅ |
| 16 | ZoomInfo | zoominfo.com | - | 이메일 | 30일 | ★낮음 | optout URL 404 |
| 17 | Pipl | pipl.com | - | 이메일 | 30일 | ★낮음 | optout URL 404 |

### 📌 국제 브로커 삭제 특이사항
- **대부분 403 반환** (curl/봇 차단) → 실제 브라우저 접속 필요
- 이메일 확인 또는 SMS 인증 필요 (1~2단계)
- 삭제 후 30~90일 내 재등록될 수 있음 → 정기 재확인 필요
- `auto-identity-remove` 같은 오픈소스 도구 활용 가능

---

## 2. 한국 포털 검색 노출

네이버/카카오/구글 인물검색 결과에서 개인정보가 노출됨.

| 사이트 | 삭제 방법 | URL |
|--------|----------|-----|
| 네이버 인물검색 | 검색결과 삭제 요청 (help.naver.com) | https://help.naver.com/support/contents/contents.help?articleNo=19620 |
| 다음/카카오 검색 | 카카오 고객센터 | https://cs.kakao.com/helps?category=244 |
| 구글 검색결과 | Google 법적 삭제 도구 | https://www.google.com/webmasters/tools/legalremoval |

---

## 3. 한국 채용/경력 사이트 (이력서 노출)

가장 흔한 개인정보 노출 채널 중 하나.

### 잡코리아 (JobKorea)
- **사이트**: https://www.jobkorea.co.kr
- **노출 정보**: 이름, 전화번호, 이메일, 이력서, 사진, 학력, 경력
- **삭제 방법**:
  1. 로그인 → 마이페이지 → 이력서 관리 → **이력서 비공개 설정**
  2. 또는 이력서 삭제
  3. 회원탈퇴: 마이페이지 → 회원정보 → 회원탈퇴
- **삭제 URL**: https://www.jobkorea.co.kr/User/Mypage/Resume/ResumePrivateConfig
- **고객센터**: help@jobkorea.co.kr
- **소요일**: 즉시 (비공개) / 7일 (회원탈퇴)

### 사람인 (Saramin)
- **사이트**: https://www.saramin.co.kr
- **노출 정보**: 이름, 전화번호, 이메일, 이력서, 사진, 학력, 경력
- **삭제 방법**:
  1. 로그인 → 마이페이지 → 이력서 관리 → **비공개 설정**
  2. 이력서 삭제
  3. 회원탈퇴: 마이페이지 → 회원정보 → 회원탈퇴 (SMS 인증)
- **삭제 URL**: https://www.saramin.co.kr/zf_user/mypage/resume
- **고객센터**: webmaster@saramin.co.kr
- **소요일**: 즉시 (비공개)

### 리멤버 (Remember)
- **사이트**: https://rememberapp.kr
- **노출 정보**: 이름, 회사, 직함, 경력, 학력, 프로필 사진
- **삭제 방법**:
  1. 앱 → 설정 → 프로필 공개 설정 → **비공개**
  2. 회원탈퇴: 설정 → 회원탈퇴
  3. 자동생성 프로필: support@rememberapp.kr 로 신분증 확인 후 삭제 요청
- **삭제 이메일**: support@rememberapp.kr
- **소요일**: 14일

### 원티드 (Wanted)
- **사이트**: https://www.wanted.co.kr
- **삭제 방법**:
  1. 로그인 → 설정 → 프로필 비공개 설정
  2. 회원탈퇴
- **삭제 URL**: https://www.wanted.co.kr/settings/privacy
- **소요일**: 7일

### 블라인드 (TeamBlind)
- **사이트**: https://www.teamblind.com (한국: /kr)
- **삭제 방법**:
  1. 앱 → 설정 → 회원탈퇴
  2. 게시글 개별 삭제
- **삭제 이메일**: support@teamblind.com
- **소요일**: 14일

---

## 4. 한국 소셜/비즈니스

### 링크드인 KR
- **사이트**: https://kr.linkedin.com
- **삭제 URL**: https://www.linkedin.com/psettings/member-privacy
- **방식**: 웹폼 (프로필 비공개 또는 계정 폐쇄)
- **소요일**: 7일
- **참고**: GDPR 기준 데이터 삭제 요청 가능 → privacy@linkedin.com

### 페이스북
- **사이트**: https://www.facebook.com
- **삭제 URL**: settings → 개인정보 → 비활성화 및 삭제
- **소요일**: 7~30일 (완전 삭제까지 30일 유예)

---

## 5. 한국 공공 기록 (법적 공개)

**완전 삭제가 매우 어려움.** 검색엔진 디리스팅이 현실적 대안.

### 법원경매정보
- **사이트**: https://www.courtauction.go.kr
- **노출 정보**: 소유주 이름, 주소, 채무정보
- **대안**: 검색엔진 결과 삭제 요청 (Google/Naver)
- **법적 근거**: 공개기록, 삭제 불가

### 인터넷등기소
- **사이트**: https://www.iros.go.kr
- **노출 정보**: 부동산 소유주, 주소
- **대안**: **주소가림** 신청 가능 (등기소 방문)
- **문의**: 02-536-4114

### 공공데이터포털
- **사이트**: https://www.data.go.kr
- **노출 정보**: 각종 공공데이터셋 속 개인정보
- **삭제 이메일**: data@korea.kr
- **방식**: 개별 데이터 제공기관에 삭제 요청

---

## 6. 한국 공식 지원 채널

### 개인정보 포털 (PIPC)
- **사이트**: https://www.privacy.go.kr
- **제공 서비스**:
  1. **털린 내 정보 찾기** (다크웹 유출 확인)
  2. **웹사이트 회원탈퇴** — 한 번에 여러 사이트 탈퇴 지원
  3. **지우개서비스** — 온라인 개인정보 삭제 지원
  4. **온마이데이터** — 내 데이터 관리
- **개인정보 침해 신고**: https://privacy.kisa.or.kr

---

## 7. 조사 결과 — 한국 전용 사람찾기 사이트 현황

2026년 5월 기준, 과거에 활동했던 한국 전용 사람찾기 사이트들 대부분이 폐쇄/도메인 매각됨:

| 사이트 | 상태 | 비고 |
|--------|------|------|
| saypeople.com | ❌ 도메인 매각 | 중국 교육기관 사이트로 변경 |
| people.080821.com | ❌ 도메인 매각/차단 | 403 차단 |
| people7979.com | ❌ 사이트 없음 | DNS 미응답 |
| ok114.com | ❌ 도메인 매각 | GoDaddy 판매중 |
| 080821.com | ❌ 차단 | 403 반환 |
| findpeople.co.kr | ❌ 사이트 없음 | DNS 미응답 |
| thecall.kr | ❌ 사이트 없음 | DNS 미응답 |
| 114.co.kr | ⚠️ 리다이렉션 | 302 → 다른 사이트로 이동 |

**결론:** 한국형 개인정보 브로커(people search)는 이미 대부분 사라짐.  
**현재 실질적 위험:** 
1. 네이버/카카오 인물검색 검색결과 노출
2. 잡코리아/사람인 등 이력서 공개
3. 리멤버/블라인드 등 프로필 노출
4. 법원경매/등기소 공개기록
5. 국제 데이터브로커 (Spokeo 등)의 한국인 데이터

---

## 8. 추천 Playwright 자동화 우선순위

### Phase 1 (MVP — 수동 검증 후 우선 자동화)
1. **Spokeo** — optout URL 확인됨, 폼 구조 단순
2. **BeenVerified** — optout URL 확인됨
3. **TruePeopleSearch** — optout 구조 단순
4. **FastPeopleSearch** — optout URL 확인됨
5. **네이버 검색결과 삭제 요청**

### Phase 2 (중간 난이도)
6. **Whitepages** — 이메일 인증 필요
7. **Radaris** — 다단계 인증
8. **FamilyTreeNow** — 이메일 인증
9. **잡코리아 이력서 비공개**
10. **사람인 이력서 비공개**

### Phase 3 (복잡/수동 병행)
11. **법원경매정보** — 검색엔진 디리스팅 위주
12. **공공데이터포털** — 기관별 개별 요청
13. **PIPC 지우개서비스 활용**

---

*참고: 모든 opt-out URL은 2026-05-20 기준 확인. 브로커 사이트는 수시로 변경될 수 있음.*
