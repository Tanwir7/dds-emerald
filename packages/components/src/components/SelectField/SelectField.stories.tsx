import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SelectItem } from '../Select';
import { SelectField } from './SelectField';
import storyStyles from './SelectField.stories.module.scss';
import { Text } from '../Text';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceParameters } from '../../utils/storySource';

const classNames = {
  storyValue: getRequiredClassName(storyStyles, 'storyValue'),
} as const;

const renderField = (story: React.ReactNode) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyField}>{story}</div>
  </div>
);

const basicSource = (...fieldProps: string[]) =>
  storySource(
    '<SelectField',
    ...fieldProps,
    '>',
    '  <SelectItem value="ca">Canada</SelectItem>',
    '  <SelectItem value="de">Germany</SelectItem>',
    '  <SelectItem value="us">United States</SelectItem>',
    '</SelectField>'
  );

const ControlledExample = () => {
  const [value, setValue] = useState('us');

  return (
    <div>
      <SelectField
        label="Country"
        helper="Choose the country tied to your account profile."
        onValueChange={setValue}
        placeholder="Select your country"
        value={value}
      >
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="us">United States</SelectItem>
      </SelectField>
      <Text as="p" size="sm" color="muted" className={classNames.storyValue}>
        Selected: {value}
      </Text>
    </div>
  );
};

const meta: Meta<typeof SelectField> = {
  title: 'Grouped Components/SelectField',
  component: SelectField,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof SelectField>;

export const Default: Story = {
  render: () =>
    renderField(
      <SelectField label="Country" placeholder="Select your country">
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="us">United States</SelectItem>
      </SelectField>
    ),
  parameters: storySourceParameters(
    basicSource('  label="Country"', '  placeholder="Select your country"')
  ),
};

export const WithHelper: Story = {
  render: () =>
    renderField(
      <SelectField
        label="Country"
        helper="Choose the country tied to your account profile."
        placeholder="Select your country"
      >
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="us">United States</SelectItem>
      </SelectField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Country"',
      '  helper="Choose the country tied to your account profile."',
      '  placeholder="Select your country"'
    )
  ),
};

export const Error: Story = {
  render: () =>
    renderField(
      <SelectField
        label="Country"
        required
        placeholder="Select your country"
        inlineAlert={{ intent: 'danger', children: 'Select a country before continuing.' }}
      >
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="us">United States</SelectItem>
      </SelectField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Country"',
      '  required',
      '  placeholder="Select your country"',
      '  inlineAlert={{ intent: "danger", children: "Select a country before continuing." }}'
    )
  ),
};

export const Disabled: Story = {
  render: () =>
    renderField(
      <SelectField
        label="Country"
        defaultValue="us"
        disabled
        helper="This value is managed by your organization."
      >
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="us">United States</SelectItem>
      </SelectField>
    ),
  parameters: storySourceParameters(
    basicSource(
      '  label="Country"',
      '  defaultValue="us"',
      '  disabled',
      '  helper="This value is managed by your organization."'
    )
  ),
};

export const WithSelection: Story = {
  render: () => renderField(<ControlledExample />),
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState("us");',
      '',
      '<SelectField',
      '  label="Country"',
      '  helper="Choose the country tied to your account profile."',
      '  value={value}',
      '  onValueChange={setValue}',
      '  placeholder="Select your country"',
      '>',
      '  <SelectItem value="ca">Canada</SelectItem>',
      '  <SelectItem value="de">Germany</SelectItem>',
      '  <SelectItem value="us">United States</SelectItem>',
      '</SelectField>'
    )
  ),
};

export const OpenAndSelect: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Country' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const option = within(document.body).getByRole('option', { name: 'United States' });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('United States');
  },
};
