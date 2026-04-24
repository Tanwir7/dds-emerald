import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { Stack } from './Stack';
import { Container } from '../Container';
import storyStyles from './Stack.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Stack arranges children in one direction with token-driven gaps and flex alignment controls.

### Accessibility contract

- Keyboard: Stack adds no keyboard behavior. Interactive children retain their native keyboard order and behavior.
- Screen readers: Stack adds no ARIA. Consumers choose semantic elements with \`as\`; use \`aria-label\` or \`aria-labelledby\` for landmarks such as \`nav\`.
- Focus: Stack does not manage focus or roving tab order.
- Designers: specify direction, gap, alignment, wrapping, and whether dividers are meaningful decoration between grouped items.
- QA: verify the rendered element, list semantics when \`as="ul"\` or \`as="ol"\`, divider count and orientation, forwarded attributes, and axe results. Horizontal dividers use vertical Divider instances, so child items should establish a consistent height.`;

const storyItemClassName = getRequiredClassName(storyStyles, 'storyItem');
const storyJustifyFrameClassName = getRequiredClassName(storyStyles, 'storyJustifyFrame');
const storyWrapItemClassName = getRequiredClassName(storyStyles, 'storyWrapItem');
const storyInlineItemClassName = getRequiredClassName(storyStyles, 'storyInlineItem');
const storyListClassName = getRequiredClassName(storyStyles, 'storyList');
const storyListItemClassName = getRequiredClassName(storyStyles, 'storyListItem');

const Item = ({ children }: { children: ReactNode }) => (
  <Container className={storyItemClassName} padding="md" background="subtle" border>
    {children}
  </Container>
);

const meta: Meta<typeof Stack> = {
  title: 'Core Components/Stack',
  component: Stack,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Stack>) => (
    <div className={storyStyles.storyA11yScope}>
      <Stack {...args} />
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
  args: {
    children: 'Stack content',
  },
  argTypes: {
    as: {
      control: 'text',
    },
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: {
      control: 'boolean',
    },
    inline: {
      control: 'boolean',
    },
    dividers: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Stack>;

const verticalStoryRender = () => (
  <div className={storyStyles.storyA11yScope}>
    <Stack gap="md">
      <Item>Profile</Item>
      <Item>Security</Item>
      <Item>Billing</Item>
    </Stack>
  </div>
);

const verticalStorySource = storySource(
  '<Stack gap="md">',
  '  <Container padding="md" background="subtle" border>Profile</Container>',
  '  <Container padding="md" background="subtle" border>Security</Container>',
  '  <Container padding="md" background="subtle" border>Billing</Container>',
  '</Stack>'
);

export const Default: Story = {
  render: verticalStoryRender,
  parameters: storySourceParameters(verticalStorySource),
};

export const Vertical: Story = {
  render: verticalStoryRender,
  parameters: storySourceParameters(verticalStorySource),
};

export const Horizontal: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack direction="horizontal">
        <Item>Draft</Item>
        <Item>Review</Item>
        <Item>Publish</Item>
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack direction="horizontal">',
      '  <Container padding="md" background="subtle" border>Draft</Container>',
      '  <Container padding="md" background="subtle" border>Review</Container>',
      '  <Container padding="md" background="subtle" border>Publish</Container>',
      '</Stack>'
    )
  ),
};

export const GapSizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack gap="lg">
        {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
          <Stack key={gap} gap={gap}>
            <Item>gap={gap}</Item>
            <Item>Second item</Item>
          </Stack>
        ))}
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Stack gap="none"><Container>gap="none"</Container><Container>Second item</Container></Stack>',
      '<Stack gap="xs"><Container>gap="xs"</Container><Container>Second item</Container></Stack>',
      '<Stack gap="sm"><Container>gap="sm"</Container><Container>Second item</Container></Stack>',
      '<Stack gap="md"><Container>gap="md"</Container><Container>Second item</Container></Stack>',
      '<Stack gap="lg"><Container>gap="lg"</Container><Container>Second item</Container></Stack>',
      '<Stack gap="xl"><Container>gap="xl"</Container><Container>Second item</Container></Stack>'
    )
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack gap="lg">
        {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
          <Stack key={align} direction="horizontal" align={align}>
            <Item>align={align}</Item>
            <Item>Item</Item>
          </Stack>
        ))}
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Stack direction="horizontal" align="start">...</Stack>',
      '<Stack direction="horizontal" align="center">...</Stack>',
      '<Stack direction="horizontal" align="end">...</Stack>',
      '<Stack direction="horizontal" align="stretch">...</Stack>',
      '<Stack direction="horizontal" align="baseline">...</Stack>'
    )
  ),
};

