# Timeline · node scaffolding.mjs Timeline

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

Before writing any code, check the repo for existing components:

```
packages/components/src/components/Avatar/
packages/components/src/components/Badge/
packages/components/src/components/StatusIndicator/
packages/components/src/components/
```

- Use `Avatar` if it exists for the icon slot stories.
- Use `Badge` if it exists for metadata label stories.
- Use `StatusIndicator` if it exists — do not re-implement a status dot.
- No Radix primitive required. Timeline is a pure semantic HTML composition.

---

## Scaffold location

```
packages/components/src/components/Timeline/
  Timeline.tsx
  Timeline.module.scss
  Timeline.test.tsx
  Timeline.stories.tsx
  index.ts
```

---

## Purpose

`Timeline` displays a chronological or sequential list of events, steps, or activities along a vertical axis. Each item has a connector line, a node (dot, icon, or avatar), and a content region (title, timestamp, description, metadata).

**Timeline vs Stepper (`53-Step.md`):**

- `Stepper`: task-oriented, always has a defined number of steps, user progresses through them, has a strong interactive/navigational role.
- `Timeline`: record-oriented, displays history or activity feeds, items are read-only, count is dynamic, no navigation affordance built in.

**Layout:** Vertical only. Two layout modes:

- `default` — node column left, content column right (standard activity feed).
- `alternate` — odd items content-left/node-center/empty-right, even items empty-left/node-center/content-right (milestone timeline style).

---

## Exports from `index.ts`

```ts
export {
  Timeline,
  TimelineItem,
  TimelineNode,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTimestamp,
  TimelineConnector,
};
export type {
  TimelineProps,
  TimelineItemProps,
  TimelineNodeProps,
  TimelineContentProps,
  TimelineTitleProps,
  TimelineDescriptionProps,
  TimelineTimestampProps,
  TimelineLayout,
  TimelineStatus,
};
```

---

## Types

```ts
type TimelineLayout = 'default' | 'alternate';
type TimelineStatus = 'completed' | 'active' | 'pending' | 'error';

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  layout?: TimelineLayout; // default: 'default'
  className?: string;
  children: React.ReactNode;
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  status?: TimelineStatus; // default: 'pending'
  last?: boolean; // default: false — suppresses connector line on last item
  className?: string;
  children: React.ReactNode;
}

export interface TimelineNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: TimelineStatus; // default: inherited — consumer can override per-node
  className?: string;
  children?: React.ReactNode; // optional — if omitted, renders default status dot
}

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface TimelineTitleProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'; // default: 'p'
  className?: string;
  children: React.ReactNode;
}

export interface TimelineDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export interface TimelineTimestampProps extends React.HTMLAttributes<HTMLElement> {
  dateTime?: string; // maps to <time datetime=""> for machine-readable date
  className?: string;
  children: React.ReactNode;
}
```

---

## Architecture

Timeline renders as `<ol>` — the list is ordered (chronological). Each `TimelineItem` is an `<li>`.

Each `TimelineItem` has a three-column internal grid:

```
[connector-col] [node-col] [content-col]
```

In `layout="default"`:

- connector-col: the vertical line, centred under the node
- node-col: the status dot, icon, or avatar
- content-col: title, description, timestamp, metadata

In `layout="alternate"`:

- Odd items: content-col LEFT, node-col CENTRE, empty RIGHT
- Even items: empty LEFT, node-col CENTRE, content-col RIGHT

The connector line is a pseudo-element (`:before`) on the node column cell, not a separate DOM element. It runs from the bottom of the current node to the top of the next. The `last` prop on `TimelineItem` suppresses it.

### Status colours

| Status      | Node colour token            | Connector token              |
| ----------- | ---------------------------- | ---------------------------- |
| `completed` | `--dds-color-status-success` | `--dds-color-status-success` |
| `active`    | `--dds-color-action-primary` | `--dds-color-border-default` |
| `pending`   | `--dds-color-border-strong`  | `--dds-color-border-default` |
| `error`     | `--dds-color-status-danger`  | `--dds-color-border-default` |

