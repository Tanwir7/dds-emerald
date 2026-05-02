import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Button } from '../Button';
import { Text } from '../Text';
import { ToastProvider, type ToastOptions, useToast } from './Toast';
import storyStyles from './Toast.stories.module.scss';

const componentDescription = `Render \`<ToastProvider>\` once at the application root so \`useToast()\` can enqueue notifications from anywhere in the tree. The provider renders the viewport internally, so consumers only need to wrap the app once.

### Accessibility contract

- Keyboard: press \`F8\` to move focus into the toast region, then use \`Tab\` and \`Shift+Tab\` to move between any interactive controls inside a toast.
- Screen readers: non-danger toasts announce with polite live-region behavior; \`variant="danger"\` uses assertive announcement for immediate error feedback.
- Focus: Toasts never trap focus and auto-dismiss pauses while the pointer or keyboard focus is inside the toast.
- Designers: use Toast for transient status updates tied to an action or event. Persistent feedback belongs in \`Alert\` or \`InlineAlert\`.
- QA: verify auto-dismiss timing, close-button dismissal, action button callbacks, swipe dismissal, and polite versus assertive announcements.`;

const showToastSource = (optionsLines: string[]) =>
  storySource(
    '<ToastProvider>',
    '  <Example />',
    '</ToastProvider>',
    '',
    'const Example = () => {',
    '  const { toast } = useToast();',
    '',
    '  return (',
    '    <Button',
    '      onClick={() =>',
    '        toast({',
    ...optionsLines.map((line) => `          ${line}`),
    '        })',
    '      }',
    '    >',
    '      Show notification',
    '    </Button>',
    '  );',
    '};'
  );

const variantButtons = [
  {
    label: 'Default',
    options: {
      title: 'File saved',
      description: 'Your changes have been saved.',
      variant: 'default',
    } satisfies ToastOptions,
  },
  {
    label: 'Success',
    options: {
      title: 'Published',
      description: 'The release is now live.',
      variant: 'success',
    } satisfies ToastOptions,
  },
  {
    label: 'Warning',
    options: {
      title: 'Storage nearly full',
      description: 'You are approaching your workspace limit.',
      variant: 'warning',
    } satisfies ToastOptions,
  },
  {
    label: 'Danger',
    options: {
      title: 'Upload failed',
      description: 'The file exceeded the size limit.',
      variant: 'danger',
    } satisfies ToastOptions,
  },
  {
    label: 'Info',
    options: {
      title: 'Sync complete',
      description: 'All changes are now up to date.',
      variant: 'info',
    } satisfies ToastOptions,
  },
];

const ToastTrigger = ({
  buttonLabel = 'Show notification',
  toastOptions,
}: {
  buttonLabel?: string;
  toastOptions: ToastOptions;
}) => {
  const { toast } = useToast();

  return <Button onClick={() => toast(toastOptions)}>{buttonLabel}</Button>;
};

const WithActionTrigger = ({ onUndo }: { onUndo: () => void }) => {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: 'File deleted',
          description: 'The file has been moved to trash.',
          action: {
            label: 'Undo',
            altText: 'Undo deleting the file',
            onClick: () => {
              onUndo();
              toast({ title: 'Action undone' });
            },
          },
        })
      }
    >
      Show notification
    </Button>
  );
};

const MultipleToastsTrigger = () => {
  const { toast } = useToast();
  const countRef = React.useRef(0);

  return (
    <Button
      onClick={() => {
        countRef.current += 1;
        toast({
          title: `Notification ${countRef.current}`,
          description: 'A new toast was appended to the stack.',
        });
      }}
    >
      Add toast
    </Button>
  );
};

const meta: Meta<typeof ToastProvider> = {
  title: 'Core Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ToastProvider>;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ToastTrigger
        toastOptions={{
          title: 'File saved',
          description: 'Your changes have been saved.',
        }}
      />
    </div>
  ),
  parameters: storySourceParameters(
    showToastSource(["title: 'File saved',", "description: 'Your changes have been saved.',"])
  ),
};

export const Variants: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        {variantButtons.map((item) => (
          <ToastTrigger key={item.label} buttonLabel={item.label} toastOptions={item.options} />
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource('<ToastProvider>', '  <VariantButtons />', '</ToastProvider>')
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ToastTrigger buttonLabel="Show notification" toastOptions={{ title: 'File saved' }} />
    </div>
  ),
  parameters: storySourceParameters(showToastSource(["title: 'File saved',"])),
};

export const DescriptionOnly: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ToastTrigger
        buttonLabel="Show notification"
        toastOptions={{ description: 'Your session will expire in five minutes.' }}
      />
    </div>
  ),
  parameters: storySourceParameters(
    showToastSource(["description: 'Your session will expire in five minutes.',"])
  ),
};

