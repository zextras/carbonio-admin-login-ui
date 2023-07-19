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
		setup(<PageLayout version={3} hasBackendApi={false} />);

		// Assert the presence of the logo image
		const logoImage = screen.getByTestId('logo');
		expect(logoImage).toBeInTheDocument();

		// Assert the presence of the form container
		const formContainer = screen.getByTestId('form-container');
		expect(formContainer).toBeInTheDocument();
	});

	test('renders supported browsers', () => {
		setup(<PageLayout version={1} hasBackendApi={false} />);

		// Assert the presence of the browser logos
		const chromeLogo = screen.getByAltText('Logo Chrome');
		const firefoxLogo = screen.getByAltText('Logo Firefox');
		const edgeLogo = screen.getByAltText('Logo Edge Chromium');

		expect(chromeLogo).toBeInTheDocument();
		expect(firefoxLogo).toBeInTheDocument();
		expect(edgeLogo).toBeInTheDocument();
	});

	test('renders the default copyright banner', () => {
		setup(<PageLayout version={1} hasBackendApi={false} />);

		// Assert the presence of the default copyright banner
		const defaultBanner = screen.getByTestId('default-banner');
		expect(defaultBanner).toBeInTheDocument();
	});
});
