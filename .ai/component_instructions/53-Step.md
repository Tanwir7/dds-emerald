# Step + Stepper · node scaffolding.mjs

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

- Implement `Stepper`, `Step`, and `StepConnector` components.
- Scaffold: `packages/components/src/components/Stepper/`
- Radix primitive: none

---

## Purpose

`Step` is the atom that represents a single step in a multi-step process. `Stepper` is the organism that composes steps into a horizontal or vertical progress sequence. Together they communicate: where the user has been (completed), where they are now (active), where they're going (pending), and if something went wrong (error).

---

## Exports from `index.ts`

```ts
export { Stepper, Step };
export type { StepperProps, StepProps, StepStatus };
```

---

## Types

```ts
export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface StepProps {
  status?: StepStatus; // default: 'pending'
  stepNumber?: number; // auto-provided by Stepper via context
  label: string; // visible step title
  description?: string; // optional subtitle below label
  icon?: React.ReactNode; // custom icon (overrides default number/check/error icons)
  disabled?: boolean; // default: false
  onClick?: () => void; // makes step clickable (non-linear steppers)
  className?: string;
}

export interface StepperProps {
  activeStep: number; // 0-based index of the current step
  orientation?: 'horizontal' | 'vertical'; // default: 'horizontal'
  size?: 'sm' | 'md'; // default: 'md'
  nonLinear?: boolean; // default: false — if true, all steps are clickable
  className?: string;
  children: React.ReactNode; // Step elements
}
```

---

## Architecture

`Stepper` calculates each `Step`'s status based on `activeStep` and `nonLinear`, then passes it via context:

```tsx
const StepperContext = React.createContext<{
  orientation: 'horizontal' | 'vertical';
  size: 'sm' | 'md';
  nonLinear: boolean;
}>({ orientation: 'horizontal', size: 'md', nonLinear: false });
```

`Stepper` injects `status` and `stepNumber` into each `Step` child via `React.Children.map` + `React.cloneElement`:

```tsx
const steps = React.Children.toArray(children).filter(
  (child) => React.isValidElement(child) && child.type === Step
);

const enrichedSteps = steps.map((child, index) => {
  if (!React.isValidElement(child)) return child;
  const derivedStatus: StepStatus =
    (child.props as StepProps).status ?? // explicit status wins
    (index < activeStep ? 'completed' : index === activeStep ? 'active' : 'pending');
  return React.cloneElement(child as React.ReactElement<StepProps>, {
    status: derivedStatus,
    stepNumber: index + 1,
  });
});
```

---

## Structure

### Stepper

```tsx
<div
  ref={ref}
  role="list"
  aria-label="Progress steps"
  className={clsx(styles.stepper, styles[orientation], styles[size], className)}
>
  <StepperContext.Provider value={{ orientation, size, nonLinear }}>
    {enrichedSteps.map((step, index) => (
      <React.Fragment key={index}>
        {step}
        {index < enrichedSteps.length - 1 && (
          <StepConnector completed={index < activeStep} orientation={orientation} />
        )}
      </React.Fragment>
    ))}
  </StepperContext.Provider>
</div>
```

### Step

```tsx
<div
  role="listitem"
  aria-current={status === 'active' ? 'step' : undefined}
  aria-disabled={disabled ? true : undefined}
  className={clsx(
    styles.step,
    styles[status],
    styles[size],
    disabled && styles.disabled,
    (onClick || nonLinear) && !disabled && styles.clickable,
    className
  )}
  onClick={!disabled && (onClick || nonLinear) ? onClick : undefined}
>
  {/* Step indicator — number, check, error, or custom icon */}
  <div className={styles.indicator} aria-hidden="true">
    {icon ? icon : renderDefaultIndicator(status, stepNumber)}
  </div>

  {/* Step content */}
  <div className={styles.content}>
    <span className={styles.label}>{label}</span>
    {description && <span className={styles.description}>{description}</span>}
  </div>
</div>
```

### Default indicator logic

```tsx
const renderDefaultIndicator = (status: StepStatus, stepNumber: number) => {
  switch (status) {
    case 'completed':
      return <CheckIcon className={styles.indicatorIcon} aria-hidden="true" />;
    case 'error':
      return <AlertIcon className={styles.indicatorIcon} aria-hidden="true" />;
    case 'active':
    case 'pending':
    default:
      return <span className={styles.stepNumber}>{stepNumber}</span>;
  }
};
```

### StepConnector (internal only, not exported)

```tsx
<div
  aria-hidden="true"
  className={clsx(
    styles.connector,
    completed && styles.connectorCompleted,
    orientation === 'vertical' && styles.connectorVertical
  )}
/>
```

---

## Styles — `Stepper.module.scss`

