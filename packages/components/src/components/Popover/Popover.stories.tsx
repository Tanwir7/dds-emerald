import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Settings2 } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Field } from '../Field';
import { Heading } from '../Heading';
import { Input } from '../Input';
import { Text } from '../Text';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger } from './Popover';
import storyStyles from './Popover.stories.module.scss';

const componentDescription = `Popover renders rich, interactive floating content anchored to a trigger.

### Accessibility contract

- Keyboard: click, Enter, or Space on the trigger opens the panel; Escape closes it and returns focus to the trigger.
- Screen readers: Radix supplies trigger expanded state and popup semantics; consumers add \`role="dialog"\` plus a label when modal dialog semantics are needed.
- Focus: focus moves into the content on open; \`modal={true}\` traps focus while the popover is open.
- Designers: use Popover for interactive panels such as filters, settings, confirmations, and date pickers. Text-only hints belong in \`Tooltip\`.
- QA: verify portal rendering, focus entry and return, Escape close behavior, outside click behavior, and axe results for both modal and non-modal usage.`;

const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const dates = ['29', '30', '31', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

const SimplePanel = () => (
  <div className={storyStyles.storyPanelStack}>
    <Text as="p" size="sm">
      Popover content
    </Text>
    <div className={storyStyles.storyActions}>
      <PopoverClose asChild>
        <Button variant="secondary">Cancel</Button>
      </PopoverClose>
      <Button>Apply</Button>
    </div>
  </div>
);

const FilterFormPanel = () => (
  <div className={storyStyles.storyPanelStack}>
    <Heading as="h3" size="2xl">
      Filters
    </Heading>
    <Field label="Project owner" helper="Use a teammate name or team alias.">
      <Input placeholder="Type a name" />
    </Field>
    <div className={storyStyles.storyActions}>
      <PopoverClose asChild>
        <Button variant="secondary">Reset</Button>
      </PopoverClose>
      <Button>Apply filters</Button>
    </div>
  </div>
);

const DatePickerPanel = () => (
  <div className={storyStyles.storyCalendar}>
    <div className={storyStyles.storyCalendarHeader}>
      <Button variant="ghost" size="icon-sm" aria-label="Previous month" icon={ChevronLeft} />
      <Heading as="h3" size="2xl">
        April 2026
      </Heading>
      <Button variant="ghost" size="icon-sm" aria-label="Next month" icon={ChevronRight} />
    </div>
    <div className={storyStyles.storyCalendarGrid}>
      {days.map((day) => (
        <Text key={day} as="span" size="xs" className={storyStyles.storyDayLabel ?? ''}>
          {day}
        </Text>
      ))}
      {dates.map((date) => (
        <Button
          key={date}
          variant={date === '8' ? 'primary' : 'ghost'}
          className={storyStyles.storyDayButton ?? ''}
        >
          {date}
        </Button>
      ))}
    </div>
  </div>
);

const ControlledOpenDemo = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={storyStyles.storyA11yScope}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary">{open ? 'Close panel' : 'Open panel'}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className={storyStyles.storyPanelStack}>
            <Text as="p" size="sm">
              This popover is controlled by React state.
            </Text>
            <div className={storyStyles.storyActions}>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Dismiss
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const NestedPopoverDemo = () => (
  <div className={storyStyles.storyA11yScope}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open parent</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className={storyStyles.storyNestedArea}>
          <Text as="p" size="sm">
            Parent popover content
          </Text>
          <Popover>
            <PopoverTrigger asChild>
              <Button>Open nested</Button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start">
              <div className={storyStyles.storyPanelStack}>
                <Text as="p" size="sm">
                  Nested popover content
                </Text>
                <PopoverClose asChild>
                  <Button variant="secondary">Close nested</Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  </div>
);

const meta: Meta<typeof Popover> = {
  title: 'Core Components/Popover',
  component: Popover,
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

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" showCloseButton>
          <SimplePanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Popover>',
      '  <PopoverTrigger asChild>',
      '    <Button variant="secondary">Open</Button>',
      '  </PopoverTrigger>',
      '  <PopoverContent side="bottom" align="start" showCloseButton>',
      '    <Text as="p" size="sm">Popover content</Text>',
      '  </PopoverContent>',
      '</Popover>'
    )
  ),
};

export const WithForm: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" icon={Filter}>
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent width="320px">
          <FilterFormPanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Popover>',
      '  <PopoverTrigger asChild>',
      '    <Button variant="secondary" icon={Filter}>Filters</Button>',
      '  </PopoverTrigger>',
      '  <PopoverContent width="320px">',
      '    <Field label="Project owner">',
      '      <Input placeholder="Type a name" />',
      '    </Field>',
      '  </PopoverContent>',
      '</Popover>'
    )
  ),
};

