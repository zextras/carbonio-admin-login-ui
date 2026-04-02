/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../v1-login-manager';

import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { V1LoginManager } from '../v1-login-manager';

const LOGIN_URL = '/zx/auth/v1/login';
const DESTINATION_URL = 'https://example.com/admin';
const DEFAULT_USERNAME = 'admin@test.com';

let element: V1LoginManager;

function createV1LoginManager(): V1LoginManager {
  element = document.createElement('v1-login-manager') as V1LoginManager;
  element.setAttribute('destination-url', DESTINATION_URL);
  element.authMethods = ['password'];
  document.body.appendChild(element);
  return element;
}

function submitCredentials(
  el: V1LoginManager,
  username = DEFAULT_USERNAME,
  password = 'secret',
): void {
  el.dispatchEvent(
    new CustomEvent('credentials-submit', {
      detail: { username, password },
      bubbles: true,
      composed: true,
    }),
  );
}

function interceptNavigation(): {
  navigatedUrls: Array<string>;
  cleanup: () => void;
} {
  const navigatedUrls: Array<string> = [];
  const navigation = globalThis.navigation as EventTarget;
  const handleNavigate = (event: Event): void => {
    event.preventDefault();
    navigatedUrls.push(
      (event as unknown as { destination: { url: string } }).destination.url,
    );
  };
  navigation.addEventListener('navigate', handleNavigate);
  return {
    navigatedUrls,
    cleanup: () => navigation.removeEventListener('navigate', handleNavigate),
  };
}

describe('V1LoginManager', () => {
  beforeEach(() => {
    vi.spyOn(navigator.credentials, 'store').mockResolvedValue(undefined);
  });

  afterEach(() => {
    element?.remove();
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render the credentials form on initial render', async () => {
      const el = createV1LoginManager();
      await el.updateComplete;

      await expect.element(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
      await expect.element(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });

  describe('successful login', () => {
    it('should redirect to destinationUrl on 200 response', async () => {
      const { navigatedUrls, cleanup } = interceptNavigation();

      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 200 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect.poll(() => navigatedUrls).toContain(DESTINATION_URL);

      cleanup();
    });

    it('should save credentials on 200 response', async () => {
      interceptNavigation();

      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 200 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect.poll(() => navigator.credentials.store).toHaveBeenCalled();
    });
  });

  describe('error responses', () => {
    it('should show credentials error on 401 response', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 401 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect
        .element(page.getByText('Credentials are not valid, please check data and try again'))
        .toBeVisible();
    });

    it('should show auth policy error on 403 response', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 403 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect
        .element(
          page.getByText(
            'The authentication policy needs more steps: please contact your administrator',
          ),
        )
        .toBeVisible();
    });

    it('should show server unreachable error on 502 response', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 502 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect
        .element(page.getByText('Error 502: Service Unreachable - Retry later.'))
        .toBeVisible();
    });

    it('should show snackbar network error on 500 response', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 500 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect.element(page.getByText('Can not do the login now')).toBeVisible();
    });

    it('should show snackbar network error on unexpected status', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 418 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);

      await expect.element(page.getByText('Can not do the login now')).toBeVisible();
    });
  });

  describe('snackbar and offline modal', () => {
    it('should open offline modal when snackbar action-click event fires', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 500 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);
      await el.updateComplete;

      const snackbar = el.shadowRoot!.querySelector('ds-snackbar')!;
      snackbar.dispatchEvent(
        new CustomEvent('snackbar:action-click', { bubbles: true, composed: true }),
      );
      await el.updateComplete;

      await expect.element(page.getByRole('heading', { name: 'Offline' })).toBeVisible();
    });

    it('should close offline modal when offline-modal:close event fires', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 500 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);
      await el.updateComplete;

      const snackbar = el.shadowRoot!.querySelector('ds-snackbar')!;
      snackbar.dispatchEvent(
        new CustomEvent('snackbar:action-click', { bubbles: true, composed: true }),
      );
      await el.updateComplete;

      await expect.element(page.getByRole('heading', { name: 'Offline' })).toBeVisible();

      const modal = el.shadowRoot!.querySelector('offline-modal')!;
      modal.dispatchEvent(
        new CustomEvent('offline-modal:close', { bubbles: true, composed: true }),
      );
      await el.updateComplete;

      expect((modal as HTMLElement & { open: boolean }).open).toBe(false);
    });

    it('should close snackbar when snackbar:close event fires', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
        HttpResponse.json({}, { status: 500 }),
      );

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);
      await el.updateComplete;

      await expect.element(page.getByText('Can not do the login now')).toBeVisible();

      const snackbar = el.shadowRoot!.querySelector('ds-snackbar')!;
      snackbar.dispatchEvent(
        new CustomEvent('snackbar:close', { bubbles: true, composed: true }),
      );
      await el.updateComplete;

      expect((snackbar as HTMLElement & { open: boolean }).open).toBe(false);
    });
  });

  describe('network failure', () => {
    it('should not crash when login fetch rejects', async () => {
      await createBrowserAPIInterceptor('post', LOGIN_URL, () => HttpResponse.error());

      const el = createV1LoginManager();
      await el.updateComplete;

      submitCredentials(el);
      await el.updateComplete;

      await expect.element(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    });
  });
});
