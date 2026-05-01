import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowDownRight, ArrowUpRight, Minus, Wallet } from 'lucide-react';
import storyStyles from './StatCard.stories.module.scss';
import { StatCard } from './StatCard';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `StatCard presents a single dashboard metric with an uppercase label, a display-style value, and an optional change indicator.

### Accessibility contract

- Keyboard: StatCard is informational only and does not receive focus.
- Screen readers: the label and value are announced as plain text; when a delta is present its value is exposed with contextual \`aria-label\` text.
- Focus: no focus management is required because the component is non-interactive.
- Designers: provide short labels, preformatted values, and delta copy that can stand alone when announced.
- QA: verify loading hides placeholder visuals from assistive technology, trend meaning is not conveyed by color alone in surrounding layouts, and the value remains tabular for numeric alignment.`;

const meta: Meta<typeof StatCard> = {
  title: 'Core Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof StatCard>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storySurface}>
        <StatCard {...args} />
      </div>
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
    label: 'Monthly Revenue',
    value: '$48,295',
    size: 'md',
    delta: {
      value: '+12.4%',
      trend: 'up',
      label: 'vs last month',
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    icon: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  parameters: storySourceParameters(
    '<StatCard label="Monthly Revenue" value="$48,295" delta={{ value: "+12.4%", trend: "up", label: "vs last month" }} />'
  ),
};

export const WithIcon: Story = {
  args: {
    label: 'Open Pipeline',
    value: '$132,000',
    icon: Wallet,
    delta: {
      value: '+8.1%',
      trend: 'up',
      label: 'since yesterday',
    },
  },
  parameters: storySourceParameters(
    '<StatCard label="Open Pipeline" value="$132,000" icon={Wallet} delta={{ value: "+8.1%", trend: "up", label: "since yesterday" }} />'
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        <div className={storyStyles.storySurface}>
          <StatCard label="Orders" value="128" size="sm" delta={{ value: '+4', trend: 'up' }} />
        </div>
        <div className={storyStyles.storySurface}>
          <StatCard label="Orders" value="128" size="md" delta={{ value: '+4', trend: 'up' }} />
        </div>
        <div className={storyStyles.storySurface}>
          <StatCard label="Orders" value="128" size="lg" delta={{ value: '+4', trend: 'up' }} />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<StatCard label="Orders" value="128" size="sm" delta={{ value: "+4", trend: "up" }} />',
      '<StatCard label="Orders" value="128" size="md" delta={{ value: "+4", trend: "up" }} />',
      '<StatCard label="Orders" value="128" size="lg" delta={{ value: "+4", trend: "up" }} />'
    )
  ),
};

export const TrendStates: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        <div className={storyStyles.storySurface}>
          <StatCard
            label="Qualified Leads"
            value="214"
            icon={ArrowUpRight}
            delta={{ value: '+12', trend: 'up', label: 'this week' }}
          />
        </div>
        <div className={storyStyles.storySurface}>
          <StatCard
            label="Churn Rate"
            value="3.2%"
            icon={ArrowDownRight}
            delta={{ value: '-0.8%', trend: 'down', label: 'this month' }}
          />
        </div>
        <div className={storyStyles.storySurface}>
          <StatCard
            label="Average Handle Time"
            value="4m 32s"
            icon={Minus}
            delta={{ value: '0%', trend: 'neutral', label: 'no change' }}
          />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <StatCard label="Qualified Leads" value="214" icon={ArrowUpRight} delta={{ value: "+12", trend: "up", label: "this week" }} />',
      '  <StatCard label="Churn Rate" value="3.2%" icon={ArrowDownRight} delta={{ value: "-0.8%", trend: "down", label: "this month" }} />',
      '  <StatCard label="Average Handle Time" value="4m 32s" icon={Minus} delta={{ value: "0%", trend: "neutral", label: "no change" }} />',
      '</>'
    )
  ),
};

export const Loading: Story = {
  args: {
    label: 'Monthly Revenue',
    value: '$48,295',
    loading: true,
  },
  parameters: storySourceParameters('<StatCard label="Monthly Revenue" value="$48,295" loading />'),
};
