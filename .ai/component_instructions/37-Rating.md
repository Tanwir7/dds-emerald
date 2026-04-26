# Rating · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Rating` component.
- Scaffold: `packages/components/src/components/Rating/`
- Radix primitive: none (managed radio group pattern)

---

## Purpose

`Rating` renders a row of star buttons for selecting or displaying a numeric rating. It has two modes: **interactive** (a radio group where the user selects a value) and **read-only** (purely displays a value with no interactivity).

---

## Props

```ts
value?: number                    // 0–max. Controlled selection or display value
defaultValue?: number             // uncontrolled initial, default: 0
max?: number                      // default: 5 — number of stars
onChange?: (value: number) => void
readOnly?: boolean                // default: false
size?: 'sm' | 'md' | 'lg'        // default: 'md'
allowHalf?: boolean               // default: false — display only (see note below)
label?: string                    // aria-label for the group, default: "Rating"
className?: string
```

**Note on `allowHalf`:** Half-star interactive selection is deferred. `allowHalf={true}` affects display only — it renders partial stars for non-integer `value` (e.g. `value=3.5` shows 3 full + 1 half star). Interactive selection is always whole integers in this version.

Renders as `<div role="radiogroup">` for interactive mode and `<div role="img">` for read-only mode. Forward `ref` typed to `HTMLDivElement`.

---

## Internal state

```tsx
const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
const [internalValue, setInternalValue] = React.useState(defaultValue ?? 0);
const isControlled = value !== undefined;
const currentValue = isControlled ? value : internalValue;
const displayValue = hoveredIndex !== null ? hoveredIndex : currentValue;
```

`displayValue` drives which stars are filled during hover — reverts to `currentValue` when the pointer leaves the component.

---

## Star fill logic

```tsx
const getFill = (i: number): 'full' | 'half' | 'empty' => {
  if (displayValue >= i) return 'full';
  if (allowHalf && displayValue >= i - 0.5) return 'half';
  return 'empty';
};
```

---

## Star SVG

```tsx
const STAR_PATH = 'M10 1l2.39 7.26H19l-5.5 4 2.1 7.26L10 15.27l-5.6 4.25 2.1-7.26L1 8.26h6.61z';

const StarIcon = ({ fill, halfId }: { fill: 'full' | 'half' | 'empty'; halfId?: string }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" width="100%" height="100%">
    {fill === 'half' && halfId ? (
      <>
        <defs>
          <clipPath id={halfId}>
            <rect x="0" y="0" width="10" height="20" />
          </clipPath>
        </defs>
        <path
          d={STAR_PATH}
          fill="var(--dds-color-bg-subtle)"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path d={STAR_PATH} fill="currentColor" clipPath={`url(#${halfId})`} />
      </>
    ) : (
      <path
        d={STAR_PATH}
        fill={fill === 'full' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1"
      />
    )}
  </svg>
);
```

Use `useId()` to generate a stable unique `halfId` per component instance to avoid `clipPath` id collisions when multiple `Rating` components are on the same page.

---

## Structure — interactive mode

```tsx
<div
  role="radiogroup"
  aria-label={label ?? 'Rating'}
  className={clsx(styles.root, styles[size], className)}
  onMouseLeave={() => setHoveredIndex(null)}
  ref={ref}
>
  {Array.from({ length: max }, (_, i) => {
    const starIndex = i + 1;
    const fill = getFill(starIndex);
    const isSelected = currentValue === starIndex;
    const isTabStop = isSelected || (currentValue === 0 && starIndex === 1);
    return (
      <button
        key={starIndex}
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={`${starIndex} out of ${max} stars`}
        className={clsx(styles.star, styles[`fill${capitalise(fill)}`])}
        onClick={() => handleSelect(starIndex)}
        onMouseEnter={() => !readOnly && setHoveredIndex(starIndex)}
        tabIndex={isTabStop ? 0 : -1}
      >
        <StarIcon fill={fill} halfId={fill === 'half' ? `${uid}-${starIndex}` : undefined} />
      </button>
    );
  })}