export const WithAction: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <WithActionTrigger onUndo={fn()} />
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<ToastProvider>',
      '  <Example />',
      '</ToastProvider>',
      '',
      'const Example = () => {',
      '  const { toast } = useToast();',
      '',
      '  return (',
      '    <Button',
      '      onClick={() =>',
      '        toast({',
      "          title: 'File deleted',",
      "          description: 'The file has been moved to trash.',",
      '          action: {',
      "            label: 'Undo',",
      "            altText: 'Undo deleting the file',",
      '            onClick: () => {',
      "              toast({ title: 'Action undone' });",
      '            },',
      '          },',
      '        })',
      '      }',
      '    >',
      '      Show notification',
      '    </Button>',
      '  );',
      '};'
    )
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ToastTrigger
        toastOptions={{
          title: 'Deployment queued',
          description:
            'The release has been scheduled and will begin after the current maintenance window ends. You can keep working while the job remains in progress.',
        }}
      />
    </div>
  ),
  parameters: storySourceParameters(
    showToastSource([
      "title: 'Deployment queued',",
      "description: 'The release has been scheduled and will begin after the current maintenance window ends. You can keep working while the job remains in progress.',",
    ])
  ),
};

export const CustomDuration: Story = {
  render: () => (
    <div className={`${storyStyles.storyA11yScope} ${storyStyles.storyStack}`}>
      <ToastTrigger
        toastOptions={{
          title: 'Temporary note',
          description: 'This toast dismisses after 2 seconds.',
          duration: 2000,
        }}
      />
      <Text as="p" size="sm" className={storyStyles.storyNote ?? ''}>
        This toast dismisses after 2 seconds.
      </Text>
    </div>
  ),
  parameters: storySourceParameters(
    showToastSource([
      "title: 'Temporary note',",
      "description: 'This toast dismisses after 2 seconds.',",
      'duration: 2000,',
    ])
  ),
};

export const Persistent: Story = {
  render: () => (
    <div className={`${storyStyles.storyA11yScope} ${storyStyles.storyStack}`}>
      <ToastTrigger
        toastOptions={{
          title: 'Review required',
          description: 'This toast will not auto-dismiss.',
          duration: Infinity,
        }}
      />
      <Text as="p" size="sm" className={storyStyles.storyNote ?? ''}>
        This toast will not auto-dismiss. Only the close button dismisses it.
      </Text>
    </div>
  ),
  parameters: storySourceParameters(
    showToastSource([
      "title: 'Review required',",
      "description: 'This toast will not auto-dismiss.',",
      'duration: Infinity,',
    ])
  ),
};

export const MultipleToasts: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MultipleToastsTrigger />
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<ToastProvider>',
      '  <Example />',
      '</ToastProvider>',
      '',
      'const Example = () => {',
      '  const { toast } = useToast();',
      '  const countRef = React.useRef(0);',
      '',
      '  return (',
      '    <Button',
      '      onClick={() => {',
      '        countRef.current += 1;',
      '        toast({',
      '          title: `Notification ${countRef.current}`,',
      "          description: 'A new toast was appended to the stack.',",
      '        });',
      '      }}',
      '    >',
      '      Add toast',
      '    </Button>',
      '  );',
      '};'
    )
  ),
};

export const DangerAssertive: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ToastTrigger
        toastOptions={{
          title: 'Upload failed',
          description: 'The file exceeded the size limit.',
          variant: 'danger',
        }}
      />
    </div>
  ),
  parameters: storySourceParameters(
    showToastSource([
      "title: 'Upload failed',",
      "description: 'The file exceeded the size limit.',",
      "variant: 'danger',",
    ])
  ),
};

export const ShowAndDismiss: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ToastTrigger
        toastOptions={{
          title: 'File saved',
          description: 'Your changes have been saved.',
        }}
      />
    </div>
  ),
  parameters: storySourceParameters('<ToastProvider><Example /></ToastProvider>'),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /show notification/i });
    await userEvent.click(button);
    const closeButton = await within(document.body).findByRole('button', {
      name: /dismiss notification/i,
    });
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(within(document.body).queryByText('File saved')).not.toBeInTheDocument();
    });
  },
};

export const ActionFires: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <WithActionTrigger onUndo={fn()} />
    </div>
  ),
  parameters: storySourceParameters('<ToastProvider><Example /></ToastProvider>'),
  play: async ({ canvasElement }) => {
    const triggerButton = within(canvasElement).getByRole('button', { name: /show notification/i });
    await userEvent.click(triggerButton);
    await waitFor(() => {
      expect(within(document.body).queryAllByText('File deleted').length).toBeGreaterThan(0);
    });

    const undoAction = await within(document.body).findByText(/^Undo$/, {
      selector: 'button, button *',
    });

    await userEvent.click(undoAction);

    await waitFor(() => {
      expect(within(document.body).queryAllByText('Action undone').length).toBeGreaterThan(0);
    });
  },
};
