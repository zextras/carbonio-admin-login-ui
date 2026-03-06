/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import V2LoginManager from './v2-login-manager';
import { loginToCarbonioAdvancedAdmin, submitOtp } from '../services/v2-service';
import { setup } from '../tests/testUtils';

jest.mock('../services/v2-service');

const mockedLogin = loginToCarbonioAdvancedAdmin as jest.Mock;
const mockedSubmitOtp = submitOtp as jest.Mock;

const defaultConfiguration = {
	destinationUrl: 'https://example.com/admin',
	authMethods: ['password']
};

const DEFAULT_USERNAME = 'admin@test.com';
const OTP_INPUT_LABEL = 'Type here One-Time-Password';
const TWO_STEP_AUTH_TEXT = 'Two-Step-Authentication';

type MockResponse = {
	status: number;
	ok: boolean;
	redirected: boolean;
	json: () => Promise<unknown>;
};

const makeResponse = (
	status: number,
	body: unknown = null,
	{ redirected = false }: { redirected?: boolean } = {}
): MockResponse => ({
	status,
	ok: status >= 200 && status < 300,
	redirected,
	json: (): Promise<unknown> => Promise.resolve(body)
});

const loginSuccessResponseWith2FA = {
	'2FA': true,
	otp: [
		{ id: 'otp-id-1', label: 'OTP Method 1' },
		{ id: 'otp-id-2', label: 'OTP Method 2' }
	],
	user: { displayName: DEFAULT_USERNAME }
};

const loginSuccessResponseWithout2FA = {
	'2FA': false,
	user: { displayName: DEFAULT_USERNAME }
};

const fillAndSubmitCredentials = async (
	user: ReturnType<typeof setup>['user'],
	username = DEFAULT_USERNAME,
	password = 'secret'
): Promise<void> => {
	const usernameField = screen.getByTestId('username');
	const passwordField = screen.getByTestId('password');
	const usernameInput = within(usernameField).getByRole('textbox');
	const passwordInput = within(passwordField).getByLabelText(/password/i);
	const loginButton = screen.getByTestId('login');

	await user.clear(usernameInput);
	await user.type(usernameInput, username);
	await user.clear(passwordInput);
	await user.type(passwordInput, password);
	await user.click(loginButton);
};

describe('V2LoginManager', () => {
	const assignMock = jest.fn();

	beforeEach(() => {
		Object.defineProperty(globalThis, 'location', {
			value: { assign: assignMock, search: '' },
			writable: true
		});
	});

	afterEach(() => {
		assignMock.mockReset();
	});

	it('should render CredentialsForm on initial render', () => {
		setup(<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />);

		expect(screen.getByTestId('credentials-form')).toBeInTheDocument();
	});

	it('should show 2FA form on successful login with 2FA enabled', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWith2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText(TWO_STEP_AUTH_TEXT)).toBeInTheDocument();
		});
	});

	it('should call loginToCarbonioAdvancedAdmin with correct arguments', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWith2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user, DEFAULT_USERNAME, 'secret');

		expect(mockedLogin).toHaveBeenCalledWith(DEFAULT_USERNAME, 'secret');
	});

	it('should redirect to destinationUrl on successful login without 2FA', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWithout2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(assignMock).toHaveBeenCalledWith(defaultConfiguration.destinationUrl);
		});
	});

	it('should show auth error on 401 response', async () => {
		mockedLogin.mockResolvedValue(makeResponse(401));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(
				screen.getByText('Credentials are not valid, please check data and try again')
			).toBeInTheDocument();
		});
	});

	it('should show auth policy error on 403 response', async () => {
		mockedLogin.mockResolvedValue(makeResponse(403));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(
				screen.getByText(
					'The authentication policy needs more steps: please contact your administrator for more information'
				)
			).toBeInTheDocument();
		});
	});

	it('should show server unreachable error on 502 response', async () => {
		mockedLogin.mockResolvedValue(makeResponse(502));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText('Error 502: Service Unreachable - Retry later.')).toBeInTheDocument();
		});
	});

	it('should show snackbar network error on unexpected status', async () => {
		mockedLogin.mockResolvedValue(makeResponse(500));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText('Can not do the login now')).toBeInTheDocument();
		});
	});

	it('should render OTP select and input in 2FA form', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWith2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText(TWO_STEP_AUTH_TEXT)).toBeInTheDocument();
		});

		expect(screen.getByText('Choose the OTP Method')).toBeInTheDocument();
		expect(screen.getByText(OTP_INPUT_LABEL)).toBeInTheDocument();
	});

	it('should redirect to destinationUrl on successful OTP validation', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWith2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText(TWO_STEP_AUTH_TEXT)).toBeInTheDocument();
		});

		mockedSubmitOtp.mockResolvedValue(makeResponse(200));

		const otpInput = screen.getByLabelText(OTP_INPUT_LABEL);
		await user.type(otpInput, '123456');
		const loginButton = screen.getByRole('button', { name: 'Login' });
		await user.click(loginButton);

		await waitFor(() => {
			expect(assignMock).toHaveBeenCalledWith(defaultConfiguration.destinationUrl);
		});
	});

	it('should show OTP error on failed OTP validation', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWith2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText(TWO_STEP_AUTH_TEXT)).toBeInTheDocument();
		});

		mockedSubmitOtp.mockResolvedValue(makeResponse(401));

		const otpInput = screen.getByLabelText(OTP_INPUT_LABEL);
		await user.type(otpInput, 'wrongotp');
		const loginButton = screen.getByRole('button', { name: 'Login' });
		await user.click(loginButton);

		await waitFor(() => {
			expect(
				screen.getByText('Wrong password, please check data and try again')
			).toBeInTheDocument();
		});
	});

	it('should show trust device checkbox in 2FA form', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, loginSuccessResponseWith2FA));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText('Two-Step-Authentication')).toBeInTheDocument();
		});

		expect(screen.getByText('Trust this device and IP address')).toBeInTheDocument();
	});

	it('should show change password form when login response is redirected', async () => {
		mockedLogin.mockResolvedValue(makeResponse(200, null, { redirected: true }));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByText('Change password and login')).toBeInTheDocument();
		});
	});

	it('should not crash when login fetch rejects', async () => {
		mockedLogin.mockRejectedValue(new Error('Network error'));

		const { user } = setup(
			<V2LoginManager configuration={defaultConfiguration} disableInputs={false} />
		);

		await fillAndSubmitCredentials(user);

		await waitFor(() => {
			expect(screen.getByTestId('credentials-form')).toBeInTheDocument();
		});
	});
});
