import type { Meta, StoryObj } from '@storybook/react-vite';
import clsx from 'clsx';
import { ArrowRight, BookOpen, Compass, Layers3, Sparkles } from 'lucide-react';
import React from 'react';
import { Button } from '../Button';
import { Link } from '../Link';
import { storySource, storySourceParameters } from '../../utils/storySource';
import {
  FlyoutMenuCTABar,
  FlyoutMenuFeaturedCard,
  FlyoutMenuFeaturedHighlight,
  FlyoutMenuFooter,
  FlyoutMenuGroup,
  FlyoutMenuGroupLabel,
  FlyoutMenuLink,
} from './FlyoutMenu';
import type { FlyoutMenuLayout } from './FlyoutMenu';
import runtimeStyles from './FlyoutMenu.module.scss';
import storyStyles from './FlyoutMenu.stories.module.scss';

const componentDescription = `FlyoutMenu renders a rich navigation panel anchored to a header trigger.

- Use FlyoutMenu for destinations and content discovery, not action menus.
- The trigger is composed with \`asChild\` so consumers can use their own nav link or button.
- Hover opens by default, keyboard focus also opens, and Escape closes the panel with focus return handled by Radix.
- Links remain semantic anchors and active destinations expose \`aria-current="page"\`.`;

const featuredImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="%23eef5f1"/><rect x="56" y="56" width="528" height="248" fill="%23d9e9df"/><rect x="88" y="94" width="180" height="20" fill="%23719a84"/><rect x="88" y="132" width="288" height="12" fill="%2388ad97"/><rect x="88" y="156" width="248" height="12" fill="%2388ad97"/><rect x="408" y="92" width="128" height="128" fill="%23607f6c"/></svg>';

const PanelTemplate = ({
  layout = 'list',
  width = 'md',
  label,
  children,
}: {
  layout?: FlyoutMenuLayout;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  label: string;
  children: React.ReactNode;
}) => {
  const widthMap = {
    sm: '280px',
    md: '400px',
    lg: '560px',
    xl: '800px',
  } as const;

  return (
    <div className={storyStyles.storyA11yScope}>
      <div
        role="navigation"
        aria-label={label}
        className={clsx(
          runtimeStyles.content,
          runtimeStyles[`layout-${layout}`],
          storyStyles.storyPanel
        )}
        style={{ ['--flyout-width' as string]: widthMap[width] }}
      >
        {children}
      </div>
    </div>
  );
};

const meta: Meta<typeof PanelTemplate> = {
  title: 'Core Components/FlyoutMenu',
  component: PanelTemplate,
  tags: ['autodocs'],
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
};

export default meta;

type Story = StoryObj<typeof PanelTemplate>;

export const Default: Story = {
  render: () => (
    <PanelTemplate label="Products navigation">
      <FlyoutMenuLink
        href="#foundations"
        icon={Layers3}
        label="Design foundations"
        description="Tokens, theming, and baseline primitives."
      />
      <FlyoutMenuLink
        href="#patterns"
        icon={Compass}
        label="Application patterns"
        description="Reusable layouts for dashboards, forms, and workflows."
      />
      <FlyoutMenuLink
        href="#ai"
        icon={Sparkles}
        label="AI workflows"
        description="Prompt UIs, review loops, and operational guardrails."
        badge="New"
      />
    </PanelTemplate>
  ),
  parameters: storySourceParameters(
    storySource(
      '<FlyoutMenu>',
      '  <FlyoutMenuTrigger>',
      '    <a href="#products">Products</a>',
      '  </FlyoutMenuTrigger>',
      '  <FlyoutMenuContent label="Products navigation">',
      '    <FlyoutMenuLink',
      '      href="#foundations"',
      '      icon={Layers3}',
      '      label="Design foundations"',
      '      description="Tokens, theming, and baseline primitives."',
      '    />',
      '  </FlyoutMenuContent>',
      '</FlyoutMenu>'
    )
  ),
};

export const TwoColumn: Story = {
  render: () => (
    <PanelTemplate layout="two-col" width="lg" label="Resources navigation">
      <FlyoutMenuLink
        href="#docs"
        icon={BookOpen}
        label="Documentation"
        description="Implementation guidance and accessibility notes."
      />
      <FlyoutMenuLink
        href="#templates"
        icon={Layers3}
        label="Templates"
        description="Ship faster with vetted starter flows."
      />
      <FlyoutMenuLink
        href="#roadmap"
        icon={Compass}
        label="Roadmap"
        description="Track component priorities and active RFCs."
      />
      <FlyoutMenuLink
        href="#release-notes"
        icon={Sparkles}
        label="Release notes"
        description="Component changes and migration callouts."
        badge="Beta"
      />
    </PanelTemplate>
  ),
};

export const ListFeatured: Story = {
  render: () => (
    <PanelTemplate layout="list-featured" width="xl" label="Platform navigation">
      <FlyoutMenuGroup>
        <FlyoutMenuGroupLabel>Explore</FlyoutMenuGroupLabel>
        <FlyoutMenuLink
          href="#product"
          icon={Layers3}
          label="Components"
          description="Production-ready foundations for DDS products."
        />
        <FlyoutMenuLink
          href="#guides"
          icon={BookOpen}
          label="Guides"
          description="Deep implementation notes for product teams."
          active
        />
        <FlyoutMenuLink
          href="#consulting"
          icon={Compass}
          label="Consulting"
          description="Embedded design system support for launches."
        />
      </FlyoutMenuGroup>
      <FlyoutMenuFeaturedCard
        href="#feature"
        image={featuredImage}
        imageAlt="Abstract preview of a dashboard layout"
        subtitle="Featured"
        title="Design system launch checklist"
        description="A tactical rollout plan covering adoption, accessibility, QA, and migration sequencing."
      />
      <FlyoutMenuCTABar align="between">
        <Button variant="secondary">Book a review</Button>
        <Button icon={ArrowRight} iconPosition="end">
          View all guides
        </Button>
      </FlyoutMenuCTABar>
    </PanelTemplate>
  ),
};

export const Simple: Story = {
  render: () => (
    <PanelTemplate layout="simple" width="sm" label="Company navigation">
      <FlyoutMenuLink href="#about" label="About DDS" />
      <FlyoutMenuLink href="#careers" label="Careers" />
      <FlyoutMenuLink href="#contact" label="Contact" external />
      <FlyoutMenuFooter>
        <Link href="#legal">Legal</Link>
        <Link href="#privacy">Privacy</Link>
      </FlyoutMenuFooter>
    </PanelTemplate>
  ),
};

export const FeaturedHighlight: Story = {
  render: () => (
    <PanelTemplate layout="list-featured" width="xl" label="Solutions navigation">
      <FlyoutMenuGroup>
        <FlyoutMenuGroupLabel>By team</FlyoutMenuGroupLabel>
        <FlyoutMenuLink
          href="#design"
          icon={Sparkles}
          label="Design teams"
          description="Token workflows, component specs, and review loops."
        />
        <FlyoutMenuLink
          href="#engineering"
          icon={Layers3}
          label="Engineering teams"
          description="Typed APIs, test coverage, and migration guides."
        />
      </FlyoutMenuGroup>
      <FlyoutMenuFeaturedHighlight
        title="Migration office hours"
        description="Bring active implementation questions and leave with an adoption plan."
        href="#office-hours"
        linkLabel="Reserve a slot"
        image={featuredImage}
        imageAlt="Abstract layout card preview"
      />
    </PanelTemplate>
  ),
};
