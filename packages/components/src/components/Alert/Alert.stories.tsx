import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Alert } from './Alert';
import storyStyles from './Alert.stories.module.scss';
import { Field } from '../Field';
import { Input } from '../Input';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Alert is the full-width in-flow feedback block for persistent status, warning, success, and error messages.

### Accessibility contract

- Keyboard: the block itself is read-only; when dismissible, the close button is reachable with Tab and activates with Enter or Space.
- Screen readers: \`warning\` and \`danger\` use \`role="alert"\` with assertive live-region behavior; \`info\` and \`success\` use \`role="status"\` with polite announcements.
- Focus: the dismiss button uses the shared Emerald outline focus ring.
- Designers: use Alert when the message needs structure, width, or a persistent in-page container. Use InlineAlert for compact inline feedback.
- QA: verify role and \`aria-live\` mapping by intent, dismiss labeling, icon decoration, and axe results across all states.`;

const renderAlert = (args: ComponentProps<typeof Alert>) => (
  <div className={storyStyles.storyA11yScope}>
    <Alert {...args} />
  </div>
);

const buildAlertSource = ({
  intent = 'info',
  title,
  dismissible = false,
  showIcon = true,
  icon,
  children,
}: ComponentProps<typeof Alert>) => {
  const props: string[] = [];

  if (intent !== 'info') {
    props.push(`intent="${intent}"`);
  }

  if (title) {
    props.push(`title="${title}"`);
  }

  if (dismissible) {
    props.push('dismissible');
  }

  if (!showIcon) {
    props.push('showIcon={false}');
  }

  if (icon) {
    props.push('icon={<CustomIcon />}');
  }

  const propString = props.length > 0 ? ` ${props.join(' ')}` : '';

  if (!children) {
    return `<Alert${propString} />`;
  }

  return `<Alert${propString}>${children}</Alert>`;
};

const meta: Meta<typeof Alert> = {
  title: 'Core Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  render: (args) => renderAlert(args),
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
  args: {
    children: 'This is an informational alert.',
    intent: 'info',
  },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'danger'],
    },
    icon: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    children: 'This is an informational alert.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      children: 'This is an informational alert.',
    })
  ),
};

export const Success: Story = {
  args: {
    intent: 'success',
    children: 'Your settings were saved successfully.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      intent: 'success',
      children: 'Your settings were saved successfully.',
    })
  ),
};

export const Warning: Story = {
  args: {
    intent: 'warning',
    children: 'Storage is nearly full. Archive older reports soon.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      intent: 'warning',
      children: 'Storage is nearly full. Archive older reports soon.',
    })
  ),
};

export const Danger: Story = {
  args: {
    intent: 'danger',
    children: 'Payment failed. Update the billing method and try again.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      intent: 'danger',
      children: 'Payment failed. Update the billing method and try again.',
    })
  ),
};

export const WithTitle: Story = {
  args: {
    title: 'Action required',
    children: 'Review the highlighted fields before submitting this request.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      title: 'Action required',
      children: 'Review the highlighted fields before submitting this request.',
    })
  ),
};

export const TitleOnly: Story = {
  args: {
    title: 'Profile updated successfully',
    children: undefined,
  },
  parameters: {
    docs: {
      source: storySourceBlock('<Alert title="Profile updated successfully" />'),
    },
  },
};

export const BodyOnly: Story = {
  args: {
    children: 'This alert uses body content without a separate title.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      children: 'This alert uses body content without a separate title.',
    })
  ),
};

const AlertCustomIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const NoIcon: Story = {
  args: {
    showIcon: false,
    children: 'This message relies on text only.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      showIcon: false,
      children: 'This message relies on text only.',
    })
  ),
};

export const CustomIcon: Story = {
  args: {
    icon: <AlertCustomIcon />,
    children: 'This alert uses a custom decorative icon.',
  },
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const CustomIcon = () => (',
          '  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">',
          '    <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" />',
          '    <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />',
          '  </svg>',
          ');',
          '',
          '<Alert icon={<CustomIcon />}>This alert uses a custom decorative icon.</Alert>'
        )
      ),
    },
  },
};

export const Dismissible: Story = {
  args: {
    dismissible: true,
    title: 'Connection issue',
    children: 'Reconnect to continue syncing workspace changes.',
  },
  parameters: storySourceParameters(
    buildAlertSource({
      dismissible: true,
      title: 'Connection issue',
      children: 'Reconnect to continue syncing workspace changes.',
    })
  ),
};

export const AllIntents: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Alert>General account information is available.</Alert>
        <Alert intent="success">The deployment finished successfully.</Alert>
        <Alert intent="warning">This API token will expire in 3 days.</Alert>
        <Alert intent="danger">We could not complete the import.</Alert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Alert>General account information is available.</Alert>',
          '  <Alert intent="success">The deployment finished successfully.</Alert>',
          '  <Alert intent="warning">This API token will expire in 3 days.</Alert>',
          '  <Alert intent="danger">We could not complete the import.</Alert>',
          '</>'
        )
      ),
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Alert title="Migration still in progress" intent="warning">
        <div className={storyStyles.storyParagraphs}>
          <p>The system is moving project data into the new workspace structure.</p>
          <p>
            You can continue reviewing records, but avoid editing the same project until the
            migration completes.
          </p>
        </div>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Alert title="Migration still in progress" intent="warning">',
          '  <p>The system is moving project data into the new workspace structure.</p>',
          '  <p>',
          '    You can continue reviewing records, but avoid editing the same project until the',
          '    migration completes.',
          '  </p>',
          '</Alert>'
        )
      ),
    },
  },
};

export const DismissInteraction: Story = {
  args: {
    dismissible: true,
    title: 'Connection issue',
    children: 'Reconnect to continue syncing workspace changes.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: /dismiss/i });

    await userEvent.tab();
    await expect(dismiss).toHaveFocus();
    await userEvent.keyboard('{Enter}');
  },
  parameters: storySourceParameters(
    buildAlertSource({
      dismissible: true,
      title: 'Connection issue',
      children: 'Reconnect to continue syncing workspace changes.',
    })
  ),
};

export const InFormContext: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Field label="Email address" helper="Use your work email address.">
          <Input defaultValue="ada" invalid />
        </Field>
        <Alert intent="danger" title="Please review this form">
          Enter an email address with a valid domain before continuing.
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Field label="Email address" helper="Use your work email address.">',
          '    <Input defaultValue="ada" invalid />',
          '  </Field>',
          '  <Alert intent="danger" title="Please review this form">',
          '    Enter an email address with a valid domain before continuing.',
          '  </Alert>',
          '</>'
        )
      ),
    },
  },
};
