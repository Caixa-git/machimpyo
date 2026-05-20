/**
 * 카카오 (Kakao) 카카오계정 삭제
 *
 * 1. 카카오 로그인 (accounts.kakao.com)
 * 2. 계정 삭제 페이지로 이동
 * 3. 탈퇴 진행
 */

import type { Page } from 'playwright';

export async function deleteKakao(
  page: Page,
  credentials: { login_id: string; login_password: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Navigate to Kakao login
    await page.goto('https://accounts.kakao.com/login', { waitUntil: 'networkidle' });

    // 2. Fill login form
    const emailInput = page.locator('input[name="loginId"], input#loginId, input[name="email"]');
    const pwInput = page.locator('input[name="password"], input#password');

    await emailInput.fill(credentials.login_id);
    await pwInput.fill(credentials.login_password);

    // 3. Click login button
    await page.locator('button[type="submit"], button:has-text("로그인")').click();

    // 4. Wait for login to complete
    await page.waitForTimeout(4000);

    // 5. Navigate to account deletion page
    await page.goto('https://accounts.kakao.com/delete_account', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      // Alternative: go via settings
      await page.goto('https://accounts.kakao.com/webrct/account/delete', { waitUntil: 'networkidle', timeout: 15000 });
    });

    await page.waitForTimeout(3000);

    // 6. Click withdrawal confirmation
    const deleteBtn = page.locator('button:has-text("삭제"), button:has-text("탈퇴"), button:has-text("확인"), a:has-text("계정 삭제")');
    await deleteBtn.first().click().catch(() => {});

    // 7. Handle password re-entry if needed
    const rePwInput = page.locator('input[name="password"], input#password').first();
    if (await rePwInput.isVisible().catch(() => false)) {
      await rePwInput.fill(credentials.login_password);
      const confirmBtn = page.locator('button[type="submit"], button:has-text("확인"), button:has-text("삭제")').first();
      await confirmBtn.click().catch(() => {});
    }

    await page.waitForTimeout(3000);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}
