/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useRef, useState } from 'react';

import type { AnyColor } from '../types/utils';

type Props = {
  defaultValue: string | number;
  disabled: boolean;
  backgroundColor: AnyColor;
  hasError: boolean;
  onChange:
    | (React.ChangeEventHandler<HTMLElement, Element> &
        ((
          e: CustomEvent<{
            value: string;
          }>,
        ) => void))
    | undefined;
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

  const onShowKeyDown = useCallback(
    (ev: React.KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        onShowClick(ev);
      }
    },
    [onShowClick],
  );

  return (
    <ds-input
      defaultValue={defaultValue}
      disabled={disabled}
      has-error={hasError}
      onChange={onChange}
      label={label}
      border-color={borderColor}
      type={show ? 'text' : 'password'}
    >
      <div
        slot="icon"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={(ev: React.SyntheticEvent): void => {
          if (!disabled) onShowClick(ev);
        }}
        onKeyDown={(ev: React.KeyboardEvent): void => {
          if (!disabled) onShowKeyDown(ev);
        }}
      >
        <ds-icon
          icon={showRef.current ? 'EyeOutline' : 'EyeOffOutline'}
          size="large"
          disabled={disabled}
        ></ds-icon>
      </div>
    </ds-input>
  );
};

export { PasswordInput };