</div>
```

### Keyboard handler

```tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  const refs = starRefs.current; // array of button refs
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = Math.min(index + 1, max);
    handleSelect(next);
    refs[next - 1]?.focus();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault();
    const prev = Math.max(index - 1, 1);
    handleSelect(prev);
    refs[prev - 1]?.focus();
  } else if (e.key === 'Home') {
    e.preventDefault();
    handleSelect(1);
    refs[0]?.focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    handleSelect(max);
    refs[max - 1]?.focus();
  }
};
```

---

## Structure — read-only mode

```tsx
<div
  role="img"
  aria-label={`${currentValue} out of ${max} stars`}
  className={clsx(styles.root, styles[size], styles.readOnly, className)}
  ref={ref}
>
  {Array.from({ length: max }, (_, i) => {
    const fill = getFill(i + 1);
    return (
      <span
        key={i}
        aria-hidden="true"
        className={clsx(styles.star, styles[`fill${capitalise(fill)}`])}
      >
        <StarIcon fill={fill} halfId={fill === 'half' ? `${uid}-${i}` : undefined} />
      </span>
    );
  })}
</div>
```

---

## Styles — `Rating.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `display: inline-flex`
- `align-items: center`
- `gap: var(--dds-space-0-5)`

`.star` (button or span):

- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `padding: 0`
- `border: none`
- `background: transparent`
- `cursor: pointer`
- `outline: 3px solid transparent`
- `outline-offset: 1px`
- `border-radius: var(--dds-radius-none)`
- `color: var(--dds-color-status-warning)` — star accent colour
- `transition: color var(--dds-duration-fast) var(--dds-ease-standard),
             transform var(--dds-duration-fast) var(--dds-ease-standard)`
- `&:focus-visible` → `outline-color: oklch(from var(--dds-color-focus-ring) l c h / 0.5)`
- `&:hover, &:focus-visible` → `transform: scale(1.15)` (interactive only)

Size modifiers — applied to `.root`, target `.star` children:

```scss
.sm .star {
  width: var(--dds-icon-size-sm);
  height: var(--dds-icon-size-sm);
}
.md .star {
  width: calc(var(--dds-icon-size-md) + 2px);
  height: calc(var(--dds-icon-size-md) + 2px);
}
.lg .star {
  width: var(--dds-icon-size-lg);
  height: var(--dds-icon-size-lg);
}
```

Fill modifiers (on `.star`):

- `.fillFull` → `color: var(--dds-color-status-warning)`
- `.fillHalf` → `color: var(--dds-color-status-warning)`
- `.fillEmpty` → `color: var(--dds-color-border-default)`

Read-only modifier:

```scss
.readOnly .star {
  cursor: default;
  pointer-events: none;
  &:hover {
    transform: none;
  }
}
```

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-none)` on star buttons — no exceptions.
- Star colour is `var(--dds-color-status-warning)` — the amber warning token. Never hardcode `#fbbf24` or similar.
- Empty star uses `var(--dds-color-border-default)` for the stroke — adapts to dark mode.
- `clipPath` IDs must be unique per instance — use `useId()`. Duplicate IDs in SVG break half-star rendering.
- Roving tabindex: only one star button is in the tab stop at any time (the selected one, or the first if none).
- Interactive mode only: `onMouseLeave` on the root resets `hoveredIndex` to `null`.
- `readOnly={true}` removes all pointer events and hover transforms — the stars become purely decorative.

---

## Accessibility

**Interactive:**

- `role="radiogroup"` on wrapper div with `aria-label`.
- Each button: `role="radio"`, `aria-checked`, `aria-label="N out of M stars"`.
- Roving tabindex — only one tab stop inside the group.
- Arrow key navigation + Home/End per radio group pattern.

**Read-only:**

- `role="img"` on wrapper with `aria-label="3.5 out of 5 stars"`.
- All star spans are `aria-hidden="true"`.
- No focusable elements — `pointer-events: none`.

