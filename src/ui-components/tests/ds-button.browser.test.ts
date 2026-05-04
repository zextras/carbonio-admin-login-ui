/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-button';
import '../theme/theme.css';

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { DsButton } from '../ds-button';

let element: DsButton;

async function createDsButton(
  attrs: Record<string, string> = {},
  textContent = '',
): Promise<DsButton> {
  element = document.createElement('ds-button');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  if (textContent) {
    element.textContent = textContent;
  }
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
});

describe('ds-button', () => {
  describe('rendering structure', () => {
    it('should render a button element', async () => {
      await createDsButton({ label: 'button label' });

      const button = page.getByRole('button');
      expect(button).toBeVisible();
    });

    it('should wrap button in a grid container', async () => {
      const el = await createDsButton();
      const grid = el.shadowRoot!.querySelector('.grid');
      expect(grid).not.toBeNull();
      expect(grid!.querySelector('button')).not.toBeNull();
    });
  });
  describe('type property', () => {
    it('should default to "default"', async () => {
      const el = await createDsButton();
      expect(el.type).toBe('default');
    });

    it.each([{ type: 'default' }, { type: 'outlined' }, { type: 'ghost' }])(
      'should accept type="$type"',
      async ({ type }) => {
        const el = await createDsButton({ type });
        expect(el.type).toBe(type);
      },
    );

    it('should apply "outlined" class for outlined type', async () => {
      const el = await createDsButton({ type: 'outlined' });
      const button = el.shadowRoot!.querySelector('button');
      expect(button!.classList.contains('outlined')).toBe(true);
    });

    it('should not apply "outlined" class for default type', async () => {
      const el = await createDsButton({ type: 'default' });
      const button = el.shadowRoot!.querySelector('button');
      expect(button!.classList.contains('outlined')).toBe(false);
    });
  });

  describe('size property', () => {
    it('should default to "medium"', async () => {
      const el = await createDsButton();
      expect(el.size).toBe('medium');
    });

    it.each([
      { size: 'extrasmall' },
      { size: 'small' },
      { size: 'medium' },
      { size: 'large' },
      { size: 'extralarge' },
    ])('should accept size="$size"', async ({ size }) => {
      const el = await createDsButton({ size });
      expect(el.size).toBe(size);
    });
  });

  describe('color properties', () => {
    describe('backgroundColor', () => {
      it('should override default background color', async () => {
        const el = await createDsButton({ 'background-color': 'error' });
        const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
        const style = button.style;
        expect(style.getPropertyValue('--btn-bg')).toContain('error');
      });
    });

    describe('labelColor', () => {
      it('should override default text color', async () => {
        const el = await createDsButton({ 'label-color': 'error' });
        const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
        const style = button.style;
        expect(style.getPropertyValue('--btn-color')).toContain('error');
      });
    });

    describe('color', () => {
      it('should set background color', async () => {
        const el = await createDsButton({ type: 'default', color: 'error' });
        const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
        const style = button.style;
        expect(style.getPropertyValue('--btn-bg')).toContain('error');
      });
    });
  });

  describe('icon property', () => {
    it('should render icon when provided', async () => {
      const el = await createDsButton({ icon: 'Add' });
      const iconContainer = el.shadowRoot!.querySelector('.icon');
      expect(iconContainer).not.toBeNull();
      const dsIcon = iconContainer!.querySelector('ds-icon');
      expect(dsIcon).not.toBeNull();
    });

    it('should not render icon when not provided', async () => {
      const el = await createDsButton();
      const iconContainer = el.shadowRoot!.querySelector('.icon');
      expect(iconContainer).toBeNull();
    });

    it('should place icon on right by default (iconPlacement="right")', async () => {
      const el = await createDsButton({ icon: 'Add' });
      const iconContainer = el.shadowRoot!.querySelector('.icon') as HTMLElement;
      const style = iconContainer.style;
      expect(style.getPropertyValue('--icon-order')).toBe('2');
    });

    it('should place icon on left when iconPlacement="left"', async () => {
      const el = await createDsButton({ icon: 'Add', 'icon-placement': 'left' });
      const iconContainer = el.shadowRoot!.querySelector('.icon') as HTMLElement;
      const style = iconContainer.style;
      expect(style.getPropertyValue('--icon-order')).toBe('1');
    });
  });

  describe('label property', () => {
    it('should render label when provided', async () => {
      const el = await createDsButton({ label: 'Click me' });
      const textContainer = el.shadowRoot!.querySelector('.text');
      expect(textContainer).not.toBeNull();
      expect(textContainer!.textContent).toContain('Click me');
    });

    it('should not render label when not provided', async () => {
      const el = await createDsButton();
      const textContainer = el.shadowRoot!.querySelector('.text');
      expect(textContainer).toBeNull();
    });

    it('should render ds-text component for label', async () => {
      const el = await createDsButton({ label: 'Click me' });
      const textContainer = el.shadowRoot!.querySelector('.text');
      const dsText = textContainer!.querySelector('ds-text');
      expect(dsText).not.toBeNull();
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading=true', async () => {
      const el = await createDsButton({ loading: '' });
      const loadingContainer = el.shadowRoot!.querySelector('.loading-container');
      expect(loadingContainer).not.toBeNull();
      const spinner = loadingContainer!.querySelector('ds-spinner');
      expect(spinner).not.toBeNull();
    });

    it('should not show spinner when loading=false', async () => {
      const el = await createDsButton();
      const loadingContainer = el.shadowRoot!.querySelector('.loading-container');
      expect(loadingContainer).toBeNull();
    });

    it('should set data-loading="true" on icon when loading', async () => {
      const el = await createDsButton({ loading: '', icon: 'Add' });
      const iconContainer = el.shadowRoot!.querySelector('.icon');
      expect(iconContainer!.getAttribute('data-loading')).toBe('true');
    });

    it('should set data-loading="true" on text when loading', async () => {
      const el = await createDsButton({ loading: '', label: 'Loading' });
      const textContainer = el.shadowRoot!.querySelector('.text');
      expect(textContainer!.getAttribute('data-loading')).toBe('true');
    });

    it('should not set data-loading when not loading', async () => {
      const el = await createDsButton({ icon: 'Add', label: 'Click' });
      const iconContainer = el.shadowRoot!.querySelector('.icon');
      const textContainer = el.shadowRoot!.querySelector('.text');
      expect(iconContainer!.getAttribute('data-loading')).toBe(null);
      expect(textContainer!.getAttribute('data-loading')).toBe(null);
    });
  });

  describe('disabled state', () => {
    it('should default to false', async () => {
      const el = await createDsButton();
      expect(el.disabled).toBe(false);
    });

    it('should reflect disabled attribute on host', async () => {
      const el = await createDsButton({ disabled: '' });
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('should set button disabled attribute when disabled', async () => {
      const el = await createDsButton({ disabled: '' });
      const button = el.shadowRoot!.querySelector('button');
      expect(button!.disabled).toBe(true);
    });

    it('should set tabindex=-1 when disabled', async () => {
      const el = await createDsButton({ disabled: '' });
      const button = el.shadowRoot!.querySelector('button');
      expect(button!.getAttribute('tabindex')).toBe('-1');
    });

    it('should set tabindex=0 when not disabled', async () => {
      const el = await createDsButton();
      const button = el.shadowRoot!.querySelector('button');
      expect(button!.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('width property', () => {
    it('should default to "fit"', async () => {
      const el = await createDsButton();
      expect(el.width).toBe('fit');
    });

    it('should set width: auto for fit', async () => {
      const el = await createDsButton({ width: 'fit' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-width')).toBe('auto');
    });

    it('should set width: 100% for fill', async () => {
      const el = await createDsButton({ width: 'fill' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-width')).toBe('100%');
    });

    it('should set display: block on host when width="fill"', async () => {
      const el = await createDsButton({ width: 'fill' });
      const computedStyle = globalThis.getComputedStyle(el);
      expect(computedStyle.display).toBe('block');
    });
  });

  describe('minWidth property', () => {
    it('should set min-width style when provided', async () => {
      const el = await createDsButton({ 'min-width': '200px' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('min-width')).toBe('200px');
    });

    it('should not set min-width style when not provided', async () => {
      const el = await createDsButton();
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('min-width')).toBe('');
    });
  });

  describe('color variable generation', () => {
    it('should generate hover color variable', async () => {
      const el = await createDsButton({ color: 'primary' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-color-hover')).toContain('hover');
    });

    it('should generate active color variable', async () => {
      const el = await createDsButton({ color: 'primary' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-color-active')).toContain('active');
    });

    it('should generate focus color variable', async () => {
      const el = await createDsButton({ color: 'primary' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-color-focus')).toContain('focus');
    });

    it('should generate disabled color variable', async () => {
      const el = await createDsButton({ color: 'primary' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-color-disabled')).toContain('disabled');
    });

    it('should pass through hex color values', async () => {
      const el = await createDsButton({ 'label-color': '#ff0000' });
      const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
      expect(button.style.getPropertyValue('--btn-color')).toBe('#ff0000');
    });
  });
});
