import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const renderSheet = (
  rootProps: Partial<React.ComponentProps<typeof Sheet>> = {},
  contentProps: Partial<React.ComponentProps<typeof SheetContent>> = {},
  footerProps: Partial<React.ComponentProps<typeof SheetFooter>> = {}
) => {
  const onOpenChange = vi.fn();

  const view = render(
    <main>
      <button type="button">Before</button>
      <Sheet onOpenChange={onOpenChange} {...rootProps}>
        <SheetTrigger asChild>
          <Button>Open sheet</Button>
        </SheetTrigger>
        <SheetContent {...contentProps}>
          <SheetHeader>
            <SheetTitle>Sheet title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <button type="button">Primary action</button>
            <button type="button">Secondary action</button>
          </SheetBody>
          <SheetFooter {...footerProps}>
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button>Confirm</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <button type="button">After</button>
    </main>
  );

  return {
    ...view,
    onOpenChange,
    trigger: screen.getByRole('button', { name: 'Open sheet', hidden: true }),
    before: screen.getByRole('button', { name: 'Before', hidden: true }),
    after: screen.getByRole('button', { name: 'After', hidden: true }),
  };
};

describe('Sheet', () => {
  describe('rendering', () => {
    it('renders children inside the content panel when open', () => {
      renderSheet({ defaultOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Sheet title')).toBeInTheDocument();
      expect(screen.getByText('Sheet description')).toBeInTheDocument();
    });

    it('does not render the content panel when closed', () => {
      renderSheet();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Sheet title')).not.toBeInTheDocument();
    });

    it('forwards ref to the content element', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Sheet defaultOpen>
          <SheetContent ref={ref} aria-label="Sheet without title">
            <SheetBody>Content</SheetBody>
          </SheetContent>
        </Sheet>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('role', 'dialog');
    });

    it('forwards className to the content root', () => {
      renderSheet({ defaultOpen: true }, { className: 'custom-sheet' });

      expect(screen.getByRole('dialog')).toHaveClass('custom-sheet');
    });

    it('renders the portal into a custom container when provided', () => {
      const portalContainer = document.createElement('div');
      document.body.appendChild(portalContainer);

      renderSheet({ defaultOpen: true }, { portalContainer });

      expect(portalContainer.contains(screen.getByRole('dialog'))).toBe(true);

      portalContainer.remove();
    });

    it('renders the internal close button by default', () => {
      renderSheet({ defaultOpen: true });

      expect(screen.getByRole('button', { name: 'Close sheet' })).toBeInTheDocument();
    });

    it('does not render the internal close button when disabled', () => {
      renderSheet({ defaultOpen: true }, { showCloseButton: false });

      expect(screen.queryByRole('button', { name: 'Close sheet' })).not.toBeInTheDocument();
    });

    it('renders body and footer regions', () => {
      renderSheet({ defaultOpen: true });

      expect(screen.getByText('Primary action').closest('div')?.className).toMatch(/body/);
      expect(document.body.querySelector('[class*="footer"]')).toBeInTheDocument();
    });
  });

  describe('sides and sizes', () => {
    it('applies the right side class and md width by default', () => {
      renderSheet({ defaultOpen: true });

      const sheet = screen.getByRole('dialog');

      expect(sheet.className).toMatch(/side-right/);
      expect(sheet.className).toMatch(/size-md/);
      expect(sheet).toHaveStyle('--sheet-width: 480px');
    });

    it('applies the left side class', () => {
      renderSheet({ defaultOpen: true }, { side: 'left' });

      expect(screen.getByRole('dialog').className).toMatch(/side-left/);
    });

    it('applies each size modifier and width custom property', () => {
      const cases = [
        { size: 'sm', className: /size-sm/, width: '320px' },
        { size: 'md', className: /size-md/, width: '480px' },
        { size: 'lg', className: /size-lg/, width: '640px' },
        { size: 'full', className: /size-full/, width: '100vw' },
      ] as const;

      for (const testCase of cases) {
        cleanup();
        renderSheet({ defaultOpen: true }, { size: testCase.size });
        const sheet = screen.getByRole('dialog');
        expect(sheet.className).toMatch(testCase.className);
        expect(sheet).toHaveStyle(`--sheet-width: ${testCase.width}`);
      }
    });
  });

  describe('open and close behavior', () => {
    it('opens when the trigger is clicked', async () => {
      const user = userEvent.setup();
      const { trigger } = renderSheet();

      await user.click(trigger);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('closes when the close button is clicked', async () => {
      const user = userEvent.setup();
      renderSheet({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Close sheet' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes when overlay is clicked by default', async () => {
      renderSheet({ defaultOpen: true });
      const overlay = document.body.querySelector('[class*="overlay"]');

      expect(overlay).not.toBeNull();
      await new Promise((resolve) => window.setTimeout(resolve, 0));

      fireEvent.pointerDown(overlay as Element);
      fireEvent.mouseDown(overlay as Element);
      fireEvent.pointerUp(overlay as Element);
      fireEvent.mouseUp(overlay as Element);
      fireEvent.click(overlay as Element);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close when overlay click is disabled', () => {
      const { after } = renderSheet({ defaultOpen: true }, { closeOnOverlayClick: false });

      fireEvent.pointerDown(after);
      fireEvent.mouseDown(after);
      fireEvent.pointerUp(after);
      fireEvent.mouseUp(after);
      fireEvent.click(after);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes on Escape by default', async () => {
      const user = userEvent.setup();
      renderSheet({ defaultOpen: true });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close on Escape when disabled', async () => {
      const user = userEvent.setup();
      renderSheet({ defaultOpen: true }, { closeOnEscape: false });

      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('calls onOpenChange(false) when closed via the close button', async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderSheet({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Close sheet' }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('calls onOpenChange(false) when closed via Escape', async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderSheet({ defaultOpen: true });

      await user.keyboard('{Escape}');

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
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent aria-label="Controlled sheet">
                <SheetBody>
                  <button type="button" onClick={() => setOpen(false)}>
                    Close externally
                  </button>
                </SheetBody>
              </SheetContent>
            </Sheet>
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

  describe('footer alignment', () => {
    it('applies end alignment by default', () => {
      renderSheet({ defaultOpen: true });

      expect(document.body.querySelector('[class*="footerAlign-end"]')).toBeInTheDocument();
    });

    it('applies start, center, and between alignment classes', () => {
      const alignments = ['start', 'center', 'between'] as const;

      for (const align of alignments) {
        cleanup();
        renderSheet({ defaultOpen: true }, {}, { align });
        expect(document.body.querySelector(`[class*="footerAlign-${align}"]`)).toBeInTheDocument();
      }
    });
  });

  describe('focus and accessibility', () => {
    it('moves focus into the sheet on open', async () => {
      const user = userEvent.setup();
      const { trigger } = renderSheet();

      await user.click(trigger);

      const sheet = await screen.findByRole('dialog');
      expect(sheet.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      const user = userEvent.setup();
      const { trigger } = renderSheet();

      await user.click(trigger);
      await user.click(await screen.findByRole('button', { name: 'Close sheet' }));

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('keeps tab focus trapped inside the sheet', async () => {
      const user = userEvent.setup();
      renderSheet({ defaultOpen: true });

      for (let index = 0; index < 6; index += 1) {
        await user.tab();
        expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
      }
    });

    it('keeps reverse tab focus trapped inside the sheet', async () => {
      const user = userEvent.setup();
      renderSheet({ defaultOpen: true });

      for (let index = 0; index < 4; index += 1) {
        await user.tab({ shift: true });
        expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
      }
    });

    it('wires title and description ids onto the dialog', () => {
      renderSheet({ defaultOpen: true });

      const sheet = screen.getByRole('dialog');
      const labelledBy = sheet.getAttribute('aria-labelledby');
      const describedBy = sheet.getAttribute('aria-describedby');

      expect(labelledBy).toBeTruthy();
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(labelledBy ?? '')).toHaveTextContent('Sheet title');
      expect(document.getElementById(describedBy ?? '')).toHaveTextContent('Sheet description');
    });

    it('renders an accessible hidden title when only aria-label is provided', () => {
      render(
        <Sheet defaultOpen>
          <SheetContent aria-label="Profile details">
            <SheetBody>Content</SheetBody>
          </SheetContent>
        </Sheet>
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
      expect(screen.getByText('Profile details')).toBeInTheDocument();
    });

    it('has the expected dialog semantics and close button label', () => {
      renderSheet({ defaultOpen: true });

      const sheet = screen.getByRole('dialog');
      expect(sheet).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByRole('button', { name: 'Close sheet' })).toBeInTheDocument();
    });

    it('passes axe checks across key variants', async () => {
      const renderDefault = renderSheet({ defaultOpen: true });
      expect(await axe(renderDefault.baseElement)).toHaveNoViolations();
      cleanup();

      const renderLeft = renderSheet({ defaultOpen: true }, { side: 'left' });
      expect(await axe(renderLeft.baseElement)).toHaveNoViolations();
    });

    it('passes axe when using aria-label without a visible title', async () => {
      const { baseElement } = render(
        <Sheet defaultOpen>
          <SheetContent aria-label="Sheet without visible title">
            <SheetBody>
              <form>
                <label htmlFor="profile-name">Name</label>
                <input id="profile-name" />
              </form>
            </SheetBody>
          </SheetContent>
        </Sheet>
      );

      expect(await axe(baseElement)).toHaveNoViolations();
    });

    it('passes axe when the close button is hidden and size is full', async () => {
      const { baseElement } = render(
        <Sheet defaultOpen>
          <SheetContent size="full" showCloseButton={false} closeOnEscape={false}>
            <SheetHeader>
              <SheetTitle>Full sheet</SheetTitle>
              <SheetDescription>Large layout</SheetDescription>
            </SheetHeader>
            <SheetBody>Body</SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="secondary">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      expect(await axe(baseElement)).toHaveNoViolations();
    });
  });
});
