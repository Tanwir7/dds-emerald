import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, PlayCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { Heading } from '../Heading';
import { Icon } from '../Icon';
import { Image } from '../Image';
import { Text } from '../Text';
import { MediaObject } from './MediaObject';
import storyStyles from './MediaObject.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const avatarSrc =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80';

const imageSrc =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=240&q=80';

const meta: Meta<typeof MediaObject> = {
  title: 'Core Components/MediaObject',
  component: MediaObject,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
};

export default meta;

type Story = StoryObj<typeof MediaObject>;

const avatarMedia = (
  <Avatar>
    <AvatarImage src={avatarSrc} alt="Portrait of Ada Lovelace" />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
);

const content = (
  <div className={storyStyles.contentStack}>
    <Heading as="h3" size="2xl" font="sans">
      Ada Lovelace
    </Heading>
    <Text size="sm" color="muted">
      Computing pioneer and analytical engine collaborator.
    </Text>
  </div>
);

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MediaObject media={avatarMedia}>{content}</MediaObject>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(`<MediaObject media={avatar}>`, `  {content}`, `</MediaObject>`)
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MediaObject
        media={
          <div className={storyStyles.iconMedia}>
            <Icon icon={Bell} />
          </div>
        }
      >
        <div className={storyStyles.contentStack}>
          <Heading as="h3" size="2xl" font="sans">
            Build completed
          </Heading>
          <Text size="sm" color="muted">
            Documentation build finished successfully 2 minutes ago.
          </Text>
        </div>
      </MediaObject>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      `<MediaObject media={iconMedia}>`,
      `  <div>`,
      `    <Heading as="h3" size="2xl" font="sans">Build completed</Heading>`,
      `    <Text size="sm" color="muted">Documentation build finished successfully 2 minutes ago.</Text>`,
      `  </div>`,
      `</MediaObject>`
    )
  ),
};

export const MediaRight: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MediaObject media={avatarMedia} mediaPosition="right">
        {content}
      </MediaObject>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      `<MediaObject media={avatar} mediaPosition="right">`,
      `  {content}`,
      `</MediaObject>`
    )
  ),
};

export const AlignCenter: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MediaObject
        media={
          <div className={storyStyles.iconMedia}>
            <Icon icon={PlayCircle} />
          </div>
        }
        mediaAlign="center"
      >
        <div className={storyStyles.contentStack}>
          <Heading as="h3" size="2xl" font="sans">
            Release notes walkthrough
          </Heading>
          <Text size="sm" color="muted">
            A short multi-line summary sits beside the media block and stays vertically centered
            with the icon wrapper.
          </Text>
        </div>
      </MediaObject>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      `<MediaObject media={iconMedia} mediaAlign="center">`,
      `  <div>`,
      `    <Heading as="h3" size="2xl" font="sans">Release notes walkthrough</Heading>`,
      `    <Text size="sm" color="muted">A short multi-line summary sits beside the media block.</Text>`,
      `  </div>`,
      `</MediaObject>`
    )
  ),
};

export const ResponsiveStack: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MediaObject media={avatarMedia} stackAt="md">
        <div className={storyStyles.contentStack}>
          <Heading as="h3" size="2xl" font="sans">
            Responsive stack
          </Heading>
          <Text size="sm" color="muted">
            Below the md breakpoint, the layout collapses into a vertical stack while preserving the
            same DOM reading order.
          </Text>
        </div>
      </MediaObject>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      `<MediaObject media={avatar} stackAt="md">`,
      `  <div>`,
      `    <Heading as="h3" size="2xl" font="sans">Responsive stack</Heading>`,
      `    <Text size="sm" color="muted">Below the md breakpoint, the layout collapses into a vertical stack.</Text>`,
      `  </div>`,
      `</MediaObject>`
    )
  ),
};

export const GapSizes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        {(['xs', 'sm', 'md', 'lg'] as const).map((gap) => (
          <MediaObject
            key={gap}
            media={
              <Avatar size="sm">
                <AvatarFallback delayMs={0}>{gap.toUpperCase()}</AvatarFallback>
              </Avatar>
            }
            gap={gap}
          >
            <div className={storyStyles.contentStack}>
              <Text weight="semibold">{`Gap ${gap.toUpperCase()}`}</Text>
              <Text size="sm" color="muted">
                Spacing between media and content is controlled by the `gap` prop.
              </Text>
            </div>
          </MediaObject>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      ...(['xs', 'sm', 'md', 'lg'] as const).map((gap) =>
        storySource(
          `<MediaObject media={<Avatar size="sm"><AvatarFallback delayMs={0}>${gap.toUpperCase()}</AvatarFallback></Avatar>} gap="${gap}">`,
          `  <div>`,
          `    <Text weight="semibold">Gap ${gap.toUpperCase()}</Text>`,
          `    <Text size="sm" color="muted">Spacing between media and content is controlled by the gap prop.</Text>`,
          `  </div>`,
          `</MediaObject>`
        )
      )
    )
  ),
};

