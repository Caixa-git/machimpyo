import { z } from "zod"

export const scanRequestSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일을 입력해주세요"),
  phone: z
    .string()
    .regex(/^01[0-9]{8,9}$/, "유효한 휴대전화 번호를 입력해주세요 (예: 01012345678)"),
})

export type ScanRequestValues = z.infer<typeof scanRequestSchema>
