'use server'

import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/email/client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }
  if (password.length < 6) {
    return { error: '비밀번호는 6자 이상이어야 합니다.' }
  }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/machimpyo/auth/profile`,
      data: { name: name || '' },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: '이미 가입된 이메일입니다. 로그인해주세요.' }
    }
    return { error: error.message }
  }

  // Send welcome email via Resend
  try {
    const resend = getResend()
    await resend.emails.send({
      from: '마침표 <noreply@machimpyo.kr>',
      to: email,
      subject: '마침표 가입을 환영합니다 — 이메일을 인증해주세요',
      html: `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #faf7f2; border-radius: 16px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #1e3a5f; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; margin-bottom: 24px;">。</div>
          <h1 style="font-size: 24px; font-weight: 700; color: #2c2416; margin-bottom: 8px;">마침표 가입을 환영합니다</h1>
          <p style="font-size: 14px; color: #5a4f42; line-height: 1.8; margin-bottom: 24px;">
            ${name ? `${name}님, ` : ''}가입해주셔서 감사합니다.<br/>
            아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
          </p>
          <a href="${origin}/auth/callback?next=/machimpyo/auth/profile" 
             style="display: inline-block; background: #1e3a5f; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 56px; font-size: 15px; font-weight: 600; margin-bottom: 24px;">
            이메일 인증하기
          </a>
          <p style="font-size: 12px; color: #8c8072; line-height: 1.7;">
            버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣어주세요.<br/>
            <span style="color: #7a6e5e;">${origin}/auth/callback?next=/machimpyo/auth/profile</span>
          </p>
          <hr style="border: none; border-top: 1px solid rgba(44,36,22,.08); margin: 24px 0;" />
          <p style="font-size: 11px; color: #b0a694; text-align: center;">
            본 메일은 마침표 가입을 완료한 분께 자동 발송됩니다.<br/>
            문의: help@machimpyo.kr
          </p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError)
    // Don't block signup if email fails
  }

  return { success: true, email }
}

export async function resendVerification(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: '이메일을 입력해주세요.' }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/machimpyo/auth/profile`,
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: '로그인이 필요합니다.' }
  }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  if (!name) {
    return { error: '이름을 입력해주세요.' }
  }

  const { error } = await supabase.auth.updateUser({
    data: { name, phone, onboarded: true },
  })

  if (error) return { error: error.message }

  // Also create/update the user profile in the users table
  const { error: dbError } = await supabase
    .from('legacy_users')
    .upsert({
      id: user.id,
      email: user.email,
      name,
      phone,
      status: 'active',
    }, { onConflict: 'id' })

  if (dbError) {
    console.error('Failed to save profile:', dbError)
    // Don't block on DB error for MVP
  }

  redirect('/machimpyo/auth/complete')
}

export async function checkAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    user: {
      email: user.email,
      name: user.user_metadata?.name || '',
    }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
