/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-spinner';
import '../theme/theme.css';

import { describe, expect, it } from 'vitest';

import type { DsSpinner } from '../ds-spinner';

let element: DsSpinner;

async function createDsSpinner(attrs: Record<string, string> = {}): Promise<DsSpinner> {
  element = document.createElement('ds-spinner');
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

describe('ds-spinner', () => {
  describe('color property', () => {
    it('should default to "primary"', async () => {
      const el = await createDsSpinner();
      expect(el.color).toBe('primary');
    });

    it('should set --border-color CSS variable with default color', async () => {
      const el = await createDsSpinner();
      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const cssVarValue = svg.style.getPropertyValue('--ds-spinner-color');
      expect(cssVarValue).toContain('primary');
    });

    it.each([
      { color: 'primary' },
      { color: 'secondary' },
      { color: 'error' },
      { color: 'success' },
      { color: 'warning' },
    ])('should accept color="$color"', async ({ color }) => {
      const el = await createDsSpinner({ color });
      expect(el.color).toBe(color);
    });

    it('should update --border-color when color changes dynamically', async () => {
      const el = await createDsSpinner({ color: 'primary' });

      el.color = 'error';
      await el.updateComplete;

      const svg = el.shadowRoot!.querySelector('svg') as SVGElement;
      const updatedColor = svg.style.getPropertyValue('--ds-spinner-color');
      expect(updatedColor).toContain('error');
    });
  });

  describe('rendering', () => {
    it('should render an SVG element', async () => {
      const el = await createDsSpinner();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('should render an SVG with viewBox="0 0 50 50"', async () => {
      const el = await createDsSpinner();
      const svg = el.shadowRoot!.querySelector('svg');
      expect(svg!.getAttribute('viewBox')).toBe('0 0 50 50');
    });

    it('should render a circle element inside the SVG', async () => {
      const el = await createDsSpinner();
      const circle = el.shadowRoot!.querySelector('svg circle');
      expect(circle).not.toBeNull();
    });

    it('should render circle with correct attributes', async () => {
      const el = await createDsSpinner();
      const circle = el.shadowRoot!.querySelector('svg circle');
      expect(circle!.getAttribute('cx')).toBe('25');
      expect(circle!.getAttribute('cy')).toBe('25');
      expect(circle!.getAttribute('r')).toBe('20');
      expect(circle!.getAttribute('fill')).toBe('none');
      expect(circle!.getAttribute('stroke-width')).toBe('4');
    });

    it('should have the "path" class on the circle', async () => {
      const el = await createDsSpinner();
      const circle = el.shadowRoot!.querySelector('svg circle');
      expect(circle!.classList.contains('path')).toBe(true);
    });

    it('should apply stroke from --border-color CSS variable', async () => {
      const el = await createDsSpinner({ color: 'primary' });
      const circle = el.shadowRoot!.querySelector('.path') as SVGCircleElement;
      const computedStyle = globalThis.getComputedStyle(circle);
      expect(computedStyle.stroke).toBe('rgb(43, 115, 210)');
    });
  });

  describe('custom styling', () => {
    it('should allow overriding --border-color after element creation', async () => {
      const el = await createDsSpinner();
      el.style.setProperty('--border-color', '#00ff00');
      await el.updateComplete;

      const circle = el.shadowRoot!.querySelector('.path') as SVGCircleElement;
      const computedStyle = globalThis.getComputedStyle(circle);
      expect(computedStyle.stroke).toBe('rgb(0, 255, 0)');
    });
  });
});
