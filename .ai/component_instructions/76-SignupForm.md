# SignupForm — Registration Pattern

## Story-only UI pattern · no scaffolding required

---

## AGENT TASK: Read `AGENTS.md` and `packages/tokens/src/tokens.css` first.

This is a **story-only pattern** — no new component is scaffolded. There is no `SignupForm.tsx` component. Instead, this pattern lives entirely in a Storybook stories file that demonstrates how to compose existing DDS components into a complete, production-ready registration form.

**The primary deliverable is copyable, reusable JSX code inside a Storybook story.** Consumers read the story source, copy it, and adapt it to their application.

### File location

```
packages/components/src/patterns/SignupForm/
  SignupForm.stories.tsx
  SignupForm.stories.module.scss   ← layout/demo styles only — NEVER ships in runtime bundle
```

Create the `patterns/` directory if it does not exist. Pattern files are never imported by `packages/components/src/index.ts`.

---

## Before writing any code — verify these components exist

Read the implementation of each before writing the story. The story must use components exactly as they are implemented — do not invent prop names.

```
packages/components/src/components/Input/
packages/components/src/components/Field/           (label + input + error + hint wrapper)
packages/components/src/components/Button/
packages/components/src/components/Checkbox/
packages/components/src/components/CheckboxField/
packages/components/src/components/Select/          (or native <select> if Select doesn't exist)
packages/components/src/components/DatePicker/
packages/components/src/components/PhoneInput/      (may not exist — see fallback below)
```

**If `PhoneInput` does not exist:** use a standard `Input` with `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`, and a `pattern` attribute. Document the fallback in a story comment.

**If `DatePicker` does not exist:** use `Input` with `type="date"` and document the fallback.

**If `Select` does not exist:** use a native `<select>` styled with a wrapper `<div className={styles.selectWrapper}>` and document the fallback.

**If `Field` does not exist:** compose label + input + error paragraph manually and document it.

---

## Purpose

`SignupForm` is a reference pattern demonstrating how to compose DDS form components into a full registration flow. It is the canonical example of:

- Multi-field form layout with responsive grid
- Blur + submit validation with correct ARIA error wiring
- Password strength meter
- Show/hide password toggle
- Accessible checkbox groups (terms + marketing opt-in)
- Date of birth input
- Country selector
- Form-level error summary region
- Focus management on validation failure
- Screen reader announcement of errors

---

## Form fields (in tab order)

1. **Full name** — `type="text"`, `autoComplete="name"`, required
2. **Email address** — `type="email"`, `autoComplete="email"`, required
3. **Phone number** — `type="tel"`, `autoComplete="tel"`, optional
4. **Date of birth** — `DatePicker` or `Input type="date"`, `autoComplete="bday"`, required
5. **Country** — `Select` or native `<select>`, `autoComplete="country-name"`, required
6. **Password** — `type="password"`, `autoComplete="new-password"`, required + strength meter
7. **Confirm password** — `type="password"`, `autoComplete="new-password"`, required
8. **Terms and conditions** — `Checkbox` / `CheckboxField`, required
9. **Marketing emails** — `Checkbox` / `CheckboxField`, optional
10. **Submit button** — `<Button type="submit" variant="primary">`

---

## Validation rules

### Per-field rules (blur + submit)

| Field            | Rules                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Full name        | Required. Min 2 characters. No special characters except hyphen and apostrophe.                 |
| Email            | Required. Must match email pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).                            |
| Phone            | Optional. If provided, must match E.164-style or local format (7–15 digits, optional + prefix). |
| Date of birth    | Required. Must be a valid date. User must be at least 13 years old.                             |
| Country          | Required. Must select a value (not the placeholder option).                                     |
| Password         | Required. Min 8 chars. Must contain: 1 uppercase, 1 lowercase, 1 number, 1 special char.        |
| Confirm password | Required. Must exactly match password field value.                                              |
| Terms            | Required. Must be checked.                                                                      |
| Marketing        | Optional. No validation.                                                                        |

