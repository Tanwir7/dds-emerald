import React from 'react';
import clsx from 'clsx';
import { Input, type InputSize } from '../Input';
import { Spinner } from '../Spinner';
import styles from './Typeahead.module.scss';

export interface TypeaheadSuggestion {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onSelect'
  | 'className'
  | 'name'
  | 'id'
  | 'disabled'
  | 'placeholder'
>;

export interface TypeaheadProps extends NativeInputProps {
  suggestions: TypeaheadSuggestion[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: TypeaheadSuggestion) => void;
  onInputChange?: (query: string) => void;
  minChars?: number;
  maxSuggestions?: number;
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  highlightMatch?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

type GroupedSuggestion = {
  group: string | undefined;
  items: Array<TypeaheadSuggestion & { index: number }>;
};

const DEFAULT_EMPTY_MESSAGE = 'No suggestions';
const BLUR_CLOSE_DELAY_MS = 150;

const renderHighlighted = (text: string, query: string) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const index = text.toLowerCase().indexOf(normalizedQuery.toLowerCase());

  if (index === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <strong className={styles.highlight}>
        {text.slice(index, index + normalizedQuery.length)}
      </strong>
      {text.slice(index + normalizedQuery.length)}
    </>
  );
};

const getNextEnabledIndex = (
  suggestions: TypeaheadSuggestion[],
  startIndex: number,
  direction: 1 | -1
) => {
  let index = startIndex;

  while (index >= 0 && index < suggestions.length) {
    if (!suggestions[index]?.disabled) {
      return index;
    }

    index += direction;
  }

  return -1;
};

export const Typeahead = React.forwardRef<HTMLDivElement, TypeaheadProps>(
  (
    {
      suggestions,
      value,
      defaultValue,
      onChange,
      onSelect,
      onInputChange,
      minChars = 1,
      maxSuggestions = 8,
      size = 'md',
      invalid = false,
      disabled = false,
      loading = false,
      placeholder,
      emptyMessage = DEFAULT_EMPTY_MESSAGE,
      highlightMatch = true,
      id,
      name,
      className,
      onBlur,
      onFocus,
      onKeyDown,
      ...inputProps
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const blurTimeoutRef = React.useRef<number | null>(null);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const listboxId = `${inputId}-listbox`;
    const currentValue = isControlled ? (value ?? '') : internalValue;

    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    React.useEffect(
      () => () => {
        if (blurTimeoutRef.current !== null) {
          window.clearTimeout(blurTimeoutRef.current);
        }
      },
      []
    );

    const displaySuggestions = React.useMemo(() => {
      if (onInputChange) {
        return suggestions.slice(0, maxSuggestions);
      }

      const normalizedValue = currentValue.trim().toLowerCase();

      return suggestions
        .filter((suggestion) => {
          if (!normalizedValue) {
            return true;
          }

          const label = (suggestion.label ?? suggestion.value).toLowerCase();
          const candidateValue = suggestion.value.toLowerCase();

          return label.includes(normalizedValue) || candidateValue.includes(normalizedValue);
        })
        .slice(0, maxSuggestions);
    }, [currentValue, maxSuggestions, onInputChange, suggestions]);

    const groupedSuggestions = React.useMemo(() => {
      const groups = new Map<string, GroupedSuggestion>();
      const orderedGroups: GroupedSuggestion[] = [];

      displaySuggestions.forEach((suggestion, index) => {
        const key = suggestion.group ?? '__default__';
        const existingGroup = groups.get(key);
        const item = { ...suggestion, index };

        if (existingGroup) {
          existingGroup.items.push(item);
          return;
        }

        const nextGroup: GroupedSuggestion = {
          group: suggestion.group,
          items: [item],
        };

        groups.set(key, nextGroup);
        orderedGroups.push(nextGroup);
      });

      return orderedGroups;
    }, [displaySuggestions]);

    const canQuery = currentValue.length >= minChars;
    const shouldRenderList =
      open && canQuery && (loading || displaySuggestions.length > 0 || !disabled);

    const resetActiveIndex = React.useCallback(() => {
      setActiveIndex(-1);
    }, []);

    const closeList = React.useCallback(() => {
      setOpen(false);
      resetActiveIndex();
    }, [resetActiveIndex]);

    const commitValue = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }

        onChange?.(nextValue);
        onInputChange?.(nextValue);
      },
      [isControlled, onChange, onInputChange]
    );

