/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo, useRef } from 'react';

import { useCheckbox } from '../hooks/useCheckbox';
import { resolveThemeColor } from '../theme/theme-utils';
import styles from './Checkbox.module.css';
import { Container, type ContainerProps } from './Container';
import { Padding } from './Padding';
import { Text } from './Text';


export type CheckboxProps = Omit<ContainerProps, 'onChange' | 'onClick'> & {
value?: boolean;
label?: string;
onClick?: (event: Event) => void;
};

export const Checkbox = ({
  value,
  label,
  onClick,
  ...rest
}: CheckboxProps) => {
  const iconColor = 'gray0'
  const innerRef = useRef<HTMLDivElement>(null);
  const checked = useCheckbox({
    ref: innerRef,
    value,
    onClick,
  });

    const iconWrapperClassName = styles.iconWrapper ;

  const iconWrapperStyle: React.CSSProperties = useMemo(
    () =>
      ({
        '--icon-wrapper-height':'calc(var(--font-size-medium) * 1.5)',
        '--icon-color-focus': resolveThemeColor(iconColor, 'focus'),
        '--icon-color-hover': resolveThemeColor(iconColor, 'hover'),
        '--icon-color-active': resolveThemeColor(iconColor, 'active'),
      } as React.CSSProperties),
    [ iconColor],
  );

  return (
    <Container
      ref={innerRef}
      orientation="horizontal"
      width="fit"
      height="fit"
      style={{ cursor: 'default'  }}
      crossAlignment="flex-start"
      data-testid={'checkbox'}
      {...rest}
    >
      <div className={iconWrapperClassName} style={iconWrapperStyle} tabIndex={ -1 }>
        <icon-wc
          icon={checked ? 'CheckmarkSquare' : 'Square'}
          color={iconColor}
        />
      </div>
      {label && (
        <Padding left="small">
          <Text
            className={styles.customText}
            weight="regular"
            overflow="break-word"
            color="gray0"
          >
            {label}
          </Text>
        </Padding>
      )}
    </Container>
  );
};
