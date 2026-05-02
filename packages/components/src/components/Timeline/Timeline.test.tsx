// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from '../Avatar';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineItem,
  TimelineNode,
  TimelineTimestamp,
  TimelineTitle,
} from './Timeline';
import styles from './Timeline.module.scss';

expect.extend(toHaveNoViolations);

const classNames = {
  timeline: getRequiredClassName(styles, 'timeline'),
  layoutDefault: getRequiredClassName(styles, 'layout-default'),
  layoutAlternate: getRequiredClassName(styles, 'layout-alternate'),
  item: getRequiredClassName(styles, 'item'),
  itemLast: getRequiredClassName(styles, 'itemLast'),
  statusCompleted: getRequiredClassName(styles, 'status-completed'),
  statusActive: getRequiredClassName(styles, 'status-active'),
  statusPending: getRequiredClassName(styles, 'status-pending'),
  statusError: getRequiredClassName(styles, 'status-error'),
  dot: getRequiredClassName(styles, 'dot'),
  dotCompleted: getRequiredClassName(styles, 'dot-completed'),
  dotActive: getRequiredClassName(styles, 'dot-active'),
  dotPending: getRequiredClassName(styles, 'dot-pending'),
  dotError: getRequiredClassName(styles, 'dot-error'),
  connector: getRequiredClassName(styles, 'connector'),
  connectorCompleted: getRequiredClassName(styles, 'connector-completed'),
  content: getRequiredClassName(styles, 'content'),
  title: getRequiredClassName(styles, 'title'),
  description: getRequiredClassName(styles, 'description'),
  timestamp: getRequiredClassName(styles, 'timestamp'),
} as const;

afterEach(() => {
  cleanup();
});

const renderTimeline = (props: Partial<React.ComponentProps<typeof Timeline>> = {}) =>
  render(
    <Timeline {...props}>
      <TimelineItem status="completed">
        <TimelineNode />
        <TimelineConnector />
        <TimelineContent>
          <TimelineTimestamp dateTime="2026-04-01T09:00:00Z">Apr 1, 2026</TimelineTimestamp>
          <TimelineTitle>Project created</TimelineTitle>
          <TimelineDescription>Repository initialized.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem status="active">
        <TimelineNode />
        <TimelineConnector />
        <TimelineContent>
          <TimelineTitle>Running tests</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem last>
        <TimelineNode />
        <TimelineConnector />
        <TimelineContent>
          <TimelineTitle>Awaiting deploy</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );

