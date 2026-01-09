import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TIMEOUT = 10000;

// Skip these paths (non-HTML content)
const SKIP_PATHS = [
  '/index.xml',
  '/sitemap.xml',
  '/robots.txt',
];

// Collect all internal pages by crawling
async function getAllPages(page: any, baseURL: string): Promise<string[]> {
  const visited = new Set<string>();
  const toVisit = ['/'];

  while (toVisit.length > 0) {
    const path = toVisit.shift()!;
    if (visited.has(path)) continue;
    visited.add(path);

    try {
      const response = await page.goto(`${baseURL}${path}`, { timeout: TIMEOUT });
      if (!response || response.status() !== 200) continue;
    } catch {
      continue;
    }

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter((href): href is string => href !== null);
    });

    for (const href of links) {
      if (href.startsWith('/') && !href.startsWith('//')) {
        const cleanPath = href.split('#')[0];
        if (!visited.has(cleanPath) && !toVisit.includes(cleanPath)) {
          toVisit.push(cleanPath);
        }
      }
    }
  }

  return Array.from(visited);
}

test.describe('Accessibility (WCAG 2.2)', () => {
  test('all pages pass WCAG 2.2 AA', async ({ page, baseURL }) => {
    const allPages = await getAllPages(page, baseURL!);
    const pages = allPages.filter(p => !SKIP_PATHS.some(skip => p.endsWith(skip)));
    console.log(`Testing ${pages.length} pages for accessibility (skipped ${allPages.length - pages.length} non-HTML)`);

    const violations: { url: string; issues: any[] }[] = [];

    for (const path of pages) {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'load' });

      const results = await new AxeBuilder({ page })
        .options({
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
          rules: {
            'target-size': { enabled: true },
          },
        })
        .analyze();

      if (results.violations.length > 0) {
        violations.push({ url: path, issues: results.violations });
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map(v => {
          const issues = v.issues
            .map(i => `    [${i.id}] ${i.help} (${i.impact}) - ${i.nodes.length} element(s)`)
            .join('\n');
          return `  ${v.url}\n${issues}`;
        })
        .join('\n\n');

      expect(violations, `Accessibility violations:\n${report}`).toHaveLength(0);
    }

    console.log(`All ${pages.length} pages passed WCAG 2.2 AA`);
  });
});
