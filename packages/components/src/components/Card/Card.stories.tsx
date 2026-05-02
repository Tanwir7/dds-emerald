import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from './Card';
import storyStyles from './Card.stories.module.scss';
import { storySource, storySourceFragment, storySourceParameters } from '../../utils/storySource';

const componentDescription = `Card is a flexible surface container for grouped content, actions, and media.

### Accessibility contract

- Keyboard: clickable cards rely on native anchor and button semantics; selectable cards expose a real checkbox that is focused with Tab and toggled with Space.
- Screen readers: consumers must provide meaningful visible text or accessible names for clickable cards, and selectable cards require a descriptive \`selectLabel\`.
- Focus: clickable cards use the standard DDS outline focus ring, and selectable cards surface the checkbox focus ring onto the visible card container.
- Designers: choose visual variants based on emphasis, keep footer actions concise, and provide meaningful image alt text when using \`CardMedia\`.
- QA: verify anchor vs button semantics, disabled states, checkbox naming, selected state feedback, and axe coverage across each interaction mode.`;

const placeholderImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="Dashboard preview">
      <rect width="640" height="360" fill="#0f2d23" />
      <rect x="36" y="36" width="568" height="288" fill="#164c3b" />
      <rect x="72" y="80" width="160" height="24" fill="#b9d7ce" />
      <rect x="72" y="124" width="496" height="16" fill="#dbe7e2" />
      <rect x="72" y="156" width="420" height="16" fill="#dbe7e2" />
      <rect x="72" y="214" width="128" height="56" fill="#5fb490" />
      <rect x="220" y="214" width="128" height="56" fill="#76b9df" />
      <rect x="368" y="214" width="128" height="56" fill="#d6c56f" />
    </svg>
  `);

const storyCardClassName = storyStyles.storyCard ?? '';
const storyMediaImageClassName = storyStyles.storyMediaImage ?? '';
const storyPlanPriceClassName = storyStyles.storyPlanPrice ?? '';

const cardSource = storySource(
  '<Card variant="outlined">',
  '  <CardMedia>',
  '    <img alt="Dashboard preview" src="..." />',
  '  </CardMedia>',
  '  <CardHeader>',
  '    <CardTitle>Quarterly Revenue</CardTitle>',
  '    <CardDescription>Q2 summary for the enterprise portfolio.</CardDescription>',
  '  </CardHeader>',
  '  <CardBody>Steady growth across product lines.</CardBody>',
  '  <CardFooter>',
  '    <Button variant="secondary">View report</Button>',
  '    <Button>Share</Button>',
  '  </CardFooter>',
  '</Card>'
);

const CardPreview = ({
  variant = 'outlined',
  mediaPosition = 'top',
  mediaAspectRatio = '16/9',
  footerAlign = 'start',
  selectable = false,
  selected = false,
  disabled = false,
  padding = 'none',
}: {
  variant?: React.ComponentProps<typeof Card>['variant'];
  mediaPosition?: React.ComponentProps<typeof CardMedia>['position'];
  mediaAspectRatio?: React.ComponentProps<typeof CardMedia>['aspectRatio'];
  footerAlign?: React.ComponentProps<typeof CardFooter>['align'];
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  padding?: React.ComponentProps<typeof Card>['padding'];
}) => {
  const cardContent = (
    <>
      <CardMedia aspectRatio={mediaAspectRatio} position={mediaPosition}>
        <img alt="Dashboard preview" className={storyMediaImageClassName} src={placeholderImage} />
      </CardMedia>
      <CardHeader>
        <CardTitle>Quarterly Revenue</CardTitle>
        <CardDescription>Q2 summary for the enterprise portfolio.</CardDescription>
      </CardHeader>
      <CardBody>
        Monthly recurring revenue increased 18% while expansion revenue remained stable across
        enterprise accounts.
      </CardBody>
      <CardFooter align={footerAlign}>
        <Button variant="secondary">View report</Button>
        <Button>Share</Button>
      </CardFooter>
    </>
  );

  if (selectable) {
    return (
      <Card
        className={storyCardClassName}
        variant={variant}
        selected={selected}
        disabled={disabled}
        selectLabel="Select quarterly revenue panel"
        onSelectedChange={fn()}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className={storyCardClassName} variant={variant} padding={padding}>
      {padding === 'none' ? cardContent : 'Condensed summary content with direct card padding.'}
    </Card>
  );
};

const plans = [
  {
    id: 'starter',
    title: 'Starter',
    description: 'Shared access for small internal teams.',
    price: '$29',
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'Operational dashboards and workflow automations.',
    price: '$79',
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Advanced governance, support, and custom rollout plans.',
    price: '$149',
  },
] as const;

const SelectableStoryCards = () => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>(['pro']);

  return (
    <div className={storyStyles.storyRow}>
      {plans.map((plan) => {
        const isSelected = selectedIds.includes(plan.id);

        return (
          <Card
            key={plan.id}
            className={storyCardClassName}
            selected={isSelected}
            selectLabel={`Select ${plan.title} plan`}
            onSelectedChange={(nextSelected) => {
              setSelectedIds((current) =>
                nextSelected
                  ? [...current, plan.id]
                  : current.filter((currentId) => currentId !== plan.id)
              );
            }}
          >
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardBody>
              <span className={storyPlanPriceClassName}>{plan.price}</span> per seat each month
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

const meta: Meta<typeof Card> = {
  title: 'Core Components/Card',
  component: Card,
  tags: ['autodocs'],
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

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Card className={storyCardClassName}>
        <CardMedia>
          <img
            alt="Dashboard preview"
            className={storyMediaImageClassName}
            src={placeholderImage}
          />
        </CardMedia>
        <CardHeader>
          <CardTitle>Quarterly Revenue</CardTitle>
          <CardDescription>Q2 summary for the enterprise portfolio.</CardDescription>
        </CardHeader>
        <CardBody>Steady growth across product lines.</CardBody>
        <CardFooter>
          <Button variant="secondary">View report</Button>
          <Button>Share</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: storySourceParameters(cardSource),
};

export const Variants: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        {(['outlined', 'elevated', 'filled', 'ghost'] as const).map((variant) => (
          <CardPreview key={variant} variant={variant} />
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      ...(['outlined', 'elevated', 'filled', 'ghost'] as const).map((variant) =>
        storySource(`<Card variant="${variant}">`, '  ...', '</Card>')
      )
    )
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Card as="a" href="#quarterly-revenue" className={storyCardClassName}>
          <CardHeader>
            <CardTitle>Open revenue report</CardTitle>
            <CardDescription>Anchor variant for navigation to the report page.</CardDescription>
          </CardHeader>
          <CardBody>Use Tab to focus the card and Enter to follow the link.</CardBody>
        </Card>
        <Card as="button" onClick={fn()} className={storyCardClassName}>
          <CardHeader>
            <CardTitle>Open detail drawer</CardTitle>
            <CardDescription>Button variant for in-place application actions.</CardDescription>
          </CardHeader>
          <CardBody>Use Tab to focus the card and Enter or Space to trigger the action.</CardBody>
        </Card>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      storySource(
        '<Card as="a" href="#quarterly-revenue">',
        '  <CardHeader>',
        '    <CardTitle>Open revenue report</CardTitle>',
        '  </CardHeader>',
        '</Card>'
      ),
      storySource(
        '<Card as="button" onClick={action("open-detail-drawer")}>',
        '  <CardHeader>',
        '    <CardTitle>Open detail drawer</CardTitle>',
        '  </CardHeader>',
        '</Card>'
      )
    )
  ),
};

export const Selectable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <SelectableStoryCards />
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      'const [selectedIds, setSelectedIds] = React.useState<string[]>(["pro"]);',
      '',
      '<>',
      '  {plans.map((plan) => (',
      '    <Card',
      '      key={plan.id}',
      '      selected={selectedIds.includes(plan.id)}',
      '      selectLabel={`Select ${plan.title} plan`}',
      '      onSelectedChange={(nextSelected) => {',
      '        setSelectedIds((current) =>',
      '          nextSelected ? [...current, plan.id] : current.filter((id) => id !== plan.id)',
      '        );',
      '      }}',
      '    >',
      '      ...',
      '    </Card>',
      '  ))}',
      '</>'
    )
  ),
};

export const SelectableInteraction: Story = {
  ...Selectable,
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getAllByRole('checkbox')[0];

    if (!checkbox) {
      throw new Error('Expected at least one checkbox in the Selectable story.');
    }

    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const KeyboardSelectTab: Story = {
  ...Selectable,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const checkbox = within(canvasElement).getAllByRole('checkbox')[0];

    if (!checkbox) {
      throw new Error('Expected at least one checkbox in the Selectable story.');
    }

    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
  },
};

export const WithMedia: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <CardPreview />
        <CardPreview mediaPosition="bottom" />
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      storySource(
        '<Card>',
        '  <CardMedia position="top">',
        '    <img alt="Dashboard preview" src="..." />',
        '  </CardMedia>',
        '  ...',
        '</Card>'
      ),
      storySource(
        '<Card>',
        '  ...',
        '  <CardMedia position="bottom">',
        '    <img alt="Dashboard preview" src="..." />',
        '  </CardMedia>',
        '</Card>'
      )
    )
  ),
};

export const MediaAspectRatios: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        {(['16/9', '4/3', '1/1', '3/2'] as const).map((aspectRatio) => (
          <Card key={aspectRatio} className={storyCardClassName}>
            <CardMedia aspectRatio={aspectRatio}>
              <img
                alt={`Dashboard preview in ${aspectRatio} ratio`}
                className={storyMediaImageClassName}
                src={placeholderImage}
              />
            </CardMedia>
            <CardHeader>
              <CardTitle>{aspectRatio}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      ...(['16/9', '4/3', '1/1', '3/2'] as const).map((aspectRatio) =>
        storySource(
          '<Card>',
          `  <CardMedia aspectRatio="${aspectRatio}">`,
          '    <img alt="Dashboard preview" src="..." />',
          '  </CardMedia>',
          '</Card>'
        )
      )
    )
  ),
};

export const NoMedia: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Card className={storyCardClassName}>
        <CardHeader>
          <CardTitle>Security Policy</CardTitle>
          <CardDescription>Approval workflow for elevated access requests.</CardDescription>
        </CardHeader>
        <CardBody>
          Two pending policy updates require review before the next deployment window.
        </CardBody>
        <CardFooter>
          <Button variant="secondary">Review</Button>
          <Button>Approve</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Card>',
      '  <CardHeader>',
      '    <CardTitle>Security Policy</CardTitle>',
      '    <CardDescription>Approval workflow for elevated access requests.</CardDescription>',
      '  </CardHeader>',
      '  <CardBody>Two pending policy updates require review before the next deployment window.</CardBody>',
      '  <CardFooter>',
      '    <Button variant="secondary">Review</Button>',
      '    <Button>Approve</Button>',
      '  </CardFooter>',
      '</Card>'
    )
  ),
};

export const FooterAlignments: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyGrid}>
        {(['start', 'center', 'end', 'between'] as const).map((align) => (
          <Card key={align} className={storyCardClassName}>
            <CardHeader>
              <CardTitle>{align}</CardTitle>
            </CardHeader>
            <CardFooter align={align}>
              <Button variant="secondary">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      ...(['start', 'center', 'end', 'between'] as const).map((align) =>
        storySource(
          '<Card>',
          `  <CardFooter align="${align}">`,
          '    ...',
          '  </CardFooter>',
          '</Card>'
        )
      )
    )
  ),
};

export const DisabledClickable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <div className={storyStyles.storyRow}>
        <Card as="a" href="#quarterly-revenue" disabled className={storyCardClassName}>
          <CardHeader>
            <CardTitle>Disabled report link</CardTitle>
          </CardHeader>
          <CardBody>The anchor removes href and exposes aria-disabled.</CardBody>
        </Card>
        <Card as="button" onClick={fn()} disabled className={storyCardClassName}>
          <CardHeader>
            <CardTitle>Disabled drawer action</CardTitle>
          </CardHeader>
          <CardBody>The button relies on the native disabled attribute.</CardBody>
        </Card>
      </div>
    </div>
  ),
  parameters: storySourceParameters(
    storySourceFragment(
      storySource('<Card as="a" href="#quarterly-revenue" disabled>', '  ...', '</Card>'),
      storySource(
        '<Card as="button" onClick={action("open-detail-drawer")} disabled>',
        '  ...',
        '</Card>'
      )
    )
  ),
};

export const DisabledSelectable: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Card
        className={storyCardClassName}
        selected
        disabled
        selectLabel="Select enterprise plan"
        onSelectedChange={fn()}
      >
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>Provisioned after security review.</CardDescription>
        </CardHeader>
        <CardBody>The checkbox is disabled and the card remains visibly selected.</CardBody>
      </Card>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Card selected disabled selectLabel="Select enterprise plan" onSelectedChange={() => {}}>',
      '  ...',
      '</Card>'
    )
  ),
};

export const CompactWithPadding: Story = {
  render: () => (
    <div className={storyStyles.storyA11yScope}>
      <Card padding="md" className={storyCardClassName}>
        Compact summary content with direct card padding instead of the named layout sub-components.
      </Card>
    </div>
  ),
  parameters: storySourceParameters(
    storySource(
      '<Card padding="md">',
      '  Compact summary content with direct card padding instead of the named layout sub-components.',
      '</Card>'
    )
  ),
};
