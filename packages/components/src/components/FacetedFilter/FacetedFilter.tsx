import clsx from 'clsx';
import React from 'react';
import { getRequiredClassName } from '../../utils/getRequiredClassName';
import { Checkbox } from '../Checkbox';
import { Disclosure, DisclosureContent, DisclosureTrigger } from '../Disclosure';
import { Tag } from '../Tag';
import styles from './FacetedFilter.module.scss';

export interface FacetedFilterValue {
  group: string;
  value: string;
}

export interface FacetedFilterState {
  [groupKey: string]: string[];
}

export interface FacetedFilterProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue' | 'onChange'
> {
  value?: FacetedFilterState;
  defaultValue?: FacetedFilterState;
  onChange?: (state: FacetedFilterState) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface FacetGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  groupKey: string;
  label: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  searchable?: boolean;
  maxVisible?: number;
  className?: string;
  children: React.ReactNode;
}

export interface FacetItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value: string;
  count?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

type FacetedFilterContextValue = {
  clearGroup: (groupKey: string) => void;
  getGroupSelected: (groupKey: string) => string[];
  toggleItem: (groupKey: string, value: string) => void;
};

type FacetGroupContextValue = {
  groupKey: string;
  label: string;
  selected: string[];
};

const FacetedFilterContext = React.createContext<FacetedFilterContextValue | null>(null);
const FacetGroupContext = React.createContext<FacetGroupContextValue | null>(null);

const classNames = {
  root: getRequiredClassName(styles, 'root'),
  header: getRequiredClassName(styles, 'header'),
  clearAllBtn: getRequiredClassName(styles, 'clearAllBtn'),
  group: getRequiredClassName(styles, 'group'),
  groupTrigger: getRequiredClassName(styles, 'groupTrigger'),
  groupStaticHeader: getRequiredClassName(styles, 'groupStaticHeader'),
  groupLabel: getRequiredClassName(styles, 'groupLabel'),
  groupSearch: getRequiredClassName(styles, 'groupSearch'),
  groupSearchInput: getRequiredClassName(styles, 'groupSearchInput'),
  itemList: getRequiredClassName(styles, 'itemList'),
  showMoreBtn: getRequiredClassName(styles, 'showMoreBtn'),
  item: getRequiredClassName(styles, 'item'),
  itemDisabled: getRequiredClassName(styles, 'itemDisabled'),
  label: getRequiredClassName(styles, 'label'),
  checkbox: getRequiredClassName(styles, 'checkbox'),
  itemLabel: getRequiredClassName(styles, 'itemLabel'),
  count: getRequiredClassName(styles, 'count'),
} as const;

const cloneState = (state: FacetedFilterState) =>
  Object.fromEntries(Object.entries(state).map(([key, values]) => [key, [...values]]));

const normalizeState = (state: FacetedFilterState | undefined) => cloneState(state ?? {});

const hasSelectedValues = (state: FacetedFilterState) =>
  Object.values(state).some((values) => values.length > 0);

const clearState = (state: FacetedFilterState) =>
  Object.fromEntries(Object.keys(state).map((groupKey) => [groupKey, [] as string[]]));

const filterFacetItems = (items: React.ReactElement<FacetItemProps>[], searchQuery: string) => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return items;
  }

  return items.filter((item) => {
    const text = React.Children.toArray(item.props.children)
      .filter(
        (child): child is string | number => typeof child === 'string' || typeof child === 'number'
      )
      .map((child) => String(child))
      .join(' ')
      .toLowerCase();

    return text.includes(query);
  });
};

export const FacetedFilter = React.forwardRef<HTMLDivElement, FacetedFilterProps>(
  (
    {
      value,
      defaultValue = {},
      onChange,
      onClearAll,
      showClearAll = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalState, setInternalState] = React.useState<FacetedFilterState>(() =>
      normalizeState(defaultValue)
    );
    const currentState = isControlled ? normalizeState(value) : internalState;
    const hasAnySelected = hasSelectedValues(currentState);

    const updateState = (nextState: FacetedFilterState) => {
      if (!isControlled) {
        setInternalState(nextState);
      }

      onChange?.(nextState);
    };

    const toggleItem = (groupKey: string, itemValue: string) => {
      const nextState = cloneState(currentState);
      const selectedValues = nextState[groupKey] ?? [];

      nextState[groupKey] = selectedValues.includes(itemValue)
        ? selectedValues.filter((valueToCheck) => valueToCheck !== itemValue)
        : [...selectedValues, itemValue];

      updateState(nextState);
    };

    const clearGroup = (groupKey: string) => {
      const nextState = cloneState(currentState);
      nextState[groupKey] = [];
      updateState(nextState);
    };

    const handleClearAll = () => {
      updateState(clearState(currentState));
      onClearAll?.();
    };

    const contextValue: FacetedFilterContextValue = {
      clearGroup,
      getGroupSelected: (groupKey: string) => currentState[groupKey] ?? [],
      toggleItem,
    };

    return (
      <div ref={ref} className={clsx(classNames.root, className)} {...props}>
        {showClearAll && hasAnySelected ? (
          <div className={classNames.header}>
            <button type="button" className={classNames.clearAllBtn} onClick={handleClearAll}>
              Clear all filters
            </button>
          </div>
        ) : null}
        <FacetedFilterContext.Provider value={contextValue}>
          {children}
        </FacetedFilterContext.Provider>
      </div>
    );
  }
);

