import clsx from 'clsx';
import React from 'react';
import styles from './List.module.scss';

export type ListSize = 'sm' | 'md' | 'lg';
export type ListElement = 'ul' | 'ol' | 'div';
export type ListItemElement = 'li' | 'div';
export type SelectableListSelectionMode = 'single' | 'multiple';
export type SelectableListOrientation = 'vertical' | 'horizontal';

type ListContextValue = {
  size: ListSize;
  flush: boolean;
};

const ListContext = React.createContext<ListContextValue>({
  size: 'md',
  flush: false,
});

type SelectableListItemRegistration = {
  value: string;
  disabled: boolean;
};

type SelectableListContextValue = {
  activeValue: string | null;
  dividers: boolean;
  flush: boolean;
  itemRefs: React.MutableRefObject<Map<string, HTMLLIElement>>;
  onSelect: (value: string) => void;
  registerItem: (item: SelectableListItemRegistration) => void;
  selectionMode: SelectableListSelectionMode;
  selectedValues: string[];
  setActiveValue: React.Dispatch<React.SetStateAction<string | null>>;
  unregisterItem: (value: string) => void;
};

const SelectableListContext = React.createContext<SelectableListContextValue | null>(null);

const normalizeSingleValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
};

const normalizeMultipleValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

const assignRef = <T,>(ref: React.ForwardedRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
};

export interface ListProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ListElement;
  size?: ListSize;
  dividers?: boolean;
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ListItemElement;
  startSlot?: React.ReactNode;
  endSlot?: React.ReactNode;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  size?: ListSize;
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface SelectableListProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'onChange'
> {
  selectionMode?: SelectableListSelectionMode;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  size?: ListSize;
  dividers?: boolean;
  flush?: boolean;
  orientation?: SelectableListOrientation;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  children: React.ReactNode;
}

export interface SelectableListItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'children'
> {
  value: string;
  startSlot?: React.ReactNode;
  endSlot?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const List = React.forwardRef<
  HTMLUListElement | HTMLOListElement | HTMLDivElement,
  ListProps
>(
  (
    {
      as: Component = 'ul',
      size = 'md',
      dividers = false,
      flush = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo(
      () => ({
        size,
        flush,
      }),
      [flush, size]
    );

    const sharedProps = {
      className: clsx(
        styles.list,
        styles[size],
        dividers && styles.dividers,
        flush && styles.flush,
        className
      ),
      ...props,
    };

    let content: React.ReactElement;

    if (Component === 'ol') {
      content = (
        <ol ref={ref as React.ForwardedRef<HTMLOListElement>} {...sharedProps}>
          {children}
        </ol>
      );
    } else if (Component === 'div') {
      content = (
        <div ref={ref as React.ForwardedRef<HTMLDivElement>} {...sharedProps}>
          {children}
        </div>
      );
    } else {
      content = (
        <ul ref={ref as React.ForwardedRef<HTMLUListElement>} {...sharedProps}>
          {children}
        </ul>
      );
    }

    return <ListContext.Provider value={contextValue}>{content}</ListContext.Provider>;
  }
);

List.displayName = 'List';

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      as: Component = 'li',
      startSlot,
      endSlot,
      description,
      selected = false,
      disabled = false,
      size,
      flush,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const listContext = React.useContext(ListContext);
    const resolvedSize = size ?? listContext.size;
    const resolvedFlush = flush ?? listContext.flush;

    const content = (
      <>
        {startSlot ? <span className={styles.startSlot}>{startSlot}</span> : null}
        <span className={styles.content}>
          <span className={styles.label}>{children}</span>
          {description ? <span className={styles.description}>{description}</span> : null}
        </span>
        {endSlot ? <span className={styles.endSlot}>{endSlot}</span> : null}
      </>
    );

    const sharedProps = {
      className: clsx(
        styles.item,
        styles[resolvedSize],
        selected && styles.selected,
        disabled && styles.itemDisabled,
        onClick && styles.clickable,
        resolvedFlush && styles.flush,
        className
      ),
      onClick: disabled ? undefined : onClick,
      'aria-disabled': disabled ? true : undefined,
      ...props,
    };

    if (Component === 'div') {
      return (
        <div ref={ref as React.ForwardedRef<HTMLDivElement>} {...sharedProps}>
          {content}
        </div>
      );
    }

    return (
      <li ref={ref} {...sharedProps}>
        {content}
      </li>
    );
  }
);

