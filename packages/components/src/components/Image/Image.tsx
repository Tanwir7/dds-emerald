import React from 'react';
import clsx from 'clsx';
import styles from './Image.module.scss';
import { getRequiredClassName } from '../../utils/getRequiredClassName';

export type ImageAspectRatio = '1/1' | '4/3' | '16/9' | '3/2';
export type ImageFit = 'cover' | 'contain' | 'fill';

export interface ImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'src' | 'loading'
> {
  src: string;
  alt: string;
  aspectRatio?: ImageAspectRatio;
  fit?: ImageFit;
  rounded?: boolean;
  loading?: 'lazy' | 'eager';
  className?: string;
}

const fitClassName: Record<ImageFit, string> = {
  cover: getRequiredClassName(styles, 'cover'),
  contain: getRequiredClassName(styles, 'contain'),
  fill: getRequiredClassName(styles, 'fill'),
};

const ratioClassName: Record<ImageAspectRatio, string> = {
  '1/1': getRequiredClassName(styles, 'ratio1x1'),
  '4/3': getRequiredClassName(styles, 'ratio4x3'),
  '16/9': getRequiredClassName(styles, 'ratio16x9'),
  '3/2': getRequiredClassName(styles, 'ratio3x2'),
};

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      aspectRatio,
      fit = 'cover',
      rounded = false,
      loading = 'lazy',
      className,
      onError,
      onLoad,
      ...props
    }: ImageProps,
    ref: React.ForwardedRef<HTMLImageElement>
  ) => {
    const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
    const hasError = failedSrc === src;

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setFailedSrc(event.currentTarget.getAttribute('src') ?? src);
      onError?.(event);
    };

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setFailedSrc(null);
      onLoad?.(event);
    };

    const image = (
      <img
        ref={ref}
        className={clsx(
          styles.root,
          fitClassName[fit],
          rounded && styles.rounded,
          hasError && styles.stateError,
          className
        )}
        src={src}
        alt={alt}
        loading={loading}
        data-error={hasError ? '' : undefined}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    );

    if (!aspectRatio) {
      return image;
    }

    return (
      <figure
        className={clsx(styles.figure, ratioClassName[aspectRatio], rounded && styles.rounded)}
      >
        {image}
      </figure>
    );
  }
);

Image.displayName = 'Image';