Status is never conveyed by colour alone — the default dot node also changes shape/fill, and the `active` node has a pulsing ring animation. The `error` node renders an `×` icon inside the dot when no custom `children` are passed to `TimelineNode`.

### Default dot node

When `TimelineNode` has no `children`, it renders a default status dot:

```tsx
// Inside TimelineNode when children is undefined/null:
<span className={clsx(styles.dot, styles[`dot-${status}`])} aria-hidden="true" />
```

The dot:

- `completed`: filled circle, success colour
- `active`: filled circle, primary colour, with `animation: activePulse` ring
- `pending`: hollow circle (border only), muted colour
- `error`: filled circle, danger colour, with an `×` glyph (`aria-hidden="true"`)

### Active pulse animation

```scss
@keyframes activePulse {
  0% {
    box-shadow: 0 0 0 0 oklch(from var(--dds-color-action-primary) l c h / 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px oklch(from var(--dds-color-action-primary) l c h / 0);
  }
  100% {
    box-shadow: 0 0 0 0 oklch(from var(--dds-color-action-primary) l c h / 0);
  }
}
```

Respect `prefers-reduced-motion`: disable animation and use a static ring instead.

---

## Component structure

```tsx
// Timeline.tsx
import clsx from 'clsx';
import { X } from 'lucide-react';
import styles from './Timeline.module.scss';

// Context — passes layout and status down without prop drilling
interface TimelineContextValue {
  layout: TimelineLayout;
}
const TimelineContext = React.createContext<TimelineContextValue>({ layout: 'default' });

// Timeline root — <ol> for ordered chronological list
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ layout = 'default', className, children, ...props }, ref) => (
    <TimelineContext.Provider value={{ layout }}>
      <ol
        ref={ref}
        className={clsx(styles.timeline, styles[`layout-${layout}`], className)}
        {...props}
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  )
);
Timeline.displayName = 'Timeline';

// TimelineItem — <li> with status context
interface TimelineItemContextValue {
  status: TimelineStatus;
}
const TimelineItemContext = React.createContext<TimelineItemContextValue>({ status: 'pending' });

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ status = 'pending', last = false, className, children, ...props }, ref) => {
    const { layout } = React.useContext(TimelineContext);
    return (
      <TimelineItemContext.Provider value={{ status }}>
        <li
          ref={ref}
          className={clsx(
            styles.item,
            styles[`status-${status}`],
            last && styles.itemLast,
            layout === 'alternate' && styles.itemAlternate,
            className
          )}
          {...props}
        >
          {children}
        </li>
      </TimelineItemContext.Provider>
    );
  }
);
TimelineItem.displayName = 'TimelineItem';

// TimelineConnector — the vertical line segment between items
// Rendered as a standalone element so consumers can place it explicitly in JSX
// (between TimelineNode and TimelineContent), giving control over DOM order.
export const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { status } = React.useContext(TimelineItemContext);
  return (
    <div
      ref={ref}
      className={clsx(styles.connector, styles[`connector-${status}`], className)}
      aria-hidden="true"
      {...props}
    />
  );
});
TimelineConnector.displayName = 'TimelineConnector';

// TimelineNode — the dot/icon/avatar column
export const TimelineNode = React.forwardRef<HTMLDivElement, TimelineNodeProps>(
  ({ status: statusProp, className, children, ...props }, ref) => {
    const { status: contextStatus } = React.useContext(TimelineItemContext);
    const status = statusProp ?? contextStatus;

    const defaultDot = (
      <span className={clsx(styles.dot, styles[`dot-${status}`])} aria-hidden="true">
        {status === 'error' && <X aria-hidden="true" />}
      </span>
    );

    return (
      <div ref={ref} className={clsx(styles.node, styles[`node-${status}`], className)} {...props}>
        {children ?? defaultDot}
      </div>
    );
  }
);
TimelineNode.displayName = 'TimelineNode';

// TimelineContent — the text/metadata column
export const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  )
);
TimelineContent.displayName = 'TimelineContent';

// TimelineTitle
export const TimelineTitle = React.forwardRef<HTMLElement, TimelineTitleProps>(
  ({ as: Tag = 'p', className, children, ...props }, ref) => (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={clsx(styles.title, className)}
      {...props}
    >
      {children}
    </Tag>
  )
);
TimelineTitle.displayName = 'TimelineTitle';

// TimelineDescription
export const TimelineDescription = React.forwardRef<HTMLParagraphElement, TimelineDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={clsx(styles.description, className)} {...props}>
      {children}
    </p>
  )
);
TimelineDescription.displayName = 'TimelineDescription';

// TimelineTimestamp — renders as <time> for semantic date/time
export const TimelineTimestamp = React.forwardRef<HTMLElement, TimelineTimestampProps>(
  ({ dateTime, className, children, ...props }, ref) => (
    <time
      ref={ref as React.Ref<HTMLTimeElement>}
      dateTime={dateTime}
      className={clsx(styles.timestamp, className)}
      {...props}
    >
      {children}
    </time>
  )
);
TimelineTimestamp.displayName = 'TimelineTimestamp';
```

