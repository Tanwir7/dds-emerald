import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import { Icon } from '../Icon';
import styles from './Combobox.module.scss';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onInputChange?: (query: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  name?: string;
  id?: string;
  className?: string;
}

type GroupedOptions = {
  group: string | undefined;
  items: ComboboxOption[];
};

const DEFAULT_PLACEHOLDER = 'Select...';
const DEFAULT_SEARCH_PLACEHOLDER = 'Search...';
const DEFAULT_EMPTY_MESSAGE = 'No results found.';

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      onInputChange,
      placeholder = DEFAULT_PLACEHOLDER,
      searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
      size = 'md',
      invalid = false,
      disabled = false,
      clearable = false,
      loading = false,
      emptyMessage = DEFAULT_EMPTY_MESSAGE,
      name,
      id,
      className,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const generatedId = React.useId();
    const triggerId = id ?? generatedId;
    const listboxId = `${triggerId}-listbox`;
    const searchboxId = `${triggerId}-search`;
    const selectedValue = isControlled ? (value ?? '') : internalValue;
    const selectedOption = options.find((option) => option.value === selectedValue);
    const selectedLabel = selectedOption?.label;

    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    React.useEffect(() => {
      if (open) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
    }, [open]);

    const filteredOptions = React.useMemo(() => {
      if (onInputChange) {
        return options;
      }

      const normalizedQuery = query.trim().toLowerCase();
      if (normalizedQuery.length === 0) {
        return options;
      }

      return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
    }, [onInputChange, options, query]);

    const groupedOptions = React.useMemo(() => {
      const groups = new Map<string, GroupedOptions>();
      const orderedGroups: GroupedOptions[] = [];

      filteredOptions.forEach((option) => {
        const key = option.group ?? '__default__';
        const existingGroup = groups.get(key);

        if (existingGroup) {
          existingGroup.items.push(option);
          return;
        }

        const nextGroup: GroupedOptions = { group: option.group, items: [option] };
        groups.set(key, nextGroup);
        orderedGroups.push(nextGroup);
      });

      return orderedGroups;
    }, [filteredOptions]);

    const closeCombobox = React.useCallback((focusTrigger = false) => {
      setOpen(false);
      setQuery('');

      if (focusTrigger) {
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      }
    }, []);

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }

        onChange?.(nextValue);
      },
      [isControlled, onChange]
    );

    const handleSelect = React.useCallback(
      (nextValue: string) => {
        handleValueChange(nextValue);
        closeCombobox(true);
      },
      [closeCombobox, handleValueChange]
    );

    const getEnabledOptions = React.useCallback(
      () =>
        Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []).filter(
          (element) => element.getAttribute('aria-disabled') !== 'true'
        ),
      []
    );

    const focusNextOption = React.useCallback(
      (current: HTMLElement) => {
        const enabledOptions = getEnabledOptions();
        const currentIndex = enabledOptions.indexOf(current);
        const nextOption = enabledOptions[currentIndex + 1];

        nextOption?.focus();
      },
      [getEnabledOptions]
    );

    const focusPreviousOption = React.useCallback(
      (current: HTMLElement) => {
        const enabledOptions = getEnabledOptions();
        const currentIndex = enabledOptions.indexOf(current);
        const previousOption = enabledOptions[currentIndex - 1];

        if (previousOption) {
          previousOption.focus();
          return;
        }

        searchInputRef.current?.focus();
      },
      [getEnabledOptions]
    );

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        getEnabledOptions()[0]?.focus();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeCombobox(true);
      }

      if (event.key === 'Enter' && filteredOptions.length > 0) {
        event.preventDefault();
        const firstEnabledOption = filteredOptions.find((option) => !option.disabled);

        if (firstEnabledOption) {
          handleSelect(firstEnabledOption.value);
        }
      }
    };

    const handleOptionKeyDown = (
      event: React.KeyboardEvent<HTMLLIElement>,
      option: ComboboxOption
    ) => {
      if (option.disabled) {
        return;
      }

      const currentTarget = event.currentTarget;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusNextOption(currentTarget);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusPreviousOption(currentTarget);
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSelect(option.value);
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeCombobox(true);
      }
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleValueChange('');
      closeCombobox(false);
      setQuery('');
      triggerRef.current?.focus();
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextQuery = event.currentTarget.value;
      setQuery(nextQuery);
      onInputChange?.(nextQuery);
    };

    const hasValue = selectedValue.length > 0;

    return (
      <Popover.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery('');
          }
        }}
      >
        <input type="hidden" name={name} value={selectedValue} />
        <div className={styles.root}>
          <Popover.Trigger asChild>
            <button
              ref={triggerRef}
              type="button"
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-invalid={invalid || undefined}
              aria-label={selectedLabel ?? placeholder}
              disabled={disabled}
              id={triggerId}
              className={clsx(
                styles.trigger,
                styles[size],
                invalid && styles.invalid,
                clearable && hasValue && styles.hasClear,
                className
              )}
            >
              <span className={clsx(styles.triggerText, !selectedLabel && styles.placeholder)}>
                {selectedLabel ?? placeholder}
              </span>
              <span className={styles.triggerActions}>
                <Icon
                  icon={ChevronDown}
                  className={clsx(styles.chevron, open && styles.chevronOpen)}
                  aria-hidden="true"
                />
              </span>
            </button>
          </Popover.Trigger>

          {clearable && hasValue && !disabled ? (
            <button
              type="button"
              className={styles.clearButton}
              aria-label="Clear selection"
              onClick={handleClear}
            >
              <Icon icon={X} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            style={{ width: 'var(--radix-popover-trigger-width)' }}
            className={styles.content}
            aria-label="Combobox options"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={() => {
              closeCombobox(false);
            }}
          >
            <div className={styles.searchWrapper}>
              <Icon
                icon={Search}
                size="sm"
                {...(styles.searchIcon ? { className: styles.searchIcon } : {})}
                aria-hidden="true"
              />
              <input
                id={searchboxId}
                ref={searchInputRef}
                type="text"
                role="searchbox"
                aria-label="Search options"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className={styles.searchInput}
                autoComplete="off"
              />
            </div>

            {loading ? (
              <div className={styles.emptyState} role="status" aria-live="polite">
                <span className={styles.loadingIndicator}>
                  <Icon
                    icon={LoaderCircle}
                    size="sm"
                    {...(styles.spinnerIcon ? { className: styles.spinnerIcon } : {})}
                    aria-hidden="true"
                  />
                  <span>Loading options...</span>
                </span>
              </div>
            ) : null}

            {!loading && filteredOptions.length === 0 ? (
              <div className={styles.emptyState} role="status" aria-live="polite">
                {emptyMessage}
              </div>
            ) : null}

            {!loading && filteredOptions.length > 0 ? (
              <ul
                id={listboxId}
                ref={listRef}
                role="listbox"
                aria-label="Options"
                className={styles.listbox}
              >
                {groupedOptions.map(({ group, items }) => (
                  <React.Fragment key={group ?? '_default'}>
                    {group ? (
                      <li role="presentation" className={styles.groupLabel}>
                        {group}
                      </li>
                    ) : null}
                    {items.map((option) => {
                      const isSelected = option.value === selectedValue;

                      return (
                        <li
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={option.disabled ? 'true' : undefined}
                          tabIndex={option.disabled ? undefined : -1}
                          className={clsx(
                            styles.option,
                            isSelected && styles.optionSelected,
                            option.disabled && styles.optionDisabled
                          )}
                          onClick={() => {
                            if (!option.disabled) {
                              handleSelect(option.value);
                            }
                          }}
                          onMouseDown={(event) => event.preventDefault()}
                          onKeyDown={(event) => handleOptionKeyDown(event, option)}
                        >
                          <span className={styles.optionLabel}>{option.label}</span>
                          {isSelected ? (
                            <Icon
                              icon={Check}
                              size="sm"
                              {...(styles.checkIcon ? { className: styles.checkIcon } : {})}
                              aria-hidden="true"
                            />
                          ) : null}
                        </li>
                      );
                    })}
                  </React.Fragment>
                ))}
              </ul>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);

Combobox.displayName = 'Combobox';
