import { test, expect, devices } from '@playwright/test';

const MOBILE_VIEWPORT = devices['iPhone 12'];
const TIMEOUT = 10000;
const MIN_TOUCH_TARGET = 44; // WCAG 2.2 minimum touch target size

// Pages to test
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

      const contentType = response.headers()['content-type'] || '';
      if (!contentType.includes('text/html')) continue;
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

test.describe('Interaction', () => {
  test('touch targets meet minimum size on mobile', async ({ page, baseURL }) => {
    await page.setViewportSize({
      width: MOBILE_VIEWPORT.viewport.width,
      height: MOBILE_VIEWPORT.viewport.height,
    });

    const allPages = await getAllPages(page, baseURL!);
    const violations: { url: string; elements: { selector: string; width: number; height: number }[] }[] = [];

    for (const path of allPages) {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'load' });

      // Check interactive elements for minimum touch target size
      const smallTargets = await page.evaluate((minSize: number) => {
        const small: { selector: string; width: number; height: number }[] = [];

        // Only check standalone interactive elements, not inline text links
        // WCAG 2.2 Success Criterion 2.5.8 allows exceptions for inline links
        const standaloneSelectors = [
          'button',
          'input',
          'select',
          'textarea',
          '[role="button"]',
          '.nav-menu a',      // Navigation links should be touch-friendly
          '.chapter-nav a',   // Chapter navigation links
        ];

        for (const selector of standaloneSelectors) {
          document.querySelectorAll(selector).forEach(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            // Skip hidden elements
            if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0) {
              return;
            }

            // Check if either dimension is too small
            if (rect.width < minSize || rect.height < minSize) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className ? `.${el.className.toString().split(' ')[0]}` : '';
              const text = el.textContent?.trim().substring(0, 20) || '';
              small.push({
                selector: `${tag}${cls}${text ? ` "${text}"` : ''}`,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              });
            }
          });
        }

        return small;
      }, MIN_TOUCH_TARGET);

      if (smallTargets.length > 0) {
        violations.push({ url: path, elements: smallTargets });
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map(v => {
          const elements = v.elements
            .map(e => `    ${e.selector} (${e.width}x${e.height}px)`)
            .join('\n');
          return `  ${v.url}\n${elements}`;
        })
        .join('\n');

      // Use soft assertion - this is a warning, not a hard failure
      expect.soft(violations, `Touch targets smaller than ${MIN_TOUCH_TARGET}px:\n${report}`).toHaveLength(0);
    }

    console.log(`Checked ${allPages.length} pages for touch target sizes`);
  });

  test('focus indicators are visible', async ({ page, baseURL }) => {
    // Test focus on homepage only - spot check
    await page.goto(`${baseURL}/`, { waitUntil: 'load' });

    // Check that key navigation links have visible focus indicators
    const navLinks = page.locator('.nav-menu a');
    const count = await navLinks.count();

    let missingFocus = 0;
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);

      // Skip if not visible
      if (!await link.isVisible()) continue;

      // Focus and check outline
      await link.focus();

      // Give browser time to apply focus styles
      const outlineStyle = await link.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
        };
      });

      const hasOutline = outlineStyle.outlineStyle !== 'none' &&
                         outlineStyle.outlineWidth !== '0px' &&
                         outlineStyle.outlineColor !== 'transparent';

      if (!hasOutline) {
        missingFocus++;
      }
    }

    expect(missingFocus, `${missingFocus} navigation links missing focus indicators`).toBe(0);
    console.log(`Checked homepage for focus indicators`);
  });

  test('keyboard navigation works', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`, { waitUntil: 'load' });

    // Tab through the page and ensure focus moves
    const focusedElements: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const tag = el.tagName.toLowerCase();
        const href = el.getAttribute('href') || '';
        return `${tag}${href ? `[href="${href.substring(0, 30)}"]` : ''}`;
      });

      if (focused) {
        focusedElements.push(focused);
      }
    }

    expect(focusedElements.length, 'Should be able to tab through interactive elements').toBeGreaterThan(0);
    console.log(`Tabbed through ${focusedElements.length} elements: ${focusedElements.slice(0, 5).join(', ')}...`);
  });
});
