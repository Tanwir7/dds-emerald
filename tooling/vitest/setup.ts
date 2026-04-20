import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

expect.extend(toHaveNoViolations);
