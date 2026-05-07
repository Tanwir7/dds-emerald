import { useRef, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from '../Field';
import { Typeahead, type TypeaheadSuggestion } from './Typeahead';
import storyStyles from './Typeahead.stories.module.scss';
import { storySource, storySourceParameters } from '../../utils/storySource';

const countrySuggestions: TypeaheadSuggestion[] = [
  { value: 'France', group: 'Europe' },
  { value: 'Finland', group: 'Europe' },
  { value: 'Germany', group: 'Europe' },
  { value: 'Ghana', group: 'Africa' },
  { value: 'Japan', group: 'Asia' },
  { value: 'Jordan', group: 'Asia' },
  { value: 'Canada', group: 'North America' },
  { value: 'Chile', group: 'South America' },
  { value: 'Australia', group: 'Oceania' },
  { value: 'Argentina', group: 'South America' },
];

const citySuggestions: TypeaheadSuggestion[] = [
  { value: 'Toronto', description: 'Ontario, Canada' },
  { value: 'Montreal', description: 'Quebec, Canada' },
  { value: 'Vancouver', description: 'British Columbia, Canada' },
];

const groupedSuggestions: TypeaheadSuggestion[] = [
  { value: 'Claude', group: 'Models' },
  { value: 'GPT-5', group: 'Models' },
  { value: 'RAG', group: 'Patterns' },
  { value: 'Tool calling', group: 'Patterns' },
];

const renderFieldStory = ({
  label,
  helper,
  args,
}: {
  label: string;
  helper?: string;
  args: ComponentProps<typeof Typeahead>;
}) => (
  <div className={storyStyles.storyA11yScope}>
    <Field label={label} helper={helper}>
      <Typeahead {...args} />
    </Field>
  </div>
);

const AsyncSearchExample = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TypeaheadSuggestion[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const handleInputChange = (nextQuery: string) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!nextQuery.trim()) {
      setResults([]);
      setLoading(false);
      timeoutRef.current = null;
      return;
    }

    setLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      setResults(
        countrySuggestions.filter((suggestion) =>
          suggestion.value.toLowerCase().includes(nextQuery.toLowerCase())
        )
      );
      setLoading(false);
      timeoutRef.current = null;
    }, 400);
  };

  return (
    <div className={storyStyles.storyA11yScope}>
      <Field label="Country">
        <Typeahead
          id="async-search"
          suggestions={results}
          loading={loading}
          onInputChange={handleInputChange}
          placeholder="Search countries"
        />
      </Field>
    </div>
  );
};

const EmptyStateExample = () => {
  const [, setQuery] = useState('');

  return (
    <div className={storyStyles.storyA11yScope}>
      <Field label="Country">
        <Typeahead
          id="empty-state-search"
          suggestions={[]}
          onInputChange={setQuery}
          emptyMessage="No countries found"
          placeholder="Search countries"
        />
      </Field>
    </div>
  );
};

const meta: Meta<typeof Typeahead> = {
  title: 'Core Components/Typeahead',
  component: Typeahead,
  tags: ['autodocs'],
  render: (args) => renderFieldStory({ args, label: 'Country' }),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    id: 'storybook-typeahead',
    suggestions: countrySuggestions,
    placeholder: 'Search countries',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Typeahead>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead suggestions={countrySuggestions} placeholder="Search countries" />',
      '</Field>'
    )
  ),
};

export const WithDescriptions: Story = {
  render: (args) => renderFieldStory({ args, label: 'City' }),
  args: {
    suggestions: citySuggestions,
    placeholder: 'Search cities',
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="City">',
      '  <Typeahead suggestions={citySuggestions} placeholder="Search cities" />',
      '</Field>'
    )
  ),
};

export const WithGroups: Story = {
  render: (args) => renderFieldStory({ args, label: 'Topic' }),
  args: {
    suggestions: groupedSuggestions,
    placeholder: 'Search AI topics',
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Topic">',
      '  <Typeahead suggestions={groupedSuggestions} placeholder="Search AI topics" />',
      '</Field>'
    )
  ),
};

export const HighlightOff: Story = {
  args: {
    highlightMatch: false,
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead',
      '    suggestions={countrySuggestions}',
      '    placeholder="Search countries"',
      '    highlightMatch={false}',
      '  />',
      '</Field>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Field label="Country">
          <Typeahead
            id="typeahead-sm"
            suggestions={countrySuggestions}
            size="sm"
            placeholder="Small"
          />
        </Field>
        <Field label="Country">
          <Typeahead
            id="typeahead-md"
            suggestions={countrySuggestions}
            size="md"
            placeholder="Medium"
          />
        </Field>
        <Field label="Country">
          <Typeahead
            id="typeahead-lg"
            suggestions={countrySuggestions}
            size="lg"
            placeholder="Large"
          />
        </Field>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead suggestions={countrySuggestions} size="sm" placeholder="Small" />',
      '</Field>',
      '<Field label="Country">',
      '  <Typeahead suggestions={countrySuggestions} size="md" placeholder="Medium" />',
      '</Field>',
      '<Field label="Country">',
      '  <Typeahead suggestions={countrySuggestions} size="lg" placeholder="Large" />',
      '</Field>'
    )
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    suggestions: [],
    value: 'fra',
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead suggestions={[]} value="fra" loading />',
      '</Field>'
    )
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    value: 'fra',
  },
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead suggestions={countrySuggestions} value="fra" invalid />',
      '</Field>'
    )
  ),
};

export const MinChars: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Field label="Country" helper="Type at least 3 characters to see suggestions.">
        <Typeahead id="typeahead-min-chars" suggestions={countrySuggestions} minChars={3} />
      </Field>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country" helper="Type at least 3 characters to see suggestions.">',
      '  <Typeahead suggestions={countrySuggestions} minChars={3} />',
      '</Field>'
    )
  ),
};

export const AsyncSearch: Story = {
  render: () => <AsyncSearchExample />,
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead',
      '    suggestions={results}',
      '    loading={loading}',
      '    onInputChange={setQuery}',
      '    placeholder="Search countries"',
      '  />',
      '</Field>'
    )
  ),
};

export const EmptyState: Story = {
  render: () => <EmptyStateExample />,
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country">',
      '  <Typeahead',
      '    suggestions={[]}',
      '    onInputChange={setQuery}',
      '    emptyMessage="No countries found"',
      '  />',
      '</Field>'
    )
  ),
};

export const InField: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Field label="Country" helper="Choose a country or type a custom value.">
        <Typeahead
          id="field-typeahead"
          suggestions={countrySuggestions}
          placeholder="Search countries"
        />
      </Field>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Field label="Country" helper="Choose a country or type a custom value.">',
      '  <Typeahead suggestions={countrySuggestions} placeholder="Search countries" />',
      '</Field>'
    )
  ),
};

export const TypeAndSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'fra');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    const option = canvas.getByRole('option', { name: /france/i });
    await userEvent.click(option);
    await expect(input).toHaveValue('France');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'fr');
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};
