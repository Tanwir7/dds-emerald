import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';
import { DialogClose } from '../Dialog';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const renderAlertDialog = (
  rootProps: Partial<React.ComponentProps<typeof AlertDialog>> = {},
  contentProps: Partial<React.ComponentProps<typeof AlertDialogContent>> = {}
) => {
  const onOpenChange = vi.fn();

  const view = render(
    <main>
      <button type="button">Before</button>
      <AlertDialog onOpenChange={onOpenChange} {...rootProps}>
        <AlertDialogTrigger>Delete project</AlertDialogTrigger>
        <AlertDialogContent {...contentProps}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>All associated data will be removed.</AlertDialogBody>
          <AlertDialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive">Delete</Button>
            </DialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <button type="button">After</button>
    </main>
  );

  return {
    ...view,
    onOpenChange,
    trigger: screen.getByRole('button', { name: 'Delete project', hidden: true }),
    before: screen.getByRole('button', { name: 'Before', hidden: true }),
    after: screen.getByRole('button', { name: 'After', hidden: true }),
  };
};

describe('AlertDialog', () => {
  describe('rendering', () => {
    it('renders children when open', () => {
      renderAlertDialog({ defaultOpen: true });

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('All associated data will be removed.')).toBeInTheDocument();
    });

    it('does not render an internal close button', () => {
      renderAlertDialog({ defaultOpen: true });

      expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
    });

    it('forwards ref to the content element', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent ref={ref}>
            <AlertDialogBody>Content</AlertDialogBody>
          </AlertDialogContent>
        </AlertDialog>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'alertdialog');
    });

    it('forwards className to the content root', () => {
      renderAlertDialog({ defaultOpen: true }, { className: 'custom-alert-dialog' });

      expect(screen.getByRole('alertdialog')).toHaveClass('custom-alert-dialog');
    });
  });

  describe('variants and sizes', () => {
    it('applies the destructive variant by default', () => {
      renderAlertDialog({ defaultOpen: true });

      expect(screen.getByRole('alertdialog').className).toMatch(/variant-destructive/);
    });

    it('applies the warning variant', () => {
      renderAlertDialog({ defaultOpen: true }, { variant: 'warning' });

      expect(screen.getByRole('alertdialog').className).toMatch(/variant-warning/);
    });

    it('applies the info variant', () => {
      renderAlertDialog({ defaultOpen: true }, { variant: 'info' });

      expect(screen.getByRole('alertdialog').className).toMatch(/variant-info/);
    });

    it('uses the sm size by default and supports md', () => {
      const { rerender } = render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogBody>Small</AlertDialogBody>
          </AlertDialogContent>
        </AlertDialog>
      );

      expect(screen.getByRole('alertdialog').className).toMatch(/size-sm/);
      expect(screen.getByRole('alertdialog')).toHaveStyle('--dialog-max-width: 400px');

      rerender(
        <AlertDialog defaultOpen>
          <AlertDialogContent size="md">
            <AlertDialogBody>Medium</AlertDialogBody>
          </AlertDialogContent>
        </AlertDialog>
      );

      expect(screen.getByRole('alertdialog').className).toMatch(/size-md/);
      expect(screen.getByRole('alertdialog')).toHaveStyle('--dialog-max-width: 560px');
    });
  });

  describe('dismissal behavior', () => {
    it('does not close on Escape by default', async () => {
      const user = userEvent.setup();
      renderAlertDialog({ defaultOpen: true });

      await user.keyboard('{Escape}');

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not close on overlay click by default', async () => {
      const { after } = renderAlertDialog({ defaultOpen: true });

      fireEvent.pointerDown(after);
      fireEvent.mouseDown(after);
      fireEvent.pointerUp(after);
      fireEvent.mouseUp(after);
      fireEvent.click(after);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('closes on Escape when enabled', async () => {
      const user = userEvent.setup();
      renderAlertDialog({ defaultOpen: true }, { closeOnEscape: true });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('open and close behavior', () => {
    it('opens when the trigger is clicked', async () => {
      const user = userEvent.setup();
      const { trigger } = renderAlertDialog();

      await user.click(trigger);

      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    });

    it('closes when the cancel action is clicked', async () => {
      const user = userEvent.setup();
      renderAlertDialog({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange(false) on explicit close', async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderAlertDialog({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

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
              Open alert
            </button>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogContent>
                <AlertDialogBody>
                  <button type="button" onClick={() => setOpen(false)}>
                    Confirm close
                  </button>
                </AlertDialogBody>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      };

      render(<ControlledExample />);

      await user.click(screen.getByRole('button', { name: 'Open alert' }));
      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Confirm close' }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('focus management and accessibility', () => {
    it('moves focus into the alert dialog on open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderAlertDialog();

      await user.click(trigger);

      const dialog = await screen.findByRole('alertdialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      const user = userEvent.setup();
      const { trigger } = renderAlertDialog();

      await user.click(trigger);
      await screen.findByRole('alertdialog');

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('keeps tab navigation inside the alert dialog while open', async () => {
      const user = userEvent.setup();
      renderAlertDialog({ defaultOpen: true });

      const dialog = screen.getByRole('alertdialog');
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      cancelButton.focus();
      await user.tab();

      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('wires aria-labelledby and aria-describedby to title and description', () => {
      renderAlertDialog({ defaultOpen: true });

      const dialog = screen.getByRole('alertdialog');
      const title = screen.getByRole('heading', { name: 'Delete project' });
      const description = screen.getByText('This action cannot be undone.');

      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
      expect(dialog).toHaveAttribute('aria-describedby', description.id);
    });

    it('uses alertdialog semantics', () => {
      renderAlertDialog({ defaultOpen: true });

      const dialog = screen.getByRole('alertdialog');
      const deleteButton = within(dialog).getByRole('button', { name: 'Delete' });

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(deleteButton).toBeInTheDocument();
    });

    it('passes axe for each variant', async () => {
      const { rerender } = render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Delete</Button>
              </DialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      expect(await axe(document.body)).toHaveNoViolations();

      rerender(
        <AlertDialog defaultOpen>
          <AlertDialogContent variant="warning">
            <AlertDialogHeader>
              <AlertDialogTitle>Archive workspace</AlertDialogTitle>
              <AlertDialogDescription>Archiving hides this workspace.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Archive</Button>
              </DialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      expect(await axe(document.body)).toHaveNoViolations();

      rerender(
        <AlertDialog defaultOpen>
          <AlertDialogContent variant="info">
            <AlertDialogHeader>
              <AlertDialogTitle>Update required</AlertDialogTitle>
              <AlertDialogDescription>A new version is available.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Later</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Update now</Button>
              </DialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      expect(await axe(document.body)).toHaveNoViolations();
    });
  });
});
