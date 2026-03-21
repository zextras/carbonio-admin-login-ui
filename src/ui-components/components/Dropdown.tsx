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
import { resolveThemeColor } from '../theme/theme-utils';
import { type AnyColor } from '../types/utils';
import { type IconName } from '../web-components/icon-registry';
import { FOCUSABLE_SELECTOR, TIMERS } from './constants';
import { Container } from './Container';
import styles from './Dropdown.module.css';
import { Padding } from './Padding';
import { Tooltip } from './Tooltip';
import { Portal } from './utilities/Portal';

type TextSize = 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';

type ListItemContentProps = {
  icon?: IconName;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  itemTextSize: TextSize;
  tooltipLabel?: string;
};

function ListItemContent({
  icon,
  label,
  selected,
  disabled,
  itemTextSize,
  tooltipLabel,
}: Readonly<ListItemContentProps>): React.JSX.Element {
  return (
    <Tooltip disabled={!disabled || !tooltipLabel} label={tooltipLabel} placement="bottom-end">
      <Container orientation="horizontal" mainAlignment="flex-start">
        {icon && (
          <Padding right="small">
            <icon-wc
              icon={icon}
              size="medium"
              color={disabled ? 'secondary' : 'text'}
              style={{ pointerEvents: 'none' }}
            ></icon-wc>
          </Padding>
        )}
        <zx-text
          size={itemTextSize}
          weight={selected ? 'bold' : 'regular'}
          color={disabled ? 'secondary.regular' : 'text'}
          disabled={disabled}
        >
          {label}
        </zx-text>
      </Container>
    </Tooltip>
  );
}

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
    customComponent?: React.ReactNode;
    selectedBackgroundColor?: AnyColor;
    keepOpen?: boolean;
  };

function PopperListItem({
  icon,
  label,
  onClick,
  selected,
  customComponent,
  disabled = false,
  selectedBackgroundColor,
  itemTextSize,
  keepOpen,
  tooltipLabel,
  ...rest
}: Readonly<PopperListItemProps>): React.JSX.Element {
  const containerStyle = useContainerElStyle(selected, selectedBackgroundColor);
  return (
    <Container
      data-keep-open={keepOpen}
      className={clsx(styles.containerEl, disabled && styles.disabled, selected && 'zapp-selected')}
      style={containerStyle}
      orientation="horizontal"
      mainAlignment="flex-start"
      padding={{ vertical: 'small', horizontal: 'large' }}
      background={selected && selectedBackgroundColor ? selectedBackgroundColor : undefined}
      onClick={(!disabled && onClick) || undefined}
      tabIndex={disabled ? -1 : 0}
      data-testid={'dropdown-item'}
      {...rest}
    >
      {customComponent || (
        <ListItemContent
          icon={icon}
          label={label}
          selected={selected}
          disabled={disabled}
          itemTextSize={itemTextSize}
          tooltipLabel={tooltipLabel}
        />
      )}
    </Container>
  );
}

type NestListItemProps = PopperListItemProps & Pick<DropdownProps, 'onOpen' | 'onClose' | 'items'>;

