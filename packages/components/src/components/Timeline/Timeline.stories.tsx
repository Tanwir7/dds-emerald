import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CheckCircle2,
  FileCode2,
  GitCommitHorizontal,
  MessageSquareText,
  Rocket,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../Avatar';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineItem,
  TimelineNode,
  TimelineTimestamp,
  TimelineTitle,
} from './Timeline';
import storyStyles from './Timeline.stories.module.scss';

const componentDescription = `Timeline displays chronological events in a vertical ordered list.

### Accessibility contract

- Keyboard: Timeline itself is non-interactive. If consumers add links or buttons inside content, those controls follow normal document tab order.
- Screen readers: the root renders as \`<ol>\` and each item as \`<li>\`; decorative nodes and connectors are \`aria-hidden\`; timestamps use semantic \`<time>\` when \`dateTime\` is provided.
- Focus management: none at the component level because Timeline does not own focus or overlays.
- Designers: status must stay clear from text and node treatment together; do not rely on color alone for completed, active, pending, or error states.
- QA: verify the last item suppresses the connector visually, active nodes respect reduced-motion preferences, and alternate layout preserves readable left-right ordering.`;

const defaultItems = (
  <>
    <TimelineItem status="completed">
      <TimelineNode />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTimestamp dateTime="2026-03-25T09:12:00Z">Mar 25, 2026</TimelineTimestamp>
        <TimelineTitle>Repository created</TimelineTitle>
        <TimelineDescription>
          Initial workspace and branch protections configured.
        </TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem status="completed">
      <TimelineNode />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTimestamp dateTime="2026-03-27T14:30:00Z">Mar 27, 2026</TimelineTimestamp>
        <TimelineTitle>Design review approved</TimelineTitle>
        <TimelineDescription>
          Component API and states approved by design systems review.
        </TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem status="active">
      <TimelineNode />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTimestamp dateTime="2026-04-01T11:05:00Z">Apr 1, 2026</TimelineTimestamp>
        <TimelineTitle>Running accessibility checks</TimelineTitle>
        <TimelineDescription>Automated and manual validation is in progress.</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem status="pending">
      <TimelineNode />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTimestamp dateTime="2026-04-03T15:00:00Z">Apr 3, 2026</TimelineTimestamp>
        <TimelineTitle>Awaiting stakeholder review</TimelineTitle>
        <TimelineDescription>Feedback window opens after QA passes.</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem status="pending" last>
      <TimelineNode />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTimestamp dateTime="2026-04-07T10:00:00Z">Apr 7, 2026</TimelineTimestamp>
        <TimelineTitle>Scheduled for release</TimelineTitle>
        <TimelineDescription>
          Production rollout begins after approvals are complete.
        </TimelineDescription>
      </TimelineContent>
    </TimelineItem>
  </>
);

const meta: Meta<typeof Timeline> = {
  title: 'Core Components/Timeline',
  component: Timeline,
  subcomponents: {
    TimelineItem,
    TimelineNode,
    TimelineContent,
    TimelineTitle,
    TimelineDescription,
    TimelineTimestamp,
    TimelineConnector,
  },
  tags: ['autodocs'],
  args: {
    layout: 'default',
  },
  argTypes: {
    children: {
      control: false,
    },
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
      <Timeline {...args}>{defaultItems}</Timeline>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline>{defaultItems}</Timeline>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Timeline>',
      '  <TimelineItem status="completed">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-03-25T09:12:00Z">Mar 25, 2026</TimelineTimestamp>',
      '      <TimelineTitle>Repository created</TimelineTitle>',
      '      <TimelineDescription>Initial workspace and branch protections configured.</TimelineDescription>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="completed">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-03-27T14:30:00Z">Mar 27, 2026</TimelineTimestamp>',
      '      <TimelineTitle>Design review approved</TimelineTitle>',
      '      <TimelineDescription>Component API and states approved by design systems review.</TimelineDescription>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="active">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-04-01T11:05:00Z">Apr 1, 2026</TimelineTimestamp>',
      '      <TimelineTitle>Running accessibility checks</TimelineTitle>',
      '      <TimelineDescription>Automated and manual validation is in progress.</TimelineDescription>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="pending">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-04-03T15:00:00Z">Apr 3, 2026</TimelineTimestamp>',
      '      <TimelineTitle>Awaiting stakeholder review</TimelineTitle>',
      '      <TimelineDescription>Feedback window opens after QA passes.</TimelineDescription>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="pending" last>',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-04-07T10:00:00Z">Apr 7, 2026</TimelineTimestamp>',
      '      <TimelineTitle>Scheduled for release</TimelineTitle>',
      '      <TimelineDescription>Production rollout begins after approvals are complete.</TimelineDescription>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '</Timeline>'
    )
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline>
        <TimelineItem status="completed">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Deployment complete</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="active">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Running tests</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Awaiting review</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="error" last>
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Build failed</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Timeline>',
          '  <TimelineItem status="completed">',
          '    <TimelineNode />',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Deployment complete</TimelineTitle>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '  <TimelineItem status="active">',
          '    <TimelineNode />',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Running tests</TimelineTitle>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '  <TimelineItem status="pending">',
          '    <TimelineNode />',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Awaiting review</TimelineTitle>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '  <TimelineItem status="error" last>',
          '    <TimelineNode />',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Build failed</TimelineTitle>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '</Timeline>'
        )
      ),
    },
  },
};