export const WithCloseButton: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open closeable</Button>
        </PopoverTrigger>
        <PopoverContent showCloseButton>
          <SimplePanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Open closeable</Button></PopoverTrigger><PopoverContent showCloseButton>...</PopoverContent></Popover>'
  ),
};

export const WithArrow: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open with arrow</Button>
        </PopoverTrigger>
        <PopoverContent showArrow>
          <SimplePanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Open with arrow</Button></PopoverTrigger><PopoverContent showArrow>...</PopoverContent></Popover>'
  ),
};

export const Sides: Story = {
  render: () => (
    <div className={`${storyStyles.storyA11yScope} ${storyStyles.storyGrid}`}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="secondary">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <Text as="p" size="sm">
              Side {side}
            </Text>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <Popover>...</Popover>',
      '  <Popover>...</Popover>',
      '  <Popover>...</Popover>',
      '  <Popover>...</Popover>',
      '</>'
    )
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className={`${storyStyles.storyA11yScope} ${storyStyles.storyThreeUp}`}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="secondary">{align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <Text as="p" size="sm">
              Align {align}
            </Text>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <Popover>...</Popover>',
      '  <Popover>...</Popover>',
      '  <Popover>...</Popover>',
      '</>'
    )
  ),
};

export const TriggerWidth: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" className={storyStyles.storyTriggerWidth ?? ''}>
            Match trigger width
          </Button>
        </PopoverTrigger>
        <PopoverContent width="trigger">
          <FilterFormPanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Match trigger width</Button></PopoverTrigger><PopoverContent width="trigger">...</PopoverContent></Popover>'
  ),
};

export const ExplicitWidth: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Fixed width</Button>
        </PopoverTrigger>
        <PopoverContent width="320px">
          <FilterFormPanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Fixed width</Button></PopoverTrigger><PopoverContent width="320px">...</PopoverContent></Popover>'
  ),
};

export const Modal: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover modal>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open modal popover</Button>
        </PopoverTrigger>
        <PopoverContent role="dialog" aria-label="Confirmation panel" showCloseButton>
          <div className={storyStyles.storyPanelStack}>
            <Heading as="h3" size="2xl">
              Publish changes
            </Heading>
            <Text as="p" size="sm">
              This modal popover traps focus until the user confirms or closes it.
            </Text>
            <div className={storyStyles.storyActions}>
              <PopoverClose asChild>
                <Button variant="secondary">Cancel</Button>
              </PopoverClose>
              <Button>Publish</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover modal><PopoverTrigger asChild><Button variant="secondary">Open modal popover</Button></PopoverTrigger><PopoverContent role="dialog" aria-label="Confirmation panel" showCloseButton>...</PopoverContent></Popover>'
  ),
};

export const AsChildTrigger: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverAnchor />
        <PopoverTrigger asChild>
          <Button variant="secondary" icon={Settings2}>
            Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <SimplePanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary" icon={Settings2}>Settings</Button></PopoverTrigger><PopoverContent>...</PopoverContent></Popover>'
  ),
};

export const ControlledOpen: Story = {
  render: () => <ControlledOpenDemo />,
  parameters: storySourceParameters(
    'const [open, setOpen] = React.useState(false);\n\n<Popover open={open} onOpenChange={setOpen}>...</Popover>'
  ),
};

export const Nested: Story = {
  render: () => <NestedPopoverDemo />,
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Open parent</Button></PopoverTrigger><PopoverContent><Popover>...</Popover></PopoverContent></Popover>'
  ),
};

export const DatePickerMock: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" icon={CalendarDays}>
            Pick a date
          </Button>
        </PopoverTrigger>
        <PopoverContent width="320px">
          <DatePickerPanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary" icon={CalendarDays}>Pick a date</Button></PopoverTrigger><PopoverContent width="320px">...</PopoverContent></Popover>'
  ),
};

export const OpenAndClose: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent>
          <Text as="p" size="sm">
            Popover content
          </Text>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open/i });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(within(document.body).getByText('Popover content')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Open</Button></PopoverTrigger><PopoverContent><Text as="p" size="sm">Popover content</Text></PopoverContent></Popover>'
  ),
};

export const FocusManagement: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent width="320px">
          <FilterFormPanel />
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open/i });

    await userEvent.click(trigger);

    const firstInput = within(document.body).getByRole('textbox');
    await expect(firstInput).toHaveFocus();
  },
  parameters: storySourceParameters(
    '<Popover><PopoverTrigger asChild><Button variant="secondary">Open</Button></PopoverTrigger><PopoverContent width="320px"><Field label="Project owner"><Input placeholder="Type a name" /></Field></PopoverContent></Popover>'
  ),
};
