/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { act, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, JsonBodyType } from 'msw';

import { setup } from './testUtils';
import { App } from '../app';
import { CARBONIO_CE_SUPPORTED_BROWSER_LINK, CARBONIO_SUPPORTED_BROWSER_LINK } from '../constants';
import { APIInterceptor, createAPIInterceptor } from '../jest-env-setup';

function mockAdvancedSupportedApi(response: () => HttpResponse): APIInterceptor {
	return createAPIInterceptor('get', '/advanced/supported', response);
}

function apiMinMaxVersions(version: number): APIInterceptor {
	return createAPIInterceptor('get', '/zx/login/supported', () =>
		HttpResponse.json(
			{ minApiVersion: version, maxApiVersion: 2, version },
			{
				status: 200
			}
		)
	);
}

function apiMinMaxFail(): APIInterceptor {
	return createAPIInterceptor('get', '/zx/login/supported', () => HttpResponse.error());
}

function apiLoginConfigAPI(version: number, config: JsonBodyType): APIInterceptor {
	return createAPIInterceptor('get', `/zx/login/v${version}/config`, () =>
		HttpResponse.json(config, { status: 200 })
	);
}

describe('App', () => {
	it('should display error if api returns error', async () => {
		mockAdvancedSupportedApi(HttpResponse.error);

		await act(async () => {
			render(<App />);
		});

		await screen.findByText('Unable to determine product version');
	});

	it('should display loading', async () => {
		mockAdvancedSupportedApi(HttpResponse.error);

		render(<App />);

		await screen.findByText('loading');
	});

	it('should display Advanced Login if API ok and supported', async () => {
		mockAdvancedSupportedApi(() => HttpResponse.json({ supported: true }, { status: 200 }));
		const version = 2;
		const apiInterceptor = apiMinMaxVersions(version);
		const apiInterceptor1 = apiLoginConfigAPI(version, {
			carbonioLogoURL: 'https://www.zextras.com'
		});

		await act(async () => {
			setup(<App />);
		});

		await waitFor(() => {
			expect(apiInterceptor.getCalledTimes() > 0).toBeTruthy();
		});

		await waitFor(() => {
			expect(apiInterceptor1.getCalledTimes() > 0).toBeTruthy();
		});

		const logoImage = await screen.findByTestId('logo');
		expect(logoImage).toBeInTheDocument();
		await screen.findByTestId('form-container');

		const links = await screen.findAllByRole('link');
		const carbonioLink = links.find(
			(link) => link.getAttribute('href') === CARBONIO_SUPPORTED_BROWSER_LINK
		);
		expect(carbonioLink).toBeInTheDocument();
	});

	it('should display Advanced error Login if advanced supported but min-max version check API fails', async () => {
		mockAdvancedSupportedApi(() => HttpResponse.json({ supported: true }, { status: 200 }));
		apiMinMaxFail();

		await act(async () => {
			setup(<App />);
		});

		expect(await screen.findByTestId('not-supported-version')).toBeInTheDocument();
	});

	it('should display CE Login if API ok and supported false', async () => {
		mockAdvancedSupportedApi(() => HttpResponse.json({ supported: false }, { status: 200 }));

		await act(async () => {
			setup(<App />);
		});

		const links = await screen.findAllByRole('link');
		const carbonioCELink = links.find(
			(link) => link.getAttribute('href') === CARBONIO_CE_SUPPORTED_BROWSER_LINK
		);
		expect(carbonioCELink).toBeInTheDocument();
	});
});
