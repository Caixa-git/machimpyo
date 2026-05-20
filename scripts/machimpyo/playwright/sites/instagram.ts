/**
 * 인스타그램 (Instagram) 계정 삭제
 *
 * 1. 인스타그램 로그인 (instagram.com)
 * 2. 계정 삭제 페이지로 이동
 * 3. 삭제 사유 선택 → 계정 삭제
 *
 * Reference: https://www.instagram.com/accounts/remove/request/permanent/
 */

import type { Page } from 'playwright';

export async function deleteInstagram(
  page: Page,
  credentials: { login_id: string; login_password: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Navigate to Instagram login
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // 2. Fill login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await usernameInput.fill(credentials.login_id);
    await passwordInput.fill(credentials.login_password);

    // 3. Click login button
    await page.locator('button[type="submit"]').click();

    // 4. Wait for login and dismiss any "Save Info" dialogs
    await page.waitForTimeout(5000);

    // Dismiss "Save Your Login Info?" popup if it appears
    const notNowBtn = page.locator('button:has-text("Not Now"), button:has-text("Save Info"), div[role="button"]:has-text("Not Now")');
    await notNowBtn.first().click().catch(() => {});

    await page.waitForTimeout(2000);

    // 5. Navigate to account deletion page
    await page.goto('https://www.instagram.com/accounts/remove/request/permanent/', { waitUntil: 'networkidle', timeout: 20000 });

    await page.waitForTimeout(3000);

    // 6. Select deletion reason dropdown
    const reasonSelect = page.locator('select');
    if (await reasonSelect.isVisible().catch(() => false)) {
      // Select the last option (usually "Something else" or "I want to delete my account")
      await reasonSelect.selectOption({ index: -1 });
    }

    // 7. Enter password for confirmation
    const confirmPwInput = page.locator('input[name="password"]');
    if (await confirmPwInput.isVisible().catch(() => false)) {
      await confirmPwInput.fill(credentials.login_password);
    }

    // 8. Click "Permanently delete my account" button
    const deleteBtn = page.locator('button:has-text("delete"), button:has-text("Delete"), button[type="submit"]');
    await deleteBtn.first().click().catch(() => {});

    await page.waitForTimeout(3000);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}
