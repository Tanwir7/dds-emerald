import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from '../Avatar';
import { MediaObject } from './MediaObject';
import styles from './MediaObject.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

const mediaLeftClassName = getRequiredClassName(styles, 'mediaLeft');
const mediaRightClassName = getRequiredClassName(styles, 'mediaRight');
const alignTopClassName = getRequiredClassName(styles, 'alignTop');
const alignCenterClassName = getRequiredClassName(styles, 'alignCenter');
const alignBottomClassName = getRequiredClassName(styles, 'alignBottom');
const gapXsClassName = getRequiredClassName(styles, 'gapXs');
const gapSmClassName = getRequiredClassName(styles, 'gapSm');
const gapMdClassName = getRequiredClassName(styles, 'gapMd');
const gapLgClassName = getRequiredClassName(styles, 'gapLg');
const stackBelowSmClassName = getRequiredClassName(styles, 'stackBelowSm');
const stackBelowMdClassName = getRequiredClassName(styles, 'stackBelowMd');
const stackBelowLgClassName = getRequiredClassName(styles, 'stackBelowLg');
const stackBelowXlClassName = getRequiredClassName(styles, 'stackBelowXl');
const contentClassName = getRequiredClassName(styles, 'content');

describe('MediaObject', () => {
  it('renders root element as div by default', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(screen.getByText('Media').parentElement?.parentElement?.tagName).toBe('DIV');
  });

  it('renders as li when as="li"', () => {
    render(
      <ul>
        <MediaObject as="li" media={<span>Media</span>}>
          Content
        </MediaObject>
      </ul>
    );

    expect(screen.getByRole('listitem')).toBeInstanceOf(HTMLLIElement);
  });

  it('renders media slot', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('renders children in content slot', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    const content = screen.getByText('Content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass(contentClassName);
  });

  it('forwards className to root', () => {
    render(
      <MediaObject className="custom-class" media={<span>Media</span>}>
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass('custom-class');
  });

  it('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <MediaObject ref={ref} media={<span>Media</span>}>
        Content
      </MediaObject>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toContainElement(screen.getByText('Content'));
  });

  it('media renders before content in DOM when mediaPosition is left by default', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    const root = screen.getByText('Media').parentElement?.parentElement;
    expect(root?.children[0]).toContainElement(screen.getByText('Media'));
    expect(root?.children[1]).toContainElement(screen.getByText('Content'));
  });

  it('content renders before media in DOM when mediaPosition is right', () => {
    render(
      <MediaObject media={<span>Media</span>} mediaPosition="right">
        Content
      </MediaObject>
    );

    const root = screen.getByText('Media').parentElement?.parentElement;
    expect(root?.children[0]).toContainElement(screen.getByText('Content'));
    expect(root?.children[1]).toContainElement(screen.getByText('Media'));
  });

  it('applies mediaLeft class by default', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(mediaLeftClassName);
  });

  it('applies mediaRight class when mediaPosition is right', () => {
    render(
      <MediaObject media={<span>Media</span>} mediaPosition="right">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(mediaRightClassName);
  });

  it('applies alignTop class by default', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(alignTopClassName);
  });

  it('applies alignCenter when mediaAlign is center', () => {
    render(
      <MediaObject media={<span>Media</span>} mediaAlign="center">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(
      alignCenterClassName
    );
  });

  it('applies alignBottom when mediaAlign is bottom', () => {
    render(
      <MediaObject media={<span>Media</span>} mediaAlign="bottom">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(
      alignBottomClassName
    );
  });

  it('applies gapMd class by default', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(gapMdClassName);
  });

  it('applies gapXs when gap is xs', () => {
    render(
      <MediaObject media={<span>Media</span>} gap="xs">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(gapXsClassName);
  });

  it('applies gapSm when gap is sm', () => {
    render(
      <MediaObject media={<span>Media</span>} gap="sm">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(gapSmClassName);
  });

  it('applies gapLg when gap is lg', () => {
    render(
      <MediaObject media={<span>Media</span>} gap="lg">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(gapLgClassName);
  });

  it('content div has the content class for overflow protection', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(screen.getByText('Content')).toHaveClass(contentClassName);
  });

  it('does not apply a stack class by default', () => {
    render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    const root = screen.getByText('Media').parentElement?.parentElement;
    expect(root).not.toHaveClass(stackBelowSmClassName);
    expect(root).not.toHaveClass(stackBelowMdClassName);
    expect(root).not.toHaveClass(stackBelowLgClassName);
    expect(root).not.toHaveClass(stackBelowXlClassName);
  });

  it('applies stackBelowSm when stackAt is sm', () => {
    render(
      <MediaObject media={<span>Media</span>} stackAt="sm">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(
      stackBelowSmClassName
    );
  });

  it('applies stackBelowMd when stackAt is md', () => {
    render(
      <MediaObject media={<span>Media</span>} stackAt="md">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(
      stackBelowMdClassName
    );
  });

  it('applies stackBelowLg when stackAt is lg', () => {
    render(
      <MediaObject media={<span>Media</span>} stackAt="lg">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(
      stackBelowLgClassName
    );
  });

  it('applies stackBelowXl when stackAt is xl', () => {
    render(
      <MediaObject media={<span>Media</span>} stackAt="xl">
        Content
      </MediaObject>
    );

    expect(screen.getByText('Media').parentElement?.parentElement).toHaveClass(
      stackBelowXlClassName
    );
  });

  it('preserves DOM order when stackAt is used with right-positioned media', () => {
    render(
      <MediaObject media={<span>Media</span>} mediaPosition="right" stackAt="md">
        Content
      </MediaObject>
    );

    const root = screen.getByText('Media').parentElement?.parentElement;
    expect(root).toHaveClass(stackBelowMdClassName);
    expect(root?.children[0]).toContainElement(screen.getByText('Content'));
    expect(root?.children[1]).toContainElement(screen.getByText('Media'));
  });

  it('forwards id, aria-label, and data-testid', () => {
    render(
      <MediaObject
        id="media-object"
        aria-label="Media object"
        data-testid="media-object"
        media={<span>Media</span>}
      >
        Content
      </MediaObject>
    );

    const root = screen.getByTestId('media-object');
    expect(root).toHaveAttribute('id', 'media-object');
    expect(root).toHaveAttribute('aria-label', 'Media object');
  });

  it('axe passes for default left media', async () => {
    const { container } = render(<MediaObject media={<span>Media</span>}>Content</MediaObject>);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for mediaPosition right', async () => {
    const { container } = render(
      <MediaObject media={<span>Media</span>} mediaPosition="right">
        Content
      </MediaObject>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes for all alignment values', async () => {
    const { container } = render(
      <div>
        <MediaObject media={<span>Top</span>} mediaAlign="top">
          Top content
        </MediaObject>
        <MediaObject media={<span>Center</span>} mediaAlign="center">
          Center content
        </MediaObject>
        <MediaObject media={<span>Bottom</span>} mediaAlign="bottom">
          Bottom content
        </MediaObject>
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes with avatar as media', async () => {
    const { container } = render(
      <MediaObject
        media={
          <Avatar>
            <AvatarFallback delayMs={0}>AL</AvatarFallback>
          </Avatar>
        }
      >
        Content
      </MediaObject>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes as li inside ul', async () => {
    const { container } = render(
      <ul>
        <MediaObject as="li" media={<span>Media</span>}>
          Content
        </MediaObject>
      </ul>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('axe passes with responsive stacking enabled', async () => {
    const { container } = render(
      <MediaObject media={<span>Media</span>} stackAt="md">
        Content
      </MediaObject>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
