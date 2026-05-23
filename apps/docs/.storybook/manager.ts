import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import '@dds/emerald-tokens/styles';
import './manager.css';

const THEME_STORAGE_KEY = 'dds-storybook-theme';
const THEME_ATTRIBUTE = 'data-theme';
const GLOBALS_UPDATED_EVENT = 'globalsUpdated';
const SET_GLOBALS_EVENT = 'setGlobals';
const CREATE_STORY_LABEL = 'Create a new story';
const DEFAULT_EMPTY_STATE_TITLE = 'No components found';
const DEFAULT_EMPTY_STATE_BODY = 'Find components by name or path.';
const SEARCH_EMPTY_STATE_TITLE = 'No search results';
const SEARCH_EMPTY_STATE_BODY = 'Try a different component name or story path.';
const SEARCH_FIELD_ID = 'storybook-explorer-searchfield';
const SEARCH_INPUT_SELECTOR = [
  `#${SEARCH_FIELD_ID}`,
  'input[type="search"]',
  '[role="searchbox"]',
  '[data-testid="sidebar-search-input"]',
].join(', ');

const managerTheme = create({
  base: 'light',
  appBorderRadius: 0,
  brandImage: null,
  brandTitle: 'Emerald Design System',
  fontBase: 'var(--dds-font-sans)',
  fontCode: 'var(--dds-font-mono)',
  inputBorderRadius: 0,
});

const getStoredTheme = (): 'light' | 'dark' | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
};

const resolveTheme = (theme: unknown): 'light' | 'dark' => {
  if (theme === 'dark' || theme === 'light') {
    return theme;
  }

  return getStoredTheme() ?? 'light';
};

const syncManagerTheme = (theme?: unknown) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const resolvedTheme = resolveTheme(theme);

  document.documentElement.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
  document.body?.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
  window.localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
};

const syncSidebarSearchUi = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const searchInput = document.querySelector<HTMLElement>(SEARCH_INPUT_SELECTOR);
  const searchRow =
    searchInput?.closest<HTMLElement>('.search-field') ??
    searchInput?.closest<HTMLElement>('[role="search"]') ??
    searchInput?.closest<HTMLElement>('form') ??
    searchInput?.closest<HTMLElement>('[class]');

  if (searchRow) {
    searchRow.setAttribute('data-dds-search-row', 'true');
  }

  const searchIcon = searchRow?.querySelector<SVGElement>('svg');

  if (searchIcon) {
    searchIcon.setAttribute('data-dds-search-icon', 'true');
  }

  const shortcutBadge = searchRow?.querySelector<HTMLElement>('code');

  if (shortcutBadge) {
    shortcutBadge.setAttribute('data-dds-search-shortcut', 'true');
  }

  const commandGlyph = Array.from(shortcutBadge?.querySelectorAll<HTMLElement>('span') ?? []).find(
    (element) => element.textContent?.includes('⌘')
  );

  if (commandGlyph) {
    commandGlyph.setAttribute('data-dds-search-shortcut-glyph', 'true');
  }

  const createStoryButton = document.querySelector<HTMLElement>(
    `[aria-label="${CREATE_STORY_LABEL}"]`
  );

  if (createStoryButton) {
    createStoryButton.hidden = true;
    createStoryButton.setAttribute('aria-hidden', 'true');
    createStoryButton.style.display = 'none';
  }

  const emptyStateTitle = Array.from(document.querySelectorAll('strong')).find(
    (element) => element.textContent?.trim() === DEFAULT_EMPTY_STATE_TITLE
  );
  const emptyStateBody = emptyStateTitle?.parentElement?.querySelector('small');

  if (emptyStateTitle && emptyStateBody?.textContent?.trim() === DEFAULT_EMPTY_STATE_BODY) {
    emptyStateTitle.textContent = SEARCH_EMPTY_STATE_TITLE;
    emptyStateBody.textContent = SEARCH_EMPTY_STATE_BODY;
    emptyStateTitle.parentElement?.setAttribute('data-dds-search-empty-state', 'true');
  }
};

const observeSidebarSearchUi = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const startObserving = () => {
    syncSidebarSearchUi();

    if (!document.body) {
      return;
    }

    const observer = new MutationObserver(() => {
      syncSidebarSearchUi();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  if (document.body) {
    startObserving();
    return;
  }

  document.addEventListener('DOMContentLoaded', startObserving, { once: true });
};

syncManagerTheme();
observeSidebarSearchUi();

addons.register('dds/storybook-manager-theme', () => {
  const channel = addons.getChannel();

  channel.on(GLOBALS_UPDATED_EVENT, (payload?: Record<string, unknown>) => {
    const globals =
      payload && typeof payload === 'object' && 'globals' in payload
        ? (payload.globals as Record<string, unknown> | undefined)
        : undefined;
    const userGlobals =
      payload && typeof payload === 'object' && 'userGlobals' in payload
        ? (payload.userGlobals as Record<string, unknown> | undefined)
        : undefined;
    const initialGlobals =
      payload && typeof payload === 'object' && 'initialGlobals' in payload
        ? (payload.initialGlobals as Record<string, unknown> | undefined)
        : undefined;

    syncManagerTheme(globals?.theme ?? userGlobals?.theme ?? initialGlobals?.theme);
  });

  channel.on(SET_GLOBALS_EVENT, (payload?: Record<string, unknown>) => {
    const globals =
      payload && typeof payload === 'object' && 'globals' in payload
        ? (payload.globals as Record<string, unknown> | undefined)
        : undefined;

    syncManagerTheme(globals?.theme);
  });
});

addons.setConfig({
  theme: managerTheme,
});
