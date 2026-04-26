import type { Meta, StoryObj } from '@storybook/react-vite';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import { Rating } from './Rating';
import storyStyles from './Rating.stories.module.scss';

const componentDescription = `Rating renders star-based scores in interactive and read-only modes.

### Accessibility contract

- Keyboard: Tab reaches the selected star, or the first star when no value is set; Arrow keys move one option at a time; Home and End jump to the bounds.
- Screen readers: interactive mode exposes a radiogroup with radio options named by star count; read-only mode exposes a single image-style summary label.
- Focus: the outline-based focus ring appears on the active star only, and hover preview resets when the pointer leaves the group.
- Designers: use read-only mode for summaries and reviews; interactive mode supports whole-star selection only in this version.
- QA: verify hover preview, arrow-key selection, and half-star display for read-only decimal values.`;

const meta: Meta<typeof Rating> = {
  title: 'Core Components/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: {
    label: 'Product rating',
    defaultValue: 3,
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
      <Rating {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  parameters: storySourceParameters('<Rating label="Product rating" defaultValue={3} />'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyRow}>
          <span className={storyStyles.storyLabel}>Small</span>
          <Rating label="Small rating" defaultValue={2} size="sm" />
        </div>
        <div className={storyStyles.storyRow}>
          <span className={storyStyles.storyLabel}>Medium</span>
          <Rating label="Medium rating" defaultValue={3} size="md" />
        </div>
        <div className={storyStyles.storyRow}>
          <span className={storyStyles.storyLabel}>Large</span>
          <Rating label="Large rating" defaultValue={4} size="lg" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Rating label="Small rating" defaultValue={2} size="sm" />',
          '  <Rating label="Medium rating" defaultValue={3} size="md" />',
          '  <Rating label="Large rating" defaultValue={4} size="lg" />',
          '</>'
        )
      ),
    },
  },
};

export const ReadOnly: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyRow}>
          <span className={storyStyles.storyLabel}>Average</span>
          <Rating readOnly value={3.5} allowHalf />
        </div>
        <div className={storyStyles.storyRow}>
          <span className={storyStyles.storyLabel}>Editorial</span>
          <Rating readOnly value={4} size="lg" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Rating readOnly value={3.5} allowHalf />',
          '  <Rating readOnly value={4} size="lg" />',
          '</>'
        )
      ),
    },
  },
};

export const SevenPointScale: Story = {
  args: {
    label: 'Customer satisfaction',
    max: 7,
    defaultValue: 5,
  },
  parameters: storySourceParameters(
    '<Rating label="Customer satisfaction" max={7} defaultValue={5} />'
  ),
};
