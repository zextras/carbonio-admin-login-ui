/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../app';
import '../ui-components';

import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import {
  advancedSupportedApiForBrowser,
  createBrowserAPIInterceptor,
} from '../../tests-setup/browser/server';
import type { AppRoot } from '../app';

async function createAppRoot(): Promise<AppRoot> {
  const el = document.createElement('app-root');
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function waitForShadowElement(
  root: ShadowRoot | null | undefined,
  selector: string,
  timeout = 5000,
): Promise<Element | null> {
  const el = root?.querySelector(selector) ?? null;
  if (el) return Promise.resolve(el);
  if (!root) return Promise.resolve(null);

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const found = root.querySelector(selector);
      if (found) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(found);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(root.querySelector(selector) ?? null);
    }, timeout);

    observer.observe(root, { childList: true, subtree: true });
  });
}

describe('App', () => {
  afterEach(() => {
    document.querySelectorAll('app-root').forEach((el) => el.remove());
  });

  it('should display error if api returns error', async () => {
    await advancedSupportedApiForBrowser.withError();

    await createAppRoot();

    const errorMessage = page.getByText(/but there was an error trying to load this page/);
    await expect.element(errorMessage).toBeVisible();
  });

  it('should display loading view initially', async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();

    await createAppRoot();
    const pageLogo = page.getByRole('img', { name: 'load-error' });
    await expect.element(pageLogo).toBeVisible();
  });

  it('should display login-advanced when advanced is supported', async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    const el = await createAppRoot();

    const loginAdvanced = await waitForShadowElement(el.shadowRoot, 'login-advanced');
    expect(loginAdvanced).toBeTruthy();
  });

  it('should display error when advanced supported but version check fails', async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    await createBrowserAPIInterceptor('get', '/zx/login/supported', () => HttpResponse.error());

    await createAppRoot();

    const errorText = page.getByText(/but there was an error trying to load this page/);
    await expect.element(errorText).toBeVisible();
  });

  it('should display login-ce when advanced is not supported', async () => {
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();

    const el = await createAppRoot();

    const loginCe = await waitForShadowElement(el.shadowRoot, 'login-ce');
    expect(loginCe).toBeTruthy();
  });
});
