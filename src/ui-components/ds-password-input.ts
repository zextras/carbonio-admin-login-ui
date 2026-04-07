/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './theme/theme.css';
import './ds-icon';
import './ds-input';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { passwordInputStyles } from './ds-password-input.styles';

const INPUT_DIVIDER_COLOR = 'gray3';

type InputType = 'text' | 'password';

@customElement('ds-password-input')
export class DsPasswordInput extends LitElement {
  override createRenderRoot() {
    return this;
  }

  @property({ type: String, attribute: 'initial-value' })
  accessor initialValue: string | undefined;

  @property({ type: String, reflect: true })
  accessor label: string | undefined;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: Boolean, attribute: 'has-error', reflect: true })
  accessor hasError = false;

  @property({ type: String, attribute: 'error-message' })
  accessor errorMessage: string | undefined;

  @property({ type: String, attribute: 'border-color' })
  accessor borderColor = INPUT_DIVIDER_COLOR;

  @property({ type: String, reflect: true })
  accessor name: string | undefined;

  @property({ type: String, reflect: true })
  accessor autocomplete: string = 'current-password';

  @query('ds-input')
  private accessor _inputElement: HTMLElement | null = null;

  @state()
  private accessor _show = false;

  @state()
  private accessor _focused = false;

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

  private _onFocus(): void {
    this._focused = true;
  }

  private _onBlur(): void {
    this._focused = false;
  }

  private _onInputChange(event: Event): void {
    const customEvent = event as CustomEvent<{ value: string }>;
    this.dispatchEvent(
      new CustomEvent('ds-change', {
        detail: { value: customEvent.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onInput(event: Event): void {
    const customEvent = event as CustomEvent<{ value: string }>;
    this.dispatchEvent(
      new CustomEvent('ds-input', {
        detail: { value: customEvent.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult | typeof nothing {
    const inputType: InputType = this._show ? 'text' : 'password';
    const iconName = this._show ? 'EyeOutline' : 'EyeOffOutline';
    const iconColor = this._focused ? 'primary' : 'gray1';
    const errorId = 'error-msg';

    return html`
      <style>${passwordInputStyles}</style>
      <ds-input
        .defaultValue=${this.initialValue ?? ''}
        .label=${this.label ?? ''}
        ?disabled=${this.disabled}
        ?has-error=${this.hasError}
        .borderColor=${this.borderColor}
        .name=${this.name ?? ''}
        .autocomplete=${this.autocomplete}
        .type=${inputType}
        .icon=${html`
          <button
            class="toggle-button"
            type="button"
            ?disabled=${this.disabled}
            aria-label="Show password"
            aria-pressed=${this._show ? 'true' : 'false'}
            @click=${() => this._toggleShow()}
          >
            <ds-icon
              .icon=${iconName}
              .color=${iconColor}
              size="large"
              ?disabled=${this.disabled}
            ></ds-icon>
          </button>
        `}
        aria-invalid=${this.hasError ? 'true' : 'false'}
        aria-describedby=${this.hasError && this.errorMessage ? errorId : nothing}
        @change=${this._onInputChange}
        @input=${this._onInput}
        @focus=${this._onFocus}
        @blur=${this._onBlur}
      ></ds-input>
      ${this.hasError && this.errorMessage
        ? html`<span id=${errorId} class="error-message" role="alert">${this.errorMessage}</span>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-password-input': DsPasswordInput;
  }
}
