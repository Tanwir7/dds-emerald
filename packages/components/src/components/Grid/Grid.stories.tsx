import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { Grid, GridItem } from './Grid';
import { Container } from '../Container';
import { Text } from '../Text';
import storyStyles from './Grid.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Grid is the responsive CSS Grid layout primitive for Emerald.

### Accessibility contract

- Keyboard: Grid and GridItem add no keyboard behavior. Interactive children keep native tab order and activation.
- Screen readers: Grid adds no ARIA or semantics by default. Use \`as="ul"\` with \`<GridItem as="li">\` for semantic lists.
- Focus: Grid does not manage focus or reorder children. Keep DOM order aligned with the intended reading order.
- Designers: specify column counts by breakpoint, token-based gaps, and any spanning items that need to break rhythm.
- QA: verify rendered element choice, responsive class application, gap overrides, GridItem span classes, forwarded attributes, and axe coverage.`;

const cardData = [
  {
    title: 'Campaign Overview',
    body: 'Performance snapshots, pacing, and anomalies in one place.',
  },
  {
    title: 'Audience Signals',
    body: 'Intent, conversion quality, and segment shifts across channels.',
  },
  {
    title: 'Content Pipeline',
    body: 'Upcoming launches, review status, and production readiness.',
  },
  { title: 'Attribution Notes', body: 'Model changes and reporting caveats for stakeholders.' },
  { title: 'Ops Queue', body: 'Pending approvals, blockers, and issues that need action today.' },
  { title: 'Forecast', body: 'Projected spend, return, and confidence bands for the next sprint.' },
] as const;

const storyA11yScopeClassName = getRequiredClassName(storyStyles, 'storyA11yScope');
const storyExamplesClassName = getRequiredClassName(storyStyles, 'storyExamples');
const storySectionClassName = getRequiredClassName(storyStyles, 'storySection');
const storyCardClassName = getRequiredClassName(storyStyles, 'storyCard');
const storyNoteClassName = getRequiredClassName(storyStyles, 'storyNote');

const meta: Meta<typeof Grid> = {
  title: 'Core Components/Grid',
  component: Grid,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Grid>) => (
    <div className={storyA11yScopeClassName}>
      <Grid {...args} />
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
    children: 'Grid content',
  },
  argTypes: {
    as: {
      control: 'text',
    },
    columns: {
      control: 'object',
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
      options: ['start', 'center', 'end', 'stretch'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Grid>;

const Card = ({ children }: { children: ReactNode }) => (
  <Container className={storyCardClassName} padding="md" background="card" border>
    {children}
  </Container>
);

const contentCardGridSource = storySource(
  '<Grid columns={{ default: 1, md: 2, xl: 3 }} gap="md">',
  '  <Container padding="md" background="card" border>',
  '    <Text weight="semibold">Campaign Overview</Text>',
  '    <Text color="muted">Performance snapshots, pacing, and anomalies in one place.</Text>',
  '  </Container>',
  '  <Container padding="md" background="card" border>',
  '    <Text weight="semibold">Audience Signals</Text>',
  '    <Text color="muted">Intent, conversion quality, and segment shifts across channels.</Text>',
  '  </Container>',
  '  <Container padding="md" background="card" border>',
  '    <Text weight="semibold">Content Pipeline</Text>',
  '    <Text color="muted">Upcoming launches, review status, and production readiness.</Text>',
  '  </Container>',
  '</Grid>'
);

export const OneColumn: Story = {
  args: {
    columns: 1,
    children: (
      <>
        <Card>One</Card>
        <Card>Two</Card>
        <Card>Three</Card>
      </>
    ),
  },
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={1}>',
      '  <Container padding="md" background="card" border>One</Container>',
      '  <Container padding="md" background="card" border>Two</Container>',
      '  <Container padding="md" background="card" border>Three</Container>',
      '</Grid>'
    )
  ),
};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <Card>One</Card>
        <Card>Two</Card>
        <Card>Three</Card>
        <Card>Four</Card>
      </>
    ),
  },
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={2}>',
      '  <Container padding="md" background="card" border>One</Container>',
      '  <Container padding="md" background="card" border>Two</Container>',
      '  <Container padding="md" background="card" border>Three</Container>',
      '  <Container padding="md" background="card" border>Four</Container>',
      '</Grid>'
    )
  ),
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <Card>One</Card>
        <Card>Two</Card>
        <Card>Three</Card>
        <Card>Four</Card>
        <Card>Five</Card>
        <Card>Six</Card>
      </>
    ),
  },
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={3}>',
      '  <Container padding="md" background="card" border>One</Container>',
      '  <Container padding="md" background="card" border>Two</Container>',
      '  <Container padding="md" background="card" border>Three</Container>',
      '</Grid>'
    )
  ),
};

