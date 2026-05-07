import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Label } from '../Label';
import { Text } from '../Text';
import { PasswordInput } from './PasswordInput';
import storyStyles from './PasswordInput.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const componentDescription = `PasswordInput composes Input with a trailing visibility toggle while keeping the public API limited to password-field concerns.

### Accessibility contract

- Keyboard: Tab reaches the input first and the visibility toggle second; Enter and Space activate the toggle.
- Screen readers: the toggle announces itself as "Show password" or "Hide password" as state changes.
- Focus: the toggle keeps its own focus ring and remains operable for disabled and read-only prefilled fields.
- Designers: provide an external visible label with Label and use helper and error text through normal input relationships.
- QA: verify toggle state, form-submission prevention, disabled and read-only behavior, and visible-label variants.`;

const renderField = (
  args: ComponentProps<typeof PasswordInput>,
  label = 'Password',
  id = 'storybook-password-input'
) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyField}>
      <Label htmlFor={id} disabled={args.disabled}>
        {label}
      </Label>
      <PasswordInput {...args} id={id} />
    </div>
  </div>
);

const meta: Meta<typeof PasswordInput> = {
  title: 'Core Components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof PasswordInput>) => renderField(args),
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
    placeholder: 'Enter password',
    size: 'md',
    invalid: false,
    showToggleLabel: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    invalid: {
      control: 'boolean',
    },
    showToggleLabel: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    placeholder: 'Enter password',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="password">Password</Label>',
      '<PasswordInput id="password" placeholder="Enter password" />'
    )
  ),
};

export const Visible: Story = {
  args: {
    defaultValue: 'hunter2',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="visible-password">Password</Label>',
      '<PasswordInput id="visible-password" defaultValue="hunter2" />'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyField}>
          <Label htmlFor="password-small">Small</Label>
          <PasswordInput id="password-small" size="sm" placeholder="Small password" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="password-medium">Medium</Label>
          <PasswordInput id="password-medium" size="md" placeholder="Medium password" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="password-large">Large</Label>
          <PasswordInput id="password-large" size="lg" placeholder="Large password" />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="password-small">Small</Label>',
      '<PasswordInput id="password-small" size="sm" placeholder="Small password" />',
      '',
      '<Label htmlFor="password-medium">Medium</Label>',
      '<PasswordInput id="password-medium" size="md" placeholder="Medium password" />',
      '',
      '<Label htmlFor="password-large">Large</Label>',
      '<PasswordInput id="password-large" size="lg" placeholder="Large password" />'
    )
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="invalid-password" required>
          Password
        </Label>
        <PasswordInput
          id="invalid-password"
          invalid
          aria-invalid="true"
          aria-describedby="invalid-password-helper"
          defaultValue="short"
        />
        <Text as="p" size="sm" color="danger" id="invalid-password-helper">
          Use at least 12 characters.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="password" required>',
      '  Password',
      '</Label>',
      '<PasswordInput',
      '  id="password"',
      '  invalid',
      '  aria-invalid="true"',
      '  aria-describedby="password-error"',
      '  defaultValue="short"',
      '/>',
      '<Text as="p" size="sm" color="danger" id="password-error">',
      '  Use at least 12 characters.',
      '</Text>'
    )
  ),
};

export const ShowToggleLabel: Story = {
  args: {
    showToggleLabel: true,
  },
  render: (args: ComponentProps<typeof PasswordInput>) => renderField(args),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="password">Password</Label>',
      '<PasswordInput id="password" placeholder="Enter password" showToggleLabel />'
    )
  ),
};
