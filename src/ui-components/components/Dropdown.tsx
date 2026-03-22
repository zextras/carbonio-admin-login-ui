/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../web-components/ds-divider';

import { flip, limitShift, type Placement, shift } from '@floating-ui/dom';
import clsx from 'clsx';
import React, {
  type CSSProperties,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { setupFloating } from '../floating-ui';
import { getPaddingVar, resolveThemeColor } from '../theme/theme-utils';
import { type AnyColor } from '../types/utils';
import { type IconName } from '../web-components/icon-registry';
import { FOCUSABLE_SELECTOR } from './constants';
import styles from './Dropdown.module.css';

type ListItemContentProps = {
  label: string;
  selected?: boolean;
};

function useContainerElStyle(
  selected: boolean | undefined,
  selectedBackgroundColor?: AnyColor,
): CSSProperties {
  return useMemo<CSSProperties>(() => {
    const bgColor = selected && selectedBackgroundColor ? selectedBackgroundColor : 'gray5';
    return {
      '--dropdown-item-bg': resolveThemeColor(String(bgColor), 'regular'),
      '--dropdown-item-bg-hover': resolveThemeColor(String(bgColor), 'hover'),
      '--dropdown-item-bg-focus': resolveThemeColor(String(bgColor), 'focus'),
      '--dropdown-item-bg-active': resolveThemeColor(String(bgColor), 'active'),
    } as CSSProperties;
  }, [selected, selectedBackgroundColor]);
}

type PopperListItemProps = ListItemContentProps &
  HTMLAttributes<HTMLDivElement> & {
    onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
    selectedBackgroundColor?: AnyColor;
    keepOpen?: boolean;
  };

function PopperListItem({
  onClick,
  selected,
  selectedBackgroundColor,
  keepOpen,
  ...rest
}: Readonly<PopperListItemProps>): React.JSX.Element {
  const containerStyle = useContainerElStyle(selected, selectedBackgroundColor);
  const bgColor = selected && selectedBackgroundColor ? selectedBackgroundColor : undefined;
  return (
    <div
      data-keep-open={keepOpen}
      className={clsx(styles.containerEl, selected && 'zapp-selected')}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: getPaddingVar({ vertical: 'small', horizontal: 'large' }),
        background: bgColor ? resolveThemeColor(String(bgColor), 'regular') : undefined,
        borderRadius: 'var(--border-radius)',
        boxSizing: 'border-box',
        ...containerStyle,
      }}
      onClick={onClick || undefined}
      tabIndex={0}
      data-testid={'dropdown-item'}
      {...rest}
    ></div>
  );
}

interface DropdownItem {
  id: string;
  label?: string;
  icon?: IconName;
  onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
  selected?: boolean;
}

type DropdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'contextMenu'> & {
  items: Array<DropdownItem>;
  onOpen?: () => void;
  onClose?: () => void;
  placement?: Placement;
  /** @internal */
  _dropdownListRef?:
    | React.RefCallback<HTMLDivElement>
    | React.RefObject<HTMLDivElement | null>
    | null;
};

