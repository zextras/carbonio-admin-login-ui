/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './theme/theme.css';
import './ds-text';
import './ds-icon';
import './ds-divider';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { selectStyles } from './ds-select.styles';
import { setupFloating } from './floating-ui';

export type SelectItem = {
  label: string;
  value: string;
};

const ITEM_ID_PREFIX = 'ds-select-item-';

let instanceCounter = 0;

@customElement('ds-select')
export class DsSelect extends LitElement {
  static override readonly styles = selectStyles;

  @property({ type: String, reflect: true })
  accessor label: string | undefined;

  @property({ type: Array })
  accessor items: Array<SelectItem> = [];

  @property({ type: Object, attribute: 'default-selection' })
  accessor defaultSelection: SelectItem | undefined;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @state()
  private accessor _selected: SelectItem | null = null;

  @state()
  private accessor _isOpen = false;

  @state()
  private accessor _focused = false;

  @state()
  private accessor _activeDescendantIndex = -1;

  @query('.trigger')
  private accessor _trigger: HTMLElement | null = null;

  @query('.dropdown')
  private accessor _dropdown: HTMLElement | null = null;

  private _defaultApplied = false;
  private _floatingCleanup: ReturnType<typeof setupFloating> | null = null;
  private _toggleHandler: ((e: Event) => void) | null = null;

  private readonly _uid = `ds-select-${++instanceCounter}`;

  private get _triggerId(): string {
    return `${this._uid}-trigger`;
  }

  private get _listboxId(): string {
    return `${this._uid}-listbox`;
  }

  private get _labelId(): string {
    return `${this._uid}-label`;
  }

  private _itemId(index: number): string {
    return `${ITEM_ID_PREFIX}${this._uid}-${index}`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._applyDefault();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._floatingCleanup?.();
    this._floatingCleanup = null;
    if (this._dropdown && this._toggleHandler) {
      this._dropdown.removeEventListener('toggle', this._toggleHandler);
      this._toggleHandler = null;
    }
  }

  override firstUpdated(): void {
    this._toggleHandler = (e: Event): void => {
      if ((e as ToggleEvent).newState === 'closed' && this._isOpen) {
        this._isOpen = false;
        this._activeDescendantIndex = -1;
        this._trigger?.focus();
      }
    };
    this._dropdown?.addEventListener('toggle', this._toggleHandler);
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);

    if ((changed.has('defaultSelection') || changed.has('items')) && !this._selected) {
      this._applyDefault();
    }

