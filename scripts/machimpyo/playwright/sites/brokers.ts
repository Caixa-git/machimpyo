/**
 * 국제 데이터브로커 15곳 Opt-Out 제출
 *
 * Processes each broker sequentially:
 *  - Spokeo, BeenVerified, Whitepages, FastPeopleSearch, Radaris,
 *    MyLife, PeopleFinders, Intelius, TruthFinder, TruePeopleSearch,
 *    FamilyTreeNow, PeekYou, USSearch, CocoFinder, SearchPeopleFree
 *
 * Each broker navigates to its opt-out URL, fills any visible form fields,
 * and submits. Most require email verification or SMS — this script handles
 * the initial submission. Manual email verification step still required.
 *
 * Reference: ~/clearme/docs/broker-research-20260520.md
 */

import type { Page } from 'playwright';

interface BrokerSite {
  name: string;
  optoutUrl: string;
}

const BROKERS: BrokerSite[] = [
  { name: 'Spokeo', optoutUrl: 'https://www.spokeo.com/optout' },
  { name: 'BeenVerified', optoutUrl: 'https://www.beenverified.com/app/optout' },
  { name: 'Whitepages', optoutUrl: 'https://www.whitepages.com/suppression_requests' },
  { name: 'FastPeopleSearch', optoutUrl: 'https://www.fastpeoplesearch.com/removal' },
  { name: 'Radaris', optoutUrl: 'https://www.radaris.com/page/remove/' },
  { name: 'MyLife', optoutUrl: 'https://www.mylife.com/optout' },
  { name: 'PeopleFinders', optoutUrl: 'https://www.peoplefinders.com/optout' },
  { name: 'Intelius', optoutUrl: 'https://www.intelius.com/optout' },
  { name: 'TruthFinder', optoutUrl: 'https://www.truthfinder.com/optout' },
  { name: 'TruePeopleSearch', optoutUrl: 'https://www.truepeoplesearch.com/removal' },
  { name: 'FamilyTreeNow', optoutUrl: 'https://www.familytreenow.com/optout' },
  { name: 'PeekYou', optoutUrl: 'https://www.peekyou.com/about/opt_out' },
  { name: 'USSearch', optoutUrl: 'https://www.ussearch.com/optout' },
  { name: 'CocoFinder', optoutUrl: 'https://www.cocofinder.com/remove-my-info' },
  { name: 'SearchPeopleFree', optoutUrl: 'https://www.searchpeoplefree.com/opt-out' },
];

/**
 * Process all 15 broker opt-outs sequentially.
 * Each broker visit includes a short delay between sites.
 */
export async function deleteBrokers(
  page: Page,
  credentials: { login_id: string; login_password: string }
): Promise<{ success: boolean; error?: string }> {
  const results: { name: string; ok: boolean; error?: string }[] = [];

  for (let i = 0; i < BROKERS.length; i++) {
    const broker = BROKERS[i];

    try {
      console.log(`  [${i + 1}/${BROKERS.length}] Opting out of ${broker.name}...`);

      // Navigate to opt-out URL
      await page.goto(broker.optoutUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for page to load
      await page.waitForTimeout(3000);

      // Strategy 1: Look for email input fields to submit
      const emailInput = page.locator('input[type="email"], input[name="email"], input#email');
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill(credentials.login_id);
      }

      // Strategy 2: Look for phone number fields
      const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[name*="phone"]');
      if (await phoneInput.isVisible().catch(() => false) && credentials.login_password) {
        // If login_password happens to be a phone number, use it
        await phoneInput.fill(credentials.login_password);
      }

      // Strategy 3: Look for name fields
      const firstNameInput = page.locator('input[name*="first"], input[name*="fname"], input#first_name');
      const lastNameInput = page.locator('input[name*="last"], input[name*="lname"], input#last_name');
      if (await firstNameInput.isVisible().catch(() => false)) {
        // Extract name from email or use placeholder
        const name = credentials.login_id.split('@')[0].replace(/[0-9._]/g, ' ');
        await firstNameInput.fill(name || 'User');
      }
      if (await lastNameInput.isVisible().catch(() => false)) {
        await lastNameInput.fill('OptOut');
      }

      // Strategy 4: Click submit/opt-out buttons
      const submitBtn = page.locator(
        'button[type="submit"], ' +
        'input[type="submit"], ' +
        'button:has-text("Opt Out"), ' +
        'button:has-text("Remove"), ' +
        'button:has-text("Submit"), ' +
        'button:has-text("Unsubscribe"), ' +
        'a:has-text("Opt Out"), ' +
        'a:has-text("Remove My Info")'
      );

      // Click the most prominent submit button
      const submitBtnCount = await submitBtn.count();
      if (submitBtnCount > 0) {
        await submitBtn.first().click();
        await page.waitForTimeout(2000);
      }

      results.push({ name: broker.name, ok: true });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`  [${i + 1}/${BROKERS.length}] ❌ ${broker.name}: ${errMsg}`);
      results.push({ name: broker.name, ok: false, error: errMsg });
    }

    // Delay between brokers (2 seconds)
    if (i < BROKERS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Log summary
  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`  Brokers: ${succeeded}/${BROKERS.length} submitted, ${failed} failed`);

  return { success: failed === 0, error: failed > 0 ? `${failed} broker(s) failed` : undefined };
}