    const handleSelect = React.useCallback(
      (suggestion: TypeaheadSuggestion) => {
        if (suggestion.disabled) {
          return;
        }

        commitValue(suggestion.value);
        onSelect?.(suggestion);
        closeList();
        inputRef.current?.focus();
      },
      [closeList, commitValue, onSelect]
    );

    const openList = React.useCallback(() => {
      if (!disabled && currentValue.length >= minChars) {
        setOpen(true);
      }
    }, [currentValue.length, disabled, minChars]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;

      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
      onInputChange?.(nextValue);
      setActiveIndex(-1);
      setOpen(!disabled && nextValue.length >= minChars);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      if (!shouldRenderList) {
        if (event.key === 'ArrowDown' && currentValue.length >= minChars) {
          event.preventDefault();
          setOpen(true);
          setActiveIndex(getNextEnabledIndex(displaySuggestions, 0, 1));
        }

        if (event.key === 'Escape') {
          closeList();
        }

        return;
      }

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex =
            activeIndex < 0
              ? getNextEnabledIndex(displaySuggestions, 0, 1)
              : getNextEnabledIndex(displaySuggestions, activeIndex + 1, 1);
          setActiveIndex(nextIndex === -1 ? activeIndex : nextIndex);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();

          if (activeIndex <= 0) {
            setActiveIndex(-1);
            break;
          }

          const previousIndex = getNextEnabledIndex(displaySuggestions, activeIndex - 1, -1);
          setActiveIndex(previousIndex);
          break;
        }
        case 'Enter':
          if (activeIndex >= 0) {
            const activeSuggestion = displaySuggestions[activeIndex];

            if (activeSuggestion && !activeSuggestion.disabled) {
              event.preventDefault();
              handleSelect(activeSuggestion);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeList();
          break;
        case 'Tab':
          closeList();
          break;
        default:
          break;
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      openList();
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      blurTimeoutRef.current = window.setTimeout(() => {
        closeList();
      }, BLUR_CLOSE_DELAY_MS);
    };

    return (
      <div ref={rootRef} className={clsx(styles.root, className)}>
        {name ? <input type="hidden" name={name} value={currentValue} /> : null}
        <Input
          {...inputProps}
          ref={inputRef}
          id={inputId}
          value={currentValue}
          size={size}
          invalid={invalid}
          disabled={disabled}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shouldRenderList}
          aria-haspopup="listbox"
          aria-controls={shouldRenderList ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          autoComplete="off"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          endAdornment={
            loading ? (
              <Spinner size="sm" label="Loading suggestions..." data-testid="typeahead-spinner" />
            ) : undefined
          }
        />
        {shouldRenderList ? (
          <div role="listbox" id={listboxId} aria-label="Suggestions" className={styles.listbox}>
            {loading && displaySuggestions.length === 0 ? (
              <div className={styles.emptyState}>
                <Spinner size="sm" label="Loading..." />
              </div>
            ) : null}
            {!loading && displaySuggestions.length === 0 ? (
              <div
                className={styles.emptyState}
                role="option"
                aria-disabled="true"
                aria-selected="false"
              >
                {emptyMessage}
              </div>
            ) : null}
            {groupedSuggestions.map(({ group, items }) => (
              <React.Fragment key={group ?? '__default__'}>
                {group ? (
                  <div role="presentation" className={styles.groupLabel}>
                    {group}
                  </div>
                ) : null}
                {items.map((suggestion) => {
                  const optionText = suggestion.label ?? suggestion.value;
                  const isActive = activeIndex === suggestion.index;
                  const isSelected = suggestion.value === currentValue;

                  return (
                    <div
                      key={suggestion.value}
                      id={`${listboxId}-${suggestion.index}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected={isSelected}
                      aria-disabled={suggestion.disabled || undefined}
                      className={clsx(
                        styles.option,
                        isActive && styles.optionActive,
                        isSelected && styles.optionSelected,
                        suggestion.disabled && styles.optionDisabled
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseUp={() => handleSelect(suggestion)}
                      onMouseEnter={() => {
                        if (!suggestion.disabled) {
                          setActiveIndex(suggestion.index);
                        }
                      }}
                    >
                      <span className={styles.optionLabel}>
                        {highlightMatch ? renderHighlighted(optionText, currentValue) : optionText}
                      </span>
                      {suggestion.description ? (
                        <span className={styles.optionDescription}>{suggestion.description}</span>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

Typeahead.displayName = 'Typeahead';
