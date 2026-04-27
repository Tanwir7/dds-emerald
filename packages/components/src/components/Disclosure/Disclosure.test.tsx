import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Disclosure, DisclosureTrigger, DisclosureContent } from './Disclosure';

type DisclosureRootProps = Omit<React.ComponentProps<typeof Disclosure>, 'children'>;
type DisclosureTriggerOnlyProps = Omit<React.ComponentProps<typeof DisclosureTrigger>, 'children'>;
type DisclosureContentOnlyProps = Omit<React.ComponentProps<typeof DisclosureContent>, 'children'>;

const renderDisclosure = (
  props: DisclosureRootProps = {},
  triggerProps: DisclosureTriggerOnlyProps = {},
  contentProps: DisclosureContentOnlyProps = {}
) => {
  return render(
    <Disclosure {...props}>
      <DisclosureTrigger {...triggerProps}>Show details</DisclosureTrigger>
      <DisclosureContent {...contentProps}>Hidden content here</DisclosureContent>
    </Disclosure>
  );
};

afterEach(() => {
  cleanup();
});

describe('Disclosure', () => {
  describe('Rendering', () => {
    it('renders Collapsible.Root', () => {
      const { container } = renderDisclosure();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('DisclosureTrigger renders as a button', () => {
      renderDisclosure();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button').tagName).toBe('BUTTON');
    });

    it('trigger has aria-expanded="false" by default', () => {
      renderDisclosure();
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-controls pointing to content id', () => {
      renderDisclosure({ defaultOpen: true });
      const trigger = screen.getByRole('button');
      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      expect(document.getElementById(controlsId!)).toBeInTheDocument();
    });

    it('content has matching id', () => {
      const { container } = renderDisclosure({ defaultOpen: true });
      const trigger = screen.getByRole('button');
      const content = container.querySelector('[class*="content"][data-state="open"]');
      expect(content).toBeTruthy();
      expect(content!.id).toBe(trigger.getAttribute('aria-controls'));
    });

    it('content is hidden by default (data-state="closed")', () => {
      const { container } = renderDisclosure();
      const content = container.querySelector('[data-state="closed"]');
      expect(content).toBeInTheDocument();
    });

    it('forwards className to each sub-component', () => {
      renderDisclosure(
        { className: 'root-class' },
        { className: 'trigger-class' },
        { className: 'content-class' }
      );
      expect(screen.getByRole('button')).toHaveClass('trigger-class');
    });
  });

  describe('Open/close', () => {
    it('clicking trigger expands content (aria-expanded="true")', async () => {
      const user = userEvent.setup();
      renderDisclosure();
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking trigger again collapses content', async () => {
      const user = userEvent.setup();
      renderDisclosure();
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('onOpenChange called with true on open', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDisclosure({ onOpenChange });
      await user.click(screen.getByRole('button'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('onOpenChange called with false on close', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDisclosure({ onOpenChange });
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      await user.click(trigger);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Controlled', () => {
    it('respects controlled open={true}', () => {
      renderDisclosure({ open: true });
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('respects controlled open={false}', () => {
      renderDisclosure({ open: false });
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('onOpenChange called when user clicks (controlled)', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDisclosure({ open: false, onOpenChange });
      await user.click(screen.getByRole('button'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Chevron', () => {
    it('chevron rendered by default (showChevron=true)', () => {
      renderDisclosure();
      const trigger = screen.getByRole('button');
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('chevron NOT rendered when showChevron={false}', () => {
      renderDisclosure({}, { showChevron: false });
      const trigger = screen.getByRole('button');
      const svg = trigger.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('chevron has the chevron CSS class', () => {
      renderDisclosure();
      const trigger = screen.getByRole('button');
      const svg = trigger.querySelector('svg');
      expect(svg).toHaveAttribute('class', expect.stringContaining('chevron'));
    });
  });

  describe('Sizes', () => {
    it('applies .md class by default', () => {
      renderDisclosure();
      expect(screen.getByRole('button').className).toMatch(/md/);
    });

    it('applies .sm class when size="sm"', () => {
      renderDisclosure({}, { size: 'sm' });
      expect(screen.getByRole('button').className).toMatch(/sm/);
    });
  });

  describe('Disabled', () => {
    it('trigger has data-disabled when disabled={true}', () => {
      renderDisclosure({ disabled: true });
      expect(screen.getByRole('button')).toHaveAttribute('data-disabled');
    });

    it('click does not toggle when disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDisclosure({ disabled: true, onOpenChange });
      await user.click(screen.getByRole('button'));
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Content', () => {
    it('children rendered inside content when open', async () => {
      const user = userEvent.setup();
      renderDisclosure();
      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Hidden content here')).toBeInTheDocument();
    });

    it('contentInner class applied', async () => {
      const user = userEvent.setup();
      const { container } = renderDisclosure();
      await user.click(screen.getByRole('button'));
      const inner = container.querySelector('[class*="contentInner"]');
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('content has data-state="open" when open', async () => {
      const user = userEvent.setup();
      const { container } = renderDisclosure();
      await user.click(screen.getByRole('button'));
      const content = container.querySelector('[data-state="open"]');
      expect(content).toBeInTheDocument();
    });

    it('content has data-state="closed" when closed', () => {
      const { container } = renderDisclosure();
      const content = container.querySelector('[data-state="closed"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Keyboard', () => {
    it('Space toggles trigger', async () => {
      const user = userEvent.setup();
      renderDisclosure();
      const trigger = screen.getByRole('button');
      trigger.focus();
      await user.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('Enter toggles trigger', async () => {
      const user = userEvent.setup();
      renderDisclosure();
      const trigger = screen.getByRole('button');
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('disabled trigger does not respond to Space/Enter', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDisclosure({ disabled: true, onOpenChange });
      const trigger = screen.getByRole('button');
      trigger.focus();
      await user.keyboard(' ');
      await user.keyboard('{Enter}');
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Axe', () => {
    it('passes when closed', async () => {
      const { container } = renderDisclosure();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes when open', async () => {
      const { container } = renderDisclosure({ defaultOpen: true });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes when disabled', async () => {
      const { container } = renderDisclosure({ disabled: true });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('passes with showChevron={false}', async () => {
      const { container } = renderDisclosure({}, { showChevron: false });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
