/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  type DefaultBodyType,
  http,
  HttpResponse,
  type HttpResponseResolver,
  type StrictRequest,
} from 'msw';
import { setupWorker } from 'msw/browser';

const handleGetTranslations: HttpResponseResolver<never, never> = async () => HttpResponse.json({});
const defaultHandlers = [http.get('/i18n/en.json', handleGetTranslations)];

const worker = setupWorker(...defaultHandlers);

type HandlerRequest<T> = DefaultBodyType & {
  Body: Record<string, T>;
};

type BrowserAPIInterceptor = {
  getLastRequest: () => StrictRequest<DefaultBodyType>;
  getCalledTimes: () => number;
};

export const startMockWorker = async () => {
  await worker.start({ onUnhandledRequest: 'warn', quiet: true });
};

export const stopMockWorker = () => {
  worker.stop();
};

export const resetMockWorker = () => {
  worker.resetHandlers(...defaultHandlers);
};

export const createBrowserAPIInterceptor = async (
  method: 'get' | 'post',
  url: string,
  response: () => HttpResponse,
): Promise<BrowserAPIInterceptor> => {
  let calledTimes = 0;
  const requests: Array<StrictRequest<DefaultBodyType>> = [];

  worker.use(
    http[method](url, async ({ request }) => {
      calledTimes += 1;
      requests.push(request);
      return response();
    }),
  );

  return {
    getLastRequest: () => requests[requests.length - 1] as StrictRequest<DefaultBodyType>,
    getCalledTimes: () => calledTimes,
  };
};

const advancedSupportedURL = '/services/catalog/services';
export const advancedSupportedApiForBrowser = {
  withError: async (): Promise<BrowserAPIInterceptor> =>
    await createBrowserAPIInterceptor('get', advancedSupportedURL, HttpResponse.error),
  withAdvancedSupported: async (): Promise<BrowserAPIInterceptor> =>
    await createBrowserAPIInterceptor('get', advancedSupportedURL, () =>
      HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 }),
    ),
  withAdvancedNotSupported: async (): Promise<BrowserAPIInterceptor> =>
    await createBrowserAPIInterceptor('get', advancedSupportedURL, () =>
      HttpResponse.json({ items: ['carbonio-preview', 'carbonio-mailbox'] }, { status: 200 }),
    ),
};

export const delayedSoapApiForBrowser = <RequestParamsType, ResponseType = never>(
  apiAction: string,
  response: ResponseType,
  delayMs: number = 100,
): BrowserAPIInterceptor => {
  let calledTimes = 0;
  const requests: Array<StrictRequest<DefaultBodyType>> = [];

  worker.use(
    http.post<never, HandlerRequest<RequestParamsType>>(
      `/service/admin/soap/${apiAction}Request`,
      async ({ request }) => {
        calledTimes += 1;
        requests.push(request);

        await new Promise((resolve) => setTimeout(resolve, delayMs));

        return HttpResponse.json({
          Body: {
            [`${apiAction}Response`]: response || {},
          },
        });
      },
    ),
  );

  return {
    getLastRequest: () => requests[requests.length - 1] as StrictRequest<DefaultBodyType>,
    getCalledTimes: () => calledTimes,
  };
};
