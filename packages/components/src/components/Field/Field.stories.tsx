import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from './Field';
import storyStyles from './Field.stories.module.scss';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { storySource, storySourceParameters } from '../../utils/storySource';

const renderField = (args: ComponentProps<typeof Field>) => (
  <div className={storyStyles.storyA11yScope}>
    <Field {...args} />
  </div>
);

const meta: Meta<typeof Field> = {
  title: 'Grouped Components/Field',
  component: Field,
  tags: ['autodocs'],
  render: (args) => renderField(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    label: 'Email address',
    children: <Input placeholder="name@example.com" />,
  },
  argTypes: {
    helperIntent: {
      control: 'inline-radio',
      options: ['default', 'error', 'success'],
    },
    layout: {
      control: 'inline-radio',
      options: ['stack', 'inline'],
    },
    children: {
      table: {
        disable: true,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Field>;

export const StackDefault: Story = {
  args: {
    label: 'Email address',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address">',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const StackWithInstruction: Story = {
  args: {
    label: 'Email address',
    instruction: 'Use your work email address.',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" instruction="Use your work email address.">',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const StackWithHelper: Story = {
  args: {
    label: 'Email address',
    helper: 'We will only use this for account updates.',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" helper="We will only use this for account updates.">',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const StackError: Story = {
  args: {
    label: 'Email address',
    helper: 'Enter an email address with a domain.',
    helperIntent: 'error',
    children: <Input invalid defaultValue="ada" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field',
      '  label="Email address"',
      '  helper="Enter an email address with a domain."',
      '  helperIntent="error"',
      '>',
      '  <Input invalid defaultValue="ada" />',
      '</Field>'
    )
  ),
};

export const StackSuccess: Story = {
  args: {
    label: 'Email address',
    helper: 'Email is available.',
    helperIntent: 'success',
    children: <Input defaultValue="ada@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" helper="Email is available." helperIntent="success">',
      '  <Input defaultValue="ada@example.com" />',
      '</Field>'
    )
  ),
};

export const StackRequired: Story = {
  args: {
    label: 'Email address',
    required: true,
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" required>',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const StackDisabled: Story = {
  args: {
    label: 'Email address',
    disabled: true,
    children: <Input placeholder="Disabled input" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" disabled>',
      '  <Input placeholder="Disabled input" />',
      '</Field>'
    )
  ),
};

export const StackAllSlots: Story = {
  args: {
    label: 'Email address',
    instruction: 'Use your work email address.',
    helper: 'We will only use this for account updates.',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field',
      '  label="Email address"',
      '  instruction="Use your work email address."',
      '  helper="We will only use this for account updates."',
      '>',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const StackWithTextarea: Story = {
  args: {
    label: 'Message',
    instruction: 'Keep the message under 500 characters.',
    children: <Textarea placeholder="Add a message" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Message" instruction="Keep the message under 500 characters.">',
      '  <Textarea placeholder="Add a message" />',
      '</Field>'
    )
  ),
};

export const InlineDefault: Story = {
  args: {
    label: 'Email address',
    layout: 'inline',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" layout="inline">',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const InlineWithInstruction: Story = {
  args: {
    label: 'Email address',
    layout: 'inline',
    instruction: 'Use your work email address.',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" layout="inline" instruction="Use your work email address.">',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const InlineAllSlots: Story = {
  args: {
    label: 'Email address',
    layout: 'inline',
    instruction: 'Use your work email address.',
    helper: 'We will only use this for account updates.',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field',
      '  label="Email address"',
      '  layout="inline"',
      '  instruction="Use your work email address."',
      '  helper="We will only use this for account updates."',
      '>',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const InlineError: Story = {
  args: {
    label: 'Email address',
    layout: 'inline',
    helper: 'Enter an email address with a domain.',
    helperIntent: 'error',
    children: <Input invalid defaultValue="ada" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field',
      '  label="Email address"',
      '  layout="inline"',
      '  helper="Enter an email address with a domain."',
      '  helperIntent="error"',
      '>',
      '  <Input invalid defaultValue="ada" />',
      '</Field>'
    )
  ),
};

export const InlineLabelWidth: Story = {
  args: {
    label: 'Email address',
    layout: 'inline',
    inlineLabelWidth: '200px',
    children: <Input placeholder="name@example.com" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address" layout="inline" inlineLabelWidth="200px">',
      '  <Input placeholder="name@example.com" />',
      '</Field>'
    )
  ),
};

export const FocusInteraction: Story = {
  args: {
    label: 'Email address',
    children: <Input placeholder="Tab to focus" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Email address">',
      '  <Input placeholder="Tab to focus" />',
      '</Field>'
    )
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const ErrorAnnouncement: Story = {
  args: {
    label: 'Email address',
    helper: 'Enter an email address with a domain.',
    helperIntent: 'error',
    children: <Input invalid defaultValue="ada" />,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field',
      '  label="Email address"',
      '  helper="Enter an email address with a domain."',
      '  helperIntent="error"',
      '>',
      '  <Input invalid defaultValue="ada" />',
      '</Field>'
    )
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby');
  },
};
