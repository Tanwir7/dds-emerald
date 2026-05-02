import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Button } from '../Button';
import { Field } from '../Field';
import { Input } from '../Input';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetContentProps,
} from './Sheet';
import storyStyles from './Sheet.stories.module.scss';

const longBodyCopy = Array.from(
  { length: 24 },
  (_, index) =>
    `Paragraph ${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla.`
).join(' ');

const renderSheetStory = (
  triggerLabel = 'Open Sheet',
  contentProps: Partial<SheetContentProps> = {},
  footerAlign: React.ComponentProps<typeof SheetFooter>['align'] = 'end'
) => (
  <div className={storyStyles.storyA11yScope}>
    <Sheet>
      <SheetTrigger asChild>
        <Button>{triggerLabel}</Button>
      </SheetTrigger>
      <SheetContent {...contentProps}>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Optional supporting context.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mollis, est non commodo
          luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
        </SheetBody>
        <SheetFooter align={footerAlign}>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button>Confirm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
);

const meta: Meta<typeof Sheet> = {
  title: 'Core Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  render: () => renderSheetStory(),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => renderSheetStory(),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetTrigger asChild>',
      '    <Button>Open Sheet</Button>',
      '  </SheetTrigger>',
      '  <SheetContent>',
      '    <SheetHeader>',
      '      <SheetTitle>Sheet title</SheetTitle>',
      '      <SheetDescription>Optional supporting context.</SheetDescription>',
      '    </SheetHeader>',
      '    <SheetBody>...</SheetBody>',
      '    <SheetFooter>',
      '      <SheetClose asChild>',
      '        <Button variant="secondary">Cancel</Button>',
      '      </SheetClose>',
      '      <Button>Confirm</Button>',
      '    </SheetFooter>',
      '  </SheetContent>',
      '</Sheet>'
    )
  ),
};

export const LeftSide: Story = {
  render: () => renderSheetStory('Open Sheet', { side: 'left' }),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetTrigger asChild>',
      '    <Button>Open Sheet</Button>',
      '  </SheetTrigger>',
      '  <SheetContent side="left">...</SheetContent>',
      '</Sheet>'
    )
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.triggerRow}>
        {(['sm', 'md', 'lg', 'full'] as const).map((size) => (
          <Sheet key={size}>
            <SheetTrigger asChild>
              <Button>{size.toUpperCase()}</Button>
            </SheetTrigger>
            <SheetContent size={size}>
              <SheetHeader>
                <SheetTitle>{size.toUpperCase()} sheet</SheetTitle>
                <SheetDescription>Size demonstration for the {size} sheet.</SheetDescription>
              </SheetHeader>
              <SheetBody>Content scales with the configured sheet size.</SheetBody>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </SheetClose>
                <Button>Continue</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetTrigger asChild>',
      '    <Button>SM</Button>',
      '  </SheetTrigger>',
      '  <SheetContent size="sm">...</SheetContent>',
      '</Sheet>'
    )
  ),
};

export const WithForm: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit team member</SheetTitle>
            <SheetDescription>Update the profile details for this account.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className={storyStyles.formFields}>
              <Field label="Name">
                <Input placeholder="Alex Morgan" />
              </Field>
              <Field label="Email">
                <Input type="email" placeholder="alex@dds.studio" />
              </Field>
              <Field label="Role">
                <Input placeholder="Design Systems Lead" />
              </Field>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetTrigger asChild>',
      '    <Button>Open Sheet</Button>',
      '  </SheetTrigger>',
      '  <SheetContent>',
      '    <SheetBody>',
      '      <Field label="Name">',
      '        <Input placeholder="Alex Morgan" />',
      '      </Field>',
      '    </SheetBody>',
      '  </SheetContent>',
      '</Sheet>'
    )
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Long content</SheetTitle>
            <SheetDescription>
              The body scrolls while the header and footer stay visible.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className={storyStyles.longContent}>
              {longBodyCopy.split('. ').map((sentence) => (
                <p key={sentence}>{sentence.trim()}.</p>
              ))}
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetTrigger asChild>',
      '    <Button>Open Sheet</Button>',
      '  </SheetTrigger>',
      '  <SheetContent>',
      '    <SheetBody>Long-form content...</SheetBody>',
      '  </SheetContent>',
      '</Sheet>'
    )
  ),
};

