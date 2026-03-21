/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-icon';

import { useCallback, useMemo, useState } from 'react';

import { INPUT_DIVIDER_COLOR } from './constants';
import { Container } from './Container';
import { Dropdown, type DropdownItem, type DropdownProps } from './Dropdown';
import { Padding } from './Padding';
import { Row } from './Row';
import styles from './Select.module.css';

type SelectItem = {
  label: string;
  value: string;
};

type LabelFactoryProps = {
  label: string | undefined;
  open: boolean;
  focus: boolean;
  selected: SelectItem[];
};

type SingleSelectionOnChange<T = string> = (value: T | null) => void;

type UncontrolledSingleSelection<T> = {
  multiple?: false;
  selection?: never;
  defaultSelection?: SelectItem;
  onChange: SingleSelectionOnChange<T>;
};

type SelectComponentProps<T> = {
  label?: string;
  background?: string;
  items: Array<{ label: string; value: string }>;
  i18nAllLabel?: string;
  /** Flag to disable the Portal implementation of dropdown */
  disablePortal?: boolean;
  /** Whether to show checkboxes */
  showCheckbox?: boolean;
} & UncontrolledSingleSelection<T>;

type SelectProps<T = string> = SelectComponentProps<T> &
  Omit<DropdownProps, keyof SelectComponentProps<T> | 'children'>;

const DefaultLabelFactory = ({
  selected,
  label,
  open,
  focus,
}: LabelFactoryProps): React.JSX.Element => {
  const selectedLabels = useMemo(
    () => selected.reduce<string[]>((arr, obj) => [...arr, obj.label], []).join(', '),
    [selected],
  );

  const hasSelection = selected.length > 0;
  const labelColor = ((open || focus) && 'primary') || 'secondary';
  const iconColor = ((open || focus) && 'primary') || 'secondary';

  const labelStyle: React.CSSProperties = {
    top: hasSelection ? 'calc(var(--padding-size-small) - 0.0625rem)' : '50%',
    transform: hasSelection ? 'translateY(0)' : 'translateY(-50%)',
  };

  return (
    <>
      <Container
        orientation="horizontal"
        width="fill"
        crossAlignment="flex-end"
        mainAlignment="space-between"
        borderRadius="half"
        padding={{
          horizontal: 'large',
          vertical: 'small',
        }}
        className={`${styles.container}${focus ? ` ${styles.containerFocused}` : ''}`}
      >
        <Row takeAvailableSpace mainAlignment="unset">
          <Padding top="medium" width="100%">
            <ds-text color="text" className={styles.customText}>
              {selectedLabels}
            </ds-text>
          </Padding>
          <div className={styles.label} style={labelStyle}>
            <ds-text size={hasSelection ? 'small' : 'medium'} color={labelColor}>
              {label}
            </ds-text>
          </div>
        </Row>
        <div className={styles.iconWrapper}>
          <ds-icon size="medium" icon={open ? 'ArrowUp' : 'ArrowDown'} color={iconColor}></ds-icon>
        </div>
      </Container>
      <ds-divider color={open || focus ? 'primary' : INPUT_DIVIDER_COLOR}></ds-divider>
    </>
  );
};

export const Select = function SelectFn<T = string>({
  items,
  label,
  onChange,
  defaultSelection,
}: SelectProps<T>): React.JSX.Element {
  const initialState = defaultSelection ?? [];
  const [selected, setSelected] = useState<SelectItem[]>(
    Array.isArray(initialState) ? initialState : [initialState],
  );
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);

  const updateSingleSelection = useCallback(
    (item: SelectItem) => {
      setSelected(item.value !== null && item.value !== undefined ? [item] : []);
      (onChange as SingleSelectionOnChange)(item.value);
    },
    [onChange],
  );

  const clickItemHandler = useCallback(
    (item: SelectItem) => (): void => {
      if (selected.length === 0 || item.value !== selected?.[0]?.value) {
        updateSingleSelection(item);
      }
    },
    [selected, updateSingleSelection],
  );

  const mappedItems = useMemo(
    () =>
      items.map((item, index): DropdownItem => {
        const isSelected = selected.some((s) => s.value === item.value);
        return {
          id: `${index}-${item.label}`,
          label: item.label,
          icon: isSelected ? 'CheckmarkSquare' : 'Square',
          onClick: clickItemHandler(item),
          selected: isSelected,
        };
      }),
    [items, selected, clickItemHandler],
  );

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onFocus = useCallback(() => setFocus(true), []);
  const onBlur = useCallback(() => setFocus(false), []);

  return (
    <Dropdown items={mappedItems} onOpen={onOpen} onClose={onClose}>
      <div onFocus={onFocus} onBlur={onBlur} className={styles.tabContainer}>
        <DefaultLabelFactory label={label} open={open} focus={focus} selected={selected} />
      </div>
    </Dropdown>
  );
};
