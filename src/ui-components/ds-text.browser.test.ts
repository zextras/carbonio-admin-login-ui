/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DsText } from './ds-text';
import { dsTextVars } from './ds-text.styles';
import { resolveThemeColor } from './theme/theme-utils';
describe('ds-text', () => {
  let container: HTMLDivElement;

  afterEach(() => {
    container?.remove();
  });

  async function renderDsText(template: string): Promise<DsText> {
    container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container);
    const el = container.querySelector('ds-text') as DsText;
    await el.updateComplete;
    return el;
  }

  describe('default rendering', () => {
    it.only('should render slot content as text with default span tag', async () => {
      const screen = page.render(html`<ds-text as="h1">Hello</ds-text>`);
      const text = screen.getByRole('generic', { name: 'Hello' });
      expect(text).toBeVisible();
    });

    it('should render a slot element in the shadow DOM', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      const slot = el.shadowRoot?.querySelector('slot');
      expect(slot).not.toBeNull();
    });
  });

  describe.skip('default property values', () => {
    it('should have color set to "text" by default', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.color).toBe('text');
    });

    it('should have size set to "medium" by default', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.size).toBe('medium');
    });

    it('should have weight set to "regular" by default', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.weight).toBe('regular');
    });

    it('should have overflow set to "ellipsis" by default', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.overflow).toBe('ellipsis');
    });

    it('should have disabled set to false by default', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.disabled).toBe(false);
    });

    it('should have lineHeight set to undefined by default', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.lineHeight).toBeUndefined();
    });
  });

  describe('reflected attributes', () => {
    it('should reflect the color attribute', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.getAttribute('color')).toBe('text');
      el.color = 'primary';
      await el.updateComplete;
      expect(el.getAttribute('color')).toBe('primary');
    });

    it('should reflect the size attribute', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.getAttribute('size')).toBe('medium');
      el.size = 'large';
      await el.updateComplete;
      expect(el.getAttribute('size')).toBe('large');
    });

    it('should reflect the weight attribute', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.getAttribute('weight')).toBe('regular');
      el.weight = 'bold';
      await el.updateComplete;
      expect(el.getAttribute('weight')).toBe('bold');
    });

    it('should reflect the overflow attribute', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.getAttribute('overflow')).toBe('ellipsis');
      el.overflow = 'break-word';
      await el.updateComplete;
      expect(el.getAttribute('overflow')).toBe('break-word');
    });

    it('should reflect the disabled attribute when set to true', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.hasAttribute('disabled')).toBe(false);
      el.disabled = true;
      await el.updateComplete;
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    it('should update property when attribute is set', async () => {
      const el = await renderDsText('<ds-text color="error" size="large">some text</ds-text>');
      expect(el.color).toBe('error');
      expect(el.size).toBe('large');
    });
  });

  describe('willUpdate behavior', () => {
    it('should set the color CSS variable on initial render with default color', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      const expectedColor = resolveThemeColor('text', 'regular');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });

    it('should update the color CSS variable when color property changes', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      el.color = 'primary';
      await el.updateComplete;
      const expectedColor = resolveThemeColor('primary', 'regular');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });

    it('should set the color CSS variable based on initial attribute', async () => {
      const el = await renderDsText('<ds-text color="error">some text</ds-text>');
      const expectedColor = resolveThemeColor('error', 'regular');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });
  });

  describe('disabled state', () => {
    it('should resolve color with disabled state when disabled is true', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      el.disabled = true;
      await el.updateComplete;
      const expectedColor = resolveThemeColor('text', 'disabled');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });

    it('should resolve color with disabled state when both color and disabled change', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      el.color = 'error';
      el.disabled = true;
      await el.updateComplete;
      const expectedColor = resolveThemeColor('error', 'disabled');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });

    it('should resolve color with regular state when disabled is toggled back to false', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      el.disabled = true;
      await el.updateComplete;
      el.disabled = false;
      await el.updateComplete;
      const expectedColor = resolveThemeColor('text', 'regular');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });

    it('should resolve color with disabled state when disabled attribute is set', async () => {
      const el = await renderDsText('<ds-text disabled>some text</ds-text>');
      const expectedColor = resolveThemeColor('text', 'disabled');
      expect(el.style.getPropertyValue(dsTextVars.color)).toBe(expectedColor);
    });
  });

  describe('as property', () => {
    it('should default to span tag', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.as).toBe('span');
      const innerTag = el.shadowRoot?.querySelector('span');
      expect(innerTag).not.toBeNull();
    });

    it('should render h1 tag when as="h1"', async () => {
      const el = await renderDsText('<ds-text as="h1">Heading</ds-text>');
      expect(el.as).toBe('h1');
      const h1 = el.shadowRoot?.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1?.textContent).toBe('Heading');
    });

    it('should render p tag when as="p"', async () => {
      const el = await renderDsText('<ds-text as="p">Paragraph</ds-text>');
      expect(el.as).toBe('p');
      const p = el.shadowRoot?.querySelector('p');
      expect(p).not.toBeNull();
      expect(p?.textContent).toBe('Paragraph');
    });

    it('should render label tag when as="label"', async () => {
      const el = await renderDsText('<ds-text as="label">Label</ds-text>');
      expect(el.as).toBe('label');
      const label = el.shadowRoot?.querySelector('label');
      expect(label).not.toBeNull();
    });

    it('should reflect as attribute', async () => {
      const el = await renderDsText('<ds-text>some text</ds-text>');
      expect(el.getAttribute('as')).toBe('span');
      el.as = 'h2';
      await el.updateComplete;
      expect(el.getAttribute('as')).toBe('h2');
    });
  });
});
