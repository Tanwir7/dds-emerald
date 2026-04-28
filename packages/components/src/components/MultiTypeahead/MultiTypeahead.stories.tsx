import { useRef, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from '../Field';
import { MultiTypeahead, type MultiTypeaheadSuggestion } from './MultiTypeahead';
import storyStyles from './MultiTypeahead.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const skillSuggestions: MultiTypeaheadSuggestion[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'remix', label: 'Remix', group: 'Frontend', description: 'Full-stack React framework' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'redis', label: 'Redis', group: 'Backend' },
  { value: 'postgres', label: 'PostgreSQL', group: 'Backend' },
];

const renderStory = (args: ComponentProps<typeof MultiTypeahead>) => (
  <div className={storyStyles.storyA11yScope}>
    <MultiTypeahead {...args} />
  </div>
);

const AsyncExample = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiTypeaheadSuggestion[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const handleInputChange = (query: string) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      timeoutRef.current = null;
      return;
    }

    setLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      setResults(
        skillSuggestions.filter((suggestion) => {
          const text = suggestion.label ?? suggestion.value;
          return text.toLowerCase().includes(query.toLowerCase());
        })
      );
      setLoading(false);
      timeoutRef.current = null;
    }, 400);
  };

  return (
    <div className={storyStyles.storyA11yScope}>
      <MultiTypeahead
        id="async-multi-typeahead"
        suggestions={results}
        loading={loading}
        onInputChange={handleInputChange}
        placeholder="Assign skills"
      />
    </div>
  );
};

const MaxItemsExample = () => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyStack}>
      <MultiTypeahead
        id="limited-skills"
        suggestions={skillSuggestions}
        maxItems={3}
        defaultValue={['react', 'node']}
        placeholder="Assign skills"
      />
      <p className={storyStyles.hint}>Add up to three skills. The input hides at the limit.</p>
    </div>
  </div>
);

const meta: Meta<typeof MultiTypeahead> = {
  title: 'Core Components/MultiTypeahead',
  component: MultiTypeahead,
  tags: ['autodocs'],
  render: (args) => renderStory(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    id: 'storybook-multi-typeahead',
    suggestions: skillSuggestions,
    placeholder: 'Assign skills',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof MultiTypeahead>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource(
      '<MultiTypeahead',
      '  suggestions={skillSuggestions}',
      '  placeholder="Assign skills"',
      '/>'
    )
  ),
};

export const WithDefaultValues: Story = {
  args: {
    defaultValue: ['react', 'node'],
  },
  parameters: storySourceParameters(
    storySource(
      '<MultiTypeahead',
      '  suggestions={skillSuggestions}',
      "  defaultValue={['react', 'node']}",
      '  placeholder="Assign skills"',
      '/>'
    )
  ),
};

export const CustomValues: Story = {
  args: {
    allowCustomValues: true,
  },
  parameters: storySourceParameters(
    storySource(
      '<MultiTypeahead',
      '  suggestions={skillSuggestions}',
      '  allowCustomValues',
      '  placeholder="Assign skills"',
      '/>'
    )
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    suggestions: [],
  },
  parameters: storySourceParameters(
    storySource('<MultiTypeahead suggestions={[]} loading placeholder="Assign skills" />')
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: ['react'],
  },
  parameters: storySourceParameters(
    storySource(
      '<MultiTypeahead',
      '  suggestions={skillSuggestions}',
      "  defaultValue={['react']}",
      '  invalid',
      '/>'
    )
  ),
};

export const AsyncSearch: Story = {
  render: () => <AsyncExample />,
  parameters: storySourceParameters(
    storySource(
      '<MultiTypeahead',
      '  suggestions={results}',
      '  loading={loading}',
      '  onInputChange={handleInputChange}',
      '  placeholder="Assign skills"',
      '/>'
    )
  ),
};

export const MaxItems: Story = {
  render: () => <MaxItemsExample />,
  parameters: storySourceParameters(
    storySource(
      '<MultiTypeahead',
      '  suggestions={skillSuggestions}',
      '  maxItems={3}',
      "  defaultValue={['react', 'node']}",
      '  placeholder="Assign skills"',
      '/>'
    )
  ),
};

export const InField: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Field label="Assigned skills" helper="Select one or more skills for the team profile.">
        <MultiTypeahead suggestions={skillSuggestions} placeholder="Assign skills" />
      </Field>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Field label="Assigned skills" helper="Select one or more skills for the team profile.">',
      '  <MultiTypeahead suggestions={skillSuggestions} placeholder="Assign skills" />',
      '</Field>'
    )
  ),
};

export const TypeAndSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'rea');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('option', { name: 'React' }));
    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(input).toHaveValue('');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 're');
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('React')).toBeInTheDocument();
  },
};
