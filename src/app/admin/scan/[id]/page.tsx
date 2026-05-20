import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExposureForm } from "@/components/admin/exposure-form"

type ScanDetail = {
  id: string
  status: string
  created_at: string
  users: {
    name: string
    email: string
    phone: string
  }[] | null
  exposures: {
    id: string
    broker_name: string
    url: string
    data_found: { name: string; phone: string } | null
    status: string
  }[]
}

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: scan } = await supabase
    .from("scans")
    .select("id, status, created_at, users(name, email, phone), exposures(id, broker_name, url, data_found, status)")
    .eq("id", id)
    .single()

  if (!scan) {
    notFound()
  }

  const scanDetail = scan as unknown as ScanDetail
  const user = scanDetail.users?.[0]
  const isComplete = scanDetail.status === "complete"

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "대기 중", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    processing: { label: "처리 중", color: "#0052ff", bg: "rgba(0,82,255,0.15)" },
    complete: { label: "완료", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  }
  const currentStatus = statusConfig[scanDetail.status] ?? statusConfig.pending

  return (
    <div style={{ background: "#0a0b0d", minHeight: "100vh", color: "#ffffff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(91,97,110,0.2)", padding: "20px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <a href="/admin" style={{ color: "#8a919e", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          ← 대시보드
        </a>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: currentStatus.bg, color: currentStatus.color, fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* User Info Card */}
        <div style={{ background: "#282b31", borderRadius: "16px", border: "1px solid rgba(91,97,110,0.2)", marginBottom: "24px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(91,97,110,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(0,82,255,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
              👤
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>사용자 정보</h2>
          </div>
          <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            <div>
              <p style={{ color: "#8a919e", fontSize: "12px", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>이름</p>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>{user?.name ?? "-"}</p>
            </div>
            <div>
              <p style={{ color: "#8a919e", fontSize: "12px", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>이메일</p>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: "#0052ff" }}>{user?.email ?? "-"}</p>
            </div>
            <div>
              <p style={{ color: "#8a919e", fontSize: "12px", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>휴대전화</p>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>{user?.phone ?? "-"}</p>
            </div>
          </div>
        </div>

        {/* Exposure Form */}
        <ExposureForm
          scanId={scanDetail.id}
          scanStatus={scanDetail.status}
          initialExposures={scanDetail.exposures.map((e) => ({
            id: e.id,
            broker_name: e.broker_name,
            url: e.url,
            found_name: e.data_found?.name ?? null,
            found_phone: e.data_found?.phone ?? null,
          }))}
        />

        {isComplete && (
          <div style={{ marginTop: "24px", background: "rgba(34,197,94,0.08)", borderRadius: "16px", border: "1px solid rgba(34,197,94,0.2)", padding: "24px", textAlign: "center" }}>
            <p style={{ color: "#22c55e", fontSize: "14px", fontWeight: 500, margin: 0 }}>✅ 이 스캔은 완료 처리되어 결과 이메일이 발송되었습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
