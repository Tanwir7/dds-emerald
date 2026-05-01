import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import storyStyles from './KeyValueRow.stories.module.scss';
import { KeyValueList, KeyValueRow } from './KeyValueRow';
import { Avatar, AvatarFallback } from '../Avatar';
import { StatusIndicator } from '../StatusIndicator';
import { Tag } from '../Tag';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const renderStandaloneRow = (args: ComponentProps<typeof KeyValueRow>) => (
  <div className={storyStyles.storyA11yScope}>
    <div className={storyStyles.storyPanel}>
      <KeyValueList>
        <KeyValueRow {...args} />
      </KeyValueList>
    </div>
  </div>
);

const meta: Meta<typeof KeyValueRow> = {
  title: 'Core Components/KeyValueRow',
  component: KeyValueRow,
  subcomponents: { KeyValueList },
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof KeyValueRow>) => renderStandaloneRow(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    label: 'Email',
    children: 'ada@example.com',
  },
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['inline', 'stacked'],
    },
    copyable: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof KeyValueRow>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList>',
      '  <KeyValueRow label="Email">ada@example.com</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const Stacked: Story = {
  args: {
    layout: 'stacked',
  },
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList layout="stacked">',
      '  <KeyValueRow label="Email">ada@example.com</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const InList: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList>
          <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>
          <KeyValueRow label="Email">ada@example.com</KeyValueRow>
          <KeyValueRow label="Role">Principal Engineer</KeyValueRow>
          <KeyValueRow label="Region">Toronto</KeyValueRow>
          <KeyValueRow label="Team">Platform</KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList>',
      '  <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>',
      '  <KeyValueRow label="Email">ada@example.com</KeyValueRow>',
      '  <KeyValueRow label="Role">Principal Engineer</KeyValueRow>',
      '  <KeyValueRow label="Region">Toronto</KeyValueRow>',
      '  <KeyValueRow label="Team">Platform</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const WithDividers: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList dividers>
          <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>
          <KeyValueRow label="Email">ada@example.com</KeyValueRow>
          <KeyValueRow label="Role">Principal Engineer</KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList dividers>',
      '  <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>',
      '  <KeyValueRow label="Email">ada@example.com</KeyValueRow>',
      '  <KeyValueRow label="Role">Principal Engineer</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const StackedList: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList layout="stacked">
          <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>
          <KeyValueRow label="Email">ada@example.com</KeyValueRow>
          <KeyValueRow label="Role">Principal Engineer</KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList layout="stacked">',
      '  <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>',
      '  <KeyValueRow label="Email">ada@example.com</KeyValueRow>',
      '  <KeyValueRow label="Role">Principal Engineer</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const Copyable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList dividers>
          <KeyValueRow label="Email" copyable>
            ada@example.com
          </KeyValueRow>
          <KeyValueRow label="API Key" copyable>
            emr_8f2c9d17b9
          </KeyValueRow>
          <KeyValueRow label="Role">Principal Engineer</KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList dividers>',
      '  <KeyValueRow label="Email" copyable>ada@example.com</KeyValueRow>',
      '  <KeyValueRow label="API Key" copyable>emr_8f2c9d17b9</KeyValueRow>',
      '  <KeyValueRow label="Role">Principal Engineer</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const CopyValue: Story = {
  ...Copyable,
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList>
          <KeyValueRow label="Email" copyable>
            ada@example.com
          </KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList>',
      '  <KeyValueRow label="Email" copyable>ada@example.com</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
  play: async ({ canvasElement }) => {
    const copyBtn = within(canvasElement).getByRole('button', { name: /copy/i });
    await userEvent.click(copyBtn);
    const liveRegion = within(canvasElement).getByRole('status');
    await expect(liveRegion).toHaveTextContent('Copied!');
  },
};