describe('Timeline', () => {
  describe('structure', () => {
    it('renders an ordered list', () => {
      renderTimeline();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('list').tagName).toBe('OL');
    });

    it('renders list items', () => {
      renderTimeline();
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toBeDefined();
      expect(items[0]?.tagName).toBe('LI');
    });

    it('forwards className to the root', () => {
      renderTimeline({ className: 'custom-timeline' });
      expect(screen.getByRole('list')).toHaveClass('custom-timeline');
    });

    it('forwards ref to the root ordered list', () => {
      const ref = React.createRef<HTMLOListElement>();
      render(
        <Timeline ref={ref}>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Only item</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(ref.current).toBeInstanceOf(HTMLOListElement);
      expect(ref.current).toBe(screen.getByRole('list'));
    });
  });

  describe('layout', () => {
    it('applies the default layout class by default', () => {
      renderTimeline();
      expect(screen.getByRole('list')).toHaveClass(classNames.layoutDefault);
    });

    it('applies the alternate layout class when requested', () => {
      renderTimeline({ layout: 'alternate' });
      expect(screen.getByRole('list')).toHaveClass(classNames.layoutAlternate);
    });
  });

  describe('status classes', () => {
    it('applies completed status classes', () => {
      renderTimeline();
      expect(screen.getAllByRole('listitem')[0]).toHaveClass(classNames.statusCompleted);
    });

    it('applies active status classes', () => {
      renderTimeline();
      expect(screen.getAllByRole('listitem')[1]).toHaveClass(classNames.statusActive);
    });

    it('applies pending status classes by default', () => {
      renderTimeline();
      expect(screen.getAllByRole('listitem')[2]).toHaveClass(classNames.statusPending);
    });

    it('applies error status classes when requested', () => {
      render(
        <Timeline>
          <TimelineItem status="error" last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Build failed</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByRole('listitem')).toHaveClass(classNames.statusError);
    });
  });

  describe('TimelineNode', () => {
    it('renders a default dot when no children are provided', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Pending review</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toBeInTheDocument();
    });

    it('applies the completed dot class', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem status="completed" last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Deployment complete</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toHaveClass(classNames.dotCompleted);
    });

    it('applies the active dot class', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem status="active" last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Running tests</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toHaveClass(classNames.dotActive);
    });

    it('applies the pending dot class by default', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Awaiting review</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toHaveClass(classNames.dotPending);
    });

    it('applies the error dot class', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem status="error" last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Build failed</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toHaveClass(classNames.dotError);
    });

    it('renders an error glyph inside the error dot', () => {
      render(
        <Timeline>
          <TimelineItem status="error" last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Build failed</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('marks the default dot as aria-hidden', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Awaiting review</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks the error icon as aria-hidden', () => {
      render(
        <Timeline>
          <TimelineItem status="error" last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Build failed</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByText('×')).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders custom children when provided', () => {
      render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode>
              <span data-testid="custom-node">AL</span>
            </TimelineNode>
            <TimelineContent>
              <TimelineTitle>Comment added</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByTestId('custom-node')).toBeInTheDocument();
    });

    it('lets the node status override the parent item status', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem status="completed" last>
            <TimelineNode status="error" />
            <TimelineContent>
              <TimelineTitle>Deployment complete</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector(`.${classNames.dot}`)).toHaveClass(classNames.dotError);
    });
  });

  describe('TimelineConnector', () => {
    it('renders connectors', () => {
      const { container } = renderTimeline();
      expect(container.querySelectorAll(`.${classNames.connector}`)).toHaveLength(3);
    });

    it('applies the completed connector class', () => {
      const { container } = renderTimeline();
      expect(container.querySelector(`.${classNames.connector}`)).toHaveClass(
        classNames.connectorCompleted
      );
    });

    it('marks the connector as aria-hidden', () => {
      const { container } = renderTimeline();
      expect(container.querySelector(`.${classNames.connector}`)).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('marks the last item so its connector can be suppressed in CSS', () => {
      renderTimeline();
      expect(screen.getAllByRole('listitem')[2]).toHaveClass(classNames.itemLast);
    });
  });

  describe('subcomponents', () => {
    it('renders TimelineTitle text', () => {
      render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Project created</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByText('Project created')).toBeInTheDocument();
    });

    it('renders TimelineTitle as a paragraph by default', () => {
      render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle>Project created</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByText('Project created').tagName).toBe('P');
    });

    it('renders TimelineTitle with a custom element', () => {
      render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTitle as="h3">Project created</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Project created');
    });

    it('renders TimelineDescription as a paragraph', () => {
      render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineDescription>Repository initialized.</TimelineDescription>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByText('Repository initialized.').tagName).toBe('P');
    });

    it('renders TimelineContent children', () => {
      render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <span>Metadata</span>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });

    it('renders TimelineTimestamp as a time element', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTimestamp>Apr 1, 2026</TimelineTimestamp>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector('time')).toBeInTheDocument();
    });

    it('forwards dateTime to TimelineTimestamp', () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTimestamp dateTime="2026-04-01T09:00:00Z">Apr 1, 2026</TimelineTimestamp>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(container.querySelector('time')).toHaveAttribute('datetime', '2026-04-01T09:00:00Z');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for the default layout with all statuses', async () => {
      const { container } = render(
        <Timeline>
          <TimelineItem status="completed">
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Deployment complete</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status="active">
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Running tests</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status="pending">
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Awaiting review</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status="error" last>
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTitle>Build failed</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for alternate layout', async () => {
      const { container } = render(
        <Timeline layout="alternate">
          <TimelineItem status="completed">
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTimestamp dateTime="2026-04-01">Apr 1, 2026</TimelineTimestamp>
              <TimelineTitle as="h3">Kickoff</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status="active" last>
            <TimelineNode />
            <TimelineConnector />
            <TimelineContent>
              <TimelineTimestamp dateTime="2026-04-14">Apr 14, 2026</TimelineTimestamp>
              <TimelineTitle as="h3">Launch review</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with a custom node', async () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode>
              <Avatar>
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
            </TimelineNode>
            <TimelineContent>
              <TimelineTitle>Comment added</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with timestamps and descriptions', async () => {
      const { container } = render(
        <Timeline>
          <TimelineItem last>
            <TimelineNode />
            <TimelineContent>
              <TimelineTimestamp dateTime="2026-04-01T09:00:00Z">Apr 1, 2026</TimelineTimestamp>
              <TimelineTitle>Project created</TimelineTitle>
              <TimelineDescription>Repository initialized by Alice.</TimelineDescription>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
