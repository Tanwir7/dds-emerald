import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from '@storybook/testing-library';
import { Textarea } from './Textarea';
import storyStyles from './Textarea.stories.module.scss';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const renderField = (
  args: ComponentProps<typeof Textarea>,
  label = 'Message',
  id = 'storybook-textarea'
) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyField}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea {...args} id={id} />
    </div>
  </div>
);

const meta: Meta<typeof Textarea> = {
  title: 'Core Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Textarea>) => renderField(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    placeholder: 'Add a message',
    size: 'md',
    rows: 3,
    resize: 'vertical',
    invalid: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    resize: {
      control: 'inline-radio',
      options: ['none', 'vertical', 'both'],
    },
    invalid: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Add a message',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="message">Message</Label>',
      '<Textarea id="message" placeholder="Add a message" />'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-small-textarea">Small</Label>
          <Textarea id="storybook-small-textarea" size="sm" placeholder="Small textarea" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-medium-textarea">Medium</Label>
          <Textarea id="storybook-medium-textarea" size="md" placeholder="Medium textarea" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-large-textarea">Large</Label>
          <Textarea id="storybook-large-textarea" size="lg" placeholder="Large textarea" />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="small-message">Small</Label>',
      '<Textarea id="small-message" size="sm" placeholder="Small textarea" />',
      '',
      '<Label htmlFor="medium-message">Medium</Label>',
      '<Textarea id="medium-message" size="md" placeholder="Medium textarea" />',
      '',
      '<Label htmlFor="large-message">Large</Label>',
      '<Textarea id="large-message" size="lg" placeholder="Large textarea" />'
    )
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-invalid-textarea" required>
          Message
        </Label>
        <Textarea
          id="storybook-invalid-textarea"
          invalid
          aria-invalid="true"
          aria-describedby="storybook-invalid-helper"
          defaultValue=""
          placeholder="Add a message"
        />
        <Text as="p" size="sm" color="danger" id="storybook-invalid-helper">
          Enter a message before submitting.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="message" required>',
      '  Message',
      '</Label>',
      '<Textarea',
      '  id="message"',
      '  invalid',
      '  aria-invalid="true"',
      '  aria-describedby="message-error"',
      '  placeholder="Add a message"',
      '/>',
      '<Text as="p" size="sm" color="danger" id="message-error">',
      '  Enter a message before submitting.',
      '</Text>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="disabled-message">Message</Label>',
      '<Textarea id="disabled-message" disabled placeholder="Disabled textarea" />'
    )
  ),
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'This message can be reviewed but not edited.',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="readonly-message">Message</Label>',
      '<Textarea',
      '  id="readonly-message"',
      '  readOnly',
      '  defaultValue="This message can be reviewed but not edited."',
      '/>'
    )
  ),
};

export const ResizeNone: Story = {
  args: {
    resize: 'none',
    placeholder: 'Resize is disabled',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="fixed-message">Message</Label>',
      '<Textarea id="fixed-message" resize="none" placeholder="Resize is disabled" />'
    )
  ),
};

export const ResizeBoth: Story = {
  args: {
    resize: 'both',
    placeholder: 'Resize horizontally and vertically',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="resizable-message">Message</Label>',
      '<Textarea',
      '  id="resizable-message"',
      '  resize="both"',
      '  placeholder="Resize horizontally and vertically"',
      '/>'
    )
  ),
};

export const LongContent: Story = {
  args: {
    rows: 6,
    defaultValue:
      'Emerald components keep native form behavior intact while applying DDS tokens. Textarea preserves multiline editing, selection, and keyboard navigation without custom ARIA.\n\nUse linked helper text for instructions and specific error copy when validation fails.',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="long-message">Message</Label>',
      '<Textarea',
      '  id="long-message"',
      '  rows={6}',
      '  defaultValue={',
      '    "Emerald components keep native form behavior intact while applying DDS tokens. " +',
      '    "Textarea preserves multiline editing, selection, and keyboard navigation without custom ARIA.\\\\n\\\\n" +',
      '    "Use linked helper text for instructions and specific error copy when validation fails."',
      '  }',
      '/>'
    )
  ),
};

export const FocusVisible: Story = {
  args: {
    placeholder: 'Tab to focus',
  },
  render: (args: ComponentProps<typeof Textarea>) => renderField(args, 'Focus visible example'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="focus-message">Focus visible example</Label>',
      '<Textarea id="focus-message" placeholder="Tab to focus" />'
    )
  ),
  play: async ({ canvasElement }) => {
    const textarea = canvasElement.querySelector('textarea');

    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new Error('Expected to find a textarea in the story canvas.');
    }

    await userEvent.tab();

    if (document.activeElement !== textarea) {
      throw new Error('Expected the textarea to receive focus.');
    }
  },
};
