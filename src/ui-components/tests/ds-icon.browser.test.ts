/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-icon';

import { afterEach, describe, expect, it } from 'vitest';

import type { DsIcon } from '../ds-icon';

let element: DsIcon;

async function createDsIcon(attrs: Record<string, string> = {}): Promise<DsIcon> {
  element = document.createElement('ds-icon');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
});

describe('ds-icon', () => {
  describe('rendering structure', () => {
    it('should render an svg element', async () => {
      const el = await createDsIcon();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('should set viewBox="0 0 24 24" on the svg', async () => {
      const el = await createDsIcon();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should set role="presentation" on the svg', async () => {
      const el = await createDsIcon();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.getAttribute('role')).toBe('presentation');
    });

    it('should set aria-hidden="true" on the svg', async () => {
      const el = await createDsIcon();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.getAttribute('aria-hidden')).toBe('true');
    });

    it('should set xmlns on the svg', async () => {
      const el = await createDsIcon();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    });
  });

  describe('icon property', () => {
    it('should default to "AlertTriangleOutline"', async () => {
      const el = await createDsIcon();
      expect(el.icon).toBe('AlertTriangleOutline');
    });

    it('should render SVG content for a valid icon name', async () => {
      const el = await createDsIcon({ icon: 'Close' });
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.innerHTML).toContain('data-name="close"');
    });

    it('should fall back to default icon for unknown icon name', async () => {
      const el = await createDsIcon({ icon: 'NonExistentIcon' });
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.innerHTML).toContain('alert-triangle');
    });

    it('should update SVG content when icon changes dynamically', async () => {
      const el = await createDsIcon({ icon: 'Close' });
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.innerHTML).toContain('data-name="close"');

      el.icon = 'Checkmark';
      await el.updateComplete;

      const updatedSvg = el.shadowRoot!.querySelector('svg');
      expect(updatedSvg!.innerHTML).toContain('data-name="checkmark"');
    });

    it('should reflect icon attribute on the host', async () => {
      const el = await createDsIcon({ icon: 'Close' });
      expect(el.getAttribute('icon')).toBe('Close');
    });
  });

  describe('color property', () => {
    it('should default to "text"', async () => {
      const el = await createDsIcon();
      expect(el.color).toBe('text');
    });

    it('should update color variable when color changes dynamically', async () => {
      const el = await createDsIcon({ color: 'text' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      expect(svg.style.getPropertyValue('--icon-color')).toContain('text');

      el.color = 'primary';
      await el.updateComplete;

      const updatedSvg = el.shadowRoot!.querySelector('svg') as SVGElement;
      expect(updatedSvg.style.getPropertyValue('--icon-color')).toContain('primary');
    });

    it('should reflect color attribute on the host', async () => {
      const el = await createDsIcon({ color: 'error' });
      expect(el.getAttribute('color')).toBe('error');
    });
  });

  describe('size property', () => {
    it('should default to "medium"', async () => {
      const el = await createDsIcon();
      expect(el.size).toBe('medium');
    });

    it('should set --icon-size CSS variable for predefined size "small"', async () => {
      const el = await createDsIcon({ size: 'small' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toContain('icon-size-small');
    });

    it('should set --icon-size CSS variable for predefined size "medium"', async () => {
      const el = await createDsIcon({ size: 'medium' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toContain('icon-size-medium');
    });

    it('should set --icon-size CSS variable for predefined size "large"', async () => {
      const el = await createDsIcon({ size: 'large' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toContain('icon-size-large');
    });

    it('should pass through CSS length values like "2rem"', async () => {
      const el = await createDsIcon({ size: '2rem' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toBe('2rem');
    });

    it('should pass through CSS length values like "32px"', async () => {
      const el = await createDsIcon({ size: '32px' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toBe('32px');
    });

    it('should fall back to medium for invalid size strings', async () => {
      const el = await createDsIcon({ size: 'gigantic' });
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toContain('icon-size-medium');
    });

    it('should update size variable when size changes dynamically', async () => {
      const el = await createDsIcon({ size: 'small' });

      el.size = 'large';
      await el.updateComplete;

      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const sizeValue = svg.style.getPropertyValue('--icon-size');
      expect(sizeValue).toContain('icon-size-large');
    });

    it('should reflect size attribute on the host', async () => {
      const el = await createDsIcon({ size: 'large' });
      expect(el.getAttribute('size')).toBe('large');
    });
  });

  describe('disabled property', () => {
    it('should default to false', async () => {
      const el = await createDsIcon();
      expect(el.disabled).toBe(false);
    });

    it('should reflect disabled attribute on the host', async () => {
      const el = await createDsIcon({ disabled: '' });
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('should toggle disabled when set dynamically', async () => {
      const el = await createDsIcon();
      expect(el.disabled).toBe(false);

      el.disabled = true;
      await el.updateComplete;
      expect(el.hasAttribute('disabled')).toBe(true);

      el.disabled = false;
      await el.updateComplete;
      expect(el.hasAttribute('disabled')).toBe(false);
    });
  });
});
