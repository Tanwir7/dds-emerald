import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Settings } from 'lucide-react';
import { Disclosure, DisclosureTrigger, DisclosureContent } from './Disclosure';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Input } from '../Input';
import { Field } from '../Field';
import { CheckboxField } from '../CheckboxField';
import { Text } from '../Text';
import { storySourceParameters, storySource } from '../../utils/storySource';
import storyStyles from './Disclosure.stories.module.scss';

const meta: Meta<typeof Disclosure> = {
  title: 'Core Components/Disclosure',
  component: Disclosure,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Disclosure>;

function ControlledDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure open={open} onOpenChange={setOpen}>
        <DisclosureTrigger>{open ? 'Hide' : 'Show'} details</DisclosureTrigger>
        <DisclosureContent>
          Controlled disclosure content. Use the toggle above or click the trigger to change state.
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure>
        <DisclosureTrigger>Show advanced options</DisclosureTrigger>
        <DisclosureContent>
          Advanced configuration will appear here when expanded.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Disclosure>',
      '  <DisclosureTrigger>Show advanced options</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    Advanced configuration will appear here when expanded.',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure defaultOpen>
        <DisclosureTrigger>Show advanced options</DisclosureTrigger>
        <DisclosureContent>
          This content is visible by default because defaultOpen is true.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Disclosure defaultOpen>',
      '  <DisclosureTrigger>Show advanced options</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    This content is visible by default because defaultOpen is true.',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const NoChevron: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure>
        <DisclosureTrigger showChevron={false}>
          <span className={storyStyles.storyTriggerLabel}>
            <Icon icon={Settings} />
            <span>Toggle settings</span>
          </span>
        </DisclosureTrigger>
        <DisclosureContent>
          Settings panel with a custom icon instead of the default chevron.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Disclosure>',
      '  <DisclosureTrigger showChevron={false}>',
      '    <Icon icon={Settings} />',
      '    <span>Toggle settings</span>',
      '  </DisclosureTrigger>',
      '  <DisclosureContent>',
      '    Settings panel with a custom icon instead of the default chevron.',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const SizeSmall: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure>
        <DisclosureTrigger size="sm">Show details (small)</DisclosureTrigger>
        <DisclosureContent>Compact disclosure using the small trigger size.</DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Disclosure>',
      '  <DisclosureTrigger size="sm">Show details (small)</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    Compact disclosure using the small trigger size.',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure disabled>
        <DisclosureTrigger>Show advanced options</DisclosureTrigger>
        <DisclosureContent>
          This content cannot be revealed because the disclosure is disabled.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Disclosure disabled>',
      '  <DisclosureTrigger>Show advanced options</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    This content cannot be revealed because the disclosure is disabled.',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const Controlled: Story = {
  render: () => <ControlledDisclosure />,
  parameters: storySourceParameters(
    storySource(
      'const [open, setOpen] = useState(false);',
      '',
      '<Disclosure open={open} onOpenChange={setOpen}>',
      '  <DisclosureTrigger>{open ? "Hide" : "Show"} details</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    Controlled disclosure content.',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const ReadMore: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Text size="sm">
        The design system provides a comprehensive set of tokens for building consistent interfaces
        across all DDS products...
      </Text>
      <Disclosure>
        <DisclosureTrigger>Read more</DisclosureTrigger>
        <DisclosureContent>
          These tokens cover color, spacing, typography, motion, and iconography, ensuring that
          every component adheres to the same visual language. By consuming Tier 2 semantic tokens
          rather than raw values, components automatically adapt to light and dark mode without any
          additional configuration.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Text size="sm">The design system provides a comprehensive set of tokens...</Text>',
      '<Disclosure>',
      '  <DisclosureTrigger>Read more</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    These tokens cover color, spacing, typography, motion, and iconography...',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const InCard: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyCard}>
        <Disclosure>
          <DisclosureTrigger>Show advanced options</DisclosureTrigger>
          <DisclosureContent>
            Card-bordered disclosure content with surrounding context.
          </DisclosureContent>
        </Disclosure>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<div className={cardStyles.card}>',
      '  <Disclosure>',
      '    <DisclosureTrigger>Show advanced options</DisclosureTrigger>',
      '    <DisclosureContent>',
      '      Card-bordered disclosure content.',
      '    </DisclosureContent>',
      '  </Disclosure>',
      '</div>'
    )
  ),
};

export const AdvancedOptions: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Stack direction="vertical" gap="sm">
        <Field label="Name">
          <Input placeholder="Enter name" />
        </Field>
        <Field label="Email">
          <Input placeholder="Enter email" />
        </Field>
      </Stack>
      <Disclosure>
        <DisclosureTrigger>Show advanced options</DisclosureTrigger>
        <DisclosureContent>
          <Stack direction="vertical" gap="sm">
            <Field label="Organization">
              <Input placeholder="Enter organization" />
            </Field>
            <Field label="Role">
              <Input placeholder="Enter role" />
            </Field>
            <CheckboxField label="Receive email notifications" />
          </Stack>
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Stack direction="vertical" gap="sm">',
      '  <Field label="Name"><Input placeholder="Enter name" /></Field>',
      '  <Field label="Email"><Input placeholder="Enter email" /></Field>',
      '</Stack>',
      '<Disclosure>',
      '  <DisclosureTrigger>Show advanced options</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    <Stack direction="vertical" gap="sm">',
      '      <Field label="Organization"><Input placeholder="Enter organization" /></Field>',
      '      <Field label="Role"><Input placeholder="Enter role" /></Field>',
      '      <CheckboxField label="Receive email notifications" />',
      '    </Stack>',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const WithRichContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure>
        <DisclosureTrigger>Notification preferences</DisclosureTrigger>
        <DisclosureContent>
          <Stack direction="vertical" gap="md">
            <CheckboxField label="Email notifications" />
            <CheckboxField label="Push notifications" />
            <CheckboxField label="SMS notifications" />
          </Stack>
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Disclosure>',
      '  <DisclosureTrigger>Notification preferences</DisclosureTrigger>',
      '  <DisclosureContent>',
      '    <Stack direction="vertical" gap="md">',
      '      <CheckboxField label="Email notifications" />',
      '      <CheckboxField label="Push notifications" />',
      '      <CheckboxField label="SMS notifications" />',
      '    </Stack>',
      '  </DisclosureContent>',
      '</Disclosure>'
    )
  ),
};

export const ToggleOpen: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure>
        <DisclosureTrigger>Show advanced options</DisclosureTrigger>
        <DisclosureContent>
          Interactive story — the play function will click the trigger to open.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const KeyboardToggle: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Disclosure>
        <DisclosureTrigger>Show advanced options</DisclosureTrigger>
        <DisclosureContent>
          Interactive story — the play function will use keyboard to toggle.
        </DisclosureContent>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
