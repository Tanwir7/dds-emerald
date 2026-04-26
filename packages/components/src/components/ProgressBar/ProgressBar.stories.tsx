import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import React from 'react';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import { ProgressBar } from './ProgressBar';
import storyStyles from './ProgressBar.stories.module.scss';

const componentDescription = `ProgressBar communicates linear task completion with determinate and indeterminate states.

### Accessibility contract

- Keyboard: no interaction, no focus target, no tab stop.
- Screen readers: provide \`label\` or \`aria-labelledby\` so the \`progressbar\` role has a clear accessible name; omit \`value\` for indeterminate loading states.
- Motion: indeterminate animation stops when users prefer reduced motion.
- Designers: reserve \`showValue\` for layouts where the numeric percentage adds value and does not duplicate nearby copy.
- QA: verify the full-radius exception, indeterminate state announcement, and variant colors in both themes.`;

const meta: Meta<typeof ProgressBar> = {
  title: 'Core Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: {
    label: 'Upload progress',
    value: 60,
  },
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
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <ProgressBar {...args} />
      </div>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

const AnimatedProgressBar = () => {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    let timeoutId = window.setTimeout(function tick() {
      setValue((currentValue) => {
        if (currentValue >= 100) {
          return 0;
        }

        return currentValue + 20;
      });

      timeoutId = window.setTimeout(tick, 600);
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return <ProgressBar label="Upload progress" value={value} showValue />;
};

export const Default: Story = {
  parameters: storySourceParameters('<ProgressBar label="Upload progress" value={60} />'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <ProgressBar label="Small upload progress" value={60} size="sm" />
        <ProgressBar label="Medium upload progress" value={60} size="md" />
        <ProgressBar label="Large upload progress" value={60} size="lg" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <ProgressBar label="Small upload progress" value={60} size="sm" />',
          '  <ProgressBar label="Medium upload progress" value={60} size="md" />',
          '  <ProgressBar label="Large upload progress" value={60} size="lg" />',
          '</>'
        )
      ),
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <ProgressBar label="Default upload progress" value={60} variant="default" />
        <ProgressBar label="Success upload progress" value={60} variant="success" />
        <ProgressBar label="Warning upload progress" value={60} variant="warning" />
        <ProgressBar label="Danger upload progress" value={60} variant="danger" />
        <ProgressBar label="Info upload progress" value={60} variant="info" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <ProgressBar label="Default upload progress" value={60} variant="default" />',
          '  <ProgressBar label="Success upload progress" value={60} variant="success" />',
          '  <ProgressBar label="Warning upload progress" value={60} variant="warning" />',
          '  <ProgressBar label="Danger upload progress" value={60} variant="danger" />',
          '  <ProgressBar label="Info upload progress" value={60} variant="info" />',
          '</>'
        )
      ),
    },
  },
};

export const Zero: Story = {
  args: {
    value: 0,
  },
  parameters: storySourceParameters('<ProgressBar label="Upload progress" value={0} />'),
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  parameters: storySourceParameters('<ProgressBar label="Upload progress" value={100} />'),
};

export const Indeterminate: Story = {
  render: ({ value: _value, ...args }) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <ProgressBar {...args} />
      </div>
    </div>
  ),
  parameters: storySourceParameters('<ProgressBar label="Upload progress" />'),
};

export const WithValueLabel: Story = {
  args: {
    value: 60,
    showValue: true,
  },
  parameters: storySourceParameters('<ProgressBar label="Upload progress" value={60} showValue />'),
};

export const Animated: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <AnimatedProgressBar />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '0');
  },
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          'const Example = () => {',
          '  const [value, setValue] = React.useState(0);',
          '',
          '  React.useEffect(() => {',
          '    let timeoutId = window.setTimeout(function tick() {',
          '      setValue((currentValue) => (currentValue >= 100 ? 0 : currentValue + 20));',
          '      timeoutId = window.setTimeout(tick, 600);',
          '    }, 600);',
          '',
          '    return () => window.clearTimeout(timeoutId);',
          '  }, []);',
          '',
          '  return <ProgressBar label="Upload progress" value={value} showValue />;',
          '};'
        )
      ),
    },
  },
};

export const NoAnimation: Story = {
  args: {
    value: 60,
    animated: false,
    showValue: true,
  },
  parameters: storySourceParameters(
    '<ProgressBar label="Upload progress" value={60} animated={false} showValue />'
  ),
};
