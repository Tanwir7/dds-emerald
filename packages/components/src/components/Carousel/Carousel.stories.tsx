import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pause, Play } from 'lucide-react';
import { Button } from '../Button';
import { storySource, storySourceBlock, storySourceParameters } from '../../utils/storySource';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselNextButton,
  CarouselPrevButton,
  CarouselSlide,
  useCarousel,
} from './Carousel';
import storyStyles from './Carousel.stories.module.scss';

const componentDescription = `Carousel displays horizontally scrollable slides with native scroll snap and optional autoplay.

### Accessibility contract

- Keyboard: when focus is inside the carousel, \`ArrowLeft\` and \`ArrowRight\` move slides, \`Home\` moves to the first slide, and \`End\` moves to the last slide.
- Screen readers: the root uses \`aria-roledescription="carousel"\`, each slide announces itself as \`Slide N of M\`, and dots expose slide navigation via a tablist.
- Focus management: the carousel does not trap focus; interactive controls inside slides remain in normal tab order. Autoplay pauses on hover and focus by default.
- Designers: do not rely on color alone for the active dot; the widened active pill is part of the component contract.
- QA: verify swipe or trackpad scrolling keeps dots and nav button states synchronized, and provide a pause control whenever autoplay is enabled.`;

const slideContent = [
  {
    id: '01',
    title: 'Quarterly launch review',
    body: 'Summarize campaign lift, product adoption, and open follow-up work in a compact sequence.',
  },
  {
    id: '02',
    title: 'Feature spotlight',
    body: 'Reveal one initiative at a time while still peeking the next card on larger layouts.',
  },
  {
    id: '03',
    title: 'Customer proof',
    body: 'Rotate short testimonials with tactile controls that work equally well on touch and keyboard.',
  },
];

const PauseControl = () => {
  const { isPaused, togglePause } = useCarousel();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={isPaused ? Play : Pause}
      onClick={togglePause}
      className={storyStyles.pauseButton ?? ''}
    >
      {isPaused ? 'Resume autoplay' : 'Pause autoplay'}
    </Button>
  );
};

const CarouselSlides = () => (
  <>
    {slideContent.map((slide) => (
      <CarouselSlide key={slide.id}>
        <article className={storyStyles.slideCard}>
          <p className={storyStyles.eyebrow}>Panel {slide.id}</p>
          <h3 className={storyStyles.title}>{slide.title}</h3>
          <p className={storyStyles.body}>{slide.body}</p>
        </article>
      </CarouselSlide>
    ))}
  </>
);

const meta: Meta<typeof Carousel> = {
  title: 'Core Components/Carousel',
  component: Carousel,
  subcomponents: {
    CarouselSlide,
    CarouselPrevButton,
    CarouselNextButton,
    CarouselDots,
  },
  tags: ['autodocs'],
  args: {
    gap: 'md',
    loop: false,
    slidesPerView: 1,
  },
  argTypes: {
    children: {
      control: false,
    },
  },
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
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Carousel aria-label="Feature highlights" {...args}>
        <CarouselContent>
          <CarouselSlides />
        </CarouselContent>
        <div className={storyStyles.controlsRow}>
          <div className={storyStyles.controlsCluster}>
            <CarouselPrevButton />
            <CarouselNextButton />
          </div>
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Carousel aria-label="Feature highlights">',
      '  <CarouselContent>',
      '    <CarouselSlide>',
      '      <article>{/* slide content */}</article>',
      '    </CarouselSlide>',
      '    <CarouselSlide>',
      '      <article>{/* slide content */}</article>',
      '    </CarouselSlide>',
      '    <CarouselSlide>',
      '      <article>{/* slide content */}</article>',
      '    </CarouselSlide>',
      '  </CarouselContent>',
      '  <div className={styles.controlsRow}>',
      '    <div className={styles.controlsCluster}>',
      '      <CarouselPrevButton />',
      '      <CarouselNextButton />',
      '    </div>',
      '    <CarouselDots />',
      '  </div>',
      '</Carousel>'
    )
  ),
};

export const PeekNextSlide: Story = {
  args: {
    slidesPerView: 1.2,
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Carousel aria-label="Feature highlights with peek" {...args}>
        <CarouselContent>
          <CarouselSlides />
        </CarouselContent>
        <div className={storyStyles.controlsRow}>
          <div className={storyStyles.controlsCluster}>
            <CarouselPrevButton />
            <CarouselNextButton />
          </div>
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Carousel aria-label="Feature highlights with peek" slidesPerView={1.2}>',
          '  <CarouselContent>',
          '    <CarouselSlide>{/* slide content */}</CarouselSlide>',
          '    <CarouselSlide>{/* slide content */}</CarouselSlide>',
          '    <CarouselSlide>{/* slide content */}</CarouselSlide>',
          '  </CarouselContent>',
          '  <div className={styles.controlsRow}>',
          '    <div className={styles.controlsCluster}>',
          '      <CarouselPrevButton />',
          '      <CarouselNextButton />',
          '    </div>',
          '    <CarouselDots />',
          '  </div>',
          '</Carousel>'
        )
      ),
    },
  },
};

export const Autoplay: Story = {
  args: {
    autoplay: true,
    loop: true,
  },
  render: (args) => (
    <div className={storyStyles.storyA11yScope}>
      <Carousel aria-label="Autoplay highlights" {...args}>
        <CarouselContent>
          <CarouselSlides />
        </CarouselContent>
        <PauseControl />
        <div className={storyStyles.controlsRow}>
          <div className={storyStyles.controlsCluster}>
            <CarouselPrevButton />
            <CarouselNextButton />
          </div>
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      source: storySourceBlock(
        storySource(
          '<Carousel aria-label="Autoplay highlights" autoplay loop>',
          '  <CarouselContent>',
          '    <CarouselSlide>{/* slide content */}</CarouselSlide>',
          '    <CarouselSlide>{/* slide content */}</CarouselSlide>',
          '    <CarouselSlide>{/* slide content */}</CarouselSlide>',
          '  </CarouselContent>',
          '  <PauseControl />',
          '  <div className={styles.controlsRow}>',
          '    <div className={styles.controlsCluster}>',
          '      <CarouselPrevButton />',
          '      <CarouselNextButton />',
          '    </div>',
          '    <CarouselDots />',
          '  </div>',
          '</Carousel>'
        )
      ),
    },
  },
};