export const Dropdown = ({
  items,
  placement = 'bottom-start' as const,
  onOpen,
  onClose,
  children,
  ...rest
}: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const openRef = useRef<boolean>(open);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const innerTriggerRef = useRef<HTMLDivElement | null>(null);
  const popperItemsRef = useRef<HTMLDivElement | null>(null);
  const startSentinelRef = useRef<HTMLDivElement | null>(null);
  const endSentinelRef = useRef<HTMLDivElement | null>(null);
  const nestedDropdownsRef = useRef<Array<React.RefObject<HTMLDivElement | null>>>([]);

  const openPopper = useCallback(() => {
    setOpen(true);
    openRef.current = true;
    onOpen?.();
  }, [onOpen]);

  const closePopper = useCallback(
    (e?: React.SyntheticEvent | KeyboardEvent) => {
      e?.preventDefault();
      setOpen(false);
      openRef.current = false;
      const triggerElement = innerTriggerRef.current;
      if (triggerElement) {
        if (triggerElement.matches(FOCUSABLE_SELECTOR)) {
          triggerElement.focus();
        } else {
          triggerElement.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
        }
      }
      onClose?.();
    },
    [innerTriggerRef, onClose],
  );

  const toggleOpen = useCallback<(e: React.SyntheticEvent | KeyboardEvent) => void>(
    (e) => {
      if (openRef.current) {
        e.preventDefault();
        closePopper();
      } else {
        e.preventDefault();
        openPopper();
      }
    },
    [closePopper, openPopper],
  );

  const triggerComponentLeftClickHandler = useCallback<React.ReactEventHandler>(
    (e) => {
      if (React.isValidElement(children)) {
        (children.props as { onClick?: (e: React.SyntheticEvent) => void }).onClick?.(e);
      }
      toggleOpen(e);
    },
    [children, toggleOpen],
  );

  const clickOutsidePopper = useCallback(
    (e: Event) => {
      const clickedOnDropdown =
        dropdownRef.current &&
        (e.target === dropdownRef.current || dropdownRef.current.contains(e.target as Node | null));
      const clickedOnTrigger =
        innerTriggerRef.current &&
        (e.target === innerTriggerRef.current ||
          innerTriggerRef.current?.contains(e.target as Node | null));
      const clickedOnNestedItem = nestedDropdownsRef.current?.some((nestedItemRef) =>
        nestedItemRef.current?.contains(e.target as Node | null),
      );
      if (
        !clickedOnDropdown &&
        !clickedOnTrigger &&
        !clickedOnNestedItem &&
        !e
          .composedPath?.()
          ?.some((el) => el instanceof Element && el.hasAttribute?.('data-keep-open'))
      ) {
        closePopper();
      }
    },
    [closePopper, dropdownRef, innerTriggerRef],
  );

  const onStartSentinelFocus = useCallback(() => {
    const lastChild = popperItemsRef.current?.querySelector<HTMLElement>('[tabindex]:last-child');
    lastChild?.focus();
  }, []);
  const onEndSentinelFocus = useCallback(() => {
    const lastChild = popperItemsRef.current?.querySelector<HTMLElement>('[tabindex]:first-child');
    lastChild?.focus();
  }, []);

  useLayoutEffect(() => {
    let cleanup: ReturnType<typeof setupFloating>;
    if (open) {
      const popperReference = innerTriggerRef.current;
      if (popperReference && dropdownRef.current) {
        cleanup = setupFloating(popperReference, dropdownRef.current, {
          placement,
          middleware: [flip(), shift({ limiter: limitShift() })],
          strategy: 'fixed',
        });
      }
    }
    return (): void => {
      cleanup?.();
    };
  }, [open, placement, dropdownRef, innerTriggerRef]);

  const setPopperItemsRefAndFocus = useCallback<React.RefCallback<HTMLDivElement | null>>(
    (node) => {
      popperItemsRef.current = node;
      if (node) {
        const itemToFocus = node.querySelector<HTMLElement>('.zapp-selected') ?? node.firstChild;
        if (itemToFocus instanceof HTMLElement) {
          itemToFocus.focus();
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (open) {
      window.document.addEventListener('click', clickOutsidePopper, true);
    }

    return (): void => {
      window.document.removeEventListener('click', clickOutsidePopper, true);
      window.document.removeEventListener('contextmenu', clickOutsidePopper, true);
    };
  }, [open, closePopper, clickOutsidePopper]);

  useEffect(() => {
    const startSentinelRefElement = startSentinelRef.current;
    const endSentinelRefElement = endSentinelRef.current;
    if (open) {
      startSentinelRefElement?.addEventListener('focus', onStartSentinelFocus);
      endSentinelRefElement?.addEventListener('focus', onEndSentinelFocus);
    }
    return (): void => {
      startSentinelRefElement?.removeEventListener('focus', onStartSentinelFocus);
      endSentinelRefElement?.removeEventListener('focus', onEndSentinelFocus);
    };
  }, [open, startSentinelRef, endSentinelRef, onStartSentinelFocus, onEndSentinelFocus]);

  const listItemClickHandler = useCallback<
    (
      onClick?: PopperListItemProps['onClick'],
      keepOpen?: boolean,
    ) => (event: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void
  >(
    (onClick, keepOpen) =>
      (event): void => {
        if (!event.defaultPrevented) {
          onClick?.(event);
        }
        if (!keepOpen) {
          closePopper();
        } else {
          event.stopPropagation();
        }
      },
    [closePopper],
  );

  const popperListItems = useMemo(() => {
    nestedDropdownsRef.current = [];
    if (items) {
      return items.map(({ id, label, onClick, selected, ...itemProps }) => {
        const nestedRef = React.createRef<HTMLDivElement>();
        nestedDropdownsRef.current.push(nestedRef);
        return (
          <PopperListItem
            label={label ?? ''}
            onClick={listItemClickHandler(onClick, false)}
            selected={selected}
            key={id}
            {...itemProps}
          />
        );
      });
    }
    return null;
  }, [items, listItemClickHandler]);

  const popperListPreventDefaultHandler = useCallback<React.MouseEventHandler>((event) => {
    event?.preventDefault?.();
  }, []);

  const triggerComponent = useMemo(() => {
    const props = { onClick: triggerComponentLeftClickHandler };
    return React.cloneElement(children, {
      ref: innerTriggerRef,
      ...props,
    } as unknown as Partial<React.HTMLAttributes<HTMLElement>>);
  }, [children, innerTriggerRef, triggerComponentLeftClickHandler]);

  const popperListStyle = useMemo<CSSProperties>(() => {
    const triggerWidth = innerTriggerRef.current?.clientWidth;

    return {
      width: `${triggerWidth}px`,
      maxWidth: '100%',
      '--popper-max-height': '50vh',
    } as CSSProperties;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, innerTriggerRef]);

  useEffect(() => {
    const dropdownEl = dropdownRef.current;
    if (dropdownEl) {
      if (open) {
        dropdownEl.showPopover();
      } else {
        dropdownEl.hidePopover();
      }
    }
  }, [open]);

  return (
    <div className={styles.popperDropdownWrapper} {...rest}>
      {triggerComponent}
      <div
        ref={dropdownRef}
        popover="manual"
        className={clsx(styles.popperList, open && styles.open)}
        style={popperListStyle}
        data-testid="dropdown-popper-list"
        onClick={popperListPreventDefaultHandler}
      >
        <div ref={startSentinelRef} />
        <div ref={setPopperItemsRefAndFocus}>{popperListItems}</div>
        <div ref={endSentinelRef} />
      </div>
    </div>
  );
};

export { type DropdownItem, type DropdownProps };