export const AsList: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <ul className={storyStyles.list}>
        <MediaObject as="li" media={avatarMedia}>
          {content}
        </MediaObject>
        <MediaObject
          as="li"
          media={
            <Avatar>
              <AvatarFallback delayMs={0}>GH</AvatarFallback>
            </Avatar>
          }
        >
          <div className={storyStyles.contentStack}>
            <Heading as="h3" size="2xl" font="sans">
              Grace Hopper
            </Heading>
            <Text size="sm" color="muted">
              Compiler design lead and systems programmer.
            </Text>
          </div>
        </MediaObject>
      </ul>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      `<ul>`,
      `  <MediaObject as="li" media={avatar}>`,
      `    {content}`,
      `  </MediaObject>`,
      `  <MediaObject as="li" media={fallbackAvatar}>`,
      `    {secondaryContent}`,
      `  </MediaObject>`,
      `</ul>`
    )
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <MediaObject
        media={
          <div className={storyStyles.thumbnail}>
            <Image src={imageSrc} alt="Developer workspace" />
          </div>
        }
      >
        <div className={storyStyles.contentStack}>
          <Heading as="h3" size="2xl" font="sans">
            Workspace thumbnail
          </Heading>
          <Text size="sm" color="muted">
            Image media keeps its own dimensions while the content column remains flexible.
          </Text>
        </div>
      </MediaObject>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      `<MediaObject media={thumbnail}>`,
      `  <div>`,
      `    <Heading as="h3" size="2xl" font="sans">Workspace thumbnail</Heading>`,
      `    <Text size="sm" color="muted">Image media keeps its own dimensions while the content column remains flexible.</Text>`,
      `  </div>`,
      `</MediaObject>`
    )
  ),
};

export const Stacked: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyStack}>
        <MediaObject
          media={
            <Avatar size="sm">
              <AvatarFallback delayMs={0}>AL</AvatarFallback>
            </Avatar>
          }
        >
          <div className={storyStyles.contentStack}>
            <Text weight="semibold">Ada commented on the release checklist</Text>
            <Text size="sm" color="muted">
              10 minutes ago
            </Text>
          </div>
        </MediaObject>
        <MediaObject
          media={
            <Avatar size="sm">
              <AvatarFallback delayMs={0}>GH</AvatarFallback>
            </Avatar>
          }
        >
          <div className={storyStyles.contentStack}>
            <Text weight="semibold">Grace approved the API update</Text>
            <Text size="sm" color="muted">
              32 minutes ago
            </Text>
          </div>
        </MediaObject>
        <MediaObject
          media={
            <Avatar size="sm">
              <AvatarFallback delayMs={0}>KJ</AvatarFallback>
            </Avatar>
          }
        >
          <div className={storyStyles.contentStack}>
            <Text weight="semibold">Katherine attached a benchmark report</Text>
            <Text size="sm" color="muted">
              1 hour ago
            </Text>
          </div>
        </MediaObject>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      storySource(
        `<MediaObject media={<Avatar size="sm"><AvatarFallback delayMs={0}>AL</AvatarFallback></Avatar>}>`,
        `  <div>`,
        `    <Text weight="semibold">Ada commented on the release checklist</Text>`,
        `    <Text size="sm" color="muted">10 minutes ago</Text>`,
        `  </div>`,
        `</MediaObject>`
      ),
      storySource(
        `<MediaObject media={<Avatar size="sm"><AvatarFallback delayMs={0}>GH</AvatarFallback></Avatar>}>`,
        `  <div>`,
        `    <Text weight="semibold">Grace approved the API update</Text>`,
        `    <Text size="sm" color="muted">32 minutes ago</Text>`,
        `  </div>`,
        `</MediaObject>`
      ),
      storySource(
        `<MediaObject media={<Avatar size="sm"><AvatarFallback delayMs={0}>KJ</AvatarFallback></Avatar>}>`,
        `  <div>`,
        `    <Text weight="semibold">Katherine attached a benchmark report</Text>`,
        `    <Text size="sm" color="muted">1 hour ago</Text>`,
        `  </div>`,
        `</MediaObject>`
      )
    )
  ),
};
