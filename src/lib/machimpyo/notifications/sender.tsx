import { Resend } from 'resend'
import { render } from '@react-email/render'
import { DeathNoticeEmail } from './templates/death-notice'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendDeathNoticeParams {
  to: string
  guardianName: string
  deceasedName: string
  accounts: { name: string; icon: string; status: string }[]
  stopPermission: string
  completedAt: string
}

export async function sendDeathNoticeEmail({
  to, guardianName, deceasedName, accounts, stopPermission, completedAt
}: SendDeathNoticeParams) {
  const emailHtml = await render(
    <DeathNoticeEmail
      deceasedName={deceasedName}
      guardianName={guardianName}
      accounts={accounts}
      stopPermission={stopPermission}
      completedAt={completedAt}
    />
  )

  const { data, error } = await resend.emails.send({
    from: '마침표 <notice@machimpyo.kr>',
    to,
    subject: `${deceasedName} 님의 디지털 흔적 정리를 완료했습니다`,
    html: emailHtml,
  })

  if (error) {
    console.error('Failed to send death notice email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

export async function sendDeathNoticeSMS(phone: string, deceasedName: string) {
  // SMS API integration placeholder
  // Use a Korean SMS service (e.g. 네이버 클라우드 Simple & Easy Notification, 카카오 알림톡)
  const message = `[마침표] ${deceasedName} 님의 디지털 흔적 정리가 완료되었습니다. 자세한 내용은 이메일을 확인해주세요.`

  console.log(`SMS to ${phone}: ${message}`)
  // TODO: integrate actual SMS provider
  return { success: true, message: `SMS sent to ${phone}` }
}