### Recommended JSX composition

```tsx
// Default layout — standard activity feed
<Timeline>
  <TimelineItem status="completed">
    <TimelineNode />
    <TimelineConnector />
    <TimelineContent>
      <TimelineTimestamp dateTime="2024-01-15">Jan 15, 2024</TimelineTimestamp>
      <TimelineTitle>Project created</TimelineTitle>
      <TimelineDescription>Initial repository set up by Alice.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem status="active">
    <TimelineNode />
    <TimelineConnector />
    <TimelineContent>
      <TimelineTitle>In review</TimelineTitle>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem status="pending" last>
    <TimelineNode />
    {/* No connector on last item */}
    <TimelineContent>
      <TimelineTitle>Awaiting deployment</TimelineTitle>
    </TimelineContent>
  </TimelineItem>
</Timeline>
```

---

## SCSS — Timeline.module.scss

```scss
@use '../../../styles/mixins' as *;

// ─── Timeline root ────────────────────────────────────────────────────────────

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

// ─── Layout modes ─────────────────────────────────────────────────────────────

.layout-default .item {
  display: grid;
  // node column: fixed width | connector column: fixed width | content column: grows
  grid-template-columns: 28px 2px 1fr;
  grid-template-rows: auto 1fr;
  column-gap: var(--dds-space-3);
}

.layout-alternate .item {
  display: grid;
  grid-template-columns: 1fr 28px 1fr;
  column-gap: var(--dds-space-4);
}

// ─── TimelineItem ────────────────────────────────────────────────────────────

.item {
  position: relative;
  min-height: 40px;
}

// ─── TimelineNode ────────────────────────────────────────────────────────────

.node {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2px; // optical alignment with first line of title text
  grid-column: 1;
  grid-row: 1 / -1;

  .layout-alternate & {
    grid-column: 2;
  }
}

// ─── Default status dot ───────────────────────────────────────────────────────

.dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: var(--dds-radius-full); // documented exception — indicator dot
  flex-shrink: 0;

  svg {
    width: 8px;
    height: 8px;
  }
}

.dot-completed {
  background-color: var(--dds-color-status-success);
}

.dot-active {
  background-color: var(--dds-color-action-primary);
  animation: activePulse 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: 0 0 0 3px oklch(from var(--dds-color-action-primary) l c h / 0.25);
  }
}

.dot-pending {
  background-color: transparent;
  border: 2px solid var(--dds-color-border-strong);
}

.dot-error {
  background-color: var(--dds-color-status-danger);
  color: var(--dds-color-text-on-danger);
}

@keyframes activePulse {
  0% {
    box-shadow: 0 0 0 0 oklch(from var(--dds-color-action-primary) l c h / 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px oklch(from var(--dds-color-action-primary) l c h / 0);
  }
  100% {
    box-shadow: 0 0 0 0 oklch(from var(--dds-color-action-primary) l c h / 0);
  }
}

// ─── TimelineConnector ────────────────────────────────────────────────────────

.connector {
  width: 2px;
  // Stretch from below the node to the bottom of the item
  flex: 1 0 var(--dds-space-4);
  min-height: var(--dds-space-4);
  margin-top: var(--dds-space-1);
  border-radius: var(--dds-radius-full); // documented exception — connector pill

  grid-column: 2;
  grid-row: 2;

  // Default layout: connector in column 2
  .layout-default & {
    grid-column: 2;
  }
  // Alternate layout: connector in column 2 (centre), stacked under node
  .layout-alternate & {
    grid-column: 2;
    justify-self: center;
  }

  .itemLast & {
    display: none;
  }
}

.connector-completed {
  background-color: var(--dds-color-status-success);
}
.connector-active {
  background-color: var(--dds-color-border-default);
}
.connector-pending {
  background-color: var(--dds-color-border-default);
}
.connector-error {
  background-color: var(--dds-color-border-default);
}

// ─── TimelineContent ─────────────────────────────────────────────────────────

.content {
  grid-column: 3;
  grid-row: 1 / -1;
  padding-bottom: var(--dds-space-6);
  min-width: 0;

  // Alternate layout — odd items (1st, 3rd…): content on LEFT
  .layout-alternate .item:nth-child(odd) & {
    grid-column: 1;
    text-align: right;
  }

  // Alternate layout — even items (2nd, 4th…): content on RIGHT
  .layout-alternate .item:nth-child(even) & {
    grid-column: 3;
    text-align: left;
  }

  // Last item — no bottom padding needed (no connector below)
  .itemLast & {
    padding-bottom: 0;
  }
}

// ─── TimelineTitle ────────────────────────────────────────────────────────────

.title {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  line-height: var(--dds-line-height-snug);
  color: var(--dds-color-text-default);
  margin: 0;

  // Active item title uses primary colour for emphasis
  .status-active & {
    color: var(--dds-color-action-primary);
  }
}

// ─── TimelineDescription ─────────────────────────────────────────────────────

.description {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  line-height: var(--dds-line-height-normal);
  color: var(--dds-color-text-muted);
  margin: var(--dds-space-1) 0 0;
}

// ─── TimelineTimestamp ────────────────────────────────────────────────────────

.timestamp {
  display: block;
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  line-height: var(--dds-line-height-snug);
  color: var(--dds-color-text-subtle);
  margin-bottom: var(--dds-space-0-5);
  font-variant-numeric: tabular-nums;
}
```

