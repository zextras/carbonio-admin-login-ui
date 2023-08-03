/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';
import React, { useCallback, useState } from 'react';

import CredentialsForm from '../components-v1/credentials-form';
import { loginToCarbonioAdmin } from '../services/v2-service';

export function ZimbraForm({ destinationUrl, isDarkTheme }) {
	const [t] = useTranslation();
	const [authError, setAuthError] = useState();
	const [loading, setLoading] = useState(false);

	const submitCredentials = useCallback(
		(username, password) => {
			setLoading(true);
			return loginToCarbonioAdmin(username, password)
				.then(async (res) => {
					const payload = await res.json();
					if (payload.Body.Fault) {
						throw new Error(payload.Body.Fault.Reason.Text);
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
		<CredentialsForm
			configuration={{ destinationUrl, authMethods: ['zimbra'] }}
			disableInputs={false}
			authError={authError}
			submitCredentials={submitCredentials}
			loading={loading}
			isDarkTheme={isDarkTheme}
		/>
	);
}
