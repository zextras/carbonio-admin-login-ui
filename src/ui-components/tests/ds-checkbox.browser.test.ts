/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-checkbox';
import '../theme/theme.css';

import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { DsCheckbox } from '../ds-checkbox';

let element: DsCheckbox;

async function createDsCheckbox(attrs: Record<string, string> = {}): Promise<DsCheckbox> {
  element = document.createElement('ds-checkbox');
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

describe('ds-checkbox', () => {
  describe('rendering', () => {
    it('should render a checkbox', async () => {
      await createDsCheckbox();
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).toBeVisible();
    });

    it('should render label when provided', async () => {
      await createDsCheckbox({ label: 'a label' });
      const label = page.getByText('a label');
      await expect.element(label).toBeVisible();
    });

    it('should not render label when not provided', async () => {
      await createDsCheckbox();
      const label = page.getByText('a label');
      await expect.element(label).not.toBeInTheDocument();
    });
  });

  describe('checked state', () => {
    it('should be unchecked by default', async () => {
      await createDsCheckbox();
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).not.toBeChecked();
    });

    it('should be checked when value is set', async () => {
      await createDsCheckbox({ value: '' });
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).toBeChecked();
    });

    it('should reflect value to attribute', async () => {
      const el = await createDsCheckbox({ value: '' });
      expect(el.hasAttribute('value')).toBe(true);
    });

    it('should update checked state when value changes dynamically', async () => {
      const el = await createDsCheckbox();
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).not.toBeChecked();

      el.value = true;
      await el.updateComplete;

      await expect.element(checkbox).toBeChecked();
    });
  });

  describe('label', () => {
    it('should accept label string', async () => {
      await createDsCheckbox({ label: 'Test label' });
      const checkbox = page.getByRole('checkbox', { name: 'Test label' });
      await expect.element(checkbox).toBeVisible();
    });

    it('should have default accessible name when no label provided', async () => {
      await createDsCheckbox();
      const checkbox = page.getByRole('checkbox', { name: 'checkbox' });
      await expect.element(checkbox).toBeVisible();
    });

    it('should update label when changed dynamically', async () => {
      const el = await createDsCheckbox();
      await expect.element(page.getByRole('checkbox', { name: 'checkbox' })).toBeVisible();

      el.label = 'New label';
      await el.updateComplete;

      await expect.element(page.getByRole('checkbox', { name: 'New label' })).toBeVisible();
      await expect.element(page.getByText('New label')).toBeVisible();
    });
  });

  describe('disabled state', () => {
    it('should be enabled by default', async () => {
      await createDsCheckbox();
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).toBeEnabled();
    });

    it('should be disabled when disabled attribute is set', async () => {
      await createDsCheckbox({ disabled: '' });
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).toBeDisabled();
    });

    it('should reflect disabled attribute on host', async () => {
      const el = await createDsCheckbox({ disabled: '' });
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('click behavior', () => {
    it('should toggle checked on click', async () => {
      await createDsCheckbox();
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);

      await expect.element(checkbox).toBeChecked();
    });

    it('should toggle back to unchecked on second click', async () => {
      await createDsCheckbox({ value: '' });
      const checkbox = page.getByRole('checkbox');
      await expect.element(checkbox).toBeChecked();

      await userEvent.click(checkbox);

      await expect.element(checkbox).not.toBeChecked();
    });

    it('should dispatch change event with correct detail', async () => {
      const el = await createDsCheckbox();
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const checkbox = page.getByRole('checkbox');
      await userEvent.click(checkbox);

      expect(changeHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: true },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should NOT toggle when disabled', async () => {
      await createDsCheckbox({ disabled: '' });
      const checkbox = page.getByRole('checkbox');

      await userEvent.click(checkbox, { force: true });

      await expect.element(checkbox).not.toBeChecked();
    });

    it('should NOT dispatch change event when disabled', async () => {
      const el = await createDsCheckbox({ disabled: '' });
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const checkbox = page.getByRole('checkbox');
      await userEvent.click(checkbox, { force: true });

      expect(changeHandler).not.toHaveBeenCalled();
    });
  });

  describe('keyboard behavior', () => {
    it('should toggle checked on Space key', async () => {
      await createDsCheckbox();
      const checkbox = page.getByRole('checkbox');

      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ }');

      await expect.element(checkbox).toBeChecked();
    });

    it('should NOT toggle when disabled via keyboard', async () => {
      await createDsCheckbox({ disabled: '' });
      const checkbox = page.getByRole('checkbox');

      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{ }');

      await expect.element(checkbox).not.toBeChecked();
    });
  });
});