### Password strength scoring

Calculate strength on every keystroke in the password field. Score 0–4:

```ts
const getPasswordStrength = (password: string): 0 | 1 | 2 | 3 | 4 => {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
};

const strengthLabels: Record<number, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const strengthColors: Record<number, string> = {
  0: 'transparent',
  1: 'var(--dds-color-status-danger)',
  2: 'var(--dds-color-status-warning)',
  3: 'var(--dds-color-status-info)',
  4: 'var(--dds-color-status-success)',
};
```

### Validation state shape

```ts
interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  country: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  marketing: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

interface FormTouched {
  fullName?: boolean;
  email?: boolean;
  phone?: boolean;
  dateOfBirth?: boolean;
  country?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
  terms?: boolean;
}
```

### Validate function

```ts
const validateForm = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (!/^[a-zA-Z\s'\-]+$/.test(values.fullName.trim())) {
    errors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  }

  if (!values.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (values.phone && !/^\+?[\d\s\-().]{7,15}$/.test(values.phone)) {
    errors.phone = 'Enter a valid phone number';
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const today = new Date();
    const minAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    if (values.dateOfBirth > minAge) {
      errors.dateOfBirth = 'You must be at least 13 years old to register';
    }
  }

  if (!values.country) {
    errors.country = 'Please select your country';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(values.password)) {
    errors.password =
      'Password must contain an uppercase letter, lowercase letter, number, and special character';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!values.terms) {
    errors.terms = 'You must accept the terms and conditions to continue';
  }

  return errors;
};
```

---

## Form state management

Use `React.useState` and `React.useReducer` — no form library (Formik, React Hook Form, etc.). The pattern should be self-contained and copyable without additional dependencies.

```ts
// Inside the story render function:
const [values, setValues] = React.useState<FormValues>({
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: null,
  country: '',
  password: '',
  confirmPassword: '',
  terms: false,
  marketing: false,
});

const [errors, setErrors] = React.useState<FormErrors>({});
const [touched, setTouched] = React.useState<FormTouched>({});
const [isSubmitting, setIsSubmitting] = React.useState(false);
const [isSubmitted, setIsSubmitted] = React.useState(false);
const [showPassword, setShowPassword] = React.useState(false);
const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
const [passwordStrength, setPasswordStrength] = React.useState<0 | 1 | 2 | 3 | 4>(0);

// Error summary ref — for focus management on failed submit
const errorSummaryRef = React.useRef<HTMLDivElement>(null);

// Blur handler — validate single field
const handleBlur = (field: keyof FormTouched) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
  const fieldErrors = validateForm(values);
  setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
};

// Change handler
const handleChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
  setValues((prev) => ({ ...prev, [field]: value }));
  // Clear error for field when user starts correcting it
  if (touched[field as keyof FormTouched]) {
    const newValues = { ...values, [field]: value };
    const fieldErrors = validateForm(newValues);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field as keyof FormErrors] }));
  }
  // Update password strength live
  if (field === 'password') {
    setPasswordStrength(getPasswordStrength(value as string));
  }
};

// Submit handler
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Mark all fields as touched
  const allTouched: FormTouched = {
    fullName: true,
    email: true,
    phone: true,
    dateOfBirth: true,
    country: true,
    password: true,
    confirmPassword: true,
    terms: true,
  };
  setTouched(allTouched);

  const formErrors = validateForm(values);
  setErrors(formErrors);

  const hasErrors = Object.keys(formErrors).length > 0;

  if (hasErrors) {
    // Move focus to error summary so screen readers announce it
    errorSummaryRef.current?.focus();
    return;
  }

  setIsSubmitting(true);
  // Simulate async submission
  await new Promise((resolve) => setTimeout(resolve, 1500));
  setIsSubmitting(false);
  setIsSubmitted(true);
};
```

---

## Form structure and JSX

