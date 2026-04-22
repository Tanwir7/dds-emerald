import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { AvatarGroup } from '../AvatarGroup';
import storyStyles from './Avatar.stories.module.scss';
import { storySourceParameters } from '../../utils/storySource';

const imageSrc =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80';

const meta: Meta<typeof Avatar> = {
  title: 'Core Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
    docs: {
      description: {
        component:
          'Avatar uses a compound API. Import the parts you render: `Avatar`, `AvatarImage`, and `AvatarFallback` for image avatars; `Avatar` and `AvatarFallback` for fallback-only avatars. `AvatarImage` requires both `src` and `alt`.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Avatar>
        <AvatarImage src={imageSrc} alt="Portrait of Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: storySourceParameters(`<Avatar>
  <AvatarImage src={imageSrc} alt="Portrait of Ada Lovelace" />
  <AvatarFallback>AL</AvatarFallback>
</Avatar>`),
};

export const WithFallback: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Avatar>
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: storySourceParameters(`<Avatar>
  <AvatarFallback delayMs={0}>AL</AvatarFallback>
</Avatar>`),
};

export const Sizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Avatar size="sm">
          <AvatarImage src={imageSrc} alt="Small portrait of Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar size="md">
          <AvatarImage src={imageSrc} alt="Medium portrait of Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src={imageSrc} alt="Large portrait of Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
  parameters: storySourceParameters(`<>
  <Avatar size="sm">
    <AvatarImage src={imageSrc} alt="Small portrait of Ada Lovelace" />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
  <Avatar size="md">
    <AvatarImage src={imageSrc} alt="Medium portrait of Ada Lovelace" />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
  <Avatar size="lg">
    <AvatarImage src={imageSrc} alt="Large portrait of Ada Lovelace" />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
</>`),
};

export const FallbackSizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Avatar size="sm">
          <AvatarFallback delayMs={0}>SM</AvatarFallback>
        </Avatar>
        <Avatar size="md">
          <AvatarFallback delayMs={0}>MD</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback delayMs={0}>LG</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
  parameters: storySourceParameters(`<>
  <Avatar size="sm">
    <AvatarFallback delayMs={0}>SM</AvatarFallback>
  </Avatar>
  <Avatar size="md">
    <AvatarFallback delayMs={0}>MD</AvatarFallback>
  </Avatar>
  <Avatar size="lg">
    <AvatarFallback delayMs={0}>LG</AvatarFallback>
  </Avatar>
</>`),
};

export const ImageError: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Avatar>
        <AvatarImage src="/missing-avatar-image.png" alt="Ada Lovelace" />
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: storySourceParameters(`<Avatar>
  <AvatarImage src="/missing-avatar-image.png" alt="Ada Lovelace" />
  <AvatarFallback delayMs={0}>AL</AvatarFallback>
</Avatar>`),
};

export const Group: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <AvatarGroup aria-label="User avatars: Ada, Grace, Katherine, Dorothy, and Hedy">
        <Avatar>
          <AvatarFallback delayMs={0}>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>GH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>KJ</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>DV</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>HL</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </div>
  ),
  parameters:
    storySourceParameters(`<AvatarGroup aria-label="User avatars: Ada, Grace, Katherine, Dorothy, and Hedy">
  <Avatar>
    <AvatarFallback delayMs={0}>AL</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>GH</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>KJ</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>DV</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>HL</AvatarFallback>
  </Avatar>
</AvatarGroup>`),
};

export const GroupOverflow: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <AvatarGroup max={4} aria-label="User avatars: Ada, Grace, Katherine, Dorothy, and 4 others">
        <Avatar>
          <AvatarFallback delayMs={0}>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>GH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>KJ</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>DV</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>HL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>MC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>RJ</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>SP</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </div>
  ),
  parameters:
    storySourceParameters(`<AvatarGroup max={4} aria-label="User avatars: Ada, Grace, Katherine, Dorothy, and 4 others">
  <Avatar>
    <AvatarFallback delayMs={0}>AL</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>GH</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>KJ</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>DV</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>HL</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>MC</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>RJ</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback delayMs={0}>SP</AvatarFallback>
  </Avatar>
</AvatarGroup>`),
};

export const GroupSizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <AvatarGroup key={size} size={size} max={3} aria-label={`${size} user avatars`}>
            <Avatar>
              <AvatarFallback delayMs={0}>AL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback delayMs={0}>GH</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback delayMs={0}>KJ</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback delayMs={0}>DV</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback delayMs={0}>HL</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(`<>
  <AvatarGroup size="sm" max={3} aria-label="Small user avatars">
    <Avatar>
      <AvatarFallback delayMs={0}>AL</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>GH</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>KJ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>DV</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>HL</AvatarFallback>
    </Avatar>
  </AvatarGroup>
  <AvatarGroup size="md" max={3} aria-label="Medium user avatars">
    <Avatar>
      <AvatarFallback delayMs={0}>AL</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>GH</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>KJ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>DV</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>HL</AvatarFallback>
    </Avatar>
  </AvatarGroup>
  <AvatarGroup size="lg" max={3} aria-label="Large user avatars">
    <Avatar>
      <AvatarFallback delayMs={0}>AL</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>GH</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>KJ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>DV</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>HL</AvatarFallback>
    </Avatar>
  </AvatarGroup>
</>`),
};
