import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const STORYBOOK_PORT = 6107;
const STORYBOOK_URL = `http://127.0.0.1:${STORYBOOK_PORT}`;
const STORYBOOK_HEALTHCHECK_URL = `${STORYBOOK_URL}/iframe.html`;
const STORYBOOK_START_TIMEOUT_MS = 120_000;
const STORYBOOK_POLL_INTERVAL_MS = 1_000;
const DOCS_DIR = fileURLToPath(new URL('..', import.meta.url));

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isStorybookRunning = async () => {
  try {
    const response = await fetch(STORYBOOK_HEALTHCHECK_URL);
    return response.ok;
  } catch {
    return false;
  }
};

const waitForStorybook = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < STORYBOOK_START_TIMEOUT_MS) {
    if (await isStorybookRunning()) {
      return;
    }

    await delay(STORYBOOK_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for Storybook at ${STORYBOOK_HEALTHCHECK_URL}.`);
};

export default async function globalSetup() {
  if (await isStorybookRunning()) {
    return;
  }

  const storybookProcess: ChildProcess = spawn(
    'pnpm',
    ['exec', 'storybook', 'dev', '-p', String(STORYBOOK_PORT), '--ci'],
    {
      cwd: DOCS_DIR,
      env: {
        ...process.env,
        CI: '1',
      },
      stdio: 'inherit',
    }
  );

  try {
    await waitForStorybook();
  } catch (error) {
    storybookProcess.kill('SIGTERM');
    throw error;
  }

  return async () => {
    if (!storybookProcess.killed) {
      storybookProcess.kill('SIGTERM');
    }
  };
}
