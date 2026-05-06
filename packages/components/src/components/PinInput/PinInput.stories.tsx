import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PinInput } from './PinInput';
import storyStyles from './PinInput.stories.module.scss';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const componentDescription = `PinInput renders a fixed set of single-character slots for OTP and PIN entry with automatic focus movement, paste distribution, and completion callbacks.

### Accessibility contract

- Keyboard: Tab reaches the first slot, ArrowLeft and ArrowRight move between slots, and Backspace clears the current slot or retreats to clear the previous slot.
- Screen readers: each slot announces its position as "PIN digit N of M" and the wrapper exposes a grouped name through its aria-label.
- Focus: auto-advance occurs only after a valid character is entered, paste preserves a predictable landing point, and disabled slots leave the tab order entirely.
- Designers: always pair PinInput with an external visible label and supporting helper or error text in the surrounding field pattern.
- QA: verify one-time-code autofill on the first slot, paste distribution, invalid announcements, and controlled plus uncontrolled completion flows.`;

const renderField = (
  args: ComponentProps<typeof PinInput>,
  label = 'Verification code',
  id = 'storybook-pin-input'
) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyField}>
      <Label htmlFor={id} disabled={args.disabled}>
        {label}
      </Label>
      <PinInput {...args} id={id} />
    </div>
  </div>
);

const ControlledExample = () => {
  const [value, setValue] = useState('');

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-controlled-pin">Verification code</Label>
        <PinInput
          id="storybook-controlled-pin"
          length={6}
          value={value}
          onChange={setValue}
          onComplete={setValue}
        />
        <Text as="p" size="sm" color="muted">
          Current value: {value || 'empty'}
        </Text>
      </div>
    </div>
  );
};

const meta: Meta<typeof PinInput> = {
  title: 'Core Components/PinInput',
  component: PinInput,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof PinInput>) => renderField(args),
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
    length: 6,
    type: 'numeric',
    size: 'md',
    invalid: false,
    disabled: false,
    mask: false,
  },
  argTypes: {
    length: {
      control: {
        type: 'number',
        min: 1,
        max: 8,
        step: 1,
      },
    },
    type: {
      control: 'inline-radio',
      options: ['numeric', 'alphanumeric'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    invalid: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    mask: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof PinInput>;

export const Default: Story = {
  args: {
    length: 6,
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="verification-code">Verification code</Label>',
      '<PinInput id="verification-code" length={6} />'
    )
  ),
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState("");',
      '',
      '<Label htmlFor="verification-code">Verification code</Label>',
      '<PinInput',
      '  id="verification-code"',
      '  length={6}',
      '  value={value}',
      '  onChange={setValue}',
      '  onComplete={setValue}',
      '/>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyField}>
          <Label htmlFor="pin-small">Small</Label>
          <PinInput id="pin-small" size="sm" length={4} />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="pin-medium">Medium</Label>
          <PinInput id="pin-medium" size="md" length={4} />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="pin-large">Large</Label>
          <PinInput id="pin-large" size="lg" length={4} />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="pin-small">Small</Label>',
      '<PinInput id="pin-small" size="sm" length={4} />',
      '',
      '<Label htmlFor="pin-medium">Medium</Label>',
      '<PinInput id="pin-medium" size="md" length={4} />',
      '',
      '<Label htmlFor="pin-large">Large</Label>',
      '<PinInput id="pin-large" size="lg" length={4} />'
    )
  ),
};

export const Alphanumeric: Story = {
  args: {
    type: 'alphanumeric',
    length: 6,
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="backup-code">Backup code</Label>',
      '<PinInput id="backup-code" type="alphanumeric" length={6} />'
    )
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="invalid-pin" required>
          Verification code
        </Label>
        <PinInput
          id="invalid-pin"
          invalid
          aria-describedby="invalid-pin-helper"
          defaultValue="12"
          length={6}
        />
        <Text as="p" size="sm" color="danger" id="invalid-pin-helper">
          Enter the full six-digit code from your authenticator app.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="verification-code" required>',
      '  Verification code',
      '</Label>',
      '<PinInput',
      '  id="verification-code"',
      '  invalid',
      '  aria-describedby="verification-code-error"',
      '  defaultValue="12"',
      '  length={6}',
      '/>',
      '<Text as="p" size="sm" color="danger" id="verification-code-error">',
      '  Enter the full six-digit code from your authenticator app.',
      '</Text>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '123456',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="disabled-pin" disabled>Verification code</Label>',
      '<PinInput id="disabled-pin" disabled defaultValue="123456" />'
    )
  ),
};