function NestListItem({
  icon,
  label,
  onClick,
  selected,
  customComponent,
  disabled = false,
  items,
  selectedBackgroundColor,
  itemTextSize,
  keepOpen,
  tooltipLabel,
  onOpen,
  onClose,
  ...rest
}: Readonly<NestListItemProps>): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [innerDropdownListElement, setInnerDropdownListElement] = useState<HTMLDivElement | null>(
    null,
  );
  const setDropdownListRef = useCallback<React.RefCallback<HTMLDivElement>>((node) => {
    setInnerDropdownListElement(node);
  }, []);
  const closeNestedDropdownTimeoutRef = useRef<number>(undefined);
  const containerStyle = useContainerElStyle(selected, selectedBackgroundColor);

  useEffect(
    () => () => {
      if (closeNestedDropdownTimeoutRef.current !== undefined) {
        clearTimeout(closeNestedDropdownTimeoutRef.current);
      }
    },
    [],
  );

  const openNestedDropdown = useCallback(() => {
    if (closeNestedDropdownTimeoutRef.current !== undefined) {
      clearTimeout(closeNestedDropdownTimeoutRef.current);
      closeNestedDropdownTimeoutRef.current = undefined;
    }
    setOpen(true);
    onOpen?.();
  }, [onOpen]);

  const closeNestedDropdown = useCallback(() => {
    if (closeNestedDropdownTimeoutRef.current !== undefined) {
      clearTimeout(closeNestedDropdownTimeoutRef.current);
      closeNestedDropdownTimeoutRef.current = undefined;
    }
    const focusIsOnChild = itemRef.current?.contains(document.activeElement);
    setOpen(false);
    onClose?.();
    if (focusIsOnChild) {
      itemRef.current?.focus({ preventScroll: true });
    }
  }, [onClose]);

  const closeOnMouseLeave = useCallback(
    (event: Event) => {
      if (event.target instanceof Node) {
        const eventIsOnTrigger = itemRef.current?.contains(event.target);
        const eventIsOnDropdown = innerDropdownListElement?.contains(event.target);
        if (!eventIsOnDropdown && !eventIsOnTrigger) {
          if (closeNestedDropdownTimeoutRef.current === undefined) {
            closeNestedDropdownTimeoutRef.current = setTimeout(() => {
              closeNestedDropdown();
            }, TIMERS.DROPDOWN.CLOSE_NESTED) as unknown as number;
          }
        } else if (closeNestedDropdownTimeoutRef.current !== undefined) {
          clearTimeout(closeNestedDropdownTimeoutRef.current);
          closeNestedDropdownTimeoutRef.current = undefined;
        }
      }
    },
    [closeNestedDropdown, innerDropdownListElement],
  );

  useEffect(() => {
    if (open) {
      window.addEventListener('mouseover', closeOnMouseLeave);
    }
    return (): void => {
      window.removeEventListener('mouseover', closeOnMouseLeave);
    };
  }, [closeOnMouseLeave, open]);

  return (
    <Container
      data-keep-open={keepOpen}
      ref={itemRef}
      className={clsx(styles.containerEl, disabled && styles.disabled, selected && 'zapp-selected')}
      style={containerStyle}
      orientation="horizontal"
      mainAlignment="flex-start"
      onClick={disabled ? undefined : onClick}
      tabIndex={disabled ? undefined : 0}
      data-testid={'dropdown-item'}
      onMouseEnter={openNestedDropdown}
      {...rest}
    >
      <Dropdown
        display="block"
        items={items}
        placement="right-start"
        itemTextSize={itemTextSize}
        _dropdownListRef={setDropdownListRef}
        disablePortal
      >
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          padding={{ vertical: 'small', horizontal: 'large' }}
        >
          {customComponent || (
            <ListItemContent
              icon={icon}
              label={label}
              selected={selected}
              disabled={disabled}
              itemTextSize={itemTextSize}
              tooltipLabel={tooltipLabel}
            />
          )}
          <icon-wc size="medium" icon="ChevronRight"></icon-wc>
        </Container>
      </Dropdown>
    </Container>
  );
}

interface DropdownItem {
  type?: 'divider';
  id: string;
  label?: string;
  icon?: IconName;
  onClick?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
  selected?: boolean;
  customComponent?: React.ReactNode;
  disabled?: boolean;
  items?: Array<DropdownItem>;
  keepOpen?: boolean;
  tooltipLabel?: string;
}

type DropdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'contextMenu'> & {
  disabled?: boolean;
  items: Array<DropdownItem>;
  display?: 'block' | 'inline-block';
  maxWidth?: string;
  maxHeight?: string;
  disableRestoreFocus?: boolean;
  disableAutoFocus?: boolean;
  multiple?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  children: React.ReactElement;
  placement?: Placement;
  disablePortal?: boolean;
  preventDefault?: boolean;
  itemTextSize?: TextSize;
  /** @internal */
  _dropdownListRef?:
    | React.RefCallback<HTMLDivElement>
    | React.RefObject<HTMLDivElement | null>
    | null;
};

