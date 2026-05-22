import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const renderDialog = (
  rootProps: Partial<React.ComponentProps<typeof Dialog>> = {},
  contentProps: Partial<React.ComponentProps<typeof DialogContent>> = {},
  footerProps: Partial<React.ComponentProps<typeof DialogFooter>> = {}
) => {
  const onOpenChange = vi.fn();

  const view = render(
    <main>
      <button type="button">Before</button>
      <Dialog onOpenChange={onOpenChange} {...rootProps}>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent {...contentProps}>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <button type="button">Primary action</button>
            <button type="button">Secondary action</button>
          </DialogBody>
          <DialogFooter {...footerProps}>
            <Button variant="secondary">Cancel</Button>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <button type="button">After</button>
    </main>
  );

  return {
    ...view,
    onOpenChange,
    trigger: screen.getByRole('button', { name: 'Open dialog', hidden: true }),
    before: screen.getByRole('button', { name: 'Before', hidden: true }),
    after: screen.getByRole('button', { name: 'After', hidden: true }),
  };
};

describe('Dialog', () => {
  describe('rendering', () => {
    it('renders children inside the content panel when open', () => {
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog title')).toBeInTheDocument();
      expect(screen.getByText('Dialog description')).toBeInTheDocument();
    });

    it('does not render the content panel when closed', () => {
      renderDialog();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Dialog title')).not.toBeInTheDocument();
    });

    it('forwards ref to the content element', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Dialog defaultOpen>
          <DialogContent ref={ref} aria-label="Dialog without title">
            <DialogBody>Content</DialogBody>
          </DialogContent>
        </Dialog>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'dialog');
    });

    it('forwards className to the content root', () => {
      renderDialog({ defaultOpen: true }, { className: 'custom-dialog' });

      expect(screen.getByRole('dialog')).toHaveClass('custom-dialog');
    });

    it('renders the internal close button by default', () => {
      renderDialog({ defaultOpen: true });

      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });

    it('does not render the internal close button when disabled', () => {
      renderDialog({ defaultOpen: true }, { showCloseButton: false });

      expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
    });
  });

  describe('sizes and layout', () => {
    it('applies the md size class and custom property by default', () => {
      renderDialog({ defaultOpen: true });

      const dialog = screen.getByRole('dialog');

      expect(dialog.className).toMatch(/size-md/);
      expect(dialog).toHaveStyle('--dialog-max-width: var(--dds-dialog-width-md)');
    });

    it('applies the fullscreen size class', () => {
      renderDialog({ defaultOpen: true }, { size: 'fullscreen' });

      const dialog = screen.getByRole('dialog');

      expect(dialog.className).toMatch(/size-fullscreen/);
      expect(dialog).toHaveStyle('--dialog-max-width: 100vw');
    });

    it('applies the scrollable class when requested', () => {
      renderDialog({ defaultOpen: true }, { scrollable: true });

      expect(screen.getByRole('dialog').className).toMatch(/scrollable/);
    });

    it('applies footer alignment classes', () => {
      renderDialog({ defaultOpen: true }, {}, { align: 'between' });

      expect(document.body.querySelector('[class*="footerAlign-between"]')).toBeInTheDocument();
    });
  });

  describe('open and close behavior', () => {
    it('opens when the trigger is clicked', async () => {
      const user = userEvent.setup();
      const { trigger } = renderDialog();

      await user.click(trigger);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('closes when the close button is clicked', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Close dialog' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close when overlay click is disabled', async () => {
      const { after } = renderDialog({ defaultOpen: true }, { closeOnOverlayClick: false });

      fireEvent.pointerDown(after);
      fireEvent.mouseDown(after);
      fireEvent.pointerUp(after);
      fireEvent.mouseUp(after);
      fireEvent.click(after);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes on Escape by default', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close on Escape when disabled', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true }, { closeOnEscape: false });

      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('calls onOpenChange(false) when closed', async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderDialog({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Close dialog' }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('works as a controlled component', async () => {
      const user = userEvent.setup();

      const ControlledExample = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open externally
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent aria-label="Controlled dialog">
                <DialogBody>
                  <button type="button" onClick={() => setOpen(false)}>
                    Close externally
                  </button>
                </DialogBody>
              </DialogContent>
            </Dialog>
          </>
        );
      };

      render(<ControlledExample />);

      await user.click(screen.getByRole('button', { name: 'Open externally' }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Close externally' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('focus management and accessibility', () => {
    it('moves focus into the dialog on open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderDialog();

      await user.click(trigger);

      const dialog = await screen.findByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      const user = userEvent.setup();
      const { trigger } = renderDialog();

      await user.click(trigger);
      await screen.findByRole('dialog');

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('keeps tab navigation inside the dialog while open', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      const dialog = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: 'Close dialog' });

      closeButton.focus();
      await user.tab();

      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('wires aria-labelledby and aria-describedby to title and description', () => {
      renderDialog({ defaultOpen: true });

      const dialog = screen.getByRole('dialog');
      const title = screen.getByRole('heading', { name: 'Dialog title' });
      const description = screen.getByText('Dialog description');

      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
      expect(dialog).toHaveAttribute('aria-describedby', description.id);
    });

    it('supports aria-label when no visible title is rendered', async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent aria-label="Untitled dialog" aria-describedby={undefined}>
            <DialogBody>Untitled content</DialogBody>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog', { name: 'Untitled dialog' });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(
        screen.getByRole('heading', { name: 'Untitled dialog', hidden: true })
      ).toBeInTheDocument();

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('passes axe when open with title and description', async () => {
      renderDialog({ defaultOpen: true });

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('exposes the default role and close button label', () => {
      renderDialog({ defaultOpen: true });

      const dialog = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: 'Close dialog' });

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