FacetedFilter.displayName = 'FacetedFilter';

export const FacetGroup = React.forwardRef<HTMLDivElement, FacetGroupProps>(
  (
    {
      groupKey,
      label,
      collapsible = true,
      defaultOpen = true,
      searchable = false,
      maxVisible,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const facetedFilterContext = React.useContext(FacetedFilterContext);
    const selected = facetedFilterContext?.getGroupSelected(groupKey) ?? [];
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showAll, setShowAll] = React.useState(false);
    const childItems = React.Children.toArray(children).filter(React.isValidElement) as Array<
      React.ReactElement<FacetItemProps>
    >;
    const filteredItems = filterFacetItems(childItems, searchQuery);
    const visibleItems =
      maxVisible !== undefined && !showAll ? filteredItems.slice(0, maxVisible) : filteredItems;
    const hiddenCount =
      maxVisible !== undefined && filteredItems.length > maxVisible
        ? filteredItems.length - maxVisible
        : 0;

    const groupContextValue: FacetGroupContextValue = {
      groupKey,
      label,
      selected,
    };

    const content = (
      <FacetGroupContext.Provider value={groupContextValue}>
        {searchable ? (
          <div className={styles.groupSearch}>
            <input
              type="text"
              placeholder={`Filter ${label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={classNames.groupSearchInput}
              aria-label={`Filter ${label} options`}
            />
          </div>
        ) : null}
        <ul className={classNames.itemList} aria-label={label}>
          {visibleItems}
        </ul>
        {maxVisible !== undefined && hiddenCount > 0 ? (
          <button
            type="button"
            className={classNames.showMoreBtn}
            aria-expanded={showAll}
            onClick={() => setShowAll((currentValue) => !currentValue)}
          >
            {showAll ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        ) : null}
      </FacetGroupContext.Provider>
    );

    return (
      <div ref={ref} className={clsx(classNames.group, className)} {...props}>
        {collapsible ? (
          <Disclosure defaultOpen={defaultOpen}>
            <DisclosureTrigger className={classNames.groupTrigger} size="sm">
              <span className={classNames.groupLabel}>{label}</span>
              {selected.length > 0 ? (
                <Tag variant="accent" size="sm">
                  {selected.length}
                </Tag>
              ) : null}
            </DisclosureTrigger>
            <DisclosureContent>{content}</DisclosureContent>
          </Disclosure>
        ) : (
          <>
            <div className={classNames.groupStaticHeader}>
              <span className={classNames.groupLabel}>{label}</span>
              {selected.length > 0 ? (
                <Tag variant="accent" size="sm">
                  {selected.length}
                </Tag>
              ) : null}
            </div>
            {content}
          </>
        )}
      </div>
    );
  }
);

FacetGroup.displayName = 'FacetGroup';

export const FacetItem = React.forwardRef<HTMLLIElement, FacetItemProps>(
  ({ value, count, disabled = false, className, children, ...props }, ref) => {
    const facetedFilterContext = React.useContext(FacetedFilterContext);
    const facetGroupContext = React.useContext(FacetGroupContext);
    const checkboxId = React.useId();

    if (!facetedFilterContext || !facetGroupContext) {
      throw new Error('FacetItem must be rendered inside FacetedFilter and FacetGroup.');
    }

    const { groupKey } = facetGroupContext;
    const isChecked = facetGroupContext.selected.includes(value);

    return (
      <li
        ref={ref}
        className={clsx(classNames.item, disabled && classNames.itemDisabled, className)}
        {...props}
      >
        <label className={classNames.label}>
          <Checkbox
            id={checkboxId}
            checked={isChecked}
            onCheckedChange={() => facetedFilterContext.toggleItem(groupKey, value)}
            disabled={disabled}
            size="sm"
            className={classNames.checkbox}
          />
          <span className={classNames.itemLabel}>{children}</span>
          {count !== undefined ? (
            <span className={classNames.count} aria-label={`${count.toLocaleString()} results`}>
              {count.toLocaleString()}
            </span>
          ) : null}
        </label>
      </li>
    );
  }
);

FacetItem.displayName = 'FacetItem';
