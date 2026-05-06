import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flex } from '../Flex';
import { Text as BodyText } from '../Text';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import { Skeleton } from './Skeleton';
import storyStyles from './Skeleton.stories.module.scss';

const componentDescription = `Skeleton is a visual-only loading placeholder used to mirror the structure of content before data is ready.

### Accessibility contract

- Keyboard: no interaction, no focus target, no tab stop.
- Screen readers: every rendered placeholder is \`aria-hidden="true"\`; the parent loading region should carry the announcement with \`role="status"\` and \`aria-busy="true"\`.
- Motion: shimmer is disabled when the user enables \`prefers-reduced-motion\`.
- Designers: compose multiple Skeleton instances to match the final layout instead of adding fake text labels; put any loading label on the parent status region.
- QA: verify multi-line text uses a shorter final line, circular placeholders keep equal width and height, and axe stays clean.`;

const meta: Meta<typeof Skeleton> = {
  title: 'Core Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
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
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

const renderRectangularStory = (args: ComponentProps<typeof Skeleton>) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyFrame}>
      <div className={storyStyles.storyRectangularFrame}>
        <Skeleton {...args} />
      </div>
    </div>
  </div>
);

const renderTextStory = (args: ComponentProps<typeof Skeleton>) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyFrame}>
      <div className={storyStyles.storyTextFrame}>
        <Skeleton {...args} />
      </div>
    </div>
  </div>
);

export const Rectangular: Story = {
  args: {
    width: '100%',
    height: '80px',
  },
  render: (args) => renderRectangularStory(args),
  parameters: storySourceParameters('<Skeleton width="100%" height="80px" />'),
};

export const Text: Story = {
  args: {
    variant: 'text',
  },
  render: (args) => renderTextStory(args),
  parameters: storySourceParameters('<Skeleton variant="text" />'),
};

export const TextMultiline: Story = {
  args: {
    variant: 'text',
    lines: 3,
  },
  render: (args) => renderTextStory(args),
  parameters: storySourceParameters('<Skeleton variant="text" lines={3} />'),
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: '48px',
  },
  render: (args) => renderTextStory(args),
  parameters: storySourceParameters('<Skeleton variant="circular" width="48px" />'),
};

export const CardSkeleton: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div
        className={storyStyles.cardShell}
        role="status"
        aria-busy="true"
        aria-label="Loading profile card"
      >
        <div className={storyStyles.cardHeader}>
          <Skeleton variant="circular" width="48px" />
          <div className={storyStyles.cardContent}>
            <Skeleton variant="text" width="160px" />
            <Skeleton variant="text" width="112px" />
          </div>
        </div>
        <Skeleton variant="rectangular" height="120px" />
        <Skeleton variant="rectangular" width="128px" height="40px" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<div role="status" aria-busy="true" aria-label="Loading profile card">',
          '  <Skeleton variant="circular" width="48px" />',
          '  <Skeleton variant="text" width="160px" />',
          '  <Skeleton variant="text" width="112px" />',
          '  <Skeleton variant="rectangular" height="120px" />',
          '  <Skeleton variant="rectangular" width="128px" height="40px" />',
          '</div>'
        )
      ),
    },
  },
};

export const TableSkeleton: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div
        className={storyStyles.tableShell}
        role="status"
        aria-busy="true"
        aria-label="Loading table"
      >
        <div className={storyStyles.tableHeader}>
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="72px" />
          <Skeleton variant="text" width="72px" />
          <Skeleton variant="text" width="72px" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={storyStyles.tableRow}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="56%" />
            <Skeleton variant="rectangular" width="88px" height="32px" />
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<div role="status" aria-busy="true" aria-label="Loading table">',
          '  <div>',
          '    <Skeleton variant="text" width="120px" />',
          '    <Skeleton variant="text" width="72px" />',
          '    <Skeleton variant="text" width="72px" />',
          '    <Skeleton variant="text" width="72px" />',
          '  </div>',
          '  {Array.from({ length: 3 }, (_, index) => (',
          '    <div key={index}>',
          '      <Skeleton variant="text" width="80%" />',
          '      <Skeleton variant="text" width="60%" />',
          '      <Skeleton variant="text" width="56%" />',
          '      <Skeleton variant="rectangular" width="88px" height="32px" />',
          '    </div>',
          '  ))}',
          '</div>'
        )
      ),
    },
  },
};

export const ReducedMotion: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Flex direction="column" gap="sm">
        <Skeleton variant="rectangular" width="100%" height="80px" />
        <BodyText as="p" size="sm" color="muted" className={storyStyles.storyNote || ''}>
          Add `prefers-reduced-motion` emulation in the browser to see the shimmer disabled.
        </BodyText>
      </Flex>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Skeleton width="100%" height="80px" />',
          '  <p>Add `prefers-reduced-motion` emulation in the browser to see the shimmer disabled.</p>',
          '</>'
        )
      ),
    },
  },
};