```
@use '../../styles/mixins' as *;
@use '../../styles/breakpoints' as *;
```

### Stepper container

`.stepper`:

- `display: flex`
- `align-items: flex-start`

`.horizontal`:

- `flex-direction: row`
- `align-items: center`

`.vertical`:

- `flex-direction: column`
- `align-items: stretch`

### Step

`.step`:

- `display: flex`
- `align-items: flex-start`
- `gap: var(--dds-space-3)`
- `flex: 1` — steps share equal space in horizontal mode

`.horizontal .step`:

- `flex-direction: column`
- `align-items: center`
- `text-align: center`

`.vertical .step`:

- `flex-direction: row`
- `align-items: flex-start`
- `flex: none`

`.clickable`:

- `cursor: pointer`
- `&:hover .indicator` → slight background on indicator

`.disabled`:

- `opacity: 0.5; cursor: not-allowed; pointer-events: none`

### Indicator (the circle/badge)

`.indicator`:

- `display: flex; align-items: center; justify-content: center`
- `flex-shrink: 0`
- `border-radius: var(--dds-radius-full)` — **documented exception: step indicators are circular**
- `border: 2px solid var(--dds-color-border-default)`
- `background-color: var(--dds-color-bg-default)`
- `transition: background-color, border-color var(--dds-duration-fast) var(--dds-ease-standard)`

Sizes:

- `.sm .indicator` → `width: 24px; height: 24px`
- `.md .indicator` → `width: 32px; height: 32px`

Status modifiers on `.indicator` (scoped via `.{status} .indicator`):

`.pending .indicator`:

- `border-color: var(--dds-color-border-default)`
- `background-color: var(--dds-color-bg-default)`

`.active .indicator`:

- `border-color: var(--dds-color-action-primary)`
- `background-color: var(--dds-color-action-primary)`
- `.stepNumber` → `color: var(--dds-color-action-primary-foreground)`

`.completed .indicator`:

- `border-color: var(--dds-color-action-primary)`
- `background-color: var(--dds-color-action-primary)`
- `.indicatorIcon` → `color: var(--dds-color-action-primary-foreground)`

`.error .indicator`:

- `border-color: var(--dds-color-status-danger)`
- `background-color: var(--dds-color-status-danger)`
- `.indicatorIcon` → `color: var(--dds-color-status-danger-foreground)`

### Step number and icons

`.stepNumber`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-semibold)`
- `color: var(--dds-color-text-muted)`
- `.sm` → `font-size: var(--dds-font-size-xs)`
- `.md` → `font-size: var(--dds-font-size-sm)`

`.indicatorIcon`:

- `.sm` → `width: 12px; height: 12px`
- `.md` → `width: 16px; height: 16px`

### Content

`.content`:

- `display: flex; flex-direction: column; gap: var(--dds-space-0-5)`
- `.horizontal &` → `align-items: center`

`.label`:

- `font-family: var(--dds-font-sans)`
- `font-weight: var(--dds-font-weight-medium)`
- `color: var(--dds-color-text-default)`
- `.sm` → `font-size: var(--dds-font-size-xs)`
- `.md` → `font-size: var(--dds-font-size-sm)`
- `.pending .label` → `color: var(--dds-color-text-muted); font-weight: var(--dds-font-weight-normal)`

`.description`:

- `font-family: var(--dds-font-sans)`
- `font-size: var(--dds-font-size-xs)`
- `color: var(--dds-color-text-muted)`

### Connector

`.connector`:

- `background-color: var(--dds-color-border-default)`
- `transition: background-color var(--dds-duration-fast) var(--dds-ease-standard)`
- `flex-shrink: 0`

`.horizontal .connector`:

- `flex: 1`
- `height: 2px`
- `min-width: var(--dds-space-4)`

`.vertical .connector`:

- `width: 2px`
- `min-height: var(--dds-space-6)`
- `margin-left: calc(16px - 1px)` (md: half indicator width minus half connector width for alignment)
- `margin-left: calc(12px - 1px)` (sm)

`.connectorCompleted`:

- `background-color: var(--dds-color-action-primary)`

No hardcoded values (connector margin offsets are calculated from documented indicator sizes — document this). No Tailwind. No inline styles.

---

## Critical design rules

- `border-radius: var(--dds-radius-full)` on step indicators — **explicitly documented exception**. Step indicator circles are a universal UX convention that overrides the zero-radius rule.
- `border-radius: var(--dds-radius-none)` on everything else.
- The connector `margin-left` in vertical mode is calculated from indicator width / 2 - connector width / 2 to centre the connector below the indicator — document this in a SCSS comment.
- `aria-current="step"` on the active step — this is the correct value (not `"page"`) for a step in a process.
- The Stepper `role="list"` + Step `role="listitem"` provides semantic list structure for screen readers.
- Steps inject `status` and `stepNumber` via `cloneElement` — do not require consumers to pass these manually.

---

## Accessibility

- `Stepper`: `role="list"`, `aria-label="Progress steps"`.
- `Step`: `role="listitem"`, `aria-current="step"` on the active item.
- `aria-disabled="true"` on disabled steps.
- Indicator is `aria-hidden="true"` — the visual state is communicated by the status token colours AND by the `aria-current` attribute.
- For screen reader users, a visually hidden status should be added: `<span className="sr-only">{status}</span>` beside the label. Include this in the content area so screen readers announce "Setup account, completed" or "Billing, active step".
- Clickable steps (nonLinear or with onClick) should receive keyboard focus — add `tabIndex={0}` and handle `Enter`/`Space` keydown.

---

## TDD — write ALL tests before implementing

```
// Stepper — rendering
- renders a div with role="list"
- has aria-label="Progress steps"
- renders correct number of Step children
- renders connectors between steps (n-1 connectors for n steps)
- no connector after last step
- forwards className to stepper root
- forwards ref to stepper div

