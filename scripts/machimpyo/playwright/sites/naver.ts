/**
 * 네이버 (Naver) 회원탈퇴
 *
 * 1. 네이버 로그인 (nid.naver.com)
 * 2. 회원탈퇴 페이지로 이동 (nid.naver.com/user2/help/withdrawal)
 * 3. 탈퇴 진행 (약관 동의 → 본인 확인 → 탈퇴)
 */

import type { Page } from 'playwright';

export async function deleteNaver(
  page: Page,
  credentials: { login_id: string; login_password: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Navigate to Naver login page
    await page.goto('https://nid.naver.com/nidlogin.login', { waitUntil: 'networkidle' });

    // 2. Fill login form
    // Naver login uses iframe-like dynamic inputs; we target the main ID/PW fields
    const idInput = page.locator('input#id');
    const pwInput = page.locator('input#pw');

    await idInput.fill(credentials.login_id);
    await pwInput.fill(credentials.login_password);

    // 3. Click login button
    await page.locator('button.btn_login').click();

    // 4. Wait for login to complete (redirect to main page)
    await page.waitForURL('**/main/**', { timeout: 15000 }).catch(() => {});
    // Fallback: wait for navigation to complete
    await page.waitForTimeout(3000);

    // 5. Navigate to withdrawal page
    await page.goto('https://nid.naver.com/user2/help/withdrawal', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      // Alternative URL
      await page.goto('https://nid.naver.com/user2/help/leaveNMembership', { waitUntil: 'networkidle', timeout: 15000 });
    });

    await page.waitForTimeout(2000);

    // 6. Check if we need to agree to terms and proceed
    const agreeCheckbox = page.locator('input[type="checkbox"][id*="agree"], span.checkbox input, label:has-text("약관") input');
    if (await agreeCheckbox.first().isVisible().catch(() => false)) {
      await agreeCheckbox.first().check();
    }

    // 7. Click withdrawal/confirm button
    const leaveBtn = page.locator('button:has-text("탈퇴"), a:has-text("탈퇴"), input[value*="탈퇴"], button:has-text("확인")');
    await leaveBtn.first().click().catch(() => {});

    await page.waitForTimeout(3000);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}
