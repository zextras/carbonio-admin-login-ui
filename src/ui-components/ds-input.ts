/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './theme/theme.css';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { inputStyles } from './ds-input.styles';
import { resolveThemeColor } from './theme/theme-utils';

const INPUT_BACKGROUND_COLOR = 'gray5';
const INPUT_DIVIDER_COLOR = 'gray3';

let instanceCounter = 0;

function getDividerColor(color: string, disabled: boolean): string {
  const state = disabled ? 'disabled' : 'regular';
  return resolveThemeColor(color, state);
}

@customElement('ds-input')
export class DsInput extends LitElement {
  static override styles = inputStyles;

  private readonly _inputId = `ds-input-${++instanceCounter}`;

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
  accessor type: 'text' | 'password' | 'email' | 'number' = 'text';

  @property({ type: String, reflect: true })
  accessor name: string | undefined;

  @property({ type: String, reflect: true })
  accessor autocomplete = 'off';

  @query('input')
  private accessor _inputElement: HTMLInputElement | null = null;

  @state()
  private accessor _focused = false;

  override focus(): void {
    this._inputElement?.focus();
  }

  override blur(): void {
    this._inputElement?.blur();
  }

  get value(): string {
    return this._inputElement?.value ?? '';
  }

  set value(newValue: string) {
    if (this._inputElement) {
      this._inputElement.value = newValue;
    }
  }

  private _onContainerClick(): void {
    if (!this.disabled) {
      this._inputElement?.focus();
    }
  }

  private _onInputFocus(): void {
    this._focused = true;
    this.dispatchEvent(new FocusEvent('focus', { bubbles: true, composed: true }));
  }

  private _onInputBlur(): void {
    this._focused = false;
    this.dispatchEvent(new FocusEvent('blur', { bubbles: true, composed: true }));
  }

  private _onInput(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: (e.target as HTMLInputElement).value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: (e.target as HTMLInputElement).value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _getDividerColor(): string {
    const baseColor =
      (this.hasError && 'error') || (this._focused && 'primary') || this.borderColor;
    return getDividerColor(baseColor, this.disabled);
  }

  private _getLabelColor(): string {
    const color = (this.hasError && 'error') || (this._focused && 'primary') || 'secondary';
    return resolveThemeColor(color, this.disabled ? 'disabled' : 'regular');
  }

  override render(): TemplateResult | typeof nothing {
    const containerBgStyles = {
      '--input-container-bg': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'regular'),
      '--input-container-bg-hover': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'hover'),
      '--input-container-bg-focus': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'focus'),
      '--input-container-bg-active': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'active'),
      '--input-container-bg-disabled': resolveThemeColor(INPUT_BACKGROUND_COLOR, 'disabled'),
    };

    const relativeContainerStyles = {
      '--label-color': this._getLabelColor(),
    };

    return html`
      <div class="input-wrapper">
        <div
          class=${classMap({ 'input-container': true })}
          style=${styleMap(containerBgStyles)}
          ?data-disabled=${this.disabled}
          @click=${this._onContainerClick}
        >
          <div
            class="relative-container"
            style=${styleMap(relativeContainerStyles)}
            ?data-has-label=${!!this.label}
          >
            <input
              class="input"
              autocomplete=${this.autocomplete as 'on' | 'off'}
              type=${this.type}
              id=${this._inputId}
              name=${this.name || ''}
              .defaultValue=${this.defaultValue ?? ''}
              @focus=${this._onInputFocus}
              @blur=${this._onInputBlur}
              @input=${this._onInput}
              @change=${this._onChange}
              ?disabled=${this.disabled}
              aria-invalid=${this.hasError ? 'true' : 'false'}
            />
            ${this.label
              ? html`<label class="label" for=${this._inputId}>${this.label}</label>`
              : nothing}
          </div>
        </div>
        <span class="icon-slot">
          <slot name="icon"></slot>
        </span>
        <ds-divider color=${this._getDividerColor()}></ds-divider>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-input': DsInput;
  }
}
