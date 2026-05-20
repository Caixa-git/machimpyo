import { WaitlistForm } from "@/components/waitlist-form";

const cards = [
  {
    emoji: "🔍",
    title: "스캔",
    description: "수백 개의 데이터 브로커에서 내 개인정보가 있는지 자동으로 검색합니다.",
  },
  {
    emoji: "🛡️",
    title: "삭제",
    description: "발견된 개인정보를 데이터 브로커에서 삭제 요청합니다. 법적 권리로 보장됩니다.",
  },
  {
    emoji: "✅",
    title: "안심",
    description: "지속적인 모니터링으로 재노출을 방지하고, 내 정보가 안전함을 확인합니다.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ── */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-white">
        <span className="text-xl font-bold tracking-tight text-[#0a0b0d]">
          ClearMe
        </span>
        <a href="#waitlist" className="text-sm font-medium text-[#0052ff]">
          대기자 등록 →
        </a>
      </nav>

      {/* ── Hero Section (white bg) ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 bg-white">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 bg-[#eef0f3] text-[#0a0b0d]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#0052ff] animate-pulse" />
          개인정보 노출 위험 증가
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight max-w-3xl text-[#0a0b0d]">
          내 개인정보,
          <br />
          <span className="text-[#0052ff]">인터넷에 노출되어 있습니다</span>
        </h1>

        <p className="mt-6 text-lg max-w-xl leading-relaxed text-[#5b616e]">
          이름, 전화번호, 주소까지 — 데이터 브로커들이 내 정보를 팔고 있습니다.
          <br />
          클리어미가 찾아내고, 지워드립니다.
        </p>

        <a
          href="#waitlist"
          className="mt-10 inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105 active:scale-95 bg-[#0052ff] hover:bg-[#003fcb]"
          style={{ borderRadius: "56px" }}
        >
          지금 스캔하고 찾으세요
        </a>
      </section>

      {/* ── 3-Step Process Section (dark bg) ── */}
      <section className="px-6 py-20 bg-[#0a0b0d]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-4 text-white">
            3단계로 안전하게
          </h2>
          <p className="text-center text-base mb-14 max-w-lg mx-auto text-[#8a919e]">
            복잡한 절차 없이, 세 번의 클릭으로 개인정보를 보호하세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col items-center text-center p-8 bg-[#0a0b0d]"
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(91,97,110,0.2)",
                }}
              >
                <div
                  className="flex items-center justify-center w-14 h-14 text-2xl mb-5"
                  style={{
                    background: "rgba(0,82,255,0.12)",
                    borderRadius: "12px",
                  }}
                >
                  {card.emoji}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#8a919e]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mt-10 text-sm font-medium text-[#5b616e]">
            <span className="text-[#0052ff]">1</span>
            <div
              className="w-8 h-px"
              style={{ background: "rgba(91,97,110,0.3)" }}
            />
            <span className="text-[#0052ff]">2</span>
            <div
              className="w-8 h-px"
              style={{ background: "rgba(91,97,110,0.3)" }}
            />
            <span className="text-[#0052ff]">3</span>
          </div>
        </div>
      </section>

      {/* ── Social Proof (white bg) ── */}
      <section className="px-6 py-16 text-center bg-white">
        <p className="text-base font-medium text-[#0a0b0d]">
          이미{" "}
          <span className="font-bold text-[#0052ff]">50+</span>명이 스캔을
          완료했습니다
        </p>
        <div className="flex items-center justify-center gap-1 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-lg text-[#0052ff]">
              ★
            </span>
          ))}
        </div>
        <p className="mt-2 text-sm text-[#5b616e]">
          &quot;클릭 한 번에 내 정보가 어디에 있는지 알 수 있었어요&quot;
        </p>
      </section>

      {/* ── Waitlist Section (dark bg) ── */}
      <section id="waitlist" className="px-6 py-20 bg-[#0a0b0d]">
        <div className="max-w-md mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
            먼저 시작하세요
          </h2>
          <p className="text-sm text-[#8a919e]">
            대기자에 등록하시면 서비스 오픈 시 가장 먼저 알려드립니다.
          </p>
        </div>

        {/* Override WaitlistForm styles to match Coinbase dark theme */}
        <div className="max-w-md mx-auto [&_button]:rounded-[56px] [&_button]:bg-[#0052ff] [&_button]:text-white [&_button]:font-semibold [&_button:hover]:bg-[#003fcb] [&_button]:transition-colors [&_input]:bg-[#161819] [&_input]:border-[rgba(91,97,110,0.2)] [&_input]:text-white [&_input]:focus:ring-[#0052ff] [&_.max-w-md]:mx-auto [&_.max-w-md]:max-w-md [&_h3]:text-white [&_label]:text-[#8a919e] [&_.text-red-600]:text-red-400 [&_div]:rounded-[16px] [&_div]:border-[rgba(91,97,110,0.2)] [&_div]:bg-[#0a0b0d]">
          <WaitlistForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 text-center text-xs text-[#5b616e] bg-[#0a0b0d]"
        style={{ borderTop: "1px solid rgba(91,97,110,0.15)" }}
      >
        © 2026 ClearMe. 내 개인정보, 내가 지킵니다.
      </footer>
    </div>
  );
}
