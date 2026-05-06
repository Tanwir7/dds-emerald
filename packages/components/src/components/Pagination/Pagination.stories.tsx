import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import storyStyles from './Pagination.stories.module.scss';
import { Pagination } from './Pagination';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const PaginationDemo = ({
  initialPage = 3,
  totalPages = 10,
  showPageSize = false,
  initialPageSize = 25,
  size = 'md',
}: {
  initialPage?: number;
  totalPages?: number;
  showPageSize?: boolean;
  initialPageSize?: number;
  size?: 'sm' | 'md';
}) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  return (
    <div className={storyStyles.storyStack}>
      {showPageSize ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showPageSize
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50]}
          onPageSizeChange={setPageSize}
          size={size}
        />
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          size={size}
        />
      )}
      <p className={storyStyles.statusText}>
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
};

const meta = {
  title: 'Core Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Pagination {...args} />
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  args: {
    currentPage: 3,
    totalPages: 10,
    onPageChange: fn(),
  },
  argTypes: {
    onPageChange: {
      control: false,
    },
    onPageSizeChange: {
      control: false,
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={3} totalPages={10} onPageChange={handlePageChange} />'
  ),
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 4,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={2} totalPages={4} onPageChange={handlePageChange} />'
  ),
};

export const ManyPages: Story = {
  args: {
    currentPage: 25,
    totalPages: 50,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={25} totalPages={50} onPageChange={handlePageChange} />'
  ),
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={1} totalPages={10} onPageChange={handlePageChange} />'
  ),
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={10} totalPages={10} onPageChange={handlePageChange} />'
  ),
};

export const WithPageSize: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <PaginationDemo showPageSize initialPage={3} totalPages={12} initialPageSize={25} />
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Pagination',
      '  currentPage={currentPage}',
      '  totalPages={12}',
      '  onPageChange={setCurrentPage}',
      '  showPageSize',
      '  pageSize={pageSize}',
      '  pageSizeOptions={[10, 25, 50]}',
      '  onPageSizeChange={setPageSize}',
      '/>'
    )
  ),
};

export const NoPrevNext: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    showPrevNext: false,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={3} totalPages={10} onPageChange={handlePageChange} showPrevNext={false} />'
  ),
};

export const NoFirstLast: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    showFirstLast: false,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={3} totalPages={10} onPageChange={handlePageChange} showFirstLast={false} />'
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Pagination
          currentPage={3}
          totalPages={10}
          onPageChange={fn()}
          size="sm"
          aria-label="Pagination small size"
        />
        <Pagination
          currentPage={3}
          totalPages={10}
          onPageChange={fn()}
          size="md"
          aria-label="Pagination medium size"
        />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Pagination',
      '  currentPage={3}',
      '  totalPages={10}',
      '  onPageChange={handlePageChange}',
      '  size="sm"',
      '  aria-label="Pagination small size"',
      '/>',
      '<Pagination',
      '  currentPage={3}',
      '  totalPages={10}',
      '  onPageChange={handlePageChange}',
      '  size="md"',
      '  aria-label="Pagination medium size"',
      '/>'
    )
  ),
};

export const Disabled: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    disabled: true,
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={3} totalPages={10} onPageChange={handlePageChange} disabled />'
  ),
};

export const Controlled: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <PaginationDemo initialPage={3} totalPages={10} />
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<>',
      '  <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />',
      '  <p>Page {currentPage} of 10</p>',
      '</>'
    )
  ),
};

export const NavigatePages: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <PaginationDemo initialPage={3} totalPages={10} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole('button', { name: /next page/i });

    await userEvent.click(nextButton);

    await expect(canvas.getByRole('button', { name: /page 4/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />'
  ),
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <PaginationDemo initialPage={2} totalPages={10} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page3 = canvas.getByRole('button', { name: /page 3/i });

    await userEvent.tab();
    await userEvent.click(page3);

    await expect(page3).toHaveAttribute('aria-current', 'page');
  },
  parameters: storySourceParameters(
    '<Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />'
  ),
};