export const CustomLabelWidth: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList labelWidth="200px">
          <KeyValueRow label="Repository">dds-emerald</KeyValueRow>
          <KeyValueRow label="Default Branch">main</KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList labelWidth="200px">',
      '  <KeyValueRow label="Repository">dds-emerald</KeyValueRow>',
      '  <KeyValueRow label="Default Branch">main</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <div className={storyStyles.storyPanel}>
          <KeyValueList size="sm" dividers>
            <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>
            <KeyValueRow label="Email">ada@example.com</KeyValueRow>
          </KeyValueList>
        </div>
        <div className={storyStyles.storyPanel}>
          <KeyValueList size="md" dividers>
            <KeyValueRow label="Name">Ada Lovelace</KeyValueRow>
            <KeyValueRow label="Email">ada@example.com</KeyValueRow>
          </KeyValueList>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<KeyValueList size="sm" dividers><KeyValueRow label="Name">Ada Lovelace</KeyValueRow><KeyValueRow label="Email">ada@example.com</KeyValueRow></KeyValueList>',
      '<KeyValueList size="md" dividers><KeyValueRow label="Name">Ada Lovelace</KeyValueRow><KeyValueRow label="Email">ada@example.com</KeyValueRow></KeyValueList>'
    )
  ),
};

export const WithComponents: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <KeyValueList dividers>
          <KeyValueRow label="Status">
            <Tag variant="success">Active</Tag>
          </KeyValueRow>
          <KeyValueRow label="Presence">
            <StatusIndicator status="online" label="Online" />
          </KeyValueRow>
          <KeyValueRow label="Owner">
            <span className={storyStyles.storyAvatarValue}>
              <Avatar size="sm">
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              Ada Lovelace
            </span>
          </KeyValueRow>
        </KeyValueList>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList dividers>',
      '  <KeyValueRow label="Status"><Tag variant="success">Active</Tag></KeyValueRow>',
      '  <KeyValueRow label="Presence"><StatusIndicator status="online" label="Online" /></KeyValueRow>',
      '  <KeyValueRow label="Owner"><Avatar size="sm"><AvatarFallback>AL</AvatarFallback></Avatar> Ada Lovelace</KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};

export const EntityDetail: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyPanel}>
        <div className={storyStyles.storyGrid}>
          <KeyValueList dividers labelWidth="160px">
            <KeyValueRow label="Name">Emerald Design System</KeyValueRow>
            <KeyValueRow label="Status">
              <Tag variant="success">Healthy</Tag>
            </KeyValueRow>
            <KeyValueRow label="Owner">Design Systems Team</KeyValueRow>
            <KeyValueRow label="Repository" copyable>
              github.com/dds/emerald
            </KeyValueRow>
            <KeyValueRow label="Created">January 18, 2025</KeyValueRow>
            <KeyValueRow label="Updated">April 30, 2026</KeyValueRow>
            <KeyValueRow label="Assigned">
              <span className={storyStyles.storyAvatarValue}>
                <Avatar size="sm">
                  <AvatarFallback>TC</AvatarFallback>
                </Avatar>
                Tanwir Chowdhury
              </span>
            </KeyValueRow>
            <KeyValueRow label="Environment">
              <StatusIndicator status="success" label="Production ready" />
            </KeyValueRow>
          </KeyValueList>
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<KeyValueList dividers labelWidth="160px">',
      '  <KeyValueRow label="Name">Emerald Design System</KeyValueRow>',
      '  <KeyValueRow label="Status"><Tag variant="success">Healthy</Tag></KeyValueRow>',
      '  <KeyValueRow label="Owner">Design Systems Team</KeyValueRow>',
      '  <KeyValueRow label="Repository" copyable>github.com/dds/emerald</KeyValueRow>',
      '  <KeyValueRow label="Created">January 18, 2025</KeyValueRow>',
      '  <KeyValueRow label="Updated">April 30, 2026</KeyValueRow>',
      '  <KeyValueRow label="Assigned"><Avatar size="sm"><AvatarFallback>TC</AvatarFallback></Avatar> Tanwir Chowdhury</KeyValueRow>',
      '  <KeyValueRow label="Environment"><StatusIndicator status="success" label="Production ready" /></KeyValueRow>',
      '</KeyValueList>'
    )
  ),
};
