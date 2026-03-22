/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-divider';

import { useCallback, useId, useMemo, useRef, useState } from 'react';

import { getPaddingVar, resolveThemeColor } from '../theme/theme-utils';
import { type AnyColor } from '../types/utils';
import { INPUT_BACKGROUND_COLOR, INPUT_DIVIDER_COLOR } from './constants';
import styles from './Input.module.css';

export type InputProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string | number;
  disabled?: boolean;
  hasError?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  borderColor?: AnyColor;
};

export const Input = ({
  defaultValue,
  disabled = false,
  hasError = false,
  onChange,
  label,
  borderColor = INPUT_DIVIDER_COLOR,
}: InputProps) => {
  const [hasFocus, setHasFocus] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const onInputFocus = useCallback(() => {
    if (!disabled && innerRef?.current) {
      setHasFocus(true);
      innerRef.current.focus();
    }
  }, [innerRef, disabled]);

  const onInputBlur = useCallback(() => {
    setHasFocus(false);
  }, []);

  const dividerColor = useMemo<AnyColor>(
    () =>
      `${
        (hasError && 'error') || (hasFocus && 'primary') || borderColor
      }${disabled ? '.disabled' : ''}`,
    [borderColor, disabled, hasError, hasFocus],
  );

  const labelColor = useMemo(() => {
    const color = (hasError && 'error') || (hasFocus && 'primary') || 'secondary';
    return resolveThemeColor(color, disabled ? 'disabled' : 'regular');
  }, [hasError, hasFocus, disabled]);

  const inputColor = useMemo<React.CSSProperties>(
    () =>
      ({
        '--input-color': resolveThemeColor('text', 'regular'),
        '--input-color-disabled': resolveThemeColor('text', 'disabled'),
        '--label-color': labelColor,
      }) as React.CSSProperties,
    [labelColor],
  );

  const containerStyle = useMemo<React.CSSProperties>(
    () =>
      ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        width: '100%',
        height: 'fit-content',
        padding: getPaddingVar({ horizontal: '0.75rem' }),
        gap: '0.5rem',
        borderRadius: 'var(--border-radius) var(--border-radius) 0 0',
        boxSizing: 'border-box',
        '--input-container-bg': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'regular'),
        '--input-container-bg-hover': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'hover'),
        '--input-container-bg-focus': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'focus'),
        '--input-container-bg-active': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'active'),
        '--input-container-bg-disabled': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'disabled'),
      }) as React.CSSProperties,
    [],
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        borderRadius: 'var(--border-radius)',
        boxSizing: 'border-box',
      }}
    >
      <div
        className={disabled ? styles.inputContainerDisabled : styles.inputContainer}
        style={containerStyle}
        onClick={onInputFocus}
      >
        <div
          className={styles.relativeContainer}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'nowrap',
            borderRadius: 'var(--border-radius)',
            boxSizing: 'border-box',
            padding: getPaddingVar({ vertical: label ? '0.0625rem' : '0.625rem' }),
            height: '100%',
            width: '100%',
            minHeight: 'inherit',
            ...inputColor,
          }}
        >
          <input
            className={styles.input}
            autoComplete={'off'}
            ref={innerRef}
            type={'text'}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            id={id}
            name={label}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            placeholder={label}
          />
          {label && (
            <label htmlFor={id} className={styles.label}>
              {label}
            </label>
          )}
        </div>
      </div>
      <ds-divider color={dividerColor}></ds-divider>
    </div>
  );
};
