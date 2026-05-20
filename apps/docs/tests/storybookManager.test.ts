import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser, type BrowserContext } from 'playwright';

const STORYBOOK_URL = 'http://127.0.0.1:6107';
const MANAGER_URL = `${STORYBOOK_URL}/?path=/docs/introduction--docs`;
const THEME_STORAGE_KEY = 'dds-storybook-theme';
const SEARCH_FIELD_ID = 'storybook-explorer-searchfield';
const SEARCH_EMPTY_STATE_TITLE = 'No search results';
const SEARCH_EMPTY_STATE_BODY = 'Try a different component name or story path.';

let browser: Browser;

const openManager = async (theme: 'light' | 'dark') => {
  const context = await browser.newContext();

  await context.addInitScript(
    ({ storageKey, storageTheme }) => {
      window.localStorage.setItem(storageKey, storageTheme);
    },
    {
      storageKey: THEME_STORAGE_KEY,
      storageTheme: theme,
    }
  );

  const page = await context.newPage();
  await page.goto(MANAGER_URL, { waitUntil: 'domcontentloaded' });
  await page.locator(`#${SEARCH_FIELD_ID}`).waitFor({ state: 'visible' });

  return { context, page };
};

const closeManager = async (context: BrowserContext) => {
  await context.close();
};

describe('Storybook manager smoke tests', () => {
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  it.each(['light', 'dark'] as const)(
    'syncs the %s theme onto the manager document and localStorage',
    async (theme) => {
      const { context, page } = await openManager(theme);

      try {
        await expect(page.locator('html').getAttribute('data-theme')).resolves.toBe(theme);

        const storedTheme = await page.evaluate((storageKey) => {
          return window.localStorage.getItem(storageKey);
        }, THEME_STORAGE_KEY);

        expect(storedTheme).toBe(theme);
      } finally {
        await closeManager(context);
      }
    }
  );

  it('adds DDS search hooks and hides create-story affordances without throwing', async () => {
    const { context, page } = await openManager('light');

    try {
      const searchRow = page.locator('[data-dds-search-row="true"]').first();
      expect(await searchRow.isVisible()).toBe(true);

      const searchIcon = searchRow.locator('[data-dds-search-icon="true"]').first();
      if ((await searchIcon.count()) > 0) {
        expect(await searchIcon.isVisible()).toBe(true);
      }

      const shortcutBadge = searchRow.locator('[data-dds-search-shortcut="true"]').first();
      if ((await shortcutBadge.count()) > 0) {
        expect(await shortcutBadge.isVisible()).toBe(true);
      }

      const shortcutGlyph = searchRow.locator('[data-dds-search-shortcut-glyph="true"]').first();
      if ((await shortcutGlyph.count()) > 0) {
        expect(await shortcutGlyph.isVisible()).toBe(true);
      }

      const createStoryButton = page.locator('[aria-label="Create a new story"]').first();
      if ((await createStoryButton.count()) > 0) {
        expect(await createStoryButton.isVisible()).toBe(false);
      }
    } finally {
      await closeManager(context);
    }
  });

  it('rewrites the empty search state copy when Storybook shows the default message', async () => {
    const { context, page } = await openManager('light');

    try {
      await page.locator(`#${SEARCH_FIELD_ID}`).fill('dds-unmatched-manager-search');

      const emptyState = page.locator('[data-dds-search-empty-state="true"]').first();
      expect(await emptyState.isVisible()).toBe(true);
      await expect(emptyState.textContent()).resolves.toContain(SEARCH_EMPTY_STATE_TITLE);
      await expect(emptyState.textContent()).resolves.toContain(SEARCH_EMPTY_STATE_BODY);
    } finally {
      await closeManager(context);
    }
  });
});
