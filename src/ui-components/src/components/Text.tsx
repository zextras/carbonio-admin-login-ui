/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { type HTMLAttributes } from 'react';

import { resolveThemeColor } from '../theme/theme-utils';
import { type AnyColor } from '../types/utils';
import styles from './Text.module.css';

type TextOverflow = 'ellipsis' | 'break-word';

type TextProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  color?: AnyColor;
  size?: 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  overflow?: TextOverflow;
  disabled?: boolean;
  lineHeight?: number;
  ref?: React.Ref<HTMLDivElement>;
};

const Text = ({
  children,
  color = 'text',
  size = 'medium',
  weight = 'regular',
  overflow = 'ellipsis',
  disabled = false,
  lineHeight,
  className,
  style,
  ref,
  ...rest
}: TextProps) => {
  const overflowClass = overflow === 'break-word' ? 'break-word' : 'ellipsis';

  const textStyle = {
    '--text-color': resolveThemeColor(color, disabled ? 'disabled' : 'regular'),
    '--text-font-family': 'var(--font-family)',
    '--text-font-size': `var(--font-size-${size})`,
    '--text-font-weight': `var(--font-weight-${weight})`,
    '--text-line-height': lineHeight,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={clsx(styles.text, styles[overflowClass], className)}
      style={textStyle}
      {...rest}
    >
      {children}
    </div>
  );
};

export type { TextProps };
export { Text };
