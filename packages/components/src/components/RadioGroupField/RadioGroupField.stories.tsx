import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RadioGroupField } from './RadioGroupField';
import storyStyles from './RadioGroupField.stories.module.scss';
import { Label } from '../Label';
import { Radio } from '../Radio';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceParameters } from '../../utils/storySource';

const storyClassNames = {
  storyValue: getRequiredClassName(storyStyles, 'storyValue'),
} as const;

const RadioOption = ({ id, label, value }: { id: string; label: string; value: string }) => (
  <div className={storyStyles.storyOption}>
    <Radio id={id} value={value} />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

const deliveryOptions = (
  <>
    <RadioOption id="storybook-frequency-daily" label="Daily" value="daily" />
    <RadioOption id="storybook-frequency-weekly" label="Weekly" value="weekly" />
    <RadioOption id="storybook-frequency-monthly" label="Monthly" value="monthly" />
  </>
);

const renderStory = (story: ReactNode) => <div className={storyStyles.storyA11yScope}>{story}</div>;

const basicSource = (...fieldProps: string[]) =>
  storySource(
    '<RadioGroupField',
    ...fieldProps,
    '>',
    '  <div className={styles.option}>',
    '    <Radio id="frequency-daily" value="daily" />',
    '    <Label htmlFor="frequency-daily">Daily</Label>',
    '  </div>',
    '  <div className={styles.option}>',
    '    <Radio id="frequency-weekly" value="weekly" />',
    '    <Label htmlFor="frequency-weekly">Weekly</Label>',
    '  </div>',
    '</RadioGroupField>'
  );

const ControlledExample = () => {
  const [value, setValue] = useState('weekly');

  return (
    <div>
      <RadioGroupField
        label="Notification frequency"
        value={value}
        onValueChange={setValue}
        helper="This preference applies to release notes and activity summaries."
      >
        {deliveryOptions}
      </RadioGroupField>
      <Text as="p" size="sm" color="muted" className={storyClassNames.storyValue}>
        Selected: {value}
      </Text>
    </div>
  );
};

const meta: Meta<typeof RadioGroupField> = {
  title: 'Grouped Components/RadioGroupField',
  component: RadioGroupField,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroupField>;

export const Default: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency">{deliveryOptions}</RadioGroupField>
    ),
  parameters: storySourceParameters(basicSource('  label="Notification frequency"')),
};

export const WithSelection: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency" defaultValue="weekly">
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource('  label="Notification frequency"', '  defaultValue="weekly"')
  ),
};

export const Horizontal: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency" orientation="horizontal">
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource('  label="Notification frequency"', '  orientation="horizontal"')
  ),
};

export const WithInstruction: Story = {
  render: () =>
    renderStory(
      <RadioGroupField
        label="Notification frequency"
        instruction="Choose how often workspace notifications are sent."
      >
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Notification frequency"',
      '  instruction="Choose how often workspace notifications are sent."'
    )
  ),
};

export const WithHelper: Story = {
  render: () =>
    renderStory(
      <RadioGroupField
        label="Notification frequency"
        helper="You can change this in settings at any time."
      >
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Notification frequency"',
      '  helper="You can change this in settings at any time."'
    )
  ),
};

export const Error: Story = {
  render: () =>
    renderStory(
      <RadioGroupField
        label="Notification frequency"
        helper="Select a notification frequency before continuing."
        helperIntent="error"
        required
      >
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Notification frequency"',
      '  helper="Select a notification frequency before continuing."',
      '  helperIntent="error"',
      '  required'
    )
  ),
};

export const Success: Story = {
  render: () =>
    renderStory(
      <RadioGroupField
        label="Notification frequency"
        helper="Notification frequency is saved."
        helperIntent="success"
        defaultValue="weekly"
      >
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Notification frequency"',
      '  helper="Notification frequency is saved."',
      '  helperIntent="success"',
      '  defaultValue="weekly"'
    )
  ),
};

export const Required: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency" required>
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(basicSource('  label="Notification frequency"', '  required')),
};

export const Disabled: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency" defaultValue="weekly" disabled>
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource('  label="Notification frequency"', '  defaultValue="weekly"', '  disabled')
  ),
};

export const AllSlots: Story = {
  render: () =>
    renderStory(
      <RadioGroupField
        label="Notification frequency"
        instruction="Choose how often workspace notifications are sent."
        helper="You can change this in settings at any time."
        required
      >
        {deliveryOptions}
      </RadioGroupField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Notification frequency"',
      '  instruction="Choose how often workspace notifications are sent."',
      '  helper="You can change this in settings at any time."',
      '  required'
    )
  ),
};

export const Controlled: Story = {
  render: () => renderStory(<ControlledExample />),
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState("weekly");',
      '',
      '<RadioGroupField',
      '  label="Notification frequency"',
      '  value={value}',
      '  onValueChange={setValue}',
      '>',
      '  <div className={styles.option}>',
      '    <Radio id="frequency-daily" value="daily" />',
      '    <Label htmlFor="frequency-daily">Daily</Label>',
      '  </div>',
      '</RadioGroupField>'
    )
  ),
};

export const KeyboardNavigation: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency">{deliveryOptions}</RadioGroupField>
    ),
  parameters: storySourceParameters(basicSource('  label="Notification frequency"')),
  play: async ({ canvasElement }) => {
    const radios = within(canvasElement).getAllByRole('radio');
    const firstRadio = radios[0];
    const secondRadio = radios[1];

    if (!firstRadio || !secondRadio) {
      throw new globalThis.Error('KeyboardNavigation story requires at least two radios.');
    }

    await userEvent.tab();
    await expect(firstRadio).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(secondRadio).toHaveFocus();
  },
};

export const SelectOption: Story = {
  render: () =>
    renderStory(
      <RadioGroupField label="Notification frequency">{deliveryOptions}</RadioGroupField>
    ),
  parameters: storySourceParameters(basicSource('  label="Notification frequency"')),
  play: async ({ canvasElement }) => {
    const radios = within(canvasElement).getAllByRole('radio');
    const firstRadio = radios[0];
    const secondRadio = radios[1];

    if (!firstRadio || !secondRadio) {
      throw new globalThis.Error('SelectOption story requires at least two radios.');
    }

    await userEvent.click(secondRadio);
    await expect(secondRadio).toHaveAttribute('aria-checked', 'true');
    await expect(firstRadio).toHaveAttribute('aria-checked', 'false');
  },
};
