import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertCircle, CheckCircle, Search, X } from 'lucide-react';
import { Icon } from './Icon';
import { Text } from '../Text';
import storyStyles from './Icon.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySourceFragment, storySourceParameters } from '../../utils/storySource';

const storyColourItemClassName = getRequiredClassName(storyStyles, 'storyColourItem');

const componentDescription = `Icon renders a single Lucide icon component with Emerald sizing, currentColor inheritance, and explicit decorative or meaningful accessibility modes. Pass the Lucide component itself with \`icon={Search}\`; do not pass an instantiated SVG element or a Lucide \`size\` prop.

### Lucide setup

\`\`\`sh
pnpm add lucide-react
\`\`\`

\`\`\`tsx
import { Search } from 'lucide-react';
import { Icon } from '@dds/emerald';

<Icon icon={Search} />
\`\`\`

Browse available icons at https://lucide.dev/icons/. Lucide's React guide documents named icon imports from \`lucide-react\`; Emerald owns sizing, color inheritance, and accessibility state once the icon component is passed to \`Icon\`.

### Accessibility contract

- Keyboard: Icon is non-interactive and does not receive focus; wrap it in a native control when it triggers an action.
- Screen readers: Decorative icons must omit \`label\` and are hidden from assistive technology. Meaningful standalone icons must provide \`label\`, which is exposed on the SVG as an image name.
- Focus: Icon has no focus management of its own; parent controls own focus visibility and interaction behavior.
- Designers: document whether an icon is decorative or meaningful, provide visible paired text where possible, and specify accessible labels for standalone meaningful icons.
- QA: verify decorative icons are hidden, meaningful icons have a clear name, color is inherited from context, and all sizes pass axe.`;

const buildIconSource = ({ icon, size = 'md', label }: ComponentProps<typeof Icon>) => {
  const iconName = icon === X ? 'X' : icon === AlertCircle ? 'AlertCircle' : 'Search';
  const props = [`icon={${iconName}}`];

  if (size !== 'md') {
    props.push(`size="${size}"`);
  }

  if (label) {
    props.push(`label="${label}"`);
  }

  return `<Icon ${props.join(' ')} />`;
};

const meta: Meta<typeof Icon> = {
  title: 'Core Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Icon>) => (
    <div className={storyStyles.storyA11yScope}>
      <Icon {...args} />
    </div>
  ),
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
    icon: Search,
    size: 'md',
  },
  argTypes: {
    icon: {
      control: false,
      description: 'Lucide icon component, for example `Search`, `X`, or `AlertCircle`.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
      description:
        'Accessible name for meaningful standalone icons. Leave empty for decorative icons.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Decorative: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Text as="span" className={storyColourItemClassName}>
        <Icon icon={Search} />
        Search
      </Text>
    </div>
  ),
  parameters: storySourceParameters(
    `<Text as="span">
  <Icon icon={Search} />
  Search
</Text>`
  ),
};

export const Meaningful: Story = {
  args: {
    icon: X,
    label: 'Close',
  },
  parameters: storySourceParameters(buildIconSource({ icon: X, label: 'Close' })),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <span className={storyStyles.storySizeItem}>
          <Icon icon={Search} size="sm" />
          <Text as="span" size="sm">
            sm
          </Text>
        </span>
        <span className={storyStyles.storySizeItem}>
          <Icon icon={Search} />
          <Text as="span" size="sm">
            md
          </Text>
        </span>
        <span className={storyStyles.storySizeItem}>
          <Icon icon={Search} size="lg" />
          <Text as="span" size="sm">
            lg
          </Text>
        </span>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Text as="span" size="sm"><Icon icon={Search} size="sm" />sm</Text>',
      '<Text as="span" size="sm"><Icon icon={Search} />md</Text>',
      '<Text as="span" size="sm"><Icon icon={Search} size="lg" />lg</Text>'
    )
  ),
};

export const ColourInheritance: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyColourStack}>
        <Text as="span" className={storyColourItemClassName}>
          <Icon icon={Search} />
          Default text
        </Text>
        <Text as="span" color="muted" className={storyColourItemClassName}>
          <Icon icon={Search} />
          Muted text
        </Text>
        <Text as="span" color="success" className={storyColourItemClassName}>
          <Icon icon={CheckCircle} />
          Success text
        </Text>
        <Text as="span" color="danger" className={storyColourItemClassName}>
          <Icon icon={AlertCircle} />
          Danger text
        </Text>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      '<Text as="span"><Icon icon={Search} />Default text</Text>',
      '<Text as="span" color="muted"><Icon icon={Search} />Muted text</Text>',
      '<Text as="span" color="success"><Icon icon={CheckCircle} />Success text</Text>',
      '<Text as="span" color="danger"><Icon icon={AlertCircle} />Danger text</Text>'
    )
  ),
};
