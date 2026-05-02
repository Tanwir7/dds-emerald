import { Check } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';
import styles from './Card.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type CardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardFooterAlign = 'start' | 'center' | 'end' | 'between';
export type CardMediaAspectRatio = '16/9' | '4/3' | '1/1' | '3/2';
export type CardMediaPosition = 'top' | 'bottom';

interface CardBaseProps {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
}

interface CardStaticProps
  extends
    CardBaseProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClick'> {
  as?: 'div';
  href?: never;
  onClick?: never;
  selected?: never;
  onSelectedChange?: never;
  disabled?: never;
  selectLabel?: never;
}

interface CardClickableAnchorProps
  extends
    CardBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> {
  as: 'a';
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  selected?: never;
  onSelectedChange?: never;
  disabled?: boolean;
  selectLabel?: never;
}

interface CardClickableButtonProps
  extends
    CardBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'onClick'> {
  as: 'button';
  href?: never;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  selected?: never;
  onSelectedChange?: never;
  disabled?: boolean;
  selectLabel?: never;
}

interface CardSelectableProps
  extends
    CardBaseProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClick'> {
  as?: 'div';
  href?: never;
  onClick?: never;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  disabled?: boolean;
  selectLabel: string;
}

export type CardProps =
  | CardStaticProps
  | CardClickableAnchorProps
  | CardClickableButtonProps
  | CardSelectableProps;

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: CardFooterAlign;
  className?: string;
  children: React.ReactNode;
}

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: CardMediaAspectRatio;
  position?: CardMediaPosition;
  className?: string;
  children: React.ReactNode;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  children: React.ReactNode;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

const variantClassNames: Record<CardVariant, string> = {
  outlined: getRequiredClassName(styles, 'variantOutlined'),
  elevated: getRequiredClassName(styles, 'variantElevated'),
  filled: getRequiredClassName(styles, 'variantFilled'),
  ghost: getRequiredClassName(styles, 'variantGhost'),
};

const paddingClassNames: Record<Exclude<CardPadding, 'none'>, string> = {
  sm: getRequiredClassName(styles, 'paddingSm'),
  md: getRequiredClassName(styles, 'paddingMd'),
  lg: getRequiredClassName(styles, 'paddingLg'),
};

const footerAlignClassNames: Record<CardFooterAlign, string> = {
  start: getRequiredClassName(styles, 'footerAlignStart'),
  center: getRequiredClassName(styles, 'footerAlignCenter'),
  end: getRequiredClassName(styles, 'footerAlignEnd'),
  between: getRequiredClassName(styles, 'footerAlignBetween'),
};

const mediaAspectRatioClassNames: Record<CardMediaAspectRatio, string> = {
  '16/9': getRequiredClassName(styles, 'media16By9'),
  '4/3': getRequiredClassName(styles, 'media4By3'),
  '1/1': getRequiredClassName(styles, 'media1By1'),
  '3/2': getRequiredClassName(styles, 'media3By2'),
};

const mediaPositionClassNames: Record<CardMediaPosition, string> = {
  top: getRequiredClassName(styles, 'mediaTop'),
  bottom: getRequiredClassName(styles, 'mediaBottom'),
};

const isSelectableCard = (props: CardProps): props is CardSelectableProps =>
  'selected' in props && typeof props.onSelectedChange === 'function';

export const Card = React.forwardRef<HTMLElement, CardProps>((props, ref) => {
  const { variant = 'outlined', padding = 'none', className } = props;
  const checkboxId = React.useId();

  const baseClassName = clsx(
    styles.card,
    variantClassNames[variant],
    padding !== 'none' && paddingClassNames[padding],
    className
  );

  if (isSelectableCard(props)) {
    const {
      selected,
      onSelectedChange,
      disabled = false,
      selectLabel,
      variant: _variant,
      padding: _padding,
      className: _className,
      children: _children,
      as: _as,
      ...rest
    } = props;
    void _variant;
    void _padding;
    void _className;
    void _as;

    return (
      <div
        ref={ref as React.ForwardedRef<HTMLDivElement>}
        className={clsx(
          baseClassName,
          styles.selectable,
          selected && styles.selected,
          disabled && styles.disabled
        )}
        {...rest}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
          disabled={disabled}
          aria-label={selectLabel}
          className={styles.selectableCheckbox}
        />
        <label htmlFor={checkboxId} className={styles.selectableLabel}>
          {selected ? (
            <span className={styles.selectedIndicator} aria-hidden="true">
              <Check />
            </span>
          ) : null}
          {_children}
        </label>
      </div>
    );
  }

  if (props.as === 'a') {
    const {
      href,
      onClick,
      disabled = false,
      variant: _variant,
      padding: _padding,
      className: _className,
      children: _children,
      as: _as,
      ...rest
    } = props;
    void _variant;
    void _padding;
    void _className;
    void _as;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <a
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        onClick={handleClick}
        aria-disabled={disabled || undefined}
        className={clsx(baseClassName, styles.clickable, disabled && styles.disabled)}
        {...rest}
      >
        {_children}
      </a>
    );
  }

  if (props.as === 'button') {
    const {
      onClick,
      disabled = false,
      variant: _variant,
      padding: _padding,
      className: _className,
      children: _children,
      as: _as,
      ...rest
    } = props;
    void _variant;
    void _padding;
    void _className;
    void _as;

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={clsx(baseClassName, styles.clickable, disabled && styles.disabled)}
        {...rest}
      >
        {_children}
      </button>
    );
  }

  const {
    variant: _variant,
    padding: _padding,
    className: _className,
    children: _children,
    as: _as,
    ...rest
  } = props;
  void _variant;
  void _padding;
  void _className;
  void _as;

  return (
    <div ref={ref as React.ForwardedRef<HTMLDivElement>} className={baseClassName} {...rest}>
      {_children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
);

CardBody.displayName = 'CardBody';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'start', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.footer, footerAlignClassNames[align], className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ aspectRatio = '16/9', position = 'top', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        styles.media,
        mediaAspectRatioClassNames[aspectRatio],
        mediaPositionClassNames[position],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardMedia.displayName = 'CardMedia';

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => (
    <Component ref={ref} className={clsx(styles.title, className)} {...props}>
      {children}
    </Component>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={clsx(styles.description, className)} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';
