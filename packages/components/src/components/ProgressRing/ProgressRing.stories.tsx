import type { Meta, StoryObj } from '@storybook/react-vite';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import { ProgressRing } from './ProgressRing';
import storyStyles from './ProgressRing.stories.module.scss';

const componentDescription = `ProgressRing communicates circular task completion with determinate and indeterminate states.

### Accessibility contract

- Keyboard: no interaction, no focus target, no tab stop.
- Screen readers: provide \`label\` or \`aria-labelledby\` so the wrapper \`progressbar\` has an accessible name; omit \`value\` for indeterminate states.
- Motion: the indeterminate rotation stops when users prefer reduced motion.
- Designers: use \`showValue\` when the centre label remains legible at the chosen size; prefer \`md\` or \`lg\` for value labels.
- QA: verify the arc starts at 12 o'clock, the indeterminate arc rotates smoothly, and theme colors stay distinct from the track.`;

const meta: Meta<typeof ProgressRing> = {
  title: 'Core Components/ProgressRing',
  component: ProgressRing,
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
      <ProgressRing {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof ProgressRing>;

export const Default: Story = {
  parameters: storySourceParameters('<ProgressRing label="Upload progress" value={60} />'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <ProgressRing label="Small upload progress" value={60} size="sm" />
        <ProgressRing label="Medium upload progress" value={60} size="md" />
        <ProgressRing label="Large upload progress" value={60} size="lg" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <ProgressRing label="Small upload progress" value={60} size="sm" />',
          '  <ProgressRing label="Medium upload progress" value={60} size="md" />',
          '  <ProgressRing label="Large upload progress" value={60} size="lg" />',
          '</>'
        )
      ),
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <ProgressRing label="Default upload progress" value={60} variant="default" />
        <ProgressRing label="Success upload progress" value={60} variant="success" />
        <ProgressRing label="Warning upload progress" value={60} variant="warning" />
        <ProgressRing label="Danger upload progress" value={60} variant="danger" />
        <ProgressRing label="Info upload progress" value={60} variant="info" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <ProgressRing label="Default upload progress" value={60} variant="default" />',
          '  <ProgressRing label="Success upload progress" value={60} variant="success" />',
          '  <ProgressRing label="Warning upload progress" value={60} variant="warning" />',
          '  <ProgressRing label="Danger upload progress" value={60} variant="danger" />',
          '  <ProgressRing label="Info upload progress" value={60} variant="info" />',
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
  parameters: storySourceParameters('<ProgressRing label="Upload progress" value={0} />'),
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  parameters: storySourceParameters('<ProgressRing label="Upload progress" value={100} />'),
};

export const Indeterminate: Story = {
  render: ({ value: _value, ...args }) => (
    <div className={storyStyles.storyA11yScope}>
      <ProgressRing {...args} />
    </div>
  ),
  parameters: storySourceParameters('<ProgressRing label="Upload progress" />'),
};

export const WithValueLabel: Story = {
  args: {
    value: 75,
    showValue: true,
  },
  parameters: storySourceParameters(
    '<ProgressRing label="Upload progress" value={75} showValue />'
  ),
};

export const NoAnimation: Story = {
  args: {
    value: 60,
    animated: false,
  },
  parameters: storySourceParameters(
    '<ProgressRing label="Upload progress" value={60} animated={false} />'
  ),
};

export const InCard: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyCard}>
        <ProgressRing label="Quarter close readiness" value={78} size="lg" showValue />
        <div className={storyStyles.storyCardBody}>
          <span className={storyStyles.storyEyebrow}>Quarter Close</span>
          <span className={storyStyles.storyTitle}>78% Complete</span>
          <span className={storyStyles.storyCopy}>
            Three of four reporting tasks are complete. Finance review remains in progress.
          </span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<div>',
          '  <ProgressRing label="Quarter close readiness" value={78} size="lg" showValue />',
          '  <div>',
          '    <span>Quarter Close</span>',
          '    <span>78% Complete</span>',
          '    <span>Three of four reporting tasks are complete. Finance review remains in progress.</span>',
          '  </div>',
          '</div>'
        )
      ),
    },
  },
};
