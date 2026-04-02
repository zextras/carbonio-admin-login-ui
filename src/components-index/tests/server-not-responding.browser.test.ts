/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../server-not-responding';
import '../../ui-components';

import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { ServerNotResponding } from '../server-not-responding';

async function createServerNotResponding(): Promise<ServerNotResponding> {
  const el = document.createElement('server-not-responding') as ServerNotResponding;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getInnerSnackbar(el: ServerNotResponding) {
  return el.shadowRoot!.querySelector('ds-snackbar');
}

describe('server-not-responding', () => {
  let el: ServerNotResponding;

  afterEach(() => {
    el?.remove();
  });

  describe('rendering', () => {
    it('should render ds-snackbar content when open is true (default)', async () => {
      el = await createServerNotResponding();
      const snackbar = page.getByText(
        /The server is not responding\. Please contact your server administrator/,
      );
      await expect.element(snackbar).toBeVisible();
    });

    it('should set severity to "error" on the inner ds-snackbar', async () => {
      el = await createServerNotResponding();
      const snackbar = getInnerSnackbar(el);
      expect(snackbar!.severity).toBe('error');
    });

    it('should set auto-hide-timeout to 10000 on the inner ds-snackbar', async () => {
      el = await createServerNotResponding();
      const snackbar = getInnerSnackbar(el);
      expect(snackbar!.autoHideTimeout).toBe(10000);
    });
  });

  describe('properties', () => {
    it('should default open to true', async () => {
      el = await createServerNotResponding();
      expect(el.open).toBe(true);
    });

    it('should reflect the open attribute on the host element', async () => {
      el = await createServerNotResponding();
      expect(el.hasAttribute('open')).toBe(true);
    });

    it('should hide snackbar content when open is set to false externally', async () => {
      el = await createServerNotResponding();
      el.open = false;
      await el.updateComplete;
      const snackbar = getInnerSnackbar(el);
      expect(snackbar!.open).toBe(false);
    });

    it('should re-show snackbar content when open is set back to true', async () => {
      el = await createServerNotResponding();
      el.open = false;
      await el.updateComplete;
      el.open = true;
      await el.updateComplete;
      const snackbar = getInnerSnackbar(el);
      expect(snackbar!.open).toBe(true);
    });
  });

  describe('close behavior', () => {
    it('should set open to false when ds-snackbar dispatches snackbar:close event', async () => {
      el = await createServerNotResponding();
      expect(el.open).toBe(true);
      const snackbar = getInnerSnackbar(el)!;
      snackbar.dispatchEvent(new CustomEvent('snackbar:close', { bubbles: true, composed: true }));
      expect(el.open).toBe(false);
    });
  });
});
