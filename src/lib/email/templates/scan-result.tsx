import { Html, Body, Container, Text, Heading, Hr, Button } from '@react-email/components'

interface ScanResultEmailProps {
  name: string
  totalFound: number
  previewItems: { broker: string; dataFound: string }[]
  scanId: string
}

export function ScanResultEmail({ name, totalFound, previewItems, scanId }: ScanResultEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return (
    <Html>
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '32px', borderRadius: '8px' }}>
          <Heading style={{ color: '#111827' }}>클리어미 스캔 결과</Heading>
          <Text style={{ color: '#374151' }}>{name}님, 개인정보 노출 스캔이 완료되었습니다.</Text>
          
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            총 {totalFound}곳에서 발견됨
          </Text>
          
          <Hr />
          
          <Heading as="h3" style={{ color: '#111827' }}>미리보기 ({previewItems.length}건)</Heading>
          {previewItems.map((item, i) => (
            <Container key={i} style={{ padding: '12px', margin: '8px 0', borderLeft: '4px solid #3b82f6', backgroundColor: '#eff6ff' }}>
              <Text style={{ margin: 0, color: '#1e40af' }}><strong>{item.broker}</strong></Text>
              <Text style={{ margin: '4px 0 0', color: '#374151' }}>{item.dataFound}</Text>
            </Container>
          ))}
          
          <Hr />
          
          <Text style={{ color: '#6b7280' }}>
            나머지 {totalFound - previewItems.length}건의 결과는 결제 후 확인 가능합니다.
          </Text>
          
          <Button
            href={`${baseUrl}/dashboard?scan=${scanId}`}
            style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}
          >
            지금 삭제 시작하기
          </Button>
          
          <Hr />
          <Text style={{ color: '#9ca3af', fontSize: '12px' }}>
            클리어미 — 개인정보 노출 삭제 서비스
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