```tsx
// Story render — the complete form JSX

if (isSubmitted) {
  return (
    <div className={styles.successState} role="status" aria-live="polite">
      <CheckCircle2 className={styles.successIcon} aria-hidden="true" />
      <h2 className={styles.successTitle}>Account created!</h2>
      <p className={styles.successDescription}>
        Welcome aboard. Check your email to verify your account.
      </p>
    </div>
  );
}

const visibleErrors = Object.entries(errors).filter(([, v]) => v);

return (
  <div className={styles.formWrapper}>
    <form
      onSubmit={handleSubmit}
      noValidate // disable browser native validation — we handle it
      aria-label="Create your account"
      className={styles.form}
    >
      {/* ── Form heading ─────────────────────────────────────────────── */}
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Create your account</h1>
        <p className={styles.formSubtitle}>
          Already have an account?{' '}
          <a href="/login" className={styles.formLink}>
            Sign in
          </a>
        </p>
      </div>

      {/* ── Error summary ─────────────────────────────────────────────── */}
      {visibleErrors.length > 0 && (
        <div
          ref={errorSummaryRef}
          className={styles.errorSummary}
          role="alert"
          aria-labelledby="error-summary-title"
          tabIndex={-1}
        >
          <h2 id="error-summary-title" className={styles.errorSummaryTitle}>
            There {visibleErrors.length === 1 ? 'is' : 'are'} {visibleErrors.length}{' '}
            {visibleErrors.length === 1 ? 'error' : 'errors'} in this form
          </h2>
          <ul className={styles.errorSummaryList}>
            {visibleErrors.map(([field, message]) => (
              <li key={field}>
                <a
                  href={`#field-${field}`}
                  className={styles.errorSummaryLink}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`field-${field}`)?.focus();
                  }}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Section: Personal details ─────────────────────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldsetLegend}>Personal details</legend>

        {/* Full name */}
        <Field
          label="Full name"
          htmlFor="field-fullName"
          required
          error={touched.fullName ? errors.fullName : undefined}
          hint="Enter your first and last name"
        >
          <Input
            id="field-fullName"
            type="text"
            name="fullName"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            aria-required="true"
            aria-invalid={touched.fullName && !!errors.fullName}
            aria-describedby={
              [touched.fullName && errors.fullName && 'field-fullName-error', 'field-fullName-hint']
                .filter(Boolean)
                .join(' ') || undefined
            }
            placeholder="Jane Smith"
          />
        </Field>

        {/* Email */}
        <Field
          label="Email address"
          htmlFor="field-email"
          required
          error={touched.email ? errors.email : undefined}
        >
          <Input
            id="field-email"
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-required="true"
            aria-invalid={touched.email && !!errors.email}
            inputMode="email"
            placeholder="jane@example.com"
          />
        </Field>

        {/* Phone */}
        <Field
          label="Phone number"
          htmlFor="field-phone"
          error={touched.phone ? errors.phone : undefined}
          hint="Optional. Include country code, e.g. +44 7700 900000"
        >
          <Input
            id="field-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            aria-invalid={touched.phone && !!errors.phone}
            placeholder="+1 555 000 0000"
          />
        </Field>

        {/* Date of birth */}
        <Field
          label="Date of birth"
          htmlFor="field-dateOfBirth"
          required
          error={touched.dateOfBirth ? errors.dateOfBirth : undefined}
          hint="You must be at least 13 years old"
        >
          <DatePicker
            id="field-dateOfBirth"
            name="dateOfBirth"
            value={values.dateOfBirth}
            onChange={(date) => {
              handleChange('dateOfBirth', date);
              if (touched.dateOfBirth) {
                const e = validateForm({ ...values, dateOfBirth: date });
                setErrors((prev) => ({ ...prev, dateOfBirth: e.dateOfBirth }));
              }
            }}
            maxDate={new Date()}
            error={touched.dateOfBirth ? errors.dateOfBirth : undefined}
            aria-required="true"
          />
        </Field>

        {/* Country */}
        <Field
          label="Country"
          htmlFor="field-country"
          required
          error={touched.country ? errors.country : undefined}
        >
          <Select
            id="field-country"
            name="country"
            value={values.country}
            onValueChange={(val) => {
              handleChange('country', val);
              setTouched((prev) => ({ ...prev, country: true }));
            }}
            aria-required="true"
            aria-invalid={touched.country && !!errors.country}
            placeholder="Select your country"
          >
            {COUNTRIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </Select>
        </Field>
      </fieldset>

      {/* ── Section: Account security ─────────────────────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldsetLegend}>Account security</legend>

        {/* Password */}
        <Field
          label="Password"
          htmlFor="field-password"
          required
          error={touched.password ? errors.password : undefined}
          hint="Min 8 characters with uppercase, lowercase, number, and special character"
        >
          {/* Input wrapper for show/hide toggle */}
          <div className={styles.passwordWrapper}>
            <Input
              id="field-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              aria-required="true"
              aria-invalid={touched.password && !!errors.password}
              aria-describedby={
                [
                  'password-strength-description',
                  touched.password && errors.password && 'field-password-error',
                  'field-password-hint',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              className={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className={styles.showHideButton}
            >
              {showPassword ? (
                <EyeOff className={styles.showHideIcon} aria-hidden="true" />
              ) : (
                <Eye className={styles.showHideIcon} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Password strength meter */}
          {values.password.length > 0 && (
            <div className={styles.strengthMeter} aria-hidden="true">
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={clsx(
                      styles.strengthBar,
                      passwordStrength >= level && styles.strengthBarFilled
                    )}
                    style={
                      passwordStrength >= level
                        ? ({
                            backgroundColor: strengthColors[passwordStrength],
                          } as React.CSSProperties)
                        : undefined
                    }
                  />
                ))}
              </div>
              <span
                className={styles.strengthLabel}
                style={{ color: strengthColors[passwordStrength] } as React.CSSProperties}
              >
                {strengthLabels[passwordStrength]}
              </span>
            </div>
          )}
          {/* Screen reader description of strength — separate from visual meter */}
          <span id="password-strength-description" className={styles.srOnly}>
            {values.password.length > 0
              ? `Password strength: ${strengthLabels[passwordStrength] || 'none'}`
              : 'Enter a password to see its strength'}
          </span>
        </Field>

        {/* Confirm password */}
        <Field
          label="Confirm password"
          htmlFor="field-confirmPassword"
          required
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        >
          <div className={styles.passwordWrapper}>
            <Input
              id="field-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              aria-required="true"
              aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
              className={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              aria-pressed={showConfirmPassword}
              className={styles.showHideButton}
            >
              {showConfirmPassword ? (
                <EyeOff className={styles.showHideIcon} aria-hidden="true" />
              ) : (
                <Eye className={styles.showHideIcon} aria-hidden="true" />
              )}
            </button>
          </div>
        </Field>
      </fieldset>

      {/* ── Section: Agreements ───────────────────────────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldsetLegend}>Agreements</legend>

        {/* Terms and conditions */}
        <CheckboxField
          id="field-terms"
          label={
            <>
              I agree to the{' '}
              <a
                href="/terms"
                className={styles.formLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
                <span className={styles.srOnly}> (opens in new tab)</span>
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className={styles.formLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
                <span className={styles.srOnly}> (opens in new tab)</span>
              </a>
            </>
          }
          checked={values.terms}
          onCheckedChange={(checked) => {
            handleChange('terms', !!checked);
            if (touched.terms) {
              const e = validateForm({ ...values, terms: !!checked });
              setErrors((prev) => ({ ...prev, terms: e.terms }));
            }
          }}
          onBlur={() => handleBlur('terms')}
          error={touched.terms ? errors.terms : undefined}
          required
          aria-required="true"
          aria-invalid={touched.terms && !!errors.terms}
        />

        {/* Marketing opt-in */}
        <CheckboxField
          id="field-marketing"
          label="Send me product updates, tips, and occasional promotions"
          hint="You can unsubscribe at any time"
          checked={values.marketing}
          onCheckedChange={(checked) => handleChange('marketing', !!checked)}
        />
      </fieldset>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className={styles.submitArea}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
          className={styles.submitButton}
          aria-describedby={visibleErrors.length > 0 ? 'error-summary-title' : undefined}
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </div>
    </form>
  </div>
);
```

---

## SCSS — SignupForm.stories.module.scss

These styles are for Storybook layout and demo presentation ONLY. They must never be imported by runtime component files.

```scss
// SignupForm.stories.module.scss
// DEMO STYLES ONLY — never import this from runtime component code

@use '../../../../styles/mixins' as *; // adjust path to repo structure

// ─── Form wrapper ─────────────────────────────────────────────────────────────

.formWrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: var(--dds-space-8) var(--dds-space-4);
  background-color: var(--dds-color-bg-default);
}

.form {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-6);
}

// ─── Form header ──────────────────────────────────────────────────────────────

.formHeader {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
}

.formTitle {
  font-family: var(--dds-font-display);
  font-size: var(--dds-font-size-2xl);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  margin: 0;
  line-height: var(--dds-line-height-tight);
}

.formSubtitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  margin: 0;
}

.formLink {
  color: var(--dds-color-action-primary);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    text-decoration: none;
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── Error summary ────────────────────────────────────────────────────────────

.errorSummary {
  padding: var(--dds-space-4);
  background-color: oklch(from var(--dds-color-status-danger) l c h / 0.06);
  border: 1px solid var(--dds-color-status-danger);
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-2);

  // Focus ring when focus is programmatically moved here after failed submit
  &:focus {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.errorSummaryTitle {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-status-danger);
  margin: 0;
}

.errorSummaryList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-1);
}

