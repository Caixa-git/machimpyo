"use client"

import { useState, useEffect, useRef } from 'react'

export default function MachimpyoPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Make all reveal elements visible immediately on hydration
    // (intersection observer has hydration issues with this setup)
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('visible')
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const faqItems = [
    {
      q: '가입만 해두면 나중에 가족이 알아서 처리되나요?',
      a: '네. 저희가 모든 절차를 진행합니다. 가입 시 등록한 계정에 대해 사망 확인 후 위임장과 사망증명서를 각 서비스 고객센터 이메일로 발송합니다. 최대 30일 이내에 처리되며, 미응답 시 개인정보보호법에 따른 법적 조치를 대행합니다. 유족께서는 별도로 하실 일이 없습니다.'
    },
    {
      q: '내가 가입한 사이트를 어떻게 다 찾나요?',
      a: '가입 시 e프라이버시 클린서비스에서 본인확인 내역을 CSV로 내려받아 업로드하시면, AI가 CSV를 분석하여 가입된 모든 사이트를 한 번에 찾아냅니다. 주민번호와 휴대폰으로 가입한 사이트까지 포함됩니다. 사용자가 직접 기억해서 등록할 필요가 없습니다.'
    },
    {
      q: '가입한 후 새로 가입한 사이트는 어떻게 되나요?',
      a: '신규 서비스 가입 후 자동 감지는 제공하지 않습니다. 대신 매월 결제 안내 시 추가 계정 등록 기회를 제공합니다. 추가할 계정이 있으면 핸드폰 인증 후 CSV를 다시 업로드하시면 됩니다. 필요 없으면 그냥 결제하시면 됩니다.'
    },
    {
      q: '계정에 포인트나 캐시가 남아있으면 어떻게 되나요?',
      a: '그냥 삭제합니다. 포인트·캐시·사이버머니 등은 마침표가 따로 처리하지 않습니다. 가입 시 "이 계정은 남겨주세요"라고 따로 표시한 계정만 제외하고, 모든 계정은 일괄 삭제됩니다. 사전에 제외 요청을 하지 않았다면 전부 정리 대상입니다.'
    },
    {
      q: '삭제 제외하고 싶은 계정이 있으면 어떻게 하나요?',
      a: '가입 시 또는 가입 후 대시보드에서 삭제 제외 계정을 지정할 수 있습니다. 제외된 계정은 사후 정리 대상에서 빠지며, 유족이 별도로 처리할 수 있습니다. 따로 지정하지 않은 모든 계정은 자동으로 삭제됩니다.'
    },
    {
      q: '주민등록번호를 맡겨도 안전한가요?',
      a: '금융권 AES-256-GCM 암호화, 행정안전부 공공 마이데이터 보안 기준을 준수합니다. 사망 확인 외에는 절대 사용되지 않으며, 사망 확인 즉시 폐기됩니다.'
    },
    {
      q: '매번 접속해서 관리해야 하나요?',
      a: '아닙니다. 가입 시 계정 등록과 위임장 작성을 마치면, 이후에는 저희가 사망 감지·삭제 수행·법적 조치까지 전 절차를 자동 진행합니다. 유족은 아무것도 할 필요가 없습니다.'
    },
    {
      q: '유족이 정리를 원하지 않으면 어떻게 되나요?',
      a: '가입 시 작성한 위임장은 법적 효력이 있습니다. 고인의 의사가 최우선이므로, 위임장에 따라 정리를 진행합니다. 유족의 개입 없이 모든 절차가 완료됩니다.'
    },
    {
      q: '이 서비스는 법적으로 문제없나요?',
      a: '통신판매업 신고로 합법적으로 운영 가능합니다(전자상거래법 제12조, 국회입법조사처 확인). 사망자의 개인정보는 현행 개인정보보호법(제2조)의 적용을 받지 않으며, 위임장 기반 계정 삭제 대행은 민법 제680조(위임)·제147조(정지조건부)에 따라 상속과 별개의 법리입니다. KISO 정책규정 제28조~29조와도 정합합니다. 미응답 플랫폼에 대한 법적 조치 대행은 개인정보보호법 제58조의2 및 제75조에 근거합니다. 모든 절차는 법률 검토를 완료했습니다.'
    },
    {
      q: '모든 계정이 확실히 삭제되나요?',
      a: '위임장과 사망증명서를 각 서비스 고객센터 이메일로 발송하여 법적으로 계정 삭제를 요청합니다. 30일 이내에 응답이 없는 플랫폼에 대해서는 개인정보보호법에 따른 법적 조치(과태료 신고 등)를 대행합니다. 모든 과정에서 마침표가 플랫폼을 상대로 법적 책임을 묻습니다.'
    },
    {
      q: '플랫폼이 응답하지 않으면 어떻게 되나요?',
      a: '30일 이내 미응답 시 마침표가 직접 법적 조치를 대행합니다. 개인정보보호법 제58조의2(고인 정보 처리) 및 제75조(과태료 최대 3천만원)에 따라 개인정보보호위원회에 신고하며, 필요한 경우 내용증명 등기 발송 등 추가 절차를 진행합니다. 플랫폼이 무시할 수 없게 만듭니다.'
    },
    {
      q: '결제 중간에 해지하면 어떻게 되나요?',
      a: '언제든 해지 가능합니다. 해지 시 위임장은 자동으로 폐기되며, 더 이상 개인정보를 보관하지 않습니다. 30일 이내 해지 시 전액 환불.'
    },
    {
      q: '디지털 유언장은 뭔가요?',
      a: '계정이 삭제되기 전, SNS에 마지막 메시지를 남길 수 있는 옵션 기능입니다. 가입 시 텍스트나 이미지를 작성해두면 사망 확인 후 각 SNS에 게시되고, 이후 계정이 정리됩니다. "그동안 감사했습니다" 같은 한 줄도 가능합니다. 모든 요금제에서 제공됩니다.'
    }
  ]

  const serviceCategories = [
    {
      label: '포털 · SNS', count: '8',
      items: ['네이버', '카카오', '구글', '인스타그램', '페이스북', '트위터(X)', '링크드인', '밴드']
    },
    {
      label: '커머스 · 구독', count: '7',
      items: ['쿠팡', '배달의민족', '넷플릭스', 'G마켓', '11번가', '티몬', '위메프']
    },
    {
      label: '게임', count: '6',
      items: ['리그오브레전드', '넥슨', '넷마블', '블리자드', '에픽게임즈', '스팀']
    }
  ]

  return (
    <>
      <nav>
        <a href="/machimpyo" className="nav-l">
          <span className="nav-dot"></span>
          <span className="nav-w">마침표</span>
        </a>
        <div className="nav-a">
          <a onClick={(e) => { e.preventDefault(); scrollTo('target') }}>서비스</a>
          <a onClick={(e) => { e.preventDefault(); scrollTo('problem') }}>문제</a>
          <a onClick={(e) => { e.preventDefault(); scrollTo('scam') }}>사기 위험</a>
          <a onClick={(e) => { e.preventDefault(); scrollTo('process') }}>방식</a>
          <a onClick={(e) => { e.preventDefault(); scrollTo('pricing') }}>요금</a>
          <a onClick={(e) => { e.preventDefault(); scrollTo('faq') }}>FAQ</a>
        </div>
        <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span></span><span></span><span></span>
        </button>
        <a href="/machimpyo/auth/signup" className="nav-b">가입하기</a>
      </nav>

      <div className={`nav-mobile ${mobileOpen ? 'open' : ''}`}>
        <a onClick={(e) => { e.preventDefault(); scrollTo('target') }}>서비스</a>
        <a onClick={(e) => { e.preventDefault(); scrollTo('problem') }}>문제</a>
        <a onClick={(e) => { e.preventDefault(); scrollTo('scam') }}>사기 위험</a>
        <a onClick={(e) => { e.preventDefault(); scrollTo('process') }}>방식</a>
        <a onClick={(e) => { e.preventDefault(); scrollTo('pricing') }}>요금</a>
        <a onClick={(e) => { e.preventDefault(); scrollTo('faq') }}>FAQ</a>
        <a href="/machimpyo/signup" className="nav-b" style={{ display: 'block', textAlign: 'center' }}>가입하기</a>
      </div>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-sub">사후 디지털 계정 정리 서비스</div>
        <h1>
          내가 떠난 뒤 남는 계정,<br />
          <span className="hl">가족 대신 정리해드립니다</span>
        </h1>
        <p className="hero-p">
          네이버, 카카오, 구글, SNS, 커머스 계정을 미리 등록해두면
          사망 확인 후 위임장 발송, 삭제 요청, 미응답 플랫폼 법적 조치까지 마침표가 진행합니다.
          <br />
          유족은 비밀번호도, 고객센터 절차도 몰라도 됩니다.
        </p>
        <div className="hero-points" aria-label="핵심 가치 제안">
          <div className="hero-point">21+개 서비스 계정 정리</div>
          <div className="hero-point">유족 개입 없이 자동 진행</div>
          <div className="hero-point">30일 미응답 시 법적 조치 대행</div>
        </div>
        <div className="hero-actions">
          <a href="/machimpyo/auth/signup" className="btn-p">지금 준비하기</a>
          <button className="btn-s" onClick={() => scrollTo('problem')}>왜 필요한가요</button>
        </div>
        <div className="hero-k">
          <div className="hero-kd">
            <div className="ki">가입 시 한 번 준비</div>
            <div className="kd">CSV 업로드와 위임장 작성으로 정리 대상 계정을 미리 등록합니다.</div>
          </div>
          <div className="hero-kd">
            <div className="ki">사망 후 자동 진행</div>
            <div className="kd">계정 삭제 요청, 상태 확인, 유족 안내까지 마침표가 이어서 처리합니다.</div>
          </div>
          <div className="hero-kd">
            <div className="ki">끝까지 책임지는 구조</div>
            <div className="kd">30일 안에 응답이 없으면 법적 절차까지 대행해 방치로 끝나지 않게 합니다.</div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM 1: 방치된 계정 ===== */}
      <section className="s" id="problem">
        <div className="section-divider reveal"></div>
        <div className="sl reveal">문제 1</div>
        <h2 className="st reveal">알고리즘은<br />죽음을 모릅니다</h2>
        <p className="ss reveal reveal-delay-1">당신의 계정은 당신이 죽어도 계속 살아있는 척합니다. 데이터한테 죽음이란 개념이 없습니다.</p>
        <div className="why-grid">
          <div className={`why-card reveal reveal-delay-1`}>
            <span className="wi">🎂</span>
            <h4>죽은 친구 생일 알림</h4>
            <p>3년 전 돌아가신 친구의 생일이 뜹니다. 알고리즘은 그 친구가 이 세상 사람이 아니라는 걸 모릅니다. 그냥 "1년 동안 활동 없는 계정"일 뿐입니다.</p>
          </div>
          <div className={`why-card reveal reveal-delay-2`}>
            <span className="wi">🏷️</span>
            <h4>죽은 사람이 사진에 태그됩니다</h4>
            <p>단체 사진에 죽은 사람이 자동으로 태그됩니다. 페이스북이 추천 친구에 죽은 사람을 올립니다. 계정은 멈췄지만, 데이터는 계속 움직입니다.</p>
          </div>
          <div className={`why-card reveal reveal-delay-3`}>
            <span className="wi">🗿</span>
            <h4>2100년, 디지털 공동묘지</h4>
            <p>옥스퍼드대 연구에 따르면, 현 추세대로라면 2100년까지 최소 14억 개의 Facebook 계정이 주인을 잃습니다. 세계 최대 SNS가 거대한 디지털 묘지가 됩니다.</p>
            <div className="wq" style={{fontSize: 11, color: '#8a7e6e'}}>Öhman &amp; Watson, Big Data &amp; Society (2019)</div>
          </div>
          <div className={`why-card reveal reveal-delay-1`} style={{gridColumn: '1 / -1'}}>
            <span className="wi">👪</span>
            <h4>유족은 알 방법이 없습니다</h4>
            <p>고인이 네이버를 했는지, 카카오를 했는지, 인스타그램을 했는지 — 유족은 알 수 없습니다. 갑작스러운 사고라면 더욱 그렇습니다. 설령 안다 해도, 비밀번호도 모르고, 2차 인증도 모릅니다. SNS 회사에 계정 삭제를 요청하려면 사망증명서부터 가족관계증명서까지 여러 서류를 떼어 플랫폼마다 따로 제출해야 합니다. 현실에서 이걸 대비할 방법은 지금까지 없었습니다.</p>
            <div className="wq">마침표가 유일한 방법입니다</div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM 2: 디지털 좀비 사기 ===== */}
      <section className="sa" id="scam">
        <div className="s2">
          <div className="section-divider reveal"></div>
          <div className="sl reveal">문제 2</div>
          <h2 className="st reveal">방치된 계정은<br />사기 도구가 됩니다</h2>
          <p className="ss reveal reveal-delay-1">이것은 가상의 시나리오가 아닙니다. 경찰이 실제로 경고하는 수법입니다. '디지털 좀비 사기'라고 불립니다.</p>
          <div className="sc">
            {[
              { num: '1', title: '사망 기사가 신호가 됩니다', desc: '사망 기사나 추도 게시물을 보고 해커가 고인의 SNS 계정을 특정합니다. "이 사람은 이제 자기 계정을 안 봅니다."' },
              { num: '2', title: '비밀번호를 복구합니다', desc: '계정이 방치되면 비밀번호 복구를 시도해도 막을 사람이 없습니다. 이메일을 확인할 사람이 없기 때문입니다. 해커가 계정을 장악합니다.' },
              { num: '3', title: '유족을 사칭합니다', desc: '뺏은 계정으로 지인들에게 메시지가 갑니다. 죽은 사람의 프로필 사진, 죽은 사람의 이름으로. "나 살아있어, 돈 좀 보내줘."' },
            ].map((item, i) => (
              <div className={`dr reveal reveal-delay-${Math.min(i + 2, 5)}`} key={i}>
                <div className="dn">{item.num}</div>
                <div className="dh">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="notice reveal" style={{marginTop: 30, padding: '16px 20px', background: 'rgba(198,122,46,.08)', borderLeft: '3px solid #c67a2e', borderRadius: 6, fontSize: 13, lineHeight: 1.7, color: '#5a4f42'}}>
            <strong style={{color: '#1e3a5f'}}>🚔 경찰 경고:</strong> 보안 당국은 사망자 계정 해킹을 이용한 지인 사칭 사기에 대해 여러 차례 주의보를 발령했습니다. 고인의 계정은 사망 후 가능한 빨리 정리하는 것이 안전합니다.
          </div>
        </div>
      </section>

      {/* ===== 대상 서비스 ===== */}
      <section className="sa" id="target">
        <div className="s2">
          <div className="section-divider reveal"></div>
          <div className="sl reveal">대상 서비스</div>
          <h2 className="st reveal">사용 중인 계정을<br />자동으로 찾아드립니다</h2>
          <p className="ss reveal reveal-delay-1">e프라이버시 클린서비스 CSV를 업로드하면 가입한 모든 사이트를 한 번에 찾아냅니다. 이후 매월 추가 등록도 가능합니다.</p>
          <div className="tg">
            {serviceCategories.map((cat, i) => (
              <div className="tg-cat" key={i}>
                <div className="tgh">
                  <div className="tgl">{cat.label}</div>
                  <div className="tgc">{cat.count}개</div>
                </div>
                <div className="tgl-items">
                  {cat.items.map((item, j) => (
                    <div className="tgl-item" key={j}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
            <div className="tg-total">
              <div className="tg-tn">21+</div>
              <div className="tg-tl">개 서비스 스캔 가능</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 필요성 ===== */}
      <section className="s" id="why">
        <div className="section-divider reveal"></div>
        <div className="sl reveal">필요성</div>
        <h2 className="st reveal">사람은 죽었는데<br />계정은 왜 남아있나요</h2>
        <p className="ss reveal reveal-delay-1">죽어도 내 디지털 삶은 기록으로 남습니다. 정리하지 않으면 영원히 살아있습니다.</p>
        <div className="why-grid">
          <div className={`why-card reveal reveal-delay-1`}>
            <span className="wi">🌐</span>
            <h4>당신의 인생 절반은 이미 온라인입니다</h4>
            <p>SNS, 커뮤니티, 게임, 구독, 커머스 — 단순한 계정이 아니라 당신의 삶의 기록입니다. 10년간 쌓인 이 기록들은 죽어도 남습니다. 그런데 정리하지 않고 떠나는 게 맞을까요?</p>
            <div className="wq">온라인 삶도 당신의 삶입니다. 그 완성도 당신이 결정하십시오</div>
          </div>
          <div className={`why-card reveal reveal-delay-2`}>
            <span className="wi">🕊️</span>
            <h4>사람은 죽었는데 계정이 살아있다? 이상합니다</h4>
            <p>죽음은 모든 것의 끝이어야 합니다. 하지만 우리의 온라인 계정은 죽어도 계속 살아있습니다. 찜찜하지 않나요? 마침표가 그 마지막 한 줄을 찍습니다.</p>
            <div className="wq">죽은 사람이 직접 계정을 삭제할 순 없습니다. 그래서 마침표가 있습니다</div>
          </div>
          <div className={`why-card reveal reveal-delay-3`}>
            <span className="wi">💀</span>
            <h4>정리하지 않으면 영원히 남습니다</h4>
            <p>오래된 네이버 카페 글, 부끄러운 커뮤니티 댓글, 잊고 있던 게임 계정 — 내가 죽어도 이 기록들은 삭제되지 않습니다. 영원히 인터넷에 떠도는 내 온라인의 흔적. 그것이 정말 당신이 원하는 마무리인가요?</p>
            <div className="wq">내가 죽었다고 내 데이터도 사라지진 않습니다</div>
          </div>
          <div className={`why-card reveal reveal-delay-4`}>
            <span className="wi">✍️</span>
            <h4>옵션: 마지막 인사를 남기고 떠나십시오</h4>
            <p>SNS 계정이 삭제되기 전, 당신의 마지막 인사를 올릴 수 있습니다. 텍스트나 이미지로 작성한 메시지가 각 플랫폼에 게시된 후 계정이 정리됩니다. 죽어서도 한마디 할 수 있는, 디지털 유언장입니다.</p>
            <div className="wq">삭제 전 마지막 한 줄 — 당신의 디지털 유언장</div>
          </div>
        </div>
      </section>

      {/* ===== 정리 방식 ===== */}
      <section className="sa" id="process">
        <div className="s2">
          <div className="section-divider reveal"></div>
          <div className="sl reveal">정리 방식</div>
          <h2 className="st reveal">죽은 계정에<br />마침표를 찍는 방법</h2>
          <p className="ss reveal reveal-delay-1">가입한 모든 계정을 찾아내고, 사망 확인 후 일괄 정리합니다. 포인트·캐시 신경 쓸 필요 없이 그냥 삭제합니다. 사전에 제외 요청한 계정만 남깁니다.</p>
          <div className="sc">
            {[
              { num: '1', title: '계정 등록 (CSV 업로드)', desc: '가입 시 e프라이버시 클린서비스에서 본인확인 내역을 CSV로 내려받아 업로드하면, AI가 CSV를 분석하여 주민번호·휴대폰으로 가입한 모든 사이트를 한 번에 찾아냅니다. 이후 매월 결제 안내 시 추가 등록도 가능합니다.' },
              { num: '2', title: '위임장 + 이메일 요청 발송', desc: '사망 확인과 동시에 가입 시 서명한 법적 위임장과 사망증명서를 각 서비스 고객센터 이메일로 발송합니다. 아이디나 비밀번호 없이도 법적 효력으로 계정 삭제를 요청합니다. 등기우편 대신 이메일로 즉시 발송되며, 비용이 들지 않습니다. 계정에 포인트나 캐시가 남아있어도 그냥 삭제합니다. 사전에 삭제 제외를 요청한 계정만 남깁니다.' },
              { num: '3', title: '30일 마감 + 법적 조치', desc: '발송일로부터 30일 이내에 처리 결과를 확인합니다. 응답·처리 완료 시 자동 종료되며, 미응답·거부 시에는 개인정보보호법 제58조의2(고인 정보 처리)·제75조(과태료)에 따라 마침표가 직접 법적 조치를 대행합니다. 유족의 개입이 전혀 필요하지 않습니다.' },
            ].map((item, i) => (
              <div className={`dr reveal reveal-delay-${Math.min(i + 2, 5)}`} key={i}>
                <div className="dn">{item.num}</div>
                <div className="dh">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="legal-ref reveal reveal-delay-5">
            <strong>법적 근거:</strong> 계정 자동 발견 — 개인정보보호법 제15조(동의), 정보통신망법 제48조(적법 접근) |
            위임장 발송 — 민법 제680조(위임), 제147조(정지조건부) |
            법적 조치 대행 — 개인정보보호법 제58조의2(고인 정보), 제75조(과태료)
          </div>

          {/* 30일 마감 + 법적 조치 대행 */}
          <div className="section-spacer">
            <div className="section-divider reveal"></div>
            <div className="sl reveal">30일 마감 · 법적 조치</div>
            <h2 className="st reveal">미응답 시 마침표가<br />직접 법적 조치합니다</h2>
            <p className="ss reveal reveal-delay-1">모든 플랫폼에 이메일로 요청을 발송하고 30일 이내에 처리 결과를 확인합니다. 미응답·거부 시에는 마침표가 개인정보보호법에 따라 직접 법적 조치를 대행합니다. 온라인 삶의 마지막까지 책임집니다.</p>
            <div className="notice reveal reveal-delay-2">
              <div className="nm">정리 현황 (예시)</div>
              <div className="ns">○○○ 님의 계정 정리 — 처리 현황</div>
              발송일: 2026년 6월 1일<br />
              마감일: 2026년 6월 30일 (<span className="t3">30일 이내 마감</span>)<br /><br />
              <span className="nd"></span>네이버 — 처리 완료 ✓<br />
              <span className="nd"></span>카카오 — 처리 완료 ✓<br />
              <span className="nd"></span>인스타그램 — 처리 완료 ✓<br />
              <span className="nd"></span>구글 — 처리 완료 ✓<br />
              <span className="nd"></span>쿠팡 — 처리 완료 ✓<br />
              <span className="nd"></span>개인정보 DB 업체 15곳 — 처리 완료 ✓<br /><br />
              <div style={{ background: 'rgba(30,58,95,.08)', borderRadius: 8, padding: '12px 14px', margin: '12px 0', fontSize: 13, lineHeight: 1.7 }}>
                <strong style={{ color: '#1e3a5f' }}>⚖️ 법적 조치 진행</strong><br />
                넥슨 — 30일 이내 미응답 → 개인정보보호법 제58조의2(고인 정보 처리)·제75조(과태료)에 따라<br />
                개인정보보호위원회 신고 절차를 진행합니다.<br />
                법적 조치 완료 시 별도 안내드립니다.
              </div>
              <span className="t3" style={{fontSize: 12}}>마침표는 모든 법적 절차를 대행합니다. 유족의 추가 조치가 필요하지 않습니다.</span>
            </div>
            <div className="legal-ref" style={{ marginTop: 10, textAlign: 'center' }}>
              <strong>법적 근거:</strong> 개인정보보호법 제58조의2(고인 개인정보 처리) — 법정상속인의 삭제 요청 가능 |<br />
              개인정보보호법 제75조(과태료) — 정당한 요청 3년 이상 미응답 시 3천만원 이하 과태료 |<br />
              KISO 정책규정 제29조(계정 폐쇄 요구) — 상속인의 계정 폐쇄 요청 가능
            </div>
          </div>
        </div>
      </section>

      {/* ===== 요금 ===== */}
      <section className="s" id="pricing">
        <div className="section-divider reveal"></div>
        <div className="sl reveal">요금</div>
        <h2 className="st reveal">내 온라인 삶의 마지막 정리,<br />하루 96원부터</h2>
        <p className="ss reveal reveal-delay-1">위임장 + 이메일 요청 + 법적 조치 대행 모두 포함. 추가 비용 없습니다.</p>
        <div className="pg" style={{justifyContent:'center'}}>
          {[
            {
              name: 'BASIC', price: '2,900', unit: '원/월',
              desc: '나를 위한 디지털 정리',
              features: ['CSV 업로드 계정 등록', '21+개 서비스 스캔', '사망 감지 (공공 마이데이터)', 'SNS·포털·커머스 말소', '게임 계정 말소 포함', '디지털 유언장 포함', '삭제 제외 계정 지정', '이메일 요청 발송', '법적 조치 대행'],
              link: '/machimpyo/auth/signup'
            },
          ].map((plan, i) => (
            <div className="pc f" key={i}>
              <div className="pcn">{plan.name}</div>
              <div className="pcp">{plan.price}<span className="u">{plan.unit}</span></div>
              <div className="pcd">{plan.desc}</div>
              <ul className="pcl">
                {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <a href={plan.link} className="btn-p">가입하기</a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="sa" id="faq">
        <div className="s2" style={{textAlign: 'center'}}>
          <div className="section-divider reveal" style={{margin: '0 auto'}}></div>
          <div className="sl reveal" style={{textAlign: 'center'}}>FAQ</div>
          <h2 className="st reveal" style={{textAlign: 'center'}}>자주 묻는 질문</h2>
          <div className="fl">
            {faqItems.map((item, i) => (
              <details
                className={`fi reveal reveal-delay-${Math.min(Math.floor(i / 2) + 1, 5)}`}
                key={i}
              >
                <summary className="fq">
                  {item.q}
                  <span className="fa">▼</span>
                </summary>
                <div className="fan">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta">
        <div className="cta-dot">。</div>
        <h2>당신의 디지털 유산,<br />가족을 위해 지금 준비하세요</h2>
        <p className="cs">당신이 준비하면 유족은 아무것도 할 필요가 없습니다.<br />계정 자동 발견, 사망 감지, 삭제 대행, 법적 조치까지 월 2,900원.</p>
        <a href="/machimpyo/auth/signup" className="btn-p">월 2,900원 — 30일 무료</a>
        <div className="cf">언제든 해지 가능 · 30일 내 전액 환불 · 위임장 즉시 폐기</div>
      </section>

      {/* ===== FOOTER (보험사 스타일) ===== */}
      <footer>
        <div style={{
          maxWidth: 800, margin: '0 auto', padding: '0 24px',
          fontSize: 11, lineHeight: 1.9, color: '#7a6e5e',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 16 }}>
            <span className="fd"></span> 마침표 — 당신의 디지털 삶에도 마침표를 <span className="fd"></span>
          </div>
          <div style={{ fontWeight: 600, color: '#5a4f42', marginBottom: 10, fontSize: 12 }}>
            디지털 삶의 아름다운 마무리
          </div>

          <div style={{ marginBottom: 12 }}>
            상호명: 마침표 · 대표: 위진수 · 사업자등록번호: 811-11-03306<br />
            통신판매업신고: 2026-인천연수구-0931 · 개인정보보호책임자: 위진수 · 이메일: help@machimpyo.kr
          </div>

          <div style={{ marginBottom: 12 }}>
            본 서비스는 가입자의 법적 위임에 따라 사후 디지털 계정 정리를 대행합니다.<br />
            위임장은 민법 제680조(위임)·제147조(정지조건부)에 따라 '사망 시 효력 발생 조건부 위임'으로 작성되며, 보험업법에 따른 보험상품이 아닙니다.<br />
            KISO 정책규정 제28조에 따라 상속인에게 계정 접속권을 요청하지 않으며, 제29조에 따라 계정 폐쇄 요청 절차를 준수합니다.<br />
            미응답 플랫폼에 대해서는 개인정보보호법 제58조의2·제75조에 따라 법적 조치를 대행합니다.
          </div>

          <div style={{ marginBottom: 12 }}>
            마침표는 계정 삭제만 대행하며, 경제적 가치가 있는 계정은 사전에 삭제 제외 요청이 없으면 모두 삭제됩니다.<br />
            삭제 제외를 원하는 계정은 가입 시 또는 대시보드에서 지정할 수 있습니다.<br />
            통신판매업 신고로 합법적으로 운영됩니다(전자상거래법 제12조, 국회입법조사처 확인).<br />
            본 서비스의 위임장 및 약관은 법률 검토를 완료했습니다.
          </div>

          <div style={{ marginBottom: 12 }}>
            모든 개인정보는 금융권 AES-256-GCM으로 암호화되며, 사망 확인 목적 외에는 사용되지 않습니다.<br />
            e프라이버시 클린서비스 CSV는 사용자가 직접 내려받아 업로드하며, 마침표가 대행하여 조회하지 않습니다.
          </div>

          <div style={{ marginBottom: 12 }}>
            마침표는 서울특별시 강남구에 소재하며, 관련 법령을 준수합니다.<br />
            개인정보 처리 방침 및 이용약관은 아래 링크에서 확인하실 수 있습니다.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <a href="#" style={{ color: '#5a4f42', textDecoration: 'none' }}>이용약관</a>
            <a href="#" style={{ color: '#5a4f42', textDecoration: 'none' }}>개인정보처리방침</a>
            <a href="#" style={{ color: '#5a4f42', textDecoration: 'none' }}>사업자정보확인</a>
            <a href="#" style={{ color: '#5a4f42', textDecoration: 'none' }}>help@machimpyo.kr</a>
          </div>

          <div style={{ borderTop: '1px solid rgba(44,36,22,.06)', paddingTop: 12, marginTop: 4 }}>
            &copy; 2026 마침표. All rights reserved.<br />
            <span style={{ fontSize: 10 }}>본 서비스는 가입자를 대신하여 사후 계정 정리를 위임받아 수행합니다. 각 플랫폼의 최종 삭제 결정권은 해당 플랫폼에 있습니다. 미응답 시 개인정보보호법에 따른 법적 조치를 대행합니다. 경제적 가치가 있는 계정의 확인 및 상속은 상속인의 책임입니다.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
