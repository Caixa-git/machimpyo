'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

interface ParsedAccount {
  service_name: string
  category: string
  login_id: string
}

type UploadState = 'idle' | 'uploading' | 'preview' | 'saving' | 'done' | 'error'

export default function CsvUploadPage() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [accounts, setAccounts] = useState<ParsedAccount[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    saved: number
    duplicates: number
    skipped?: number
    message: string
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // Validate
    const fileName_lower = file.name.toLowerCase()
    if (!fileName_lower.endsWith('.csv') && !fileName_lower.endsWith('.tsv') && !fileName_lower.endsWith('.txt')) {
      setError('CSV(.csv), TSV(.tsv) 또는 텍스트(.txt) 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    setFileName(file.name)
    setError('')
    setUploadState('uploading')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/csv-parse', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'CSV 파일을 처리할 수 없습니다.')
        setUploadState('idle')
        return
      }

      setAccounts(data.accounts)

      if (data.truncated) {
        setError(`처음 ${data.total}개만 표시됩니다. (전체 ${data.original_total}개 중)`)
      }

      setUploadState('preview')
    } catch {
      setError('파일 업로드 중 오류가 발생했습니다.')
      setUploadState('idle')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleSave = async () => {
    setUploadState('saving')
    setError('')

    try {
      const res = await fetch('/api/accounts/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '계정 저장에 실패했습니다.')
        setUploadState('preview')
        return
      }

      setResult(data)
      setUploadState('done')
    } catch {
      setError('계정 저장 중 오류가 발생했습니다.')
      setUploadState('preview')
    }
  }

  const categoryLabel: Record<string, string> = {
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

  // Compute category summary from preview
  const categoryCounts = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1
    return acc
  }, {})

  return (
    <div className="machimpyo" style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#1e3a5f',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', marginBottom: 16,
          }}>。</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c2416', marginBottom: 6 }}>
            계정 CSV 업로드
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42', lineHeight: 1.8, maxWidth: 440, margin: '0 auto' }}>
            e프라이버시 클린서비스에서 CSV를 내려받아 업로드하면<br />
            가입한 모든 사이트를 한 번에 찾아냅니다.
          </p>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(30,58,95,.04)', border: '1px solid rgba(30,58,95,.12)',
          borderRadius: 14, padding: '16px 20', marginBottom: 24,
          fontSize: 13, lineHeight: 1.8, color: '#5a4f42',
        }}>
          <strong style={{ color: '#1e3a5f' }}>📋 CSV 가져오는 방법</strong>
          <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            <li><a href="https://www.eprivacy.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f' }}>e프라이버시 클린서비스</a> 접속</li>
            <li>로그인 후 &ldquo;내 정보&rdquo; &gt; &ldquo;본인확인 내역&rdquo; 조회</li>
            <li>CSV 파일 다운로드 (또는 서비스명을 한 줄에 하나씩 입력)</li>
            <li>아래에 파일 업로드 또는 텍스트로 입력</li>
          </ol>
        </div>

        {/* Upload area */}
        {uploadState === 'idle' && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#1e3a5f' : 'rgba(44,36,22,.15)'}`,
                borderRadius: 18, padding: '48px 24px', textAlign: 'center',
                cursor: 'pointer', transition: 'all .2s',
                background: isDragging ? 'rgba(30,58,95,.04)' : 'transparent',
              }}
            >
              <Upload size={40} style={{ color: '#8c8072', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#2c2416', marginBottom: 4 }}>
                클릭하거나 파일을 드래그하세요
              </div>
              <div style={{ fontSize: 13, color: '#8c8072' }}>
                CSV · TSV · TXT (최대 5MB)
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            {/* Or paste text */}
            <div style={{ marginTop: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
                color: '#8c8072', fontSize: 13,
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(44,36,22,.08)' }} />
                <span>또는 서비스명을 직접 입력</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(44,36,22,.08)' }} />
              </div>
              <textarea
                placeholder="네이버, 카카오, 인스타그램, 리그오브레전드, 넷플릭스…"
                rows={3}
                style={{
                  width: '100%', background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
                  borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#5a4f42',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onPaste={async (e) => {
                  const pasted = e.clipboardData.getData('text')
                  if (pasted.includes('\n') || pasted.includes(',')) {
                    e.preventDefault()
                    // Create a blob and process it
                    const blob = new Blob([pasted], { type: 'text/plain' })
                    const file = new File([blob], 'pasted.txt', { type: 'text/plain' })
                    await handleFile(file)
                  }
                }}
              />
              <p style={{ fontSize: 11, color: '#b0a694', marginTop: 6 }}>
                쉼표(,)나 줄바꿈으로 구분하여 여러 서비스를 한 번에 입력하고 붙여넣기하세요.
              </p>
            </div>
          </>
        )}

        {/* Loading state */}
        {uploadState === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: '#1e3a5f', marginBottom: 16 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#2c2416' }}>
              CSV 파일 분석 중...
            </div>
            <p style={{ fontSize: 13, color: '#8c8072', marginTop: 4 }}>
              {fileName}
            </p>
          </div>
        )}

        {/* Preview */}
        {uploadState === 'preview' && (
          <>
            {/* Summary card */}
            <div style={{
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 14, padding: 20, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FileText size={18} style={{ color: '#1e3a5f' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2c2416' }}>
                  {accounts.length}개 서비스 발견
                </span>
                <span style={{ fontSize: 12, color: '#8c8072', marginLeft: 'auto' }}>
                  {fileName}
                </span>
              </div>

              {/* Category breakdown */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div key={cat} style={{
                    background: 'rgba(30,58,95,.06)', borderRadius: 56,
                    padding: '4px 10px', fontSize: 12, color: '#5a4f42',
                  }}>
                    {categoryLabel[cat] || cat} {count}개
                  </div>
                ))}
              </div>
            </div>

            {/* Account list */}
            <div style={{
              background: '#faf7f2', border: '1px solid rgba(44,36,22,.08)',
              borderRadius: 14, marginBottom: 20, maxHeight: 320, overflow: 'auto',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(44,36,22,.06)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2c2416' }}>
                  발견된 서비스 목록
                </span>
                <span style={{ fontSize: 12, color: '#8c8072', marginLeft: 8 }}>
                  ({accounts.length}개)
                </span>
              </div>
              <div style={{ padding: '4px 16px' }}>
                {accounts.map((acc, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 0', borderTop: i > 0 ? '1px solid rgba(44,36,22,.04)' : 'none',
                    fontSize: 13,
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(30,58,95,.08)', fontSize: 11,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, color: '#2c2416', fontWeight: 500 }}>
                      {acc.service_name}
                    </span>
                    <span style={{
                      fontSize: 11, color: '#8c8072',
                      background: 'rgba(44,36,22,.06)', borderRadius: 56,
                      padding: '1px 8px',
                    }}>
                      {categoryLabel[acc.category] || acc.category}
                    </span>
                    {acc.login_id && (
                      <span style={{ fontSize: 11, color: '#b0a694' }}>
                        {acc.login_id}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(198,40,40,.06)', borderRadius: 12,
                padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#c62828',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Actions */}

            <div style={{ display: 'flex', gap: 10 }}>
              <MachimpyoButton variant="secondary"
                onClick={() => { setUploadState('idle'); setAccounts([]); setFileName(''); setError('') }}
                style={{ flex: 1 }}>
                다시 선택
              </MachimpyoButton>
              <MachimpyoButton onClick={handleSave}
                style={{ flex: 2, justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {accounts.length}개 계정 등록하기 <ArrowRight size={16} />
                </span>
              </MachimpyoButton>
            </div>
          </>
        )}

        {/* Saving state */}
        {uploadState === 'saving' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: '#1e3a5f', marginBottom: 16 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#2c2416' }}>
              계정 저장 중...
            </div>
          </div>
        )}

        {/* Done */}
        {uploadState === 'done' && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#2e7d32',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, boxShadow: '0 0 40px rgba(46,125,50,.2)',
            }}>
              <CheckCircle size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2c2416', marginBottom: 8 }}>
              계정 등록 완료
            </h2>
            <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, lineHeight: 1.8 }}>
              {result.message}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              <div style={{
                background: '#faf7f2', borderRadius: 14, padding: '16px 20', flex: 1,
                border: '1px solid rgba(44,36,22,.08)',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2e7d32' }}>{result.saved}</div>
                <div style={{ fontSize: 12, color: '#8c8072' }}>등록 완료</div>
              </div>
              {result.duplicates > 0 && (
                <div style={{
                  background: '#faf7f2', borderRadius: 14, padding: '16px 20', flex: 1,
                  border: '1px solid rgba(44,36,22,.08)',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#8c8072' }}>{result.duplicates}</div>
                  <div style={{ fontSize: 12, color: '#8c8072' }}>중복 제외</div>
                </div>
              )}
              {result.skipped && (
                <div style={{
                  background: '#faf7f2', borderRadius: 14, padding: '16px 20', flex: 1,
                  border: '1px solid rgba(44,36,22,.08)',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#c67a2e' }}>{result.skipped}</div>
                  <div style={{ fontSize: 12, color: '#8c8072' }}>요금제 초과</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <MachimpyoButton variant="secondary"
                onClick={() => { setUploadState('idle'); setAccounts([]); setFileName(''); setResult(null) }}>
                추가 업로드
              </MachimpyoButton>
              <MachimpyoButton onClick={() => router.push('/machimpyo/dashboard')}>
                대시보드로 이동
              </MachimpyoButton>
            </div>
          </div>
        )}

        {/* Error display (non-blocking) */}
        {uploadState === 'idle' && error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(198,40,40,.06)', borderRadius: 12,
            padding: '12px 14px', marginTop: 16, fontSize: 13, color: '#c62828',
          }}>
            <XCircle size={16} />
            {error}
            <button onClick={() => setError('')} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#c62828', cursor: 'pointer', fontSize: 14,
            }}>✕</button>
          </div>
        )}
      </div>
    </div>
  )
}
