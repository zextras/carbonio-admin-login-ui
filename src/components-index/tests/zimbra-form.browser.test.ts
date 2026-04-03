/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../zimbra-form';

import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { ZimbraForm } from '../zimbra-form';

const AUTH_REQUEST_URL = '/service/admin/soap/AuthRequest';

let element: ZimbraForm;

async function createZimbraForm(destinationUrl = '/admin'): Promise<ZimbraForm> {
  element = document.createElement('zimbra-form') as ZimbraForm;
  element.setAttribute('destination-url', destinationUrl);
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

function submitCredentials(
  el: ZimbraForm,
  username = 'admin@test.com',
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

afterEach(() => {
  element?.remove();
  vi.restoreAllMocks();
});

describe('ZimbraForm', () => {
  it('should render the username and password fields on initial render', async () => {
    await createZimbraForm();

    await expect.element(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect.element(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  it('should redirect to /carbonioAdmin on successful login', async () => {
    const navigatedUrls: Array<string> = [];
    const navigation = globalThis.navigation as EventTarget;
    const handleNavigate = (event: Event): void => {
      event.preventDefault();
      navigatedUrls.push(
        (event as unknown as { destination: { url: string } }).destination.url,
      );
    };
    navigation.addEventListener('navigate', handleNavigate);

    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json({ Body: { AuthResponse: {} } }, { status: 200 }),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect
      .poll(() => navigatedUrls.some((url) => url.includes('/carbonioAdmin')))
      .toBe(true);

    navigation.removeEventListener('navigate', handleNavigate);
  });

  it('should show credentials error on 401 response', async () => {
    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json({}, { status: 401 }),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect
      .element(page.getByText('Credentials are not valid, please check data and try again'))
      .toBeVisible();
  });

  it('should show credentials error on 500 response', async () => {
    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json({}, { status: 500 }),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect
      .element(page.getByText('Credentials are not valid, please check data and try again'))
      .toBeVisible();
  });

  it('should show auth policy error on 403 response', async () => {
    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json({}, { status: 403 }),
    );

    const el = await createZimbraForm();
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
    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json({}, { status: 502 }),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect
      .element(page.getByText('Error 502: Service Unreachable - Retry later.'))
      .toBeVisible();
  });

  it('should show change-password-form when SOAP Fault has CHANGE_PASSWORD code', async () => {
    const navigation = globalThis.navigation as EventTarget;
    const handleNavigate = (event: Event): void => {
      event.preventDefault();
    };
    navigation.addEventListener('navigate', handleNavigate);

    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: { Error: { Code: 'account.CHANGE_PASSWORD' } },
              Reason: { Text: 'Change password required' },
            },
          },
        },
        { status: 200 },
      ),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect.element(page.getByText('Create a new password')).toBeVisible();

    navigation.removeEventListener('navigate', handleNavigate);
  });

  it('should show fault reason text for non-CHANGE_PASSWORD SOAP Fault', async () => {
    await createBrowserAPIInterceptor('post', AUTH_REQUEST_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: { Error: { Code: 'some.other.error' } },
              Reason: { Text: 'Custom SOAP fault message' },
            },
          },
        },
        { status: 200 },
      ),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect.element(page.getByText('Custom SOAP fault message')).toBeVisible();
  });

  it('should show credentials error when fetch throws authentication failed error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('authentication failed: bad credentials')),
    );

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect
      .element(page.getByText('Credentials are not valid, please check data and try again'))
      .toBeVisible();
  });

  it('should show error message when fetch throws a generic error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network connection lost')));

    const el = await createZimbraForm();
    submitCredentials(el);

    await expect.element(page.getByText('Network connection lost')).toBeVisible();
  });
});