ListItem.displayName = 'ListItem';

export const SelectableList = React.forwardRef<HTMLUListElement, SelectableListProps>(
  (
    {
      selectionMode = 'single',
      value,
      defaultValue,
      onChange,
      size = 'md',
      dividers = false,
      flush = false,
      orientation = 'vertical',
      className,
      children,
      onKeyDown,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const [uncontrolledSingleValue, setUncontrolledSingleValue] = React.useState(() =>
      normalizeSingleValue(defaultValue)
    );
    const [uncontrolledMultipleValue, setUncontrolledMultipleValue] = React.useState(() =>
      normalizeMultipleValue(defaultValue)
    );
    const [activeValue, setActiveValue] = React.useState<string | null>(null);
    const [items, setItems] = React.useState<SelectableListItemRegistration[]>([]);
    const itemRefs = React.useRef(new Map<string, HTMLLIElement>());

    const selectedValues =
      selectionMode === 'multiple'
        ? value !== undefined
          ? normalizeMultipleValue(value)
          : uncontrolledMultipleValue
        : normalizeSingleValue(value !== undefined ? value : uncontrolledSingleValue)
            .split(',')
            .filter(Boolean);

    const enabledValues = React.useMemo(
      () => items.filter((item) => !item.disabled).map((item) => item.value),
      [items]
    );

    React.useEffect(() => {
      const isDev = typeof process === 'undefined' || process.env.NODE_ENV !== 'production';

      if (isDev && !ariaLabel && !ariaLabelledBy) {
        // eslint-disable-next-line no-console
        console.warn('SelectableList requires either aria-label or aria-labelledby.');
      }
    }, [ariaLabel, ariaLabelledBy]);

    React.useEffect(() => {
      if (enabledValues.length === 0) {
        if (activeValue !== null) {
          setActiveValue(null);
        }

        return;
      }

      if (activeValue && enabledValues.includes(activeValue)) {
        return;
      }

      const nextActiveValue = selectedValues.find((selectedValue) =>
        enabledValues.includes(selectedValue)
      );

      setActiveValue(nextActiveValue ?? enabledValues[0] ?? null);
    }, [activeValue, enabledValues, selectedValues]);

    const registerItem = React.useCallback((item: SelectableListItemRegistration) => {
      setItems((currentItems) => {
        const existingIndex = currentItems.findIndex(
          (currentItem) => currentItem.value === item.value
        );

        if (existingIndex === -1) {
          return [...currentItems, item];
        }

        const nextItems = [...currentItems];
        nextItems[existingIndex] = item;
        return nextItems;
      });
    }, []);

    const unregisterItem = React.useCallback((valueToRemove: string) => {
      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.value !== valueToRemove)
      );
      itemRefs.current.delete(valueToRemove);
    }, []);

    const onSelect = React.useCallback(
      (nextValue: string) => {
        const disabledItem = items.find((item) => item.value === nextValue && item.disabled);

        if (disabledItem) {
          return;
        }

        if (selectionMode === 'multiple') {
          const nextSelectedValues = selectedValues.includes(nextValue)
            ? selectedValues.filter((selectedValue) => selectedValue !== nextValue)
            : [...selectedValues, nextValue];

          if (value === undefined) {
            setUncontrolledMultipleValue(nextSelectedValues);
          }

          onChange?.(nextSelectedValues);
        } else {
          if (value === undefined) {
            setUncontrolledSingleValue(nextValue);
          }

          onChange?.(nextValue);
        }

        setActiveValue(nextValue);
      },
      [items, onChange, selectedValues, selectionMode, value]
    );

    const focusItem = React.useCallback((nextValue: string | undefined) => {
      if (!nextValue) {
        return;
      }

      setActiveValue(nextValue);
      itemRefs.current.get(nextValue)?.focus();
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || enabledValues.length === 0) {
        return;
      }

      const currentIndex = enabledValues.indexOf(activeValue ?? '');

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          event.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, enabledValues.length - 1);
          focusItem(enabledValues[currentIndex === -1 ? 0 : nextIndex]);
          return;
        }
        case 'ArrowUp':
        case 'ArrowLeft': {
          event.preventDefault();
          const previousIndex = Math.max(currentIndex - 1, 0);
          focusItem(enabledValues[currentIndex === -1 ? 0 : previousIndex]);
          return;
        }
        case 'Home':
          event.preventDefault();
          focusItem(enabledValues[0]);
          return;
        case 'End':
          event.preventDefault();
          focusItem(enabledValues[enabledValues.length - 1]);
          return;
        case 'Enter':
        case ' ': {
          event.preventDefault();

          if (activeValue) {
            onSelect(activeValue);
          }

          return;
        }
        default:
          return;
      }
    };

    const contextValue = React.useMemo<SelectableListContextValue>(
      () => ({
        activeValue,
        dividers,
        flush,
        itemRefs,
        onSelect,
        registerItem,
        selectionMode,
        selectedValues,
        setActiveValue,
        unregisterItem,
      }),
      [
        activeValue,
        dividers,
        flush,
        onSelect,
        registerItem,
        selectedValues,
        selectionMode,
        unregisterItem,
      ]
    );

    return (
      <ul
        ref={ref}
        role="listbox"
        aria-multiselectable={selectionMode === 'multiple'}
        aria-orientation={orientation}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={clsx(
          styles.list,
          styles[size],
          dividers && styles.dividers,
          flush && styles.flush,
          styles[orientation],
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <SelectableListContext.Provider value={contextValue}>
          {children}
        </SelectableListContext.Provider>
      </ul>
    );
  }
);

