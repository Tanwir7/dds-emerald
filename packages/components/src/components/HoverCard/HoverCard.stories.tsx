import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Tag } from '../Tag';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';
import { Avatar, AvatarFallback } from '../Avatar';
import { Heading } from '../Heading';
import { Link } from '../Link';
import { Text } from '../Text';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard';
import storyStyles from './HoverCard.stories.module.scss';

const componentDescription = `HoverCard renders supplementary preview content on hover without changing keyboard focus behavior.

### Accessibility contract

- Keyboard: the trigger remains independently operable, but the preview does not open on focus and does not trap focus.
- Screen readers: HoverCard content is supplementary only and should not be relied on for the trigger's meaning.
- Focus: Escape dismisses the preview; Tab continues through the page normally.
- Designers: use HoverCard for rich previews such as user summaries, entity metadata, and contextual details. Use Tooltip for short text labels.
- QA: verify delayed open and close timing, hover persistence while moving into the panel, Escape dismissal, and axe coverage for open and closed states.

### Trigger composition note

\`HoverCardTrigger\` uses Radix \`asChild\`. If you pass a custom trigger component, it must forward its \`ref\` and spread all received props onto the underlying DOM element. If it swallows pointer handlers or attributes, the hover card will not open.

Correct example:

- Define the trigger as a \`React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>\` wrapper.
- Render the underlying anchor as \`<a ref={ref} {...props} />\`.
- Use it as the direct child of \`HoverCardTrigger\`, for example \`<HoverCardTrigger><ProfileLink href="/team/emerald">@emerald_ds</ProfileLink></HoverCardTrigger>\`.

Incorrect example:

- A component like \`const ProfileLink = ({ label }) => <a href="/team/emerald">{label}</a>\` is not enough.
- That version drops the trigger props Radix injects, so hover interactions never reach the anchor.

### Can the component mitigate this?

Not fully. Because \`asChild\` delegates behavior into the child element, the child has to cooperate by forwarding props and refs. The practical mitigation is documentation, examples, and preferring raw DOM elements or well-behaved \`forwardRef\` wrapper components for triggers.`;

const stats = [
  { label: 'Followers', value: '12,480' },
  { label: 'Following', value: '184' },
];

const previewHref = '#hover-card-profile';

const UserPreview = ({
  compact = false,
  longContent = false,
}: {
  compact?: boolean;
  longContent?: boolean;
}) => (
  <div className={storyStyles.storyPanelStack}>
    <div className={storyStyles.storyHeader}>
      <Avatar size="lg">
        <AvatarFallback>ED</AvatarFallback>
      </Avatar>
      <div className={storyStyles.storyIdentity}>
        <Heading as="h3" size="2xl">
          Emerald DS
        </Heading>
        <Text as="p" size="sm" className={storyStyles.storyMutedText ?? ''}>
          @emerald_ds
        </Text>
      </div>
    </div>

    {!compact ? (
      <Text as="p" size="sm">
        Design system for Digital Dev Studio product surfaces, documentation patterns, and shared UI
        primitives.
      </Text>
    ) : null}

    {longContent ? (
      <Text as="p" size="sm">
        Emerald packages shared foundations for app shells, forms, navigation, and dense enterprise
        workflows into one reusable component library. Teams use it to standardize visual language,
        reduce implementation drift, and keep accessibility reviews consistent across products. The
        hover card supports longer descriptions without collapsing the surrounding layout or forcing
        a separate modal workflow.
      </Text>
    ) : null}

    <div className={storyStyles.storyStats}>
      {stats.map((item) => (
        <div key={item.label} className={storyStyles.storyStatItem}>
          <Text as="span" size="sm" className={storyStyles.storyStatValue ?? ''}>
            {item.value}
          </Text>
          <Text as="span" size="xs" className={storyStyles.storyMutedText ?? ''}>
            {item.label}
          </Text>
        </div>
      ))}
    </div>
  </div>
);

const RichPreview = () => (
  <div className={storyStyles.storyPanelStack}>
    <div className={storyStyles.storyHeader}>
      <Avatar size="lg">
        <AvatarFallback>ED</AvatarFallback>
      </Avatar>
      <div className={storyStyles.storyIdentity}>
        <div className={storyStyles.storyBadgeRow}>
          <Heading as="h3" size="2xl">
            Emerald DS
          </Heading>
          <Tag size="sm" variant="accent">
            Verified
          </Tag>
        </div>
        <Text as="p" size="sm" className={storyStyles.storyMutedText ?? ''}>
          Product platform team
        </Text>
      </div>
    </div>
    <div className={storyStyles.storyStats}>
      {[
        { label: 'Components', value: '64' },
        { label: 'Consumers', value: '18' },
        { label: 'Coverage', value: '92%' },
      ].map((item) => (
        <div key={item.label} className={storyStyles.storyStatItem}>
          <Text as="span" size="sm" className={storyStyles.storyStatValue ?? ''}>
            {item.value}
          </Text>
          <Text as="span" size="xs" className={storyStyles.storyMutedText ?? ''}>
            {item.label}
          </Text>
        </div>
      ))}
    </div>
    <Text as="p" size="sm">
      Shared previews like this can include status, usage signals, and a next-step link without
      interrupting the page.
    </Text>
    <Link href={previewHref} size="sm">
      Open design system profile
    </Link>
  </div>
);

