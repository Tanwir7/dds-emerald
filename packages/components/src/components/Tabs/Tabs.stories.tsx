import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, FolderOpen, History } from 'lucide-react';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from './Tabs';
import storyStyles from './Tabs.stories.module.scss';

const storyA11yScopeClassName = storyStyles.storyA11yScope!;
const storyPanelClassName = storyStyles.storyPanel!;
const storyMetaClassName = storyStyles.storyMeta!;
const storyVerticalClassName = storyStyles.storyVertical!;

const meta: Meta<typeof Tabs> = {
  title: 'Core Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyA11yScopeClassName,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

const renderPanels = () => (
  <TabPanels>
    <TabPanel value="overview">
      <div className={storyPanelClassName}>
        <Text>Review release status, blockers, and ownership for the current delivery window.</Text>
        <Text className={storyMetaClassName} size="sm">
          Updated 2 hours ago
        </Text>
      </div>
    </TabPanel>
    <TabPanel value="activity">
      <div className={storyPanelClassName}>
        <Text>Track approvals, QA progress, and integration events across the workspace.</Text>
        <Text className={storyMetaClassName} size="sm">
          18 events today
        </Text>
      </div>
    </TabPanel>
    <TabPanel value="history">
      <div className={storyPanelClassName}>
        <Text>
          Audit tab keeps prior releases, rollout notes, and deployment timestamps in one place.
        </Text>
        <Text className={storyMetaClassName} size="sm">
          24 revisions
        </Text>
      </div>
    </TabPanel>
  </TabPanels>
);

const renderTabs = (args: React.ComponentProps<typeof Tabs>) => (
  <div className={storyA11yScopeClassName}>
    <Tabs {...args}>
      <TabList aria-label="Project sections">
        <Tab value="overview" startIcon={<FolderOpen aria-hidden="true" />}>
          Overview
        </Tab>
        <Tab value="activity" startIcon={<Bell aria-hidden="true" />} endSlot={<span>12</span>}>
          Activity
        </Tab>
        <Tab value="history" startIcon={<History aria-hidden="true" />}>
          History
        </Tab>
      </TabList>
      {renderPanels()}
    </Tabs>
  </div>
);

export const Default: Story = {
  render: renderTabs,
  args: {
    defaultValue: 'overview',
  },
  parameters: storySourceParameters(
    storySource(
      '<Tabs defaultValue="overview">',
      '  <TabList aria-label="Project sections">',
      '    <Tab value="overview">Overview</Tab>',
      '    <Tab value="activity">Activity</Tab>',
      '    <Tab value="history">History</Tab>',
      '  </TabList>',
      '  <TabPanels>',
      '    <TabPanel value="overview">Overview content</TabPanel>',
      '    <TabPanel value="activity">Activity content</TabPanel>',
      '    <TabPanel value="history">History content</TabPanel>',
      '  </TabPanels>',
      '</Tabs>'
    )
  ),
};

export const Pill: Story = {
  render: renderTabs,
  args: {
    defaultValue: 'activity',
    variant: 'pill',
    size: 'sm',
  },
  parameters: storySourceParameters(
    storySource(
      '<Tabs defaultValue="activity" variant="pill" size="sm">',
      '  <TabList aria-label="Project sections">',
      '    <Tab value="overview">Overview</Tab>',
      '    <Tab value="activity">Activity</Tab>',
      '    <Tab value="history">History</Tab>',
      '  </TabList>',
      '  <TabPanels>',
      '    <TabPanel value="overview">Overview content</TabPanel>',
      '    <TabPanel value="activity">Activity content</TabPanel>',
      '    <TabPanel value="history">History content</TabPanel>',
      '  </TabPanels>',
      '</Tabs>'
    )
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div className={storyA11yScopeClassName}>
      <div className={storyVerticalClassName}>
        <Tabs {...args}>
          <TabList aria-label="Workspace sections">
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="history">History</Tab>
          </TabList>
          {renderPanels()}
        </Tabs>
      </div>
    </div>
  ),
  args: {
    defaultValue: 'overview',
    orientation: 'vertical',
  },
  parameters: storySourceParameters(
    storySource(
      '<Tabs defaultValue="overview" orientation="vertical">',
      '  <TabList aria-label="Workspace sections">',
      '    <Tab value="overview">Overview</Tab>',
      '    <Tab value="activity">Activity</Tab>',
      '    <Tab value="history">History</Tab>',
      '  </TabList>',
      '  <TabPanels>',
      '    <TabPanel value="overview">Overview content</TabPanel>',
      '    <TabPanel value="activity">Activity content</TabPanel>',
      '    <TabPanel value="history">History content</TabPanel>',
      '  </TabPanels>',
      '</Tabs>'
    )
  ),
};
