import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator,
  type BreadcrumbsProps,
} from './Breadcrumbs';
import storyStyles from './Breadcrumbs.stories.module.scss';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Breadcrumbs renders a hierarchical page trail inside a labelled navigation landmark.

### Accessibility contract

- Keyboard: links and the truncation button are tabbable in reading order; the current page is static text and not focusable.
- Screen readers: the root uses \`nav[aria-label="Breadcrumb"]\`; separators are hidden from assistive technology; the current item announces \`aria-current="page"\`.
- Focus management: no custom focus behavior; use the standard outline-based DDS focus ring on links and the truncation button.
- Designers: keep labels concise, use the current page as plain text, and avoid color-only differentiation between current and non-current items.
- QA: verify the last item is not a link by default, truncation expands on activation, and custom separators remain hidden from assistive technology.`;

const DefaultRender = (args: BreadcrumbsProps) => (
  <div className={storyStyles.storyA11yScope}>
    <Breadcrumbs {...args}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components">Components</BreadcrumbItem>
      <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
    </Breadcrumbs>
  </div>
);

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Core Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  render: DefaultRender,
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

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  parameters: storySourceParameters(
    storySource(
      '<Breadcrumbs>',
      '  <BreadcrumbItem href="/">Home</BreadcrumbItem>',
      '  <BreadcrumbItem href="/components">Components</BreadcrumbItem>',
      '  <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>',
      '</Breadcrumbs>'
    )
  ),
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
  parameters: storySourceParameters(
    storySource(
      '<Breadcrumbs size="sm">',
      '  <BreadcrumbItem href="/">Home</BreadcrumbItem>',
      '  <BreadcrumbItem href="/components">Components</BreadcrumbItem>',
      '  <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>',
      '</Breadcrumbs>'
    )
  ),
};

export const Truncated: Story = {
  args: {
    maxItems: 4,
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Breadcrumbs {...args}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/library">Library</BreadcrumbItem>
        <BreadcrumbItem href="/library/navigation">Navigation</BreadcrumbItem>
        <BreadcrumbItem href="/library/navigation/guides">Guides</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Breadcrumbs maxItems={4}>',
      '  <BreadcrumbItem href="/">Home</BreadcrumbItem>',
      '  <BreadcrumbItem href="/library">Library</BreadcrumbItem>',
      '  <BreadcrumbItem href="/library/navigation">Navigation</BreadcrumbItem>',
      '  <BreadcrumbItem href="/library/navigation/guides">Guides</BreadcrumbItem>',
      '  <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>',
      '</Breadcrumbs>'
    )
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <Breadcrumbs separator={<span>/</span>}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
          <BreadcrumbItem>Profile</BreadcrumbItem>
        </Breadcrumbs>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbSeparator>
            <span>/</span>
          </BreadcrumbSeparator>
          <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
          <BreadcrumbSeparator>
            <span>/</span>
          </BreadcrumbSeparator>
          <BreadcrumbItem>Profile</BreadcrumbItem>
        </Breadcrumbs>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Breadcrumbs separator={<span>/</span>}>',
          '    <BreadcrumbItem href="/">Home</BreadcrumbItem>',
          '    <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>',
          '    <BreadcrumbItem>Profile</BreadcrumbItem>',
          '  </Breadcrumbs>',
          '',
          '  <Breadcrumbs>',
          '    <BreadcrumbItem href="/">Home</BreadcrumbItem>',
          '    <BreadcrumbSeparator>',
          '      <span>/</span>',
          '    </BreadcrumbSeparator>',
          '    <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>',
          '    <BreadcrumbSeparator>',
          '      <span>/</span>',
          '    </BreadcrumbSeparator>',
          '    <BreadcrumbItem>Profile</BreadcrumbItem>',
          '  </Breadcrumbs>',
          '</>'
        )
      ),
    },
  },
};
