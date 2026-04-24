import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../Label';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Slider } from './Slider';
import storyStyles from './Slider.stories.module.scss';

const renderSlider = (args: ComponentProps<typeof Slider>) => (
  <div className={storyStyles.storyA11yScope}>
    <Slider {...args} />
  </div>
);

const meta: Meta<typeof Slider> = {
  title: 'Core Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Slider>) => renderSlider(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    'aria-label': 'Volume',
    defaultValue: [40],
    max: 100,
    min: 0,
    orientation: 'horizontal',
    size: 'md',
    step: 1,
  },
  argTypes: {
    'aria-label': {
      control: 'text',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    'aria-labelledby': {
      control: false,
    },
    thumbLabels: {
      control: false,
      table: {
        type: {
          summary: 'string[]',
        },
      },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Slider>;

const storyValueClassName = storyStyles.storyValue ?? '';

interface SingleValueExampleProps extends Omit<
  ComponentProps<typeof Slider>,
  'defaultValue' | 'value'
> {
  initialValue: number;
  label: string;
  labelId: string;
  formatValue?: (value: number) => string;
}

const formatPercent = (value: number) => `${value}%`;

const SingleValueExample = ({
  initialValue,
  label,
  labelId,
  formatValue = formatPercent,
  ...sliderProps
}: SingleValueExampleProps) => {
  const [value, setValue] = useState([initialValue]);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label id={labelId}>{label}</Label>
        <Slider {...sliderProps} value={value} onValueChange={setValue} aria-labelledby={labelId} />
        <Text as="p" className={storyValueClassName}>
          {formatValue(value[0] ?? initialValue)}
        </Text>
      </div>
    </div>
  );
};

const RangeExample = () => {
  const [value, setValue] = useState([20, 80]);

  return (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label id="story-slider-range-label">Budget range</Label>
        <Slider
          value={value}
          onValueChange={setValue}
          thumbLabels={['Minimum budget', 'Maximum budget']}
        />
        <Text as="p" className={storyValueClassName}>
          {value[0]}% - {value[1]}%
        </Text>
      </div>
    </div>
  );
};

const ControlledExample = () => (
  <SingleValueExample
    initialValue={40}
    label="Confidence"
    labelId="story-slider-controlled-label"
  />
);

export const Default: Story = {
  render: () => (
    <SingleValueExample initialValue={40} label="Volume" labelId="story-slider-default-label" />
  ),
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState([40]);',
      '',
      '<Label id="volume-label">Volume</Label>',
      '<Slider value={value} onValueChange={setValue} aria-labelledby="volume-label" />',
      '<Text as="p">{value[0]}%</Text>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyField}>
          <Label id="story-slider-sm-label">Small</Label>
          <Slider size="sm" defaultValue={[25]} aria-labelledby="story-slider-sm-label" />
        </div>
        <div className={storyStyles.storyField}>
          <Label id="story-slider-md-label">Medium</Label>
          <Slider size="md" defaultValue={[50]} aria-labelledby="story-slider-md-label" />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label id="slider-sm-label">Small</Label>',
      '<Slider size="sm" defaultValue={[25]} aria-labelledby="slider-sm-label" />',
      '',
      '<Label id="slider-md-label">Medium</Label>',
      '<Slider size="md" defaultValue={[50]} aria-labelledby="slider-md-label" />'
    )
  ),
};

export const Range: Story = {
  render: () => <RangeExample />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState([20, 80]);',
      '',
      '<Slider',
      '  value={value}',
      '  onValueChange={setValue}',
      '  thumbLabels={["Minimum budget", "Maximum budget"]}',
      '/>',
      '<Text as="p">{value[0]}% - {value[1]}%</Text>'
    )
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyVerticalFrame}>
        <Slider orientation="vertical" defaultValue={[40]} aria-label="Volume" />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    '<Slider orientation="vertical" defaultValue={[40]} aria-label="Volume" />'
  ),
};

export const WithSteps: Story = {
  render: () => (
    <SingleValueExample
      initialValue={30}
      label="Volume in 10% steps"
      labelId="story-slider-steps-label"
      step={10}
      formatValue={(value) => `${value}%`}
    />
  ),
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState([30]);',
      '',
      '<Label id="volume-steps-label">Volume in 10% steps</Label>',
      '<Slider',
      '  value={value}',
      '  onValueChange={setValue}',
      '  step={10}',
      '  aria-labelledby="volume-steps-label"',
      '/>',
      '<Text as="p">{value[0]}%</Text>'
    )
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyField}>
        <Label id="story-slider-disabled-label">Volume (disabled)</Label>
        <Slider defaultValue={[40]} disabled aria-labelledby="story-slider-disabled-label" />
        <Text as="p" className={storyValueClassName}>
          40%
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Label id="volume-disabled-label">Volume (disabled)</Label>',
      '<Slider defaultValue={[40]} disabled aria-labelledby="volume-disabled-label" />',
      '<Text as="p">40%</Text>'
    )
  ),
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: storySourceParameters(
    storySource(
      'const [value, setValue] = useState([40]);',
      '',
      '<Label id="confidence-label">Confidence</Label>',
      '<Slider',
      '  value={value}',
      '  onValueChange={setValue}',
      '  aria-labelledby="confidence-label"',
      '/>',
      '<Text as="p">{value[0]}%</Text>'
    )
  ),
};
