import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Container } from '../Container';
import { Flex } from '../Flex';
import { Stack } from '../Stack';
import { Spacer } from './Spacer';
import storyStyles from './Spacer.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Spacer inserts decorative whitespace between specific siblings, or fills remaining space inside a flex row or column when \`size="flex"\`.

### Accessibility contract

- Keyboard: Spacer adds no keyboard behavior and must never be focusable.
- Screen readers: Spacer is always \`aria-hidden="true"\`, so it is excluded from the accessibility tree.
- Focus: Spacer does not participate in focus order or focus management.
- Designers: prefer parent \`gap\` for uniform spacing; use Spacer only for one-off separation or flex push layouts.
- QA: verify the rendered element, token class selection, axis modifiers, forwarded props, and axe coverage in representative layouts.`;

const meta: Meta<typeof Spacer> = {
  title: 'Core Components/Spacer',
  component: Spacer,
  tags: ['autodocs'],
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Spacer {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'flex'],
    },
    axis: {
      control: 'inline-radio',
      options: ['both', 'horizontal', 'vertical'],
    },
    as: {
      control: 'inline-radio',
      options: ['span', 'div'],
    },
  },
  args: {
    size: 'md',
    axis: 'both',
    as: 'span',
  },
};

export default meta;

type Story = StoryObj<typeof Spacer>;

const withClassName = (className?: string) => (className ? { className } : {});

const Box = ({ children, tall = false }: { children: ReactNode; tall?: boolean }) => (
  <Container
    {...withClassName(
      tall ? `${storyStyles.storyBox} ${storyStyles.storyTallBox}` : storyStyles.storyBox
    )}
    padding="md"
    background="card"
    border
  >
    {children}
  </Container>
);

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Flex align="center">
        <Box>Alpha</Box>
        <Spacer size="md" />
        <Box>Beta</Box>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex align="center">',
      '  <Container padding="md" background="card" border>Alpha</Container>',
      '  <Spacer size="md" />',
      '  <Container padding="md" background="card" border>Beta</Container>',
      '</Flex>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack gap="md">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Flex key={size} align="center">
            <Box>{size}</Box>
            <Spacer size={size} axis="horizontal" />
            <Box>Spacer</Box>
          </Flex>
        ))}
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Flex align="center"><Container>xs</Container><Spacer size="xs" axis="horizontal" /><Container>Spacer</Container></Flex>',
      '<Flex align="center"><Container>sm</Container><Spacer size="sm" axis="horizontal" /><Container>Spacer</Container></Flex>',
      '<Flex align="center"><Container>md</Container><Spacer size="md" axis="horizontal" /><Container>Spacer</Container></Flex>',
      '<Flex align="center"><Container>lg</Container><Spacer size="lg" axis="horizontal" /><Container>Spacer</Container></Flex>',
      '<Flex align="center"><Container>xl</Container><Spacer size="xl" axis="horizontal" /><Container>Spacer</Container></Flex>'
    )
  ),
};

export const HorizontalAxis: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Flex align="center">
        <Box>Filters</Box>
        <Spacer size="lg" axis="horizontal" />
        <Box>Actions</Box>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex align="center">',
      '  <Container padding="md" background="card" border>Filters</Container>',
      '  <Spacer size="lg" axis="horizontal" />',
      '  <Container padding="md" background="card" border>Actions</Container>',
      '</Flex>'
    )
  ),
};

export const VerticalAxis: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack gap="none">
        <Box>Heading</Box>
        <Spacer size="lg" axis="vertical" as="div" />
        <Box>Supporting content</Box>
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack gap="none">',
      '  <Container padding="md" background="card" border>Heading</Container>',
      '  <Spacer size="lg" axis="vertical" as="div" />',
      '  <Container padding="md" background="card" border>Supporting content</Container>',
      '</Stack>'
    )
  ),
};

export const FlexPush: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Container
        {...withClassName(storyStyles.storyFlexFrame)}
        padding="md"
        background="subtle"
        border
      >
        <Flex align="center" gap="md">
          <Box>Logo</Box>
          <Spacer size="flex" axis="horizontal" />
          <Box>Docs</Box>
          <Box>GitHub</Box>
        </Flex>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex align="center" gap="md">',
      '  <Container padding="md" background="card" border>Logo</Container>',
      '  <Spacer size="flex" axis="horizontal" />',
      '  <Container padding="md" background="card" border>Docs</Container>',
      '  <Container padding="md" background="card" border>GitHub</Container>',
      '</Flex>'
    )
  ),
};

export const VsGap: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Flex gap="lg" {...withClassName(storyStyles.storyComparison)}>
        <Container
          {...withClassName(storyStyles.storySection)}
          padding="md"
          background="subtle"
          border
        >
          <p className={storyStyles.storyLabel}>Stack gap=&quot;md&quot;</p>
          <Stack gap="md">
            <Box>Title</Box>
            <Box>Summary</Box>
            <Box>Metadata</Box>
          </Stack>
        </Container>
        <Container
          {...withClassName(storyStyles.storySection)}
          padding="md"
          background="subtle"
          border
        >
          <p className={storyStyles.storyLabel}>Spacer between specific children</p>
          <Stack gap="none">
            <Box>Title</Box>
            <Spacer size="md" axis="vertical" as="div" />
            <Box>Summary</Box>
            <Box>Metadata</Box>
          </Stack>
        </Container>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <Stack gap="md">',
      '    <Container padding="md" background="card" border>Title</Container>',
      '    <Container padding="md" background="card" border>Summary</Container>',
      '    <Container padding="md" background="card" border>Metadata</Container>',
      '  </Stack>',
      '  <Stack gap="none">',
      '    <Container padding="md" background="card" border>Title</Container>',
      '    <Spacer size="md" axis="vertical" as="div" />',
      '    <Container padding="md" background="card" border>Summary</Container>',
      '    <Container padding="md" background="card" border>Metadata</Container>',
      '  </Stack>',
      '</>'
    )
  ),
};
