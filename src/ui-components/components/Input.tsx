/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-divider';

import { useCallback, useMemo, useState } from 'react';

import { useCombinedRefs } from '../hooks/useCombinedRefs';
import { resolveThemeColor } from '../theme/theme-utils';
import { type AnyColor } from '../types/utils';
import { INPUT_BACKGROUND_COLOR, INPUT_DIVIDER_COLOR } from './constants';
import { Container, type ContainerProps } from './Container';
import styles from './Input.module.css';
import { InputContainer } from './InputContainer';

type InputProps = ContainerProps & {
  backgroundColor?: AnyColor;
  disabled?: boolean;
  textColor?: AnyColor;
  borderColor?: AnyColor;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement> | null;
  value?: string | number;
  defaultValue?: string | number;
  hasError?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  inputName?: string;
  CustomIcon?: React.ComponentType<{ hasError: boolean; hasFocus: boolean; disabled: boolean }>;
  type?: string;
  hideBorder?: boolean;
  onEnter?: (e: KeyboardEvent) => void;
  description?: string;
  ref?: React.Ref<HTMLDivElement>;
};

type Input = React.Ref<InputProps & React.RefAttributes<HTMLDivElement>> & {
  _newId?: number;
};

const Input = ({
  autoFocus = false,
  autoComplete = 'off',
  borderColor = INPUT_DIVIDER_COLOR,
  backgroundColor = INPUT_BACKGROUND_COLOR,
  defaultValue,
  disabled = false,
  textColor = 'text',
  label,
  inputRef = null,
  value,
  CustomIcon,
  onChange,
  hasError = false,
  inputName,
  type = 'text',
  hideBorder = false,
  description,
  ref,
  ...rest
}: InputProps) => {
  const [hasFocus, setHasFocus] = useState(false);
  const innerRef = useCombinedRefs<HTMLInputElement>(inputRef);
  const [id] = useState(() => {
    if (!Input._newId) {
      Input._newId = 0;
    }

    return `input-${Input._newId++}`;
  });

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
        (hideBorder && 'transparent') ||
        (hasError && 'error') ||
        (hasFocus && 'primary') ||
        borderColor
      }${disabled ? '.disabled' : ''}`,
    [borderColor, disabled, hasError, hasFocus, hideBorder],
  );

  const labelColor = useMemo(() => {
    const color = (hasError && 'error') || (hasFocus && 'primary') || 'secondary';
    return resolveThemeColor(color, disabled ? 'disabled' : 'regular');
  }, [hasError, hasFocus, disabled]);

  const inputColor = useMemo<React.CSSProperties>(
    () =>
      ({
        '--input-color': resolveThemeColor(String(textColor), 'regular'),
        '--input-color-disabled': resolveThemeColor(String(textColor), 'disabled'),
        '--label-color': labelColor,
      } as React.CSSProperties),
    [textColor, labelColor],
  );

  const descriptionTextColor = useMemo(() => (hasError && 'error') || (hasFocus && 'primary') || 'secondary',[hasError, hasFocus])

  return (
    <Container height="fit" width="fill" crossAlignment="flex-start">
      <InputContainer
        ref={ref}
        orientation="horizontal"
        width="fill"
        height="fit"
        crossAlignment={'center'}
        borderRadius="half"
        background={backgroundColor}
        onClick={onInputFocus}
        $disabled={disabled}
        padding={{ horizontal: '0.75rem' }}
        gap={'0.5rem'}
        {...rest}
      >
        <Container
          className={styles.relativeContainer}
          style={inputColor}
          padding={{ vertical: label ? '0.0625rem' : '0.625rem' }}
          mainAlignment={'flex-end'}
          height={'fill'}
          width={'fill'}
          minHeight={'inherit'}
        >
          <input
            className={styles.input}
            autoFocus={autoFocus || undefined}
            autoComplete={autoComplete || 'off'}
            ref={innerRef}
            type={type}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            id={id}
            name={inputName ?? label}
            defaultValue={defaultValue}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={label}
          />
          {label && (
            <label htmlFor={id} className={styles.label}>
              {label}
            </label>
          )}
        </Container>
        {CustomIcon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CustomIcon hasError={hasError} hasFocus={hasFocus} disabled={disabled} />
          </span>
        )}
      </InputContainer>
      <ds-divider color={dividerColor}></ds-divider>
      {description !== undefined && (
      <zx-text overflow="break-word" size="extrasmall" class={styles.inputDescription} color={descriptionTextColor} disabled={disabled} >
          {description}
          </zx-text>
      )}
    </Container>
  );
};

Input._newId = 0;

export { Input };
export type { InputProps };
