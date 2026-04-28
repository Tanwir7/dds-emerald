import clsx from 'clsx';
import React from 'react';
import styles from './PinInput.module.scss';

export type PinInputType = 'numeric' | 'alphanumeric';
export type PinInputSize = 'sm' | 'md' | 'lg';

export interface PinInputProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue' | 'onChange'
> {
  length?: number;
  type?: PinInputType;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  size?: PinInputSize;
  invalid?: boolean;
  disabled?: boolean;
  mask?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

const DEFAULT_LENGTH = 6;

const getNormalizedLength = (length: number | undefined) =>
  Math.max(1, Math.floor(length ?? DEFAULT_LENGTH));

const getDefaultPlaceholder = (type: PinInputType) => (type === 'numeric' ? '○' : '·');

const normalizeCharacter = (value: string, type: PinInputType) => {
  if (value.length === 0) {
    return '';
  }

  const firstCharacter = value.charAt(0);

  if (type === 'numeric') {
    return /^[0-9]$/.test(firstCharacter) ? firstCharacter : '';
  }

  return /^[a-z0-9]$/i.test(firstCharacter) ? firstCharacter : '';
};

const normalizeValue = (value: string, type: PinInputType, length: number) => {
  const characters = value
    .split('')
    .map((character) => normalizeCharacter(character, type))
    .filter(Boolean)
    .slice(0, length);

  return Array.from({ length }, (_, index) => characters[index] ?? '');
};

export const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      length: lengthProp = DEFAULT_LENGTH,
      type = 'numeric',
      value,
      defaultValue,
      onChange,
      onComplete,
      size = 'md',
      invalid = false,
      disabled = false,
      mask = false,
      placeholder,
      id,
      className,
      'aria-label': ariaLabel = 'PIN input',
      ...props
    },
    ref
  ) => {
    const length = getNormalizedLength(lengthProp);
    const isControlled = value !== undefined;
    const [internalSlots, setInternalSlots] = React.useState<string[]>(() =>
      normalizeValue(value ?? defaultValue ?? '', type, length)
    );
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const slots = isControlled ? normalizeValue(value ?? '', type, length) : internalSlots;
    const resolvedPlaceholder = placeholder ?? getDefaultPlaceholder(type);

    React.useEffect(() => {
      if (!isControlled) {
        setInternalSlots((currentSlots) => {
          const currentValue = currentSlots.join('');
          return normalizeValue(currentValue, type, length);
        });
      }
    }, [isControlled, length, type]);

    React.useEffect(() => {
      setActiveIndex((currentIndex) => Math.min(currentIndex, length - 1));
    }, [length]);

    const focusSlot = (index: number) => {
      const nextIndex = Math.min(Math.max(index, 0), length - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      inputRefs.current[nextIndex]?.select();
    };

    const commitSlots = (nextSlots: string[]) => {
      if (!isControlled) {
        setInternalSlots(nextSlots);
      }

      const fullValue = nextSlots.join('');
      onChange?.(fullValue);

      if (nextSlots.every((slot) => slot.length === 1)) {
        onComplete?.(fullValue);
      }
    };

    const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextCharacter = normalizeCharacter(event.currentTarget.value, type);
      const nextSlots = [...slots] as string[];
      nextSlots[index] = nextCharacter;

      commitSlots(nextSlots);

      if (nextCharacter && index < length - 1) {
        focusSlot(index + 1);
      }
    };

    const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace') {
        event.preventDefault();

        const nextSlots = [...slots];

        if (nextSlots[index]) {
          nextSlots[index] = '';
          commitSlots(nextSlots);
          focusSlot(index);
          return;
        }

        if (index > 0) {
          nextSlots[index - 1] = '';
          commitSlots(nextSlots);
          focusSlot(index - 1);
        }

        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();

        if (index > 0) {
          focusSlot(index - 1);
        }

        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();

        if (index < length - 1) {
          focusSlot(index + 1);
        }
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      const pastedCharacters = event.clipboardData
        .getData('text')
        .split('')
        .map((character) => normalizeCharacter(character, type))
        .filter(Boolean);

      if (pastedCharacters.length === 0) {
        return;
      }

      const activeIndex = inputRefs.current.findIndex((input) => input === document.activeElement);
      const startIndex = activeIndex >= 0 ? activeIndex : 0;
      const nextSlots = [...slots];
      let lastFilledIndex = startIndex;

      for (let index = startIndex; index < length; index += 1) {
        const pastedCharacter = pastedCharacters[index - startIndex];

        if (!pastedCharacter) {
          break;
        }

        nextSlots[index] = pastedCharacter;
        lastFilledIndex = index;
      }

      commitSlots(nextSlots);

      if (lastFilledIndex < length - 1 && nextSlots[lastFilledIndex + 1] === '') {
        focusSlot(lastFilledIndex + 1);
        return;
      }

      focusSlot(lastFilledIndex);
    };

    return (
      <div
        {...props}
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={clsx(styles.root, className)}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            id={id ? (index === 0 ? id : `${id}-${index}`) : undefined}
            type={mask ? 'password' : type === 'numeric' ? 'tel' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            pattern={type === 'numeric' ? '[0-9]*' : undefined}
            maxLength={1}
            value={slots[index]}
            placeholder={resolvedPlaceholder}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            tabIndex={index === activeIndex ? 0 : -1}
            aria-label={`PIN digit ${index + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            onFocus={() => {
              setActiveIndex(index);
            }}
            className={clsx(
              styles.slot,
              styles[size],
              invalid && styles.invalid,
              disabled && styles.disabled
            )}
          />
        ))}
      </div>
    );
  }
);
PinInput.displayName = 'PinInput';
