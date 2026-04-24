import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { Container } from './Container';
import storyStyles from './Container.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Container is Emerald's foundational layout primitive. It renders a native element by default, supports semantic selection through \`as\`, supports Radix Slot through \`asChild\`, and exposes only token-mapped padding, background, border, and radius shortcuts.

### Accessibility contract

- Keyboard: Container adds no keyboard behavior. Interactive children keep their native keyboard behavior.
- Screen readers: Container adds no ARIA. Consumers choose semantic elements with \`as\` and provide landmark names with \`aria-label\` or \`aria-labelledby\` when needed.
- Focus: Container does not manage focus. Composed interactive descendants remain responsible for visible focus states.
- Designers: document required semantics for landmarks, regions, and grouped content rather than relying on visual grouping alone.
- QA: verify the rendered element, landmark naming, forwarded attributes, asChild composition, token-backed visual classes, and axe results.`;

const storySwatchClassName = getRequiredClassName(storyStyles, 'storySwatch');
const storyNestedClassName = getRequiredClassName(storyStyles, 'storyNested');

const meta: Meta<typeof Container> = {
  title: 'Core Components/Container',
  component: Container,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Container>) => (
    <div className={storyStyles.storyA11yScope}>
      <Container {...args} />
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
    children: 'Container content',
  },
  argTypes: {
    as: {
      control: 'text',
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    paddingX: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    paddingY: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    background: {
      control: 'select',
      options: ['default', 'subtle', 'card', 'muted'],
    },
    border: {
      control: 'boolean',
    },
    borderRadius: {
      control: 'inline-radio',
      options: ['none', 'full'],
    },
    asChild: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: 'Container content',
  },
  parameters: storySourceParameters('<Container>Container content</Container>'),
};

export const WithPadding: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((padding) => (
          <Container key={padding} padding={padding} background="subtle">
            <p className={storyStyles.storyContent}>padding={padding}</p>
          </Container>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Container padding="none" background="subtle">padding="none"</Container>',
      '<Container padding="xs" background="subtle">padding="xs"</Container>',
      '<Container padding="sm" background="subtle">padding="sm"</Container>',
      '<Container padding="md" background="subtle">padding="md"</Container>',
      '<Container padding="lg" background="subtle">padding="lg"</Container>',
      '<Container padding="xl" background="subtle">padding="xl"</Container>'
    )
  ),
};

export const PaddingXY: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Container paddingX="xl" paddingY="xs" background="subtle">
          {'paddingX="xl" paddingY="xs"'}
        </Container>
        <Container paddingX="xs" paddingY="xl" background="subtle">
          {'paddingX="xs" paddingY="xl"'}
        </Container>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Container paddingX="xl" paddingY="xs" background="subtle">paddingX="xl" paddingY="xs"</Container>',
      '<Container paddingX="xs" paddingY="xl" background="subtle">paddingX="xs" paddingY="xl"</Container>'
    )
  ),
};

export const Backgrounds: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        {(['default', 'subtle', 'card', 'muted'] as const).map((background) => (
          <Container
            key={background}
            className={storySwatchClassName}
            padding="md"
            background={background}
            border
          >
            {background}
          </Container>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Container padding="md" background="default" border>default</Container>',
      '<Container padding="md" background="subtle" border>subtle</Container>',
      '<Container padding="md" background="card" border>card</Container>',
      '<Container padding="md" background="muted" border>muted</Container>'
    )
  ),
};

export const WithBorder: Story = {
  args: {
    padding: 'md',
    border: true,
    children: 'Bordered container',
  },
  parameters: storySourceParameters(
    '<Container padding="md" border>Bordered container</Container>'
  ),
};

export const PolymorphicAs: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Container as="section" aria-label="Billing summary" padding="md" background="subtle">
          Section content
        </Container>
        <Container as="article" aria-label="Release note" padding="md" background="subtle">
          Article content
        </Container>
        <Container as="aside" aria-label="Related links" padding="md" background="subtle">
          Aside content
        </Container>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Container as="section" aria-label="Billing summary" padding="md" background="subtle">Section content</Container>',
      '<Container as="article" aria-label="Release note" padding="md" background="subtle">Article content</Container>',
      '<Container as="aside" aria-label="Related links" padding="md" background="subtle">Aside content</Container>'
    )
  ),
};

export const AsChildPattern: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Container asChild padding="md" background="subtle" border>
        <a className={storyStyles.storyLink} href="/components/container">
          Container as a composed anchor
        </a>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Container asChild padding="md" background="subtle" border>',
      '  <a href="/components/container">Container as a composed anchor</a>',
      '</Container>'
    )
  ),
};

export const Composed: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Container className={storyNestedClassName} padding="lg" background="subtle">
        <Container padding="md" background="card" border>
          Nested Container content
        </Container>
      </Container>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Container padding="lg" background="subtle">',
      '  <Container padding="md" background="card" border>',
      '    Nested Container content',
      '  </Container>',
      '</Container>'
    )
  ),
};
