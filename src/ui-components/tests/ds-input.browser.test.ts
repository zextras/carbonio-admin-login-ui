/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../ds-input';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { DsInput } from '../ds-input';

let element: DsInput;

async function createDsInput(attrs: Record<string, string> = {}): Promise<DsInput> {
  element = document.createElement('ds-input');
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

describe('ds-input', () => {
  describe('rendering', () => {
    it('should render a visible textbox', async () => {
      await createDsInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toBeVisible();
    });

    it('should not have aria-invalid by default', async () => {
      await createDsInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('label property', () => {
    it('should not render label text when not provided', async () => {
      await createDsInput();
      const label = page.getByText('Email');
      await expect.element(label).not.toBeInTheDocument();
    });

    it('should render visible label text', async () => {
      await createDsInput({ label: 'Email' });
      const label = page.getByText('Email');
      await expect.element(label).toBeVisible();
    });

    it('should associate label with input', async () => {
      await createDsInput({ label: 'Email' });
      const textbox = page.getByLabelText('Email');
      await expect.element(textbox).toBeVisible();
    });

    it('should reflect label attribute on host', async () => {
      const el = await createDsInput({ label: 'Username' });
      expect(el.getAttribute('label')).toBe('Username');
    });

    it('should update label when changed dynamically', async () => {
      const el = await createDsInput({ label: 'Old' });
      await expect.element(page.getByLabelText('Old')).toBeVisible();

      el.label = 'New';
      await el.updateComplete;

      await expect.element(page.getByLabelText('New')).toBeVisible();
    });
  });

  describe('type property', () => {
    it('should default to "text"', async () => {
      const el = await createDsInput();
      expect(el.type).toBe('text');
    });

    it('should reflect type attribute on host', async () => {
      const el = await createDsInput({ type: 'password' });
      expect(el.getAttribute('type')).toBe('password');
    });

    it.each([
      { type: 'text' },
      { type: 'email' },
      { type: 'password' },
      { type: 'number' },
    ] as const)('should accept type="$type"', async ({ type }) => {
      const el = await createDsInput({ type });
      expect(el.type).toBe(type);
    });
  });

  describe('defaultValue property', () => {
    it('should set initial input value', async () => {
      const el = await createDsInput({ 'default-value': 'hello' });
      expect(el.value).toBe('hello');
    });

    it('should be empty when not provided', async () => {
      const el = await createDsInput();
      expect(el.value).toBe('');
    });
  });

  describe('value getter/setter', () => {
    it('should return current input value', async () => {
      const el = await createDsInput({ 'default-value': 'initial' });
      expect(el.value).toBe('initial');
    });

    it('should update input value via setter', async () => {
      const el = await createDsInput();
      expect(el.value).toBe('');

      el.value = 'typed';
      expect(el.value).toBe('typed');
    });
  });

  describe('name property', () => {
    it('should reflect name attribute on host', async () => {
      const el = await createDsInput({ name: 'username' });
      expect(el.getAttribute('name')).toBe('username');
    });
  });

  describe('autocomplete property', () => {
    it('should default to "off"', async () => {
      const el = await createDsInput();
      expect(el.autocomplete).toBe('off');
    });

    it('should accept custom autocomplete value', async () => {
      const el = await createDsInput({ autocomplete: 'email' });
      expect(el.autocomplete).toBe('email');
    });
  });

  describe('disabled state', () => {
    it('should be enabled by default', async () => {
      await createDsInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toBeEnabled();
    });

    it('should be disabled when disabled attribute is set', async () => {
      await createDsInput({ disabled: '' });
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toBeDisabled();
    });

    it('should reflect disabled attribute on host', async () => {
      const el = await createDsInput({ disabled: '' });
      expect(el.hasAttribute('disabled')).toBe(true);
      expect(el.disabled).toBe(true);
    });

    it('should toggle disabled state dynamically', async () => {
      const el = await createDsInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toBeEnabled();

      el.disabled = true;
      await el.updateComplete;
      await expect.element(textbox).toBeDisabled();

      el.disabled = false;
      await el.updateComplete;
      await expect.element(textbox).toBeEnabled();
    });

    it('should apply disabled cursor style to input container when disabled', async () => {
      const el = await createDsInput({ disabled: '' });
      const container = el.querySelector('.input-container')!;
      expect(getComputedStyle(container).cursor).toBe('default');
    });

    it('should apply text cursor style to input container when enabled', async () => {
      const el = await createDsInput();
      const container = el.querySelector('.input-container')!;
      expect(getComputedStyle(container).cursor).toBe('text');
    });

    it('should toggle disabled cursor style dynamically', async () => {
      const el = await createDsInput();
      const container = el.querySelector('.input-container')!;
      expect(getComputedStyle(container).cursor).toBe('text');

      el.disabled = true;
      await el.updateComplete;
      expect(getComputedStyle(container).cursor).toBe('default');

      el.disabled = false;
      await el.updateComplete;
      expect(getComputedStyle(container).cursor).toBe('text');
    });
  });

  describe('hasError state', () => {
    it('should have aria-invalid="false" by default', async () => {
      await createDsInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-invalid="true" when has-error is set', async () => {
      await createDsInput({ 'has-error': '' });
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should reflect has-error attribute on host', async () => {
      const el = await createDsInput({ 'has-error': '' });
      expect(el.hasAttribute('has-error')).toBe(true);
      expect(el.hasError).toBe(true);
    });

    it('should toggle error state dynamically', async () => {
      const el = await createDsInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toHaveAttribute('aria-invalid', 'false');

      el.hasError = true;
      await el.updateComplete;
      await expect.element(textbox).toHaveAttribute('aria-invalid', 'true');

      el.hasError = false;
      await el.updateComplete;
      await expect.element(textbox).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('focus and blur', () => {
    it('should focus the input via focus()', async () => {
      const el = await createDsInput();
      const focusHandler = vi.fn();
      el.addEventListener('focus', focusHandler);

      el.focus();

      expect(focusHandler).toHaveBeenCalled();
    });

    it('should blur the input via blur()', async () => {
      const el = await createDsInput();
      const blurHandler = vi.fn();
      el.addEventListener('blur', blurHandler);

      el.focus();
      el.blur();

      expect(blurHandler).toHaveBeenCalled();
    });

    it('should dispatch focus event on host when input is focused', async () => {
      const el = await createDsInput();
      const focusHandler = vi.fn();
      el.addEventListener('focus', focusHandler);

      el.focus();

      const customEvent = focusHandler.mock.calls.find((call) => call[0] instanceof FocusEvent);
      expect(customEvent).toBeDefined();
      expect(customEvent![0].bubbles).toBe(true);
      expect(customEvent![0].composed).toBe(true);
    });

    it('should dispatch blur event on host when input is blurred', async () => {
      const el = await createDsInput();
      const blurHandler = vi.fn();
      el.addEventListener('blur', blurHandler);

      el.focus();
      el.blur();

      const customEvent = blurHandler.mock.calls.find((call) => call[0] instanceof FocusEvent);
      expect(customEvent).toBeDefined();
      expect(customEvent![0].bubbles).toBe(true);
      expect(customEvent![0].composed).toBe(true);
    });
  });

  describe('input events', () => {
    it('should dispatch custom input event with value detail on typing', async () => {
      const el = await createDsInput();
      const inputHandler = vi.fn();
      el.addEventListener('input', inputHandler);

      const textbox = page.getByRole('textbox');
      await userEvent.fill(textbox, 'hello');

      expect(inputHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 'hello' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should dispatch custom change event with value detail', async () => {
      const el = await createDsInput();
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const textbox = page.getByRole('textbox');
      await userEvent.click(textbox);
      await userEvent.keyboard('test');
      await userEvent.keyboard('{Tab}');

      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 'test' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  });
});
