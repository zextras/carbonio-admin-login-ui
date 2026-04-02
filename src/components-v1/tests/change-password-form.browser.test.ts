/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../change-password-form';

import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  createBrowserAPIInterceptor,
  delayedSoapApiForBrowser,
} from '../../../tests-setup/browser/server';
import type { ChangePasswordForm } from '../change-password-form';

let element: ChangePasswordForm;

async function createChangePasswordForm(
  username = 'testuser',
  destinationUrl = '/home',
): Promise<ChangePasswordForm> {
  element = document.createElement('change-password-form');
  element.username = username;
  element.setAttribute('destination-url', destinationUrl);
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

async function fillPasswordInput(label: string, value: string): Promise<void> {
  await userEvent.fill(page.getByRole('textbox', { name: label, exact: true }), value);
  await userEvent.keyboard('{Tab}');
}

const CHANGE_PASSWORD_URL = '/service/admin/soap/ChangePasswordRequest';

async function fillAndSubmitForm(): Promise<void> {
  await fillPasswordInput('Old password', 'oldpassword');
  await fillPasswordInput('New password', 'Newpassword1!');
  await fillPasswordInput('Confirm new password', 'Newpassword1!');
  await userEvent.click(page.getByRole('button', { name: 'Change password and login' }));
}

afterEach(() => {
  element?.remove();
  vi.restoreAllMocks();
});

describe('ChangePasswordForm', () => {
  it('should render form and input fields', async () => {
    await createChangePasswordForm();

    await expect.element(page.getByText('Create a new password')).toBeVisible();
    await expect.element(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Old password', exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'New password', exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByRole('textbox', { name: 'Confirm new password', exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Change password and login' }))
      .toBeVisible();
  });

  it('should enable submit button when passwords match', async () => {
    await createChangePasswordForm();

    const submitButton = page.getByRole('button', { name: 'Change password and login' });
    await expect.element(submitButton).toBeDisabled();

    await fillPasswordInput('Old password', 'oldpassword');
    await fillPasswordInput('New password', 'newpassword');
    await fillPasswordInput('Confirm new password', 'newpassword');

    await expect.element(submitButton).toBeEnabled();
  });

  it('should display error when confirm password does not match new password', async () => {
    await createChangePasswordForm();

    await fillPasswordInput('New password', 'newpassword');
    await fillPasswordInput('Confirm new password', 'differentpassword');

    await expect.element(page.getByText('Confirm password not valid')).toBeVisible();
  });

  it('should submit form and handle API response', async () => {
    const interceptor = delayedSoapApiForBrowser<null, { authToken: Array<{ _content: string }> }>(
      'ChangePassword',
      { authToken: [{ _content: 'mockAuthToken' }] },
      5000,
    );

    await createChangePasswordForm('testuser', '/home');

    await fillPasswordInput('Old password', 'oldpassword');
    await fillPasswordInput('New password', 'newpassword');
    await fillPasswordInput('Confirm new password', 'newpassword');

    await userEvent.click(page.getByRole('button', { name: 'Change password and login' }));

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);

    const lastRequest = interceptor.getLastRequest();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await lastRequest.json()) as any;

    expect(body.Body.ChangePasswordRequest).toEqual({
      _jsns: 'urn:zimbraAccount',
      csrfTokenSecured: '0',
      persistAuthTokenCookie: '1',
      account: { by: 'name', _content: 'testuser' },
      oldPassword: { _content: 'oldpassword' },
      password: { _content: 'newpassword' },
      prefs: [{ pref: { name: 'zimbraPrefMailPollingInterval' } }],
    });
  });

  it('should display PASSWORD_LOCKED error on 500 response', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.PASSWORD_LOCKED',
                },
              },
            },
          },
        },
        { status: 500 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText("Password is locked and can't be changed"))
      .toBeVisible();
  });

  it('should display PASSWORD_RECENTLY_USED error on 500 response', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.PASSWORD_RECENTLY_USED',
                },
              },
            },
          },
        },
        { status: 500 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect.element(page.getByText('Password recently used')).toBeVisible();
  });

  it('should display INVALID_PASSWORD error with min length attribute', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.INVALID_PASSWORD',
                  a: [{ n: 'zimbraPasswordMinLength', _content: '8' }],
                },
              },
            },
          },
        },
        { status: 500 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect.element(page.getByText('Minimum length is 8 characters')).toBeVisible();
  });

  it('should display wrong password error for INVALID_PASSWORD without matching attributes', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.INVALID_PASSWORD',
                },
              },
            },
          },
        },
        { status: 500 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText('Wrong password, please check data and try again'))
      .toBeVisible();
  });

  it('should display wrong password error for unknown error code on 401', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.SOME_UNKNOWN_ERROR',
                },
              },
            },
          },
        },
        { status: 401 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText('Wrong password, please check data and try again'))
      .toBeVisible();
  });

  it('should display service unreachable error on 502 response', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json({}, { status: 502 }),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText('Error 502: Service Unreachable - Retry later.'))
      .toBeVisible();
  });

  it('should display default error on unexpected status code', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json({}, { status: 403 }),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText('Expecting at least 6 lowercase characters'))
      .toBeVisible();
  });

  it('should display wrong password error on network failure', async () => {
    const interceptor = await createBrowserAPIInterceptor(
      'post',
      CHANGE_PASSWORD_URL,
      HttpResponse.error,
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText('Wrong password, please check data and try again'))
      .toBeVisible();
  });

  it('should clear new password error when typing in new password field', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.PASSWORD_LOCKED',
                },
              },
            },
          },
        },
        { status: 500 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText("Password is locked and can't be changed"))
      .toBeVisible();

    await fillPasswordInput('New password', 'AnotherPassword1!');

    await expect
      .element(page.getByText("Password is locked and can't be changed"))
      .not.toBeInTheDocument();
  });

  it('should display INVALID_PASSWORD error with max length attribute', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Detail: {
                Error: {
                  Code: 'account.INVALID_PASSWORD',
                  a: [{ n: 'zimbraPasswordMaxLength', _content: '64' }],
                },
              },
            },
          },
        },
        { status: 500 },
      ),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect.element(page.getByText('Maximum length is 64 characters')).toBeVisible();
  });

  it('should keep submit button disabled when new password has an error', async () => {
    const interceptor = await createBrowserAPIInterceptor('post', CHANGE_PASSWORD_URL, () =>
      HttpResponse.json({}, { status: 502 }),
    );

    await createChangePasswordForm();
    await fillAndSubmitForm();

    await expect.poll(() => interceptor.getCalledTimes()).toBe(1);
    await expect
      .element(page.getByText('Error 502: Service Unreachable - Retry later.'))
      .toBeVisible();

    const submitButton = page.getByRole('button', { name: 'Change password and login' });
    await expect.element(submitButton).toBeDisabled();
  });
});
