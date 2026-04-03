/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../credentials-form';

import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { CredentialsForm } from '../credentials-form';

let element: CredentialsForm;

async function createCredentialsForm(
  attrs: {
    authError?: string;
    loading?: boolean;
    disableInputs?: boolean;
    destinationUrl?: string;
    authMethods?: Array<string>;
  } = {},
): Promise<CredentialsForm> {
  await createBrowserAPIInterceptor('get', '/public/blank.html', () => HttpResponse.json({}));

  element = document.createElement('credentials-form');
  if (attrs.authError !== undefined) element.setAttribute('auth-error', attrs.authError);
  if (attrs.loading) element.setAttribute('loading', '');
  if (attrs.disableInputs) element.setAttribute('disable-inputs', '');
  if (attrs.destinationUrl !== undefined) {
    element.setAttribute('destination-url', attrs.destinationUrl);
  }
  if (attrs.authMethods !== undefined) {
    element.authMethods = attrs.authMethods;
  }
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
  vi.restoreAllMocks();
});

describe('CredentialsForm', () => {
  it('should submit user credentials on form submit', async () => {
    const submitHandler = vi.fn();
    const el = await createCredentialsForm({ authError: 'some error' });
    el.addEventListener('credentials-submit', submitHandler);
    await el.updateComplete;

    await userEvent.fill(page.getByRole('textbox', { name: 'Username' }), 'testuser');
    await userEvent.keyboard('{Tab}');
    await userEvent.fill(page.getByRole('textbox', { name: 'Password' }), 'testpassword');
    await userEvent.keyboard('{Tab}');

    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect.element(loginButton).toBeEnabled();
    await userEvent.click(loginButton);

    expect(submitHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { username: 'testuser', password: 'testpassword' },
      }),
    );
  });

  it('should display SAML login button when SAML auth method is available', async () => {
    await createCredentialsForm({
      authMethods: ['saml'],
      destinationUrl: 'https://example.com',
    });

    const samlButton = page.getByRole('button', { name: 'Login SAML' });
    await expect.element(samlButton).toBeVisible();
    await expect.element(samlButton).toBeEnabled();
  });

  it('should not display SAML login button when SAML auth method is not available', async () => {
    await createCredentialsForm({
      authMethods: [],
      destinationUrl: 'https://example.com',
    });

    await expect
      .element(page.getByRole('button', { name: 'Login SAML' }))
      .not.toBeInTheDocument();
  });

  it('should prevent default form submission', async () => {
    const el = await createCredentialsForm();

    const form = el.shadowRoot!.querySelector('form')!;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

    form.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should submit credentials when pressing Enter in the password field', async () => {
    const submitHandler = vi.fn();
    const el = await createCredentialsForm();
    el.addEventListener('credentials-submit', submitHandler);
    await el.updateComplete;

    await userEvent.fill(page.getByRole('textbox', { name: 'Username' }), 'enteruser');
    await userEvent.keyboard('{Tab}');
    await userEvent.fill(page.getByRole('textbox', { name: 'Password' }), 'enterpassword');
    await userEvent.keyboard('{Enter}');

    expect(submitHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ username: 'enteruser', password: 'enterpassword' }),
      }),
    );
  });
});