.errorSummaryLink {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-status-danger);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    text-decoration: none;
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

// ─── Fieldset ────────────────────────────────────────────────────────────────

.fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--dds-space-4);
  border: none;
  padding: 0;
  margin: 0;
}

.fieldsetLegend {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dds-tracking-wider);
  padding: 0;
  margin-bottom: var(--dds-space-1);
  float: left; // float trick: legend renders inline, fieldset gap handles spacing
  width: 100%;
}

// ─── Password wrapper (input + show/hide toggle) ──────────────────────────────

.passwordWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.passwordInput {
  flex: 1 1 0;
  padding-right: var(--dds-space-10) !important; // room for the toggle button
}

.showHideButton {
  position: absolute;
  right: var(--dds-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--dds-radius-none);
  color: var(--dds-color-text-muted);
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: var(--dds-color-text-default);
  }

  &:focus-visible {
    outline: 3px solid oklch(from var(--dds-color-focus-ring) l c h / 0.5);
    outline-offset: 2px;
  }
}

.showHideIcon {
  width: var(--dds-icon-size-md);
  height: var(--dds-icon-size-md);
}

// ─── Password strength meter ──────────────────────────────────────────────────

.strengthMeter {
  display: flex;
  align-items: center;
  gap: var(--dds-space-2);
  margin-top: var(--dds-space-1-5);
}

