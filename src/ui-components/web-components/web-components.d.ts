/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import React from 'react';

import { type IconName, type IconSize } from './icon-registry';
import { type TextOverflow, type TextSize, type TextWeight } from './zx-text';

type ButtonSize = 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
type ButtonWidth = 'fit' | 'fill';
type ButtonIconPlacement = 'left' | 'right';
type ButtonType = 'default' | 'outlined' | 'ghost';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'spinner-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'divider-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'icon-wc': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            icon?: IconName;
            color?: string;
            size?: IconSize;
            disabled?: boolean;
            clickHandler?: (e: Event) => void;
          },
          HTMLElement
        >;
        'zx-text': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            color?: string;
            size?: TextSize;
            weight?: TextWeight;
            overflow?: TextOverflow;
            disabled?: boolean;
            lineHeight?: number;
          },
          HTMLElement
        >;
        'zx-button': React.DetailedHTMLProps<
          Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> & {
            type?: ButtonType;
            size?: ButtonSize;
            color?: string;
            'background-color'?: string;
            'label-color'?: string;
            icon?: IconName;
            'icon-placement'?: ButtonIconPlacement;
            label?: string;
            loading?: boolean;
            disabled?: boolean;
            width?: ButtonWidth;
            'min-width'?: string;
            onClick?: (e: Event) => void;
          },
          HTMLElement
        >;
        'browser-support-message': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            'is-supported-browser'?: boolean;
            'is-advanced'?: boolean;
          },
          HTMLElement
        >;
        'error-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
  }
}
