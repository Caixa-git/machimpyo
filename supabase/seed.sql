-- 클리어미 MVP — 브로커 시드 데이터 (실제 조사 기반 업데이트)
-- 각 브로커의 실제 opt-out/삭제 URL을 포함
-- 조사일: 2026-05-20

-- 국제 데이터 브로커
insert into brokers (name, url, removal_url, method, avg_days, priority, active) values
  ('Spokeo',          'https://www.spokeo.com',           'https://www.spokeo.com/optout',                        'form',  7,  1, true),
  ('BeenVerified',    'https://www.beenverified.com',     'https://www.beenverified.com/app/optout',               'form',  7,  1, true),
  ('Whitepages',      'https://www.whitepages.com',       'https://www.whitepages.com/suppression_requests',       'form',  14, 1, true),
  ('FastPeopleSearch','https://www.fastpeoplesearch.com',  'https://www.fastpeoplesearch.com/removal',              'form',  10, 1, true),
  ('Radaris',         'https://radaris.com',              'https://radaris.com/page/remove/',                     'form',  14, 1, true),
  ('MyLife',          'https://www.mylife.com',           'https://www.mylife.com/optout',                         'form',  14, 2, true),
  ('PeopleFinders',   'https://www.peoplefinders.com',    'https://www.peoplefinders.com/optout',                  'form',  14, 2, true),
  ('Intelius',        'https://www.intelius.com',         'https://www.intelius.com/optout',                       'form',  14, 2, true),
  ('TruthFinder',     'https://www.truthfinder.com',      'https://www.truthfinder.com/optout',                    'form',  14, 2, true),
  ('TruePeopleSearch','https://www.truepeoplesearch.com',  'https://www.truepeoplesearch.com/removal',              'form',  10, 2, true),
  ('FamilyTreeNow',   'https://www.familytreenow.com',    'https://www.familytreenow.com/optout',                  'form',  10, 2, true),
  ('PeekYou',         'https://www.peekyou.com',          'https://www.peekyou.com/about/opt_out',                 'form',  14, 2, true),
  ('USSearch',        'https://www.ussearch.com',         'https://www.ussearch.com/optout',                       'form',  14, 3, true),
  ('CocoFinder',      'https://www.cocofinder.com',       'https://www.cocofinder.com/remove-my-info',             'form',  14, 3, true),
  ('SearchPeopleFree','https://www.searchpeoplefree.com', 'https://www.searchpeoplefree.com/opt-out',              'form',  14, 3, true),
  ('ZoomInfo',        'https://www.zoominfo.com',         NULL,                  'email', 30,  3, true),
  ('Pipl',            'https://pipl.com',                 NULL,                  'email', 30,  3, true),

-- 한국 포털/검색 (노출 채널)
  ('네이버 인물검색', 'https://search.naver.com',         'https://help.naver.com/support/contents/contents.help?articleNo=19620', 'manual', 14, 1, true),
  ('카카오 다음검색', 'https://search.daum.net',          'https://cs.kakao.com/helps?category=244',               'manual', 14, 2, true),
  ('구글 검색결과',   'https://www.google.com',           'https://www.google.com/webmasters/tools/legalremoval',   'form',  7,  1, true),

-- 한국 채용/경력 사이트 (이력서 노출)
  ('잡코리아',       'https://www.jobkorea.co.kr',        'https://www.jobkorea.co.kr/User/Mypage/Resume/ResumePrivateConfig', 'form', 7, 1, true),
  ('사람인',         'https://www.saramin.co.kr',         'https://www.saramin.co.kr/zf_user/mypage/resume',       'form',  7,  1, true),
  ('리멤버',         'https://rememberapp.kr',            'support@rememberapp.kr',                                'email', 14, 2, true),
  ('원티드',         'https://www.wanted.co.kr',          'https://www.wanted.co.kr/settings/privacy',             'form',  7,  2, true),
  ('블라인드',       'https://www.teamblind.com',         'mailto:support@teamblind.com',                         'email', 14, 3, true),

-- 한국 소셜/비즈니스 (프로필 노출)
  ('링크드인 KR',    'https://kr.linkedin.com',           'https://www.linkedin.com/psettings/member-privacy',     'form',  7,  2, true),
  ('페이스북',       'https://www.facebook.com',          'https://www.facebook.com/settings?tab=deactivation_and_deletion', 'form', 7, 3, true),

-- 한국 공공기록 (법적 공개 데이터 — 완전 삭제 불가, 검색엔진 디리스팅 위주)
  ('법원경매정보',   'https://www.courtauction.go.kr',    NULL,                   'manual', 30, 2, true),
  ('인터넷등기소',   'https://www.iros.go.kr',            NULL,                   'manual', 30, 2, true),
  ('공공데이터포털', 'https://www.data.go.kr',            'mailto:data@korea.kr', 'email',  30, 2, true),

-- 한국 신용정보
  ('전국은행연합회(KFB)', 'https://www.kfb.or.kr',       NULL,                    'email',  30, 3, true),

-- 한국 공식 지원 채널
  ('개인정보포털(PIPC)',  'https://www.privacy.go.kr',   'https://www.privacy.go.kr/front/contents/cntntsView.do?cntntsId=CMS000041', 'form', 14, 1, true),
  ('KISA 개인정보침해신고센터', 'https://privacy.kisa.or.kr', 'https://privacy.kisa.or.kr', 'form', 14, 2, true);

-- 참고: 한국 전용 사람찾기/전화번호검색 사이트들(saypeople.com, people.080821.com, ok114.com 등)은
-- 대부분 도메인 만료 또는 중국 사이트로 전환되어 2026년 기준 비활성 상태입니다.
-- 따라서 현재 한국에서 실질적 데이터브로커 역할을 하는 것은
-- 상기 포털/채용사이트/공공기록이 주를 이룹니다.
