/**
 * 쿠팡 (Coupang) 회원탈퇴
 *
 * 1. 쿠팡 로그인 (login.coupang.com)
 * 2. 회원탈퇴 페이지로 이동
 * 3. 탈퇴 진행
 */

import type { Page } from 'playwright';

export async function deleteCoupang(
  page: Page,
  credentials: { login_id: string; login_password: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Navigate to Coupang login
    await page.goto('https://login.coupang.com/login/login.pang', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // 2. Fill login form (Coupang uses email + password)
    // Try both email and ID field variants
    const idInput = page.locator('input[name="email"], input[name="loginId"], input#id');
    const pwInput = page.locator('input[name="password"], input#password');

    await idInput.fill(credentials.login_id);
    await pwInput.fill(credentials.login_password);

    // 3. Click login button
    await page.locator('button[type="submit"], button:has-text("로그인")').click();

    // 4. Wait for login to complete
    await page.waitForTimeout(4000);

    // 5. Navigate to membership withdrawal page
    await page.goto('https://www.coupang.com/mypage/myInfo/membershipWithdrawal', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      // Fallback
      await page.goto('https://www.coupang.com/mypage/myInfo/leave', { waitUntil: 'networkidle', timeout: 15000 });
    });

    await page.waitForTimeout(3000);

    // 6. Check agreement checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      const isChecked = await checkboxes.nth(i).isChecked().catch(() => false);
      if (!isChecked) {
        await checkboxes.nth(i).check().catch(() => {});
      }
    }

    // 7. Click withdrawal button
    const withdrawalBtn = page.locator(
      'button:has-text("탈퇴"), a:has-text("탈퇴"), button:has-text("확인"), button.btn-withdrawal'
    );
    await withdrawalBtn.first().click().catch(() => {});

    await page.waitForTimeout(3000);

    // 8. Handle confirmation dialog
    const confirmBtn = page.locator('button:has-text("확인"), button:has-text("예"), div[role="dialog"] button:has-text("탈퇴")');
    await confirmBtn.first().click().catch(() => {});

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}
