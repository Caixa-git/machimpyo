import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '마침표 — 당신의 디지털 삶에도 마침표를',
  description: '사람은 죽었는데 계정은 왜 살아있나요. 죽어도 남는 온라인의 나, 이메일과 법적 조치로 마침표가 깔끔하게 정리합니다. 월 2,900원.',
}

export default function MachimpyoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,600;9..40,700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="machimpyo">{children}</div>
    </>
  )
}
