/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../theme/theme.css';

import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { setupFloating } from '../floating-ui';
import { selectStyles } from './ds-select.styles';

type SelectItem = {
  label: string;
  value: string;
};

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

  @query('.trigger')
  private accessor _trigger: HTMLElement | null = null;

  @query('.dropdown')
  private accessor _dropdown: HTMLElement | null = null;

  private _initialized = false;

  private _floatingCleanup: ReturnType<typeof setupFloating> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._initialized && this.defaultSelection) {
      this._selected = this.defaultSelection;
      this._initialized = true;
    }
  }

  // ── Open / Close ─────────────────────────────────────────

  private _toggle(): void {
    if (this.disabled) return;
    this._isOpen = !this._isOpen;
  }

  private _close(): void {
    this._isOpen = false;
  }

  // ── Selection ────────────────────────────────────────────

  private _handleSelect(item: SelectItem): void {
    if (item.value !== this._selected?.value) {
      this._selected = item;
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: item.value, label: item.label },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this._close();
  }

  // ── Keyboard ─────────────────────────────────────────────

  private _handleTriggerKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._toggle();
        break;
      case 'Escape':
        e.preventDefault();
        this._close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!this._isOpen) {
          this._isOpen = true;
        }
        this.updateComplete.then(() => {
          this._focusFirstOrSelectedItem();
        });
        break;
    }
  }

  private _handleItemKeydown(e: KeyboardEvent, item: SelectItem): void {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._handleSelect(item);
        break;
      case 'Escape':
        e.preventDefault();
        this._close();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        const next = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null;
        next?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = (e.currentTarget as HTMLElement).previousElementSibling as HTMLElement | null;
        prev?.focus();
        break;
      }
    }
  }

  // ── Focus helpers ────────────────────────────────────────

  private _focusFirstOrSelectedItem(): void {
    const list = this._dropdown;
    if (!list) return;
    const selected = list.querySelector<HTMLElement>('[data-selected="true"]');
    const target = selected ?? list.querySelector<HTMLElement>('.dropdown-item');
    target?.focus();
  }

  // ── Popover lifecycle ────────────────────────────────────

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('_isOpen') && this._dropdown && this._trigger) {
      if (this._isOpen) {
        this._floatingCleanup = setupFloating(this._trigger, this._dropdown, {
          placement: 'bottom-start',
        });
        this._dropdown.showPopover();
        this._focusFirstOrSelectedItem();
      } else {
        this._floatingCleanup?.();
        this._floatingCleanup = null;
        this._dropdown.hidePopover();
      }
    }

    if (changedProperties.has('_focused')) {
      if (this._focused) {
        this.setAttribute('focused', '');
      } else {
        this.removeAttribute('focused');
      }
    }
  }

  override firstUpdated(): void {
    // Sync state when popover is dismissed via light-dismiss
    this._dropdown?.addEventListener('toggle', ((e: ToggleEvent) => {
      if (e.newState === 'closed') {
        this._isOpen = false;
      }
    }) as EventListener);
  }

  // ── Derived ──────────────────────────────────────────────

  private get _active(): boolean {
    return this._isOpen || this._focused;
  }

  private get _accentColor(): string {
    return this._active ? 'primary' : 'secondary';
  }

  private get _hasSelection(): boolean {
    return this._selected !== null;
  }

  // ── Render ───────────────────────────────────────────────

  override render(): TemplateResult {
    const dividerColor = this._active ? 'primary' : 'gray3';

    return html`
      <div
        class="trigger"
        tabindex=${this.disabled ? -1 : 0}
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
            <ds-text color="text" class="selected-text"> ${this._selected?.label ?? ''} </ds-text>
          </div>
          <div class="label" data-has-selection=${String(this._hasSelection)}>
            <ds-text size=${this._hasSelection ? 'small' : 'medium'} color=${this._accentColor}>
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
        class=${classMap({ dropdown: true, open: this._isOpen })}
        popover="auto"
        data-testid="dropdown-popper-list"
      >
        ${this.items.map((item) => {
          const isSelected = item.value === this._selected?.value;
          return html`
            <div
              class="dropdown-item"
              tabindex="0"
              data-value=${item.value}
              data-selected=${String(isSelected)}
              data-testid="dropdown-item"
              @click=${(): void => this._handleSelect(item)}
              @keydown=${(e: KeyboardEvent): void => this._handleItemKeydown(e, item)}
            >
              <ds-icon icon=${isSelected ? 'CheckmarkSquare' : 'Square'} color="text"></ds-icon>
              <ds-text color="text" weight=${isSelected ? 'bold' : 'regular'}
                >${item.label}</ds-text
              >
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
