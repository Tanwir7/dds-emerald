import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FolderOpen, ImageIcon, XCircle } from 'lucide-react';
import storyStyles from './FilePicker.stories.module.scss';
import { FilePicker, type FilePickerFile } from './FilePicker';
import { Button } from '../Button';
import { storySourceParameters } from '../../utils/storySource';

const makeFile = (name: string, type: string, size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

const panelFiles: FilePickerFile[] = [
  {
    id: 'complete',
    file: makeFile('contract.pdf', 'application/pdf', 1024 * 1024),
    status: 'complete',
    downloadUrl: '/downloads/contract.pdf',
  },
  {
    id: 'uploading',
    file: makeFile(
      'brief.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      512 * 1024
    ),
    status: 'uploading',
    progress: 63,
  },
  {
    id: 'paused',
    file: makeFile('storyboard.png', 'image/png', 400 * 1024),
    status: 'paused',
    progress: 60,
  },
  {
    id: 'waiting',
    file: makeFile('invoice.csv', 'text/csv', 90 * 1024),
    status: 'waiting',
  },
];

const meta: Meta<typeof FilePicker> = {
  title: 'Core Components/FilePicker',
  component: FilePicker,
  tags: ['autodocs'],
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyWidth}>
        <FilePicker {...args} />
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};

export default meta;

type Story = StoryObj<typeof FilePicker>;

export const ButtonTrigger: Story = {
  args: {
    triggerVariant: 'button',
    buttonVariant: 'primary',
    label: 'Upload attachments',
    hint: 'Accepted file types: Images, PDF, DOC, DOCX. Max size: 1MB. Max files: 6.',
  },
};

export const MenuTrigger: Story = {
  args: {
    triggerVariant: 'menu',
    menuLabel: 'Choose an action',
    menuActions: [
      { label: 'View Files', icon: FolderOpen },
      { label: 'Open Gallery', icon: ImageIcon },
    ],
  },
};

export const DropzoneTrigger: Story = {
  args: {
    triggerVariant: 'dropzone',
    buttonVariant: 'primary',
    label: 'Attachments',
    accept: '.pdf,.docx',
    multiple: true,
  },
};

export const DropzoneTriggerCompact: Story = {
  args: {
    triggerVariant: 'dropzone',
    buttonVariant: 'primary',
    compact: true,
    label: 'Comment attachment',
    acceptedFormatsLabel: 'PNG, JPG up to 10 MB',
    accept: '.png,.jpg',
  },
};

export const MultiFilePanel: Story = {
  args: {
    triggerVariant: 'button',
    buttonVariant: 'primary',
    files: panelFiles,
    multiple: true,
    onClearAll: fn(),
  },
};

export const WithConstraints: Story = {
  args: {
    triggerVariant: 'button',
    buttonVariant: 'primary',
    label: 'Project files',
    accept: 'image/*,.pdf,.doc,.docx',
    maxSize: 1048576,
    maxFiles: 6,
    multiple: true,
  },
};

export const SecondaryUploadTrigger: Story = {
  args: {
    triggerVariant: 'button',
    buttonVariant: 'secondary',
    label: 'Upload attachments',
    hint: 'Use secondary to preserve the previous visual hierarchy.',
  },
};

export const MenuWithCustomActions: Story = {
  args: {
    triggerVariant: 'menu',
    menuActions: [
      { label: 'View Files', icon: FolderOpen },
      { label: 'Open Gallery', icon: ImageIcon },
      { label: 'Cancel', icon: XCircle },
    ],
  },
};

export const Disabled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <FilePicker triggerVariant="button" disabled label="Button trigger" />
        <FilePicker triggerVariant="menu" disabled label="Menu trigger" />
        <FilePicker triggerVariant="dropzone" disabled label="Dropzone trigger" />
      </div>
    </div>
  ),
};

export const UploadSimulation: Story = {
  render: () => {
    const [files, setFiles] = React.useState<FilePickerFile[]>([]);

    React.useEffect(() => {
      if (files.length === 0) {
        return undefined;
      }

      const interval = window.setInterval(() => {
        setFiles((current) =>
          current.map((file) => {
            if (file.status === 'idle') {
              return { ...file, status: 'waiting' };
            }

            if (file.status === 'waiting') {
              return { ...file, status: 'uploading', progress: 10 };
            }

            if (file.status === 'uploading') {
              const nextProgress = Math.min((file.progress ?? 0) + 20, 100);

              return nextProgress >= 100
                ? { ...file, status: 'complete', progress: 100 }
                : { ...file, progress: nextProgress };
            }

            return file;
          })
        );
      }, 900);

      return () => window.clearInterval(interval);
    }, [files.length]);

    return (
      <div className={storyStyles.storyA11yScope}>
        <div className={storyStyles.storyStack}>
          <div className={storyStyles.storyWidth}>
            <FilePicker
              triggerVariant="button"
              multiple
              files={files}
              onFilesChange={setFiles}
              onFilesAdded={(newFiles) => setFiles((current) => [...current, ...newFiles])}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFiles((current) =>
                current.map((file, index) =>
                  index === 0
                    ? { ...file, status: 'error', error: 'Simulated upload failure' }
                    : file
                )
              )
            }
          >
            Simulate error
          </Button>
        </div>
      </div>
    );
  },
};

export const MenuTriggerKeyboard: Story = {
  args: {
    triggerVariant: 'menu',
    menuLabel: 'Choose an action',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /choose an action/i });
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.body.querySelector('[role="menu"][data-state="open"]')).not.toBeNull();
    });
    const menu = document.body.querySelector('[role="menu"][data-state="open"]') as HTMLElement;
    await waitFor(() => {
      expect(within(menu).getByRole('menuitem', { name: /upload file/i })).toBeVisible();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(menu).toHaveAttribute('data-state', 'closed');
    });
  },
};

export const PanelHeaderUpdates: Story = {
  args: {
    triggerVariant: 'button',
    files: panelFiles,
    multiple: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: /uploading/i })).toBeVisible();
    await expect(canvas.getByText(/of \d+ files? uploaded/i)).toBeVisible();
  },
  parameters: storySourceParameters(
    '<FilePicker triggerVariant="button" files={files} multiple />'
  ),
};