const Dropdown = ({
  disabled = false,
  items,
  placement = 'bottom-start' as const,
  display = 'inline-block',
  maxWidth = '18.75rem',
  maxHeight = '50vh',
  disableRestoreFocus = false,
  disableAutoFocus = false,
  multiple = false,
  onOpen,
  onClose,
  children,
  disablePortal = false,
  itemTextSize = 'medium',
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
      if (!disableRestoreFocus) {
        const triggerElement = innerTriggerRef.current;
        if (triggerElement) {
          if (triggerElement.matches(FOCUSABLE_SELECTOR)) {
            triggerElement.focus();
          } else {
            triggerElement.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
          }
        }
      }
      onClose?.();
    },
    [disableRestoreFocus, innerTriggerRef, onClose],
  );

  const toggleOpen = useCallback<(e: React.SyntheticEvent | KeyboardEvent) => void>(
    (e) => {
      if (openRef.current) {
        e.preventDefault();
        closePopper();
      } else if (!disabled) {
        e.preventDefault();
        openPopper();
      }
    },
    [closePopper, disabled, openPopper],
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
      if (node && !disableAutoFocus) {
        const itemToFocus = node.querySelector<HTMLElement>('.zapp-selected') ?? node.firstChild;
        if (itemToFocus instanceof HTMLElement) {
          itemToFocus.focus();
        }
      }
    },
    [disableAutoFocus],
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
    if (open && !disableAutoFocus) {
      startSentinelRefElement?.addEventListener('focus', onStartSentinelFocus);
      endSentinelRefElement?.addEventListener('focus', onEndSentinelFocus);
    }
    return (): void => {
      startSentinelRefElement?.removeEventListener('focus', onStartSentinelFocus);
      endSentinelRefElement?.removeEventListener('focus', onEndSentinelFocus);
    };
  }, [
    open,
    startSentinelRef,
    endSentinelRef,
    onStartSentinelFocus,
    onEndSentinelFocus,
    disableAutoFocus,
  ]);

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
        if (!multiple && !keepOpen) {
          closePopper();
        } else {
          event.stopPropagation();
        }
      },
    [closePopper, multiple],
  );

  const popperListItems = useMemo(() => {
    nestedDropdownsRef.current = [];
    if (items) {
      return items.map(
        ({
          id,
          icon,
          label,
          onClick,
          selected,
          customComponent,
          items: subItems,
          disabled: itemDisabled,
          type,
          keepOpen,
          ...itemProps
        }) => {
          const nestedRef = React.createRef<HTMLDivElement>();
          nestedDropdownsRef.current.push(nestedRef);
          return (
            (type === 'divider' && <ds-divider key={id}></ds-divider>) ||
            (subItems && (
              <NestListItem
                icon={icon}
                label={label ?? ''}
                onClick={listItemClickHandler(onClick, keepOpen)}
                keepOpen={keepOpen}
                selected={selected}
                key={id}
                customComponent={customComponent}
                disabled={itemDisabled}
                items={subItems}
                itemTextSize={itemTextSize}
                {...itemProps}
              />
            )) || (
              <PopperListItem
                icon={icon}
                label={label ?? ''}
                onClick={listItemClickHandler(onClick, keepOpen)}
                keepOpen={keepOpen}
                selected={selected}
                key={id}
                customComponent={customComponent}
                disabled={itemDisabled}
                itemTextSize={itemTextSize}
                {...itemProps}
              />
            )
          );
        },
      );
    }
    return null;
  }, [items, listItemClickHandler, itemTextSize]);

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
      '--popper-max-height': maxHeight,
    } as CSSProperties;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWidth, maxHeight, open, innerTriggerRef]);

  return (
    <div className={styles.popperDropdownWrapper} data-display={display} {...rest}>
      {triggerComponent}
      <Portal show={open} disablePortal={disablePortal}>
        <div
          ref={dropdownRef}
          className={clsx(styles.popperList, open && styles.open)}
          style={popperListStyle}
          data-testid="dropdown-popper-list"
          onClick={popperListPreventDefaultHandler}
        >
          <div tabIndex={0} ref={startSentinelRef} />
          <div ref={setPopperItemsRefAndFocus}>{popperListItems}</div>
          <div tabIndex={0} ref={endSentinelRef} />
        </div>
      </Portal>
    </div>
  );
};

export { Dropdown, type DropdownItem, type DropdownProps };