---

## TDD — write ALL tests before implementing

```
// Rendering — interactive (default)
- renders a div with role="radiogroup"
- aria-label defaults to "Rating"
- renders max={5} star buttons by default
- each button has role="radio"
- each button has aria-label "N out of 5 stars"
- first star has tabIndex=0 when no value selected (currentValue=0)
- selected star has tabIndex=0, all others tabIndex=-1
- unselected stars have aria-checked="false"
- selected star has aria-checked="true"
- forwards className to root
- forwards ref to HTMLDivElement

// Rendering — read-only
- renders div with role="img" when readOnly={true}
- aria-label is "0 out of 5 stars" when value=0
- aria-label is "3 out of 5 stars" when value=3
- aria-label is "3.5 out of 5 stars" when value=3.5 and allowHalf={true}
- individual star spans have aria-hidden="true" in read-only mode
- no buttons rendered in read-only mode

// Selection (interactive)
- clicking 3rd star calls onChange(3)
- clicking 3rd star updates internal value (uncontrolled)
- reflects controlled value prop
- clicking same selected star keeps value (does not deselect)

// Hover state
- hovering 4th star sets displayValue to 4 (fills 4 stars)
- mouseLeave on root resets hover state

// Half star display
- value=3.5, allowHalf=true: 3 full + 1 half + 1 empty stars
- value=3, allowHalf=true: 3 full + 2 empty stars (no half)
- allowHalf=false: value=3.5 shows 3 full + 2 empty (rounds down)

// Sizes
- applies .sm class when size="sm"
- applies .md class by default
- applies .lg class when size="lg"

// Keyboard — interactive
- Tab focuses the group (selected star or first star)
- ArrowRight moves selection to next star and focuses it
- ArrowLeft moves selection to previous star and focuses it
- ArrowRight on last star stays on last star
- ArrowLeft on first star stays on first star
- Home selects first star
- End selects last star

// Read-only keyboard
- no star buttons receive Tab focus in read-only mode

// Custom max
- renders max={3} stars when max={3}
- aria-label on each button says "out of 3 stars"

// Axe
- axe: passes for interactive, value=3
- axe: passes for interactive, value=0 (none selected)
- axe: passes for readOnly={true}
- axe: passes for allowHalf with value=3.5
- axe: passes for size="sm"
- axe: passes for size="lg"
- axe: passes with custom label prop
```

---

## Stories — `Rating.stories.tsx`

Named exports required:

- `Default` — interactive, value=0 (nothing selected)
- `WithValue` — interactive, defaultValue=3
- `ReadOnly` — readOnly={true}, value=4
- `ReadOnlyHalf` — readOnly={true}, value=3.5, allowHalf={true}
- `Sizes` — sm / md / lg side by side, readOnly, value=4
- `MaxThree` — max={3}, interactive
- `Controlled` — useState, shows live value label beside stars
- `InFormField` — Rating inside a Field molecule (label="Rate your experience")

`SelectStar` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const buttons = within(canvasElement).getAllByRole('radio');
  await userEvent.click(buttons[2]); // 3rd star
  await expect(buttons[2]).toHaveAttribute('aria-checked', 'true');
  await expect(buttons[0]).toHaveAttribute('aria-checked', 'false');
};
```

`KeyboardNavigation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const buttons = within(canvasElement).getAllByRole('radio');
  await userEvent.tab();
  await expect(buttons[0]).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(buttons[1]).toHaveFocus();
  await expect(buttons[1]).toHaveAttribute('aria-checked', 'true');
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe test passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `clipPath` IDs are unique per instance (verified: multiple Rating components on same page don't conflict)
- [ ] Roving tabindex verified: only one tab stop inside the group
- [ ] Read-only mode has no focusable elements
- [ ] `prefers-reduced-motion` reduces star scale transform (via global token)
- [ ] No Tailwind classes anywhere
- [ ] No hardcoded color values in SCSS
- [ ] Exported from `packages/components/src/index.ts`
