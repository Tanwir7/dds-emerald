import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Search } from 'lucide-react';
import { Alert } from './Alert';
import storyStyles from './Alert.stories.module.scss';
import { Button } from '../Button';
import { Field } from '../Field';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Alert is the full-width in-flow feedback block for persistent status, warning, success, and error messages.

### Accessibility contract

- Keyboard: the block itself is read-only; when dismissible, the close button is reachable with Tab and activates with Enter or Space.
- Screen readers: \`warning\` and \`danger\` use \`role="alert"\` with assertive live-region behavior; \`info\` and \`success\` use \`role="status"\` with polite announcements.
- Focus: the dismiss button uses the shared Emerald outline focus ring.
- Designers: use Alert when the message needs structure, width, or a persistent in-page container. Use \`align="start"\` when longer body content should top-align with the icon and dismiss affordance. Use InlineAlert for compact inline feedback.
- QA: verify role and \`aria-live\` mapping by intent, dismiss labeling, icon decoration, and axe results across all states.`;

const renderAlert = (args: ComponentProps<typeof Alert>) => (
  <div className={storyStyles.storyA11yScope}>
    <Alert {...args} />
  </div>
);

const buildAlertSource = ({
  intent = 'info',
  align = 'center',
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

  if (align !== 'center') {
    props.push(`align="${align}"`);
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
    align: {
      control: 'inline-radio',
      options: ['center', 'start'],
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
    icon: <Icon icon={Search} size="lg" />,
    children: 'This alert uses a custom decorative icon.',
  },
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Alert icon={<Icon icon={Search} size="lg" />}>',
          '  This alert uses a custom decorative icon.',
          '</Alert>'
        )
      ),
    },
  },
};

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <div className={storyStyles.storyA11yScope}>
        {visible ? (
          <Alert dismissible title="Connection issue" onDismiss={() => setVisible(false)}>
            Reconnect to continue syncing workspace changes.
          </Alert>
        ) : (
          <Stack gap="sm" align="start">
            <Text size="sm">Alert dismissed.</Text>
            <Button variant="secondary" onClick={() => setVisible(true)}>
              Show alert again
            </Button>
          </Stack>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'function Example() {',
          '  const [visible, setVisible] = useState(true);',
          '',
          '  return visible ? (',
          '    <Alert',
          '      dismissible',
          '      title="Connection issue"',
          '      onDismiss={() => setVisible(false)}',
          '    >',
          '      Reconnect to continue syncing workspace changes.',
          '    </Alert>',
          '  ) : (',
          '    <Button variant="secondary" onClick={() => setVisible(true)}>',
          '      Show alert again',
          '    </Button>',
          '  );',
          '}'
        )
      ),
    },
  },
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
      <Alert title="Migration still in progress" intent="warning" align="start">
        <Stack gap="xs">
          <Text size="sm">The system is moving project data into the new workspace structure.</Text>
          <Text size="sm">
            You can continue reviewing records, but avoid editing the same project until the
            migration completes.
          </Text>
        </Stack>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Alert title="Migration still in progress" intent="warning" align="start">',
          '  <Stack gap="xs">',
          '    <Text size="sm">The system is moving project data into the new workspace structure.</Text>',
          '    <Text size="sm">',
          '      You can continue reviewing records, but avoid editing the same project until the',
          '      migration completes.',
          '    </Text>',
          '  </Stack>',
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
