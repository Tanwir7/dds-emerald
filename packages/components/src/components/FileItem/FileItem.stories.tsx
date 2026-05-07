import type { Meta, StoryObj } from '@storybook/react-vite';
import storyStyles from './FileItem.stories.module.scss';
import { FileItem } from './FileItem';
import { storySourceParameters } from '../../utils/storySource';

const meta: Meta<typeof FileItem> = {
  title: 'Core Components/FileItem',
  component: FileItem,
  tags: ['autodocs'],
  args: {
    name: 'report.pdf',
    size: 245 * 1024,
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyItemWidth}>
        <FileItem {...args} />
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

type Story = StoryObj<typeof FileItem>;

export const AllStatuses: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyList}>
        <FileItem name="proposal.pdf" size={245 * 1024} status="idle" onRemove={() => undefined} />
        <FileItem name="mockup.png" size={512 * 1024} status="waiting" onRemove={() => undefined} />
        <FileItem
          name="walkthrough.mp4"
          size={2 * 1024 * 1024}
          status="uploading"
          progress={45}
          onRemove={() => undefined}
        />
        <FileItem
          name="dataset.csv"
          size={950 * 1024}
          status="paused"
          progress={60}
          onRemove={() => undefined}
        />
        <FileItem
          name="invoice.docx"
          size={180 * 1024}
          status="complete"
          downloadUrl="/downloads/invoice.docx"
          onRemove={() => undefined}
        />
        <FileItem
          name="archive.zip"
          size={1_500_000}
          status="error"
          error="Network timeout. Please try again."
          onRemove={() => undefined}
        />
      </div>
    </div>
  ),
  parameters: {
    ...storySourceParameters('// Multiple FileItem states'),
  },
};

export const UploadingProgress: Story = {
  args: {
    status: 'uploading',
    progress: 45,
    onRemove: () => undefined,
  },
};

export const PausedProgress: Story = {
  args: {
    status: 'paused',
    progress: 60,
    onRemove: () => undefined,
  },
};

export const WaitingState: Story = {
  args: {
    status: 'waiting',
    onRemove: () => undefined,
  },
};

export const ErrorState: Story = {
  args: {
    status: 'error',
    error: 'Network timeout. Please try again.',
    onRemove: () => undefined,
  },
};

export const WithDownloadUrl: Story = {
  args: {
    status: 'complete',
    downloadUrl: '/downloads/report.pdf',
  },
};

export const WithoutRemoveButton: Story = {
  args: {
    status: 'idle',
  },
};

export const LongFilename: Story = {
  args: {
    name: 'this-is-a-very-long-filename-designed-to-demonstrate-overflow-behavior-in-the-file-item-component.pdf',
    status: 'uploading',
    progress: 45,
    onRemove: () => undefined,
  },
};
