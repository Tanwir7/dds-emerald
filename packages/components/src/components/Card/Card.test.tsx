import { readFileSync } from 'node:fs';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import styles from './Card.module.scss';
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from './Card';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const classNames = {
  card: getRequiredClassName(styles, 'card'),
  variantOutlined: getRequiredClassName(styles, 'variantOutlined'),
  variantElevated: getRequiredClassName(styles, 'variantElevated'),
  variantFilled: getRequiredClassName(styles, 'variantFilled'),
  variantGhost: getRequiredClassName(styles, 'variantGhost'),
  paddingSm: getRequiredClassName(styles, 'paddingSm'),
  paddingMd: getRequiredClassName(styles, 'paddingMd'),
  paddingLg: getRequiredClassName(styles, 'paddingLg'),
  clickable: getRequiredClassName(styles, 'clickable'),
  selectable: getRequiredClassName(styles, 'selectable'),
  selectableCheckbox: getRequiredClassName(styles, 'selectableCheckbox'),
  selectableLabel: getRequiredClassName(styles, 'selectableLabel'),
  selected: getRequiredClassName(styles, 'selected'),
  selectedIndicator: getRequiredClassName(styles, 'selectedIndicator'),
  disabled: getRequiredClassName(styles, 'disabled'),
  header: getRequiredClassName(styles, 'header'),
  body: getRequiredClassName(styles, 'body'),
  footer: getRequiredClassName(styles, 'footer'),
  footerAlignEnd: getRequiredClassName(styles, 'footerAlignEnd'),
  footerAlignBetween: getRequiredClassName(styles, 'footerAlignBetween'),
  media: getRequiredClassName(styles, 'media'),
  media16By9: getRequiredClassName(styles, 'media16By9'),
  media1By1: getRequiredClassName(styles, 'media1By1'),
  mediaTop: getRequiredClassName(styles, 'mediaTop'),
  mediaBottom: getRequiredClassName(styles, 'mediaBottom'),
  title: getRequiredClassName(styles, 'title'),
  description: getRequiredClassName(styles, 'description'),
} as const;

const getRootCard = (container: HTMLElement) => {
  const root = container.firstElementChild;

  expect(root).toBeInstanceOf(HTMLElement);
  return root as HTMLElement;
};

const renderComposedCard = (props?: Partial<React.ComponentProps<typeof Card>>) =>
  render(
    <Card {...props}>
      <CardMedia>
        <img alt="Demo cover" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </CardMedia>
      <CardHeader>
        <CardTitle>Quarterly Revenue</CardTitle>
        <CardDescription>Q2 summary for the enterprise portfolio.</CardDescription>
      </CardHeader>
      <CardBody>Steady growth across product lines.</CardBody>
      <CardFooter>
        <button type="button">Primary</button>
        <button type="button">Secondary</button>
      </CardFooter>
    </Card>
  );

