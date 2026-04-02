/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../v2-login-manager';

import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { V2LoginManager } from '../v2-login-manager';

const LOGIN_URL = '/zx/auth/v2/admin/login';
const OTP_URL = '/zx/auth/v2/admin/otp/validate';

const DEFAULT_USERNAME = 'admin@test.com';
const DESTINATION_URL = 'https://example.com/admin';

const loginSuccessResponseWith2FA = {
  '2FA': true,
  otp: [
    { id: 'otp-id-1', label: 'OTP Method 1' },
    { id: 'otp-id-2', label: 'OTP Method 2' },
  ],
  user: { displayName: DEFAULT_USERNAME },
};

const loginSuccessResponseWithout2FA = {
  '2FA': false,
  user: { displayName: DEFAULT_USERNAME },
};

function createV2LoginManager(): V2LoginManager {
  const el = document.createElement('v2-login-manager') as V2LoginManager;
  el.setAttribute('destination-url', DESTINATION_URL);
  el.authMethods = ['password'];
  document.body.appendChild(el);
  return el;
}

function submitCredentials(el: V2LoginManager, username = DEFAULT_USERNAME, password = 'secret') {
  el.dispatchEvent(
    new CustomEvent('credentials-submit', {
      detail: { username, password },
      bubbles: true,
      composed: true,
    }),
  );
}

async function waitForShadowSelector(
  root: ShadowRoot | null | undefined,
  selector: string,
  timeout = 5000,
): Promise<Element | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = root?.querySelector(selector) ?? null;
    if (el) return el;
    await new Promise((r) => setTimeout(r, 50));
  }
  return root?.querySelector(selector) ?? null;
}

async function waitForShadowText(
  root: ShadowRoot | null | undefined,
  text: string,
  timeout = 5000,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const content = root?.innerHTML ?? '';
    if (content.includes(text)) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

describe('V2LoginManager', () => {
  beforeEach(() => {
    vi.spyOn(navigator.credentials, 'store').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('v2-login-manager').forEach((el) => el.remove());
  });

  it('should render CredentialsForm on initial render', async () => {
    const el = createV2LoginManager();
    await el.updateComplete;

    const credentialsForm = el.shadowRoot?.querySelector('credentials-form');
    expect(credentialsForm).toBeTruthy();
  });

  it('should show 2FA form on successful login with 2FA enabled', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const found = await waitForShadowText(el.shadowRoot, 'Two-Step-Authentication');
    expect(found).toBe(true);
  });

  it('should redirect to destinationUrl on successful login without 2FA', async () => {
    const navigatedUrls: Array<string> = [];
    const navigation = globalThis.navigation as EventTarget;
    const handleNavigate = (event: Event): void => {
      event.preventDefault();
      navigatedUrls.push((event as unknown as { destination: { url: string } }).destination.url);
    };
    navigation.addEventListener('navigate', handleNavigate);

    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWithout2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    await new Promise((r) => setTimeout(r, 500));
    expect(navigatedUrls).toContain(DESTINATION_URL);

    navigation.removeEventListener('navigate', handleNavigate);
  });

  it('should show auth error on 401 response', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json({}, { status: 401 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const found = await waitForShadowText(
      el.shadowRoot,
      'Credentials are not valid, please check data and try again',
    );
    expect(found).toBe(true);
  });

  it('should show auth policy error on 403 response', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json({}, { status: 403 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const found = await waitForShadowText(
      el.shadowRoot,
      'The authentication policy needs more steps: please contact your administrator',
    );
    expect(found).toBe(true);
  });

  it('should show server unreachable error on 502 response', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json({}, { status: 502 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const found = await waitForShadowText(
      el.shadowRoot,
      'Error 502: Service Unreachable - Retry later.',
    );
    expect(found).toBe(true);
  });

  it('should show snackbar network error on unexpected status', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json({}, { status: 500 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const found = await waitForShadowText(el.shadowRoot, 'Can not do the login now');
    expect(found).toBe(true);
  });

  it('should render OTP select and input in 2FA form', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const hasOtpSelect = await waitForShadowText(el.shadowRoot, 'Choose the OTP Method');
    expect(hasOtpSelect).toBe(true);

    const hasOtpInput = await waitForShadowText(el.shadowRoot, 'Type here One-Time-Password');
    expect(hasOtpInput).toBe(true);
  });

  it('should redirect to destinationUrl on successful OTP validation', async () => {
    const navigatedUrls: Array<string> = [];
    const navigation = globalThis.navigation as EventTarget;
    const handleNavigate = (event: Event): void => {
      event.preventDefault();
      navigatedUrls.push((event as unknown as { destination: { url: string } }).destination.url);
    };
    navigation.addEventListener('navigate', handleNavigate);

    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );
    await createBrowserAPIInterceptor('post', OTP_URL, () =>
      HttpResponse.json({}, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const twoFactorForm = await waitForShadowSelector(el.shadowRoot, 'form');
    expect(twoFactorForm).toBeTruthy();

    (twoFactorForm as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await el.updateComplete;

    await new Promise((r) => setTimeout(r, 500));
    expect(navigatedUrls).toContain(DESTINATION_URL);

    navigation.removeEventListener('navigate', handleNavigate);
  });

  it('should show OTP error on failed OTP validation', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );
    await createBrowserAPIInterceptor('post', OTP_URL, () =>
      HttpResponse.json({}, { status: 401 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const twoFactorForm = await waitForShadowSelector(el.shadowRoot, 'form');
    expect(twoFactorForm).toBeTruthy();

    (twoFactorForm as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await el.updateComplete;

    const found = await waitForShadowText(
      el.shadowRoot,
      'Wrong password, please check data and try again',
    );
    expect(found).toBe(true);
  });

  it('should show trust device checkbox in 2FA form', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const found = await waitForShadowText(el.shadowRoot, 'Trust this device and IP address');
    expect(found).toBe(true);
  });

  it('should show change password form when login response is redirected', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      const response = new Response(null, { status: 200 });
      Object.defineProperty(response, 'redirected', { value: true });
      return Promise.resolve(response);
    });

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const changePasswordForm = await waitForShadowSelector(el.shadowRoot, 'change-password-form');
    expect(changePasswordForm).toBeTruthy();

    globalThis.fetch = originalFetch;
  });

  it('should not crash when login fetch rejects', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () => HttpResponse.error());

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    const credentialsForm = el.shadowRoot?.querySelector('credentials-form');
    expect(credentialsForm).toBeTruthy();
  });
});
