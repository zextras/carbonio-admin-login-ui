/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../form-selector';

import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { FormSelector } from '../form-selector';

let element: FormSelector;

async function createFormSelector(
  destinationUrl = '/home',
  domain = 'example.com',
): Promise<FormSelector> {
  element = document.createElement('form-selector');
  element.setAttribute('destination-url', destinationUrl);
  if (domain) element.domain = domain;
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
});

describe('FormSelector', () => {
  it('should render server-not-responding component on error', async () => {
    await createBrowserAPIInterceptor('get', '/zx/auth/supported', () =>
      HttpResponse.json({}, { status: 500 }),
    );

    await createFormSelector();

    await expect
      .element(
        page.getByText(
          'The server is not responding. Please contact your server administator',
        ),
      )
      .toBeVisible();
  });

  it('should render not-supported-version component when configuration is available but API version is not supported', async () => {
    await createBrowserAPIInterceptor('get', '/zx/auth/supported', () =>
      HttpResponse.json({ minApiVersion: 3, maxApiVersion: 4 }),
    );

    await createFormSelector();

    await expect
      .element(
        page.getByText(
          'The server sent a not valid response. Please contact your server administrator',
        ),
      )
      .toBeVisible();
  });
});
