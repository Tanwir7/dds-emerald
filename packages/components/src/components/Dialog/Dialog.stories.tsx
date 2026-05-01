import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Button } from '../Button';
import { Field } from '../Field';
import { Input } from '../Input';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from './Dialog';
import storyStyles from './Dialog.stories.module.scss';

const longBodyCopy = Array.from(
  { length: 18 },
  (_, index) =>
    `Paragraph ${index + 1}. Emerald keeps the header and footer fixed while the body region scrolls independently inside the dialog viewport.`
).join(' ');

const renderDialogStory = (
  triggerLabel = 'Open Dialog',
  contentProps: Partial<DialogContentProps> = {},
  footerAlign: React.ComponentProps<typeof DialogFooter>['align'] = 'end'
) => (
  <div className={storyStyles.storyA11yScope}>
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent {...contentProps}>
        <DialogHeader>
          <DialogTitle>Review changes</DialogTitle>
          <DialogDescription>Confirm the next action before continuing.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          This dialog uses the standard DDS modal layout with an optional close button and footer
          actions.
        </DialogBody>
        <DialogFooter align={footerAlign}>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);

const meta: Meta<typeof Dialog> = {
  title: 'Core Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  render: () => renderDialogStory(),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => renderDialogStory(),
  parameters: storySourceParameters(
    storySource(
      '<Dialog>',
      '  <DialogTrigger asChild>',
      '    <Button>Open Dialog</Button>',
      '  </DialogTrigger>',
      '  <DialogContent>',
      '    <DialogHeader>',
      '      <DialogTitle>Review changes</DialogTitle>',
      '      <DialogDescription>Confirm the next action before continuing.</DialogDescription>',
      '    </DialogHeader>',
      '    <DialogBody>This dialog uses the standard DDS modal layout.</DialogBody>',
      '    <DialogFooter>',
      '      <DialogClose asChild>',
      '        <Button variant="secondary">Cancel</Button>',
      '      </DialogClose>',
      '      <Button>Confirm</Button>',
      '    </DialogFooter>',
      '  </DialogContent>',
      '</Dialog>'
    )
  ),
};

export const OpenAndClose: Story = {
  render: () => renderDialogStory(),
  parameters: storySourceParameters('<Dialog>...</Dialog>'),
};

export const EscapeClose: Story = {
  render: () => renderDialogStory(),
  parameters: storySourceParameters('<Dialog>...</Dialog>'),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.triggerRow}>
        {(['sm', 'md', 'lg', 'xl', 'fullscreen'] as const).map((size) => (
          <Dialog key={size}>
            <DialogTrigger asChild>
              <Button>{size.toUpperCase()}</Button>
            </DialogTrigger>
            <DialogContent size={size}>
              <DialogHeader>
                <DialogTitle>{size.toUpperCase()} dialog</DialogTitle>
                <DialogDescription>Size demonstration for the {size} dialog.</DialogDescription>
              </DialogHeader>
              <DialogBody>Content scales with the configured dialog size.</DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Dialog>',
      '  <DialogTrigger asChild>',
      '    <Button>SM</Button>',
      '  </DialogTrigger>',
      '  <DialogContent size="sm">...</DialogContent>',
      '</Dialog>'
    )
  ),
};

export const ScrollableBody: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Scrollable Dialog</Button>
        </DialogTrigger>
        <DialogContent scrollable>
          <DialogHeader>
            <DialogTitle>Scrollable details</DialogTitle>
            <DialogDescription>
              The header and footer stay fixed while the body scrolls.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className={storyStyles.longContent}>
              {longBodyCopy.split('. ').map((sentence) => (
                <p key={sentence}>{sentence.trim()}.</p>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Dialog>',
      '  <DialogTrigger asChild>',
      '    <Button>Open Scrollable Dialog</Button>',
      '  </DialogTrigger>',
      '  <DialogContent scrollable>...</DialogContent>',
      '</Dialog>'
    )
  ),
};

export const NoCloseButton: Story = {
  render: () => renderDialogStory('Open Dialog', { showCloseButton: false }),
  parameters: storySourceParameters(
    storySource(
      '<Dialog>',
      '  <DialogTrigger asChild>',
      '    <Button>Open Dialog</Button>',
      '  </DialogTrigger>',
      '  <DialogContent showCloseButton={false}>...</DialogContent>',
      '</Dialog>'
    )
  ),
};

export const FooterAlignments: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.triggerRow}>
        {(['start', 'center', 'end', 'between'] as const).map((align) => (
          <Dialog key={align}>
            <DialogTrigger asChild>
              <Button>{align}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{align} footer</DialogTitle>
                <DialogDescription>Footer action alignment example.</DialogDescription>
              </DialogHeader>
              <DialogBody>Action grouping matches the selected footer alignment.</DialogBody>
              <DialogFooter align={align}>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Dialog><DialogContent><DialogFooter align="between">...</DialogFooter></DialogContent></Dialog>'
    )
  ),
};

export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <div className={storyStyles.stack}>
          <div className={storyStyles.triggerRow}>
            <Button onClick={() => setOpen(true)}>Open</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Controlled dialog</DialogTitle>
                <DialogDescription>Open state is managed outside the dialog.</DialogDescription>
              </DialogHeader>
              <DialogBody>External controls can open and close this dialog.</DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    };

    return (
      <div className={storyStyles.storyA11yScope}>
        <ControlledExample />
      </div>
    );
  },
  parameters: storySourceParameters(
    storySource(
      'const [open, setOpen] = React.useState(false);',
      '<Dialog open={open} onOpenChange={setOpen}>',
      '  <DialogContent>...</DialogContent>',
      '</Dialog>'
    )
  ),
};

export const WithForm: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Invite Form</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite collaborator</DialogTitle>
            <DialogDescription>Add the collaborator details before submitting.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className={storyStyles.stack}>
              <Field label="Name">
                <Input placeholder="Ada Lovelace" />
              </Field>
              <Field label="Email">
                <Input type="email" placeholder="ada@example.com" />
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Dialog>',
      '  <DialogTrigger asChild>',
      '    <Button>Open Invite Form</Button>',
      '  </DialogTrigger>',
      '  <DialogContent>...</DialogContent>',
      '</Dialog>'
    )
  ),
};

export const NoEscapeNoOverlay: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.stack}>
        <p className={storyStyles.note}>Escape and backdrop click are disabled.</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Protected Dialog</Button>
          </DialogTrigger>
          <DialogContent closeOnEscape={false} closeOnOverlayClick={false}>
            <DialogHeader>
              <DialogTitle>Explicit confirmation required</DialogTitle>
              <DialogDescription>Dismissal is limited to the footer action.</DialogDescription>
            </DialogHeader>
            <DialogBody>Use the cancel button to close this example dialog.</DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Dialog>',
      '  <DialogTrigger asChild>',
      '    <Button>Open Protected Dialog</Button>',
      '  </DialogTrigger>',
      '  <DialogContent closeOnEscape={false} closeOnOverlayClick={false}>...</DialogContent>',
      '</Dialog>'
    )
  ),
};
