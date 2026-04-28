import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
} from './Popover';

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

const renderPopover = (
  rootProps: Partial<PopoverProps> = {},
  contentProps: Partial<PopoverContentProps> = {}
) => {
  const view = render(
    <main>
      <button type="button">Before</button>
      <Popover {...rootProps}>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent {...contentProps}>
          <button type="button">First action</button>
          <button type="button">Second action</button>
          <button type="button">Outside action</button>
        </PopoverContent>
      </Popover>
      <button type="button">After</button>
    </main>
  );

  return {
    ...view,
    trigger: screen.getByRole('button', { name: 'Open popover' }),
    before: screen.getByRole('button', { name: 'Before' }),
    after: screen.getByRole('button', { name: 'After' }),
  };
};

const renderPopoverWithForm = (rootProps: Partial<PopoverProps> = {}) => {
  const view = render(
    <main>
      <Popover {...rootProps}>
        <PopoverTrigger>Open form</PopoverTrigger>
        <PopoverContent>
          <label htmlFor="popover-name">Name</label>
          <input id="popover-name" type="text" />
          <button type="submit">Apply</button>
        </PopoverContent>
      </Popover>
      <button type="button">Next field</button>
    </main>
  );

  return {
    ...view,
    trigger: screen.getByRole('button', { name: 'Open form' }),
    nextField: screen.getByRole('button', { name: 'Next field' }),
  };
};

const renderAnchoredPopover = () => {
  const view = render(
    <Popover defaultOpen>
      <PopoverAnchor data-testid="custom-anchor" />
      <PopoverTrigger>Open anchored popover</PopoverTrigger>
      <PopoverContent>Anchored content</PopoverContent>
    </Popover>
  );

  return {
    ...view,
    anchor: screen.getByTestId('custom-anchor'),
  };
};

const getPopoverContent = () =>
  document.body.querySelector(
    '[data-radix-popper-content-wrapper] > [data-side]'
  ) as HTMLDivElement | null;

const waitForPopoverContent = async () => {
  await waitFor(() => {
    expect(getPopoverContent()).toBeInTheDocument();
  });

  return getPopoverContent() as HTMLDivElement;
};

