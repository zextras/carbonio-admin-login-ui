/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './error-page';
import './ui-components';

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { ErrorPage } from './error-page';

async function createErrorPage(): Promise<ErrorPage> {
  const el = document.createElement('error-page') as ErrorPage;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('error-page', () => {
  describe('rendering', () => {
    it('should render the error image with alt text', async () => {
      const el = await createErrorPage();
      await expect.element(page.getByRole('img', { name: 'load-error' })).toBeVisible();
      el.remove();
    });

    it('should render the main heading with default text', async () => {
      const el = await createErrorPage();
      await expect.element(page.getByText('Something went wrong')).toBeVisible();
      el.remove();
    });

    it('should render the error description', async () => {
      const el = await createErrorPage();
      await expect
        .element(page.getByText(/but there was an error trying to load this page/))
        .toBeVisible();
      el.remove();
    });

    it('should render the contact support paragraph', async () => {
      const el = await createErrorPage();
      await expect
        .element(page.getByText(/Contact support or try refreshing the page/))
        .toBeVisible();
      el.remove();
    });

    it('should render the refresh button with default label', async () => {
      const el = await createErrorPage();
      await expect.element(page.getByRole('button', { name: 'REFRESH' })).toBeVisible();
      el.remove();
    });
  });
});
