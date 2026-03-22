/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import { type CSSProperties, type FC, type HTMLAttributes, useMemo } from 'react';

import { getPaddingVar, resolveThemeColor } from '../theme/theme-utils';
import styles from './InputContainer.module.css';

type Dimension = 'fit' | 'fill' | string | number;

type InputContainerOwnProps = {
  background: string;
  $disabled?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'row' | 'column' | 'row-reverse' | 'column-reverse';
  width?: Dimension;
  height?: Dimension;
  crossAlignment?: 'stretch' | 'center' | 'baseline' | 'flex-start' | 'flex-end' | 'unset';
  borderRadius?: 'regular' | 'round' | 'half' | 'none';
  padding?: Parameters<typeof getPaddingVar>[0];
  gap?: string;
  ref?: React.Ref<HTMLDivElement>;
};

export type InputContainerProps = InputContainerOwnProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof InputContainerOwnProps>;

const COLOR_VARIANTS = ['regular', 'hover', 'focus', 'active', 'disabled'] as const;
const COLOR_SPLIT_REGEXP = new RegExp(`.(${COLOR_VARIANTS.join('|')})`);

function resolveColorVar(color: string, variant: string): string {
  return resolveThemeColor(color.replace(COLOR_SPLIT_REGEXP, ''), variant);
}

function resolveDimension(value: Dimension | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === 'fill') return '100%';
  if (value === 'fit') return 'fit-content';
  if (typeof value === 'number') return `${value}px`;
  if (/^-?\d+(\.\d+)?$/.test(value)) return undefined;
  return value;
}

const BORDER_RADIUS: Record<string, string | undefined> = {
  round: '50%',
  half: 'var(--border-radius) var(--border-radius) 0 0',
  none: '0',
};

function resolveOrientation(o: string | undefined): string {
  if (!o) return 'column';
  return o.replace('horizontal', 'row').replace('vertical', 'column');
}

export const InputContainer: FC<InputContainerProps> = ({
  background,
  $disabled,
  className,
  style,
  orientation = 'vertical',
  width = 'fill',
  height = 'fill',
  crossAlignment = 'center',
  borderRadius = 'regular',
  padding,
  gap,
  children,
  ref,
  ...rest
}) => {
  const containerStyle = useMemo<CSSProperties>(() => {
    const baseColor = background.replace(COLOR_SPLIT_REGEXP, '');
    return {
      display: 'flex',
      flexDirection: resolveOrientation(orientation),
      alignItems: crossAlignment,
      justifyContent: 'center',
      flexWrap: 'nowrap',
      width: resolveDimension(width),
      height: resolveDimension(height),
      padding: padding !== undefined ? getPaddingVar(padding) : undefined,
      gap,
      borderRadius: BORDER_RADIUS[borderRadius],
      boxSizing: 'border-box',
      '--input-container-bg': resolveColorVar(background, 'regular'),
      '--input-container-bg-hover': resolveColorVar(`${baseColor}.hover`, 'hover'),
      '--input-container-bg-focus': resolveColorVar(`${baseColor}.focus`, 'focus'),
      '--input-container-bg-active': resolveColorVar(`${baseColor}.active`, 'active'),
      '--input-container-bg-disabled': resolveColorVar(`${baseColor}.disabled`, 'disabled'),
      ...style,
    } as CSSProperties;
  }, [background, style, orientation, width, height, crossAlignment, borderRadius, padding, gap]);

  return (
    <div
      ref={ref}
      className={clsx(styles.inputContainer, $disabled && styles.disabled, className)}
      style={containerStyle}
      {...rest}
    >
      {children}
    </div>
  );
};
