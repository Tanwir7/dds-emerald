import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilePicker, type FilePickerFile } from './FilePicker';
import storyStyles from './FilePicker.stories.module.scss';
import { storySourceParameters } from '../../utils/storySource';

const makeFile = (name: string, type: string, size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

const uploadedFiles: FilePickerFile[] = [
  {
    id: 'contract',
    file: makeFile('contract.pdf', 'application/pdf', 1024 * 1024),
    status: 'complete',
    downloadUrl: 'https://example.com/contract.pdf',
  },
  {
    id: 'brief',
    file: makeFile(
      'brief.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      512 * 1024
    ),
    status: 'uploading',
    progress: 52,
  },
];

const meta: Meta<typeof FilePicker> = {
  title: 'Core Components/FilePicker',
  component: FilePicker,
  tags: ['autodocs'],
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <FilePicker {...args} />
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

export const Default: Story = {
  args: {
    label: 'Attachments',
    accept: '.pdf,.docx',
    multiple: true,
  },
  parameters: storySourceParameters(
    `<FilePicker
  label="Attachments"
  accept=".pdf,.docx"
  multiple
/>`
  ),
};

export const WithFiles: Story = {
  args: {
    label: 'Project files',
    accept: '.pdf,.docx',
    multiple: true,
    files: uploadedFiles,
  },
  parameters: storySourceParameters(
    `<FilePicker
  label="Project files"
  accept=".pdf,.docx"
  multiple
  files={[
    {
      id: "contract",
      file: new File([""], "contract.pdf", { type: "application/pdf" }),
      status: "complete",
      downloadUrl: "https://example.com/contract.pdf",
    },
    {
      id: "brief",
      file: new File([""], "brief.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      status: "uploading",
      progress: 52,
    },
  ]}
/>`
  ),
};

export const Compact: Story = {
  args: {
    label: 'Comment attachment',
    accept: '.png,.jpg',
    compact: true,
    acceptedFormatsLabel: 'PNG, JPG up to 10 MB',
  },
  parameters: storySourceParameters(
    `<FilePicker
  label="Comment attachment"
  accept=".png,.jpg"
  compact
  acceptedFormatsLabel="PNG, JPG up to 10 MB"
/>`
  ),
};
