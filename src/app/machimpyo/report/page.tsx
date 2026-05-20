'use client'

import { useState } from 'react'
import { MachimpyoButton } from '@/components/machimpyo/MachimpyoButton'

export default function ReportPage() {
  const [step, setStep] = useState<'info' | 'upload' | 'done'>('info')
  const [deceasedName, setDeceasedName] = useState('')
  const [relation, setRelation] = useState('')
  const [file, setFile] = useState<File | null>(null)

  return (
    <div style={{
      padding: '100px 24px 60px', maxWidth: 480, margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', background: '#1e3a5f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color: '#fff', marginBottom: 24,
      }}>。</div>

      {step === 'info' && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#2c2416' }}>
            고인의 정보를 알려주세요
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, textAlign: 'center' }}>
            마침표 서비스 가입 여부를 확인합니다.
          </p>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#7a6e5e', marginBottom: 4, display: 'block' }}>고인 성함</label>
              <input value={deceasedName} onChange={(e) => setDeceasedName(e.target.value)}
                placeholder="예: 홍길동"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 15,
                  background: '#faf7f2', border: '1px solid rgba(44,36,22,.12)',
                  color: '#2c2416', outline: 'none',
                  boxShadow: '0 1px 3px rgba(44,36,22,0.04)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#7a6e5e', marginBottom: 4, display: 'block' }}>고인과의 관계</label>
              <select value={relation} onChange={(e) => setRelation(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 15,
                  background: '#faf7f2', border: '1px solid rgba(44,36,22,.12)',
                  color: '#2c2416', outline: 'none',
                  boxShadow: '0 1px 3px rgba(44,36,22,0.04)',
                }}
              >
                <option value="">선택하세요</option>
                <option value="spouse">배우자</option>
                <option value="child">자녀</option>
                <option value="parent">부모</option>
                <option value="sibling">형제자매</option>
                <option value="friend">친구</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 24, width: '100%' }}>
            <MachimpyoButton size="lg" style={{ width: '100%' }}
              onClick={() => setStep('upload')}
              disabled={!deceasedName || !relation}>
              확인하기
            </MachimpyoButton>
          </div>
        </>
      )}

      {step === 'upload' && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#2c2416' }}>
            사망진단서를 제출해주세요
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, textAlign: 'center' }}>
            고인의 신원 확인을 위해 필요합니다. 30초면 검증됩니다.
          </p>
          <label style={{
            width: '100%', minHeight: 160, borderRadius: 14, border: '2px dashed rgba(44,36,22,.12)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: 8, color: '#7a6e5e', fontSize: 13,
            background: '#faf7f2',
          }}>
            {file ? (
              <span style={{ color: '#1e3a5f' }}>✓ {file.name}</span>
            ) : (
              <>
                <span style={{ fontSize: 28 }}>📄</span>
                <span>클릭하여 사망진단서 업로드</span>
              </>
            )}
            <input type="file" accept="image/*,application/pdf" hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, width: '100%' }}>
            <MachimpyoButton variant="secondary" onClick={() => setStep('info')}>뒤로</MachimpyoButton>
            <MachimpyoButton size="lg" style={{ flex: 1 }}
              onClick={() => setStep('done')}
              disabled={!file}>
              제출하고 정리 시작
            </MachimpyoButton>
          </div>
        </>
      )}

      {step === 'done' && (
        <>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#2e7d32',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', marginBottom: 24,
          }}>✓</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#2c2416' }}>
            접수 완료
          </h1>
          <p style={{ fontSize: 14, color: '#5a4f42', marginBottom: 24, textAlign: 'center', lineHeight: 1.8 }}>
            확인되었습니다. 고인이 마침표 가입자이실 경우<br />
            등록된 계정 정리가 자동으로 시작됩니다.<br />
            완료 시 이메일로 알려드리겠습니다.
          </p>
          <p style={{ fontSize: 12, color: '#8c8072', textAlign: 'center' }}>
            삼가 고인의 명복을 빕니다.
          </p>
        </>
      )}
    </div>
  )
}
