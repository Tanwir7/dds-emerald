import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineAlert } from './InlineAlert';
import storyStyles from './InlineAlert.stories.module.scss';
import { Field } from '../Field';
import { Input } from '../Input';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';

const componentDescription = `InlineAlert is the compact inline feedback primitive for short in-flow messages inside paragraphs, forms, and tight layouts.

### Accessibility contract

- Keyboard: read-only content with no interactive affordances.
- Screen readers: \`warning\` and \`danger\` announce assertively with \`role="alert"\`; \`info\` and \`success\` announce politely with \`role="status"\`.
- Focus: none, because InlineAlert is non-interactive.
- Designers: use InlineAlert for brief, single-line context. Escalate to Alert when the message needs a title, body block, icon override space, or dismissal.
- QA: verify inline usage inside text, intent-based live-region semantics, and axe results with and without icons.`;

const renderInlineAlert = (args: ComponentProps<typeof InlineAlert>) => (
  <div className={storyStyles.storyA11yScope}>
    <InlineAlert {...args} />
  </div>
);

const buildInlineAlertSource = ({
  intent = 'info',
  showIcon = true,
  children,
}: ComponentProps<typeof InlineAlert>) => {
  const props: string[] = [];

  if (intent !== 'info') {
    props.push(`intent="${intent}"`);
  }

  if (!showIcon) {
    props.push('showIcon={false}');
  }

  const propString = props.length > 0 ? ` ${props.join(' ')}` : '';

  return `<InlineAlert${propString}>${children}</InlineAlert>`;
};

const meta: Meta<typeof InlineAlert> = {
  title: 'Core Components/InlineAlert',
  component: InlineAlert,
  tags: ['autodocs'],
  render: (args) => renderInlineAlert(args),
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  args: {
    children: 'This is an informational inline alert.',
    intent: 'info',
  },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'danger'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof InlineAlert>;

export const Info: Story = {
  args: {
    children: 'This is an informational inline alert.',
  },
  parameters: storySourceParameters(
    buildInlineAlertSource({
      children: 'This is an informational inline alert.',
    })
  ),
};

export const Success: Story = {
  args: {
    intent: 'success',
    children: 'Changes saved successfully.',
  },
  parameters: storySourceParameters(
    buildInlineAlertSource({
      intent: 'success',
      children: 'Changes saved successfully.',
    })
  ),
};

export const Warning: Story = {
  args: {
    intent: 'warning',
    children: 'Please fix 3 errors above.',
  },
  parameters: storySourceParameters(
    buildInlineAlertSource({
      intent: 'warning',
      children: 'Please fix 3 errors above.',
    })
  ),
};

export const Danger: Story = {
  args: {
    intent: 'danger',
    children: 'We could not save your latest change.',
  },
  parameters: storySourceParameters(
    buildInlineAlertSource({
      intent: 'danger',
      children: 'We could not save your latest change.',
    })
  ),
};

export const NoIcon: Story = {
  args: {
    showIcon: false,
    children: 'This inline alert omits the decorative icon.',
  },
  parameters: storySourceParameters(
    buildInlineAlertSource({
      showIcon: false,
      children: 'This inline alert omits the decorative icon.',
    })
  ),
};

export const AllIntents: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <InlineAlert>Informational context for this section.</InlineAlert>
        <InlineAlert intent="success">The job completed successfully.</InlineAlert>
        <InlineAlert intent="warning">Please review the highlighted fields.</InlineAlert>
        <InlineAlert intent="danger">The request could not be completed.</InlineAlert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <InlineAlert>Informational context for this section.</InlineAlert>',
          '  <InlineAlert intent="success">The job completed successfully.</InlineAlert>',
          '  <InlineAlert intent="warning">Please review the highlighted fields.</InlineAlert>',
          '  <InlineAlert intent="danger">The request could not be completed.</InlineAlert>',
          '</>'
        )
      ),
    },
  },
};

export const InsideParagraph: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <p className={storyStyles.storyParagraph}>
        Deployment notes:{' '}
        <InlineAlert intent="info">API changes apply only to new tokens created today.</InlineAlert>
      </p>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<p>',
          '  Deployment notes:{" "}',
          '  <InlineAlert intent="info">',
          '    API changes apply only to new tokens created today.',
          '  </InlineAlert>',
          '</p>'
        )
      ),
    },
  },
};

export const InFormContext: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyForm}>
        <Field label="Email address" helper="Use your work email address.">
          <Input defaultValue="ada" invalid />
        </Field>
        <InlineAlert intent="danger">Please fix the email format before continuing.</InlineAlert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<>',
          '  <Field label="Email address" helper="Use your work email address.">',
          '    <Input defaultValue="ada" invalid />',
          '  </Field>',
          '  <InlineAlert intent="danger">',
          '    Please fix the email format before continuing.',
          '  </InlineAlert>',
          '</>'
        )
      ),
    },
  },
};
