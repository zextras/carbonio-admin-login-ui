/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useMemo } from 'react';

import styles from './Row.module.css';

type Dimension = 'fit' | 'fill' | string | number;

type RowOwnProps = {
  display?: string;
  order?: 'unset' | number;
  takeAvailableSpace?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'row' | 'column' | 'row-reverse' | 'column-reverse';
  borderRadius?: 'regular' | 'round' | 'half' | 'none';
  height?: Dimension;
  width?: Dimension;
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | 'unset';
  flexBasis?: string;
  flexGrow?: string | number;
  flexShrink?: string | number;
  maxWidth?: Dimension;
  mainAlignment?:
    | 'stretch'
    | 'center'
    | 'baseline'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'unset';
  crossAlignment?: 'stretch' | 'center' | 'baseline' | 'flex-start' | 'flex-end' | 'unset';
  padding?: string | { vertical?: string; horizontal?: string } | 0;
  gap?: string;
};

export type RowProps = RowOwnProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof RowOwnProps | 'boxSizing'> & {
    ref?: React.Ref<HTMLDivElement>;
    style?: React.CSSProperties;
  }

const BORDER_RADIUS: Record<string, string | undefined> = {
  round: '50%',
  half: 'var(--border-radius) var(--border-radius) 0 0',
  none: '0',
};

function resolveOrientation(o: string | undefined): string {
  if (!o) return 'row';
  return o.replace('horizontal', 'row').replace('vertical', 'column');
}

function resolveDimension(value: Dimension | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === 'fill') return '100%';
  if (value === 'fit') return 'fit-content';
  if (typeof value === 'number') return `${value}px`;
  if (/^-?\d+(\.\d+)?$/.test(value)) return undefined;
  return value;
}

function resolvePadding(padding: RowOwnProps['padding']): string | undefined {
  if (padding === undefined) return undefined;
  if (padding === 0 || padding === '0') return '0';
  if (typeof padding === 'string') return padding;
  const p = ['0', '0', '0', '0'];
  if ('vertical' in padding && padding.vertical) {
    p[0] = padding.vertical;
    p[2] = padding.vertical;
  }
  if ('horizontal' in padding && padding.horizontal) {
    p[1] = padding.horizontal;
    p[3] = padding.horizontal;
  }
  return p.join(' ');
}

const Row = ({
  display = 'flex',
  orientation = 'horizontal',
  borderRadius = 'none',
  height = 'auto',
  width = 'auto',
  wrap = 'wrap',
  flexBasis = 'unset',
  flexGrow = 'unset',
  flexShrink = 1,
  order = 'unset',
  takeAvailableSpace = false,
  maxWidth = '100%',
  mainAlignment = 'center',
  crossAlignment = 'center',
  padding,
  gap,
  children,
  className,
  style,
  ref,
  ...rest
}: RowProps) => {
  const rowStyle = useMemo(
    () => ({
      display,
      order,
      flexDirection: resolveOrientation(orientation),
      flexWrap: wrap,
      flexGrow: takeAvailableSpace ? '1' : flexGrow,
      flexShrink: flexShrink,
      flexBasis: takeAvailableSpace ? '0' : flexBasis,
      alignItems: crossAlignment,
      justifyContent: mainAlignment,
      borderRadius: BORDER_RADIUS[borderRadius],
      height: resolveDimension(height),
      width: resolveDimension(width),
      maxWidth: resolveDimension(maxWidth),
      padding: resolvePadding(padding),
      gap,
      boxSizing: 'border-box' as const,
      ...style,
    }),
    [
      display,
      order,
      orientation,
      wrap,
      takeAvailableSpace,
      flexGrow,
      flexShrink,
      flexBasis,
      crossAlignment,
      mainAlignment,
      borderRadius,
      height,
      width,
      maxWidth,
      padding,
      gap,
      style,
    ],
  );

  const rowClassName = useMemo(() => {
    const classes = [styles.row];
    if (takeAvailableSpace) {
      classes.push(styles.takeAvailableSpace);
    }
    if (className) {
      classes.push(className);
    }
    return clsx(classes);
  }, [takeAvailableSpace, className]);

  return (
    <div ref={ref} className={rowClassName} style={rowStyle} {...rest}>
      {children}
    </div>
  );
};

export { Row };
export type { RowProps };
