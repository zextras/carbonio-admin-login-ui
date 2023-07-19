/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, screen, within } from '@testing-library/react';
import React from 'react';
import { setup } from '../tests/testUtils';
import V1LoginManager from './v1-login-manager';

describe('v1-login-manager', () => {
	test('renders CredentialsForm component when progress is set to "credentials"', () => {
		setup(
			<V1LoginManager
				configuration={{ authMethods: ['saml'], destinationUrl: 'https://example.com' }}
				disableInputs={false}
			/>
		);

		const credentialsForm = screen.getByTestId('credentials-form');
		expect(credentialsForm).toBeInTheDocument();
	});
});
