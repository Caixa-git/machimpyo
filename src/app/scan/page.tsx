import { ScanRequestForm } from "@/components/scan-request-form";
import { ChevronRight, Shield, CheckCircle2, Clock, Gift, Search } from "lucide-react";

export const metadata = {
  title: "스캔 요청 - ClearMe",
  description: "인터넷에 노출된 내 개인정보를 스캔하세요. 24시간 내 결과를 확인할 수 있습니다.",
};

const steps = [
  { id: 1, label: "정보 입력" },
  { id: 2, label: "스캔 진행" },
  { id: 3, label: "결과 확인" },
];

const sidebarChecks = [
  { icon: Clock, text: "24시간 내 결과 확인" },
  { icon: Gift, text: "첫 스캔 무료 제공" },
  { icon: Search, text: "20개 이상 브로커 검색" },
];

export default function ScanPage() {
  const currentStep = 1;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumb ── */}
      <nav aria-label="브레드크럼" className="border-b border-[rgba(91,97,110,0.12)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-3 text-sm">
          <a
            href="/"
            className="text-[#5b616e] transition-colors hover:text-[#0052ff]"
          >
            홈
          </a>
          <ChevronRight className="h-3.5 w-3.5 text-[#5b616e]/50" />
          <span className="font-medium text-[#0a0b0d]">스캔 요청</span>
        </div>
      </nav>

      {/* ── Progress Bar ── */}
      <div className="border-b border-[rgba(91,97,110,0.12)] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  {/* Step circle + label */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-[#0052ff] text-white shadow-[0_0_0_4px_rgba(0,82,255,0.15)]"
                          : isCompleted
                          ? "bg-[#0052ff] text-white"
                          : "bg-[rgba(91,97,110,0.1)] text-[#5b616e]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs leading-tight ${
                          isActive
                            ? "font-semibold text-[#0052ff]"
                            : "text-[#5b616e]"
                        }`}
                      >
                        {step.id}단계
                      </span>
                      <span
                        className={`text-sm leading-tight ${
                          isActive
                            ? "font-semibold text-[#0a0b0d]"
                            : isCompleted
                            ? "font-medium text-[#0a0b0d]"
                            : "text-[#5b616e]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>

                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div className="mx-4 h-px flex-1 sm:mx-6">
                      <div
                        className={`h-full transition-colors duration-300 ${
                          isCompleted ? "bg-[#0052ff]" : "bg-[rgba(91,97,110,0.15)]"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Left – Form Card */}
          <div className="flex-1">
            <div className="rounded-2xl border border-[rgba(91,97,110,0.2)] bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[#0a0b0d]">
                  스캔 요청하기
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#5b616e]">
                  아래 정보를 입력하시면 인터넷에 노출된 개인정보를 안전하게 스캔해 드립니다.
                </p>
              </div>
              <ScanRequestForm />
            </div>
          </div>

          {/* Right – Sidebar */}
          <aside className="w-full lg:w-[340px] lg:shrink-0">
            <div className="rounded-2xl border border-[rgba(91,97,110,0.2)] bg-white p-8 shadow-sm">
              {/* Shield icon header */}
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(0,82,255,0.08)]">
                <Shield className="h-6 w-6 text-[#0052ff]" />
              </div>

              <h2 className="text-lg font-bold text-[#0a0b0d]">
                스캔이란?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5b616e]">
                클리어미 스캔은 인터넷 상의 데이터 브로커 20곳 이상을 검색하여
                귀하의 개인정보가 어디에 노출되어 있는지 찾아냅니다.
                안전한 디지털 생활의 첫걸음을 내딛으세요.
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-[rgba(91,97,110,0.12)]" />

              {/* Check items */}
              <ul className="space-y-4">
                {sidebarChecks.map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(0,82,255,0.08)]">
                      <item.icon className="h-3.5 w-3.5 text-[#0052ff]" />
                    </div>
                    <span className="text-sm font-medium text-[#0a0b0d]">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Trust badge */}
              <div className="mt-6 rounded-xl bg-[rgba(0,82,255,0.04)] p-4">
                <p className="text-xs leading-relaxed text-[#5b616e]">
                  🔒 모든 스캔은 256비트 SSL 암호화로 보호되며, 귀하의 정보는
                  스캔 목적 외에 절대 사용되지 않습니다.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
