import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Link } from './Link';
import storyStyles from './Link.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Links render native anchors by default and support Radix Slot with \`asChild\` for router links such as Next.js \`Link\`.

### Accessibility contract

- Keyboard: Tab reaches links, Enter activates native anchors, and Emerald also supports Space activation for consistency with the component instruction.
- Screen readers: links expose the native link role and require meaningful visible text or an accessible name. External links append hidden "(opens in new tab)" text when rendered as native anchors.
- Focus: focus uses the Emerald outline ring with no rounded background treatment.
- Designers: provide concise link text that makes sense out of context, choose underline behavior intentionally, and avoid relying on color alone to identify destructive navigation.
- QA: verify href/asChild usage, keyboard activation, external-link announcements, focus visibility, and axe results for each variant.`;

const meta: Meta<typeof Link> = {
  title: 'Core Components/Link',
  component: Link,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Link>) => (
    <div className={storyStyles.storyA11yScope}>
      <Link {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  args: {
    children: 'Link',
    href: '#',
    variant: 'default',
    underline: 'hover',
    external: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'base', 'lg'],
    },
    underline: {
      control: 'inline-radio',
      options: ['always', 'hover', 'none'],
    },
    external: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    children: 'Documentation',
    href: '#',
  },
  parameters: storySourceParameters('<Link href="#">Documentation</Link>'),
};

export const Variants: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <p className={storyStyles.storyParagraph}>
        <Link href="#">Default link</Link>
        {' | '}
        <Link href="#" variant="muted">
          Muted link
        </Link>
        {' | '}
        <Link href="#" variant="destructive">
          Destructive link
        </Link>
      </p>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<p>',
      '  <Link href="#">Default link</Link>',
      '  <Link href="#" variant="muted">Muted link</Link>',
      '  <Link href="#" variant="destructive">Destructive link</Link>',
      '</p>'
    )
  ),
};

export const UnderlineStyles: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Link href="#" underline="always">
          Always
        </Link>
        <Link href="#" underline="hover">
          Hover
        </Link>
        <Link href="#" underline="none">
          None
        </Link>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Link href="#" underline="always">Always</Link>',
      '<Link href="#" underline="hover">Hover</Link>',
      '<Link href="#" underline="none">None</Link>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Link href="#" size="sm">
          Small link
        </Link>
        <Link href="#" size="base">
          Base link
        </Link>
        <Link href="#" size="lg">
          Large link
        </Link>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Link href="#" size="sm">Small link</Link>',
      '<Link href="#" size="base">Base link</Link>',
      '<Link href="#" size="lg">Large link</Link>'
    )
  ),
};

export const InheritedSize: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <p className={storyStyles.storyParagraph}>
          Paragraph text with an <Link href="#">inherited inline link</Link>.
        </p>
        <h2 className={storyStyles.storyHeading}>
          Heading with an <Link href="#">inherited link</Link>
        </h2>
        <small>
          Small text with an <Link href="#">inherited link</Link>.
        </small>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <p>Paragraph text with an <Link href="#">inherited inline link</Link>.</p>',
      '  <h2>Heading with an <Link href="#">inherited link</Link></h2>',
      '  <small>Small text with an <Link href="#">inherited link</Link>.</small>',
      '</>'
    )
  ),
};

export const External: Story = {
  args: {
    href: 'https://digitaldev.studio',
    external: true,
    children: 'DDS website',
  },
  parameters: storySourceParameters(
    '<Link href="https://digitaldev.studio" external>DDS website</Link>'
  ),
};

export const AsChildNextLink: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Link asChild>
        <a href="/dashboard">Dashboard</a>
      </Link>
    </div>
  ),
  parameters: {
    ...storySourceParameters(
      storySource('<Link asChild>', '  <NextLink href="/dashboard">Dashboard</NextLink>', '</Link>')
    ),
    docs: {
      ...storySourceParameters(
        storySource(
          '<Link asChild>',
          '  <NextLink href="/dashboard">Dashboard</NextLink>',
          '</Link>'
        )
      ).docs,
      description: {
        story:
          'Storybook simulates a router link with a plain anchor. In a Next.js app, use `<Link asChild><NextLink href="/dashboard">Dashboard</NextLink></Link>`.',
      },
    },
  },
};

export const InlineParagraph: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <p className={storyStyles.storyParagraph}>
        Review the <Link href="#">release notes</Link> before promoting the package.
      </p>
    </div>
  ),
  parameters: storySourceParameters(
    '<p>Review the <Link href="#">release notes</Link> before promoting the package.</p>'
  ),
};

export const FocusVisible: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Link href="#">Focusable link</Link>
    </div>
  ),
  parameters: storySourceParameters('<Link href="#">Focusable link</Link>'),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};