describe('Card', () => {
  it('renders children inside a div by default', () => {
    const { container } = render(<Card>content</Card>);

    expect(getRootCard(container).tagName).toBe('DIV');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('applies variantOutlined class by default', () => {
    const { container } = render(<Card>content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.card, classNames.variantOutlined);
  });

  it('applies variantElevated class when variant="elevated"', () => {
    const { container } = render(<Card variant="elevated">content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.variantElevated);
  });

  it('applies variantFilled class when variant="filled"', () => {
    const { container } = render(<Card variant="filled">content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.variantFilled);
  });

  it('applies variantGhost class when variant="ghost"', () => {
    const { container } = render(<Card variant="ghost">content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.variantGhost);
  });

  it('applies paddingSm class when padding="sm"', () => {
    const { container } = render(<Card padding="sm">content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.paddingSm);
  });

  it('applies paddingMd class when padding="md"', () => {
    const { container } = render(<Card padding="md">content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.paddingMd);
  });

  it('applies paddingLg class when padding="lg"', () => {
    const { container } = render(<Card padding="lg">content</Card>);

    expect(getRootCard(container)).toHaveClass(classNames.paddingLg);
  });

  it('forwards ref to root element', () => {
    const ref = React.createRef<HTMLElement>();
    const { container } = render(<Card ref={ref}>content</Card>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(getRootCard(container));
  });

  it('forwards className to root', () => {
    const { container } = render(<Card className="custom-card">content</Card>);

    expect(getRootCard(container)).toHaveClass('custom-card');
  });

  it('renders CardHeader children', () => {
    const { container } = render(<CardHeader>Header content</CardHeader>);

    expect(screen.getByText('Header content')).toHaveClass(classNames.header);
    expect(container.firstElementChild).toBe(screen.getByText('Header content'));
  });

  it('renders CardBody children', () => {
    render(<CardBody>Body content</CardBody>);

    expect(screen.getByText('Body content')).toHaveClass(classNames.body);
  });

  it('renders CardFooter children', () => {
    render(<CardFooter>Footer content</CardFooter>);

    expect(screen.getByText('Footer content')).toHaveClass(classNames.footer);
  });

  it('CardFooter applies footerAlignEnd when align="end"', () => {
    render(<CardFooter align="end">Footer content</CardFooter>);

    expect(screen.getByText('Footer content')).toHaveClass(classNames.footerAlignEnd);
  });

  it('CardFooter applies footerAlignBetween when align="between"', () => {
    render(<CardFooter align="between">Footer content</CardFooter>);

    expect(screen.getByText('Footer content')).toHaveClass(classNames.footerAlignBetween);
  });

  it('CardMedia renders children inside the media wrapper', () => {
    render(
      <CardMedia>
        <img alt="Example media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </CardMedia>
    );

    expect(screen.getByAltText('Example media').parentElement).toHaveClass(classNames.media);
  });

  it('CardMedia applies media16By9 class by default', () => {
    render(
      <CardMedia>
        <img alt="Example media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </CardMedia>
    );

    expect(screen.getByAltText('Example media').parentElement).toHaveClass(classNames.media16By9);
  });

  it('CardMedia applies media1By1 class when aspectRatio="1/1"', () => {
    render(
      <CardMedia aspectRatio="1/1">
        <img alt="Example media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </CardMedia>
    );

    expect(screen.getByAltText('Example media').parentElement).toHaveClass(classNames.media1By1);
  });

  it('CardMedia applies mediaTop class by default', () => {
    render(
      <CardMedia>
        <img alt="Example media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </CardMedia>
    );

    expect(screen.getByAltText('Example media').parentElement).toHaveClass(classNames.mediaTop);
  });

  it('CardMedia applies mediaBottom class when position="bottom"', () => {
    render(
      <CardMedia position="bottom">
        <img alt="Example media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      </CardMedia>
    );

    expect(screen.getByAltText('Example media').parentElement).toHaveClass(classNames.mediaBottom);
  });

  it('CardTitle renders as h3 by default', () => {
    render(<CardTitle>Heading content</CardTitle>);

    expect(screen.getByRole('heading', { level: 3, name: 'Heading content' })).toHaveClass(
      classNames.title
    );
  });

  it('CardTitle renders as h2 when as="h2"', () => {
    render(<CardTitle as="h2">Heading content</CardTitle>);

    expect(screen.getByRole('heading', { level: 2, name: 'Heading content' })).toBeInTheDocument();
  });

  it('CardDescription renders as a paragraph', () => {
    render(<CardDescription>Description content</CardDescription>);

    expect(screen.getByText('Description content').tagName).toBe('P');
    expect(screen.getByText('Description content')).toHaveClass(classNames.description);
  });

  it('renders as an anchor when as="a"', () => {
    render(
      <Card as="a" href="#billing">
        Account billing
      </Card>
    );

    expect(screen.getByRole('link', { name: 'Account billing' })).toHaveAttribute(
      'href',
      '#billing'
    );
  });

  it('calls onClick for a clickable anchor', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card as="a" href="#billing" onClick={onClick}>
        Account billing
      </Card>
    );

    await user.click(screen.getByRole('link', { name: 'Account billing' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies clickable class to an anchor card', () => {
    render(
      <Card as="a" href="#billing">
        Account billing
      </Card>
    );

    expect(screen.getByRole('link', { name: 'Account billing' })).toHaveClass(classNames.clickable);
  });

  it('anchor card is keyboard focusable and responds to Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card as="a" href="#billing" onClick={onClick}>
        Account billing
      </Card>
    );

    await user.tab();
    const link = screen.getByRole('link', { name: 'Account billing' });
    expect(link).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled anchor has aria-disabled="true" and no href', () => {
    render(
      <Card as="a" href="#billing" disabled>
        Account billing
      </Card>
    );

    const anchor = screen.getByText('Account billing');
    expect(anchor.tagName).toBe('A');
    expect(anchor).toHaveAttribute('aria-disabled', 'true');
    expect(anchor).not.toHaveAttribute('href');
  });

  it('disabled anchor does not call onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card as="a" href="#billing" disabled onClick={onClick}>
        Account billing
      </Card>
    );

    await user.click(screen.getByText('Account billing'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as a button when as="button"', () => {
    render(
      <Card as="button" onClick={() => undefined}>
        Open details
      </Card>
    );

    const button = screen.getByRole('button', { name: 'Open details' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('calls onClick for a clickable button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card as="button" onClick={onClick}>
        Open details
      </Card>
    );

    await user.click(screen.getByRole('button', { name: 'Open details' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies clickable class to a button card', () => {
    render(
      <Card as="button" onClick={() => undefined}>
        Open details
      </Card>
    );

    expect(screen.getByRole('button', { name: 'Open details' })).toHaveClass(classNames.clickable);
  });

  it('button card is keyboard focusable and responds to Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card as="button" onClick={onClick}>
        Open details
      </Card>
    );

    await user.tab();
    const button = screen.getByRole('button', { name: 'Open details' });
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('disabled button has the native disabled attribute', () => {
    render(
      <Card as="button" onClick={() => undefined} disabled>
        Open details
      </Card>
    );

    expect(screen.getByRole('button', { name: 'Open details' })).toBeDisabled();
  });

  it('disabled button does not call onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Card as="button" onClick={onClick} disabled>
        Open details
      </Card>
    );

    await user.click(screen.getByRole('button', { name: 'Open details' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a hidden checkbox input for selectable cards', () => {
    const { container } = render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Select starter plan' });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass(classNames.selectableCheckbox);
    expect(getRootCard(container)).toHaveClass(classNames.selectable);
    expect(container.querySelector(`.${classNames.selectableLabel}`)).toBeInTheDocument();
  });

  it('checkbox has an accessible name from selectLabel', () => {
    render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(screen.getByRole('checkbox', { name: 'Select starter plan' })).toBeInTheDocument();
  });

  it('checkbox is checked when selected={true}', () => {
    render(
      <Card selected onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(screen.getByRole('checkbox', { name: 'Select starter plan' })).toBeChecked();
  });

  it('checkbox is unchecked when selected={false}', () => {
    render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(screen.getByRole('checkbox', { name: 'Select starter plan' })).not.toBeChecked();
  });

  it('calls onSelectedChange(true) when an unchecked checkbox is selected', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();

    render(
      <Card selected={false} onSelectedChange={onSelectedChange} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select starter plan' }));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('calls onSelectedChange(false) when a checked checkbox is cleared', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();

    render(
      <Card selected onSelectedChange={onSelectedChange} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select starter plan' }));

    expect(onSelectedChange).toHaveBeenCalledWith(false);
  });

  it('toggles selection when the visible card surface is clicked', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();

    render(
      <Card selected={false} onSelectedChange={onSelectedChange} selectLabel="Select starter plan">
        <CardHeader>
          <CardTitle>Starter plan</CardTitle>
        </CardHeader>
      </Card>
    );

    await user.click(screen.getByText('Starter plan'));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('renders the selectedIndicator when selected={true}', () => {
    const { container } = render(
      <Card selected onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(container.querySelector(`.${classNames.selectedIndicator}`)).toBeInTheDocument();
  });

  it('selectedIndicator is aria-hidden="true"', () => {
    const { container } = render(
      <Card selected onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(container.querySelector(`.${classNames.selectedIndicator}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('does not render the selectedIndicator when selected={false}', () => {
    const { container } = render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(container.querySelector(`.${classNames.selectedIndicator}`)).not.toBeInTheDocument();
  });

  it('applies selected class when selected={true}', () => {
    const { container } = render(
      <Card selected onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(getRootCard(container)).toHaveClass(classNames.selected);
  });

  it('disabled selectable card has a disabled checkbox', () => {
    render(
      <Card
        selected={false}
        onSelectedChange={() => undefined}
        selectLabel="Select starter plan"
        disabled
      >
        Starter plan
      </Card>
    );

    expect(screen.getByRole('checkbox', { name: 'Select starter plan' })).toBeDisabled();
  });

  it('disabled selectable card applies the disabled class', () => {
    const { container } = render(
      <Card
        selected={false}
        onSelectedChange={() => undefined}
        selectLabel="Select starter plan"
        disabled
      >
        Starter plan
      </Card>
    );

    expect(getRootCard(container)).toHaveClass(classNames.disabled);
  });

  it('clickable anchor receives focus on Tab', async () => {
    const user = userEvent.setup();

    render(
      <Card as="a" href="#billing">
        Account billing
      </Card>
    );

    await user.tab();

    expect(screen.getByRole('link', { name: 'Account billing' })).toHaveFocus();
  });

  it('clickable button receives focus on Tab', async () => {
    const user = userEvent.setup();

    render(
      <Card as="button" onClick={() => undefined}>
        Open details
      </Card>
    );

    await user.tab();

    expect(screen.getByRole('button', { name: 'Open details' })).toHaveFocus();
  });

  it("selectable card's checkbox receives focus on Tab", async () => {
    const user = userEvent.setup();

    render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    await user.tab();

    expect(screen.getByRole('checkbox', { name: 'Select starter plan' })).toHaveFocus();
  });

  it('static card has no explicit role attribute', () => {
    const { container } = render(<Card>content</Card>);

    expect(getRootCard(container)).not.toHaveAttribute('role');
  });

  it('clickable anchor has the implicit link role', () => {
    render(
      <Card as="a" href="#billing">
        Account billing
      </Card>
    );

    expect(screen.getByRole('link', { name: 'Account billing' })).toBeInTheDocument();
  });

  it('clickable button has the implicit button role', () => {
    render(
      <Card as="button" onClick={() => undefined}>
        Open details
      </Card>
    );

    expect(screen.getByRole('button', { name: 'Open details' })).toBeInTheDocument();
  });

  it('selectable checkbox has role="checkbox"', () => {
    render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    expect(screen.getByRole('checkbox', { name: 'Select starter plan' })).toBeInTheDocument();
  });

  it('includes the :has() focus-ring selector for selectable cards', () => {
    const source = readFileSync('src/components/Card/Card.module.scss', 'utf8');

    expect(source).toMatch(/:has\(\.selectableCheckbox:focus-visible\)/);
  });

  it('axe passes for a static outlined card', async () => {
    const { container } = renderComposedCard();

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for a static elevated card', async () => {
    const { container } = renderComposedCard({ variant: 'elevated' });

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for a static filled card', async () => {
    const { container } = renderComposedCard({ variant: 'filled' });

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for a static ghost card', async () => {
    const { container } = renderComposedCard({ variant: 'ghost' });

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for a clickable anchor card', async () => {
    const { container } = render(
      <Card as="a" href="#billing">
        <CardHeader>
          <CardTitle>Account billing</CardTitle>
        </CardHeader>
      </Card>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for a clickable button card', async () => {
    const { container } = render(
      <Card as="button" onClick={() => undefined} aria-label="Open account billing">
        <CardHeader>
          <CardTitle>Account billing</CardTitle>
        </CardHeader>
      </Card>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for an unchecked selectable card', async () => {
    const { container } = render(
      <Card selected={false} onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it('axe passes for a checked selectable card', async () => {
    const { container } = render(
      <Card selected onSelectedChange={() => undefined} selectLabel="Select starter plan">
        Starter plan
      </Card>
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
