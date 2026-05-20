/**
 * 구글 (Google) 계정 삭제
 *
 * 1. 구글 로그인 (accounts.google.com)
 * 2. 계정 삭제 페이지로 이동 (myaccount.google.com/deleteaccount)
 * 3. 삭제 진행 (비밀번호 재입력 → 동의 체크 → 삭제)
 *
 * Reference: https://myaccount.google.com/deleteaccount
 */

import type { Page } from 'playwright';

export async function deleteGoogle(
  page: Page,
  credentials: { login_id: string; login_password: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Navigate to Google sign-in
    await page.goto('https://accounts.google.com/ServiceLogin', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // 2. Enter email
    const emailInput = page.locator('input[type="email"], input[name="identifier"]');
    await emailInput.fill(credentials.login_id);

    await page.locator('button:has-text("Next"), button:has-text("다음"), #identifierNext').click();

    await page.waitForTimeout(3000);

    // 3. Enter password
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await passwordInput.fill(credentials.login_password);

    await page.locator('button:has-text("Next"), button:has-text("다음"), #passwordNext').click();

    // 4. Wait for login to complete
    await page.waitForTimeout(5000);

    // 5. Navigate to account deletion page
    await page.goto('https://myaccount.google.com/deleteaccount', { waitUntil: 'networkidle', timeout: 20000 });

    await page.waitForTimeout(3000);

    // 6. Look for and click delete account buttons
    // Google's delete page may require scrolling to find the button
    const deleteAccountBtn = page.locator(
      'a:has-text("Delete"), a:has-text("삭제"), button:has-text("Delete"), button:has-text("삭제"), ' +
      'a[href*="delete"], div[role="button"]:has-text("Delete")'
    );
    await deleteAccountBtn.first().click().catch(() => {});

    await page.waitForTimeout(3000);

    // 7. Re-enter password if prompted
    const rePwInput = page.locator('input[type="password"]').first();
    if (await rePwInput.isVisible().catch(() => false)) {
      await rePwInput.fill(credentials.login_password);
      await page.locator('button:has-text("Next"), button:has-text("다음")').first().click().catch(() => {});
      await page.waitForTimeout(3000);
    }

    // 8. Check agreement checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      const isChecked = await checkboxes.nth(i).isChecked().catch(() => false);
      if (!isChecked) {
        await checkboxes.nth(i).check().catch(() => {});
      }
    }

    // 9. Final delete confirmation
    const finalDeleteBtn = page.locator('button:has-text("Delete"), button:has-text("삭제"), div[role="button"]:has-text("Delete")').last();
    await finalDeleteBtn.click().catch(() => {});

    await page.waitForTimeout(3000);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}
