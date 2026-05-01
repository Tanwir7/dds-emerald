import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import storyStyles from './FileItem.stories.module.scss';
import { FileItem } from './FileItem';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const defaultSize = 245 * 1024;

const meta: Meta<typeof FileItem> = {
  title: 'Core Components/FileItem',
  component: FileItem,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
  args: {
    name: 'report.pdf',
    size: defaultSize,
  },
  render: (args: ComponentProps<typeof FileItem>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyItemWidth}>
        <FileItem {...args} />
      </div>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof FileItem>;

export const Default: Story = {
  parameters: storySourceParameters('<FileItem name="report.pdf" size={250880} />'),
};

export const Uploading: Story = {
  args: {
    status: 'uploading',
    progress: 62,
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} status="uploading" progress={62} />'
  ),
};

export const Complete: Story = {
  args: {
    status: 'complete',
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} status="complete" />'
  ),
};

export const Error: Story = {
  args: {
    status: 'error',
    errorMessage: 'Upload failed. File too large.',
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} status="error" errorMessage="Upload failed. File too large." />'
  ),
};

export const Removable: Story = {
  args: {
    removable: true,
  },
  parameters: storySourceParameters('<FileItem name="report.pdf" size={250880} removable />'),
};

export const WithDownload: Story = {
  args: {
    downloadUrl: '/downloads/report.pdf',
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} downloadUrl="/downloads/report.pdf" />'
  ),
};

export const Clickable: Story = {
  args: {
    onClick: fn(),
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} onClick={() => {}} />'
  ),
};

export const FileTypes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <div className={storyStyles.storyList}>
          <FileItem name="report.pdf" size={250880} />
          <FileItem name="hero.png" size={135168} />
          <FileItem name="demo.mp4" size={4194304} />
          <FileItem name="voice.mp3" size={524288} />
          <FileItem name="app.ts" size={4096} />
          <FileItem name="revenue.xlsx" size={98304} />
          <FileItem name="proposal.docx" size={196608} />
          <FileItem name="bundle.zip" size={786432} />
        </div>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <FileItem name="report.pdf" size={250880} />',
      '  <FileItem name="hero.png" size={135168} />',
      '  <FileItem name="demo.mp4" size={4194304} />',
      '  <FileItem name="voice.mp3" size={524288} />',
      '  <FileItem name="app.ts" size={4096} />',
      '  <FileItem name="revenue.xlsx" size={98304} />',
      '  <FileItem name="proposal.docx" size={196608} />',
      '  <FileItem name="bundle.zip" size={786432} />',
      '</>'
    )
  ),
};

export const UploadList: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyList}>
        <FileItem name="notes.txt" size={2048} />
        <FileItem name="recording.mp4" size={3145728} status="uploading" progress={62} />
        <FileItem name="invoice.pdf" size={122880} status="complete" />
        <FileItem
          name="archive.zip"
          size={786432}
          status="error"
          errorMessage="Upload failed. File too large."
        />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<FileItem name="notes.txt" size={2048} />',
      '<FileItem name="recording.mp4" size={3145728} status="uploading" progress={62} />',
      '<FileItem name="invoice.pdf" size={122880} status="complete" />',
      '<FileItem name="archive.zip" size={786432} status="error" errorMessage="Upload failed. File too large." />'
    )
  ),
};

export const NoSize: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyItemWidth}>
        <FileItem name="report.pdf" />
      </div>
    </div>
  ),
  parameters: storySourceParameters('<FileItem name="report.pdf" />'),
};

export const RemoveFile: Story = {
  args: {
    removable: true,
    onRemove: fn(),
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} removable onRemove={() => {}} />'
  ),
  play: async ({ args, canvasElement }) => {
    const removeBtn = within(canvasElement).getByRole('button', { name: /remove/i });
    await userEvent.click(removeBtn);
    await expect(args.onRemove).toHaveBeenCalled();
  },
};

export const ProgressUpdate: Story = {
  args: {
    status: 'uploading',
    progress: 62,
  },
  parameters: storySourceParameters(
    '<FileItem name="report.pdf" size={250880} status="uploading" progress={62} />'
  ),
  play: async ({ canvasElement }) => {
    const progressBar = within(canvasElement).getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '62');
  },
};