export const AlternateLayout: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline layout="alternate">
        <TimelineItem status="completed">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTimestamp dateTime="2026-01-10">Jan 10, 2026</TimelineTimestamp>
            <TimelineTitle as="h3">Project kickoff</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="completed">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTimestamp dateTime="2026-02-04">Feb 4, 2026</TimelineTimestamp>
            <TimelineTitle as="h3">Research complete</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="active">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTimestamp dateTime="2026-03-16">Mar 16, 2026</TimelineTimestamp>
            <TimelineTitle as="h3">Prototype validation</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTimestamp dateTime="2026-04-08">Apr 8, 2026</TimelineTimestamp>
            <TimelineTitle as="h3">Stakeholder sign-off</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending" last>
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTimestamp dateTime="2026-04-22">Apr 22, 2026</TimelineTimestamp>
            <TimelineTitle as="h3">Production launch</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Timeline layout="alternate">',
      '  <TimelineItem status="completed">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-01-10">Jan 10, 2026</TimelineTimestamp>',
      '      <TimelineTitle as="h3">Project kickoff</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="completed">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-02-04">Feb 4, 2026</TimelineTimestamp>',
      '      <TimelineTitle as="h3">Research complete</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="active">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-03-16">Mar 16, 2026</TimelineTimestamp>',
      '      <TimelineTitle as="h3">Prototype validation</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="pending">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-04-08">Apr 8, 2026</TimelineTimestamp>',
      '      <TimelineTitle as="h3">Stakeholder sign-off</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="pending" last>',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-04-22">Apr 22, 2026</TimelineTimestamp>',
      '      <TimelineTitle as="h3">Production launch</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '</Timeline>'
    )
  ),
};

export const WithCustomNodes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline>
        <TimelineItem status="completed">
          <TimelineNode>
            <span className={storyStyles.customNode}>
              <GitCommitHorizontal aria-hidden="true" focusable="false" />
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Commit merged</TimelineTitle>
            <TimelineDescription>Feature branch merged into main.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="active">
          <TimelineNode>
            <span className={`${storyStyles.customNode} ${storyStyles.avatarNode}`}>
              <Avatar size="sm">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Review assigned</TimelineTitle>
            <TimelineDescription>Alex is reviewing the release candidate.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending" last>
          <TimelineNode>
            <span className={storyStyles.customNode}>R3</span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Release batch queued</TimelineTitle>
            <TimelineDescription>
              Third rollout group will start after approval.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Timeline>',
          '  <TimelineItem status="completed">',
          '    <TimelineNode>',
          '      <span className="customNode">',
          '        <GitCommitHorizontal aria-hidden="true" />',
          '      </span>',
          '    </TimelineNode>',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Commit merged</TimelineTitle>',
          '      <TimelineDescription>Feature branch merged into main.</TimelineDescription>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '  <TimelineItem status="active">',
          '    <TimelineNode>',
          '      <span className="customNode avatarNode">',
          '        <Avatar size="sm">',
          '        <AvatarFallback>AM</AvatarFallback>',
          '        </Avatar>',
          '      </span>',
          '    </TimelineNode>',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Review assigned</TimelineTitle>',
          '      <TimelineDescription>Alex is reviewing the release candidate.</TimelineDescription>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '  <TimelineItem status="pending" last>',
          '    <TimelineNode>',
          '      <span className="customNode">R3</span>',
          '    </TimelineNode>',
          '    <TimelineConnector />',
          '    <TimelineContent>',
          '      <TimelineTitle>Release batch queued</TimelineTitle>',
          '      <TimelineDescription>Third rollout group will start after approval.</TimelineDescription>',
          '    </TimelineContent>',
          '  </TimelineItem>',
          '</Timeline>'
        )
      ),
    },
  },
};

