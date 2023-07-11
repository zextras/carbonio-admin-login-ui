/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen, within, waitFor } from '@testing-library/react';
import React from 'react';
import ChangePasswordForm from './change-password-form';
import { setup } from '../tests/testUtils';

jest.mock('../utils', () => ({
	saveCredentials: jest.fn(),
	setCookie: jest.fn()
}));

describe('ChangePasswordForm', () => {
	test('should render form and input fields', () => {
		setup(
			<ChangePasswordForm
				isLoading={false}
				setIsLoading={jest.fn()}
				username="testuser"
				configuration={{ destinationUrl: '/home' }}
			/>
		);

		expect(screen.getByTestId('email')).toBeInTheDocument();
		expect(screen.getByTestId('oldPassword')).toBeInTheDocument();
		expect(screen.getByTestId('newPassword')).toBeInTheDocument();
		expect(screen.getByTestId('confirmNewPassword')).toBeInTheDocument();
		expect(screen.getByTestId('submitChangePasswordBtn')).toBeInTheDocument();
	});

	test('should update state on input changes', async () => {
		const { user } = setup(
			<ChangePasswordForm
				isLoading={false}
				setIsLoading={jest.fn()}
				username="testuser"
				configuration={{ destinationUrl: '/home' }}
			/>
		);
		const oldPassword = screen.getByTestId('oldPassword');
		const newPassword = screen.getByTestId('newPassword');
		const confirmPassword = screen.getByTestId('confirmNewPassword');

		const oldPasswordInput = within(oldPassword).getByLabelText(/password/i);
		const newPasswordInput = within(newPassword).getByLabelText(/password/i);
		const confirmPasswordInput = within(confirmPassword).getByLabelText(/password/i);

		await user.clear(oldPasswordInput);
		await user.type(oldPasswordInput, 'oldpassword');
		await user.clear(newPasswordInput);
		await user.type(newPasswordInput, 'newpassword');
		await user.clear(confirmPasswordInput);
		await user.type(confirmPasswordInput, 'newpassword');

		expect(oldPasswordInput.value).toBe('oldpassword');
		expect(newPasswordInput.value).toBe('newpassword');
		expect(confirmPasswordInput.value).toBe('newpassword');
	});

	test('should display error when confirm password does not match new password', async () => {
		const { user } = setup(
			<ChangePasswordForm
				isLoading={false}
				setIsLoading={jest.fn()}
				username="testuser"
				configuration={{ destinationUrl: '/home' }}
			/>
		);

		const newPassword = screen.getByTestId('newPassword');
		const confirmPassword = screen.getByTestId('confirmNewPassword');

		const newPasswordInput = within(newPassword).getByLabelText(/password/i);
		const confirmPasswordInput = within(confirmPassword).getByLabelText(/password/i);

		await user.clear(newPasswordInput);
		await user.type(newPasswordInput, 'newpassword');
		await user.clear(confirmPasswordInput);
		await user.type(confirmPasswordInput, 'differentpassword');

		expect(screen.getByText('Confirm password not valid')).toBeInTheDocument();
	});

	test('should submit form and handle API response', async () => {
		const mockAuthToken = 'mockAuthToken';
		const mockResponse = {
			status: 200,
			json: jest.fn().mockResolvedValue({
				Body: { ChangePasswordResponse: { authToken: [{ _content: mockAuthToken }] } }
			})
		};
		jest.spyOn(window, 'fetch').mockResolvedValue(mockResponse);

		const saveCredentialsMock = jest.requireMock('../utils').saveCredentials;
		const setCookieMock = jest.requireMock('../utils').setCookie;

		const { user } = setup(
			<ChangePasswordForm
				isLoading={false}
				setIsLoading={jest.fn()}
				username="testuser"
				configuration={{ destinationUrl: '' }}
			/>
		);

		const oldPassword = screen.getByTestId('oldPassword');
		const newPassword = screen.getByTestId('newPassword');
		const confirmPassword = screen.getByTestId('confirmNewPassword');

		const oldPasswordInput = within(oldPassword).getByLabelText(/password/i);
		const newPasswordInput = within(newPassword).getByLabelText(/password/i);
		const confirmPasswordInput = within(confirmPassword).getByLabelText(/password/i);

		await user.clear(oldPasswordInput);
		await user.type(oldPasswordInput, 'oldpassword');
		await user.clear(newPasswordInput);
		await user.type(newPasswordInput, 'newpassword');
		await user.clear(confirmPasswordInput);
		await user.type(confirmPasswordInput, 'newpassword');

		const submitButton = screen.getByTestId('submitChangePasswordBtn');

		await user.click(submitButton);

		expect(window.fetch).toHaveBeenCalledWith('/service/admin/soap/ChangePasswordRequest', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Body: {
					ChangePasswordRequest: {
						_jsns: 'urn:zimbraAccount',
						csrfTokenSecured: '1',
						persistAuthTokenCookie: '1',
						account: {
							by: 'name',
							_content: 'testuser'
						},
						oldPassword: {
							_content: 'oldpassword'
						},
						password: {
							_content: 'newpassword'
						},
						prefs: [{ pref: { name: 'zimbraPrefMailPollingInterval' } }]
					}
				}
			})
		});

		await waitFor(() => {
			expect(saveCredentialsMock).toHaveBeenCalledWith('testuser', 'newpassword');
			expect(setCookieMock).toHaveBeenCalledWith('ZM_AUTH_TOKEN', mockAuthToken);
		});
	});
});