.strengthBars {
  display: flex;
  gap: var(--dds-space-1);
  flex: 1 1 0;
}

.strengthBar {
  height: 4px;
  flex: 1 1 0;
  background-color: var(--dds-color-border-default);
  transition: background-color var(--dds-duration-fast) var(--dds-ease-standard);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.strengthBarFilled {
  // backgroundColor set via inline style (dynamic colour — documented exception)
}

.strengthLabel {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-xs);
  font-weight: var(--dds-font-weight-semibold);
  min-width: 40px;
  text-align: right;
  // color set via inline style (dynamic — documented exception)
}

// ─── Submit area ─────────────────────────────────────────────────────────────

.submitArea {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--dds-space-3);
}

.submitButton {
  width: 100%;
}

// ─── Success state ────────────────────────────────────────────────────────────

.successState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dds-space-3);
  padding: var(--dds-space-12) var(--dds-space-6);
  text-align: center;
  min-height: 320px;
}

.successIcon {
  width: 48px;
  height: 48px;
  color: var(--dds-color-status-success);
}

.successTitle {
  font-family: var(--dds-font-display);
  font-size: var(--dds-font-size-xl);
  font-weight: var(--dds-font-weight-semibold);
  color: var(--dds-color-text-default);
  margin: 0;
}

.successDescription {
  font-family: var(--dds-font-sans);
  font-size: var(--dds-font-size-sm);
  color: var(--dds-color-text-muted);
  margin: 0;
  max-width: 320px;
}

