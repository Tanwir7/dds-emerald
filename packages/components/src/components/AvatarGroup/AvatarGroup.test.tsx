import React, { act } from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from '../Avatar';
import { AvatarGroup } from './AvatarGroup';
import styles from './AvatarGroup.module.scss';
import avatarStyles from '../Avatar/Avatar.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

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

const avatarClassNames = {
  sm: getRequiredClassName(avatarStyles, 'sm'),
  md: getRequiredClassName(avatarStyles, 'md'),
  lg: getRequiredClassName(avatarStyles, 'lg'),
} as const;

const groupClassNames = {
  sm: getRequiredClassName(styles, 'sm'),
  md: getRequiredClassName(styles, 'md'),
  lg: getRequiredClassName(styles, 'lg'),
} as const;

const avatarChildren = (
  <>
    <Avatar>
      <AvatarFallback delayMs={0}>AA</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>GB</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>KT</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>DH</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback delayMs={0}>HM</AvatarFallback>
    </Avatar>
  </>
);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('AvatarGroup', () => {
  it('renders the correct number of avatars up to max', async () => {
    render(<AvatarGroup max={3}>{avatarChildren}</AvatarGroup>);

    expect(await screen.findByText('AA')).toBeInTheDocument();
    expect(await screen.findByText('GB')).toBeInTheDocument();
    expect(await screen.findByText('KT')).toBeInTheDocument();
    expect(screen.queryByText('DH')).not.toBeInTheDocument();
    expect(screen.queryByText('HM')).not.toBeInTheDocument();
  });

  it('renders an overflow indicator when children exceed max', () => {
    render(<AvatarGroup max={3}>{avatarChildren}</AvatarGroup>);

    expect(screen.getByLabelText('2 more')).toHaveTextContent('+2');
  });

  it('does not render overflow when children are within max', () => {
    render(
      <AvatarGroup max={5}>
        <Avatar>
          <AvatarFallback delayMs={0}>AA</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback delayMs={0}>GB</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    );

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('defaults max to 5', async () => {
    render(<AvatarGroup>{avatarChildren}</AvatarGroup>);

    expect(await screen.findByText('AA')).toBeInTheDocument();
    expect(await screen.findByText('HM')).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('passes size to Avatar children', async () => {
    render(<AvatarGroup size="lg">{avatarChildren}</AvatarGroup>);

    expect((await screen.findByText('AA')).parentElement).toHaveClass(avatarClassNames.lg);
    expect((await screen.findByText('HM')).parentElement).toHaveClass(avatarClassNames.lg);
  });

  it('applies all 3 group sizes', () => {
    render(
      <div>
        <AvatarGroup data-testid="group-sm" size="sm">
          {avatarChildren}
        </AvatarGroup>
        <AvatarGroup data-testid="group-md" size="md">
          {avatarChildren}
        </AvatarGroup>
        <AvatarGroup data-testid="group-lg" size="lg">
          {avatarChildren}
        </AvatarGroup>
      </div>
    );

    expect(screen.getByTestId('group-sm')).toHaveClass(groupClassNames.sm);
    expect(screen.getByTestId('group-md')).toHaveClass(groupClassNames.md);
    expect(screen.getByTestId('group-lg')).toHaveClass(groupClassNames.lg);
  });

  it('forwards className to the wrapper div', async () => {
    render(<AvatarGroup className="custom">{avatarChildren}</AvatarGroup>);

    expect((await screen.findByText('AA')).closest('[data-avatar-group]')).toHaveClass('custom');
  });

  it('forwards ref to the wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AvatarGroup ref={ref}>{avatarChildren}</AvatarGroup>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('axe passes for AvatarGroup with overflow', async () => {
    const { container } = render(<AvatarGroup max={3}>{avatarChildren}</AvatarGroup>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe passes for AvatarGroup without overflow', async () => {
    const { container } = render(<AvatarGroup>{avatarChildren}</AvatarGroup>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
