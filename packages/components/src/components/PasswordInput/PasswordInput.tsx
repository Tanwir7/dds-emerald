import React from 'react';
import clsx from 'clsx';
import { Input, type InputProps, type InputSize } from '../Input';
import styles from './PasswordInput.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export interface PasswordInputProps extends Omit<
  InputProps,
  | 'type'
  | 'endAdornment'
  | 'endAdornmentInteractive'
  | 'endAdornmentWidth'
  | 'endAdornmentClassName'
  | 'endIcon'
  | 'endIconLabel'
  | 'onEndIconClick'
> {
  showToggleLabel?: boolean;
  showPasswordStrength?: boolean;
}

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

const toggleSizeClassName: Record<'sm' | 'md', string> = {
  sm: getRequiredClassName(styles, 'toggleButtonSm'),
  md: getRequiredClassName(styles, 'toggleButtonMd'),
};

const resolveToggleSize = (size: InputSize) => (size === 'lg' ? 'md' : 'sm');

const strengthLabels: Record<PasswordStrength, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const getPasswordStrength = (password: string): PasswordStrength => {
  if (password.length === 0) {
    return 0;
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return score as PasswordStrength;
};

const EyeIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="100%"
    height="100%"
  >
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    focusable="false"
    width="100%"
    height="100%"
  >
    <path d="M2 2l12 12M6.5 6.5A2 2 0 0 0 9.5 9.5" strokeLinecap="round" />
    <path
      d="M4.5 4.5C2.8 5.6 1.5 7.5 1.5 8s2.5 5 6.5 5c1.2 0 2.3-.3 3.2-.8M7 3.1c.3 0 .7-.1 1-.1 4 0 6.5 4.5 6.5 5 0 .3-.4 1-1.1 1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      size = 'md',
      invalid = false,
      showToggleLabel = false,
      showPasswordStrength = false,
      className,
      value,
      defaultValue,
      onChange,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
      typeof defaultValue === 'string' ? defaultValue : ''
    );
    const strengthId = React.useId();
    const toggleSize = resolveToggleSize(size);
    const toggleLabel = visible ? 'Hide password' : 'Show password';
    const currentValue = typeof value === 'string' ? value : uncontrolledValue;
    const strength =
      currentValue.length > 0
        ? (Math.max(getPasswordStrength(currentValue), 1) as PasswordStrength)
        : 0;
    const showStrength = showPasswordStrength && strength > 0;
    const strengthLabel = strengthLabels[strength];
    const describedBy = [ariaDescribedBy, showStrength ? strengthId : undefined]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.field}>
        <Input
          {...props}
          ref={ref}
          aria-describedby={describedBy || undefined}
          type={visible ? 'text' : 'password'}
          size={size}
          invalid={invalid}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => {
            if (typeof value !== 'string') {
              setUncontrolledValue(event.currentTarget.value);
            }

            onChange?.(event);
          }}
          className={clsx(styles.root, className)}
          endAdornmentInteractive
          endAdornmentWidth={showToggleLabel ? 'wide' : 'default'}
          endAdornment={
            <button
              type="button"
              aria-label={toggleLabel}
              className={clsx(styles.toggleButton, toggleSizeClassName[toggleSize])}
              onClick={() => setVisible((currentVisible) => !currentVisible)}
            >
              <span className={styles.toggleIcon}>{visible ? <EyeOffIcon /> : <EyeIcon />}</span>
              {showToggleLabel ? (
                <span className={styles.toggleLabel}>{visible ? 'Hide' : 'Show'}</span>
              ) : null}
            </button>
          }
        />
        {showStrength ? (
          <div className={styles.strengthBlock}>
            <div className={styles.strengthMeter}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    aria-hidden="true"
                    className={clsx(
                      styles.strengthBar,
                      strength >= level && strength === 4 && styles.strengthBarActiveSuccess,
                      strength >= level && strength === 3 && styles.strengthBarActiveInfo,
                      strength >= level && strength === 2 && styles.strengthBarActiveWarning,
                      strength >= level && strength === 1 && styles.strengthBarActiveDanger
                    )}
                    data-active={strength >= level ? 'true' : 'false'}
                    data-password-strength-bar="true"
                  />
                ))}
              </div>
              <span
                className={clsx(
                  styles.strengthLabel,
                  strength === 4 && styles.strengthLabelSuccess,
                  strength === 3 && styles.strengthLabelInfo,
                  strength === 2 && styles.strengthLabelWarning,
                  strength === 1 && styles.strengthLabelDanger
                )}
              >
                Password strength: {strengthLabel}
              </span>
            </div>
            <span aria-live="polite" className={styles.srOnly} id={strengthId}>
              Password strength: {strengthLabel}
            </span>
          </div>
        ) : null}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