export const NoCloseButton: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Sheet title</SheetTitle>
            <SheetDescription>Optional supporting context.</SheetDescription>
          </SheetHeader>
          <SheetBody>Dismissal is handled through the footer actions only.</SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button>Confirm</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
  parameters: storySourceParameters(
    storySource('<Sheet><SheetContent showCloseButton={false}>...</SheetContent></Sheet>')
  ),
};

export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <div className={storyStyles.storyA11yScope}>
          <div className={storyStyles.triggerRow}>
            <Button onClick={() => setOpen(true)}>Open</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent aria-label="Controlled sheet">
              <SheetHeader>
                <SheetTitle>Controlled sheet</SheetTitle>
                <SheetDescription>State is managed externally.</SheetDescription>
              </SheetHeader>
              <SheetBody>Open and close are controlled via React state.</SheetBody>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </SheetClose>
                <Button>Confirm</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      );
    };

    return <ControlledExample />;
  },
  parameters: storySourceParameters(
    storySource(
      '<Sheet open={open} onOpenChange={setOpen}>',
      '  <SheetContent aria-label="Controlled sheet">...</SheetContent>',
      '</Sheet>'
    )
  ),
};

export const NoEscapeNoOverlay: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent closeOnEscape={false} closeOnOverlayClick={false}>
          <SheetHeader>
            <SheetTitle>Dismissal disabled</SheetTitle>
            <SheetDescription>Optional supporting context.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className={storyStyles.note}>
              Escape and backdrop click are disabled — only the Cancel button dismisses this sheet.
            </p>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button>Confirm</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetContent closeOnEscape={false} closeOnOverlayClick={false}>...</SheetContent>',
      '</Sheet>'
    )
  ),
};

export const FooterAlignments: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.triggerRow}>
        {(['start', 'center', 'end', 'between'] as const).map((align) => (
          <Sheet key={align}>
            <SheetTrigger asChild>
              <Button>{align}</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{align} footer</SheetTitle>
                <SheetDescription>Footer action alignment example.</SheetDescription>
              </SheetHeader>
              <SheetBody>Action grouping matches the selected footer alignment.</SheetBody>
              <SheetFooter align={align}>
                <SheetClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </SheetClose>
                <Button>Confirm</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Sheet><SheetContent><SheetFooter align="between">...</SheetFooter></SheetContent></Sheet>'
    )
  ),
};

export const NavigationDrawer: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side="left" size="sm" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Contextual app navigation in a modal drawer.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <ul className={storyStyles.navList}>
              {['Overview', 'Projects', 'Team', 'Settings'].map((item) => (
                <li key={item}>
                  <a className={storyStyles.navLink} href="/">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Sheet>',
      '  <SheetContent side="left" size="sm" showCloseButton={false}>...</SheetContent>',
      '</Sheet>'
    )
  ),
};

export const OpenAndClose: Story = {
  render: () => renderSheetStory(),
  parameters: storySourceParameters('<Sheet>...</Sheet>'),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /open sheet/i });
    await userEvent.click(trigger);
    const sheet = within(document.body).getByRole('dialog');
    await expect(sheet).toBeVisible();
    const closeButton = within(sheet).getByRole('button', { name: /close sheet/i });
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const EscapeClose: Story = {
  render: () => renderSheetStory(),
  parameters: storySourceParameters('<Sheet>...</Sheet>'),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /open sheet/i });
    await userEvent.click(trigger);
    await expect(within(document.body).getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const FocusTrap: Story = {
  render: () => renderSheetStory(),
  parameters: storySourceParameters('<Sheet>...</Sheet>'),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /open sheet/i });
    await userEvent.click(trigger);
    const sheet = within(document.body).getByRole('dialog');
    await expect(sheet).toBeVisible();
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');
    await expect(sheet.contains(document.activeElement)).toBe(true);
  },
};
