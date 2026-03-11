/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import React, { type ButtonHTMLAttributes, useCallback, useMemo } from 'react';

import type { AnyColor, With$Prefix, Without$Prefix } from '../types/utils';
import { type IconName } from '../web-components/icon-registry';
import styles from './Button.module.css';

type ButtonSize = 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
type ButtonWidth = 'fit' | 'fill';
type ButtonIconPlacement = 'left' | 'right';
type ButtonColorsByType =
  | ({
      type?: 'default' | 'outlined';
    } & (
      | { color?: AnyColor }
      | {
          backgroundColor?: AnyColor;
          labelColor?: AnyColor;
        }
    ))
  | {
      type: 'ghost';
      color?: AnyColor;
    };
type ButtonType = NonNullable<ButtonColorsByType['type']>;

type ButtonPropsInternal = {
  disabled?: boolean;
  icon?: IconName;
  iconPlacement?: ButtonIconPlacement;
  label?: string;
  loading?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
  width?: ButtonWidth;
  minWidth?: string;
} & (
  | {
      size?: 'medium' | 'large' | 'extralarge';
    }
  | {
      size?: ButtonSize;
    }
) &
  ButtonColorsByType;

type ButtonProps = ButtonPropsInternal &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonPropsInternal>;

type StyledButtonProps = With$Prefix<{
  backgroundColor: string;
  color: string;
  padding: string;
  gap: string;
  buttonType: ButtonType;
  iconPlacement?: ButtonIconPlacement;
  width: ButtonWidth;
  minWidth?: string;
}>;

const SIZES: Record<ButtonSize, { label: string; icon: string; padding: string; gap: string }> = {
  extrasmall: {
    label: '0.5rem',
    icon: '0.5rem',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  small: {
    label: '0.75rem',
    icon: '0.75rem',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  medium: {
    label: '1rem',
    icon: '1rem',
    padding: '0.5rem',
    gap: '0.5rem',
  },
  large: {
    label: '1.25rem',
    icon: '1.25rem',
    padding: '0.5rem',
    gap: '0.5rem',
  },
  extralarge: {
    label: '1.25rem',
    icon: '1.25rem',
    padding: '0.75rem',
    gap: '0.5rem',
  },
} as const;

const DEFAULT_COLORS = {
  outlined: {
    backgroundColor: 'gray6',
    color: 'primary',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'primary',
  },
  default: {
    backgroundColor: 'primary',
    color: 'gray6',
  },
} as const;

function getThemeColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) {
    return colorName;
  }
  const sanitized = colorName.replace(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

function getColorStyles(colorName: string, bgName: string): Record<string, string> {
  return {
    '--btn-color': getThemeColorVar(colorName, 'regular'),
    '--btn-color-hover': getThemeColorVar(colorName, 'hover'),
    '--btn-color-active': getThemeColorVar(colorName, 'active'),
    '--btn-color-focus': getThemeColorVar(colorName, 'focus'),
    '--btn-color-disabled': getThemeColorVar(colorName, 'disabled'),
    '--btn-bg': getThemeColorVar(bgName, 'regular'),
    '--btn-bg-hover': getThemeColorVar(bgName, 'hover'),
    '--btn-bg-active': getThemeColorVar(bgName, 'active'),
    '--btn-bg-focus': getThemeColorVar(bgName, 'focus'),
    '--btn-bg-disabled': getThemeColorVar(bgName, 'disabled'),
  };
}

function getColors(
  type: ButtonType,
  props: ButtonColorsByType,
): Without$Prefix<Pick<StyledButtonProps, '$color' | '$backgroundColor'>> {
  const colors: Without$Prefix<Pick<StyledButtonProps, '$color' | '$backgroundColor'>> = {
    ...DEFAULT_COLORS[type],
  };
  if ('backgroundColor' in props && props.backgroundColor) {
    colors.backgroundColor = props.backgroundColor;
  }
  if ('labelColor' in props && props.labelColor) {
    colors.color = props.labelColor;
  }
  if ('color' in props && props.color) {
    if (type === 'default') {
      colors.backgroundColor = props.color;
    } else if (type === 'outlined' || type === 'ghost') {
      colors.color = props.color;
    }
  }
  return colors;
}

const Button = ({
  type = 'default',
  disabled = false,
  label,
  size = 'medium',
  icon,
  iconPlacement = 'right',
  onClick,
  loading = false,
  width = 'fit',
  ...rest
}: ButtonProps) => {
  const clickHandler = useCallback(
    (e: KeyboardEvent | React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && onClick && !e.defaultPrevented) {
        onClick(e);
      }
    },
    [disabled, onClick],
  );

  const colors = useMemo(() => getColors(type, { type, ...rest }), [type, rest]);

  const sizeConfig = SIZES[size];
  const padding = sizeConfig.padding;
  const gap = sizeConfig.gap;
  const iconSize = sizeConfig.icon;
  const textSize = sizeConfig.label;

  const buttonWidth = width === 'fill' ? '100%' : 'auto';
  const gridWidth = width === 'fill' ? '100%' : 'fit-content';

  const buttonClassName = clsx(styles.button, type === 'outlined' && styles.outlined);

  const colorStyles = getColorStyles(colors.color, colors.backgroundColor);

  const buttonStyle: React.CSSProperties = {
    '--btn-padding': padding,
    '--btn-padding-adjusted': type === 'outlined' ? `calc(${padding} - 0.0625rem)` : padding,
    '--btn-gap': gap,
    '--btn-width': buttonWidth,
    ...colorStyles,
  } as React.CSSProperties;

  const gridStyle: React.CSSProperties = {
    '--btn-width': gridWidth,
    '--secondary-margin': padding,
  } as React.CSSProperties;

  return (
    <div className={styles.grid} style={gridStyle}>
      <button
        {...rest}
        className={buttonClassName}
        style={{ ...buttonStyle, ...rest.style }}
        disabled={disabled}
        onClick={clickHandler}
        tabIndex={disabled ? -1 : 0}
      >
        {loading && (
          <div className={styles.loadingContainer}>
            <spinner-wc color="currentColor"></spinner-wc>
          </div>
        )}
        {icon && (
          <span
            className={styles.icon}
            data-loading={loading ? 'true' : undefined}
            style={
              {
                '--icon-size': iconSize,
                '--icon-order': iconPlacement === 'left' ? 1 : 2,
              } as React.CSSProperties
            }
          >
            <icon-wc icon={icon as IconName} color="currentColor" size={iconSize}></icon-wc>
          </span>
        )}
        {label && (
          <span
            className={styles.text}
            data-loading={loading ? 'true' : undefined}
            style={
              {
                '--text-size': textSize,
                '--text-order': iconPlacement === 'left' ? 2 : 1,
              } as React.CSSProperties
            }
          >
            <zx-text
              color="currentColor"
              style={{ '--text-font-size': textSize } as React.CSSProperties}
            >
              {label}
            </zx-text>
          </span>
        )}
      </button>
    </div>
  );
};

export { Button };