// ─── Screen reader only ───────────────────────────────────────────────────────

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Country list

Define a `COUNTRIES` constant at the top of the story file. Include at minimum 30 countries covering all major regions. Use ISO 3166-1 alpha-2 codes as values:

```ts
const COUNTRIES = [
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CA', label: 'Canada' },
  { value: 'CN', label: 'China' },
  { value: 'EG', label: 'Egypt' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'MX', label: 'Mexico' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NO', label: 'Norway' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'KR', label: 'South Korea' },
  { value: 'ES', label: 'Spain' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Turkey' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'VN', label: 'Vietnam' },
];
```

---

## Storybook stories — `SignupForm.stories.tsx`

```ts
import type { Meta, StoryObj } from '@storybook/react';
// No component to import — the story IS the pattern
```

Title: `App Patterns/SignupForm`

### Story file structure

The story file must be structured so the JSX is maximally readable and copyable. Add the following comment block at the top:

```ts
/**
 * SignupForm — Registration Pattern
 *
 * This is a story-only pattern. There is no <SignupForm /> component to import.
 * Copy the JSX from this story and adapt it to your application.
 *
 * Components used:
 *   - Field (form field wrapper)
 *   - Input
 *   - Button
 *   - Checkbox / CheckboxField
 *   - Select / SelectItem
 *   - DatePicker
 *
 * Key accessibility features implemented:
 *   - Error summary with focus management on failed submit
 *   - Per-field inline errors with aria-invalid + aria-describedby
 *   - Fieldset + legend grouping for related fields
 *   - Password strength meter with screen-reader announcement
 *   - Show/hide password toggle with aria-pressed
 *   - noValidate on form — custom validation replaces browser defaults
 *   - autoComplete attributes for all fields
 *   - Accessible external links with "(opens in new tab)" sr-only text
 *   - Success state with role="status" announcement
 */
```

### Named story exports

- `Default` — Full form, empty, unsubmitted. The canonical copy source.

- `WithValidationErrors` — Pre-populate `touched` with all fields and inject errors for every field via `play()`. Shows all inline errors simultaneously plus error summary. This is the "everything broken" state. Use `play()`:

```ts
play: async ({ canvasElement }) => {
  const submitBtn = within(canvasElement).getByRole('button', { name: /create account/i });
  await userEvent.click(submitBtn);
  // All fields now touched + errors visible + error summary focused
  const errorSummary = within(document.body).getByRole('alert');
  await expect(errorSummary).toBeVisible();
  await expect(document.activeElement).toBe(errorSummary);
};
```

- `PasswordStrengthDemo` — Pre-fill the password field with a weak password (`"hello"`) using `play()`. Demonstrates the strength meter in action:

```ts
play: async ({ canvasElement }) => {
  const passwordInput = within(canvasElement).getByLabelText(/^password$/i);
  await userEvent.type(passwordInput, 'hello');
  // Strength meter shows "Weak"
  await userEvent.clear(passwordInput);
  await userEvent.type(passwordInput, 'Hello1!');
  // Strength meter shows "Good"
  await userEvent.clear(passwordInput);
  await userEvent.type(passwordInput, 'Hello1!x');
  // Strength meter shows "Strong"
};
```

- `ShowHidePasswordDemo` — `play()` clicks the show/hide toggle and verifies input type change:

