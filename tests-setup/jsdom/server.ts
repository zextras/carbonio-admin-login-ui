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
import { type SetupServer, setupServer } from 'msw/node';

const handleGetTranslations: HttpResponseResolver<never, never> = async () => HttpResponse.json({});
const defaultHandlers = [];
defaultHandlers.push(http.get('/i18n/en.json', handleGetTranslations));

const server = setupServer(...defaultHandlers);

type APIInterceptor = {
  getLastRequest: () => StrictRequest<DefaultBodyType>;
  getCalledTimes: () => number;
};

export const getSetupServer = (): SetupServer => server;

export const createAPIInterceptor = (
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  response: () => HttpResponse,
): APIInterceptor => {
  let calledTimes = 0;
  const requests: Array<StrictRequest<DefaultBodyType>> = [];

  getSetupServer().use(
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
