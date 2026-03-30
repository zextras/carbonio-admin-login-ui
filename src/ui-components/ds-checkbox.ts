/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './theme/theme.css';
import './ds-icon';
import './ds-text';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { checkboxStyles } from './ds-checkbox.styles';
import { resolveThemeColor } from './theme/theme-utils';

@customElement('ds-checkbox')
export class DsCheckbox extends LitElement {
  static override styles = checkboxStyles;

  @property({ type: Boolean, reflect: true })
  accessor value = false;

  @property({ type: String })
  accessor label: string | undefined;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  private handleChange(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.checked;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    this.style.setProperty('--ds-checkbox-focus', resolveThemeColor('gray0', 'focus'));
    this.style.setProperty('--ds-checkbox-hover', resolveThemeColor('gray0', 'hover'));
    this.style.setProperty('--ds-checkbox-active', resolveThemeColor('gray0', 'active'));

    return html`
      <label class="wrapper">
        <input
          type="checkbox"
          .checked=${this.value}
          ?disabled=${this.disabled}
          @change=${this.handleChange}
          aria-label=${this.label ?? 'checkbox'}
        />
        <ds-icon
          icon=${this.value ? 'CheckmarkSquare' : 'Square'}
          color="gray0"
          ?disabled=${this.disabled}
          size="large"
          aria-hidden="true"
        ></ds-icon>
        ${this.label
          ? html`<ds-text as="span" class="label" overflow="break-word" color="gray0"
              >${this.label}</ds-text
            >`
          : nothing}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-checkbox': DsCheckbox;
  }
}
