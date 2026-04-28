import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Tooltip, TooltipProvider, type TooltipProps } from './Tooltip';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(() => {
  cleanup();
});

const renderTooltip = (props: Partial<TooltipProps> = {}) => {
  const view = render(
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip content="Tooltip content" {...props}>
        <button type="button">Trigger</button>
      </Tooltip>
    </TooltipProvider>
  );

  return {
    ...view,
    trigger: screen.getByRole('button', { name: 'Trigger' }),
  };
};

const getTooltipPanel = () =>
  document.body.querySelector(
    '[data-radix-popper-content-wrapper] > div[data-side]'
  ) as HTMLDivElement | null;

const waitForTooltipPanel = async () => {
  await waitFor(() => {
    expect(getTooltipPanel()).toBeInTheDocument();
  });

  return getTooltipPanel() as HTMLDivElement;
};

describe('Tooltip', () => {
  describe('Rendering', () => {
    it('renders children as the trigger', () => {
      const { trigger } = renderTooltip();

      expect(trigger).toBeInTheDocument();
    });

    it('does not render tooltip content until hovered or focused', () => {
      renderTooltip();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });

    it('forwards className to the content panel', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ className: 'custom-tooltip' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveClass('custom-tooltip');
    });

    it('renders the arrow inside the tooltip content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);

      const panel = await waitForTooltipPanel();
      expect(panel.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Content visibility', () => {
    it('tooltip content appears on hover', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);

      expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip content');
    });

    it('tooltip content appears on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <button type="button">Before</button>
          <Tooltip content="Tooltip content">
            <button type="button">Trigger</button>
          </Tooltip>
        </TooltipProvider>
      );

      await user.tab();
      await user.tab();

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      expect(trigger).toHaveFocus();
      expect(await waitForTooltipPanel()).toHaveTextContent('Tooltip content');
    });

    it('tooltip content disappears on mouse leave', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();

      await user.unhover(trigger);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('tooltip content disappears on blur', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip content="Tooltip content">
            <button type="button">Trigger</button>
          </Tooltip>
          <button type="button">Next field</button>
        </TooltipProvider>
      );

      await user.tab();
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();

      await user.tab();

      expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('tooltip content has role="tooltip"', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });

    it('trigger has aria-describedby pointing to tooltip id', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);

      const tooltip = await screen.findByRole('tooltip');
      expect(trigger).toHaveAttribute('aria-describedby', tooltip.getAttribute('id'));
    });
  });

  describe('Content text', () => {
    it('renders the content prop text in the tooltip', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ content: 'Billing details' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveTextContent('Billing details');
    });

    it('applies wrapping styles for long content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({
        content:
          'This tooltip contains a long sentence that should wrap within the constrained content panel.',
      });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toBeInTheDocument();

      const stylesheet = readFileSync('src/components/Tooltip/Tooltip.module.scss', 'utf8');
      expect(stylesheet).toContain('max-width: 240px;');
      expect(stylesheet).toContain('word-break: break-word;');
    });
  });

  describe('Disabled', () => {
    it('when disabled, tooltip does not appear on hover', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ disabled: true });

      await user.hover(trigger);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('when disabled, no portal is rendered', () => {
      renderTooltip({ disabled: true });

      expect(document.body.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
    });

    it('when disabled, children are rendered as-is', () => {
      const { container } = render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip content="Tooltip content" disabled>
            <button type="button">Trigger</button>
          </Tooltip>
        </TooltipProvider>
      );
      const trigger = screen.getByRole('button', { name: 'Trigger' });

      expect(container.firstElementChild).toBe(trigger);
      expect(trigger).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Positioning props', () => {
    it('applies side="bottom" to Radix content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ side: 'bottom' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveAttribute('data-side', 'bottom');
    });

    it('applies side="left" to Radix content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ side: 'left' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveAttribute('data-side', 'left');
    });

    it('applies side="right" to Radix content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ side: 'right' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveAttribute('data-side', 'right');
    });

    it('applies align="start"', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ align: 'start' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveAttribute('data-align', 'start');
    });

    it('applies align="end"', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ align: 'end' });

      await user.hover(trigger);

      expect(await waitForTooltipPanel()).toHaveAttribute('data-align', 'end');
    });
  });

  describe('Styles', () => {
    it('keeps pointer-events disabled for text-only content', () => {
      const stylesheet = readFileSync('src/components/Tooltip/Tooltip.module.scss', 'utf8');

      expect(stylesheet).toContain('pointer-events: none;');
    });

    it('keeps a square border radius', () => {
      const stylesheet = readFileSync('src/components/Tooltip/Tooltip.module.scss', 'utf8');

      expect(stylesheet).toContain('border-radius: var(--dds-radius-none);');
    });

    it('keeps animation selectors in place when reduced motion is enabled in CSS', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);

      const panel = await waitForTooltipPanel();
      expect(['instant-open', 'delayed-open']).toContain(panel.getAttribute('data-state'));

      const stylesheet = readFileSync('src/components/Tooltip/Tooltip.module.scss', 'utf8');
      expect(stylesheet).toContain("[data-state='delayed-open']");
      expect(stylesheet).toContain('@media (prefers-reduced-motion: reduce)');
    });
  });

  describe('axe', () => {
    it('axe passes when tooltip is closed', async () => {
      const { container } = renderTooltip();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('axe passes when tooltip is open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip();

      await user.hover(trigger);
      await waitForTooltipPanel();
      await waitFor(() => {
        expect(document.body.querySelector('[role="tooltip"]')).toBeInTheDocument();
      });

      const results = await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('axe passes when disabled', async () => {
      const { container } = renderTooltip({ disabled: true });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('axe passes for side="bottom"', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ side: 'bottom' });

      await user.hover(trigger);
      await waitForTooltipPanel();

      const results = await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('axe passes for side="left"', async () => {
      const user = userEvent.setup();
      const { trigger } = renderTooltip({ side: 'left' });

      await user.hover(trigger);
      await waitForTooltipPanel();

      const results = await axe(document.body, {
        rules: {
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });
});