---

## Accessibility

- `Timeline` renders as `<ol>` — ordered list, correct for chronological sequences. Screen readers announce "list, N items."
- `TimelineItem` renders as `<li>` — each item is a list element.
- `TimelineTimestamp` renders as `<time>` with `dateTime` prop for machine-readable dates (e.g. `dateTime="2024-01-15T09:30:00Z"`). Human-readable display is the child text.
- `TimelineNode` default dot is `aria-hidden="true"` — it is decorative. Status is communicated by the item's title and description text, not solely by colour.
- `TimelineConnector` is `aria-hidden="true"` — purely decorative.
- The `×` icon inside the `error` dot is `aria-hidden="true"` — do not announce the icon; the content should communicate the error.
- Status is never conveyed by colour alone:
  - `completed` — filled dot + success colour + past-tense title wording (consumer responsibility)
  - `active` — filled dot + primary colour + pulse animation + active title colour
  - `pending` — hollow dot (shape change) + muted colour
  - `error` — filled dot + danger colour + `×` glyph inside dot
- `activePulse` animation: disabled under `prefers-reduced-motion` — replaced with a static ring so active status is still visually distinct.
- `TimelineTitle` defaults to `<p>` — not a heading. If items represent document sections or meaningful navigable landmarks, consumers can pass `as="h3"` etc. The component does not impose heading hierarchy.
- No interactive elements on Timeline itself — it is purely presentational. If items become clickable (e.g. activity log entries), the consumer wraps `TimelineContent` in an `<a>` or `<button>`, not the whole `TimelineItem`.
- Reading order: node → connector → content in DOM. Screen readers read the dot (aria-hidden) then content — effectively: content only, which is correct.

