import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import styles from './Toast.module.scss';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToast,
} from './Toast';

expect.extend(toHaveNoViolations);

const variantSuccessClassName = getRequiredClassName(styles, 'variantSuccess');
const variantWarningClassName = getRequiredClassName(styles, 'variantWarning');
const variantDangerClassName = getRequiredClassName(styles, 'variantDanger');
const variantInfoClassName = getRequiredClassName(styles, 'variantInfo');
const variantIconClassName = getRequiredClassName(styles, 'variantIcon');

beforeAll(() => {
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ??
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(async () => {
  cleanup();

  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  }

  await act(async () => {
    await Promise.resolve();
  });
});

const axeOptions = {
  rules: {
    region: {
      enabled: false,
    },
  },
};

type TriggerToastButtonProps = {
  title?: string;
  description?: string;
  variant?: React.ComponentProps<typeof Toast>['variant'];
  duration?: number;
  action?: {
    label: string;
    altText: string;
    onClick: () => void;
  };
  buttonLabel?: string;
};

const TriggerToastButton = ({
  title = 'Toast title',
  description = 'Toast description',
  variant = 'default',
  duration,
  action,
  buttonLabel = 'Show toast',
}: TriggerToastButtonProps) => {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        toast({
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(variant !== undefined ? { variant } : {}),
          ...(duration !== undefined ? { duration } : {}),
          ...(action !== undefined ? { action } : {}),
        });
      }}
    >
      {buttonLabel}
    </button>
  );
};

const DismissToastButton = ({ toastId }: { toastId: string }) => {
  const { dismiss } = useToast();

  return (
    <button type="button" onClick={() => dismiss(toastId)}>
      Dismiss toast
    </button>
  );
};

const ToastStateSnapshot = () => {
  const { toasts } = useToast();

  return <div data-testid="toast-state">{JSON.stringify(toasts)}</div>;
};

const AutoToastOnMount = ({ options }: { options: TriggerToastButtonProps }) => {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      ...(options.title !== undefined ? { title: options.title } : {}),
      ...(options.description !== undefined ? { description: options.description } : {}),
      ...(options.variant !== undefined ? { variant: options.variant } : {}),
      ...(options.duration !== undefined ? { duration: options.duration } : {}),
      ...(options.action !== undefined ? { action: options.action } : {}),
    });
  }, [options, toast]);

  return null;
};

const renderProviderHarness = (props: TriggerToastButtonProps = {}) =>
  render(
    <ToastProvider>
      <div>
        <TriggerToastButton {...props} />
        <ToastStateSnapshot />
      </div>
    </ToastProvider>
  );

const renderStandaloneToast = (toastNode: React.ReactNode) =>
  render(
    <RadixToast.Provider swipeDirection="right">
      <main>{toastNode}</main>
      <ToastViewport />
    </RadixToast.Provider>
  );

const openToastFromHarness = async (
  user: ReturnType<typeof userEvent.setup>,
  buttonName = 'Show toast'
) => {
  await user.click(screen.getByRole('button', { name: buttonName }));
  expect(getToastListItem()).toBeInTheDocument();
};

const getToastListItem = () =>
  document.body.querySelector('li[data-radix-collection-item]') as HTMLLIElement | null;

const getToastViewportList = () => document.body.querySelector('ol') as HTMLOListElement | null;

const getToastRegion = () => screen.getByRole('region', { name: /notifications/i });

const getLiveRegion = (ariaLive: 'assertive' | 'polite') =>
  document.body.querySelector(
    `span[role="status"][aria-live="${ariaLive}"]`
  ) as HTMLSpanElement | null;

