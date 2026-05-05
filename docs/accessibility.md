# Accessibility

Accessibility is not optional. It is part of the definition of done for every component and UI pattern in this system. Apply WCAG 2.2 Level AA as the baseline.

## Core principles (POUR)

Every UI decision must satisfy all four:

| Principle          | Question to answer                           | Examples                                                                               |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Perceivable**    | Can people see or hear the content?          | Contrast, captions, alt text, non-color indicators                                     |
| **Operable**       | Can people use it without a mouse?           | Keyboard nav, focus order, no focus traps, WCAG AA target sizes                        |
| **Understandable** | Is the interface clear?                      | Labels, instructions, specific error messages                                          |
| **Robust**         | Does it work with real assistive technology? | Semantic HTML, correct roles/names/states, ARIA only when native HTML can't do the job |

## Non-negotiable accessibility rules

- Every interactive element must be reachable and operable via keyboard (Tab, Shift+Tab, Enter, Space, Escape)
- Focus order must follow a logical reading sequence — never strand or skip focus
- Modals and overlays MUST trap focus while open and return focus on close
- Never leave interactive elements reachable when visually hidden (e.g. off-screen menus)
- Meaning must never be conveyed by color alone — always pair with text, icon, or pattern
- All form fields must have a visible `<label>` or accessible name — placeholder is not a label
- Error messages must be specific, human-readable, and non-blaming
- Error / success states must not rely on color alone
- Images require meaningful `alt` text; decorative images use `alt=""`
- Use native HTML elements before reaching for ARIA — avoid bloated ARIA when a `<button>`, `<input>`, or `<dialog>` suffices
- All text must meet WCAG AA contrast minimums (4.5:1 body, 3:1 large/UI)
- Pointer targets must meet WCAG 2.2 AA Target Size (Minimum): at least 24 by 24 CSS pixels, or satisfy a documented WCAG exception. Use 44 by 44 CSS pixels only where an Emerald component spec explicitly requires it.

## Accessibility review passes

When building or reviewing any UI component, pattern, or flow, run the following five review passes. These are listed in priority order.

---

### Pass 1 — Keyboard-first

Walk through the UI as if you can only use a keyboard.

1. List the tab order from first to last meaningful interactive element
2. Identify any interactive elements that might be missed, skipped, or unreachable
3. Flag focus risks: modals that don't trap focus, hidden elements that remain focusable, dropdowns that strand focus, custom controls that behave like unlabelled `<div>`s
4. Verify Enter/Space activate buttons and links; Escape closes overlays
5. Confirm no keyboard traps exist

---

### Pass 2 — Screen reader narration

Narrate the screen as a screen reader user would experience it.

1. Navigate landmarks first (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`), then main content, then secondary regions
2. For each interactive element, confirm a clear **name**, **role**, and **state** would be announced
3. Flag: unnamed buttons, duplicated labels, confusing reading order, images with missing or useless alt text, form fields without proper labels
4. Confirm live regions (`aria-live`) announce dynamic content changes (toasts, inline validation, loading states)

---

### Pass 3 — Color and contrast

Review for color-dependent meaning and risky contrast pairings.

1. Identify places where meaning is conveyed by color alone (errors, success, required fields, links vs body text)
2. Call out text/background pairings that are risky — especially small body text on subtle backgrounds
3. Suggest safer alternatives that preserve the DDS brand (don't default to ugly)
4. Note what still requires measurement with engineering tools (Colour Contrast Analyser, browser DevTools) — AI cannot reliably measure exact ratios from screenshots

---

### Pass 4 — Forms

Review all form fields for accessibility and clarity.

1. Every field has a visible, associated `<label>` (or `aria-label` / `aria-labelledby` when visual label is impossible)
2. Helper text is linked via `aria-describedby`
3. Error messages are specific, human, and non-blaming — rewrite any weak messages
4. Success states don't rely on color alone
5. Related fields are grouped with `<fieldset>` / `<legend>` where applicable
6. Instructions appear **before** users can fail, not after

---

### Pass 5 — Component accessibility contract

When defining or extending a design-system component, produce a concise accessibility contract:

1. **Keyboard interactions** — document behaviour for default, hover, focus, active, disabled, loading, and error states
2. **Screen reader expectations** — required names, roles, state announcements
3. **Focus management** — rules for overlays, menus, dialogs, inline editing
4. **Designer specs** — what designers must document: labels, helper text, error patterns, empty states
5. **QA checklist** — what must be validated in code review and testing
6. ARIA is allowed only when native HTML cannot do the job — keep it minimal

## When unsure

If a design decision is not documented in `AGENTS.md`, component instructions, or the token file, ask before inventing a default
