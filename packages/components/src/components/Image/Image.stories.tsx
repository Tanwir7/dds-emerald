import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './Image';
import storyStyles from './Image.stories.module.scss';

const imageSrc =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=960&q=80';

const meta: Meta<typeof Image> = {
  title: 'Core Components/Image',
  component: Image,
  tags: ['autodocs'],
  render: (args: ComponentProps<typeof Image>) => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyFrame}>
        <Image {...args} />
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      context: `.${storyStyles.storyA11yScope}`,
    },
  },
  argTypes: {
    aspectRatio: {
      control: 'inline-radio',
      options: [undefined, '1/1', '4/3', '16/9', '3/2'],
    },
    fit: {
      control: 'inline-radio',
      options: ['cover', 'contain', 'fill'],
    },
    loading: {
      control: 'inline-radio',
      options: ['lazy', 'eager'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Image>;

const aspectRatios = ['1/1', '4/3', '16/9', '3/2'] as const;
const fitModes = ['cover', 'contain', 'fill'] as const;

export const Default: Story = {
  args: {
    src: imageSrc,
    alt: 'Modern workspace with desks, chairs, and daylight',
    width: 960,
    height: 640,
  },
};

export const AspectRatios: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        {aspectRatios.map((aspectRatio) => (
          <div key={aspectRatio} className={storyStyles.storyItem}>
            <Image
              src={imageSrc}
              alt={`Workspace cropped to ${aspectRatio}`}
              aspectRatio={aspectRatio}
            />
            <span className={storyStyles.storyLabel}>{aspectRatio}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FitModes: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGridThree}>
        {fitModes.map((fit) => (
          <div key={fit} className={storyStyles.storyItem}>
            <Image
              src={imageSrc}
              alt={`Workspace displayed with ${fit} fit`}
              aspectRatio="4/3"
              fit={fit}
            />
            <span className={storyStyles.storyLabel}>{fit}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Rounded: Story = {
  args: {
    src: imageSrc,
    alt: 'Circular crop of a modern workspace',
    aspectRatio: '1/1',
    rounded: true,
  },
};

export const LazyLoading: Story = {
  args: {
    src: imageSrc,
    alt: 'Lazy loaded workspace image',
    aspectRatio: '16/9',
    loading: 'lazy',
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses the default native lazy loading behavior.',
      },
    },
  },
};

export const Decorative: Story = {
  args: {
    src: imageSrc,
    alt: '',
    aspectRatio: '16/9',
  },
};

export const LoadingState: Story = {
  args: {
    src: '/missing-image-loading-state.jpg',
    alt: 'Image placeholder background while the image cannot load',
    aspectRatio: '16/9',
  },
};