type PreviewLinkProps = Omit<React.ComponentPropsWithoutRef<'a'>, 'children'> & {
  label: string;
};

const PreviewLink = React.forwardRef<HTMLAnchorElement, PreviewLinkProps>(
  ({ label, className, ...props }, ref) => (
    <a
      ref={ref}
      className={[storyStyles.storyTriggerLink, className].filter(Boolean).join(' ')}
      {...props}
    >
      {label}
    </a>
  )
);

PreviewLink.displayName = 'PreviewLink';

const meta: Meta<typeof HoverCard> = {
  title: 'Core Components/HoverCard',
  component: HoverCard,
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

type Story = StoryObj<typeof HoverCard>;

// Hover interactions are not reliable in Storybook play functions, so these stories stay static.

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <HoverCard>
        <HoverCardTrigger>
          <PreviewLink label="@emerald_ds" />
        </HoverCardTrigger>
        <HoverCardContent>
          <UserPreview />
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<HoverCard>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent>',
      '    <UserPreview />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};

export const TopSide: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyTopCanvas}>
        <HoverCard>
          <HoverCardTrigger>
            <PreviewLink label="@emerald_ds" />
          </HoverCardTrigger>
          <HoverCardContent side="top">
            <UserPreview />
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<HoverCard>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent side="top">',
      '    <UserPreview />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};

export const AllSides: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storySidesGrid}>
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className={storyStyles.storySideCell}>
            <HoverCard>
              <HoverCardTrigger>
                <PreviewLink label={side} />
              </HoverCardTrigger>
              <HoverCardContent side={side}>
                <UserPreview compact />
              </HoverCardContent>
            </HoverCard>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      storySource(
        '<HoverCard>',
        '  <HoverCardTrigger>',
        '    <a href="#hover-card-profile">top</a>',
        '  </HoverCardTrigger>',
        '  <HoverCardContent side="top">',
        '    <UserPreview compact />',
        '  </HoverCardContent>',
        '</HoverCard>'
      ),
      storySource(
        '<HoverCard>',
        '  <HoverCardTrigger>',
        '    <a href="#hover-card-profile">right</a>',
        '  </HoverCardTrigger>',
        '  <HoverCardContent side="right">',
        '    <UserPreview compact />',
        '  </HoverCardContent>',
        '</HoverCard>'
      ),
      storySource(
        '<HoverCard>',
        '  <HoverCardTrigger>',
        '    <a href="#hover-card-profile">bottom</a>',
        '  </HoverCardTrigger>',
        '  <HoverCardContent side="bottom">',
        '    <UserPreview compact />',
        '  </HoverCardContent>',
        '</HoverCard>'
      ),
      storySource(
        '<HoverCard>',
        '  <HoverCardTrigger>',
        '    <a href="#hover-card-profile">left</a>',
        '  </HoverCardTrigger>',
        '  <HoverCardContent side="left">',
        '    <UserPreview compact />',
        '  </HoverCardContent>',
        '</HoverCard>'
      )
    )
  ),
};

export const NoArrow: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <HoverCard>
        <HoverCardTrigger>
          <PreviewLink label="@emerald_ds" />
        </HoverCardTrigger>
        <HoverCardContent showArrow={false}>
          <UserPreview />
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<HoverCard>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent showArrow={false}>',
      '    <UserPreview />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};

export const CustomDelays: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <HoverCard openDelay={100} closeDelay={0}>
        <HoverCardTrigger>
          <PreviewLink label="@emerald_ds" />
        </HoverCardTrigger>
        <HoverCardContent>
          <UserPreview compact />
        </HoverCardContent>
      </HoverCard>
      <Text as="p" size="sm" className={storyStyles.storyNote ?? ''}>
        Opens almost immediately.
      </Text>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<HoverCard openDelay={100} closeDelay={0}>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent>',
      '    <UserPreview compact />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <HoverCard>
        <HoverCardTrigger>
          <PreviewLink label="@emerald_ds" />
        </HoverCardTrigger>
        <HoverCardContent>
          <RichPreview />
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<HoverCard>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent>',
      '    <RichPreview />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};

export const Controlled: Story = {
  render: () => {
    const ControlledDemo = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <div className={storyStyles.storyControlledRow}>
          <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
            {open ? 'Close preview' : 'Open preview'}
          </Button>
          <HoverCard open={open} onOpenChange={setOpen}>
            <HoverCardTrigger>
              <PreviewLink label="@emerald_ds" />
            </HoverCardTrigger>
            <HoverCardContent>
              <UserPreview compact />
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    };

    return (
      <div className={storyStyles.storyA11yScope}>
        <ControlledDemo />
      </div>
    );
  },
  parameters: storySourceParameters(
    storySource(
      'const [open, setOpen] = React.useState(false);',
      '',
      '<HoverCard open={open} onOpenChange={setOpen}>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent>',
      '    <UserPreview compact />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <HoverCard>
        <HoverCardTrigger>
          <PreviewLink label="@emerald_ds" />
        </HoverCardTrigger>
        <HoverCardContent>
          <UserPreview longContent />
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<HoverCard>',
      '  <HoverCardTrigger>',
      '    <a href="#hover-card-profile">@emerald_ds</a>',
      '  </HoverCardTrigger>',
      '  <HoverCardContent>',
      '    <UserPreview longContent />',
      '  </HoverCardContent>',
      '</HoverCard>'
    )
  ),
};