describe('Popover', () => {
  describe('Rendering', () => {
    it('PopoverTrigger renders as a button by default', () => {
      const { trigger } = renderPopover();

      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('type', 'button');
    });

    it('PopoverContent not in DOM when closed', () => {
      renderPopover();

      expect(screen.queryByText('First action')).not.toBeInTheDocument();
      expect(getPopoverContent()).not.toBeInTheDocument();
    });

    it('PopoverContent renders in a portal when open', async () => {
      const user = userEvent.setup();
      const { trigger, container } = renderPopover();

      await user.click(trigger);

      expect(await screen.findByText('First action')).toBeInTheDocument();
      expect(container).not.toContainElement(screen.getByText('First action'));
      expect(document.body).toContainElement(screen.getByText('First action'));
    });

    it('PopoverContent renders children when open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect(await screen.findByRole('button', { name: 'First action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Second action' })).toBeInTheDocument();
    });

    it('forwards className to PopoverContent', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { className: 'custom-popover' });

      await user.click(trigger);

      expect(await waitForPopoverContent()).toHaveClass('custom-popover');
    });

    it('forwards ref to PopoverContent HTMLDivElement', async () => {
      const user = userEvent.setup();
      const contentRef = React.createRef<HTMLDivElement>();

      render(
        <Popover>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent ref={contentRef}>Popover content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open popover' }));

      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(contentRef.current).toHaveTextContent('Popover content');
    });
  });

  describe('Open/close', () => {
    it('clicking trigger opens the popover', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect(await screen.findByText('First action')).toBeInTheDocument();
    });

    it('trigger has aria-expanded="true" when open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-expanded="false" when closed', () => {
      const { trigger } = renderPopover();

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('clicking outside closes the popover', async () => {
      const user = userEvent.setup();
      const { trigger, after } = renderPopover();

      await user.click(trigger);
      expect(await screen.findByText('First action')).toBeInTheDocument();

      await user.click(after);

      await waitFor(() => {
        expect(screen.queryByText('First action')).not.toBeInTheDocument();
      });
    });

    it('pressing Escape closes the popover', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);
      expect(await screen.findByText('First action')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('First action')).not.toBeInTheDocument();
      });
    });

    it('focus returns to trigger on close', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);
      await screen.findByText('First action');

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });

  describe('Focus', () => {
    it('first focusable element in content receives focus on open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect(await screen.findByRole('button', { name: 'First action' })).toHaveFocus();
    });

    it('Tab moves through interactive content in content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);
      expect(await screen.findByRole('button', { name: 'First action' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Second action' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Outside action' })).toHaveFocus();
    });

    it('Tab order wraps within the popover content when modal={false}', async () => {
      const user = userEvent.setup();
      renderPopover();

      await user.click(screen.getByRole('button', { name: 'Open popover' }));
      expect(await screen.findByRole('button', { name: 'First action' })).toHaveFocus();

      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Outside action' })).toHaveFocus();
    });
  });

  describe('Close button', () => {
    it('close button NOT rendered by default', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });

    it('close button rendered when showCloseButton={true}', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { showCloseButton: true });

      await user.click(trigger);

      expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('close button has aria-label="Close" by default', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { showCloseButton: true });

      await user.click(trigger);

      expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('close button has custom aria-label when closeButtonLabel provided', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { showCloseButton: true, closeButtonLabel: 'Dismiss' });

      await user.click(trigger);

      expect(await screen.findByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('clicking close button closes popover', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { showCloseButton: true });

      await user.click(trigger);
      await user.click(await screen.findByRole('button', { name: 'Close' }));

      await waitFor(() => {
        expect(screen.queryByText('First action')).not.toBeInTheDocument();
      });
    });

    it('close button is focusable', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { showCloseButton: true });

      await user.click(trigger);

      expect(await screen.findByRole('button', { name: 'Close' })).toHaveFocus();
    });
  });

  describe('Width', () => {
    it('no inline width style by default (width="auto")', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect((await waitForPopoverContent()).style.width).toBe('');
    });

    it('width style set to var(--radix-popover-trigger-width) when width="trigger"', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { width: 'trigger' });

      await user.click(trigger);

      expect((await waitForPopoverContent()).style.width).toBe(
        'var(--radix-popover-trigger-width)'
      );
    });

    it('explicit width string applied as inline style', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { width: '320px' });

      await user.click(trigger);

      expect((await waitForPopoverContent()).style.width).toBe('320px');
    });
  });

  describe('Arrow', () => {
    it('arrow NOT rendered by default', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover();

      await user.click(trigger);

      expect((await waitForPopoverContent()).querySelector('svg')).not.toBeInTheDocument();
    });

    it('arrow rendered when showArrow={true}', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { showArrow: true });

      await user.click(trigger);

      expect((await waitForPopoverContent()).querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Side / align', () => {
    it('side="top" forwarded to Radix Content', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { side: 'top' });

      await user.click(trigger);

      expect(await waitForPopoverContent()).toHaveAttribute('data-side', 'top');
    });

    it('side="right" forwarded', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { side: 'right' });

      await user.click(trigger);

      expect(await waitForPopoverContent()).toHaveAttribute('data-side', 'right');
    });

    it('align="end" forwarded', async () => {
      const user = userEvent.setup();
      const { trigger } = renderPopover({}, { align: 'end' });

      await user.click(trigger);

      expect(await waitForPopoverContent()).toHaveAttribute('data-align', 'end');
    });
  });

  describe('Sub-components', () => {
    it('PopoverTrigger asChild renders child element as trigger', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <a href="#open">Open custom trigger</a>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('link', { name: 'Open custom trigger' });
      expect(trigger.tagName).toBe('A');

      await user.click(trigger);

      expect(await screen.findByText('Popover content')).toBeInTheDocument();
    });

    it('PopoverClose asChild closes the popover', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>
            <PopoverClose asChild>
              <button type="button">Dismiss panel</button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open popover' }));
      await user.click(await screen.findByRole('button', { name: 'Dismiss panel' }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Dismiss panel' })).not.toBeInTheDocument();
      });
    });

    it('PopoverAnchor renders a custom anchor element', () => {
      const { anchor } = renderAnchoredPopover();

      expect(anchor.tagName).toBe('DIV');
    });
  });

  describe('Controlled', () => {
    it('respects open={true}', () => {
      render(
        <Popover open>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Controlled content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });

    it('respects open={false}', () => {
      render(
        <Popover open={false}>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Controlled content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();
    });

    it('onOpenChange called on open/close', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Controlled content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open popover' }));
      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
      expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('Modal', () => {
    it('modal={true} Tab stays within popover content', async () => {
      const user = userEvent.setup();
      const { trigger, after } = renderPopover({ modal: true });

      await user.click(trigger);
      expect(await screen.findByRole('button', { name: 'First action' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Second action' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Outside action' })).toHaveFocus();

      await user.tab();

      expect(after).not.toHaveFocus();
      expect(screen.getByRole('button', { name: 'First action' })).toHaveFocus();
    });
  });

  describe('axe', () => {
    it('axe: passes when closed', async () => {
      const { container } = renderPopover();

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes when open with simple content', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Popover>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
            <button type="button">Done</button>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open popover' }));

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes when open with form content', async () => {
      const user = userEvent.setup();
      const { container, trigger } = renderPopoverWithForm();

      await user.click(trigger);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes with showCloseButton={true}', async () => {
      const user = userEvent.setup();
      const { container, trigger } = renderPopover({}, { showCloseButton: true });

      await user.click(trigger);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes with modal={true}', async () => {
      const user = userEvent.setup();
      const { container, trigger } = renderPopoverWithForm({ modal: true });

      await user.click(trigger);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('axe: passes for side="top"', async () => {
      const user = userEvent.setup();
      const { container, trigger } = renderPopover({}, { side: 'top' });

      await user.click(trigger);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
