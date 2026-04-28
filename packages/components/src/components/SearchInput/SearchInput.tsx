import React from 'react';
import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from '../Input';
import { Spinner } from '../Spinner';
import styles from './SearchInput.module.scss';

export interface SearchInputProps extends Omit<
  InputProps,
  | 'type'
  | 'role'
  | 'startIcon'
  | 'startAdornment'
  | 'endAdornment'
  | 'endAdornmentInteractive'
  | 'endAdornmentWidth'
  | 'endAdornmentClassName'
  | 'endIcon'
  | 'endIconLabel'
  | 'onEndIconClick'
> {
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
}

const toSearchString = (value: InputProps['value'] | InputProps['defaultValue']) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
};

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      size = 'md',
      invalid = false,
      clearable = true,
      onClear,
      loading = false,
      className,
      value,
      defaultValue,
      onChange,
      disabled = false,
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [internalValue, setInternalValue] = React.useState(() => toSearchString(defaultValue));
    const isControlled = value !== undefined;
    const currentValue = isControlled ? toSearchString(value) : internalValue;
    const hasValue = currentValue.length > 0;
    const showClearButton = clearable && hasValue && !disabled && !readOnly;

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(event.currentTarget.value);
      }

      onChange?.(event);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }

      onClear?.();
      inputRef.current?.focus();
    };

    return (
      <Input
        {...props}
        ref={inputRef}
        value={currentValue}
        type="search"
        role="searchbox"
        size={size}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
        className={clsx(styles.root, className)}
        startAdornment={
          loading ? (
            <Spinner className={styles.spinner} size="sm" label="Searching…" />
          ) : (
            <span className={styles.searchAdornment} aria-hidden="true">
              <Search />
            </span>
          )
        }
        endAdornmentInteractive
        endAdornment={
          showClearButton ? (
            <button
              type="button"
              aria-label="Clear search"
              className={styles.clearButton}
              onClick={handleClear}
            >
              <span className={styles.clearIcon} aria-hidden="true">
                <X />
              </span>
            </button>
          ) : undefined
        }
        onChange={handleChange}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
