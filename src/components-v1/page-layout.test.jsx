/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import PageLayout from './page-layout';
import server from '../mocks/server';
import { setup } from '../tests/testUtils';

describe('PageLayout', () => {
	test('renders the logo and form', () => {
		setup(<PageLayout version={3} isAdvanced={false} />);

		// Assert the presence of the logo image
		const logoImage = screen.getByTestId('logo');
		expect(logoImage).toBeInTheDocument();

		// Assert the presence of the form container
		const formContainer = screen.getByTestId('form-container');
		expect(formContainer).toBeInTheDocument();
	});

	test('renders the default copyright banner', () => {
		setup(<PageLayout version={1} isAdvanced={false} />);

		// Assert the presence of the default copyright banner
		const defaultBanner = screen.getByTestId('default-banner');
		expect(defaultBanner).toBeInTheDocument();
	});

	test('renders custom logo when loginPageLogo and loginPageSkinLogoUrl are provided in config', async () => {
		setup(<PageLayout version={1} isAdvanced />);

		// Wait for the component to load the config and render
		const logoImage = await screen.findByTestId('logo', {}, { timeout: 5000 });
		expect(logoImage).toBeInTheDocument();

		// Verify custom logo is rendered with 100% width
		expect(logoImage).toHaveAttribute('src', 'https://example.com/test-logo.png');
		expect(logoImage).toHaveAttribute('width', '100%');

		// Verify logo link is rendered with custom URL
		const logoLink = await screen.findByTestId('logo-link');
		expect(logoLink).toBeInTheDocument();
		expect(logoLink).toHaveAttribute('href', 'https://example.com/test-url');
	}, 10000);

	test('renders custom dark mode logo in v3 when carbonioWebUiDarkMode is true', async () => {
		server.use(
			http.get('/zx/login/v3/config', () => {
				return HttpResponse.json(
					{
						publicUrl: 'https://example.com',
						zimbraDomainName: 'example.com',
						isDarkThemeEnable: false, // Keep this false to avoid darkreader issues in tests
						loginPageColorSet: {
							primary: '2b73d2',
							secondary: '666666'
						},
						zimbraPublicServiceHostname: 'example.com',
						zimbraPublicServicePort: '443',
						zimbraPublicServiceProtocol: 'https',
						carbonioWebUiDarkMode: true, // This controls v3 customization path
						carbonioAdminUiDarkLoginLogo: 'https://example.com/dark-logo.png',
						carbonioAdminUiDarkBackground: 'https://example.com/dark-bg.jpg',
						carbonioLogoURL: 'https://example.com/logo-url'
					},
					{ status: 200 }
				);
			})
		);
		setup(<PageLayout version={3} isAdvanced />);

		const logoImage = await screen.findByTestId('logo', {}, { timeout: 5000 });
		expect(logoImage).toBeInTheDocument();
		expect(logoImage).toHaveAttribute('src', 'https://example.com/dark-logo.png');
		expect(logoImage).toHaveAttribute('width', '100%');

		const logoLink = await screen.findByTestId('logo-link');
		expect(logoLink).toHaveAttribute('href', 'https://example.com/logo-url');
	}, 10000);

	test('renders custom light mode logo in v3 when carbonioWebUiDarkMode is false', async () => {
		server.use(
			http.get('/zx/login/v3/config', () => {
				return HttpResponse.json(
					{
						publicUrl: 'https://example.com',
						zimbraDomainName: 'example.com',
						isDarkThemeEnable: false,
						loginPageColorSet: {
							primary: '2b73d2',
							secondary: '666666'
						},
						zimbraPublicServiceHostname: 'example.com',
						zimbraPublicServicePort: '443',
						zimbraPublicServiceProtocol: 'https',
						carbonioWebUiDarkMode: false,
						carbonioAdminUiLoginLogo: 'https://example.com/light-logo.png',
						carbonioAdminUiBackground: 'https://example.com/light-bg.jpg',
						carbonioLogoURL: 'https://example.com/custom-logo-url'
					},
					{ status: 200 }
				);
			})
		);

		setup(<PageLayout version={3} isAdvanced />);

		const logoImage = await screen.findByTestId('logo', {}, { timeout: 5000 });
		expect(logoImage).toBeInTheDocument();
		expect(logoImage).toHaveAttribute('src', 'https://example.com/light-logo.png');
		expect(logoImage).toHaveAttribute('width', '100%');

		const logoLink = await screen.findByTestId('logo-link');
		expect(logoLink).toHaveAttribute('href', 'https://example.com/custom-logo-url');
	}, 10000);

	test('uses default CARBONIO_LOGO_URL when carbonioLogoURL is not provided in v3', async () => {
		server.use(
			http.get('/zx/login/v3/config', () => {
				return HttpResponse.json(
					{
						publicUrl: 'https://example.com',
						zimbraDomainName: 'example.com',
						isDarkThemeEnable: false,
						loginPageColorSet: {
							primary: '2b73d2',
							secondary: '666666'
						},
						zimbraPublicServiceHostname: 'example.com',
						zimbraPublicServicePort: '443',
						zimbraPublicServiceProtocol: 'https',
						carbonioWebUiDarkMode: false,
						carbonioAdminUiLoginLogo: 'https://example.com/logo.png',
						carbonioLogoURL: ''
					},
					{ status: 200 }
				);
			})
		);

		setup(<PageLayout version={3} isAdvanced />);

		const logoImage = await screen.findByTestId('logo', {}, { timeout: 5000 });
		expect(logoImage).toBeInTheDocument();

		const logoLink = await screen.findByTestId('logo-link');
		expect(logoLink).toHaveAttribute('href', 'https://www.zextras.com');
	}, 10000);
});
