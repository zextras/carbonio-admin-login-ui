// Copyright (C) 2011-2020 Zextras
/* eslint-disable import/no-extraneous-dependencies, max-classes-per-file */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';
import type { SetupServer } from 'msw/lib/node';

import server from './mocks/server';

import './jest-polyfills';

// Mock SVG elements for darkreader compatibility with jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
global.SVGStyleElement = class SVGStyleElement {} as any;
global.SVGTextElement = class SVGTextElement {} as any;
global.SVGElement = class SVGElement extends HTMLElement {} as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
	vi.useFakeTimers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
	server.resetHandlers();
	vi.runOnlyPendingTimers();
	vi.useRealTimers();
});

export const getSetupServer = (): SetupServer => server;

export type APIInterceptor = {
	getLastRequest: () => StrictRequest<DefaultBodyType>;
	getCalledTimes: () => number;
};

export const createAPIInterceptor = (
	method: 'get' | 'post',
	url: string,
	response: () => HttpResponse<DefaultBodyType>
): APIInterceptor => {
	let calledTimes = 0;
	const requests: Array<StrictRequest<DefaultBodyType>> = [];

	getSetupServer().use(
		http[method](url, async ({ request }) => {
			calledTimes += 1;
			requests.push(request);
			return response();
		})
	);

	return {
		getLastRequest: () => requests[requests.length - 1],
		getCalledTimes: () => calledTimes
	};
};

const advancedSupportedURL = '/services/catalog/services';
export const advancedSupportedApi = {
	withError: (): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, HttpResponse.error),
	withResponse: (response: () => HttpResponse<DefaultBodyType>): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, response),
	supported: (): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 })
		),
	notSupported: (): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-files'] }, { status: 200 })
		)
};
