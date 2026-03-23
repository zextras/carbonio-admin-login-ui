/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../theme/theme.css';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { passwordInputStyles } from './ds-password-input.styles';

const INPUT_DIVIDER_COLOR = 'gray3';

type InputType = 'text' | 'password';

@customElement('ds-password-input')
export class DsPasswordInput extends LitElement {
  static override styles = passwordInputStyles;

  @property({ type: String, attribute: 'default-value' })
  accessor defaultValue: string | undefined;

  @property({ type: String, reflect: true })
  accessor label: string | undefined;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: Boolean, attribute: 'has-error', reflect: true })
  accessor hasError = false;

  @property({ type: String, attribute: 'border-color' })
  accessor borderColor = INPUT_DIVIDER_COLOR;

  @property({ type: String, reflect: true })
  accessor name: string | undefined;

  @property({ type: String, reflect: true })
  accessor autocomplete = 'off';

  @query('ds-input')
  private accessor _inputElement: HTMLElement | null = null;

  @state()
  private accessor _show = false;

  override focus(): void {
    (this._inputElement as HTMLElement & { focus: () => void })?.focus();
  }

  override blur(): void {
    (this._inputElement as HTMLElement & { blur: () => void })?.blur();
  }

  get value(): string {
    return (this._inputElement as HTMLElement & { value: string })?.value ?? '';
  }

  set value(newValue: string) {
    if (this._inputElement) {
      (this._inputElement as HTMLElement & { value: string }).value = newValue;
    }
  }

  private _toggleShow(): void {
    this._show = !this._show;
  }

  private _onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._toggleShow();
    }
  }

  private _onInputChange(event: Event): void {
    const customEvent = event as CustomEvent<{ value: string }>;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: customEvent.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onInput(event: Event): void {
    const customEvent = event as CustomEvent<{ value: string }>;
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: customEvent.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult | typeof nothing {
    const inputType: InputType = this._show ? 'text' : 'password';
    const iconName = this._show ? 'EyeOutline' : 'EyeOffOutline';
    const ariaLabel = this._show ? 'Hide password' : 'Show password';

    return html`
      <ds-input
        .defaultValue=${this.defaultValue ?? ''}
        .label=${this.label ?? ''}
        ?disabled=${this.disabled}
        ?has-error=${this.hasError}
        .borderColor=${this.borderColor}
        .name=${this.name ?? ''}
        .autocomplete=${this.autocomplete}
        .type=${inputType}
        @change=${this._onInputChange}
        @input=${this._onInput}
      >
        <button
          slot="icon"
          class="toggle-button"
          type="button"
          ?disabled=${this.disabled}
          aria-label=${ariaLabel}
          @click=${this._toggleShow}
          @keydown=${this._onKeyDown}
          tabindex=${this.disabled ? -1 : 0}
        >
          <ds-icon .icon=${iconName} size="large" ?disabled=${this.disabled}></ds-icon>
        </button>
      </ds-input>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-password-input': DsPasswordInput;
  }
}
