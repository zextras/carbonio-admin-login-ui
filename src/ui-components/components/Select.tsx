/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-divider';
import '../web-components/ds-icon';

import clsx from 'clsx';
import React, { type HTMLAttributes, useCallback, useEffect, useId, useRef, useState } from 'react';

import { getPaddingVar } from '../theme/theme-utils';
import { INPUT_DIVIDER_COLOR } from './constants';
import styles from './Select.module.css';

// ─── Types ───────────────────────────────────────────────────────────

type SelectItem = {
  label: string;
  value: string;
};

type SelectProps<T = string> = Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'contextMenu'> & {
  label?: string;
  items: SelectItem[];
  defaultSelection?: SelectItem;
  onChange: (value: T | null) => void;
};

// ─── Select ──────────────────────────────────────────────────────────

export function Select<T = string>({
  items,
  label,
  onChange,
  defaultSelection,
  ...rest
}: Readonly<SelectProps<T>>): React.JSX.Element {
  const [selected, setSelected] = useState<SelectItem | null>(defaultSelection ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const anchorId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Selection ────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (item: SelectItem) => {
      if (item.value !== selected?.value) {
        setSelected(item);
        (onChange as (v: string | null) => void)(item.value);
      }
      setIsOpen(false);
    },
    [selected, onChange],
  );

  // ── Open / Close ─────────────────────────────────────────────────

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // ── Popover show/hide ────────────────────────────────────────────

  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;
    if (isOpen) {
      el.showPopover();
    } else {
      el.hidePopover();
    }
  }, [isOpen]);

  // Sync state when popover is dismissed via light-dismiss (click outside / Escape)
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;

    const handleToggle = (e: ToggleEvent): void => {
      if (e.newState === 'closed') {
        setIsOpen(false);
      }
    };

    el.addEventListener('toggle', handleToggle as EventListener);
    return () => el.removeEventListener('toggle', handleToggle as EventListener);
  }, []);

  // ── Focus selected item on open ──────────────────────────────────

  const listRefCallback = useCallback<React.RefCallback<HTMLDivElement>>((node) => {
    listRef.current = node;
    if (node) {
      const target = node.querySelector<HTMLElement>('.zapp-selected') ?? node.firstElementChild;
      (target as HTMLElement | null)?.focus();
    }
  }, []);

  // ── Derived values ───────────────────────────────────────────────

  const active = isOpen || isFocused;
  const accentColor = active ? 'primary' : 'secondary';
  const hasSelection = selected !== null;

  const labelStyle: React.CSSProperties = {
    top: hasSelection ? 'calc(var(--padding-size-small) - 0.0625rem)' : '50%',
    transform: hasSelection ? 'translateY(0)' : 'translateY(-50%)',
  };

  // CSS custom property name derived from useId (strip colons for valid CSS ident)
  const anchorName = `--anchor-${anchorId.replace(/:/g, '')}`;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className={styles.popperDropdownWrapper} {...rest}>
      {/* Trigger — acts as CSS anchor */}
      <div
        ref={triggerRef}
        onClick={toggle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={styles.tabContainer}
        style={{ anchorName } as React.CSSProperties}
      >
        <div
          className={clsx(styles.container, isFocused && styles.containerFocused)}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderRadius: 'var(--border-radius) var(--border-radius) 0 0',
            padding: getPaddingVar({ horizontal: 'large', vertical: 'small' }),
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexGrow: 1,
              flexBasis: 0,
              alignItems: 'center',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
          >
            <ds-text
              color="text"
              className={styles.customText}
              style={{ width: '100%', paddingTop: 'var(--padding-size-medium)' }}
            >
              {selected?.label ?? ''}
            </ds-text>
            <div className={styles.label} style={labelStyle}>
              <ds-text size={hasSelection ? 'small' : 'medium'} color={accentColor}>
                {label}
              </ds-text>
            </div>
          </div>
          <div className={styles.iconWrapper}>
            <ds-icon size="medium" icon={isOpen ? 'ArrowUp' : 'ArrowDown'} color={accentColor} />
          </div>
        </div>
        <ds-divider color={active ? 'primary' : INPUT_DIVIDER_COLOR} />
      </div>

      {/* Dropdown — positioned via CSS anchor positioning + Popover API */}
      <div
        ref={dropdownRef}
        popover="auto"
        className={clsx(styles.popperList, isOpen && styles.open)}
        style={
          {
            positionAnchor: anchorName,
            top: 'anchor(bottom)',
            left: 'anchor(left)',
            width: 'anchor-size(width)',
            maxHeight: '50vh',
            overflow: 'auto',
            margin: 0,
          } as React.CSSProperties
        }
        data-testid="dropdown-popper-list"
        onClick={(e) => e.preventDefault()}
      >
        <div ref={listRefCallback}>
          {items.map((item, i) => {
            const isSelected = item.value === selected?.value;
            return (
              <div
                key={`${i}-${item.value}`}
                className={clsx(styles.containerEl, isSelected && 'zapp-selected')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: getPaddingVar({ vertical: 'small', horizontal: 'large' }),
                  borderRadius: 'var(--border-radius)',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                onClick={() => handleSelect(item)}
                tabIndex={0}
                data-testid="dropdown-item"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
