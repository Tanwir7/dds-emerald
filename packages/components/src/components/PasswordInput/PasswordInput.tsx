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
}

const toggleSizeClassName: Record<'sm' | 'md', string> = {
  sm: getRequiredClassName(styles, 'toggleButtonSm'),
  md: getRequiredClassName(styles, 'toggleButtonMd'),
};

const resolveToggleSize = (size: InputSize) => (size === 'lg' ? 'md' : 'sm');

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
  ({ size = 'md', invalid = false, showToggleLabel = false, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const toggleSize = resolveToggleSize(size);
    const toggleLabel = visible ? 'Hide password' : 'Show password';

    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        size={size}
        invalid={invalid}
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
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
