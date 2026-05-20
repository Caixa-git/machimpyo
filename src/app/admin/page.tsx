import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

type ScanRow = {
  id: string
  created_at: string
  status: string
  total_found: number
  users: {
    name: string
    email: string
    phone: string
  }[] | null
}

export default async function AdminPage() {
  const supabase = await createClient()

  const [pendingRes, processingRes, completeRes] = await Promise.all([
    supabase.from("scans").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("scans").select("id", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("scans").select("id", { count: "exact", head: true }).eq("status", "complete"),
  ])

  const pendingCount = pendingRes.count ?? 0
  const processingCount = processingRes.count ?? 0
  const completeCount = completeRes.count ?? 0

  const { data: scans } = await supabase
    .from("scans")
    .select("id, created_at, status, total_found, users(name, email, phone)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  const { data: recentComplete } = await supabase
    .from("scans")
    .select("id, created_at, status, total_found, users(name, email)")
    .eq("status", "complete")
    .order("created_at", { ascending: false })
    .limit(5)

  const pendingScans = (scans ?? []) as ScanRow[]
  const recentCompleteScans = (recentComplete ?? []) as (ScanRow & { total_found: number })[]

  const stats = [
    { label: "대기 중", value: pendingCount, color: "#f59e0b" },
    { label: "처리 중", value: processingCount, color: "#0052ff" },
    { label: "완료", value: completeCount, color: "#22c55e" },
    { label: "총 스캔", value: pendingCount + processingCount + completeCount, color: "#8b5cf6" },
  ]

  return (
    <div style={{ background: "#0a0b0d", minHeight: "100vh", color: "#ffffff", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(91,97,110,0.2)", padding: "20px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", background: "#0052ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
          🛡️
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>클리어미 관리자</h1>
        <div style={{ marginLeft: "auto" }}>
          <Link href="/" style={{ color: "#8a919e", fontSize: "14px", textDecoration: "none" }}>
            ← 홈으로
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#282b31",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(91,97,110,0.2)",
              }}
            >
              <p style={{ color: "#8a919e", fontSize: "13px", fontWeight: 600, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "36px", fontWeight: 700, margin: 0, color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Pending Scans */}
        <div
          style={{
            background: "#282b31",
            borderRadius: "16px",
            border: "1px solid rgba(91,97,110,0.2)",
            marginBottom: "32px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(91,97,110,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>대기 중인 스캔 요청</h2>
            <span style={{ marginLeft: "auto", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" }}>
              {pendingScans.length}건
            </span>
          </div>

          {pendingScans.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: "#8a919e", fontSize: "14px", margin: 0 }}>대기 중인 스캔 요청이 없습니다 🎉</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(91,97,110,0.2)" }}>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>이름</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>이메일</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>요청일</th>
                  <th style={{ padding: "12px 24px", textAlign: "right", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {pendingScans.map((scan) => {
                  const user = scan.users?.[0]
                  return (
                    <tr key={scan.id} style={{ borderBottom: "1px solid rgba(91,97,110,0.1)" }}>
                      <td style={{ padding: "16px 24px", color: "#ffffff", fontWeight: 500 }}>{user?.name ?? "-"}</td>
                      <td style={{ padding: "16px 24px", color: "#8a919e" }}>{user?.email ?? "-"}</td>
                      <td style={{ padding: "16px 24px", color: "#8a919e" }}>
                        {new Date(scan.created_at).toLocaleDateString("ko-KR")}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <Link
                          href={`/admin/scan/${scan.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#0052ff",
                            color: "#ffffff",
                            padding: "8px 16px",
                            borderRadius: "56px",
                            fontSize: "13px",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "background 0.2s",
                          }}
                        >
                          처리하기 →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Complete */}
        {recentCompleteScans.length > 0 && (
          <div
            style={{
              background: "#282b31",
              borderRadius: "16px",
              border: "1px solid rgba(91,97,110,0.2)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(91,97,110,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>최근 완료된 스캔</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(91,97,110,0.2)" }}>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>이름</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>이메일</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>발견 항목</th>
                  <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>완료일</th>
                </tr>
              </thead>
              <tbody>
                {recentCompleteScans.map((scan) => {
                  const user = scan.users?.[0]
                  return (
                    <tr key={scan.id} style={{ borderBottom: "1px solid rgba(91,97,110,0.1)" }}>
                      <td style={{ padding: "16px 24px", color: "#ffffff", fontWeight: 500 }}>{user?.name ?? "-"}</td>
                      <td style={{ padding: "16px 24px", color: "#8a919e" }}>{user?.email ?? "-"}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" }}>
                          {scan.total_found}건 발견
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", color: "#8a919e" }}>
                        {new Date(scan.created_at).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
