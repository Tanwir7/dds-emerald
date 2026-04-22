import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, type CheckboxCheckedState } from './Checkbox';
import storyStyles from './Checkbox.stories.module.scss';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';

const renderCheckbox = (args: ComponentProps<typeof Checkbox>) => (
  <div className={storyStyles.storyA11yScope}>
    <Checkbox {...args} />
  </div>
);

const meta: Meta<typeof Checkbox> = {
  title: 'Core Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Checkbox>) => renderCheckbox(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    'aria-label': 'Accept terms',
    size: 'md',
    invalid: false,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    checked: {
      control: 'inline-radio',
      options: [false, true, 'indeterminate'],
    },
    invalid: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

const ControlledExample = () => {
  const [checked, setChecked] = useState<CheckboxCheckedState>(false);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Checkbox
          id="storybook-controlled-checkbox"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label htmlFor="storybook-controlled-checkbox">Receive project updates</Label>
      </div>
    </div>
  );
};

export const Unchecked: Story = {
  args: {
    'aria-label': 'Accept terms',
  },
  parameters: storySourceParameters('<Checkbox aria-label="Accept terms" />'),
};

export const Checked: Story = {
  args: {
    checked: true,
    'aria-label': 'Accept terms',
  },
  parameters: storySourceParameters('<Checkbox checked aria-label="Accept terms" />'),
};

export const Indeterminate: Story = {
  args: {
    checked: 'indeterminate',
    'aria-label': 'Select all projects',
  },
  parameters: storySourceParameters(
    '<Checkbox checked="indeterminate" aria-label="Select all projects" />'
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    'aria-label': 'Accept terms',
  },
  parameters: storySourceParameters('<Checkbox disabled aria-label="Accept terms" />'),
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    'aria-label': 'Accept terms',
  },
  parameters: storySourceParameters('<Checkbox checked disabled aria-label="Accept terms" />'),
};

export const Invalid: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFieldStack}>
        <div className={storyStyles.storyField}>
          <Checkbox
            id="storybook-invalid-checkbox"
            invalid
            aria-invalid="true"
            aria-describedby="storybook-invalid-checkbox-error"
          />
          <Label htmlFor="storybook-invalid-checkbox" required>
            Accept terms
          </Label>
        </div>
        <Text as="p" size="sm" color="danger" id="storybook-invalid-checkbox-error">
          Accept the terms before continuing.
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Checkbox',
      '  id="terms"',
      '  invalid',
      '  aria-invalid="true"',
      '  aria-describedby="terms-error"',
      '/>',
      '<Label htmlFor="terms" required>',
      '  Accept terms',
      '</Label>',
      '<Text as="p" size="sm" color="danger" id="terms-error">',
      '  Accept the terms before continuing.',
      '</Text>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <div className={storyStyles.storyField}>
          <Checkbox id="storybook-checkbox-sm" size="sm" />
          <Label htmlFor="storybook-checkbox-sm">Small</Label>
        </div>
        <div className={storyStyles.storyField}>
          <Checkbox id="storybook-checkbox-md" size="md" />
          <Label htmlFor="storybook-checkbox-md">Medium</Label>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Checkbox id="checkbox-sm" size="sm" />',
      '<Label htmlFor="checkbox-sm">Small</Label>',
      '',
      '<Checkbox id="checkbox-md" size="md" />',
      '<Label htmlFor="checkbox-md">Medium</Label>'
    )
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Checkbox id="storybook-labeled-checkbox" />
        <Label htmlFor="storybook-labeled-checkbox">Accept terms</Label>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource('<Checkbox id="terms" />', '<Label htmlFor="terms">Accept terms</Label>')
  ),
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: storySourceParameters(
    storySource(
      'const [checked, setChecked] = useState<CheckboxCheckedState>(false);',
      '',
      '<Checkbox',
      '  id="updates"',
      '  checked={checked}',
      '  onCheckedChange={setChecked}',
      '/>',
      '<Label htmlFor="updates">Receive project updates</Label>'
    )
  ),
};

export const FocusVisible: Story = {
  args: {
    'aria-label': 'Focus visible example',
  },
  parameters: storySourceParameters('<Checkbox aria-label="Focus visible example" />'),
  play: async ({ canvasElement }) => {
    const cb = canvasElement.querySelector('[role="checkbox"]');

    if (!(cb instanceof HTMLElement)) {
      throw new Error('Expected to find a checkbox in the story canvas.');
    }

    cb.focus();

    if (document.activeElement !== cb) {
      throw new Error('Expected the checkbox to receive focus.');
    }
  },
};

export const Toggle: Story = {
  args: {
    'aria-label': 'Toggle example',
  },
  parameters: storySourceParameters('<Checkbox aria-label="Toggle example" />'),
  play: async ({ canvasElement }) => {
    const cb = canvasElement.querySelector('[role="checkbox"]');

    if (!(cb instanceof HTMLElement)) {
      throw new Error('Expected to find a checkbox in the story canvas.');
    }

    if (cb.getAttribute('aria-checked') !== 'false') {
      throw new Error('Expected the checkbox to start unchecked.');
    }

    cb.click();

    if (cb.getAttribute('aria-checked') !== 'true') {
      throw new Error('Expected the checkbox to be checked after click.');
    }
  },
};