```ts
play: async ({ canvasElement }) => {
  const passwordInput = within(canvasElement).getByLabelText(/^password$/i);
  await expect(passwordInput).toHaveAttribute('type', 'password');
  const toggleBtn = within(canvasElement).getByRole('button', { name: /show password/i });
  await userEvent.click(toggleBtn);
  await expect(passwordInput).toHaveAttribute('type', 'text');
  await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(toggleBtn);
  await expect(passwordInput).toHaveAttribute('type', 'password');
};
```

- `SuccessState` — Pre-set `isSubmitted=true` state to show the success screen. Use `play()` to simulate a successful submission:

```ts
play: async ({ canvasElement }) => {
  // Fill all fields with valid data programmatically
  await userEvent.type(within(canvasElement).getByLabelText(/full name/i), 'Jane Smith');
  await userEvent.type(within(canvasElement).getByLabelText(/email/i), 'jane@example.com');
  // ... remaining fields
  const submitBtn = within(canvasElement).getByRole('button', { name: /create account/i });
  await userEvent.click(submitBtn);
  // Success state should appear
  await expect(within(canvasElement).getByRole('status')).toBeVisible();
};
```

- `MobileViewport` — Same as `Default` but with `parameters.viewport.defaultViewport = 'mobile1'` in story parameters. Verifies the form is fully functional and readable on a 375px wide viewport.

- `DarkMode` — Same as `Default` but with `parameters.backgrounds.default = 'dark'` if Storybook backgrounds addon is configured.

- `PreFilledValid` — All fields pre-populated with valid values. Submit button should succeed immediately. Useful for copying a complete data shape.

---

## Accessibility contract

### Error announcement strategy — two-tier

**Tier 1 — Inline errors (blur validation):**

- Error message rendered below the field via the `Field` component's `error` prop.
- Field gets `aria-invalid="true"` and `aria-describedby` pointing to the error message id.
- Screen readers announce: "[Field label], [field value], invalid entry, [error message]" when re-focusing the field.

**Tier 2 — Error summary (submit validation):**

- On failed submit, ALL errors are shown and focus moves to the error summary `<div>`.
- Error summary: `role="alert"` (announces immediately) + `tabIndex={-1}` (programmatically focusable).
- Contains a heading with error count: "There are 3 errors in this form".
- Each error is a link that, when clicked/activated, moves focus to the offending field.
- Screen readers announce the full summary when focus arrives.

**Why both?** Inline errors on blur give early feedback without overwhelming the user. The summary on submit ensures users who Tab through the form without triggering blur validators (e.g. using Tab to navigate without editing) still see all errors at once.

### Password strength meter

- The visual meter (`aria-hidden="true"`) uses colour + bar count — never colour alone.
- A separate `<span id="password-strength-description" className={styles.srOnly}>` provides the screen reader description.
- This span is referenced by `aria-describedby` on the password input.
- Announced as: "Password strength: Good" when the user re-focuses the field.
- The live strength text does NOT use `aria-live` — that would announce on every keystroke and become noise. The `aria-describedby` pattern announces when the user re-focuses, which is the appropriate moment.

### fieldset / legend grouping

- "Personal details" fieldset groups name, email, phone, DOB, country.
- "Account security" fieldset groups password fields.
- "Agreements" fieldset groups both checkboxes.
- Screen readers announce: "Personal details, group" when entering each section.
- `<legend>` text is spoken before each field: "Personal details, Full name, required, edit text".

### autoComplete attributes

Every field has an appropriate `autoComplete` value:

| Field            | `autoComplete`   |
| ---------------- | ---------------- |
| Full name        | `"name"`         |
| Email            | `"email"`        |
| Phone            | `"tel"`          |
| Date of birth    | `"bday"`         |
| Country          | `"country-name"` |
| Password         | `"new-password"` |
| Confirm password | `"new-password"` |

`"new-password"` on both password fields prevents browser password managers from auto-filling a saved password into a registration form.

### noValidate