SelectableList.displayName = 'SelectableList';

export const SelectableListItem = React.forwardRef<HTMLLIElement, SelectableListItemProps>(
  (
    {
      value,
      startSlot,
      endSlot,
      description,
      disabled = false,
      className,
      children,
      onClick,
      onFocus,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(SelectableListContext);

    if (!context) {
      throw new Error('SelectableListItem must be used within SelectableList.');
    }

    const {
      activeValue,
      flush,
      itemRefs,
      onSelect,
      registerItem,
      selectionMode,
      selectedValues,
      setActiveValue,
      unregisterItem,
    } = context;

    const isSelected = selectedValues.includes(value);
    const isActive = activeValue === value;

    React.useEffect(() => {
      registerItem({ value, disabled });

      return () => {
        unregisterItem(value);
      };
    }, [disabled, registerItem, unregisterItem, value]);

    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      onSelect(value);
    };

    const handleFocus = (event: React.FocusEvent<HTMLLIElement>) => {
      onFocus?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      setActiveValue(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (event.defaultPrevented || disabled) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(value);
      }
    };

    return (
      <li
        ref={(element) => {
          if (element) {
            itemRefs.current.set(value, element);
          } else {
            itemRefs.current.delete(value);
          }

          assignRef(ref, element as HTMLLIElement);
        }}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled ? true : undefined}
        tabIndex={!disabled && isActive ? 0 : -1}
        className={clsx(
          styles.item,
          isSelected && styles.selected,
          selectionMode === 'multiple' && isSelected && styles.multipleSelected,
          disabled && styles.itemDisabled,
          isActive && styles.active,
          flush && styles.flush,
          className
        )}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {startSlot ? <span className={styles.startSlot}>{startSlot}</span> : null}
        <span className={styles.content}>
          <span className={styles.label}>{children}</span>
          {description ? <span className={styles.description}>{description}</span> : null}
        </span>
        {endSlot ? <span className={styles.endSlot}>{endSlot}</span> : null}
      </li>
    );
  }
);

SelectableListItem.displayName = 'SelectableListItem';
