import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { CheckboxField } from '../../components/CheckboxField';
import { Container } from '../../components/Container';
import { DatePicker } from '../../components/DatePicker';
import { Field } from '../../components/Field';
import { Fieldset } from '../../components/Fieldset';
import { Grid, GridItem } from '../../components/Grid';
import { Heading } from '../../components/Heading';
import { Input } from '../../components/Input';
import { Link } from '../../components/Link';
import { PasswordInput } from '../../components/PasswordInput';
import { SelectItem } from '../../components/Select';
import { SelectField } from '../../components/SelectField';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import styles from './SignupForm.stories.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { storySource, storySourceParameters } from '../../utils/storySource';

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

const COUNTRIES = [
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'in', label: 'India' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
] as const;

const validateForm = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (!/^[a-zA-Z\s'-]+$/.test(values.fullName.trim())) {
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

const createInlineAlert = (message?: string) =>
  message
    ? {
        intent: 'danger' as const,
        children: message,
      }
    : undefined;

const classNames = {
  formCard: getRequiredClassName(styles, 'formCard'),
  formHeader: getRequiredClassName(styles, 'formHeader'),
  formSubtitle: getRequiredClassName(styles, 'formSubtitle'),
  sectionStack: getRequiredClassName(styles, 'sectionStack'),
  selectField: getRequiredClassName(styles, 'selectField'),
  submitButton: getRequiredClassName(styles, 'submitButton'),
  successCard: getRequiredClassName(styles, 'successCard'),
  successMessage: getRequiredClassName(styles, 'successMessage'),
  successState: getRequiredClassName(styles, 'successState'),
} as const;

const signupFormSource = storySource(
  '<form noValidate aria-label="Create your account" onSubmit={handleSubmit}>',
  '  <Stack gap="lg">',
  '    <Field',
  '      label="Full name"',
  '      required',
  '      helper="Enter your first and last name."',
  '      inlineAlert={errors.fullName ? { intent: "danger", children: errors.fullName } : undefined}',
  '    >',
  '      <Input',
  '        name="fullName"',
  '        autoComplete="name"',
  '        placeholder="Jane Smith"',
  '        value={values.fullName}',
  '        onChange={(event) => handleChange("fullName", event.target.value)}',
  '        onBlur={() => handleBlur("fullName")}',
  '        invalid={Boolean(errors.fullName)}',
  '      />',
  '    </Field>',
  '',
  '    <DatePicker',
  '      label="Date of birth"',
  '      name="dateOfBirth"',
  '      required',
  '      value={values.dateOfBirth}',
  '      onChange={(date) => handleChange("dateOfBirth", date)}',
  '      hint="You must be at least 13 years old."',
  '      error={errors.dateOfBirth}',
  '      captionLayout="dropdown"',
  '      fromYear={currentYear - 120}',
  '      toYear={currentYear - 13}',
  '      maxDate={new Date()}',
  '    />',
  '',
  '    <Field',
  '      label="Password"',
  '      required',
  '      helper="Min 8 characters with uppercase, lowercase, number, and special character."',
  '      inlineAlert={errors.password ? { intent: "danger", children: errors.password } : undefined}',
  '    >',
  '      <PasswordInput',
  '        name="password"',
  '        autoComplete="new-password"',
  '        value={values.password}',
  '        onChange={(event) => handleChange("password", event.target.value)}',
  '        onBlur={() => handleBlur("password")}',
  '        invalid={Boolean(errors.password)}',
  '        showToggleLabel',
  '        showPasswordStrength',
  '      />',
  '    </Field>',
  '',
  '    <CheckboxField',
  '      label={<>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link></>}',
  '      required',
  '      checked={values.terms}',
  '      onCheckedChange={(checked) => handleChange("terms", Boolean(checked))}',
  '      inlineAlert={errors.terms ? { intent: "danger", children: errors.terms } : undefined}',
  '    />',
  '',
  '    <Button type="submit" variant="primary" size="lg">Create account</Button>',
  '  </Stack>',
  '</form>'
);

const stopLabelLinkToggle = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.stopPropagation();
};

const getInitialValues = (): FormValues => ({
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

const currentYear = new Date().getFullYear();

const SignupFormPattern = ({
  simulateSubmitFailure = false,
}: {
  simulateSubmitFailure?: boolean;
}) => {
  const [values, setValues] = React.useState<FormValues>(getInitialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const alertRef = React.useRef<HTMLDivElement>(null);
  const dateFieldRef = React.useRef<HTMLDivElement>(null);
  const countryFieldRef = React.useRef<HTMLDivElement>(null);

  const dateOfBirthFromYear = currentYear - 120;
  const dateOfBirthToYear = currentYear - 13;
  React.useEffect(() => {
    if (submitError) {
      alertRef.current?.focus();
    }
  }, [submitError]);

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((currentTouched) => {
      const nextTouched = { ...currentTouched, [field]: true };
      const nextErrors = validateForm(values);

      setErrors((currentErrors) => ({ ...currentErrors, [field]: nextErrors[field] }));

      return nextTouched;
    });
  };

  const handleChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((currentValues) => {
      const nextValues = { ...currentValues, [field]: value };

      if (touched[field as keyof FormTouched]) {
        const nextErrors = validateForm(nextValues);
        setErrors((currentErrors) => ({
          ...currentErrors,
          [field]: nextErrors[field as keyof FormErrors],
          ...(field === 'password' ? { confirmPassword: nextErrors.confirmPassword } : {}),
        }));
      }

      return nextValues;
    });

    if (field === 'terms' && submitError) {
      setSubmitError(null);
    }
  };

  const focusFirstInvalidField = (formErrors: FormErrors) => {
    const focusOrder: Array<[keyof FormErrors, string, () => HTMLElement | null]> = [
      ['fullName', 'signup-full-name', () => document.getElementById('signup-full-name')],
      ['email', 'signup-email', () => document.getElementById('signup-email')],
      ['phone', 'signup-phone', () => document.getElementById('signup-phone')],
      [
        'dateOfBirth',
        'signup-date-of-birth',
        () => dateFieldRef.current?.querySelector('button[id="signup-date-of-birth"]') ?? null,
      ],
      [
        'country',
        'signup-country',
        () => countryFieldRef.current?.querySelector('button[id="signup-country"]') ?? null,
      ],
      ['password', 'signup-password', () => document.getElementById('signup-password')],
      [
        'confirmPassword',
        'signup-confirm-password',
        () => document.getElementById('signup-confirm-password'),
      ],
      ['terms', 'signup-terms', () => document.getElementById('signup-terms')],
    ];

    const target = focusOrder.find(([fieldName]) => Boolean(formErrors[fieldName]))?.[2]();
    target?.focus();
  };

  const handleDateFieldBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (dateFieldRef.current?.contains(event.relatedTarget as Node | null)) {
      return;
    }

    handleBlur('dateOfBirth');
  };

  const handleCountryFieldBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (countryFieldRef.current?.contains(event.relatedTarget as Node | null)) {
      return;
    }

    handleBlur('country');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTouched: FormTouched = {
      fullName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      country: true,
      password: true,
      confirmPassword: true,
      terms: true,
    };

    setTouched(nextTouched);
    setSubmitError(null);

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1200);
    });

    setIsSubmitting(false);

    if (simulateSubmitFailure) {
      setSubmitError('We could not create your account. Check your connection and try again.');
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Container
        background="card"
        border
        borderRadius="none"
        className={classNames.successCard}
        padding="lg"
      >
        <Stack className={classNames.successState} gap="md">
          <Alert align="start" intent="success" title="Account created">
            Check your email to verify your account before signing in.
          </Alert>
          <Text className={classNames.successMessage} color="muted">
            Welcome aboard. Your registration details were accepted and a verification email is on
            the way.
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container
      background="card"
      border
      borderRadius="none"
      className={classNames.formCard}
      padding="lg"
    >
      <form aria-label="Create your account" noValidate onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Stack className={classNames.formHeader} gap="sm">
            <Heading as="h1" size="4xl">
              Create your account
            </Heading>
            <Text as="p" className={classNames.formSubtitle} color="muted" size="sm">
              Already have an account? <Link href="/login">Sign in</Link>
            </Text>
          </Stack>

          {submitError ? (
            <Alert
              ref={alertRef}
              align="start"
              intent="danger"
              tabIndex={-1}
              title="We couldn't complete your signup"
            >
              {submitError}
            </Alert>
          ) : null}

          <Fieldset legend="Personal details">
            <Stack className={classNames.sectionStack} gap="md">
              <Grid columns={{ default: 1, md: 2 }} gap="md">
                <GridItem>
                  <Field
                    helper="Enter your first and last name."
                    inlineAlert={touched.fullName ? createInlineAlert(errors.fullName) : undefined}
                    label="Full name"
                    required
                  >
                    <Input
                      autoComplete="name"
                      id="signup-full-name"
                      name="fullName"
                      onBlur={() => handleBlur('fullName')}
                      onChange={(event) => handleChange('fullName', event.target.value)}
                      placeholder="Jane Smith"
                      value={values.fullName}
                      {...(touched.fullName && errors.fullName ? { invalid: true } : {})}
                    />
                  </Field>
                </GridItem>

                <GridItem>
                  <Field
                    inlineAlert={touched.email ? createInlineAlert(errors.email) : undefined}
                    label="Email address"
                    required
                  >
                    <Input
                      autoComplete="email"
                      id="signup-email"
                      inputMode="email"
                      name="email"
                      onBlur={() => handleBlur('email')}
                      onChange={(event) => handleChange('email', event.target.value)}
                      placeholder="jane@example.com"
                      type="email"
                      value={values.email}
                      {...(touched.email && errors.email ? { invalid: true } : {})}
                    />
                  </Field>
                </GridItem>

                <GridItem>
                  <Field
                    helper="Optional. Include country code if available."
                    inlineAlert={touched.phone ? createInlineAlert(errors.phone) : undefined}
                    label="Phone number"
                  >
                    {/* PhoneInput does not exist in Emerald yet, so this pattern uses Input as the documented fallback. */}
                    <Input
                      autoComplete="tel"
                      id="signup-phone"
                      inputMode="tel"
                      name="phone"
                      onBlur={() => handleBlur('phone')}
                      onChange={(event) => handleChange('phone', event.target.value)}
                      pattern="^\+?[\d\s\-().]{7,15}$"
                      placeholder="+1 555 000 0000"
                      type="tel"
                      value={values.phone}
                      {...(touched.phone && errors.phone ? { invalid: true } : {})}
                    />
                  </Field>
                </GridItem>

                <GridItem>
                  <div ref={dateFieldRef} className={styles.dateField} onBlur={handleDateFieldBlur}>
                    <DatePicker
                      captionLayout="dropdown"
                      hint="You must be at least 13 years old."
                      fromYear={dateOfBirthFromYear}
                      id="signup-date-of-birth"
                      label="Date of birth"
                      maxDate={new Date()}
                      name="dateOfBirth"
                      onChange={(date) => handleChange('dateOfBirth', date)}
                      required
                      toYear={dateOfBirthToYear}
                      value={values.dateOfBirth}
                      {...(touched.dateOfBirth && errors.dateOfBirth
                        ? { error: errors.dateOfBirth }
                        : {})}
                    />
                  </div>
                </GridItem>
              </Grid>

              <SelectField
                ref={countryFieldRef}
                className={classNames.selectField}
                helper="Choose the country tied to your account profile."
                id="signup-country"
                label="Country"
                name="country"
                onBlur={handleCountryFieldBlur}
                onValueChange={(value) => handleChange('country', value)}
                placeholder="Select your country"
                required
                value={values.country}
                {...(touched.country && errors.country
                  ? { inlineAlert: { intent: 'danger' as const, children: errors.country } }
                  : {})}
                {...(touched.country && errors.country ? { invalid: true } : {})}
              >
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectField>
            </Stack>
          </Fieldset>

          <Fieldset legend="Account security">
            <Stack className={classNames.sectionStack} gap="md">
              <Field
                helper="Min 8 characters with uppercase, lowercase, number, and special character."
                inlineAlert={touched.password ? createInlineAlert(errors.password) : undefined}
                label="Password"
                required
              >
                <PasswordInput
                  autoComplete="new-password"
                  id="signup-password"
                  name="password"
                  onBlur={() => handleBlur('password')}
                  onChange={(event) => handleChange('password', event.target.value)}
                  showPasswordStrength
                  showToggleLabel
                  value={values.password}
                  {...(touched.password && errors.password ? { invalid: true } : {})}
                />
              </Field>

              <Field
                inlineAlert={
                  touched.confirmPassword ? createInlineAlert(errors.confirmPassword) : undefined
                }
                label="Confirm password"
                required
              >
                <PasswordInput
                  autoComplete="new-password"
                  id="signup-confirm-password"
                  name="confirmPassword"
                  onBlur={() => handleBlur('confirmPassword')}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  showToggleLabel
                  value={values.confirmPassword}
                  {...(touched.confirmPassword && errors.confirmPassword ? { invalid: true } : {})}
                />
              </Field>
            </Stack>
          </Fieldset>

          <Fieldset legend="Agreements">
            <Stack className={classNames.sectionStack} gap="md">
              <CheckboxField
                checked={values.terms}
                helper="You must accept these terms before creating an account."
                id="signup-terms"
                label={
                  <>
                    I agree to the{' '}
                    <Link href="/terms" onClick={stopLabelLinkToggle}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" onClick={stopLabelLinkToggle}>
                      Privacy Policy
                    </Link>
                  </>
                }
                onBlur={() => handleBlur('terms')}
                onCheckedChange={(checked) => handleChange('terms', Boolean(checked))}
                required
                {...(touched.terms && errors.terms
                  ? {
                      inlineAlert: {
                        intent: 'danger' as const,
                        children: errors.terms,
                      },
                    }
                  : {})}
              />

              <CheckboxField
                checked={values.marketing}
                helper="You can unsubscribe from these updates at any time."
                id="signup-marketing"
                label="Send me product updates, tips, and occasional promotions"
                onCheckedChange={(checked) => handleChange('marketing', Boolean(checked))}
              />
            </Stack>
          </Fieldset>

          <div className={styles.submitArea}>
            <Button
              className={classNames.submitButton}
              disabled={isSubmitting}
              loading={isSubmitting}
              size="lg"
              type="submit"
              variant="primary"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </Stack>
      </form>
    </Container>
  );
};

const meta: Meta = {
  title: 'App Patterns/SignupForm',
  parameters: {
    a11y: {
      context: `.${styles.storyA11yScope}`,
    },
    docs: {
      description: {
        component:
          'SignupForm is a story-only pattern that composes existing Emerald form primitives into an enterprise registration flow with field-level validation, password guidance, and a submission-level alert.',
      },
      source: {
        code: signupFormSource,
        type: 'code',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyShell}>
        <SignupFormPattern />
      </div>
    </div>
  ),
  parameters: storySourceParameters(signupFormSource),
};

export const SubmissionFailure: Story = {
  render: () => (
    <div className={styles.storyA11yScope}>
      <div className={styles.storyShell}>
        <SignupFormPattern simulateSubmitFailure />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'This variant demonstrates the top-level danger alert used for async submission failures while field-level validation continues to use inline alerts.',
      },
    },
  },
};
