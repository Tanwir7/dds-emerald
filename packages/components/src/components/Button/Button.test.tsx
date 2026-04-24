import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ArrowRight, Plus } from 'lucide-react';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const;

const sizes = ['sm', 'default', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const;

const render = (ui: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const getButtonByText = (text: string) => {
  const button = Array.from(document.querySelectorAll('button')).find(
    (element) => element.textContent === text
  );

  expect(button).toBeTruthy();
  return button as HTMLButtonElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Button', () => {
  it('renders all 5 variants', () => {
    render(
      <div>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
    );

    variants.forEach((variant) => {
      expect(getButtonByText(variant)).toBeInTheDocument();
    });
  });

  it('renders all 6 sizes', () => {
    render(
      <div>
        {sizes.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </div>
    );

    sizes.forEach((size) => {
      expect(getButtonByText(size)).toBeInTheDocument();
    });
  });

  it('forwards className', () => {
    render(<Button className="custom">content</Button>);
    expect(getButtonByText('content')).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>content</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has correct role="button"', () => {
    render(<Button>content</Button>);
    expect(getButtonByText('content')).toHaveAttribute('type', 'button');
  });

  it('disabled state blocks interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        content
      </Button>
    );

    await user.click(getButtonByText('content'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading state blocks click interaction while staying focusable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Saving...
      </Button>
    );

    const button = getButtonByText('Saving...');

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('loading state remains reachable by keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <a href="/">before</a>
        <Button loading>Saving...</Button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getButtonByText('Saving...')).toHaveFocus();
  });

  it('renders an indeterminate spinner in the start icon position while loading', () => {
    render(
      <Button loading icon={Plus}>
        Saving...
      </Button>
    );

    const button = getButtonByText('Saving...');
    const spinner = button.querySelector('svg[data-progress]');

    expect(spinner).toBeTruthy();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(button.firstElementChild?.className).toMatch(/icon/);
  });

  it('forwards click handlers when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>content</Button>);

    await user.click(getButtonByText('content'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows focus when clicked', async () => {
    const user = userEvent.setup();

    render(<Button>content</Button>);

    await user.click(getButtonByText('content'));

    expect(getButtonByText('content')).toHaveFocus();
  });

  it('focus-visible state renders on tab navigation', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <a href="/">before</a>
        <Button>content</Button>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getButtonByText('content')).toHaveFocus();
  });

  it('always renders a native button element', () => {
    render(<Button>content</Button>);

    expect(getButtonByText('content').tagName).toBe('BUTTON');
  });

  it('renders a decorative icon before the button text by default', () => {
    render(<Button icon={Plus}>Create</Button>);

    const button = getButtonByText('Create');
    const icon = button.querySelector('svg');

    expect(icon).toBeTruthy();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(button.firstElementChild?.tagName).toBe('SPAN');
  });

  it('renders button icons through the shared Icon wrapper', () => {
    render(<Button icon={Plus}>Create</Button>);

    const button = getButtonByText('Create');
    const iconWrapper = button.firstElementChild;
    const icon = iconWrapper?.querySelector('svg');

    expect(iconWrapper?.className).toMatch(/root/);
    expect(iconWrapper?.className).toMatch(/md/);
    expect(iconWrapper?.className).toMatch(/icon/);
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toBeTruthy();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the icon after the button text when iconPosition is end', () => {
    render(
      <Button icon={ArrowRight} iconPosition="end">
        Continue
      </Button>
    );

    const button = getButtonByText('Continue');

    expect(button.firstElementChild?.textContent).toBe('Continue');
    expect(button.lastElementChild?.tagName).toBe('SPAN');
    expect(button.lastElementChild?.querySelector('svg')).toBeTruthy();
  });

  it('supports icon-only buttons when given an accessible name', () => {
    render(<Button size="icon" icon={Plus} aria-label="Add item" />);

    const button = document.querySelector('button');

    expect(button).toHaveAccessibleName('Add item');
    expect(button?.querySelector('svg')).toBeTruthy();
  });

  it('requires an accessible name when there is no visible label', () => {
    expect(() =>
      renderToString(
        // @ts-expect-error Verifies the runtime guard for plain JS consumers.
        <Button size="icon" icon={Plus} />
      )
    ).toThrow('Button requires visible text, aria-label, or aria-labelledby');
  });

  it('applies full width styling when fullWidth is true', () => {
    render(<Button fullWidth>content</Button>);

    expect(getButtonByText('content').className).toMatch(/fullWidth/);
  });

  it('axe a11y passes for all variants', async () => {
    const { container } = render(
      <div>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe a11y passes for text and icon button combinations', async () => {
    const { container } = render(
      <div>
        <Button icon={Plus}>Create</Button>
        <Button size="icon" icon={ArrowRight} aria-label="Continue" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe a11y passes for loading buttons', async () => {
    const { container } = render(
      <div>
        <Button loading>Saving...</Button>
        <Button loading size="icon" aria-label="Saving" />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses semantic action foreground tokens for filled variants', () => {
    const stylesheet = readFileSync('src/components/Button/Button.module.scss', 'utf8');

    expect(stylesheet).toContain('color: var(--dds-color-action-primary-foreground);');
    expect(stylesheet).toContain('color: var(--dds-color-action-secondary-foreground);');
    expect(stylesheet).toContain('color: var(--dds-color-action-destructive-foreground);');
    expect(stylesheet).not.toContain('color: var(--dds-color-text-on-primary);');
    expect(stylesheet).toContain('@include icon-size(md);');
    expect(stylesheet).toContain('gap: var(--dds-space-2);');
    expect(stylesheet).toContain('@include interactive-focus-ring;');
    expect(stylesheet).toContain('animation: button-spinner-rotate');
    expect(stylesheet).toContain('stroke-dasharray: 33 44;');
    expect(stylesheet).not.toContain('.storyA11yScope');
    expect(readFileSync('src/components/Button/Button.stories.module.scss', 'utf8')).toContain(
      '.storyA11yScope'
    );
  });

  it('documents the component accessibility contract in Storybook', () => {
    const story = readFileSync('src/components/Button/Button.stories.tsx', 'utf8');

    expect(story).toContain('### Accessibility contract');
    expect(story).toContain('every button must have an accessible name');
    expect(story).toContain('Loading buttons remain focusable');
    expect(story).toContain('QA: verify keyboard activation');
  });

  it('uses an outline focus ring with offset instead of shadow or border-color focus cues', () => {
    const stylesheet = readFileSync('src/components/Button/Button.module.scss', 'utf8');
    const mixins = readFileSync('src/styles/_mixins.scss', 'utf8');
    const baseStyles = readFileSync('src/styles/base.css', 'utf8');

    expect(stylesheet).toContain('@include interactive-focus-ring;');
    expect(mixins).toContain(
      'outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);'
    );
    expect(mixins).toContain('outline-offset: 2px;');
    expect(mixins).not.toContain('outline: none;');
    expect(mixins).not.toContain('box-shadow: 0 0 0 3px');
    expect(mixins).not.toContain('border-color: var(--dds-color-focus-ring);');
    expect(baseStyles).toContain(
      'outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);'
    );
    expect(baseStyles).toContain('outline-offset: 2px;');
    expect(baseStyles).not.toContain('box-shadow: 0 0 0 3px');
  });
});