export const FourColumns: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <Card>One</Card>
        <Card>Two</Card>
        <Card>Three</Card>
        <Card>Four</Card>
      </>
    ),
  },
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={4}>',
      '  <Container padding="md" background="card" border>One</Container>',
      '  <Container padding="md" background="card" border>Two</Container>',
      '  <Container padding="md" background="card" border>Three</Container>',
      '  <Container padding="md" background="card" border>Four</Container>',
      '</Grid>'
    )
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Text className={storyNoteClassName} color="muted">
        Resize the Storybook viewport to see breakpoint changes from 1 to 2 to 3 columns.
      </Text>
      <Grid columns={{ default: 1, sm: 2, lg: 3 }} gap="md">
        {cardData.map((card) => (
          <Card key={card.title}>
            <Text weight="semibold">{card.title}</Text>
            <Text color="muted">{card.body}</Text>
          </Card>
        ))}
      </Grid>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={{ default: 1, sm: 2, lg: 3 }} gap="md">',
      '  <Container padding="md" background="card" border>...</Container>',
      '  <Container padding="md" background="card" border>...</Container>',
      '  <Container padding="md" background="card" border>...</Container>',
      '</Grid>'
    )
  ),
};

export const GapSizes: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <div className={storyExamplesClassName}>
        {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
          <section key={gap} className={storySectionClassName}>
            <Text weight="semibold">gap=&quot;{gap}&quot;</Text>
            <Grid columns={3} gap={gap}>
              <Card>One</Card>
              <Card>Two</Card>
              <Card>Three</Card>
            </Grid>
          </section>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Grid columns={3} gap="none">...</Grid>',
      '<Grid columns={3} gap="xs">...</Grid>',
      '<Grid columns={3} gap="sm">...</Grid>',
      '<Grid columns={3} gap="md">...</Grid>',
      '<Grid columns={3} gap="lg">...</Grid>',
      '<Grid columns={3} gap="xl">...</Grid>'
    )
  ),
};

export const WithColumnAndRowGap: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Grid columns={3} gap="xs" columnGap="xl" rowGap="sm">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index}>Panel {index + 1}</Card>
        ))}
      </Grid>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={3} gap="xs" columnGap="xl" rowGap="sm">',
      '  <Container padding="md" background="card" border>Panel 1</Container>',
      '  <Container padding="md" background="card" border>Panel 2</Container>',
      '  <Container padding="md" background="card" border>Panel 3</Container>',
      '</Grid>'
    )
  ),
};

export const GridItemSpanning: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Grid columns={3} gap="md">
        <GridItem colSpan={2}>
          <Card>Spans 2 columns</Card>
        </GridItem>
        <GridItem>
          <Card>Standard</Card>
        </GridItem>
        <GridItem colSpan="full">
          <Card>Full-width summary row</Card>
        </GridItem>
      </Grid>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={3} gap="md">',
      '  <GridItem colSpan={2}>',
      '    <Container padding="md" background="card" border>Spans 2 columns</Container>',
      '  </GridItem>',
      '  <GridItem>',
      '    <Container padding="md" background="card" border>Standard</Container>',
      '  </GridItem>',
      '  <GridItem colSpan="full">',
      '    <Container padding="md" background="card" border>Full-width summary row</Container>',
      '  </GridItem>',
      '</Grid>'
    )
  ),
};

export const ContentCardGrid: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Grid columns={{ default: 1, md: 2, xl: 3 }} gap="md">
        {cardData.map((card) => (
          <Card key={card.title}>
            <Text weight="semibold">{card.title}</Text>
            <Text color="muted">{card.body}</Text>
          </Card>
        ))}
      </Grid>
    </div>
  ),
  parameters: storySourceParameters(contentCardGridSource),
};

export const AlignCenter: Story = {
  render: () => (
    <div className={storyA11yScopeClassName}>
      <Grid columns={3} gap="md" align="center">
        <Card>
          <Text weight="semibold">Short</Text>
        </Card>
        <Card>
          <Text weight="semibold">Medium</Text>
          <Text color="muted">This item is slightly taller to show vertical alignment.</Text>
        </Card>
        <Card>
          <Text weight="semibold">Tall</Text>
          <Text color="muted">
            This item includes more copy so the card height differs and the centered alignment is
            visible.
          </Text>
        </Card>
      </Grid>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Grid columns={3} gap="md" align="center">',
      '  <Container padding="md" background="card" border>...</Container>',
      '  <Container padding="md" background="card" border>...</Container>',
      '  <Container padding="md" background="card" border>...</Container>',
      '</Grid>'
    )
  ),
};
