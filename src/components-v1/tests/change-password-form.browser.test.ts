/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../change-password-form';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { delayedSoapApiForBrowser } from '../../../tests-setup/browser/server';
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

    await expect.element(page.getByText("Passwords don't match")).toBeVisible();
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
});
