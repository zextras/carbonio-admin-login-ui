/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../ds-snackbar';

import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { DsSnackbar } from '../ds-snackbar';

let element: DsSnackbar;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSnackbarContainer(el: DsSnackbar = element): Element | null {
  return el.shadowRoot!.querySelector('.snack-container');
}

async function createDsSnackbar(attrs: Record<string, string> = {}): Promise<DsSnackbar> {
  element = document.createElement('ds-snackbar');
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

describe('ds-snackbar', () => {
  describe('rendering', () => {
    it('should not render content when open is false', async () => {
      await createDsSnackbar();
      const okButton = page.getByText(/ok/i);
      await expect.element(okButton).not.toBeInTheDocument();
    });
    it('should render when open is true', async () => {
      await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const okButton = page.getByRole('button', { name: /ok/i });
      await expect.element(okButton).toBeVisible();
    });

    it('should display the label text', async () => {
      await createDsSnackbar({
        open: '',
        label: 'Hello world',
        'auto-hide-timeout': '60000',
      });
      const snackbarText = page.getByText('Hello world');
      await expect.element(snackbarText).toBeVisible();
    });

    it.each([
      { severity: 'success', icon: 'CheckmarkOutline' },
      { severity: 'info', icon: 'InfoOutline' },
      { severity: 'warning', icon: 'AlertTriangleOutline' },
      { severity: 'error', icon: 'CloseCircleOutline' },
    ])('should render $icon icon for severity "$severity"', async ({ severity, icon }) => {
      const el = await createDsSnackbar({
        open: '',
        severity,
        'auto-hide-timeout': '60000',
      });
      const snackbar = getSnackbarContainer(el);
      const dsIcon = snackbar?.shadowRoot?.querySelector(`ds-icon[icon="${icon}"]`);
      expect(dsIcon).not.toBeNull();
    });

    it('should render the action button with action-label', async () => {
      await createDsSnackbar({
        open: '',
        'action-label': 'Undo',
        'auto-hide-timeout': '60000',
      });
      const button = page.getByRole('button', { name: 'Undo' });
      await expect.element(button).toBeVisible();
    });

    it('should render a progress bar', async () => {
      const el = await createDsSnackbar({
        open: '',
        'auto-hide-timeout': '60000',
      });
      const bar = el.shadowRoot!.querySelector('.progress-bar');
      expect(bar).not.toBeNull();
    });
  });

  describe('properties', () => {
    it('should default severity to "info"', async () => {
      const el = await createDsSnackbar({ open: '' });
      const snackbar = getSnackbarContainer(el);
      const icon = snackbar?.shadowRoot?.querySelector('ds-icon[icon="InfoOutline"]');
      expect(icon).not.toBeNull();
    });

    it('should default action-label to "Ok"', async () => {
      await createDsSnackbar({ open: '' });
      expect(page.getByText('OK')).toBeVisible();
    });

    it('should default auto-hide-timeout to 4000', async () => {
      const el = await createDsSnackbar();
      expect(el.autoHideTimeout).toBe(4000);
    });

    it('should reflect "open" attribute on host', async () => {
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      expect(el.hasAttribute('open')).toBe(true);
    });

    it('should update rendered label when property changes', async () => {
      const el = await createDsSnackbar({
        open: '',
        label: 'label',
        'auto-hide-timeout': '60000',
      });
      el.label = 'new label';
      await el.updateComplete;
      const newLabel = page.getByText('new label');
      await expect.element(newLabel).toBeVisible();
    });
  });

  describe('auto-hide timer', () => {
    it('should dispatch snackbar:close after timeout elapses', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '100' });
      el.addEventListener('snackbar:close', closeHandler);
      await wait(200);
      expect(closeHandler).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch snackbar:close before timeout', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '500' });
      el.addEventListener('snackbar:close', closeHandler);
      await wait(100);
      expect(closeHandler).not.toHaveBeenCalled();
    });

    it('should not dispatch action-click on auto-hide', async () => {
      const actionHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '100' });
      el.addEventListener('snackbar:action-click', actionHandler);
      await wait(200);
      expect(actionHandler).not.toHaveBeenCalled();
    });
  });

  describe('pause on hover', () => {
    it('should not auto-hide while hovered', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '200' });
      el.addEventListener('snackbar:close', closeHandler);
      const container = getSnackbarContainer(el)!;
      container.dispatchEvent(new MouseEvent('mouseenter'));
      await wait(400);
      expect(closeHandler).not.toHaveBeenCalled();
    });

    it('should auto-hide after unhover with remaining time', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '400' });
      el.addEventListener('snackbar:close', closeHandler);
      const container = getSnackbarContainer(el)!;

      await wait(100);
      container.dispatchEvent(new MouseEvent('mouseenter'));

      await wait(300);
      container.dispatchEvent(new MouseEvent('mouseleave'));

      await wait(400);
      expect(closeHandler).toHaveBeenCalledTimes(1);
    });

    it('should not pause when closing', async () => {
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const container = getSnackbarContainer(el)!;
      el.open = false;
      await el.updateComplete;
      expect(container.classList.contains('closing')).toBe(true);
      container.dispatchEvent(new MouseEvent('mouseenter'));
      container.dispatchEvent(new MouseEvent('mouseleave'));
      expect(container.classList.contains('closing')).toBe(true);
    });
  });

  describe('exit animation (closing)', () => {
    it('should add "closing" class when open changes to false', async () => {
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const container = getSnackbarContainer(el)!;
      expect(container.classList.contains('closing')).toBe(false);
      el.open = false;
      await el.updateComplete;
      expect(container.classList.contains('closing')).toBe(true);
    });

    it('should set "closing" attribute on host', async () => {
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      el.open = false;
      await el.updateComplete;
      expect(el.hasAttribute('closing')).toBe(true);
    });

    it('should remove closing state on fadeOutLeft animationend', async () => {
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const container = getSnackbarContainer(el)!;
      el.open = false;
      await el.updateComplete;
      container.dispatchEvent(new AnimationEvent('animationend', { animationName: 'fadeOutLeft' }));
      await el.updateComplete;
      expect(el.closing).toBe(false);
      expect(getSnackbarContainer(el)).toBeNull();
    });

    it('should not remove closing state on unrelated animationend', async () => {
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const container = getSnackbarContainer(el)!;
      el.open = false;
      await el.updateComplete;
      container.dispatchEvent(new AnimationEvent('animationend', { animationName: 'fadeInRight' }));
      await el.updateComplete;
      expect(el.closing).toBe(true);
      expect(getSnackbarContainer(el)).not.toBeNull();
    });
  });

  describe('events', () => {
    function clickActionButton(el: DsSnackbar): void {
      const btn = el.shadowRoot!.querySelector('ds-button') as HTMLElement;
      btn.click();
    }

    it('should dispatch snackbar:action-click on button click', async () => {
      const actionHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      el.addEventListener('snackbar:action-click', actionHandler);
      clickActionButton(el);
      expect(actionHandler).toHaveBeenCalledTimes(1);
    });

    it('should dispatch snackbar:close on button click', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      el.addEventListener('snackbar:close', closeHandler);
      clickActionButton(el);
      expect(closeHandler).toHaveBeenCalledTimes(1);
    });

    it('should dispatch snackbar:close with bubbles and composed', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      el.addEventListener('snackbar:close', closeHandler);
      clickActionButton(el);
      expect(closeHandler).toHaveBeenCalledWith(
        expect.objectContaining({ bubbles: true, composed: true }),
      );
    });

    it('should dispatch snackbar:action-click with bubbles and composed', async () => {
      const actionHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      el.addEventListener('snackbar:action-click', actionHandler);
      clickActionButton(el);
      expect(actionHandler).toHaveBeenCalledWith(
        expect.objectContaining({ bubbles: true, composed: true }),
      );
    });
  });

  describe('accessibility', () => {
    it('should have role="status" on the container', async () => {
      await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const status = page.getByRole('status');
      await expect.element(status).toBeVisible();
    });

    it('should have aria-live="polite" on the container', async () => {
      await createDsSnackbar({ open: '', 'auto-hide-timeout': '60000' });
      const container = getSnackbarContainer()!;
      expect(container.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('disconnection', () => {
    it('should clear pending timeout on remove', async () => {
      const closeHandler = vi.fn();
      const el = await createDsSnackbar({ open: '', 'auto-hide-timeout': '100' });
      el.addEventListener('snackbar:close', closeHandler);
      el.remove();
      await wait(250);
      expect(closeHandler).not.toHaveBeenCalled();
    });
  });
});
