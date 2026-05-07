import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../Label';
import { Text } from '../Text';
import { SearchInput } from './SearchInput';
import storyStyles from './SearchInput.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const componentDescription = `SearchInput composes Input with a semantic search role, a leading search affordance, and an optional trailing clear action.

### Accessibility contract

- Keyboard: Tab reaches the search field first and the clear button second when present; Enter and Space activate the clear button.
- Screen readers: consumers must provide a visible label or an aria-label or aria-labelledby; the clear action announces itself as "Clear search" and loading announces "Searching…".
- Focus: clearing returns focus to the search field so keyboard users keep their place.
- Designers: provide helper or error text through the surrounding field pattern and avoid relying on placeholder text as the only label.
- QA: verify native search cancel suppression, loading plus clear-button coexistence, and disabled and read-only states.`;

const renderField = (
  args: ComponentProps<typeof SearchInput>,
  label = 'Search',
  id = 'storybook-search-input'
) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyField}>
      <Label htmlFor={id} disabled={args.disabled}>
        {label}
      </Label>
      <SearchInput {...args} id={id} />
    </div>
  </div>
);

const ControlledClearableExample = () => {
  const [value, setValue] = useState('Emerald');

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="storybook-clearable-search">Search</Label>
        <SearchInput
          id="storybook-clearable-search"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onClear={() => setValue('')}
          placeholder="Search projects"
        />
      </div>
    </div>
  );
};

const meta: Meta<typeof SearchInput> = {
  title: 'Core Components/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof SearchInput>) => renderField(args),
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
    placeholder: 'Search projects',
    size: 'md',
    invalid: false,
    clearable: true,
    loading: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    invalid: {
      control: 'boolean',
    },
    clearable: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: 'Search projects',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="project-search">Search</Label>',
      '<SearchInput id="project-search" placeholder="Search projects" />'
    )
  ),
};

export const Clearable: Story = {
  render: () => <ControlledClearableExample />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState("Emerald");',
      '',
      '<Label htmlFor="project-search">Search</Label>',
      '<SearchInput',
      '  id="project-search"',
      '  value={value}',
      '  onChange={(event) => setValue(event.currentTarget.value)}',
      '  onClear={() => setValue("")}',
      '  placeholder="Search projects"',
      '/>'
    )
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    defaultValue: 'emerald',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="search-loading">Search</Label>',
      '<SearchInput id="search-loading" loading defaultValue="emerald" />'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyField}>
          <Label htmlFor="search-small">Small</Label>
          <SearchInput id="search-small" size="sm" placeholder="Small search" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="search-medium">Medium</Label>
          <SearchInput id="search-medium" size="md" placeholder="Medium search" />
        </div>
        <div className={storyStyles.storyField}>
          <Label htmlFor="search-large">Large</Label>
          <SearchInput id="search-large" size="lg" placeholder="Large search" />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="search-small">Small</Label>',
      '<SearchInput id="search-small" size="sm" placeholder="Small search" />',
      '',
      '<Label htmlFor="search-medium">Medium</Label>',
      '<SearchInput id="search-medium" size="md" placeholder="Medium search" />',
      '',
      '<Label htmlFor="search-large">Large</Label>',
      '<SearchInput id="search-large" size="lg" placeholder="Large search" />'
    )
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label htmlFor="invalid-search" required>
          Search
        </Label>
        <SearchInput
          id="invalid-search"
          invalid
          aria-invalid="true"
          aria-describedby="invalid-search-helper"
          defaultValue="em"
        />
        <Text as="p" size="sm" color="danger" id="invalid-search-helper">
          Enter at least three characters to search the project index.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="search" required>',
      '  Search',
      '</Label>',
      '<SearchInput',
      '  id="search"',
      '  invalid',
      '  aria-invalid="true"',
      '  aria-describedby="search-error"',
      '  defaultValue="em"',
      '/>',
      '<Text as="p" size="sm" color="danger" id="search-error">',
      '  Enter at least three characters to search the project index.',
      '</Text>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Emerald',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="disabled-search" disabled>Search</Label>',
      '<SearchInput id="disabled-search" disabled defaultValue="Emerald" />'
    )
  ),
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'DDS component catalog',
  },
  parameters: storySourceParameters(
    storySource(
      '<Label htmlFor="readonly-search">Search</Label>',
      '<SearchInput id="readonly-search" readOnly defaultValue="DDS component catalog" />'
    )
  ),
};
