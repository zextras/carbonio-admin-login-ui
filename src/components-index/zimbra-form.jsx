/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import ChangePasswordForm from '../components-v1/change-password-form';
import CredentialsForm from '../components-v1/credentials-form';
import { loginToCarbonioAdmin } from '../services/v2-service';

const formState = {
	credentials: 'credentials',
	waiting: 'waiting',
	twoFactor: 'two-factor',
	changePassword: 'change-password'
};

export function ZimbraForm({ destinationUrl, isDarkTheme }) {
	const [t] = useTranslation();
	const [authError, setAuthError] = useState();
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(formState.credentials);
	const [loadingChangePassword, setLoadingChangePassword] = useState(false);
	const [loadingCredentials, setLoadingCredentials] = useState(false);
	const [email, setEmail] = useState('');

	const submitCredentials = useCallback(
		(username, password) => {
			setLoading(true);
			return loginToCarbonioAdmin(username, password)
				.then(async (res) => {
					let payload;
					try {
						payload = await res.json();
					} catch (err) {
						payload = await res;
					}
					setLoadingCredentials(false);
					setEmail(username);
					if (payload?.Body?.Fault) {
						if (
							payload.Body.Fault?.Detail?.Error?.Code &&
							payload.Body.Fault?.Detail?.Error?.Code === 'account.CHANGE_PASSWORD'
						) {
							setProgress(formState.changePassword);
						} else {
							throw new Error(payload.Body.Fault.Reason.Text);
						}
					}
					switch (res.status) {
						case 200:
							window.location.assign('/carbonioAdmin');
							break;
						case 401:
						case 500:
							setAuthError(
								t(
									'credentials_not_valid',
									'Credentials are not valid, please check data and try again'
								)
							);
							setLoading(false);
							break;
						case 403:
							setAuthError(
								t(
									'auth_not_valid',
									'The authentication policy needs more steps: please contact your administrator for more information'
								)
							);
							setLoading(false);
							break;
						case 502:
							setAuthError(
								t('server_unreachable', 'Error 502: Service Unreachable - Retry later.')
							);
							setLoading(false);
							break;
						default:
							setLoading(false);
					}
				})
				.catch((err) => {
					setLoading(false);
					setLoadingCredentials(false);
					if (err.message.startsWith('authentication failed'))
						setAuthError(
							t(
								'credentials_not_valid',
								'Credentials are not valid, please check data and try again'
							)
						);
					else setAuthError(err.message);
				});
		},
		[t]
	);

	return (
		<>
			{progress === formState.credentials && (
				<CredentialsForm
					configuration={{
						destinationUrl: 'https://dt1-single-srv1.demo.zextras.io:6071',
						authMethods: ['password', 'recovery-token', 'anonymous', 'saml']
					}}
					disableInputs={false}
					authError={authError}
					submitCredentials={submitCredentials}
					loading={loading}
				/>
			)}
			{progress === formState.changePassword && (
				<ChangePasswordForm
					isLoading={loadingChangePassword}
					setIsLoading={setLoadingChangePassword}
					configuration={{
						destinationUrl: window.location.origin,
						authMethods: ['zimbra']
					}}
					username={email}
				/>
			)}
		</>
	);
}