export const Justify: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack gap="lg">
        {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((justify) => (
          <Container key={justify} className={storyJustifyFrameClassName} padding="sm" border>
            <Stack direction="horizontal" justify={justify}>
              <Item>{justify}</Item>
              <Item>Item</Item>
            </Stack>
          </Container>
        ))}
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Stack direction="horizontal" justify="start">...</Stack>',
      '<Stack direction="horizontal" justify="center">...</Stack>',
      '<Stack direction="horizontal" justify="end">...</Stack>',
      '<Stack direction="horizontal" justify="between">...</Stack>',
      '<Stack direction="horizontal" justify="around">...</Stack>',
      '<Stack direction="horizontal" justify="evenly">...</Stack>'
    )
  ),
};

export const Wrap: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack direction="horizontal" wrap>
        {Array.from({ length: 10 }, (_, index) => (
          <Container
            key={index}
            className={storyWrapItemClassName}
            padding="sm"
            background="subtle"
            border
          >
            Item {index + 1}
          </Container>
        ))}
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack direction="horizontal" wrap>',
      '  <Container padding="sm" background="subtle" border>Item 1</Container>',
      '  <Container padding="sm" background="subtle" border>Item 2</Container>',
      '  <Container padding="sm" background="subtle" border>Item 3</Container>',
      '</Stack>'
    )
  ),
};

export const WithDividers: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack dividers>
        <Item>Profile</Item>
        <Item>Security</Item>
        <Item>Billing</Item>
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack dividers>',
      '  <Container>Profile</Container>',
      '  <Container>Security</Container>',
      '  <Container>Billing</Container>',
      '</Stack>'
    )
  ),
};

export const WithDividersHorizontal: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack direction="horizontal" dividers>
        <Item>Profile</Item>
        <Item>Security</Item>
        <Item>Billing</Item>
      </Stack>
    </div>
  ),
  parameters: {
    ...storySourceParameters(
      storySource(
        '<Stack direction="horizontal" dividers>',
        '  <Container>Profile</Container>',
        '  <Container>Security</Container>',
        '  <Container>Billing</Container>',
        '</Stack>'
      )
    ),
    docs: {
      ...storySourceParameters(
        storySource(
          '<Stack direction="horizontal" dividers>',
          '  <Container>Profile</Container>',
          '  <Container>Security</Container>',
          '  <Container>Billing</Container>',
          '</Stack>'
        )
      ).docs,
      description: {
        story:
          'Horizontal dividers use vertical Divider instances. Keep child item heights consistent so dividers have a clear height to fill.',
      },
    },
  },
};

export const Inline: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <p className={storyStyles.storyParagraph}>
        Status:{' '}
        <Stack as="span" inline direction="horizontal" gap="xs">
          <span className={storyInlineItemClassName}>Draft</span>
          <span className={storyInlineItemClassName}>Ready</span>
        </Stack>{' '}
        in the publishing flow.
      </p>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<p>',
      '  Status: <Stack as="span" inline direction="horizontal" gap="xs"><span>Draft</span><span>Ready</span></Stack> in the publishing flow.',
      '</p>'
    )
  ),
};

export const PolymorphicUl: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack as="ul" className={storyListClassName}>
        <li className={storyListItemClassName}>Use list item children</li>
        <li className={storyListItemClassName}>Keep semantic list structure</li>
        <li className={storyListItemClassName}>Avoid replacing bullets with layout-only markup</li>
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack as="ul">',
      '  <li>Use list item children</li>',
      '  <li>Keep semantic list structure</li>',
      '  <li>Avoid replacing bullets with layout-only markup</li>',
      '</Stack>'
    )
  ),
};

export const Nested: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack>
        <Item>Account settings</Item>
        <Stack direction="horizontal" wrap>
          <Item>Profile</Item>
          <Item>Security</Item>
          <Item>Billing</Item>
        </Stack>
      </Stack>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack>',
      '  <Container>Account settings</Container>',
      '  <Stack direction="horizontal" wrap>',
      '    <Container>Profile</Container>',
      '    <Container>Security</Container>',
      '    <Container>Billing</Container>',
      '  </Stack>',
      '</Stack>'
    )
  ),
};
