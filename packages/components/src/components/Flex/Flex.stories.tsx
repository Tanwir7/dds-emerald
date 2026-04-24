import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { Flex, FlexItem } from './Flex';
import { Container } from '../Container';
import { Text } from '../Text';
import { Heading } from '../Heading';
import { Button } from '../Button';
import { Input } from '../Input';
import { Label } from '../Label';
import storyStyles from './Flex.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Flex is Emerald's low-level flexbox primitive for multi-axis layout control.

### Accessibility contract

- Keyboard: Flex and FlexItem add no keyboard behavior. Interactive descendants keep their native tab order and activation behavior.
- Screen readers: Flex adds no ARIA or semantics by default. Use semantic elements such as \`nav\`, \`ul\`, and \`li\` when structure matters.
- Focus: Flex does not manage focus. Avoid using \`FlexItem.order\` because visual and DOM order diverge for keyboard and screen reader users.
- Designers: specify direction, wrapping, alignment, token-based gaps, and whether any items are expected to grow or fill available space.
- QA: verify element rendering, token class application, wrapping, grow and shrink behavior, semantic list usage, and axe coverage for representative layouts.`;

const storyA11yScopeClassName = getRequiredClassName(storyStyles, 'storyA11yScope');
const storyFrameClassName = getRequiredClassName(storyStyles, 'storyFrame');
const storyWrapFrameClassName = getRequiredClassName(storyStyles, 'storyWrapFrame');
const storyNavClassName = getRequiredClassName(storyStyles, 'storyNav');
const storyNavLinksClassName = getRequiredClassName(storyStyles, 'storyNavLinks');
const storyAlignTallClassName = getRequiredClassName(storyStyles, 'storyAlignTall');
const storyAlignShortClassName = getRequiredClassName(storyStyles, 'storyAlignShort');
const storyChipClassName = getRequiredClassName(storyStyles, 'storyChip');
const storyFieldClassName = getRequiredClassName(storyStyles, 'storyField');
const storyBasisItemClassName = getRequiredClassName(storyStyles, 'storyBasisItem');

const meta: Meta<typeof Flex> = {
  title: 'Core Components/Flex',
  component: Flex,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Flex>) => (
    <div className={storyA11yScopeClassName}>
      <Flex {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    a11y: {
      context: '.' + storyA11yScopeClassName,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  args: {
    children: 'Flex content',
  },
  argTypes: {
    as: {
      control: 'text',
    },
    inline: {
      control: 'boolean',
    },
    direction: {
      control: 'select',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    columnGap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    rowGap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly', 'stretch'],
    },
    grow: {
      control: 'boolean',
    },
    shrink: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Flex>;

const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <Container {...(className ? { className } : {})} padding="md" background="card" border>
    {children}
  </Container>
);

export const Row: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Flex gap="md">
        <Card>Filters</Card>
        <Card>Segments</Card>
        <Card>Actions</Card>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex gap="md">',
      '  <Container padding="md" background="card" border>Filters</Container>',
      '  <Container padding="md" background="card" border>Segments</Container>',
      '  <Container padding="md" background="card" border>Actions</Container>',
      '</Flex>'
    )
  ),
};

export const Column: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Flex direction="column" gap="md">
        <Card>Overview</Card>
        <Card>Performance</Card>
        <Card>Forecast</Card>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex direction="column" gap="md">',
      '  <Container padding="md" background="card" border>Overview</Container>',
      '  <Container padding="md" background="card" border>Performance</Container>',
      '  <Container padding="md" background="card" border>Forecast</Container>',
      '</Flex>'
    )
  ),
};

export const JustifyBetween: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Container className={storyFrameClassName} padding="sm" background="subtle" border>
        <Flex justify="between" align="center">
          <Card>Pipeline</Card>
          <Card>Refresh</Card>
        </Flex>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Container padding="sm" background="subtle" border>',
      '  <Flex justify="between" align="center">',
      '    <Container padding="md" background="card" border>Pipeline</Container>',
      '    <Container padding="md" background="card" border>Refresh</Container>',
      '  </Flex>',
      '</Container>'
    )
  ),
};

export const AlignCenter: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Flex align="center" gap="md">
        <Card className={storyAlignTallClassName}>
          <Text>Summary</Text>
        </Card>
        <Card className={storyAlignShortClassName}>
          <Text>Live</Text>
        </Card>
        <Card>
          <Text>Queued</Text>
        </Card>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex align="center" gap="md">',
      '  <Container padding="md" background="card" border>Summary</Container>',
      '  <Container padding="md" background="card" border>Live</Container>',
      '  <Container padding="md" background="card" border>Queued</Container>',
      '</Flex>'
    )
  ),
};

