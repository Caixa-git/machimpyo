"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { scanRequestSchema, type ScanRequestValues } from "@/lib/validations/scan"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type FormState = "idle" | "loading" | "success" | "error"

export function ScanRequestForm() {
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScanRequestValues>({
    resolver: zodResolver(scanRequestSchema),
  })

  const onSubmit = async (data: ScanRequestValues) => {
    setFormState("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setErrorMessage(result.error ?? "요청 처리에 실패했습니다")
        setFormState("error")
        return
      }

      setFormState("success")
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다")
      setFormState("error")
    }
  }

  if (formState === "success") {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="py-8 text-center">
          <p className="text-lg font-medium">
            스캔이 요청되었습니다. 24시간 이내 결과를 이메일로 발송합니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>개인정보 스캔 요청</CardTitle>
        <CardDescription>
          정보를 입력하면 24시간 이내에 스캔 결과를 이메일로 발송해드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">이름</Label>
            <Input id="name" placeholder="홍길동" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">휴대전화</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01012345678"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {formState === "error" && errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <Button type="submit" disabled={formState === "loading"} className="mt-2 w-full">
            {formState === "loading" ? "요청 중…" : "스캔 요청하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
