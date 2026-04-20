import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AvatarGroup } from './AvatarGroup';
import styles from './AvatarGroup.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

const avatars = [
  { fallback: 'AA', alt: 'Ada Lovelace' },
  { fallback: 'GB', alt: 'Grace Hopper' },
  { fallback: 'KT', alt: 'Katherine Johnson' },
  { fallback: 'DH', alt: 'Dorothy Vaughan' },
  { fallback: 'HM', alt: 'Hedy Lamarr' },
];

const sizes = ['sm', 'md', 'lg'] as const;

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

afterEach(() => {
  document.body.innerHTML = '';
});

describe('AvatarGroup', () => {
  it('renders up to max items plus overflow counter', () => {
    render(<AvatarGroup avatars={avatars} max={3} />);

    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('GB')).toBeInTheDocument();
    expect(screen.getByText('KT')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('hides overflow avatars beyond max', () => {
    render(<AvatarGroup avatars={avatars} max={3} />);

    expect(screen.queryByText('DH')).not.toBeInTheDocument();
    expect(screen.queryByText('HM')).not.toBeInTheDocument();
  });

  it('renders avatars with image sources and without alt text', () => {
    render(
      <AvatarGroup avatars={[{ src: '/avatar.png', fallback: 'AS' }, { fallback: 'NA' }]} max={2} />
    );

    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByText('NA')).toBeInTheDocument();
    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });

  it('renders all 3 sizes', () => {
    render(
      <div>
        {sizes.map((size) => (
          <AvatarGroup
            key={size}
            data-testid={`avatar-group-${size}`}
            avatars={avatars.slice(0, 2)}
            size={size}
          />
        ))}
      </div>
    );

    sizes.forEach((size) => {
      expect(screen.getByTestId(`avatar-group-${size}`)).toHaveClass(sizeClassNames[size]);
    });
  });

  it('forwards className', () => {
    render(<AvatarGroup avatars={avatars.slice(0, 2)} className="custom" />);
    expect(screen.getByText('AA').closest('[data-avatar-group]')).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AvatarGroup ref={ref} avatars={avatars.slice(0, 2)} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('axe passes', async () => {
    const { container } = render(<AvatarGroup avatars={avatars} max={3} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
