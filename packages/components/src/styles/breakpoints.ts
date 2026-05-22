/**
 * Breakpoint pixel values for JS-driven responsive logic (e.g. matchMedia).
 * Mirror of `_breakpoints.scss`; keep both in sync. CSS custom properties
 * cannot be used inside `@media` conditions, so JS reads from here instead.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
