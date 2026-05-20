"use client"

import { useState } from "react"

type Exposure = {
  id: string
  broker_name: string
  url: string
  found_name: string | null
  found_phone: string | null
}

type ExposureFormProps = {
  scanId: string
  scanStatus: string
  initialExposures: Exposure[]
}

export function ExposureForm({
  scanId,
  scanStatus,
  initialExposures,
}: ExposureFormProps) {
  const [exposures, setExposures] = useState<Exposure[]>(initialExposures)
  const [brokerName, setBrokerName] = useState("")
  const [url, setUrl] = useState("")
  const [foundName, setFoundName] = useState("")
  const [foundPhone, setFoundPhone] = useState("")
  const [adding, setAdding] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState("")

  const isCompleted = scanStatus === "complete"

  const handleAdd = async () => {
    if (!brokerName.trim() || !url.trim()) {
      setError("브로커명과 URL은 필수입니다.")
      return
    }

    setAdding(true)
    setError("")

    try {
      const res = await fetch("/api/admin/exposure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          brokerName: brokerName.trim(),
          url: url.trim(),
          name: foundName.trim() || undefined,
          phone: foundPhone.trim() || undefined,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error ?? "노출 추가에 실패했습니다.")
        return
      }

      setExposures((prev) => [
        ...prev,
        {
          id: result.id,
          broker_name: brokerName.trim(),
          url: url.trim(),
          found_name: foundName.trim() || null,
          found_phone: foundPhone.trim() || null,
        },
      ])

      setBrokerName("")
      setUrl("")
      setFoundName("")
      setFoundPhone("")
    } catch {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setAdding(false)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    setError("")

    try {
      const res = await fetch("/api/admin/scan-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error ?? "스캔 완료 처리에 실패했습니다.")
        return
      }

      window.location.href = "/admin"
    } catch {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setCompleting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#0a0b0d",
    border: "1px solid rgba(91,97,110,0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#ffffff",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  }

  const labelStyle: React.CSSProperties = {
    color: "#8a919e",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "6px",
    display: "block",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  }

  return (
    <>
      {/* Exposure List */}
      <div style={{ background: "#282b31", borderRadius: "16px", border: "1px solid rgba(91,97,110,0.2)", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(91,97,110,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "32px", height: "32px", background: "rgba(239,68,68,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
            🔍
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>발견된 노출 항목</h2>
          {exposures.length > 0 && (
            <span style={{ marginLeft: "auto", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" }}>
              {exposures.length}건
            </span>
          )}
        </div>

        {exposures.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ color: "#8a919e", fontSize: "14px", margin: 0 }}>아직 발견된 노출 항목이 없습니다</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(91,97,110,0.2)" }}>
                <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>브로커</th>
                <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>URL</th>
                <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>이름</th>
                <th style={{ padding: "12px 24px", textAlign: "left", color: "#8a919e", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>전화번호</th>
              </tr>
            </thead>
            <tbody>
              {exposures.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: "1px solid rgba(91,97,110,0.1)" }}>
                  <td style={{ padding: "14px 24px", color: "#ffffff", fontWeight: 500 }}>{exp.broker_name}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <a href={exp.url} target="_blank" rel="noopener noreferrer" style={{ color: "#0052ff", textDecoration: "none", fontSize: "13px" }}>
                      {exp.url.length > 40 ? exp.url.substring(0, 40) + "…" : exp.url}
                    </a>
                  </td>
                  <td style={{ padding: "14px 24px", color: "#8a919e" }}>{exp.found_name ?? "-"}</td>
                  <td style={{ padding: "14px 24px", color: "#8a919e" }}>{exp.found_phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Exposure Form */}
      {!isCompleted && (
        <>
          <div style={{ background: "#282b31", borderRadius: "16px", border: "1px solid rgba(91,97,110,0.2)", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(91,97,110,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(0,82,255,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                ➕
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>노출 항목 추가</h2>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>브로커명 *</label>
                  <input
                    style={inputStyle}
                    placeholder="예: 번호사냥꾼"
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>URL *</label>
                  <input
                    style={inputStyle}
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>발견된 이름</label>
                  <input
                    style={inputStyle}
                    placeholder="홍길동"
                    value={foundName}
                    onChange={(e) => setFoundName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>발견된 전화번호</label>
                  <input
                    style={inputStyle}
                    placeholder="01012345678"
                    value={foundPhone}
                    onChange={(e) => setFoundPhone(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: "#ef4444", fontSize: "13px", margin: "0 0 12px 0", background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: "8px" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleAdd}
                disabled={adding}
                style={{
                  background: "rgba(0,82,255,0.15)",
                  color: "#0052ff",
                  border: "1px solid rgba(0,82,255,0.3)",
                  borderRadius: "56px",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: adding ? "not-allowed" : "pointer",
                  opacity: adding ? 0.6 : 1,
                }}
              >
                {adding ? "추가 중…" : "+ 항목 추가"}
              </button>
            </div>
          </div>

          {/* Complete Scan Button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleComplete}
              disabled={completing}
              style={{
                background: "#0052ff",
                color: "#ffffff",
                border: "none",
                borderRadius: "56px",
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: completing ? "not-allowed" : "pointer",
                opacity: completing ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
            >
              {completing ? "처리 중…" : "✅ 스캔 완료 + 이메일 발송"}
            </button>
          </div>
        </>
      )}
    </>
  )
}
