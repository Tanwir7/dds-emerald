import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Radio, RadioGroup } from './Radio';
import storyStyles from './Radio.stories.module.scss';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof RadioGroup> = {
  title: 'Core Components/Radio',
  component: RadioGroup,
  subcomponents: { Radio },
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

const RadioField = ({
  id,
  label,
  value,
  disabled,
  invalid,
  size,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: 'sm' | 'md';
  describedBy?: string;
}) => {
  const radioProps = {
    ...(disabled !== undefined ? { disabled } : {}),
    ...(invalid !== undefined ? { invalid } : {}),
    ...(size !== undefined ? { size } : {}),
    ...(invalid ? { 'aria-invalid': 'true' as const } : {}),
    ...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {}),
  };

  return (
    <div className={storyStyles.storyField}>
      <Radio id={id} value={value} {...radioProps} />
      <Label htmlFor={id} {...(disabled !== undefined ? { disabled } : {})}>
        {label}
      </Label>
    </div>
  );
};

const ControlledExample = () => {
  const [value, setValue] = useState('express');

  return (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup value={value} onValueChange={setValue} aria-label="Delivery speed">
        <RadioField id="storybook-controlled-standard" label="Standard" value="standard" />
        <RadioField id="storybook-controlled-express" label="Express" value="express" />
        <RadioField id="storybook-controlled-overnight" label="Overnight" value="overnight" />
      </RadioGroup>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
        <Radio value="overnight" aria-label="Overnight" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup aria-label="Delivery speed">',
      '  <Radio value="standard" aria-label="Standard" />',
      '  <Radio value="express" aria-label="Express" />',
      '  <Radio value="overnight" aria-label="Overnight" />',
      '</RadioGroup>'
    )
  ),
};

export const Selected: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup defaultValue="express" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
        <Radio value="overnight" aria-label="Overnight" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup defaultValue="express" aria-label="Delivery speed">',
      '  <Radio value="standard" aria-label="Standard" />',
      '  <Radio value="express" aria-label="Express" />',
      '  <Radio value="overnight" aria-label="Overnight" />',
      '</RadioGroup>'
    )
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup orientation="horizontal" aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
        <Radio value="overnight" aria-label="Overnight" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup orientation="horizontal" aria-label="Delivery speed">',
      '  <Radio value="standard" aria-label="Standard" />',
      '  <Radio value="express" aria-label="Express" />',
      '  <Radio value="overnight" aria-label="Overnight" />',
      '</RadioGroup>'
    )
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup defaultValue="standard" aria-label="Delivery speed">
        <RadioField id="storybook-disabled-standard" label="Standard" value="standard" />
        <RadioField id="storybook-disabled-express" label="Express" value="express" disabled />
        <RadioField id="storybook-disabled-overnight" label="Overnight" value="overnight" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup defaultValue="standard" aria-label="Delivery speed">',
      '  <Radio id="standard" value="standard" />',
      '  <Label htmlFor="standard">Standard</Label>',
      '  <Radio id="express" value="express" disabled />',
      '  <Label htmlFor="express" disabled>Express</Label>',
      '</RadioGroup>'
    )
  ),
};

export const AllDisabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup disabled defaultValue="standard" aria-label="Delivery speed">
        <RadioField id="storybook-all-disabled-standard" label="Standard" value="standard" />
        <RadioField id="storybook-all-disabled-express" label="Express" value="express" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup disabled defaultValue="standard" aria-label="Delivery speed">',
      '  <Radio id="standard" value="standard" />',
      '  <Label htmlFor="standard">Standard</Label>',
      '  <Radio id="express" value="express" />',
      '  <Label htmlFor="express">Express</Label>',
      '</RadioGroup>'
    )
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFieldStack}>
        <RadioGroup aria-label="Delivery speed">
          <RadioField
            id="storybook-invalid-standard"
            label="Standard"
            value="standard"
            invalid
            describedBy="storybook-invalid-radio-error"
          />
          <RadioField id="storybook-invalid-express" label="Express" value="express" />
        </RadioGroup>
        <Text as="p" size="sm" color="danger" id="storybook-invalid-radio-error">
          Select a delivery speed before continuing.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup aria-label="Delivery speed">',
      '  <Radio',
      '    id="standard"',
      '    value="standard"',
      '    invalid',
      '    aria-invalid="true"',
      '    aria-describedby="delivery-speed-error"',
      '  />',
      '  <Label htmlFor="standard">Standard</Label>',
      '</RadioGroup>',
      '<Text as="p" size="sm" color="danger" id="delivery-speed-error">',
      '  Select a delivery speed before continuing.',
      '</Text>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup orientation="horizontal" aria-label="Radio size">
        <RadioField id="storybook-radio-sm" label="Small" value="small" size="sm" />
        <RadioField id="storybook-radio-md" label="Medium" value="medium" size="md" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup orientation="horizontal" aria-label="Radio size">',
      '  <Radio id="radio-sm" value="small" size="sm" />',
      '  <Label htmlFor="radio-sm">Small</Label>',
      '  <Radio id="radio-md" value="medium" size="md" />',
      '  <Label htmlFor="radio-md">Medium</Label>',
      '</RadioGroup>'
    )
  ),
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState("express");',
      '',
      '<RadioGroup value={value} onValueChange={setValue} aria-label="Delivery speed">',
      '  <Radio id="standard" value="standard" />',
      '  <Label htmlFor="standard">Standard</Label>',
      '  <Radio id="express" value="express" />',
      '  <Label htmlFor="express">Express</Label>',
      '</RadioGroup>'
    )
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup aria-label="Delivery speed">
        <RadioField id="storybook-labeled-standard" label="Standard" value="standard" />
        <RadioField id="storybook-labeled-express" label="Express" value="express" />
        <RadioField id="storybook-labeled-overnight" label="Overnight" value="overnight" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup aria-label="Delivery speed">',
      '  <Radio id="standard" value="standard" />',
      '  <Label htmlFor="standard">Standard</Label>',
      '  <Radio id="express" value="express" />',
      '  <Label htmlFor="express">Express</Label>',
      '</RadioGroup>'
    )
  ),
};

export const FocusNavigation: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <RadioGroup aria-label="Delivery speed">
        <Radio value="standard" aria-label="Standard" />
        <Radio value="express" aria-label="Express" />
        <Radio value="overnight" aria-label="Overnight" />
      </RadioGroup>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<RadioGroup aria-label="Delivery speed">',
      '  <Radio value="standard" aria-label="Standard" />',
      '  <Radio value="express" aria-label="Express" />',
      '  <Radio value="overnight" aria-label="Overnight" />',
      '</RadioGroup>'
    )
  ),
  play: async ({ canvasElement }) => {
    const radios = within(canvasElement).getAllByRole('radio');
    await userEvent.tab();
    await expect(radios[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(radios[1]).toHaveFocus();
  },
};
