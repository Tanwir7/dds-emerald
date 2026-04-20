import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from './Button';
import styles from './Button.module.scss';

const componentDescription = `Buttons accept an optional \`icon\` prop typed as \`LucideIcon\` from \`lucide-react\`. Icon names come from the Lucide React icon set, so consumers can choose from the Lucide library and import the icons they need directly, for example \`import { Plus, ArrowRight } from 'lucide-react'\`.

### Accessibility contract

- Keyboard: native button behavior applies; Tab reaches enabled and loading buttons, Enter and Space activate enabled buttons, and disabled buttons are removed from keyboard focus by the browser.
- Screen readers: every button must have an accessible name from visible text, \`aria-label\`, or \`aria-labelledby\`; decorative icons and loading spinners are hidden from assistive technology.
- Focus: focus uses the shared Emerald outline ring. Loading buttons remain focusable and expose \`aria-disabled="true"\` while suppressing activation.
- Designers: provide visible labels for standard buttons, specific accessible names for icon-only buttons, and user-facing loading text such as "Saving..." when an action is in progress.
- QA: verify keyboard activation, disabled and loading behavior, accessible names for icon-only buttons, focus visibility, and axe results for each variant.`;

const buildButtonSource = ({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'start',
  ...args
}: ComponentProps<typeof Button>) => {
  const props: string[] = [];

  if (variant !== 'primary') {
    props.push(`variant="${variant}"`);
  }

  if (size !== 'default') {
    props.push(`size="${size}"`);
  }

  if (fullWidth) {
    props.push('fullWidth');
  }

  if (disabled) {
    props.push('disabled');
  }

  if (loading) {
    props.push('loading');
  }

  if (icon === Plus) {
    props.push('icon={Plus}');
  } else if (icon === ArrowRight) {
    props.push('icon={ArrowRight}');
  }

  if (iconPosition !== 'start') {
    props.push(`iconPosition="${iconPosition}"`);
  }

  if (args['aria-label']) {
    props.push(`aria-label="${args['aria-label']}"`);
  }

  const propString = props.length > 0 ? ` ${props.join(' ')}` : '';

  if (children) {
    return `<Button${propString}>${children}</Button>`;
  }

  return `<Button${propString} />`;
};

const meta: Meta<typeof Button> = {
  title: 'Core Components/Button',
  component: Button,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Button>) => {
    if (args.fullWidth) {
      return (
        <div className={styles.storyA11yScope}>
          <div className={styles.storyFullWidthFrame}>
            <Button {...args} />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.storyA11yScope}>
        <Button {...args} />
      </div>
    );
  },
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
    },
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'default',
    fullWidth: false,
    disabled: false,
    loading: false,
  },
  argTypes: {
    children: {
      control: 'text',
      description:
        'Visible button label. Clear this value and provide `aria-label` to create an icon-only button.',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon', 'icon-sm', 'icon-lg'],
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes the button span the full width of its container.',
    },
    icon: {
      control: false,
      description: 'Lucide icon component, for example `Plus` or `ArrowRight`.',
    },
    iconPosition: {
      control: 'inline-radio',
      options: ['start', 'end'],
    },
    loading: {
      control: 'boolean',
      description:
        'Shows an indeterminate spinner in the start icon slot and suppresses activation while keeping the button focusable.',
    },
    'aria-label': {
      control: 'text',
      description: 'Required when the button has no visible text, for example icon-only buttons.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: buildButtonSource({
          children: 'Button',
          variant: 'primary',
          size: 'default',
          disabled: false,
        }),
      },
    },
  },
};

export const IconBefore: Story = {
  args: {
    children: 'Button',
    icon: Plus,
    iconPosition: 'start',
  },
  parameters: {
    docs: {
      source: {
        code: buildButtonSource({
          children: 'Button',
          variant: 'primary',
          size: 'default',
          disabled: false,
          icon: Plus,
          iconPosition: 'start',
        }),
      },
    },
  },
};

export const IconAfter: Story = {
  args: {
    children: 'Continue',
    icon: ArrowRight,
    iconPosition: 'end',
  },
  parameters: {
    docs: {
      source: {
        code: buildButtonSource({
          children: 'Continue',
          variant: 'primary',
          size: 'default',
          disabled: false,
          icon: ArrowRight,
          iconPosition: 'end',
        }),
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    children: undefined,
    size: 'icon',
    icon: Plus,
    'aria-label': 'Add item',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `size="icon"`, clear `children`, and provide `aria-label` to preview an icon-only button.',
      },
      source: {
        code: buildButtonSource({
          children: undefined,
          variant: 'primary',
          size: 'icon',
          disabled: false,
          icon: Plus,
          iconPosition: 'start',
          'aria-label': 'Add item',
        }),
      },
    },
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Continue',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'This example uses a fixed-width container so the `fullWidth` behavior is visible in Storybook.',
      },
      source: {
        code: `<div className="${styles.storyFullWidthFrame}">
  ${buildButtonSource({
    children: 'Continue',
    variant: 'primary',
    size: 'default',
    fullWidth: true,
    disabled: false,
  })}
</div>`,
      },
    },
  },
};

export const Loading: Story = {
  args: {
    children: 'Saving...',
    loading: true,
  },
  parameters: {
    docs: {
      source: {
        code: buildButtonSource({
          children: 'Saving...',
          variant: 'primary',
          size: 'default',
          disabled: false,
          loading: true,
        }),
      },
    },
  },
};
