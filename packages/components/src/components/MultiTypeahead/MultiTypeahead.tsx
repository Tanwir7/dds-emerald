import React from 'react';
import clsx from 'clsx';
import { Spinner } from '../Spinner';
import { Tag } from '../Tag';
import styles from './MultiTypeahead.module.scss';

export interface MultiTypeaheadSuggestion {
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
  | 'className'
  | 'name'
  | 'id'
  | 'disabled'
  | 'placeholder'
>;

export interface MultiTypeaheadProps extends NativeInputProps {
  suggestions: MultiTypeaheadSuggestion[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  onInputChange?: (query: string) => void;
  maxItems?: number;
  allowCustomValues?: boolean;
  size?: 'sm' | 'md';
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
  items: Array<MultiTypeaheadSuggestion & { index: number }>;
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
  suggestions: MultiTypeaheadSuggestion[],
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

export const MultiTypeahead = React.forwardRef<HTMLDivElement, MultiTypeaheadProps>(
  (
    {
      suggestions,
      value,
      defaultValue,
      onChange,
      onInputChange,
      maxItems,
      allowCustomValues = false,
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
    const [selectedValues, setSelectedValues] = React.useState(defaultValue ?? []);
    const [inputValue, setInputValue] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const blurTimeoutRef = React.useRef<number | null>(null);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const listboxId = `${inputId}-listbox`;
    const currentSelected = React.useMemo(
      () => (isControlled ? (value ?? []) : selectedValues),
      [isControlled, selectedValues, value]
    );
    const canAddMoreItems = maxItems === undefined || currentSelected.length < maxItems;
    const inputAriaLabel =
      inputProps['aria-label'] ??
      (inputProps['aria-labelledby'] ? undefined : (placeholder ?? 'Add value'));

    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    React.useEffect(
      () => () => {
        if (blurTimeoutRef.current !== null) {
          window.clearTimeout(blurTimeoutRef.current);
        }
      },
      []
    );

    const availableSuggestions = React.useMemo(() => {
      const unselectedSuggestions = suggestions.filter(
        (suggestion) => !currentSelected.includes(suggestion.value)
      );

      if (onInputChange) {
        return unselectedSuggestions.slice(0, 8);
      }

      const normalizedQuery = inputValue.trim().toLowerCase();

      return unselectedSuggestions
        .filter((suggestion) => {
          if (!normalizedQuery) {
            return true;
          }

          const optionText = (suggestion.label ?? suggestion.value).toLowerCase();
          const optionValue = suggestion.value.toLowerCase();

          return optionText.includes(normalizedQuery) || optionValue.includes(normalizedQuery);
        })
        .slice(0, 8);
    }, [currentSelected, inputValue, onInputChange, suggestions]);

    const groupedSuggestions = React.useMemo(() => {
      const groups = new Map<string, GroupedSuggestion>();
      const orderedGroups: GroupedSuggestion[] = [];

      availableSuggestions.forEach((suggestion, index) => {
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
    }, [availableSuggestions]);

    const shouldRenderList =
      open &&
      !disabled &&
      canAddMoreItems &&
      inputValue.trim().length > 0 &&
      (loading || availableSuggestions.length > 0 || emptyMessage.length > 0);

    const closeList = React.useCallback(() => {
      setOpen(false);
      setActiveIndex(-1);
    }, []);

    const focusInput = React.useCallback(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, []);

    const syncSelectedValues = React.useCallback(
      (nextValues: string[]) => {
        if (!isControlled) {
          setSelectedValues(nextValues);
        }

        onChange?.(nextValues);
      },
      [isControlled, onChange]
    );

    const clearQuery = React.useCallback(() => {
      setInputValue('');
      setActiveIndex(-1);
      setOpen(false);
      onInputChange?.('');
    }, [onInputChange]);

    const handleSelect = React.useCallback(
      (suggestion: MultiTypeaheadSuggestion) => {
        if (suggestion.disabled || currentSelected.includes(suggestion.value)) {
          return;
        }

        syncSelectedValues([...currentSelected, suggestion.value]);
        clearQuery();
        focusInput();
      },
      [clearQuery, currentSelected, focusInput, syncSelectedValues]
    );

    const handleRemove = React.useCallback(
      (targetValue: string) => {
        syncSelectedValues(currentSelected.filter((valueItem) => valueItem !== targetValue));
        focusInput();
      },
      [currentSelected, focusInput, syncSelectedValues]
    );

    const handleAddCustomValue = React.useCallback(
      (customValue: string) => {
        const normalizedValue = customValue.trim();

        if (!normalizedValue || currentSelected.includes(normalizedValue)) {
          return;
        }

        handleSelect({ value: normalizedValue, label: normalizedValue });
      },
      [currentSelected, handleSelect]
    );

    const openList = React.useCallback(() => {
      if (!disabled && canAddMoreItems && inputValue.trim().length > 0) {
        setOpen(true);
      }
    }, [canAddMoreItems, disabled, inputValue]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;

      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      setInputValue(nextValue);
      setActiveIndex(-1);
      setOpen(!disabled && canAddMoreItems && nextValue.trim().length > 0);
      onInputChange?.(nextValue);
    };

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      openList();
      onFocus?.(event);
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      blurTimeoutRef.current = window.setTimeout(() => {
        closeList();
      }, BLUR_CLOSE_DELAY_MS);
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      if (event.key === 'Backspace' && inputValue === '') {
        event.preventDefault();

        if (currentSelected.length > 0) {
          handleRemove(currentSelected[currentSelected.length - 1] as string);
        }

        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeList();
        return;
      }

      if (!shouldRenderList) {
        if (event.key === 'ArrowDown' && inputValue.trim().length > 0) {
          event.preventDefault();
          setOpen(true);
          setActiveIndex(getNextEnabledIndex(availableSuggestions, 0, 1));
        }

        if (
          event.key === 'Enter' &&
          allowCustomValues &&
          inputValue.trim() &&
          activeIndex === -1 &&
          canAddMoreItems
        ) {
          event.preventDefault();
          handleAddCustomValue(inputValue);
        }

        return;
      }

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex =
            activeIndex < 0
              ? getNextEnabledIndex(availableSuggestions, 0, 1)
              : getNextEnabledIndex(availableSuggestions, activeIndex + 1, 1);
          setActiveIndex(nextIndex === -1 ? activeIndex : nextIndex);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();

          if (activeIndex <= 0) {
            setActiveIndex(-1);
            break;
          }

          setActiveIndex(getNextEnabledIndex(availableSuggestions, activeIndex - 1, -1));
          break;
        }
        case 'Enter':
          if (activeIndex >= 0) {
            const activeSuggestion = availableSuggestions[activeIndex];

            if (activeSuggestion && !activeSuggestion.disabled) {
              event.preventDefault();
              handleSelect(activeSuggestion);
            }
          } else if (allowCustomValues && inputValue.trim() && canAddMoreItems) {
            event.preventDefault();
            handleAddCustomValue(inputValue);
          }
          break;
        case 'Tab':
          closeList();
          break;
        default:
          break;
      }
    };

    return (
      <div
        ref={rootRef}
        className={clsx(
          styles.root,
          styles[size],
          invalid && styles.invalid,
          disabled && styles.disabled,
          className
        )}
        role="group"
        aria-label="Selected values"
      >
        {name
          ? currentSelected.map((selectedValue) => (
              <input key={selectedValue} type="hidden" name={`${name}[]`} value={selectedValue} />
            ))
          : null}
        {currentSelected.map((selectedValue) => {
          const suggestion = suggestions.find((item) => item.value === selectedValue);

          return (
            <Tag
              key={selectedValue}
              size={size === 'md' ? 'md' : 'sm'}
              removable={!disabled}
              onRemove={() => handleRemove(selectedValue)}
              disabled={disabled}
            >
              {suggestion?.label ?? selectedValue}
            </Tag>
          );
        })}
        {canAddMoreItems ? (
          <input
            {...inputProps}
            ref={inputRef}
            id={inputId}
            type="text"
            value={inputValue}
            disabled={disabled}
            placeholder={currentSelected.length === 0 ? placeholder : undefined}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={shouldRenderList}
            aria-haspopup="listbox"
            aria-controls={shouldRenderList ? listboxId : undefined}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
            aria-label={inputAriaLabel}
            className={styles.input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        ) : null}
        {shouldRenderList ? (
          <div
            role="listbox"
            id={listboxId}
            aria-label="Suggestions"
            aria-multiselectable="false"
            className={styles.listbox}
          >
            {loading && availableSuggestions.length === 0 ? (
              <div className={styles.emptyState}>
                <Spinner size="sm" label="Loading..." />
              </div>
            ) : null}
            {!loading && availableSuggestions.length === 0 ? (
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

                  return (
                    <div
                      key={suggestion.value}
                      id={`${listboxId}-${suggestion.index}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected="false"
                      aria-disabled={suggestion.disabled || undefined}
                      className={clsx(
                        styles.option,
                        isActive && styles.optionActive,
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
                        {highlightMatch ? renderHighlighted(optionText, inputValue) : optionText}
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

MultiTypeahead.displayName = 'MultiTypeahead';
