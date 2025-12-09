/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import PageLayout from './page-layout';
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
		setup(<PageLayout version={1} isAdvanced={true} />);

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
});
