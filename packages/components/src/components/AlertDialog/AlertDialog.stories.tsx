import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { storySource, storySourceParameters } from '../../utils/storySource';
import { Button } from '../Button';
import { DialogClose } from '../Dialog';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';
import storyStyles from './AlertDialog.stories.module.scss';

const renderAlert = (
  contentProps: Partial<React.ComponentProps<typeof AlertDialogContent>> = {},
  triggerLabel = 'Delete'
) => (
  <div className={storyStyles.storyA11yScope}>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{triggerLabel}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          Review the consequence before confirming the destructive action.
        </AlertDialogBody>
        <AlertDialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);

const meta: Meta<typeof AlertDialog> = {
  title: 'Core Components/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  render: () => renderAlert(),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};
export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const Destructive: Story = {
  render: () => renderAlert(),
  parameters: storySourceParameters(
    storySource(
      '<AlertDialog>',
      '  <AlertDialogTrigger asChild>',
      '    <Button variant="destructive">Delete</Button>',
      '  </AlertDialogTrigger>',
      '  <AlertDialogContent>...</AlertDialogContent>',
      '</AlertDialog>'
    )
  ),
};

export const ConfirmDelete: Story = {
  render: () => renderAlert(),
  parameters: storySourceParameters('<AlertDialog>...</AlertDialog>'),
};

export const CancelDismisses: Story = {
  render: () => renderAlert(),
  parameters: storySourceParameters('<AlertDialog>...</AlertDialog>'),
};

export const Warning: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Warning Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent variant="warning">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving will hide this workspace from active views.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>Existing data remains available for restoration later.</AlertDialogBody>
          <AlertDialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Archive</Button>
            </DialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<AlertDialog>',
      '  <AlertDialogTrigger asChild>',
      '    <Button>Open Warning Alert</Button>',
      '  </AlertDialogTrigger>',
      '  <AlertDialogContent variant="warning">...</AlertDialogContent>',
      '</AlertDialog>'
    )
  ),
};

export const Info: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Info Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent variant="info">
          <AlertDialogHeader>
            <AlertDialogTitle>Update required</AlertDialogTitle>
            <AlertDialogDescription>
              A new version is available. Updating will reload the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>Save any pending edits before you continue.</AlertDialogBody>
          <AlertDialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Later</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Update Now</Button>
            </DialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<AlertDialog>',
      '  <AlertDialogTrigger asChild>',
      '    <Button>Open Info Alert</Button>',
      '  </AlertDialogTrigger>',
      '  <AlertDialogContent variant="info">...</AlertDialogContent>',
      '</AlertDialog>'
    )
  ),
};

export const SizeMd: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Medium Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="md">
          <AlertDialogHeader>
            <AlertDialogTitle>Wider confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Use the medium width when the explanation needs more room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>
            This example demonstrates the medium alert dialog width for multi-line descriptive
            content and longer decision copy.
          </AlertDialogBody>
          <AlertDialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive">Proceed</Button>
            </DialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<AlertDialog>',
      '  <AlertDialogTrigger asChild>',
      '    <Button>Open Medium Alert</Button>',
      '  </AlertDialogTrigger>',
      '  <AlertDialogContent size="md">...</AlertDialogContent>',
      '</AlertDialog>'
    )
  ),
};

export const EscapeEnabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.stack}>
        <p className={storyStyles.note}>Escape key is enabled for this alert.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Open Escape-Enabled Alert</Button>
          </AlertDialogTrigger>
          <AlertDialogContent closeOnEscape>
            <AlertDialogHeader>
              <AlertDialogTitle>Dismissible alert</AlertDialogTitle>
              <AlertDialogDescription>Escape now closes this alert dialog.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Delete</Button>
              </DialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<AlertDialog>',
      '  <AlertDialogTrigger asChild>',
      '    <Button>Open Escape-Enabled Alert</Button>',
      '  </AlertDialogTrigger>',
      '  <AlertDialogContent closeOnEscape>...</AlertDialogContent>',
      '</AlertDialog>'
    )
  ),
};

export const OverlayEnabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.stack}>
        <p className={storyStyles.note}>Clicking the backdrop closes this alert.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Open Overlay-Enabled Alert</Button>
          </AlertDialogTrigger>
          <AlertDialogContent closeOnOverlayClick>
            <AlertDialogHeader>
              <AlertDialogTitle>Overlay dismissal enabled</AlertDialogTitle>
              <AlertDialogDescription>
                The backdrop can dismiss this alert dialog.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Delete</Button>
              </DialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<AlertDialog>',
      '  <AlertDialogTrigger asChild>',
      '    <Button>Open Overlay-Enabled Alert</Button>',
      '  </AlertDialogTrigger>',
      '  <AlertDialogContent closeOnOverlayClick>...</AlertDialogContent>',
      '</AlertDialog>'
    )
  ),
};
