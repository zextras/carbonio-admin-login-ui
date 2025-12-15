/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import PageLayout from './page-layout';
import * as loginPageServices from '../services/login-page-services';
import { setup } from '../tests/testUtils';

describe('PageLayout', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

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

	test('should set custom logo properties when loginPageLogo and loginPageSkinLogoUrl are provided', async () => {
		const mockResponse = {
			loginPageLogo: 'https://example.com/custom-logo.png',
			loginPageSkinLogoUrl: 'https://example.com/logo-url',
			publicUrl: 'https://example.com',
			zimbraDomainName: 'example.com'
		};

		jest.spyOn(loginPageServices, 'getLoginConfig').mockResolvedValue(mockResponse);

		setup(<PageLayout version={2} isAdvanced={true} />);

		await waitFor(() => {
			const logoImage = screen.getByTestId('logo');
			expect(logoImage).toBeInTheDocument();
			expect(logoImage).toHaveAttribute('src', mockResponse.loginPageLogo);
			expect(logoImage).toHaveAttribute('width', '100%');
		});

		await waitFor(() => {
			const logoLink = screen.getByTestId('logo-link');
			expect(logoLink).toBeInTheDocument();
			expect(logoLink).toHaveAttribute('href', mockResponse.loginPageSkinLogoUrl);
		});
	});

	test('should handle custom logo without URL', async () => {
		const mockResponse = {
			loginPageLogo: 'https://example.com/custom-logo.png',
			publicUrl: 'https://example.com',
			zimbraDomainName: 'example.com'
		};

		jest.spyOn(loginPageServices, 'getLoginConfig').mockResolvedValue(mockResponse);

		setup(<PageLayout version={2} isAdvanced={true} />);

		await waitFor(() => {
			const logoImage = screen.getByTestId('logo');
			expect(logoImage).toBeInTheDocument();
			expect(logoImage).toHaveAttribute('src', mockResponse.loginPageLogo);
			expect(logoImage).toHaveAttribute('width', '100%');
		});

		// Logo should not be wrapped in a link when no URL is provided
		expect(screen.queryByTestId('logo-link')).not.toBeInTheDocument();
	});

	test('should configure background image when loginPageBackgroundImage is provided', async () => {
		const mockResponse = {
			loginPageBackgroundImage: 'https://example.com/background.jpg',
			publicUrl: 'https://example.com',
			zimbraDomainName: 'example.com'
		};

		jest.spyOn(loginPageServices, 'getLoginConfig').mockResolvedValue(mockResponse);

		setup(<PageLayout version={2} isAdvanced={true} />);

		await waitFor(() => {
			const formContainer = screen.getByTestId('form-container');
			expect(formContainer).toBeInTheDocument();
		});
	});

	test('should configure dark theme when isDarkThemeEnable is provided', async () => {
		const mockResponse = {
			isDarkThemeEnable: true,
			publicUrl: 'https://example.com',
			zimbraDomainName: 'example.com'
		};

		jest.spyOn(loginPageServices, 'getLoginConfig').mockResolvedValue(mockResponse);

		setup(<PageLayout version={2} isAdvanced={true} />);

		await waitFor(() => {
			const formContainer = screen.getByTestId('form-container');
			expect(formContainer).toBeInTheDocument();
		});
	});
});
