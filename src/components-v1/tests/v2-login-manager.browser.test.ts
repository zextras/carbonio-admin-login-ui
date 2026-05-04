/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../v2-login-manager';

import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { V2LoginManager } from '../v2-login-manager';

const LOGIN_URL = '/zx/auth/v2/admin/login';
const OTP_URL = '/zx/auth/v2/admin/otp/validate';

const DEFAULT_USERNAME = 'admin@test.com';
const DESTINATION_URL = 'https://example.com/admin';

const loginSuccessResponseWith2FA = {
  '2FA': true,
  otp: [
    { id: 'otp-id-1', label: 'OTP Method 1', enabled: true },
    { id: 'otp-id-2', label: 'OTP Method 2', enabled: true },
  ],
  user: { displayName: DEFAULT_USERNAME },
};

const loginSuccessResponseWith2FADisabledFirstOtp = {
  '2FA': true,
  otp: [
    { id: 'otp-id-1', label: 'OTP Method 1', enabled: false },
    { id: 'otp-id-2', label: 'OTP Method 2', enabled: true },
  ],
  user: { displayName: DEFAULT_USERNAME },
};

const loginSuccessResponseWithout2FA = {
  '2FA': false,
  user: { displayName: DEFAULT_USERNAME },
};

const loginSuccessResponseWithOtpWizardAndNoOtp = {
  '2FA': true,
  'otp-wizard': true,
  otp: [],
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

    await expect.element(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  });

  it('should show 2FA form on successful login with 2FA enabled', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect
      .element(page.getByRole('heading', { name: 'Two-Step-Authentication' }))
      .toBeVisible();
  });

  it('should show disabled OTP warning when the selected OTP method is disabled', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FADisabledFirstOtp, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect
      .element(
        page.getByText(
          'This OTP method is disabled. To restore it, please contact your system administrator.',
        ),
      )
      .toBeVisible();

    await expect
      .element(page.getByRole('textbox', { name: 'Type here One-Time-Password' }))
      .toBeDisabled();

    await expect.element(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('should not show disabled OTP warning when the selected OTP method is enabled', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect.element(page.getByRole('heading', { name: 'Two-Step-Authentication' })).toBeVisible();
    await expect
      .element(
        page.getByText(
          'This OTP method is disabled. To restore it, please contact your system administrator.',
        ),
      )
      .not.toBeInTheDocument();
  });

  it('should show 2FA not configured message when otp-wizard is true and otp list is empty', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWithOtpWizardAndNoOtp, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect
      .element(page.getByRole('heading', { name: 'You have no longer the 2FA configured' }))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          'There is no active OTP token configured in your account. In order to login from your account you have to connect from a trusted network.',
        ),
      )
      .toBeVisible();

    const backToLoginButton = page.getByRole('button', { name: /Back to login/i });
    await expect.element(backToLoginButton).toBeVisible();
    await backToLoginButton.click();

    await expect.element(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
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

    await expect.poll(() => navigatedUrls).toContain(DESTINATION_URL);

    navigation.removeEventListener('navigate', handleNavigate);
  });

  it('should show auth error on 401 response', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json({}, { status: 401 }),
    );

    const el = createV2LoginManager();
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

    const el = createV2LoginManager();
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

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect
      .element(page.getByText('Error 502: Service Unreachable - Retry later.'))
      .toBeVisible();
  });

  it('should show snackbar network error on unexpected status', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json({}, { status: 500 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect.element(page.getByText('Can not do the login now')).toBeVisible();
  });

  it('should render OTP select and input in 2FA form', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect.element(page.getByRole('combobox')).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Type here One-Time-Password' }))
      .toBeVisible();
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

    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect.element(loginButton).toBeVisible();
    await loginButton.click();

    await expect.poll(() => navigatedUrls).toContain(DESTINATION_URL);

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

    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect.element(loginButton).toBeVisible();
    await loginButton.click();

    await expect
      .element(page.getByText('Wrong password, please check data and try again'))
      .toBeVisible();
  });

  it('should show max attempts error on 403 OTP validation response', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );
    await createBrowserAPIInterceptor('post', OTP_URL, () =>
      HttpResponse.json({}, { status: 403 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect.element(loginButton).toBeVisible();
    await loginButton.click();

    await expect
      .element(
        page.getByText('Invalid OTP. You have reached the maximum number of attempts.'),
      )
      .toBeVisible();

    await expect.element(loginButton).toBeDisabled();

    const combobox = page.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.click(page.getByText('OTP Method 2'));

    await expect.element(loginButton).toBeDisabled();
  });

  it('should show trust device checkbox in 2FA form', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () =>
      HttpResponse.json(loginSuccessResponseWith2FA, { status: 200 }),
    );

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);

    await expect
      .element(page.getByRole('checkbox', { name: 'Trust this device and IP address' }))
      .toBeVisible();
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

    await expect
      .element(page.getByRole('heading', { name: 'Create a new password' }))
      .toBeVisible();

    globalThis.fetch = originalFetch;
  });

  it('should not crash when login fetch rejects', async () => {
    await createBrowserAPIInterceptor('post', LOGIN_URL, () => HttpResponse.error());

    const el = createV2LoginManager();
    await el.updateComplete;

    submitCredentials(el);
    await el.updateComplete;

    await expect.element(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  });
});
