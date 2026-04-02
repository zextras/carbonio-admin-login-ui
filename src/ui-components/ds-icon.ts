/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './theme/theme.css';

import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { type IconName, iconRegistry } from './icon-registry';
import { resolveThemeColor } from './theme/theme-utils';

const ICON_SIZES = ['small', 'medium', 'large'] as const;
export type IconSize = (typeof ICON_SIZES)[number];
type IconSizeValue = IconSize | string;

const DEFAULT_ICON: IconName = 'AlertTriangleOutline';

const SIZE_REGEX = /^[\d.]+(rem|px|em|vh|vw|%)$/;

@customElement('ds-icon')
export class DsIcon extends LitElement {
  static override readonly styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      display: block;
      fill: currentColor;
      color: var(--icon-color, var(--color-text, #333333));
      width: var(--icon-size, var(--icon-size-medium, 1rem));
      height: var(--icon-size, var(--icon-size-medium, 1rem));
      transition: color 0.2s ease;
    }

    :host([disabled]) svg {
      color: var(--icon-color-disabled, var(--color-text-disabled, #cccccc));
    }
  `;

  /** The icon name from the registry. Falls back to a default warning icon if not found. */
  @property({ type: String, reflect: true })
  accessor icon: IconName = DEFAULT_ICON;

  /** Theme color token (e.g. 'text', 'primary', 'error'). */
  @property({ type: String, reflect: true })
  accessor color: string = 'text';

  /** Predefined size ('small' | 'medium' | 'large') or a CSS length value (e.g. '2rem'). */
  @property({ type: String, reflect: true })
  accessor size: IconSizeValue = 'medium';

  /** When true, the icon is visually dimmed. */
  @property({ type: Boolean, reflect: true })
  accessor disabled: boolean = false;

  private getSizeValue(size: IconSizeValue): string {
    if (SIZE_REGEX.test(size)) {
      return size;
    }
    const validSize = ICON_SIZES.includes(size as IconSize) ? (size as IconSize) : 'medium';
    return `var(--icon-size-${validSize}, var(--icon-size-medium, 1rem))`;
  }

  private getSvgContent(): string {
    return iconRegistry[this.icon] ?? iconRegistry[DEFAULT_ICON] ?? '';
  }

  override render(): TemplateResult | typeof nothing {
    const svgContent = this.getSvgContent();
    if (!svgContent) {
      return nothing;
    }

    const styles = styleMap({
      '--icon-color': resolveThemeColor(this.color, 'regular'),
      '--icon-size': this.getSizeValue(this.size),
    });

    return html`
      <svg
        style=${styles}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        role="presentation"
        aria-hidden="true"
      >
        ${unsafeSVG(svgContent)}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-icon': DsIcon;
  }
}
