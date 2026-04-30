import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import styles from './TreeView.module.scss';

export interface TreeViewProps {
  selectionMode?: 'none' | 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  expandedValues?: string[];
  defaultExpandedValues?: string[];
  onExpandedChange?: (values: string[]) => void;
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export interface TreeItemProps {
  value: string;
  label: string;
  startIcon?: React.ReactNode;
  endSlot?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface TreeItemGroupProps {
  className?: string;
  children: React.ReactNode;
}

type TreeSelectionMode = NonNullable<TreeViewProps['selectionMode']>;
type TreeSize = NonNullable<TreeViewProps['size']>;

type TreeNodeMeta = {
  value: string;
  label: string;
  disabled: boolean;
  depth: number;
  parentValue: string | null;
  isBranch: boolean;
  childValues: string[];
};

type TreeRegistry = {
  branchValues: Set<string>;
  childrenByValue: Map<string, string[]>;
  depthByValue: Map<string, number>;
  disabledByValue: Map<string, boolean>;
  orderedValues: string[];
  parentByValue: Map<string, string | null>;
};

type TreeViewContextValue = {
  selectionMode: TreeSelectionMode;
  selectedValues: string[];
  expandedValues: string[];
  size: TreeSize;
  focusedValue: string | null;
  registry: TreeRegistry;
  toggleExpanded: (value: string) => void;
  selectItem: (value: string) => void;
  setFocused: (value: string | null) => void;
  itemRefs: React.MutableRefObject<Map<string, HTMLLIElement>>;
};

const TreeViewContext = React.createContext<TreeViewContextValue | null>(null);
const TreeItemDepthContext = React.createContext(0);

const assignRef = <T,>(ref: React.ForwardedRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
};

const isTreeItemElement = (node: React.ReactNode): node is React.ReactElement<TreeItemProps> =>
  React.isValidElement(node) && node.type === TreeItem;

const isTreeItemGroupElement = (
  node: React.ReactNode
): node is React.ReactElement<TreeItemGroupProps> =>
  React.isValidElement(node) && node.type === TreeItemGroup;

const normalizeSelectedValues = (
  selectionMode: TreeSelectionMode,
  value: string | string[] | undefined
) => {
  if (selectionMode === 'none') {
    return [];
  }

  if (selectionMode === 'multiple') {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    return value ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value[0] ? [value[0]] : [];
  }

  return value ? [value] : [];
};

const getSelectionOutput = (selectionMode: TreeSelectionMode, selectedValues: string[]) => {
  if (selectionMode === 'multiple') {
    return selectedValues;
  }

  return selectedValues[0] ?? '';
};

const extractChildTreeItems = (children: React.ReactNode) => {
  const childItems: React.ReactElement<TreeItemProps>[] = [];

  React.Children.forEach(children, (child) => {
    if (isTreeItemElement(child)) {
      childItems.push(child);
      return;
    }

    if (isTreeItemGroupElement(child)) {
      React.Children.forEach(child.props.children, (groupChild) => {
        if (isTreeItemElement(groupChild)) {
          childItems.push(groupChild);
        }
      });
    }
  });

  return childItems;
};

const getTreeItemGroupElement = (children: React.ReactNode) => {
  let groupElement: React.ReactElement<TreeItemGroupProps> | null = null;

  React.Children.forEach(children, (child) => {
    if (!groupElement && isTreeItemGroupElement(child)) {
      groupElement = child;
    }
  });

  return groupElement;
};

const buildTreeRegistry = (children: React.ReactNode) => {
  const metadata = new Map<string, TreeNodeMeta>();
  const orderedValues: string[] = [];
  const parentByValue = new Map<string, string | null>();
  const depthByValue = new Map<string, number>();
  const disabledByValue = new Map<string, boolean>();
  const childrenByValue = new Map<string, string[]>();
  const branchValues = new Set<string>();

  const visit = (nodes: React.ReactNode, depth: number, parentValue: string | null) => {
    React.Children.forEach(nodes, (node) => {
      if (!isTreeItemElement(node)) {
        return;
      }

      const childTreeItems = extractChildTreeItems(node.props.children);
      const childValues = childTreeItems.map((child) => child.props.value);
      const { value, label, disabled = false } = node.props;

      metadata.set(value, {
        value,
        label,
        disabled,
        depth,
        parentValue,
        isBranch: childValues.length > 0,
        childValues,
      });
      orderedValues.push(value);
      parentByValue.set(value, parentValue);
      depthByValue.set(value, depth);
      disabledByValue.set(value, disabled);
      childrenByValue.set(value, childValues);

      if (childValues.length > 0) {
        branchValues.add(value);
      }

      for (const childNode of childTreeItems) {
        visit(childNode, depth + 1, value);
      }
    });
  };

  visit(children, 0, null);

  return {
    metadata,
    registry: {
      branchValues,
      childrenByValue,
      depthByValue,
      disabledByValue,
      orderedValues,
      parentByValue,
    },
  };
};

const getVisibleValues = (registry: TreeRegistry, expandedValues: string[]) => {
  const expandedSet = new Set(expandedValues);

  return registry.orderedValues.filter((value) => {
    if (registry.disabledByValue.get(value)) {
      return false;
    }

    let currentParent = registry.parentByValue.get(value) ?? null;

    while (currentParent) {
      if (!expandedSet.has(currentParent)) {
        return false;
      }

      currentParent = registry.parentByValue.get(currentParent) ?? null;
    }

    return true;
  });
};

const useTreeViewContext = () => {
  const context = React.useContext(TreeViewContext);

  if (!context) {
    throw new Error('TreeView components must be used within TreeView.');
  }

  return context;
};

export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  (
    {
      selectionMode = 'single',
      value,
      defaultValue,
      onChange,
      expandedValues,
      defaultExpandedValues = [],
      onExpandedChange,
      size = 'md',
      className,
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const itemRefs = React.useRef(new Map<string, HTMLLIElement>());
    const pendingFocusValueRef = React.useRef<string | null>(null);
    const { metadata, registry } = React.useMemo(() => buildTreeRegistry(children), [children]);
    const isControlledSelection = value !== undefined;
    const isControlledExpanded = expandedValues !== undefined;
    const [uncontrolledSelectedValues, setUncontrolledSelectedValues] = React.useState(() =>
      normalizeSelectedValues(selectionMode, defaultValue)
    );
    const [uncontrolledExpandedValues, setUncontrolledExpandedValues] =
      React.useState(defaultExpandedValues);
    const selectedValues = isControlledSelection
      ? normalizeSelectedValues(selectionMode, value)
      : uncontrolledSelectedValues;
    const currentExpandedValues = isControlledExpanded
      ? expandedValues
      : uncontrolledExpandedValues;
    const visibleValues = React.useMemo(
      () => getVisibleValues(registry, currentExpandedValues),
      [currentExpandedValues, registry]
    );
    const [focusedValue, setFocusedValue] = React.useState<string | null>(
      () => visibleValues[0] ?? null
    );

    React.useEffect(() => {
      setUncontrolledSelectedValues((currentSelectedValues) =>
        currentSelectedValues.filter((selectedValue) => metadata.has(selectedValue))
      );
    }, [metadata]);

    React.useEffect(() => {
      setUncontrolledExpandedValues((currentValues) =>
        currentValues.filter((expandedValue) => registry.branchValues.has(expandedValue))
      );
    }, [registry.branchValues]);

    React.useEffect(() => {
      if (visibleValues.length === 0) {
        if (focusedValue !== null) {
          setFocusedValue(null);
        }
        return;
      }

      if (!focusedValue || !visibleValues.includes(focusedValue)) {
        setFocusedValue(visibleValues[0] ?? null);
      }
    }, [focusedValue, visibleValues]);

    React.useEffect(() => {
      const pendingFocusValue = pendingFocusValueRef.current;

      if (!pendingFocusValue) {
        return;
      }

      pendingFocusValueRef.current = null;
      itemRefs.current.get(pendingFocusValue)?.focus();
    }, [currentExpandedValues, focusedValue]);

    const setFocused = React.useCallback((nextValue: string | null) => {
      setFocusedValue(nextValue);
    }, []);

    const selectItem = React.useCallback(
      (selectedValue: string) => {
        if (selectionMode === 'none' || registry.disabledByValue.get(selectedValue)) {
          return;
        }

        const nextSelectedValues =
          selectionMode === 'multiple'
            ? selectedValues.includes(selectedValue)
              ? selectedValues.filter((valueToKeep) => valueToKeep !== selectedValue)
              : [...selectedValues, selectedValue]
            : [selectedValue];

        if (!isControlledSelection) {
          setUncontrolledSelectedValues(nextSelectedValues);
        }

        onChange?.(getSelectionOutput(selectionMode, nextSelectedValues));
      },
      [isControlledSelection, onChange, registry.disabledByValue, selectedValues, selectionMode]
    );

    const toggleExpanded = React.useCallback(
      (expandedValue: string) => {
        if (
          !registry.branchValues.has(expandedValue) ||
          registry.disabledByValue.get(expandedValue)
        ) {
          return;
        }

        const nextExpandedValues = currentExpandedValues.includes(expandedValue)
          ? currentExpandedValues.filter((valueToKeep) => valueToKeep !== expandedValue)
          : [...currentExpandedValues, expandedValue];

        if (!isControlledExpanded) {
          setUncontrolledExpandedValues(nextExpandedValues);
        }

        onExpandedChange?.(nextExpandedValues);
      },
      [
        currentExpandedValues,
        isControlledExpanded,
        onExpandedChange,
        registry.branchValues,
        registry.disabledByValue,
      ]
    );

    const focusItem = React.useCallback(
      (nextValue: string | undefined) => {
        if (!nextValue) {
          return;
        }

        pendingFocusValueRef.current = nextValue;
        setFocused(nextValue);
      },
      [setFocused]
    );

    const handleTreeKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLUListElement>) => {
        if (!focusedValue) {
          return;
        }

        const currentIndex = visibleValues.indexOf(focusedValue);
        const isBranch = registry.branchValues.has(focusedValue);
        const isExpanded = currentExpandedValues.includes(focusedValue);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            focusItem(visibleValues[currentIndex + 1] ?? focusedValue);
            return;

          case 'ArrowUp':
            event.preventDefault();
            focusItem(visibleValues[currentIndex - 1] ?? focusedValue);
            return;

          case 'ArrowRight':
            event.preventDefault();

            if (!isBranch) {
              return;
            }

            if (!isExpanded) {
              toggleExpanded(focusedValue);
              return;
            }

            focusItem(registry.childrenByValue.get(focusedValue)?.[0]);
            return;

          case 'ArrowLeft':
            event.preventDefault();

            if (isBranch && isExpanded) {
              toggleExpanded(focusedValue);
              return;
            }

            focusItem(registry.parentByValue.get(focusedValue) ?? undefined);
            return;

          case 'Enter':
          case ' ':
            event.preventDefault();

            if (isBranch) {
              toggleExpanded(focusedValue);
            }

            selectItem(focusedValue);
            return;

          case 'Home':
            event.preventDefault();
            focusItem(visibleValues[0]);
            return;

          case 'End':
            event.preventDefault();
            focusItem(visibleValues[visibleValues.length - 1]);
            return;

          case '*': {
            event.preventDefault();
            const parentValue = registry.parentByValue.get(focusedValue) ?? null;
            const siblingValues = parentValue
              ? (registry.childrenByValue.get(parentValue) ?? [])
              : registry.orderedValues.filter(
                  (valueToCheck) => (registry.parentByValue.get(valueToCheck) ?? null) === null
                );
            const nextExpandedValues = Array.from(
              new Set([
                ...currentExpandedValues,
                ...siblingValues.filter((valueToCheck) => registry.branchValues.has(valueToCheck)),
              ])
            );

            if (!isControlledExpanded) {
              setUncontrolledExpandedValues(nextExpandedValues);
            }

            onExpandedChange?.(nextExpandedValues);
            return;
          }

          default:
            return;
        }
      },
      [
        currentExpandedValues,
        focusItem,
        focusedValue,
        isControlledExpanded,
        onExpandedChange,
        registry,
        selectItem,
        toggleExpanded,
        visibleValues,
      ]
    );

