# StatusIndicator (Dot) · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `StatusIndicator` component.
- Scaffold: `packages/components/src/components/StatusIndicator/`
- Radix primitive: none (native HTML, SVG)

---

## Purpose

`StatusIndicator` is a small coloured dot used to communicate real-time status or presence. Common uses: online/offline/away presence on user avatars, notification dot on nav items or icons, system health status, entity status (active, inactive, pending, error).

It is always `aria-hidden="true"` when used decoratively alongside visible text. When used standalone (no adjacent text), it requires a visually-hidden label.

---

## Exports from `index.ts`

```ts
export { StatusIndicator };
export type { StatusIndicatorProps, StatusIndicatorStatus };
```

---

## Types

```ts
export type StatusIndicatorStatus =
  | 'online'
  | 'offline'
  | 'away'
  | 'busy'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface StatusIndicatorProps {
  status: StatusIndicatorStatus; // required
  size?: 'xs' | 'sm' | 'md'; // default: 'sm'
  pulse?: boolean; // default: false — animated pulse ring for urgent states
  label?: string; // if provided: renders visually-hidden label for screen readers
  // if omitted: renders as aria-hidden (decorative, adjacent text provides context)
  className?: string;
}
```

---

## Status → colour mapping

| Status    | Colour token                      | Semantic meaning                      |
| --------- | --------------------------------- | ------------------------------------- |
| `online`  | `var(--dds-color-status-success)` | User is available                     |
| `offline` | `var(--dds-color-text-muted)`     | User is not connected                 |
| `away`    | `var(--dds-color-status-warning)` | User is idle                          |
| `busy`    | `var(--dds-color-status-danger)`  | User is in a meeting / do not disturb |
| `pending` | `var(--dds-color-status-warning)` | Awaiting action                       |
| `success` | `var(--dds-color-status-success)` | Healthy / passed                      |
| `warning` | `var(--dds-color-status-warning)` | Needs attention                       |
| `error`   | `var(--dds-color-status-danger)`  | Failed / critical                     |
| `info`    | `var(--dds-color-status-info)`    | Informational                         |
| `neutral` | `var(--dds-color-border-default)` | Inactive / unknown                    |

---

## Structure

```tsx
<span
  ref={ref}
  aria-hidden={!label} // decorative when no label
  role={label ? 'img' : undefined}
  aria-label={label}
  className={clsx(styles.root, styles[size], styles[status], pulse && styles.pulse, className)}
>
  {/* The dot — rendered as a nested span for the pulse ring to target */}
  <span className={styles.dot} />

  {/* Visually hidden label — only when label prop is provided */}
  {label && <span className={styles.srOnly}>{label}</span>}
</span>
```

---

## Styles — `StatusIndicator.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

`.root`:

- `position: relative`
- `display: inline-flex`
- `align-items: center`
- `justify-content: center`
- `flex-shrink: 0`

`.dot`:

- `border-radius: var(--dds-radius-full)` — **documented exception: status dots are always circular**
- `display: block`

Size modifiers (on `.root` — sets dimensions inherited by `.dot`):

- `.xs` → `.dot` `width: 6px; height: 6px`
- `.sm` → `.dot` `width: 8px; height: 8px` (default)
- `.md` → `.dot` `width: 10px; height: 10px`

Status colour modifiers on `.dot`:

```scss
.online .dot {
  background-color: var(--dds-color-status-success);
}
.offline .dot {
  background-color: var(--dds-color-text-muted);
}
.away .dot {
  background-color: var(--dds-color-status-warning);
}
.busy .dot {
  background-color: var(--dds-color-status-danger);
}
.pending .dot {
  background-color: var(--dds-color-status-warning);
}
.success .dot {
  background-color: var(--dds-color-status-success);
}
.warning .dot {
  background-color: var(--dds-color-status-warning);
}
.error .dot {
  background-color: var(--dds-color-status-danger);
}
.info .dot {
  background-color: var(--dds-color-status-info);
}
.neutral .dot {
  background-color: var(--dds-color-border-default);
}
```

### Pulse animation

`.pulse .dot`:

- `animation: indicatorPulse 2s ease-in-out infinite`
- Only applied to statuses that represent urgency (the animation is triggered by the `.pulse` class — the consumer decides when to enable it).

```scss
.pulse::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: var(--dds-radius-full);
  background-color: inherit; // inherits from the dot's computed bg — use currentColor approach
  opacity: 0;
  animation: indicatorRing 2s ease-in-out infinite;
}

// Since ::before can't inherit background-color directly from a sibling,
// use a CSS custom property set on the root:
.pulse {
  --_dot-color: currentColor;
}

// Alternative approach — use outline ring instead of pseudo-element:
.pulse .dot {
  box-shadow: 0 0 0 0 currentColor;
  animation: indicatorPulse 2s ease-in-out infinite;
}
```

Use the `box-shadow` approach for the pulse ring — it inherits `currentColor` from the dot:

```scss
// Set color on .root based on status (not just .dot):
.online {
  color: var(--dds-color-status-success);
}
.offline {
  color: var(--dds-color-text-muted);
}
.away {
  color: var(--dds-color-status-warning);
}
.busy {
  color: var(--dds-color-status-danger);
}
.pending {
  color: var(--dds-color-status-warning);
}
.success {
  color: var(--dds-color-status-success);
}
.warning {
  color: var(--dds-color-status-warning);
}
.error {
  color: var(--dds-color-status-danger);
}
.info {
  color: var(--dds-color-status-info);
}
.neutral {
  color: var(--dds-color-border-default);
}

// Dot background uses currentColor:
.dot {
  background-color: currentColor;
}

// Pulse ring via box-shadow on .dot:
.pulse .dot {
  animation: indicatorPulse 2s ease-in-out infinite;
}

@keyframes indicatorPulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 5px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse .dot {
    animation: none;
  }
}
```

### Visually hidden label

`.srOnly`:

- Standard visually-hidden technique:
  ```scss
  .srOnly {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  ```
  (Or use the shared `visually-hidden` mixin from `_mixins.scss` if it exists)

No hardcoded values. No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-full)` on `.dot` — **documented exception**. Status indicators are universally circular; this is non-negotiable for recognition.
- `border-radius: var(--dds-radius-none)` applies to the `.root` wrapper span — it is not circular.
- Use `currentColor` on `.dot` background — this enables the pulse animation's `box-shadow` to inherit the correct status colour without a CSS custom property.
- `pulse={true}` is an opt-in — do NOT auto-pulse any status. The consumer decides when pulse is appropriate (e.g. a live broadcasting indicator, a critical error notification).
- `aria-hidden="true"` when used decoratively (no `label` prop). `role="img"` + `aria-label` when standalone.
- `prefers-reduced-motion` must stop the pulse animation.

---

## Accessibility

**Decorative use (adjacent text provides context):**

```tsx
<div>
  <StatusIndicator status="online" />
  <span>Sarah Chen</span>
</div>
```

→ `aria-hidden="true"` on the dot. Screen reader reads "Sarah Chen" only.

**Standalone use (no adjacent text):**

```tsx
<StatusIndicator status="online" label="Sarah Chen is online" />
```

→ `role="img"` + `aria-label="Sarah Chen is online"`. Screen reader announces the label.

**On an avatar:**

```tsx
<div className={styles.avatarWrapper}>
  <Avatar src="..." alt="Sarah Chen" />
  <StatusIndicator
    status="online"
    size="xs"
    className={styles.avatarBadge}
    aria-hidden="true" // Avatar's alt already identifies the user
  />
</div>
```

---

## TDD — write ALL tests before implementing

```
// Rendering
- renders a <span> root element
- renders a .dot child span
- forwards className to root
- forwards ref to HTMLSpanElement

// Accessibility — decorative (no label)
- has aria-hidden="true" when no label prop provided
- does NOT have role when no label
- does NOT have aria-label when no label

// Accessibility — standalone (with label)
- has role="img" when label provided
- has aria-label matching label prop
- does NOT have aria-hidden when label provided
- renders visually hidden label span with correct text

// Status classes
- applies .online class when status="online"
- applies .offline class when status="offline"
- applies .away class when status="away"
- applies .busy class when status="busy"
- applies .pending class when status="pending"
- applies .success class when status="success"
- applies .warning class when status="warning"
- applies .error class when status="error"
- applies .info class when status="info"
- applies .neutral class when status="neutral"

// Sizes
- applies .sm class by default
- applies .xs class when size="xs"
- applies .md class when size="md"

// Pulse
- does NOT apply .pulse class by default
- applies .pulse class when pulse={true}

// Forwarding
- forwards data-testid and arbitrary props

// axe
- axe: passes for all 10 status values (decorative, no label)
- axe: passes for all sizes
- axe: passes when label provided (standalone)
- axe: passes with pulse={true}
- axe: passes when used inside an Avatar-like container
```

---

## Stories — `StatusIndicator.stories.tsx`

Named exports required:

- `AllStatuses` — all 10 statuses side by side with text labels
- `Sizes` — xs / sm / md, all statuses stacked
- `Pulse` — pulse={true}, online status
- `PulseError` — pulse={true}, error status
- `Standalone` — label="System is online", no adjacent text
- `OnAvatar` — StatusIndicator positioned as an overlay badge on an Avatar (absolute position demo)
- `OnNavItem` — StatusIndicator in the endSlot of a NavItem
- `PresenceList` — list of users with name + StatusIndicator
- `SystemHealth` — labelled status indicators for services (API: online, DB: warning, Cache: error)

`PulseAnimation` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const dot = within(canvasElement).getByRole('img', { name: /online/i });
  await expect(dot).toBeInTheDocument();
  // Visual assertion: pulse class present
  const inner = dot.querySelector('[class*="dot"]');
  await expect(inner).toBeInTheDocument();
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all statuses — both decorative and standalone modes
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `border-radius: var(--dds-radius-full)` on `.dot` — documented exception
- [ ] `border-radius: var(--dds-radius-none)` on `.root` wrapper
- [ ] `prefers-reduced-motion` stops pulse animation
- [ ] `currentColor` technique used for both dot fill and pulse ring
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Exported from `packages/components/src/index.ts`