    this._syncPopover(changed);
    this._syncFocusedAttr(changed);
  }

  private _applyDefault(): void {
    if (this._defaultApplied || !this.defaultSelection) return;

    const match = this.items.find((i) => i.value === this.defaultSelection!.value);
    if (match) {
      this._selected = match;
      this._defaultApplied = true;
    }
  }

  private _open(): void {
    if (this.disabled || this._isOpen) return;
    this._isOpen = true;
  }

  private _close(returnFocus = true): void {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._activeDescendantIndex = -1;
    if (returnFocus) this._trigger?.focus();
  }

  private _toggle(): void {
    if (this.disabled) return;
    if (this._isOpen) {
      this._close();
      return;
    }
    this._open();
  }

  private _handleSelect(item: SelectItem): void {
    const changed = item.value !== this._selected?.value;
    this._selected = item;
    this._close();

    if (changed) {
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: item.value, label: item.label },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _handleTriggerKeydown(e: KeyboardEvent): void {
    if (this._isOpen) {
      this._handleOpenKeydown(e);
      return;
    }

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._open();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this._open();
        this.updateComplete.then(() => this._setActiveItem('first-or-selected'));
        break;

      case 'ArrowUp':
        e.preventDefault();
        this._open();
        this.updateComplete.then(() => this._setActiveItem('last'));
        break;
    }
  }

  private _handleOpenKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this._activeDescendantIndex >= 0) {
          this._handleSelect(this.items[this._activeDescendantIndex]!);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this._close();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this._setActiveItemByIndex(
          this._activeDescendantIndex < this.items.length - 1 ? this._activeDescendantIndex + 1 : 0,
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        this._setActiveItemByIndex(
          this._activeDescendantIndex > 0 ? this._activeDescendantIndex - 1 : this.items.length - 1,
        );
        break;

      case 'Home':
        e.preventDefault();
        this._setActiveItemByIndex(0);
        break;

      case 'End':
        e.preventDefault();
        this._setActiveItemByIndex(this.items.length - 1);
        break;

      case 'Tab':
        this._close(false);
        break;

      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          this._handleTypeAhead(e.key);
        }
        break;
    }
  }

  private _handleTypeAhead(char: string): void {
    const lower = char.toLowerCase();
    const startIndex = this._activeDescendantIndex + 1;
    const searchOrder = [...this.items.slice(startIndex), ...this.items.slice(0, startIndex)];
    const match = searchOrder.find((i) => i.label.toLowerCase().startsWith(lower));
    if (match) {
      this._setActiveItemByIndex(this.items.indexOf(match));
    }
  }

  private _setActiveItem(strategy: 'first-or-selected' | 'first' | 'last'): void {
    if (!this.items.length) return;

    let index: number;
    if (strategy === 'first-or-selected' && this._selected) {
      index = this.items.findIndex((i) => i.value === this._selected!.value);
      if (index === -1) index = 0;
    } else if (strategy === 'last') {
      index = this.items.length - 1;
    } else {
      index = 0;
    }

    this._setActiveItemByIndex(index);
  }

  private _setActiveItemByIndex(index: number): void {
    this._activeDescendantIndex = index;
    this._scrollItemIntoView(index);
  }

  private _scrollItemIntoView(index: number): void {
    const el = this._dropdown?.querySelector<HTMLElement>(`#${this._itemId(index)}`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  private _syncPopover(changed: Map<string, unknown>): void {
    if (!changed.has('_isOpen') || !this._dropdown || !this._trigger) return;

    if (this._isOpen) {
      this._floatingCleanup = setupFloating(this._trigger, this._dropdown, {
        placement: 'bottom-start',
      });
      this._dropdown.showPopover();
      this._setActiveItem('first-or-selected');
    } else {
      this._floatingCleanup?.();
      this._floatingCleanup = null;
      this._dropdown.hidePopover();
    }
  }

  private _syncFocusedAttr(changed: Map<string, unknown>): void {
    if (!changed.has('_focused')) return;
    if (this._focused) {
      this.setAttribute('focused', '');
    } else {
      this.removeAttribute('focused');
    }
  }

  private get _active(): boolean {
    return this._isOpen || this._focused;
  }

  private get _accentColor(): string {
    return this._active ? 'primary' : 'secondary';
  }

  private get _hasSelection(): boolean {
    return this._selected !== null;
  }

  private get _activeDescendantId(): string | undefined {
    return this._activeDescendantIndex >= 0 ? this._itemId(this._activeDescendantIndex) : undefined;
  }

  override render(): TemplateResult {
    const dividerColor = this._active ? 'primary' : 'gray3';

    return html`
      <div
        id=${this._triggerId}
        class="trigger"
        role="combobox"
        tabindex=${this.disabled ? -1 : 0}
        aria-expanded=${this._isOpen}
        aria-haspopup="listbox"
        aria-controls=${this._listboxId}
        aria-labelledby=${this._labelId}
        aria-disabled=${this.disabled}
        aria-activedescendant=${this._activeDescendantId ?? nothing}
        @click=${this._toggle}
        @focus=${(): void => {
          this._focused = true;
        }}
        @blur=${(): void => {
          this._focused = false;
        }}
        @keydown=${this._handleTriggerKeydown}
      >
        <div class="trigger-inner">
          <div class="content-area">
            <ds-text as="span" color="text" class="selected-text">
              ${this._selected?.label ?? ''}
            </ds-text>
          </div>
          <div id=${this._labelId} class="label" data-has-selection=${String(this._hasSelection)}>
            <ds-text
              as="label"
              size=${this._hasSelection ? 'small' : 'medium'}
              color=${this._accentColor}
            >
              ${this.label ?? ''}
            </ds-text>
          </div>
          <div class="icon-wrapper">
            <ds-icon
              size="medium"
              icon=${this._isOpen ? 'ArrowUp' : 'ArrowDown'}
              color=${this._accentColor}
            ></ds-icon>
          </div>
        </div>
        <ds-divider color=${dividerColor}></ds-divider>
      </div>

      <div
        id=${this._listboxId}
        class=${classMap({ dropdown: true, open: this._isOpen })}
        role="listbox"
        aria-labelledby=${this._labelId}
        popover="auto"
      >
        ${this.items.map((item, index) => {
          const isSelected = item.value === this._selected?.value;
          const isActive = index === this._activeDescendantIndex;
          return html`
            <div
              id=${this._itemId(index)}
              class=${classMap({ 'dropdown-item': true, active: isActive })}
              role="option"
              aria-selected=${isSelected}
              data-value=${item.value}
              @click=${(): void => this._handleSelect(item)}
              @keydown=${(e: KeyboardEvent): void => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this._handleSelect(item);
                }
              }}
            >
              <ds-icon icon=${isSelected ? 'CheckmarkSquare' : 'Square'} color="text"></ds-icon>
              <ds-text as="span" color="text" weight=${isSelected ? 'bold' : 'regular'}>
                ${item.label}
              </ds-text>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-select': DsSelect;
  }
}
