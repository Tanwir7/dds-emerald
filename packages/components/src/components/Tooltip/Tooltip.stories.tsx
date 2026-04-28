import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Info } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import storyStyles from './Tooltip.stories.module.scss';
import { Tooltip, TooltipProvider } from './Tooltip';
import { storySource, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Wrap the application or a subtree in \`<TooltipProvider>\` once so tooltip timing is coordinated across related triggers.

### Accessibility contract

- Keyboard: the tooltip appears when the trigger receives focus and closes on blur; the trigger itself keeps its native keyboard behavior.
- Screen readers: Radix applies \`role="tooltip"\` to the content and links it from the trigger with \`aria-describedby\`.
- Focus: this component does not move focus and must only wrap a single focusable trigger rendered through \`asChild\`.
- Designers: keep tooltip copy brief and supplementary. Required guidance or interactive content belongs in visible UI or \`Popover\`.
- QA: verify hover, focus, blur, disabled passthrough, and that disabled buttons are wrapped because native disabled buttons do not emit pointer events.`;

const renderTooltip = (args: ComponentProps<typeof Tooltip>) => (
  <div className={storyStyles.storyA11yScope}>
    <Tooltip {...args}>
      <Button>Hover trigger</Button>
    </Tooltip>
  </div>
);

const meta: Meta<typeof Tooltip> = {
  title: 'Core Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Story />
      </TooltipProvider>
    ),
  ],
  render: (args: ComponentProps<typeof Tooltip>) => renderTooltip(args),
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
  args: {
    content: 'Helpful context',
    side: 'top',
    align: 'center',
    sideOffset: 6,
    disableHoverableContent: true,
    disabled: false,
    children: <Button>Hover trigger</Button>,
  },
  argTypes: {
    content: {
      control: 'text',
    },
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
    children: {
      control: false,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'View account details',
  },
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="View account details">',
      '    <Button>Hover trigger</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
};

export const Sides: Story = {
  render: () => (
    <div
      className={`${storyStyles.storyA11yScope} ${storyStyles.storyGrid} ${storyStyles.storySides}`}
    >
      <Tooltip content="Top tooltip" side="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <Button>Right</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <Button>Left</Button>
      </Tooltip>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="Top tooltip" side="top">',
      '    <Button>Top</Button>',
      '  </Tooltip>',
      '  <Tooltip content="Right tooltip" side="right">',
      '    <Button>Right</Button>',
      '  </Tooltip>',
      '  <Tooltip content="Bottom tooltip" side="bottom">',
      '    <Button>Bottom</Button>',
      '  </Tooltip>',
      '  <Tooltip content="Left tooltip" side="left">',
      '    <Button>Left</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
};

export const Alignment: Story = {
  render: () => (
    <div
      className={`${storyStyles.storyA11yScope} ${storyStyles.storyGrid} ${storyStyles.storyAlignments}`}
    >
      <Tooltip content="Align start" side="bottom" align="start">
        <Button>Start</Button>
      </Tooltip>
      <Tooltip content="Align center" side="bottom" align="center">
        <Button>Center</Button>
      </Tooltip>
      <Tooltip content="Align end" side="bottom" align="end">
        <Button>End</Button>
      </Tooltip>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="Align start" side="bottom" align="start">',
      '    <Button>Start</Button>',
      '  </Tooltip>',
      '  <Tooltip content="Align center" side="bottom" align="center">',
      '    <Button>Center</Button>',
      '  </Tooltip>',
      '  <Tooltip content="Align end" side="bottom" align="end">',
      '    <Button>End</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
};

export const LongContent: Story = {
  args: {
    content:
      'This tooltip contains longer supplementary guidance so the panel wraps instead of stretching across the viewport.',
  },
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="This tooltip contains longer supplementary guidance so the panel wraps instead of stretching across the viewport.">',
      '    <Button>Hover trigger</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    content: 'This text should never render',
  },
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="This text should never render" disabled>',
      '    <Button>Hover trigger</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
};

export const OnIconButton: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Tooltip content="More information">
        <Button size="icon" aria-label="More information" icon={Info} />
      </Tooltip>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="More information">',
      '    <Button size="icon" aria-label="More information" icon={Info} />',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
};

export const OnDisabledButton: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Tooltip content="Unavailable while syncing">
        <span className={storyStyles.storyDisabledButtonWrapper}>
          <Button disabled>Syncing</Button>
        </span>
      </Tooltip>
    </div>
  ),
  parameters: {
    ...storySourceParameters(
      storySource(
        '<TooltipProvider>',
        '  <Tooltip content="Unavailable while syncing">',
        '    <span>',
        '      <Button disabled>Syncing</Button>',
        '    </span>',
        '  </Tooltip>',
        '</TooltipProvider>'
      )
    ),
    docs: {
      description: {
        story:
          'Native disabled buttons do not emit pointer events, so wrap them in a neutral span when you still need tooltip disclosure.',
      },
      source: {
        code: storySource(
          '<TooltipProvider>',
          '  <Tooltip content="Unavailable while syncing">',
          '    <span>',
          '      <Button disabled>Syncing</Button>',
          '    </span>',
          '  </Tooltip>',
          '</TooltipProvider>'
        ),
        type: 'code',
      },
    },
  },
};

export const HoverToShow: Story = {
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="Hover tooltip">',
      '    <Button>Hover trigger</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
  args: {
    content: 'Hover tooltip',
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.hover(trigger);
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toBeInTheDocument();
  },
};

export const FocusToShow: Story = {
  parameters: storySourceParameters(
    storySource(
      '<TooltipProvider>',
      '  <Tooltip content="Focus tooltip">',
      '    <Button>Hover trigger</Button>',
      '  </Tooltip>',
      '</TooltipProvider>'
    )
  ),
  args: {
    content: 'Focus tooltip',
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toBeInTheDocument();
  },
};
