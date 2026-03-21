/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { resolveThemeColor } from '../theme/theme-utils';

@customElement('ds-checkbox')
export class DsCheckbox extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      width: fit-content;
      height: fit-content;
      align-items: flex-start;
      cursor: default;
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      height: calc(var(--font-size-medium, 1rem) * 1.5);
      outline: none;
    }

    .icon-wrapper:focus ds-icon {
      --icon-color: var(--ds-checkbox-focus);
    }

    .icon-wrapper:hover ds-icon {
      --icon-color: var(--ds-checkbox-hover);
    }

    .icon-wrapper:active ds-icon {
      --icon-color: var(--ds-checkbox-active);
    }

    .label {
      padding-left: var(--padding-size-small, 0.5rem);
      user-select: none;
      line-height: 1.5;
    }
  `;

  @property({ type: Boolean, reflect: true })
  accessor value = false;

  @property({ type: String })
  accessor label: string | undefined;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  private handleClick(): void {
    if (this.disabled) return;
    this.value = !this.value;
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
      <div
        class="icon-wrapper"
        tabindex=${this.disabled ? -1 : 0}
        @click=${this.handleClick}
        @keydown=${(e: KeyboardEvent): void => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick();
          }
        }}
      >
        <ds-icon
          icon=${this.value ? 'CheckmarkSquare' : 'Square'}
          color="gray0"
          ?disabled=${this.disabled}
        ></ds-icon>
      </div>
      ${this.label
        ? html`<ds-text class="label" overflow="break-word" color="gray0">${this.label}</ds-text>`
        : null}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-checkbox': DsCheckbox;
  }
}
