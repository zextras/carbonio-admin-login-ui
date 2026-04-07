/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-icon';
import '../ds-input';
import '../ds-password-input';
import '../theme/theme.css';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { DsPasswordInput } from '../ds-password-input';

let element: DsPasswordInput;

async function createDsPasswordInput(
  attrs: Record<string, string> = {},
): Promise<DsPasswordInput> {
  element = document.createElement('ds-password-input');
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

describe('ds-password-input', () => {
  describe('rendering', () => {
    it('should render a visible textbox', async () => {
      await createDsPasswordInput();
      await expect.element(page.getByRole('textbox')).toBeVisible();
    });

    it('should not have aria-invalid by default', async () => {
      await createDsPasswordInput();
      await expect
        .element(page.getByRole('textbox'))
        .toHaveAttribute('aria-invalid', 'false');
    });

    it('should render the toggle button with correct aria-label', async () => {
      await createDsPasswordInput();
      await expect
        .element(page.getByRole('button', { name: 'Show password' }))
        .toBeVisible();
    });

    it('should have aria-pressed false on toggle button by default', async () => {
      await createDsPasswordInput();
      await expect
        .element(page.getByRole('button', { name: 'Show password' }))
        .toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('password visibility toggle', () => {
    it('should set input type to password by default', async () => {
      const el = await createDsPasswordInput();
      const dsInput = el.querySelector(
        'ds-input',
      ) as HTMLElement & { type: string };
      expect(dsInput.type).toBe('password');
    });

    it('should toggle input type to text when toggle button is clicked', async () => {
      const el = await createDsPasswordInput();
      const toggle = page.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle);
      const dsInput = el.querySelector(
        'ds-input',
      ) as HTMLElement & { type: string };
      expect(dsInput.type).toBe('text');
    });

    it('should toggle back to password on second click', async () => {
      const el = await createDsPasswordInput();
      const toggle = page.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle);
      await userEvent.click(toggle);
      const dsInput = el.querySelector(
        'ds-input',
      ) as HTMLElement & { type: string };
      expect(dsInput.type).toBe('password');
    });

    it('should update aria-pressed to true when toggled', async () => {
      await createDsPasswordInput();
      const toggle = page.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle);
      await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update aria-pressed back to false on second click', async () => {
      await createDsPasswordInput();
      const toggle = page.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle);
      await userEvent.click(toggle);
      await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('should not toggle when disabled', async () => {
      const el = await createDsPasswordInput({ disabled: '' });
      const toggle = page.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle, { force: true });
      const dsInput = el.querySelector(
        'ds-input',
      ) as HTMLElement & { type: string };
      expect(dsInput.type).toBe('password');
    });
  });

  describe('label property', () => {
    it('should not render label text when not provided', async () => {
      await createDsPasswordInput();
      await expect
        .element(page.getByText('Password'))
        .not.toBeInTheDocument();
    });

    it('should render visible label text', async () => {
      await createDsPasswordInput({ label: 'Password' });
      await expect.element(page.getByText('Password')).toBeVisible();
    });

    it('should associate label with input', async () => {
      await createDsPasswordInput({ label: 'Password' });
      await expect
        .element(page.getByRole('textbox', { name: 'Password' }))
        .toBeVisible();
    });

    it('should reflect label attribute on host', async () => {
      const el = await createDsPasswordInput({ label: 'Password' });
      expect(el.getAttribute('label')).toBe('Password');
    });

    it('should update label when changed dynamically', async () => {
      const el = await createDsPasswordInput({ label: 'Old' });
      await expect.element(page.getByLabelText('Old')).toBeVisible();

      el.label = 'New';
      await el.updateComplete;

      await expect.element(page.getByLabelText('New')).toBeVisible();
    });
  });

  describe('initialValue property', () => {
    it('should set initial input value', async () => {
      const el = await createDsPasswordInput({
        'initial-value': 'secret123',
      });
      expect(el.value).toBe('secret123');
    });

    it('should be empty when not provided', async () => {
      const el = await createDsPasswordInput();
      expect(el.value).toBe('');
    });
  });

  describe('value getter/setter', () => {
    it('should return current input value', async () => {
      const el = await createDsPasswordInput({
        'initial-value': 'initial',
      });
      expect(el.value).toBe('initial');
    });

    it('should update input value via setter', async () => {
      const el = await createDsPasswordInput();
      expect(el.value).toBe('');

      el.value = 'typed';
      expect(el.value).toBe('typed');
    });
  });

  describe('name property', () => {
    it('should reflect name attribute on host', async () => {
      const el = await createDsPasswordInput({ name: 'password' });
      expect(el.getAttribute('name')).toBe('password');
    });
  });

  describe('autocomplete property', () => {
    it('should default to "current-password"', async () => {
      const el = await createDsPasswordInput();
      expect(el.autocomplete).toBe('current-password');
    });

    it('should accept custom autocomplete value', async () => {
      const el = await createDsPasswordInput({
        autocomplete: 'new-password',
      });
      expect(el.autocomplete).toBe('new-password');
    });
  });

  describe('borderColor property', () => {
    it('should default to "gray3"', async () => {
      const el = await createDsPasswordInput();
      expect(el.borderColor).toBe('gray3');
    });

    it('should accept custom border color', async () => {
      const el = await createDsPasswordInput({ 'border-color': 'red' });
      expect(el.borderColor).toBe('red');
    });
  });

  describe('disabled state', () => {
    it('should be enabled by default', async () => {
      await createDsPasswordInput();
      await expect.element(page.getByRole('textbox')).toBeEnabled();
    });

    it('should be disabled when disabled attribute is set', async () => {
      await createDsPasswordInput({ disabled: '' });
      await expect.element(page.getByRole('textbox')).toBeDisabled();
    });

    it('should reflect disabled attribute on host', async () => {
      const el = await createDsPasswordInput({ disabled: '' });
      expect(el.hasAttribute('disabled')).toBe(true);
      expect(el.disabled).toBe(true);
    });

    it('should toggle disabled state dynamically', async () => {
      const el = await createDsPasswordInput();
      const textbox = page.getByRole('textbox');
      await expect.element(textbox).toBeEnabled();

      el.disabled = true;
      await el.updateComplete;
      await expect.element(textbox).toBeDisabled();

      el.disabled = false;
      await el.updateComplete;
      await expect.element(textbox).toBeEnabled();
    });

    it('should disable toggle button when disabled', async () => {
      await createDsPasswordInput({ disabled: '' });
      await expect
        .element(page.getByRole('button', { name: 'Show password' }))
        .toBeDisabled();
    });
  });

  describe('hasError state', () => {
    it('should have aria-invalid="false" by default', async () => {
      await createDsPasswordInput();
      await expect
        .element(page.getByRole('textbox'))
        .toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-invalid="true" when has-error is set', async () => {
      await createDsPasswordInput({ 'has-error': '' });
      await expect
        .element(page.getByRole('textbox'))
        .toHaveAttribute('aria-invalid', 'true');
    });

    it('should reflect has-error attribute on host', async () => {
      const el = await createDsPasswordInput({ 'has-error': '' });
      expect(el.hasAttribute('has-error')).toBe(true);
      expect(el.hasError).toBe(true);
    });

    it('should toggle error state dynamically', async () => {
      const el = await createDsPasswordInput();
      const textbox = page.getByRole('textbox');
      await expect
        .element(textbox)
        .toHaveAttribute('aria-invalid', 'false');

      el.hasError = true;
      await el.updateComplete;
      await expect
        .element(textbox)
        .toHaveAttribute('aria-invalid', 'true');

      el.hasError = false;
      await el.updateComplete;
      await expect
        .element(textbox)
        .toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('errorMessage', () => {
    it('should render error message when hasError and errorMessage are set', async () => {
      await createDsPasswordInput({
        'has-error': '',
        'error-message': 'Required field',
      });
      await expect
        .element(page.getByText('Required field'))
        .toBeVisible();
    });

    it('should not render error message when hasError is false', async () => {
      await createDsPasswordInput({ 'error-message': 'Required field' });
      await expect
        .element(page.getByText('Required field'))
        .not.toBeInTheDocument();
    });

    it('should not render error message when errorMessage is empty', async () => {
      await createDsPasswordInput({ 'has-error': '' });
      await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
    });

    it('should have role="alert" on error message', async () => {
      await createDsPasswordInput({
        'has-error': '',
        'error-message': 'Too short',
      });
      await expect.element(page.getByRole('alert')).toBeVisible();
    });

    it('should render error text content', async () => {
      await createDsPasswordInput({
        'has-error': '',
        'error-message': 'Must be 8 characters',
      });
      await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent('Must be 8 characters');
    });

    it('should update error message dynamically', async () => {
      const el = await createDsPasswordInput({
        'has-error': '',
        'error-message': 'Old error',
      });
      await expect
        .element(page.getByText('Old error'))
        .toBeVisible();

      el.errorMessage = 'New error';
      await el.updateComplete;

      await expect
        .element(page.getByText('New error'))
        .toBeVisible();
    });
  });

  describe('focus and blur', () => {
    it('should focus the input via focus()', async () => {
      const el = await createDsPasswordInput();
      const focusHandler = vi.fn();
      el.addEventListener('focus', focusHandler);

      el.focus();

      expect(focusHandler).toHaveBeenCalled();
    });

    it('should blur the input via blur()', async () => {
      const el = await createDsPasswordInput();
      const blurHandler = vi.fn();
      el.addEventListener('blur', blurHandler);

      el.focus();
      el.blur();

      expect(blurHandler).toHaveBeenCalled();
    });

    it('should dispatch focus event with bubbles and composed', async () => {
      const el = await createDsPasswordInput();
      const focusHandler = vi.fn();
      el.addEventListener('focus', focusHandler);

      el.focus();

      const event = focusHandler.mock.calls.find(
        (call) => call[0] instanceof FocusEvent,
      );
      expect(event).toBeDefined();
      expect(event![0].bubbles).toBe(true);
      expect(event![0].composed).toBe(true);
    });

    it('should dispatch blur event with bubbles and composed', async () => {
      const el = await createDsPasswordInput();
      const blurHandler = vi.fn();
      el.addEventListener('blur', blurHandler);

      el.focus();
      el.blur();

      const event = blurHandler.mock.calls.find(
        (call) => call[0] instanceof FocusEvent,
      );
      expect(event).toBeDefined();
      expect(event![0].bubbles).toBe(true);
      expect(event![0].composed).toBe(true);
    });
  });

  describe('events', () => {
    it('should dispatch ds-input event with value detail on typing', async () => {
      const el = await createDsPasswordInput();
      const inputHandler = vi.fn();
      el.addEventListener('ds-input', inputHandler);

      await userEvent.fill(page.getByRole('textbox'), 'hello');

      expect(inputHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 'hello' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should dispatch ds-change event with value detail on change', async () => {
      const el = await createDsPasswordInput();
      const changeHandler = vi.fn();
      el.addEventListener('ds-change', changeHandler);

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
