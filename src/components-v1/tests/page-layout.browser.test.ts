/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../page-layout';

import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { createBrowserAPIInterceptor } from '../../../tests-setup/browser/server';
import type { GetLoginConfigResponse } from '../../services/login-page-services';
import type { PageLayout } from '../page-layout';

const LOGIN_CONFIG_V1_URL = '/zx/login/v1/config*';
const LOGIN_CONFIG_V3_URL = '/zx/login/v3/config*';

let element: PageLayout;

function buildLoginConfigResponse(
  overrides: Partial<GetLoginConfigResponse> = {},
): GetLoginConfigResponse {
  return {
    zimbraDomainName: 'test.example.com',
    publicUrl: 'https://test.example.com',
    ...overrides,
  };
}

async function createPageLayout(attrs: {
  version?: number;
  isAdvanced?: boolean;
}): Promise<PageLayout> {
  element = document.createElement('page-layout');
  if (attrs.version !== undefined) element.version = attrs.version;
  if (attrs.isAdvanced !== undefined) element.isAdvanced = attrs.isAdvanced;
  document.body.appendChild(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  element?.remove();
  vi.restoreAllMocks();
});

describe('PageLayout', () => {
  describe('ce mode', () => {
    it('should render logo and zimbra-form when ce', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      const zimbraForm = element.shadowRoot?.querySelector('zimbra-form');
      expect(zimbraForm).not.toBeNull();
    });

    it('should not render form-selector when ce', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      const formSelector = element.shadowRoot?.querySelector('form-selector');
      expect(formSelector).toBeNull();
    });

    it('should render logo as link to zextras.com', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      const anchor = element.shadowRoot?.querySelector('a[href="https://www.zextras.com"]');
      expect(anchor).not.toBeNull();
    });
  });

  describe('advanced', () => {
    it('should render form-selector when advanced with successful config', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(buildLoginConfigResponse()),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.poll(() => element.shadowRoot?.querySelector('form-selector')).not.toBeNull();
    });

    it('should not render zimbra-form when advanced', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(buildLoginConfigResponse()),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.poll(() => element.shadowRoot?.querySelector('form-selector')).not.toBeNull();
      const zimbraForm = element.shadowRoot?.querySelector('zimbra-form');
      expect(zimbraForm).toBeNull();
    });

    it('should render server-not-responding on config fetch error', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json({}, { status: 500 }),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect
        .element(
          page.getByText('The server is not responding. Please contact your server administrator'),
        )
        .toBeVisible();
    });

    it('should use adminConsolePublicUrl as destination when available', async () => {
      const interceptor = await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            adminConsolePublicUrl: 'https://admin.example.com/console',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.poll(() => interceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
      await expect.poll(() => element.shadowRoot?.querySelector('form-selector')).not.toBeNull();

      const formSelector = element.shadowRoot?.querySelector('form-selector');
      expect(formSelector?.getAttribute('destination-url')).toContain('admin.example.com');
    });

    it('should set domain from config response when not provided in URL params', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            zimbraDomainName: 'configured-domain.com',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.poll(() => element.shadowRoot?.querySelector('form-selector')).not.toBeNull();

      const formSelector = element.shadowRoot?.querySelector('form-selector');
      expect(formSelector?.getAttribute('domain')).toBe('configured-domain.com');
    });
  });

  describe('logo rendering', () => {
    it('should render logo without link when logoUrl is empty', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            loginPageLogo: 'https://example.com/custom-logo.png',
            loginPageSkinLogoUrl: '',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      const anchor = element.shadowRoot?.querySelector('.logoSection a');
      expect(anchor).toBeNull();
    });

    it('should render logo with custom link when loginPageSkinLogoUrl is set', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            loginPageSkinLogoUrl: 'https://custom.example.com',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      await expect
        .poll(
          () => element.shadowRoot?.querySelector('a[href="https://custom.example.com"]') !== null,
        )
        .toBe(true);
    });
  });

  describe('background image', () => {
    it('should apply custom background when loginPageBackgroundImage is set', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            loginPageBackgroundImage: 'https://example.com/bg.jpg',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      const container = element.shadowRoot?.querySelector('.loginContainer');
      expect(container?.getAttribute('style')).toContain('https://example.com/bg.jpg');
    });

    it('should add retina class when using default background', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      const container = element.shadowRoot?.querySelector('.loginContainer.retina');
      expect(container).not.toBeNull();
    });

    it('should not add retina class when using custom background', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            loginPageBackgroundImage: 'https://example.com/bg.jpg',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      await expect
        .poll(() => {
          const container = element.shadowRoot?.querySelector('.loginContainer');
          return container?.classList.contains('retina');
        })
        .toBe(false);
    });
  });

  describe('copyright banner', () => {
    it('should render default copyright when no custom banner', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      await expect.element(page.getByText('Zextras', { exact: false })).toBeVisible();
      await expect.element(page.getByText('All rights reserved', { exact: false })).toBeVisible();
    });

    it('should render custom copyright banner from v3 config', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V3_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            carbonioAdminUiDescription: 'Custom Copyright 2026',
          }),
        ),
      );

      await createPageLayout({ version: 3, isAdvanced: true });

      await expect.element(page.getByText('Custom Copyright 2026')).toBeVisible();
    });
  });

  describe('v3 customization', () => {
    it('should apply v3 admin UI title', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V3_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            carbonioAdminUiTitle: 'Custom Admin Title',
          }),
        ),
      );

      await createPageLayout({ version: 3, isAdvanced: true });

      await expect.poll(() => document.title).toBe('Custom Admin Title');
    });

    it('should apply v3 admin login logo', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V3_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            carbonioAdminUiLoginLogo: 'https://example.com/admin-logo.png',
          }),
        ),
      );

      await createPageLayout({ version: 3, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      await expect
        .poll(() => {
          const img = element.shadowRoot?.querySelector('img[alt="Logo"]');
          return img?.getAttribute('src');
        })
        .toBe('https://example.com/admin-logo.png');
    });

    it('should apply v3 admin background', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V3_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            carbonioAdminUiBackground: 'https://example.com/admin-bg.jpg',
          }),
        ),
      );

      await createPageLayout({ version: 3, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      const container = element.shadowRoot?.querySelector('.loginContainer');
      await expect
        .poll(() => container?.getAttribute('style'))
        .toContain('https://example.com/admin-bg.jpg');
    });

    it('should use carbonioLogoURL for logo link in v3', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V3_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            carbonioLogoURL: 'https://custom-brand.example.com',
          }),
        ),
      );

      await createPageLayout({ version: 3, isAdvanced: true });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();
      await expect
        .poll(
          () =>
            element.shadowRoot?.querySelector('a[href="https://custom-brand.example.com"]') !==
            null,
        )
        .toBe(true);
    });
  });

  describe('browser support', () => {
    it('should render browser support section', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      const browserSupportMessage = element.shadowRoot?.querySelector('browser-support-message');
      expect(browserSupportMessage).not.toBeNull();
    });
  });

  describe('lifecycle', () => {
    it('should not update state after disconnection on config error', async () => {
      let resolveConfig: ((value: Response) => void) | undefined;
      const configPromise = new Promise<Response>((resolve) => {
        resolveConfig = resolve;
      });

      vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        if (url.includes('/zx/login/v1/config')) {
          return configPromise;
        }
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
      });

      await createPageLayout({ version: 1, isAdvanced: true });
      element.remove();

      resolveConfig!(new Response(null, { status: 500 }));

      await new Promise((r) => setTimeout(r, 50));

      expect(element.shadowRoot?.querySelector('server-not-responding')).toBeNull();
    });

    it('should refetch config when version changes', async () => {
      const interceptor = await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(buildLoginConfigResponse()),
      );

      await createPageLayout({ version: 1, isAdvanced: true });
      await expect.poll(() => interceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);

      const v3Interceptor = await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V3_URL, () =>
        HttpResponse.json(buildLoginConfigResponse()),
      );

      element.version = 3;
      await element.updateComplete;

      await expect.poll(() => v3Interceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });

    it('should refetch config when isAdvanced changes', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      await expect.element(page.getByRole('img', { name: 'Logo' })).toBeVisible();

      const interceptor = await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(buildLoginConfigResponse()),
      );

      element.isAdvanced = true;
      await element.updateComplete;

      await expect.poll(() => interceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('render states', () => {
    it('should render empty when logo is not yet loaded in advanced mode', async () => {
      let resolveConfig: ((value: Response) => void) | undefined;
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolveConfig = resolve;
          }),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      const container = element.shadowRoot?.querySelector('.loginContainer');
      expect(container).toBeNull();

      resolveConfig?.(
        new Response(JSON.stringify(buildLoginConfigResponse()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should render loginContainer when config is loaded', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(buildLoginConfigResponse()),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect
        .poll(() => element.shadowRoot?.querySelector('.loginContainer') !== null)
        .toBe(true);
    });
  });

  describe('login page title', () => {
    it('should set custom login page title when provided', async () => {
      await createBrowserAPIInterceptor('get', LOGIN_CONFIG_V1_URL, () =>
        HttpResponse.json(
          buildLoginConfigResponse({
            loginPageTitle: 'Custom Login Title',
          }),
        ),
      );

      await createPageLayout({ version: 1, isAdvanced: true });

      await expect.poll(() => document.title).toBe('Custom Login Title');
    });

    it('should set default title in non-advanced mode', async () => {
      await createPageLayout({ version: 1, isAdvanced: false });

      expect(document.title).toBe('Carbonio Authentication');
    });
  });
});
