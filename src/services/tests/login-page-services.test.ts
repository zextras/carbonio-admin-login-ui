/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { createAPIInterceptor } from '../../../tests-setup/jsdom/server';
import { checkClassicUi, getLoginConfig, getLoginSupported } from '../login-page-services';

const SUPPORTED_URL = '/zx/login/supported';

describe('getLoginSupported', () => {
  it('should return parsed JSON on 200', async () => {
    const expected = { min: 2, max: 3 };
    createAPIInterceptor('get', SUPPORTED_URL, () =>
      HttpResponse.json(expected, { status: 200 }),
    );

    const result = await getLoginSupported(new AbortController().signal);
    expect(result).toEqual(expected);
  });

  it('should throw Network Error on 500', async () => {
    createAPIInterceptor('get', SUPPORTED_URL, () => HttpResponse.json({}, { status: 500 }));

    await expect(getLoginSupported(new AbortController().signal)).rejects.toThrow('Network Error');
  });

  it('should throw Network Error on 404', async () => {
    createAPIInterceptor('get', SUPPORTED_URL, () => HttpResponse.json({}, { status: 404 }));

    await expect(getLoginSupported(new AbortController().signal)).rejects.toThrow('Network Error');
  });

  it('should abort request when signal is aborted', async () => {
    const controller = new AbortController();
    createAPIInterceptor('get', SUPPORTED_URL, () => {
      controller.abort();
      return HttpResponse.json({ min: 2, max: 3 }, { status: 200 });
    });

    await expect(getLoginSupported(controller.signal)).rejects.toThrow();
  });
});

describe('getLoginConfig', () => {
  it('should call correct URL with version, domain and host', async () => {
    const interceptor = createAPIInterceptor(
      'get',
      '/zx/login/v3/config?domain=example.com&host=mail.example.com',
      () => HttpResponse.json({ loginPageTitle: 'Admin' }, { status: 200 }),
    );

    await getLoginConfig(3, 'example.com', 'mail.example.com');

    expect(interceptor.getCalledTimes()).toBe(1);
  });

  it('should call correct URL with only version when domain and host are null or empty', async () => {
    const interceptor = createAPIInterceptor('get', '/zx/login/v2/config', () =>
      HttpResponse.json({}, { status: 200 }),
    );

    await getLoginConfig(2, null, '');

    expect(interceptor.getCalledTimes()).toBe(1);
  });

  it('should return parsed JSON on 200', async () => {
    const config = { loginPageTitle: 'My Admin', loginPageLogo: 'logo.png' };
    createAPIInterceptor('get', '/zx/login/v2/config', () =>
      HttpResponse.json(config, { status: 200 }),
    );

    const result = await getLoginConfig(2, null, '');
    expect(result).toEqual(config);
  });

  it('should throw Network Error on 500', async () => {
    createAPIInterceptor('get', '/zx/login/v2/config', () =>
      HttpResponse.json({}, { status: 500 }),
    );

    await expect(getLoginConfig(2, null, '')).rejects.toThrow('Network Error');
  });

  it('should throw Network Error on 404', async () => {
    createAPIInterceptor('get', '/zx/login/v2/config', () =>
      HttpResponse.json({}, { status: 404 }),
    );

    await expect(getLoginConfig(2, null, '')).rejects.toThrow('Network Error');
  });
});

describe('checkClassicUi', () => {
  const CLASSIC_UI_URL = '/public/blank.html';

  it('should return hasClassic true on 200', async () => {
    createAPIInterceptor('get', CLASSIC_UI_URL, () =>
      HttpResponse.text('', { status: 200, headers: { 'Content-Type': 'text/html' } }),
    );

    const result = await checkClassicUi();
    expect(result).toEqual({ hasClassic: true });
  });

  it('should return hasClassic false on 404', async () => {
    createAPIInterceptor('get', CLASSIC_UI_URL, () =>
      HttpResponse.json({}, { status: 404 }),
    );

    const result = await checkClassicUi();
    expect(result).toEqual({ hasClassic: false });
  });

  it('should return hasClassic true on other success status codes', async () => {
    createAPIInterceptor('get', CLASSIC_UI_URL, () =>
      HttpResponse.text('', { status: 204, headers: { 'Content-Type': 'text/html' } }),
    );

    const result = await checkClassicUi();
    expect(result).toEqual({ hasClassic: true });
  });
});
