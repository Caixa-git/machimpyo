'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    
    if (res.ok) {
      setStatus('success')
      setMessage(data.message)
      setEmail('')
    } else {
      setStatus('error')
      setMessage(data.error)
    }
  }

  if (status === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-lg">✅ {message}</p>
          <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
            다른 이메일 등록하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>대기자 등록</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="waitlist-email">이메일</Label>
            <Input
              id="waitlist-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
              required
              disabled={status === 'loading'}
            />
          </div>
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? '등록 중...' : '대기자 등록'}
          </Button>
          {status === 'error' && <p className="text-red-600 text-sm">{message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
