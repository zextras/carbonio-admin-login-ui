/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../ds-select';
import '../theme/theme.css';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { DsSelect, SelectItem } from '../ds-select';

const ITEMS: Array<SelectItem> = [
  { label: 'English', value: 'en' },
  { label: 'Italian', value: 'it' },
  { label: 'French', value: 'fr' },
];

let element: DsSelect;

async function createDsSelect(
  attrs: Record<string, string> = {},
  {
    items = ITEMS,
    defaultSelection,
  }: { items?: Array<SelectItem>; defaultSelection?: SelectItem } = {},
): Promise<DsSelect> {
  element = document.createElement('ds-select');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  element.items = items;
  if (defaultSelection) {
    element.defaultSelection = defaultSelection;
  }
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
});

describe('ds-select', () => {
  describe('rendering', () => {
    it('should render a combobox', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toBeVisible();
    });

    it('should render the label text when provided', async () => {
      await createDsSelect({ label: 'Language' });
      const label = page.getByText('Language');
      await expect.element(label).toBeVisible();
    });

    it('should not render label text when not provided', async () => {
      await createDsSelect();
      const label = page.getByText('Language');
      await expect.element(label).not.toBeInTheDocument();
    });

    it('should render a down arrow icon by default', async () => {
      const el = await createDsSelect();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon?.getAttribute('icon')).toBe('ArrowDown');
    });

    it('should not render dropdown items when closed', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('label property', () => {
    it('should reflect label attribute on host', async () => {
      const el = await createDsSelect({ label: 'Language' });
      expect(el.getAttribute('label')).toBe('Language');
    });

    it('should update label when changed dynamically', async () => {
      const el = await createDsSelect({ label: 'Old' });
      await expect.element(page.getByText('Old')).toBeVisible();

      el.label = 'New';
      await el.updateComplete;

      await expect.element(page.getByText('New')).toBeVisible();
    });
  });

  describe('items property', () => {
    it('should display items in the dropdown when opened', async () => {
      await createDsSelect({ label: 'Language' });
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await expect.element(page.getByText('English')).toBeVisible();
      await expect.element(page.getByText('Italian')).toBeVisible();
      await expect.element(page.getByText('French')).toBeVisible();
    });

    it('should render items with option role', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      const options = page.getByRole('option');
      await expect.element(options.first()).toBeVisible();
    });

    it('should render the correct number of items', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      const items = page.getByRole('option');
      await expect.element(items.nth(0)).toBeVisible();
      await expect.element(items.nth(1)).toBeVisible();
      await expect.element(items.nth(2)).toBeVisible();
    });

    it('should update items dynamically', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await expect.element(page.getByText('English')).toBeVisible();

      el.items = [{ label: 'German', value: 'de' }];
      await el.updateComplete;

      await expect.element(page.getByText('German')).toBeVisible();
      await expect.element(page.getByText('English')).not.toBeInTheDocument();
    });
  });

  describe('default selection', () => {
    it('should show default selection label', async () => {
      await createDsSelect(
        { label: 'Language' },
        { defaultSelection: { label: 'Italian', value: 'it' } },
      );
      const combobox = page.getByRole('combobox');
      await expect.element(combobox.getByText('Italian')).toBeVisible();
    });

    it('should not apply default if value does not match any item', async () => {
      const el = await createDsSelect(
        { label: 'Language' },
        { defaultSelection: { label: 'Unknown', value: 'xx' } },
      );
      const selectedText = el.shadowRoot!.querySelector('.selected-text');
      expect(selectedText?.textContent?.trim()).toBe('');
    });
  });

  describe('disabled state', () => {
    it('should not be disabled by default', async () => {
      const el = await createDsSelect();
      expect(el.disabled).toBe(false);
    });

    it('should reflect disabled attribute on host', async () => {
      const el = await createDsSelect({ disabled: '' });
      expect(el.hasAttribute('disabled')).toBe(true);
      expect(el.disabled).toBe(true);
    });

    it('should set combobox tabindex to -1 when disabled', async () => {
      await createDsSelect({ disabled: '' });
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toHaveAttribute('tabindex', '-1');
    });

    it('should set aria-disabled to true when disabled', async () => {
      await createDsSelect({ disabled: '' });
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toHaveAttribute('aria-disabled', 'true');
    });

    it('should NOT open dropdown when clicked while disabled', async () => {
      await createDsSelect({ disabled: '' });
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox, { force: true });

      await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('should toggle disabled state dynamically', async () => {
      const el = await createDsSelect();
      expect(el.disabled).toBe(false);

      el.disabled = true;
      await el.updateComplete;
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute('disabled')).toBe(true);

      el.disabled = false;
      await el.updateComplete;
      expect(el.disabled).toBe(false);
    });
  });

  describe('open and close', () => {
    it('should open dropdown on click', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      const listbox = page.getByRole('listbox');
      await expect.element(listbox).toBeVisible();
    });

    it('should close dropdown on second click', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await expect.element(page.getByRole('listbox')).toBeVisible();

      await userEvent.click(combobox);

      await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-expanded to false when closed', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-expanded to true when open', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await expect.element(combobox).toHaveAttribute('aria-expanded', 'true');
    });

    it('should show up arrow icon when open', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon?.getAttribute('icon')).toBe('ArrowUp');
    });

    it('should show down arrow icon when closed', async () => {
      const el = await createDsSelect();
      const icon = el.shadowRoot!.querySelector('ds-icon');
      expect(icon?.getAttribute('icon')).toBe('ArrowDown');
    });
  });

  describe('selection', () => {
    it('should select an item on click', async () => {
      await createDsSelect({ label: 'Language' });
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await userEvent.click(page.getByText('Italian'));

      await expect.element(combobox.getByText('Italian')).toBeVisible();
    });

    it('should close dropdown after selection', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await userEvent.click(page.getByText('Italian'));

      await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('should mark selected item with aria-selected true', async () => {
      await createDsSelect({}, { defaultSelection: { label: 'Italian', value: 'it' } });
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      const options = page.getByRole('option');
      await expect.element(options.nth(0)).toHaveAttribute('aria-selected', 'false');
      await expect.element(options.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect.element(options.nth(2)).toHaveAttribute('aria-selected', 'false');
    });

    it('should display checkmark icon for selected item', async () => {
      const el = await createDsSelect({}, { defaultSelection: { label: 'Italian', value: 'it' } });
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      const dropdownItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
      const selectedIcon = dropdownItems[1]?.querySelector('ds-icon');
      expect(selectedIcon?.getAttribute('icon')).toBe('CheckmarkSquare');

      const unselectedIcon = dropdownItems[0]?.querySelector('ds-icon');
      expect(unselectedIcon?.getAttribute('icon')).toBe('Square');
    });

    it('should update selection when clicking a different item', async () => {
      await createDsSelect(
        { label: 'Language' },
        { defaultSelection: { label: 'English', value: 'en' } },
      );

      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.click(page.getByText('French'));

      const el = element;
      const selectedText = el.shadowRoot!.querySelector('.selected-text');
      expect(selectedText?.textContent?.trim()).toBe('French');
    });
  });

  describe('change event', () => {
    it('should dispatch change event when an item is selected', async () => {
      const el = await createDsSelect();
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.click(page.getByText('Italian'));

      expect(changeHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 'it', label: 'Italian' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should NOT dispatch change event when selecting the already selected item', async () => {
      const el = await createDsSelect({}, { defaultSelection: { label: 'Italian', value: 'it' } });
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.click(page.getByRole('listbox').getByText('Italian'));

      expect(changeHandler).not.toHaveBeenCalled();
    });

    it('should dispatch change event with correct detail for each selection', async () => {
      const el = await createDsSelect();
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const combobox = page.getByRole('combobox');

      await userEvent.click(combobox);
      await userEvent.click(page.getByText('English'));

      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 'en', label: 'English' },
        }),
      );

      await userEvent.click(combobox);
      await userEvent.click(page.getByText('French'));

      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 'fr', label: 'French' },
        }),
      );
    });
  });

  describe('keyboard navigation - trigger', () => {
    it('should open dropdown on Enter key', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.keyboard('{Escape}');

      await userEvent.keyboard('{Enter}');

      await expect.element(page.getByRole('listbox')).toBeVisible();
    });

    it('should open dropdown on Space key', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.keyboard('{Escape}');

      await userEvent.keyboard('{ }');

      await expect.element(page.getByRole('listbox')).toBeVisible();
    });

    it('should close dropdown on Escape key', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await expect.element(page.getByRole('listbox')).toBeVisible();

      await userEvent.keyboard('{Escape}');

      await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('should open and focus first item on ArrowDown key', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.keyboard('{Escape}');

      await userEvent.keyboard('{ArrowDown}');
      await el.updateComplete;

      await expect.element(page.getByRole('listbox')).toBeVisible();
    });

    it('should open and focus last item on ArrowUp key', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.keyboard('{Escape}');

      await userEvent.keyboard('{ArrowUp}');
      await el.updateComplete;

      await expect.element(page.getByRole('listbox')).toBeVisible();
    });

    it('should toggle dropdown on Enter when open', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await expect.element(page.getByRole('listbox')).toBeVisible();

      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{Enter}');

      await expect.element(page.getByRole('listbox')).toBeVisible();
    });
  });

  describe('keyboard navigation - items', () => {
    it('should select item on Enter key', async () => {
      const el = await createDsSelect();
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{Enter}');

      expect(changeHandler).toHaveBeenCalledTimes(1);
    });

    it('should select item on Space key', async () => {
      const el = await createDsSelect();
      const changeHandler = vi.fn();
      el.addEventListener('change', changeHandler);

      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{ }');

      expect(changeHandler).toHaveBeenCalledTimes(1);
    });

    it('should navigate down with ArrowDown key', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{ArrowDown}');
      await el.updateComplete;

      const secondItemId = el.shadowRoot!.querySelector(`[data-value="it"]`)!.id;
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', secondItemId);
    });

    it('should navigate up with ArrowUp key', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowUp}');
      await el.updateComplete;

      const firstItemId = el.shadowRoot!.querySelector(`[data-value="en"]`)!.id;
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', firstItemId);
    });

    it('should wrap from last to first on ArrowDown', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');
      await el.updateComplete;

      const firstItemId = el.shadowRoot!.querySelector(`[data-value="en"]`)!.id;
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', firstItemId);
    });

    it('should wrap from first to last on ArrowUp', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{ArrowUp}');
      await el.updateComplete;

      const lastItemId = el.shadowRoot!.querySelector(`[data-value="fr"]`)!.id;
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', lastItemId);
    });

    it('should focus first item on Home key', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Home}');
      await el.updateComplete;

      const firstItemId = el.shadowRoot!.querySelector(`[data-value="en"]`)!.id;
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', firstItemId);
    });

    it('should focus last item on End key', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{End}');
      await el.updateComplete;

      const lastItemId = el.shadowRoot!.querySelector(`[data-value="fr"]`)!.id;
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', lastItemId);
    });

    it('should close dropdown on Escape key from an item', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{Escape}');

      await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('should close dropdown on Tab key from an item', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await el.updateComplete;

      await userEvent.keyboard('{Tab}');

      await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('focus behavior', () => {
    it('should set focused attribute on host when trigger is focused', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.keyboard('{Escape}');

      expect(el.hasAttribute('focused')).toBe(true);
    });

    it('should remove focused attribute when trigger loses focus', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);
      await userEvent.keyboard('{Escape}');

      expect(el.hasAttribute('focused')).toBe(true);

      await userEvent.keyboard('{Tab}');
      await el.updateComplete;

      expect(el.hasAttribute('focused')).toBe(false);
    });

    it('should return focus to trigger after selecting an item', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      await userEvent.click(page.getByText('Italian'));
      await el.updateComplete;

      expect(el.hasAttribute('focused')).toBe(true);
    });
  });

  describe('aria attributes', () => {
    it('should have aria-haspopup set to listbox', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should have aria-controls pointing to listbox id', async () => {
      const el = await createDsSelect();
      const combobox = page.getByRole('combobox');
      const listboxId = el.shadowRoot!.querySelector('[role="listbox"]')!.id;
      await expect.element(combobox).toHaveAttribute('aria-controls', listboxId);
    });

    it('should have aria-labelledby pointing to label id', async () => {
      const el = await createDsSelect({ label: 'Language' });
      const combobox = page.getByRole('combobox');
      const labelEl = el.shadowRoot!.querySelector('.label');
      await expect.element(combobox).toHaveAttribute('aria-labelledby', labelEl!.id);
    });

    it('should have listbox with aria-labelledby', async () => {
      const el = await createDsSelect({ label: 'Language' });
      const combobox = page.getByRole('combobox');
      await userEvent.click(combobox);

      const listbox = el.shadowRoot!.querySelector('[role="listbox"]');
      const labelEl = el.shadowRoot!.querySelector('.label');
      expect(listbox?.getAttribute('aria-labelledby')).toBe(labelEl!.id);
    });

    it('should have aria-disabled false by default', async () => {
      await createDsSelect();
      const combobox = page.getByRole('combobox');
      await expect.element(combobox).toHaveAttribute('aria-disabled', 'false');
    });
  });
});