export const Wrap: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Container className={storyWrapFrameClassName} padding="sm" background="subtle" border>
        <Flex gap="sm" wrap="wrap">
          {Array.from({ length: 10 }, (_, index) => (
            <Card key={index} className={storyChipClassName}>
              Item {index + 1}
            </Card>
          ))}
        </Flex>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex gap="sm" wrap="wrap">',
      '  <Container padding="md" background="card" border>Item 1</Container>',
      '  <Container padding="md" background="card" border>Item 2</Container>',
      '  <Container padding="md" background="card" border>Item 3</Container>',
      '</Flex>'
    )
  ),
};

export const GrowItem: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Container className={storyFrameClassName} padding="sm" background="subtle" border>
        <Flex gap="md" align="center">
          <Card>Label</Card>
          <FlexItem grow>
            <Card>Growing content area</Card>
          </FlexItem>
          <Card>Meta</Card>
        </Flex>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex gap="md" align="center">',
      '  <Container padding="md" background="card" border>Label</Container>',
      '  <FlexItem grow>',
      '    <Container padding="md" background="card" border>Growing content area</Container>',
      '  </FlexItem>',
      '  <Container padding="md" background="card" border>Meta</Container>',
      '</Flex>'
    )
  ),
};

export const NavBar: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Container className={storyNavClassName} padding="md" background="subtle" border>
        <Flex as="nav" aria-label="Primary" justify="between" align="center" gap="md">
          <Heading as="h2" size="4xl">
            Emerald
          </Heading>
          <Flex className={storyNavLinksClassName} gap="sm" as="ul">
            <FlexItem as="li">
              <Button variant="ghost">Dashboard</Button>
            </FlexItem>
            <FlexItem as="li">
              <Button variant="ghost">Workflows</Button>
            </FlexItem>
            <FlexItem as="li">
              <Button variant="ghost">Reports</Button>
            </FlexItem>
          </Flex>
          <Flex gap="sm">
            <Button variant="secondary">Invite</Button>
            <Button>Deploy</Button>
          </Flex>
        </Flex>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex as="nav" aria-label="Primary" justify="between" align="center">',
      '  <Heading as="h2" size="h4">Emerald</Heading>',
      '  <Flex as="ul" gap="sm">',
      '    <FlexItem as="li"><Button variant="ghost">Dashboard</Button></FlexItem>',
      '    <FlexItem as="li"><Button variant="ghost">Workflows</Button></FlexItem>',
      '    <FlexItem as="li"><Button variant="ghost">Reports</Button></FlexItem>',
      '  </Flex>',
      '  <Flex gap="sm">',
      '    <Button variant="secondary">Invite</Button>',
      '    <Button>Deploy</Button>',
      '  </Flex>',
      '</Flex>'
    )
  ),
};

export const FormRow: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Flex align="end" gap="sm">
        <Flex direction="column" gap="xs" className={storyFieldClassName}>
          <Label htmlFor="workspace-name">Workspace</Label>
          <Input id="workspace-name" placeholder="DDS Emerald" />
        </Flex>
        <Button>Create</Button>
      </Flex>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Flex align="end" gap="sm">',
      '  <Flex direction="column" gap="xs">',
      '    <Label htmlFor="workspace-name">Workspace</Label>',
      '    <Input id="workspace-name" placeholder="DDS Emerald" />',
      '  </Flex>',
      '  <Button>Create</Button>',
      '</Flex>'
    )
  ),
};

export const FlexItemBasis: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Container className={storyFrameClassName} padding="sm" background="subtle" border>
        <Flex gap="md" wrap="wrap">
          <FlexItem basis="auto">
            <Card className={storyBasisItemClassName}>basis=&quot;auto&quot;</Card>
          </FlexItem>
          <FlexItem basis="0" grow>
            <Card className={storyBasisItemClassName}>basis=&quot;0&quot; + grow</Card>
          </FlexItem>
          <FlexItem basis="full">
            <Card className={storyBasisItemClassName}>basis=&quot;full&quot;</Card>
          </FlexItem>
        </Flex>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<FlexItem basis="auto"><Container>basis="auto"</Container></FlexItem>',
      '<FlexItem basis="0" grow><Container>basis="0" + grow</Container></FlexItem>',
      '<FlexItem basis="full"><Container>basis="full"</Container></FlexItem>'
    )
  ),
};
