import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import storyStyles from './Input.stories.module.scss';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const renderField = (
  args: ComponentProps<typeof Input>,
  label = 'Email address',
  id = 'storybook-input'
) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyField}>
      <Label htmlFor={id}>{label}</Label>
      <Input {...args} id={id} />
    </div>
  </div>
);

const meta: Meta<typeof Input> = {
  title: 'Core Components/Input',
  component: Input,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Input>) => renderField(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    placeholder: 'name@example.com',
    size: 'md',
    invalid: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    invalid: {
      control: 'boolean',
    },
    startIcon: {
      table: {
        disable: true,
      },
    },
    endIcon: {
      table: {
        disable: true,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'name@example.com',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="email">Email address</Label>',
      '<Input id="email" placeholder="name@example.com" />'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-small-input">Small</Label>
          <Input id="storybook-small-input" size="sm" placeholder="Small input" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-medium-input">Medium</Label>
          <Input id="storybook-medium-input" size="md" placeholder="Medium input" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="storybook-large-input">Large</Label>
          <Input id="storybook-large-input" size="lg" placeholder="Large input" />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="small-input">Small</Label>',
      '<Input id="small-input" size="sm" placeholder="Small input" />',
      '',
      '<Label htmlFor="medium-input">Medium</Label>',
      '<Input id="medium-input" size="md" placeholder="Medium input" />',
      '',
      '<Label htmlFor="large-input">Large</Label>',
      '<Input id="large-input" size="lg" placeholder="Large input" />'
    )
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-invalid-input" required>
          Email address
        </Label>
        <Input
          id="storybook-invalid-input"
          invalid
          aria-invalid="true"
          aria-describedby="storybook-invalid-helper"
          defaultValue="ada"
        />
        <Text as="p" size="sm" color="danger" id="storybook-invalid-helper">
          Enter an email address with a domain.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="email" required>',
      '  Email address',
      '</Label>',
      '<Input',
      '  id="email"',
      '  invalid',
      '  aria-invalid="true"',
      '  aria-describedby="email-error"',
      '  defaultValue="ada"',
      '/>',
      '<Text as="p" size="sm" color="danger" id="email-error">',
      '  Enter an email address with a domain.',
      '</Text>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="disabled-input">Email address</Label>',
      '<Input id="disabled-input" disabled placeholder="Disabled input" />'
    )
  ),
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'DDS-1024',
  },
  render: (args: ComponentProps<typeof Input>) => renderField(args, 'Account ID'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="account-id">Account ID</Label>',
      '<Input id="account-id" readOnly defaultValue="DDS-1024" />'
    )
  ),
};

export const WithStartIcon: Story = {
  args: {
    placeholder: 'Search projects',
    startIcon: <Search aria-hidden="true" />,
  },
  render: (args: ComponentProps<typeof Input>) => renderField(args, 'Search'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="search-projects">Search</Label>',
      '<Input',
      '  id="search-projects"',
      '  placeholder="Search projects"',
      '  startIcon={<Search aria-hidden="true" />}',
      '/>'
    )
  ),
};

export const WithEndIcon: Story = {
  args: {
    defaultValue: 'Emerald',
    endIcon: <X aria-hidden="true" />,
  },
  render: (args: ComponentProps<typeof Input>) => renderField(args, 'Search'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="search-term">Search</Label>',
      '<Input',
      '  id="search-term"',
      '  defaultValue="Emerald"',
      '  endIcon={<X aria-hidden="true" />}',
      '/>'
    )
  ),
};

export const WithBothIcons: Story = {
  args: {
    defaultValue: 'Emerald',
    startIcon: <Search aria-hidden="true" />,
    endIcon: <X aria-hidden="true" />,
  },
  render: (args: ComponentProps<typeof Input>) => renderField(args, 'Search'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="search-term">Search</Label>',
      '<Input',
      '  id="search-term"',
      '  defaultValue="Emerald"',
      '  startIcon={<Search aria-hidden="true" />}',
      '  endIcon={<X aria-hidden="true" />}',
      '/>'
    )
  ),
};

export const FocusVisible: Story = {
  args: {
    placeholder: 'Tab to focus',
  },
  render: (args: ComponentProps<typeof Input>) => renderField(args, 'Focus visible example'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="focus-input">Focus visible example</Label>',
      '<Input id="focus-input" placeholder="Tab to focus" />'
    )
  ),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input');

    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected to find an input in the story canvas.');
    }

    input.focus();

    if (document.activeElement !== input) {
      throw new Error('Expected the input to receive focus.');
    }
  },
};

export const TypeIntoInput: Story = {
  args: {
    placeholder: 'Type a value',
  },
  render: (args: ComponentProps<typeof Input>) => renderField(args, 'Type into input example'),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="typing-input">Type into input example</Label>',
      '<Input id="typing-input" placeholder="Type a value" />'
    )
  ),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input');

    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected to find an input in the story canvas.');
    }

    input.value = 'Hello, Emerald';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    if (input.value !== 'Hello, Emerald') {
      throw new Error('Expected the input value to update.');
    }
  },
};