---

## TDD — write ALL tests before implementing

Run scaffolding first: `node scaffolding.mjs Timeline`

```
// Structure
- Timeline renders as <ol>
- TimelineItem renders as <li>
- Timeline renders correct number of items
- TimelineTimestamp renders as <time>
- TimelineTimestamp has dateTime attribute when provided

// Layout
- applies layout-default class by default
- applies layout-alternate class when layout="alternate"

// Status
- applies status-completed class when status="completed"
- applies status-active class when status="active"
- applies status-pending class when status="pending" (default)
- applies status-error class when status="error"

// TimelineNode
- renders default dot when no children passed
- renders dot-completed class for completed status
- renders dot-active class for active status
- renders dot-pending class for pending status
- renders dot-error class for error status
- error dot renders X icon
- X icon has aria-hidden="true"
- dot has aria-hidden="true"
- renders custom children when provided (icon/avatar)
- status prop on TimelineNode overrides item context status

// TimelineConnector
- renders connector
- applies connector-completed class for completed status
- connector has aria-hidden="true"
- connector is not rendered when itemLast=true (via CSS display:none)

// Sub-components render
- TimelineTitle renders text
- TimelineTitle renders as <p> by default
- TimelineTitle renders as <h3> when as="h3"
- TimelineDescription renders text as <p>
- TimelineContent renders children

// Accessibility
- Timeline has no implicit role beyond <ol> list
- each TimelineItem has listitem role (implicit from <li>)
- TimelineTimestamp renders as <time> element
- connector is aria-hidden
- default node dot is aria-hidden

// axe
- axe: default layout, all four statuses
- axe: alternate layout
- axe: with custom icon node
- axe: with TimelineTimestamp and dateTime
- axe: with TimelineDescription
- axe: single item with last={true}
```

---

## Stories — `Timeline.stories.tsx`

Title: `Core Components/Timeline`

Named exports required:

- `Default` — five items, mixed statuses: completed, completed, active, pending, pending. Last item has `last` prop. Each item has timestamp + title + description.
- `AllStatuses` — four items showing one of each status with labelled titles making status clear from text alone ("Deployment complete", "Running tests", "Awaiting review", "Build failed").
- `AlternateLayout` — `layout="alternate"`, five milestone items with timestamps. Demonstrates left/right alternation.
- `WithCustomNodes` — items using `TimelineNode` with custom children: an icon, an `Avatar` (if it exists), a number badge.
- `ActivityFeed` — realistic example: ten items representing a git-style activity feed (commit, review, comment, deploy, etc.). Compact titles, timestamps with `dateTime` prop, no descriptions.
- `MinimalTitlesOnly` — items with `TimelineTitle` only, no description or timestamp. Tests the minimal rendering path.
- `SingleItem` — one item with `last` prop. Connector does not render.
- `ErrorState` — includes an `error` status item mid-list, with a description explaining the error.
- `ReducedMotion` — story with a note pointing to `prefers-reduced-motion` behaviour. Shows active item without animation in a static preview.

No `play()` functions required — Timeline is purely presentational and has no interactive states to automate.

Use `autodocs`. Storybook group: `Core Components/Timeline`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all layout and status variants
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `Timeline` renders as `<ol>`, items as `<li>` — verified in tests
- [ ] `TimelineTimestamp` renders as `<time>` with `dateTime` — verified in tests
- [ ] Status never conveyed by colour alone — dot shape + colour + text all differ per status
- [ ] `activePulse` animation disabled under `prefers-reduced-motion` — static ring shown instead
- [ ] Default dot and connector are `aria-hidden="true"`
- [ ] `last` prop suppresses connector — verified in tests
- [ ] `dot` and `connector` use `var(--dds-radius-full)` — documented exception for indicator shapes
- [ ] No Tailwind. No hardcoded color or spacing values in SCSS.
- [ ] Exported from `packages/components/src/index.ts`