    const contextValue = React.useMemo<TreeViewContextValue>(
      () => ({
        selectionMode,
        selectedValues,
        expandedValues: currentExpandedValues,
        size,
        focusedValue,
        registry,
        toggleExpanded,
        selectItem,
        setFocused,
        itemRefs,
      }),
      [
        currentExpandedValues,
        focusedValue,
        registry,
        selectItem,
        selectedValues,
        selectionMode,
        setFocused,
        size,
        toggleExpanded,
      ]
    );

    return (
      <TreeViewContext.Provider value={contextValue}>
        <TreeItemDepthContext.Provider value={0}>
          <ul
            ref={ref}
            role="tree"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
            className={clsx(styles.root, styles[size], className)}
            onKeyDown={handleTreeKeyDown}
            {...props}
          >
            {children}
          </ul>
        </TreeItemDepthContext.Provider>
      </TreeViewContext.Provider>
    );
  }
);

TreeView.displayName = 'TreeView';

export const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ value, label, startIcon, endSlot, disabled = false, className, children }, ref) => {
    const {
      selectionMode,
      selectedValues,
      expandedValues,
      size,
      focusedValue,
      registry,
      toggleExpanded,
      selectItem,
      setFocused,
      itemRefs,
    } = useTreeViewContext();
    const depth = React.useContext(TreeItemDepthContext);
    const isBranch = registry.branchValues.has(value);
    const isExpanded = expandedValues.includes(value);
    const isSelected = selectedValues.includes(value);
    const isFocused = focusedValue === value;
    const childItems = extractChildTreeItems(children);
    const childGroup = getTreeItemGroupElement(children);

    const setItemRef = (node: HTMLLIElement | null) => {
      if (node) {
        itemRefs.current.set(value, node);
      } else {
        itemRefs.current.delete(value);
      }

      assignRef(ref, node);
    };

    const handleClick = () => {
      if (disabled) {
        return;
      }

      if (isBranch) {
        toggleExpanded(value);
      }

      selectItem(value);
      setFocused(value);
    };

    const handleFocus = () => {
      if (!disabled) {
        setFocused(value);
      }
    };

    return (
      <li
        ref={setItemRef}
        role="treeitem"
        aria-label={label}
        aria-expanded={isBranch ? isExpanded : undefined}
        aria-selected={selectionMode !== 'none' ? isSelected : undefined}
        aria-disabled={disabled || undefined}
        aria-level={depth + 1}
        tabIndex={isFocused ? 0 : -1}
        className={clsx(
          styles.item,
          styles[size],
          isSelected && styles.selected,
          isFocused && styles.focused,
          disabled && styles.itemDisabled,
          className
        )}
        onClick={handleClick}
        onKeyDown={() => {}}
        onFocus={handleFocus}
      >
        <span className={styles.row} style={{ paddingLeft: `calc(${depth} * var(--dds-space-4))` }}>
          {isBranch ? (
            <span
              className={clsx(styles.toggle, isExpanded && styles.toggleOpen)}
              aria-hidden="true"
              data-testid={`tree-toggle-${value}`}
            >
              <ChevronRight aria-hidden="true" />
            </span>
          ) : (
            <span
              className={styles.toggleSpacer}
              aria-hidden="true"
              data-testid={`tree-toggle-spacer-${value}`}
            />
          )}

          {startIcon ? (
            <span className={styles.startIcon} aria-hidden="true">
              {startIcon}
            </span>
          ) : null}

          <span className={styles.label}>{label}</span>

          {endSlot ? <span className={styles.endSlot}>{endSlot}</span> : null}
        </span>

        {isBranch && isExpanded && childItems.length > 0 && childGroup ? (
          <TreeItemDepthContext.Provider value={depth + 1}>
            {React.cloneElement(childGroup, undefined, childItems)}
          </TreeItemDepthContext.Provider>
        ) : null}
      </li>
    );
  }
);

TreeItem.displayName = 'TreeItem';

export const TreeItemGroup = React.forwardRef<HTMLUListElement, TreeItemGroupProps>(
  ({ className, children }, ref) => (
    <ul ref={ref} role="group" className={clsx(styles.group, className)}>
      {children}
    </ul>
  )
);

TreeItemGroup.displayName = 'TreeItemGroup';
