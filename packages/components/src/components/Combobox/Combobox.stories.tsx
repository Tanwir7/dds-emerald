import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import React from 'react';
import { Combobox, type ComboboxOption } from './Combobox';
import { Field } from '../Field';
import storyStyles from './Combobox.stories.module.scss';
import { storySourceParameters } from '../../utils/storySource';

const frameworkOptions: ComboboxOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'solid', label: 'Solid', group: 'Frontend' },
  { value: 'next', label: 'Next.js', group: 'Meta-frameworks' },
  { value: 'nuxt', label: 'Nuxt', group: 'Meta-frameworks' },
  { value: 'remix', label: 'Remix', group: 'Meta-frameworks' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'deno', label: 'Deno', group: 'Backend' },
];

const manyOptions: ComboboxOption[] = Array.from({ length: 50 }, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}));

const meta: Meta<typeof Combobox> = {
  title: 'Core Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} placeholder="Select a framework" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={frameworkOptions} placeholder="Select a framework" />'
  ),
};

export const WithValue: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} defaultValue="react" />
    </div>
  ),
  parameters: storySourceParameters('<Combobox options={frameworkOptions} defaultValue="react" />'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Combobox options={frameworkOptions} size="sm" placeholder="Small combobox" />
        <Combobox options={frameworkOptions} size="md" placeholder="Medium combobox" />
        <Combobox options={frameworkOptions} size="lg" placeholder="Large combobox" />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    [
      '<>',
      '  <Combobox options={frameworkOptions} size="sm" placeholder="Small combobox" />',
      '  <Combobox options={frameworkOptions} size="md" placeholder="Medium combobox" />',
      '  <Combobox options={frameworkOptions} size="lg" placeholder="Large combobox" />',
      '</>',
    ].join('\n')
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} invalid placeholder="Invalid combobox" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={frameworkOptions} invalid placeholder="Invalid combobox" />'
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} disabled defaultValue="react" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={frameworkOptions} disabled defaultValue="react" />'
  ),
};

export const Clearable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} clearable defaultValue="react" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={frameworkOptions} clearable defaultValue="react" />'
  ),
};

export const Loading: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} loading placeholder="Loading frameworks" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={frameworkOptions} loading placeholder="Loading frameworks" />'
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={[]} emptyMessage="No frameworks found" />
    </div>
  ),
  parameters: storySourceParameters('<Combobox options={[]} emptyMessage="No frameworks found" />'),
};

export const WithGroups: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={frameworkOptions} placeholder="Grouped frameworks" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={frameworkOptions} placeholder="Grouped frameworks" />'
  ),
};

export const ManyOptions: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Combobox options={manyOptions} placeholder="Select an option" />
    </div>
  ),
  parameters: storySourceParameters(
    '<Combobox options={manyOptions} placeholder="Select an option" />'
  ),
};

export const AsyncSearch: Story = {
  render: () => {
    const AsyncSearchStory = () => {
      const [filteredOptions, setFilteredOptions] = React.useState(frameworkOptions);
      const [loading, setLoading] = React.useState(false);

      return (
        <Combobox
          options={filteredOptions}
          loading={loading}
          onInputChange={(query) => {
            setLoading(true);
            window.setTimeout(() => {
              const normalizedQuery = query.trim().toLowerCase();
              setFilteredOptions(
                normalizedQuery.length === 0
                  ? frameworkOptions
                  : frameworkOptions.filter((option) =>
                      option.label.toLowerCase().includes(normalizedQuery)
                    )
              );
              setLoading(false);
            }, 300);
          }}
          placeholder="Search frameworks"
        />
      );
    };

    return (
      <div className={storyStyles.storyA11yScope}>
        <AsyncSearchStory />
      </div>
    );
  },
  parameters: storySourceParameters(
    [
      '<Combobox',
      '  options={filteredOptions}',
      '  loading={loading}',
      '  onInputChange={(query) => {',
      '    setLoading(true);',
      '    window.setTimeout(() => {',
      '      const normalizedQuery = query.trim().toLowerCase();',
      '      setFilteredOptions(',
      '        normalizedQuery.length === 0',
      '          ? frameworkOptions',
      '          : frameworkOptions.filter((option) => option.label.toLowerCase().includes(normalizedQuery))',
      '      );',
      '      setLoading(false);',
      '    }, 300);',
      '  }}',
      '  placeholder="Search frameworks"',
      '/>',
    ].join('\n')
  ),
};

export const InField: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Field
        label="Framework"
        helper="Choose the UI framework used by this product surface."
        instruction="Search to narrow a long list."
      >
        <Combobox options={frameworkOptions} />
      </Field>
    </div>
  ),
  parameters: storySourceParameters(
    [
      '<Field',
      '  label="Framework"',
      '  helper="Choose the UI framework used by this product surface."',
      '  instruction="Search to narrow a long list."',
      '>',
      '  <Combobox options={frameworkOptions} />',
      '</Field>',
    ].join('\n')
  ),
};

export const SearchAndSelect: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    const search = within(document.body).getByRole('searchbox');
    await userEvent.type(search, 'react');
    const option = within(document.body).getByRole('option', { name: /react/i });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent(/react/i);
  },
};
