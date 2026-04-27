import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '../Text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps,
} from './Accordion';
import { storySource, storySourceParameters } from '../../utils/storySource';
import storyStyles from './Accordion.stories.module.scss';

const meta: Meta<typeof Accordion> = {
  title: 'Core Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      context: '.' + storyStyles.storyA11yScope,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

const accordionItems = (
  <>
    <AccordionItem value="overview">
      <AccordionTrigger>Overview</AccordionTrigger>
      <AccordionContent>
        Emerald ships semantic tokens and zero-radius components for consistent product UI.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="usage">
      <AccordionTrigger>Usage guidelines</AccordionTrigger>
      <AccordionContent>
        Use accordions for grouped secondary content, not for primary page navigation.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="support">
      <AccordionTrigger>Support policy</AccordionTrigger>
      <AccordionContent>
        Consumers should keep trigger labels concise and ensure each panel contains structured
        follow-up content.
      </AccordionContent>
    </AccordionItem>
  </>
);

const renderAccordion = (args: AccordionProps) => (
  <div className={storyStyles.storyA11yScope}>
    <Accordion {...args}>{accordionItems}</Accordion>
  </div>
);

export const Default: Story = {
  render: renderAccordion,
  args: {
    defaultValue: 'overview',
  },
  parameters: storySourceParameters(
    storySource(
      '<Accordion defaultValue="overview">',
      '  <AccordionItem value="overview">',
      '    <AccordionTrigger>Overview</AccordionTrigger>',
      '    <AccordionContent>',
      '      Emerald ships semantic tokens and zero-radius components for consistent product UI.',
      '    </AccordionContent>',
      '  </AccordionItem>',
      '  <AccordionItem value="usage">',
      '    <AccordionTrigger>Usage guidelines</AccordionTrigger>',
      '    <AccordionContent>',
      '      Use accordions for grouped secondary content, not for primary page navigation.',
      '    </AccordionContent>',
      '  </AccordionItem>',
      '</Accordion>'
    )
  ),
};

export const Flush: Story = {
  render: renderAccordion,
  args: {
    variant: 'flush',
    defaultValue: 'overview',
  },
  parameters: storySourceParameters(
    storySource(
      '<Accordion variant="flush" defaultValue="overview">',
      '  <AccordionItem value="overview">',
      '    <AccordionTrigger>Overview</AccordionTrigger>',
      '    <AccordionContent>...</AccordionContent>',
      '  </AccordionItem>',
      '</Accordion>'
    )
  ),
};

export const Multiple: Story = {
  render: renderAccordion,
  args: {
    type: 'multiple',
    defaultValue: ['overview', 'usage'],
  },
  parameters: storySourceParameters(
    storySource(
      '<Accordion type="multiple" defaultValue={["overview", "usage"]}>',
      '  <AccordionItem value="overview">',
      '    <AccordionTrigger>Overview</AccordionTrigger>',
      '    <AccordionContent>...</AccordionContent>',
      '  </AccordionItem>',
      '</Accordion>'
    )
  ),
};

export const InCard: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyCard}>
        <Text size="sm">
          Configure secondary settings inline without introducing a separate page or modal.
        </Text>
        <Accordion variant="flush" defaultValue="usage">
          {accordionItems}
        </Accordion>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<div className={cardStyles.card}>',
      '  <Accordion variant="flush" defaultValue="usage">',
      '    <AccordionItem value="usage">',
      '      <AccordionTrigger>Usage guidelines</AccordionTrigger>',
      '      <AccordionContent>...</AccordionContent>',
      '    </AccordionItem>',
      '  </Accordion>',
      '</div>'
    )
  ),
};
