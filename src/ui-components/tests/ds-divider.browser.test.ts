/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-divider';

import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';

import type { DsDivider } from '../ds-divider';

let element: DsDivider;

async function createDsDivider(attrs: Record<string, string> = {}): Promise<DsDivider> {
  element = document.createElement('ds-divider');
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

describe('ds-divider', () => {
  describe('rendering structure', () => {
    it('should render an hr element with role separator', async () => {
      await createDsDivider();

      const separator = page.getByRole('separator');
      await expect.element(separator).toBeVisible();
    });

    it('should have aria-orientation="horizontal"', async () => {
      const el = await createDsDivider();

      const hr = el.shadowRoot!.querySelector('hr');
      expect(hr!.getAttribute('aria-orientation')).toBe('horizontal');
    });
  });

  describe('color property', () => {
    it('should default to "gray2"', async () => {
      const el = await createDsDivider();
      expect(el.color).toBe('gray2');
    });

    it('should reflect color attribute on host', async () => {
      const el = await createDsDivider({ color: 'primary' });
      expect(el.hasAttribute('color')).toBe(true);
      expect(el.getAttribute('color')).toBe('primary');
    });

    it.each([{ color: 'gray2' }, { color: 'primary' }, { color: 'error' }, { color: 'success' }])(
      'should accept color="$color"',
      async ({ color }) => {
        const el = await createDsDivider({ color });
        expect(el.color).toBe(color);
      },
    );

    it('should apply backgroundColor CSS variable based on color', async () => {
      const el = await createDsDivider({ color: 'primary' });
      const hr = el.shadowRoot!.querySelector('hr') as HTMLElement;
      expect(hr.style.backgroundColor).toContain('primary');
    });

    it('should update backgroundColor when color changes dynamically', async () => {
      const el = await createDsDivider({ color: 'gray2' });
      const hr = el.shadowRoot!.querySelector('hr') as HTMLElement;
      expect(hr.style.backgroundColor).toContain('gray2');

      el.color = 'error';
      await el.updateComplete;

      expect(hr.style.backgroundColor).toContain('error');
    });
  });
});