// Stepper — status derivation
- step before activeStep gets status="completed"
- step at activeStep gets status="active"
- step after activeStep gets status="pending"
- explicit status prop on Step overrides derived status

// Stepper — orientation
- applies .horizontal class by default
- applies .vertical class when orientation="vertical"

// Stepper — connector completion
- connector between completed and active step is .connectorCompleted
- connector between active and pending is NOT .connectorCompleted

// Step — rendering
- renders a div with role="listitem"
- renders label text
- renders description when provided
- does NOT render description when omitted
- renders step number in indicator for pending/active status
- renders check icon for completed status
- renders alert icon for error status
- renders custom icon when icon prop provided
- indicator is aria-hidden

// Step — status
- has aria-current="step" when status="active"
- does NOT have aria-current when status is not "active"
- applies .active class when active
- applies .completed class when completed
- applies .pending class when pending
- applies .error class when error

// Step — sr-only status text
- renders visually hidden status text beside label
- status text reads "completed" for completed step
- status text reads "current step" for active step
- status text reads "error" for error step

// Step — disabled
- has aria-disabled="true" when disabled
- applies .disabled class when disabled
- onClick NOT called when disabled

// Step — clickable
- applies .clickable class when onClick provided
- onClick called when clicked (not disabled)
- nonLinear=true makes step clickable via context

// Step — keyboard (clickable)
- receives tabIndex=0 when clickable
- Enter activates onClick
- Space activates onClick

// Step — sizes
- applies .md size by default
- applies .sm size from Stepper context

// Connector
- connector has .connectorCompleted when completed={true}
- connector is aria-hidden

// axe
- axe: passes for 3-step horizontal stepper (step 1 active)
- axe: passes for vertical orientation
- axe: passes with error step
- axe: passes with completed steps
- axe: passes with disabled step
- axe: passes with nonLinear=true (clickable steps)
```

---

## Stories — `Stepper.stories.tsx`

Named exports required:

- `Horizontal` — 4 steps, step 2 active (default)
- `Vertical` — 4 steps, step 2 active
- `AllStatuses` — 4 steps: completed, active, pending, error
- `WithDescriptions` — all steps have description text
- `Error` — one step with status="error"
- `Completed` — all 4 steps completed
- `Sizes` — sm and md stacked
- `NonLinear` — nonLinear=true, all steps clickable
- `CustomIcons` — icon prop with custom SVGs
- `Controlled` — useState for activeStep with prev/next buttons
- `InWizard` — stepper at top of a multi-step form with next/back navigation

`AdvanceStep` with `play()`:

```ts
play: async ({ canvasElement }) => {
  const steps = within(canvasElement).getAllByRole('listitem');
  await expect(steps[0]).toHaveAttribute('aria-current', 'step');
  const nextBtn = within(canvasElement).getByRole('button', { name: /next/i });
  await userEvent.click(nextBtn);
  await expect(steps[1]).toHaveAttribute('aria-current', 'step');
};
```

Use `autodocs`.

---

## Definition of done

- [ ] All Vitest tests pass: `pnpm test --filter @dds/emerald`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No ESLint errors: `pnpm lint`
- [ ] axe passes for all variants and states
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] `border-radius: var(--dds-radius-full)` on indicators — documented exception
- [ ] `border-radius: var(--dds-radius-none)` on everything else
- [ ] `aria-current="step"` on active step — not `"page"`
- [ ] Visually hidden status text beside each step label
- [ ] Connectors exactly n-1 for n steps — verified in tests
- [ ] No Tailwind. No hardcoded values in SCSS
- [ ] Both `Stepper` and `Step` exported from `packages/components/src/index.ts`