describe('Toast', () => {
  describe('ToastProvider and useToast', () => {
    it('throws when useToast is used outside ToastProvider', () => {
      const Consumer = () => {
        useToast();
        return null;
      };

      expect(() => render(<Consumer />)).toThrowError(
        'useToast must be used within a ToastProvider'
      );
    });

    it('toast() adds a toast to the DOM', async () => {
      const user = userEvent.setup();
      renderProviderHarness();

      await openToastFromHarness(user);

      expect(getToastListItem()).toBeInTheDocument();
      expect(screen.getByText('Toast title')).toBeInTheDocument();
      expect(screen.getByText('Toast description')).toBeInTheDocument();
    });

    it('toast() returns a string id', async () => {
      const CaptureToastId = () => {
        const { toast } = useToast();
        const [toastId, setToastId] = React.useState('');

        return (
          <>
            <button
              type="button"
              onClick={() => {
                setToastId(toast({ title: 'Generated id' }));
              }}
            >
              Create toast
            </button>
            <output data-testid="toast-id">{toastId}</output>
          </>
        );
      };

      const user = userEvent.setup();

      render(
        <ToastProvider>
          <CaptureToastId />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Create toast' }));

      expect(screen.getByTestId('toast-id')).toHaveTextContent(/^.+$/);
    });

    it('dismiss(id) removes the toast from the DOM', async () => {
      const CaptureToastId = () => {
        const { toast } = useToast();
        const [toastId, setToastId] = React.useState('');

        return (
          <>
            <button
              type="button"
              onClick={() => {
                setToastId(toast({ title: 'Dismiss me' }));
              }}
            >
              Create toast
            </button>
            {toastId ? <DismissToastButton toastId={toastId} /> : null}
          </>
        );
      };

      const user = userEvent.setup();

      render(
        <ToastProvider>
          <CaptureToastId />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Create toast' }));
      expect(await screen.findByText('Dismiss me')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Dismiss toast' }));

      await waitFor(() => {
        expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
      });
    });

    it('multiple toasts can be open simultaneously', async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TriggerToastButton
            title="First toast"
            description="First description"
            buttonLabel="Show first"
          />
          <TriggerToastButton
            title="Second toast"
            description="Second description"
            buttonLabel="Show second"
          />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Show first' }));
      await user.click(screen.getByRole('button', { name: 'Show second' }));

      expect(document.body.querySelectorAll('li[data-radix-collection-item]')).toHaveLength(2);
    });

    it('calling toast() twice renders two toast items', async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TriggerToastButton title="Repeated toast" description="Repeated description" />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Show toast' }));
      await user.click(screen.getByRole('button', { name: 'Show toast' }));

      expect(document.body.querySelectorAll('li[data-radix-collection-item]')).toHaveLength(2);
    });
  });

  describe('rendering', () => {
    it('renders ToastTitle text', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>File saved</ToastTitle>
        </Toast>
      );

      expect(screen.getByText('File saved')).toBeInTheDocument();
    });

    it('renders ToastDescription text', () => {
      renderStandaloneToast(
        <Toast>
          <ToastDescription>Your changes have been saved.</ToastDescription>
        </Toast>
      );

      expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
    });

    it('renders ToastAction with the correct label', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>Archived</ToastTitle>
          <ToastAction altText="Undo archiving">Undo</ToastAction>
        </Toast>
      );

      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });

    it('renders the close button with the correct aria-label', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>Saved</ToastTitle>
          <ToastClose />
        </Toast>
      );

      expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
    });

    it('does not render a variant icon for variant="default"', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>Default toast</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector(`.${variantIconClassName}`)).not.toBeInTheDocument();
    });

    it('renders a success icon for variant="success"', () => {
      renderStandaloneToast(
        <Toast variant="success">
          <ToastTitle>Published</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector(`.${variantIconClassName}`)).toBeInTheDocument();
    });

    it('renders a warning icon for variant="warning"', () => {
      renderStandaloneToast(
        <Toast variant="warning">
          <ToastTitle>Storage nearly full</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector(`.${variantIconClassName}`)).toBeInTheDocument();
    });

    it('renders a danger icon for variant="danger"', () => {
      renderStandaloneToast(
        <Toast variant="danger">
          <ToastTitle>Upload failed</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector(`.${variantIconClassName}`)).toBeInTheDocument();
    });

    it('renders an info icon for variant="info"', () => {
      renderStandaloneToast(
        <Toast variant="info">
          <ToastTitle>Background sync complete</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector(`.${variantIconClassName}`)).toBeInTheDocument();
    });

    it('marks the variant icon as aria-hidden', () => {
      renderStandaloneToast(
        <Toast variant="success">
          <ToastTitle>Published</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector(`.${variantIconClassName}`)).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('applies the success variant class', () => {
      renderStandaloneToast(
        <Toast variant="success">
          <ToastTitle>Published</ToastTitle>
        </Toast>
      );

      expect(getToastListItem()).toHaveClass(variantSuccessClassName);
    });

    it('applies the warning variant class', () => {
      renderStandaloneToast(
        <Toast variant="warning">
          <ToastTitle>Storage nearly full</ToastTitle>
        </Toast>
      );

      expect(getToastListItem()).toHaveClass(variantWarningClassName);
    });

    it('applies the danger variant class', () => {
      renderStandaloneToast(
        <Toast variant="danger">
          <ToastTitle>Upload failed</ToastTitle>
        </Toast>
      );

      expect(getToastListItem()).toHaveClass(variantDangerClassName);
    });

    it('applies the info variant class', () => {
      renderStandaloneToast(
        <Toast variant="info">
          <ToastTitle>Background sync complete</ToastTitle>
        </Toast>
      );

      expect(getToastListItem()).toHaveClass(variantInfoClassName);
    });

    it('forwards ref to the Toast root HTMLLIElement', () => {
      const ref = React.createRef<HTMLLIElement>();

      renderStandaloneToast(
        <Toast ref={ref}>
          <ToastTitle>Ref target</ToastTitle>
        </Toast>
      );

      expect(ref.current).toBeInstanceOf(HTMLLIElement);
      expect(ref.current).toHaveTextContent('Ref target');
    });

    it('forwards className to the Toast root', () => {
      renderStandaloneToast(
        <Toast className="custom-toast">
          <ToastTitle>Custom class</ToastTitle>
        </Toast>
      );

      expect(getToastListItem()).toHaveClass('custom-toast');
    });
  });

  describe('auto-dismiss', () => {
    it('dismisses automatically after the default duration', async () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <AutoToastOnMount options={{ title: 'Toast title', description: 'Toast description' }} />
        </ToastProvider>
      );
      expect(screen.getByText('Toast title')).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(screen.queryByText('Toast title')).not.toBeInTheDocument();
    }, 10000);

    it('dismisses after a custom duration', async () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <AutoToastOnMount
            options={{ title: 'Toast title', description: 'Toast description', duration: 2000 }}
          />
        </ToastProvider>
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1999);
      });
      expect(screen.getByText('Toast title')).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      expect(screen.queryByText('Toast title')).not.toBeInTheDocument();
    }, 10000);

    it('does not auto-dismiss when duration is Infinity', async () => {
      vi.useFakeTimers();
      render(
        <ToastProvider>
          <AutoToastOnMount
            options={{ title: 'Toast title', description: 'Toast description', duration: Infinity }}
          />
        </ToastProvider>
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });

      expect(screen.getByText('Toast title')).toBeInTheDocument();
    }, 10000);

    it('calls onOpenChange(false) when the toast closes', async () => {
      vi.useFakeTimers();
      const onOpenChange = vi.fn();

      renderStandaloneToast(
        <Toast duration={1000} onOpenChange={onOpenChange}>
          <ToastTitle>Auto close</ToastTitle>
        </Toast>
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('close button', () => {
    it('clicking the close button dismisses the toast', async () => {
      const user = userEvent.setup();

      renderStandaloneToast(
        <Toast defaultOpen>
          <ToastTitle>Closable</ToastTitle>
          <ToastClose />
        </Toast>
      );

      await user.click(await screen.findByRole('button', { name: 'Dismiss notification' }));

      await waitFor(() => {
        expect(screen.queryByText('Closable')).not.toBeInTheDocument();
      });
    });

    it('clicking the close button calls onOpenChange(false)', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      renderStandaloneToast(
        <Toast defaultOpen onOpenChange={onOpenChange}>
          <ToastTitle>Closable</ToastTitle>
          <ToastClose />
        </Toast>
      );

      await user.click(await screen.findByRole('button', { name: 'Dismiss notification' }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('action', () => {
    it('renders a button with the provided label', async () => {
      const user = userEvent.setup();
      renderProviderHarness({
        action: {
          label: 'Undo',
          altText: 'Undo the last action',
          onClick: vi.fn(),
        },
      });

      await openToastFromHarness(user);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });

    it('clicking the action button calls the onClick handler', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      renderProviderHarness({
        action: {
          label: 'Undo',
          altText: 'Undo the last action',
          onClick,
        },
      });

      await openToastFromHarness(user);
      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('live region behavior', () => {
    it('uses aria-live="assertive" for variant="danger"', () => {
      renderStandaloneToast(
        <Toast variant="danger">
          <ToastTitle>Upload failed</ToastTitle>
        </Toast>
      );

      expect(getLiveRegion('assertive')).toBeInTheDocument();
    });

    it('does not use aria-live="assertive" for non-danger variants', () => {
      renderStandaloneToast(
        <Toast variant="success">
          <ToastTitle>Published</ToastTitle>
        </Toast>
      );

      expect(document.body.querySelector('span[role="status"]')).toBeInTheDocument();
    });
  });

  describe('Radix accessibility semantics', () => {
    it('renders ToastViewport as an ordered list', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>Viewport check</ToastTitle>
        </Toast>
      );

      expect(getToastViewportList()?.tagName).toBe('OL');
    });

    it('renders Toast as a list item', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>List item toast</ToastTitle>
        </Toast>
      );

      expect(getToastListItem()?.tagName).toBe('LI');
    });

    it('uses role="status" for non-danger variants', () => {
      renderStandaloneToast(
        <Toast variant="info">
          <ToastTitle>Informational update</ToastTitle>
        </Toast>
      );

      expect(getToastRegion()).toBeInTheDocument();
    });

    it('applies a non-empty aria-label to the viewport', () => {
      renderStandaloneToast(
        <Toast>
          <ToastTitle>Viewport label</ToastTitle>
        </Toast>
      );

      expect(getToastRegion()).toHaveAttribute('aria-label');
      expect(getToastRegion().getAttribute('aria-label')).not.toEqual('');
    });
  });

  describe('axe', () => {
    it('passes axe for the default variant', async () => {
      const { container } = renderStandaloneToast(
        <Toast>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Your changes have been saved.</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe for the success variant', async () => {
      const { container } = renderStandaloneToast(
        <Toast variant="success">
          <ToastTitle>Published</ToastTitle>
          <ToastDescription>Your content is now live.</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe for the warning variant', async () => {
      const { container } = renderStandaloneToast(
        <Toast variant="warning">
          <ToastTitle>Storage warning</ToastTitle>
          <ToastDescription>You are approaching your storage limit.</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe for the danger variant', async () => {
      const { container } = renderStandaloneToast(
        <Toast variant="danger">
          <ToastTitle>Upload failed</ToastTitle>
          <ToastDescription>The file exceeded the size limit.</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe for the info variant', async () => {
      const { container } = renderStandaloneToast(
        <Toast variant="info">
          <ToastTitle>Background sync complete</ToastTitle>
          <ToastDescription>All changes are now up to date.</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe with a ToastAction present', async () => {
      const { container } = renderStandaloneToast(
        <Toast>
          <ToastTitle>File deleted</ToastTitle>
          <ToastDescription>The file has been moved to trash.</ToastDescription>
          <ToastAction altText="Undo the delete action">Undo</ToastAction>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe with title only', async () => {
      const { container } = renderStandaloneToast(
        <Toast>
          <ToastTitle>Saved</ToastTitle>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe with description only', async () => {
      const { container } = renderStandaloneToast(
        <Toast>
          <ToastDescription>Your session will expire soon.</ToastDescription>
          <ToastClose />
        </Toast>
      );

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });

    it('passes axe with two toasts open simultaneously', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ToastProvider>
          <TriggerToastButton
            title="First toast"
            description="First description"
            buttonLabel="Show first"
          />
          <TriggerToastButton
            title="Second toast"
            description="Second description"
            buttonLabel="Show second"
          />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: 'Show first' }));
      await user.click(screen.getByRole('button', { name: 'Show second' }));

      expect(await axe(container, axeOptions)).toHaveNoViolations();
    });
  });
});