export const ActivityFeed: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline className={storyStyles.feedTimeline}>
        <TimelineItem status="completed">
          <TimelineNode>
            <span className={storyStyles.customNode}>
              <GitCommitHorizontal aria-hidden="true" focusable="false" />
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T08:45:00Z">08:45 UTC</TimelineTimestamp>
            <TimelineTitle>Committed Timeline tests</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="completed">
          <TimelineNode>
            <span className={storyStyles.customNode}>
              <FileCode2 aria-hidden="true" focusable="false" />
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T09:12:00Z">09:12 UTC</TimelineTimestamp>
            <TimelineTitle>Implemented Timeline styles</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="completed">
          <TimelineNode>
            <Avatar>
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T09:35:00Z">09:35 UTC</TimelineTimestamp>
            <TimelineTitle>Review requested from Morgan Lee</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="completed">
          <TimelineNode>
            <span className={storyStyles.customNode}>
              <MessageSquareText aria-hidden="true" focusable="false" />
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T09:48:00Z">09:48 UTC</TimelineTimestamp>
            <TimelineTitle>Comment resolved on title hierarchy</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="completed">
          <TimelineNode>
            <span className={storyStyles.customNode}>
              <CheckCircle2 aria-hidden="true" focusable="false" />
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T10:03:00Z">10:03 UTC</TimelineTimestamp>
            <TimelineTitle>Accessibility scan passed</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="active">
          <TimelineNode>
            <span className={storyStyles.customNode}>
              <Rocket aria-hidden="true" focusable="false" />
            </span>
          </TimelineNode>
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T10:12:00Z">10:12 UTC</TimelineTimestamp>
            <TimelineTitle>Publishing release candidate</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T10:25:00Z">10:25 UTC</TimelineTimestamp>
            <TimelineTitle>Awaiting documentation review</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T10:40:00Z">10:40 UTC</TimelineTimestamp>
            <TimelineTitle>Awaiting changelog entry</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T11:00:00Z">11:00 UTC</TimelineTimestamp>
            <TimelineTitle>Queued for npm publish</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending" last>
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent className={storyStyles.compactContent}>
            <TimelineTimestamp dateTime="2026-04-08T11:20:00Z">11:20 UTC</TimelineTimestamp>
            <TimelineTitle>Production docs rollout</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const MinimalTitlesOnly: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline>
        <TimelineItem status="completed">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Backlog created</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="active">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Design review in progress</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending" last>
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Ready for implementation</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Timeline>',
      '  <TimelineItem status="completed">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTitle>Backlog created</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="active">',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTitle>Design review in progress</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '  <TimelineItem status="pending" last>',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTitle>Ready for implementation</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '</Timeline>'
    )
  ),
};

export const SingleItem: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline>
        <TimelineItem status="active" last>
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTimestamp dateTime="2026-04-08T10:12:00Z">Apr 8, 2026</TimelineTimestamp>
            <TimelineTitle>Publishing release candidate</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Timeline>',
      '  <TimelineItem status="active" last>',
      '    <TimelineNode />',
      '    <TimelineConnector />',
      '    <TimelineContent>',
      '      <TimelineTimestamp dateTime="2026-04-08T10:12:00Z">Apr 8, 2026</TimelineTimestamp>',
      '      <TimelineTitle>Publishing release candidate</TimelineTitle>',
      '    </TimelineContent>',
      '  </TimelineItem>',
      '</Timeline>'
    )
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Timeline>
        <TimelineItem status="completed">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Tests completed</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="error">
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Build failed</TimelineTitle>
            <TimelineDescription>
              Storybook bundling failed because an export was missing from the public API.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem status="pending" last>
          <TimelineNode />
          <TimelineConnector />
          <TimelineContent>
            <TimelineTitle>Awaiting fix and rerun</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <p className={storyStyles.note}>
          Active nodes animate by default. When the OS preference is set to reduced motion, the
          pulse is replaced with a static ring.
        </p>
        <Timeline>
          <TimelineItem status="completed">
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Validation complete</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status="active" last>
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Preparing release</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </div>
    </div>
  ),
};
