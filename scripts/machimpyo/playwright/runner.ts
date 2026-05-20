/**
 * 마침표(Fin.) — Playwright Automation Runner
 *
 * Main orchestrator for service deletion scripts.
 * Takes an array of credentials, routes to the appropriate site script,
 * logs results, and returns a summary.
 *
 * Usage:
 *   import { run } from './runner';
 *   const summary = await run([
 *     { service_name: 'naver', login_id: '...', login_password: '...' },
 *     { service_name: 'google', login_id: '...', login_password: '...' },
 *   ]);
 */

import { Page, chromium } from 'playwright';
import { deleteNaver } from './sites/naver';
import { deleteKakao } from './sites/kakao';
import { deleteInstagram } from './sites/instagram';
import { deleteCoupang } from './sites/coupang';
import { deleteGoogle } from './sites/google';
import { deleteBrokers } from './sites/brokers';

interface Credentials {
  service_name: string;
  login_id: string;
  login_password: string;
}

interface SiteResult {
  service_name: string;
  status: 'success' | 'failed';
  error?: string;
}

interface RunSummary {
  total: number;
  success: number;
  failed: number;
}

const SITE_REGISTRY: Record<string, (page: Page, creds: Credentials) => Promise<{ success: boolean; error?: string }>> = {
  naver: deleteNaver,
  kakao: deleteKakao,
  instagram: deleteInstagram,
  coupang: deleteCoupang,
  google: deleteGoogle,
  brokers: deleteBrokers,
};

/**
 * Run deletion scripts for the given list of services.
 * Processes services one at a time with a 5-second delay between sites.
 */
export async function run(credentialsList: Credentials[]): Promise<RunSummary> {
  const results: SiteResult[] = [];
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
    });

    for (let i = 0; i < credentialsList.length; i++) {
      const creds = credentialsList[i];
      const page = await context.newPage();

      try {
        const handler = SITE_REGISTRY[creds.service_name];

        if (!handler) {
          const msg = `Unknown service: ${creds.service_name}`;
          console.error(JSON.stringify({ service_name: creds.service_name, status: 'failed', error: msg }));
          results.push({ service_name: creds.service_name, status: 'failed', error: msg });
          continue;
        }

        console.log(`[${i + 1}/${credentialsList.length}] Processing: ${creds.service_name}`);

        const result = await handler(page, creds);

        if (result.success) {
          console.log(JSON.stringify({ service_name: creds.service_name, status: 'success' }));
          results.push({ service_name: creds.service_name, status: 'success' });
        } else {
          console.error(JSON.stringify({ service_name: creds.service_name, status: 'failed', error: result.error }));
          results.push({ service_name: creds.service_name, status: 'failed', error: result.error });
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error(JSON.stringify({ service_name: creds.service_name, status: 'failed', error: msg }));
        results.push({ service_name: creds.service_name, status: 'failed', error: msg });
      } finally {
        await page.close();
      }

      // 5-second delay between sites to avoid rate limiting
      if (i < credentialsList.length - 1) {
        console.log(`Waiting 5 seconds before next service...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }

  const summary: RunSummary = {
    total: results.length,
    success: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
  };

  console.log(`\n=== Summary: ${summary.success}/${summary.total} succeeded, ${summary.failed} failed ===`);
  return summary;
}
