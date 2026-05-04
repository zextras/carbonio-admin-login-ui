/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './theme/theme.css';
import './ds-spinner';
import './ds-icon';
import './ds-text';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { buttonStyles } from './ds-button.styles';
import { dsTextVars } from './ds-text.styles';
import { type IconName } from './icon-registry';
import { resolveThemeColor } from './theme/theme-utils';

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

function getColorStyles(colorName: string, bgName: string): Record<string, string> {
  return {
    '--btn-color': resolveThemeColor(colorName, 'regular'),
    '--btn-color-hover': resolveThemeColor(colorName, 'hover'),
    '--btn-color-active': resolveThemeColor(colorName, 'active'),
    '--btn-color-focus': resolveThemeColor(colorName, 'focus'),
    '--btn-color-disabled': resolveThemeColor(colorName, 'disabled'),
    '--btn-bg': resolveThemeColor(bgName, 'regular'),
    '--btn-bg-hover': resolveThemeColor(bgName, 'hover'),
    '--btn-bg-active': resolveThemeColor(bgName, 'active'),
    '--btn-bg-focus': resolveThemeColor(bgName, 'focus'),
    '--btn-bg-disabled': resolveThemeColor(bgName, 'disabled'),
  };
}

@customElement('ds-button')
export class DsButton extends LitElement {
  static override readonly styles = buttonStyles;

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

  private get sizeConfig(): (typeof SIZES)[ButtonSize] {
    return SIZES[this.size];
  }

  private get colors(): { color: string; backgroundColor: string } {
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

  private get buttonWidth(): string {
    return this.width === 'fill' ? '100%' : 'auto';
  }

  private get gridWidth(): string {
    return this.width === 'fill' ? '100%' : 'fit-content';
  }

  private get buttonStyles(): Record<string, string> {
    const styles: Record<string, string> = {
      '--btn-padding': this.sizeConfig.padding,
      '--btn-padding-adjusted':
        this.type === 'outlined'
          ? `calc(${this.sizeConfig.padding} - 0.0625rem)`
          : this.sizeConfig.padding,
      '--btn-gap': this.sizeConfig.gap,
      '--btn-width': this.buttonWidth,
      ...getColorStyles(this.colors.color, this.colors.backgroundColor),
    };

    if (this.minWidth) {
      styles['min-width'] = this.minWidth;
    }

    return styles;
  }

  private get gridStyles(): Record<string, string> {
    return {
      '--btn-width': this.gridWidth,
      '--secondary-margin': this.sizeConfig.padding,
    };
  }

  private get hasContent(): boolean {
    return Boolean(this.label || this.querySelector('slot') !== null);
  }

  private get iconStyles(): Record<string, string> {
    return {
      '--icon-size': this.sizeConfig.icon,
      '--icon-order': this.iconPlacement === 'left' ? '1' : '2',
    };
  }

  private get textStyles(): Record<string, string> {
    return {
      '--text-size': this.sizeConfig.label,
      '--text-order': this.iconPlacement === 'left' ? '2' : '1',
    };
  }

  override render(): TemplateResult | typeof nothing {
    const dataIsLoading = this.loading ? 'true' : nothing;
    return html`
      <div class="grid" style=${styleMap(this.gridStyles)}>
        <button
          class=${this.type === 'outlined' ? 'button outlined' : 'button'}
          style=${styleMap(this.buttonStyles)}
          ?disabled=${this.disabled}
          tabindex=${this.disabled ? -1 : 0}
        >
          ${this.loading
            ? html`
                <div class="loading-container">
                  <ds-spinner color="currentColor"></ds-spinner>
                </div>
              `
            : nothing}
          ${this.icon
            ? html`
                <span class="icon" data-loading=${dataIsLoading} style=${styleMap(this.iconStyles)}>
                  <ds-icon
                    icon=${this.icon}
                    color="currentColor"
                    size=${this.sizeConfig.icon}
                  ></ds-icon>
                </span>
              `
            : nothing}
          ${this.label
            ? html`
                <span class="text" data-loading=${dataIsLoading} style=${styleMap(this.textStyles)}>
                  <ds-text
                    as="span"
                    color="currentColor"
                    style=${`${dsTextVars.fontSize}: ${this.sizeConfig.label}`}
                  >
                    ${this.label}
                  </ds-text>
                </span>
              `
            : nothing}
          ${!this.label && this.hasContent
            ? html`
                <span class="text" data-loading=${dataIsLoading} style=${styleMap(this.textStyles)}>
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
    'ds-button': DsButton;
  }
}
