import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { readFileSync } from 'node:fs';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Badge.module.scss';
import { Badge } from './Badge';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const variants = [
  'default',
  'secondary',
  'outline',
  'success',
  'warning',
  'destructive',
  'info',
] as const;

const sizes = ['sm', 'md', 'lg'] as const;

const variantClassNames = {
  default: getRequiredClassName(styles, 'variantDefault'),
  secondary: getRequiredClassName(styles, 'variantSecondary'),
  outline: getRequiredClassName(styles, 'variantOutline'),
  success: getRequiredClassName(styles, 'variantSuccess'),
  warning: getRequiredClassName(styles, 'variantWarning'),
  destructive: getRequiredClassName(styles, 'variantDestructive'),
  info: getRequiredClassName(styles, 'variantInfo'),
} as const;

const sizeClassNames = {
  sm: getRequiredClassName(styles, 'sizeSm'),
  md: getRequiredClassName(styles, 'sizeMd'),
  lg: getRequiredClassName(styles, 'sizeLg'),
} as const;

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

const getBadgeByText = (text: string) => {
  const badge = Array.from(document.querySelectorAll('span')).find(
    (element) => element.textContent === text
  );

  expect(badge).toBeTruthy();
  return badge as HTMLSpanElement;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Badge', () => {
  it('renders all 7 variants', () => {
    render(
      <div>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
    );

    variants.forEach((variant) => {
      expect(getBadgeByText(variant)).toHaveClass(variantClassNames[variant]);
    });
  });

  it('renders all 3 sizes', () => {
    render(
      <div>
        {sizes.map((size) => (
          <Badge key={size} size={size}>
            {size}
          </Badge>
        ))}
      </div>
    );

    sizes.forEach((size) => {
      expect(getBadgeByText(size)).toHaveClass(sizeClassNames[size]);
    });
  });

  it('focuses on keyboard navigation and uses the shared outline focus ring', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <a href="/">before</a>
        <Badge tabIndex={0}>content</Badge>
      </div>
    );

    await user.tab();
    await user.tab();

    expect(getBadgeByText('content')).toHaveFocus();

    const stylesheet = readFileSync('src/components/Badge/Badge.module.scss', 'utf8');
    const mixins = readFileSync('src/styles/_mixins.scss', 'utf8');

    expect(stylesheet).toContain('&:focus-visible');
    expect(stylesheet).toContain('@include focus-ring;');
    expect(stylesheet).not.toContain('outline: none;');
    expect(stylesheet).not.toContain('0 0 0 2px var(--dds-color-bg-default)');
    expect(stylesheet).not.toContain('0 0 0 4px var(--dds-color-focus-ring)');
    expect(mixins).toContain(
      'outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);'
    );
    expect(mixins).toContain('outline-offset: 2px;');
    expect(mixins).not.toContain('box-shadow: 0 0 0 3px');
  });

  it('forwards className and ref', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(
      <Badge ref={ref} className="custom">
        content
      </Badge>
    );

    const badge = getBadgeByText('content');

    expect(badge).toHaveClass('custom');
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(badge);
  });

  it('axe passes for all variants', async () => {
    const { container } = render(
      <div>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('uses the text-on-primary token for the default foreground', () => {
    const stylesheet = readFileSync('src/components/Badge/Badge.module.scss', 'utf8');

    expect(stylesheet).toContain('--dds-badge-color: var(--dds-color-text-on-primary);');
    expect(stylesheet).not.toContain(
      '--dds-badge-color: var(--dds-color-action-primary-foreground);'
    );
  });
});
