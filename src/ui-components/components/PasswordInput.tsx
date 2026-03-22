/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-icon';

import React, { useCallback, useRef, useState } from 'react';

import type { AnyColor } from '../types/utils';
import { Input, type InputProps } from './Input';

type Props = {
  defaultValue: string | number;
  disabled: boolean;
  backgroundColor: AnyColor;
  hasError: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  borderColor: AnyColor;
};

const PasswordInput = ({
  defaultValue,
  disabled,
  hasError,
  onChange,
  label,
  borderColor,
}: Props) => {
  const [show, setShow] = useState(false);
  const showRef = useRef(show);

  const onShowClick = useCallback((ev: React.SyntheticEvent) => {
    ev.stopPropagation();
    setShow((s) => {
      showRef.current = !s;
      return !s;
    });
  }, []);

  const CustomIcon: InputProps['CustomIcon'] = useCallback(
    ({
      hasError,
      hasFocus,
      disabled,
    }: {
      hasError: boolean;
      hasFocus: boolean;
      disabled: boolean;
    }) => (
      <div
        style={{
          cursor: disabled ? 'default' : 'pointer',
          userSelect: 'none',
          display: 'flex',
        }}
        onClick={(ev: React.SyntheticEvent): void => {
          !disabled && onShowClick(ev);
        }}
      >
        <ds-icon
          icon={showRef.current ? 'EyeOutline' : 'EyeOffOutline'}
          size="large"
          color={(hasError && 'error') || (hasFocus && 'primary') || 'secondary'}
          disabled={disabled}
        ></ds-icon>
      </div>
    ),
    [onShowClick],
  );
  return (
    <Input
      defaultValue={defaultValue}
      disabled={disabled}
      hasError={hasError}
      onChange={onChange}
      label={label}
      borderColor={borderColor}
      type={show ? 'text' : 'password'}
      CustomIcon={CustomIcon}
    />
  );
};

export { PasswordInput };
