/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { resolveThemeColor } from '../theme/theme-utils';
import { type IconName } from './icon-registry';
import { buttonStyles } from './zx-buttons.styles';

type ButtonSize = 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
type ButtonWidth = 'fit' | 'fill';
type ButtonIconPlacement = 'left' | 'right';
type ButtonType = 'default' | 'outlined' | 'ghost';

const SIZES: Record<ButtonSize, { label: string; icon: string; padding: string; gap: string }> = {
  extrasmall: { label: '0.5rem', icon: '0.5rem', padding: '0.25rem', gap: '0.25rem' },
  small: { label: '0.75rem', icon: '0.75rem', padding: '0.25rem', gap: '0.25rem' },
  medium: { label: '1rem', icon: '1rem', padding: '0.5rem', gap: '0.5rem' },
  large: { label: '1.25rem', icon: '1.25rem', padding: '0.5rem', gap: '0.5rem' },
  extralarge: { label: '1.25rem', icon: '1.25rem', padding: '0.75rem', gap: '0.5rem' },
} as const;

const DEFAULT_COLORS: Record<ButtonType, { backgroundColor: string; color: string }> = {
  default: { backgroundColor: 'primary', color: 'gray6' },
  outlined: { backgroundColor: 'gray6', color: 'primary' },
  ghost: { backgroundColor: 'transparent', color: 'primary' },
} as const;

function getColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) return colorName;
  return resolveThemeColor(colorName, state);
}

function getColorStyles(colorName: string, bgName: string): Record<string, string> {
  return {
    '--btn-color': getColorVar(colorName, 'regular'),
    '--btn-color-hover': getColorVar(colorName, 'hover'),
    '--btn-color-active': getColorVar(colorName, 'active'),
    '--btn-color-focus': getColorVar(colorName, 'focus'),
    '--btn-color-disabled': getColorVar(colorName, 'disabled'),
    '--btn-bg': getColorVar(bgName, 'regular'),
    '--btn-bg-hover': getColorVar(bgName, 'hover'),
    '--btn-bg-active': getColorVar(bgName, 'active'),
    '--btn-bg-focus': getColorVar(bgName, 'focus'),
    '--btn-bg-disabled': getColorVar(bgName, 'disabled'),
  };
}

@customElement('zx-button')
export class ZxButton extends LitElement {
  static override styles = buttonStyles;

  @property({ type: String, reflect: true })
  accessor type: ButtonType = 'default';

  @property({ type: String, reflect: true })
  accessor size: ButtonSize = 'medium';

  @property({ type: String, reflect: true, attribute: 'background-color' })
  accessor backgroundColor: string | undefined;

  @property({ type: String, reflect: true, attribute: 'label-color' })
  accessor labelColor: string | undefined;

  @property({ type: String, reflect: true })
  accessor color: string | undefined;

  @property({ type: String, reflect: true })
  accessor icon: IconName | undefined;

  @property({ type: String, reflect: true, attribute: 'icon-placement' })
  accessor iconPlacement: ButtonIconPlacement = 'right';

  @property({ type: String, reflect: true })
  accessor label: string | undefined;

  @property({ type: Boolean, reflect: true })
  accessor loading = false;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: String, reflect: true })
  accessor width: ButtonWidth = 'fit';

  @property({ type: String, reflect: true, attribute: 'min-width' })
  accessor minWidth: string | undefined;

  private getColors(): { color: string; backgroundColor: string } {
    const defaults = DEFAULT_COLORS[this.type];
    const result = { ...defaults };

    if (this.backgroundColor) {
      result.backgroundColor = this.backgroundColor;
    }
    if (this.labelColor) {
      result.color = this.labelColor;
    }
    if (this.color) {
      if (this.type === 'default') {
        result.backgroundColor = this.color;
      } else {
        result.color = this.color;
      }
    }
    return result;
  }

  override render(): TemplateResult | typeof nothing {
    const sizeConfig = SIZES[this.size];
    const colors = this.getColors();
    const buttonWidth = this.width === 'fill' ? '100%' : 'auto';
    const gridWidth = this.width === 'fill' ? '100%' : 'fit-content';

    const buttonStyles: Record<string, string> = {
      '--btn-padding': sizeConfig.padding,
      '--btn-padding-adjusted':
        this.type === 'outlined' ? `calc(${sizeConfig.padding} - 0.0625rem)` : sizeConfig.padding,
      '--btn-gap': sizeConfig.gap,
      '--btn-width': buttonWidth,
      ...getColorStyles(colors.color, colors.backgroundColor),
    };

    if (this.minWidth) {
      buttonStyles['min-width'] = this.minWidth;
    }

    const gridStyles: Record<string, string> = {
      '--btn-width': gridWidth,
      '--secondary-margin': sizeConfig.padding,
    };

    const hasContent = this.label || this.querySelector('slot') !== null;

    return html`
      <div class="grid" style=${styleMap(gridStyles)}>
        <button
          class=${this.type === 'outlined' ? 'button outlined' : 'button'}
          style=${styleMap(buttonStyles)}
          ?disabled=${this.disabled}
          tabindex=${this.disabled ? -1 : 0}
        >
          ${this.loading
            ? html`
                <div class="loading-container">
                  <spinner-wc color="currentColor"></spinner-wc>
                </div>
              `
            : nothing}
          ${this.icon
            ? html`
                <span
                  class="icon"
                  data-loading=${this.loading ? 'true' : nothing}
                  style=${styleMap({
                    '--icon-size': sizeConfig.icon,
                    '--icon-order': this.iconPlacement === 'left' ? '1' : '2',
                  })}
                >
                  <icon-wc icon=${this.icon} color="currentColor" size=${sizeConfig.icon}></icon-wc>
                </span>
              `
            : nothing}
          ${this.label
            ? html`
                <span
                  class="text"
                  data-loading=${this.loading ? 'true' : nothing}
                  style=${styleMap({
                    '--text-size': sizeConfig.label,
                    '--text-order': this.iconPlacement === 'left' ? '2' : '1',
                  })}
                >
                  <zx-text color="currentColor" style=${`--zx-text-font-size: ${sizeConfig.label}`}>
                    ${this.label}
                  </zx-text>
                </span>
              `
            : nothing}
          ${!this.label && hasContent
            ? html`
                <span
                  class="text"
                  data-loading=${this.loading ? 'true' : nothing}
                  style=${styleMap({
                    '--text-size': sizeConfig.label,
                    '--text-order': this.iconPlacement === 'left' ? '2' : '1',
                  })}
                >
                  <slot></slot>
                </span>
              `
            : nothing}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zx-button': ZxButton;
  }
}