`noValidate` on the `<form>` disables all browser-native validation UI (Chrome's red outlines, Safari's popups). DDS validation replaces this entirely. Without `noValidate`, browser validation and DDS validation can conflict and produce duplicate or inconsistent announcements.

### Show/hide password

- Toggle button: `aria-pressed={showPassword}` — announces "Show password, toggle button, pressed/not pressed".
- `aria-label` changes: `"Show password"` / `"Hide password"`.
- When password is visible (`type="text"`), password managers and autocomplete may attempt to fill it — `autoComplete="new-password"` prevents this.

### External links in terms

- `target="_blank"` links include `<span className={styles.srOnly}> (opens in new tab)</span>` appended inside the link text.
- This satisfies WCAG 2.4.4 Link Purpose (In Context) — screen reader users know the link will open a new tab before activating it.

### Keyboard interactions

| Element             | Key             | Behaviour                                 |
| ------------------- | --------------- | ----------------------------------------- |
| All inputs          | `Tab`           | Moves to next field in tab order          |
| All inputs          | `Shift+Tab`     | Moves to previous field                   |
| Checkboxes          | `Space`         | Toggles checked state                     |
| Show/hide toggle    | `Enter`/`Space` | Toggles password visibility               |
| Error summary links | `Enter`         | Moves focus to the errored field          |
| Submit button       | `Enter`/`Space` | Submits form / triggers validation        |
| Submit button       | `Enter` on form | Also submits (native HTML form behaviour) |

### Target sizes

All interactive elements meet WCAG 2.2 AA Target Size (Minimum) — 24×24 CSS pixels minimum. Show/hide buttons are explicitly 32×32px. Checkboxes use the `CheckboxField` component which specifies minimum sizing in its own accessibility contract.

---

## Responsive layout

The form is single-column on all breakpoints. Max-width `560px` centred on wider screens. No grid layout is used — fields stack vertically. This is intentional:

- Single-column forms have higher completion rates than multi-column layouts.
- Single-column avoids the ambiguous tab order problems of multi-column forms.
- At 375px (iPhone SE) the form is fully functional — all fields, error messages, and the submit button are visible without horizontal scrolling.

No responsive SCSS breakpoints are needed in the story styles — the `max-width: 560px` and `padding: var(--dds-space-8) var(--dds-space-4)` handle all viewport sizes.

---

## Definition of done

- [ ] Story file created at `packages/components/src/patterns/SignupForm/SignupForm.stories.tsx`
- [ ] Story styles at `packages/components/src/patterns/SignupForm/SignupForm.stories.module.scss`
- [ ] Story styles file is NEVER imported from any runtime component file
- [ ] All component dependencies verified against their actual implementations before use
- [ ] Missing component fallbacks documented in story file comments
- [ ] Storybook builds without error: `pnpm build-storybook`
- [ ] All six named stories render correctly
- [ ] `play()` functions pass in Storybook test runner
- [ ] Error summary receives focus on failed submit — verified in `WithValidationErrors` play()
- [ ] Error summary links move focus to offending fields — verified
- [ ] `aria-invalid` set on fields with errors — verified
- [ ] `aria-describedby` on each field wires to error and hint ids
- [ ] Password strength meter uses colour + bar count — not colour alone
- [ ] Screen reader password strength description is separate from visual meter
- [ ] Show/hide toggle has `aria-pressed` and descriptive `aria-label`
- [ ] Both password fields use `autoComplete="new-password"`
- [ ] `noValidate` on `<form>` element
- [ ] `<fieldset>` + `<legend>` grouping for all three sections
- [ ] Terms checkbox links have `(opens in new tab)` visually-hidden text
- [ ] Country list contains at least 30 countries across all major regions
- [ ] Form is fully functional at 375px viewport width
- [ ] Success state uses `role="status"` for screen reader announcement
- [ ] Storybook title: `App Patterns/SignupForm`
- [ ] Story header comment block present explaining this is a story-only pattern
- [ ] No new component exported from `packages/components/src/index.ts`
