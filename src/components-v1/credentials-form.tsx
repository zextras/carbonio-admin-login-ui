/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkClassicUi } from '../services/login-page-services';
import { Button, Input, PasswordInput, Row } from '../ui-components';
import { setCookie } from '../utils';

const urlParams = new URLSearchParams(window.location.search);

export type Configuration = {
	destinationUrl: string;
	minApiVersion?: number;
	maxApiVersion?: number;
	authMethods?: Array<string>;
} | null;

type CredentialsFormProps = {
	authError: boolean;
	submitCredentials: (username: string, password: string) => void;
	configuration: Configuration;
	disableInputs: boolean;
	loading?: boolean;
};

export const CredentialsForm = ({
	authError,
	submitCredentials,
	configuration,
	disableInputs,
	loading = false
}: CredentialsFormProps) => {
	const [t] = useTranslation();
	const [username, setUsername] = useState(urlParams.get('username') || '');
	const [password, setPassword] = useState('');

	const submitUserPassword = useCallback(
		(e) => {
			e.preventDefault();
			if (username && password) {
				let usernameModified = username;
				if (urlParams.has('virtualacctdomain')) {
					usernameModified = `${usernameModified.replace('@', '.')}@${urlParams.get(
						'virtualacctdomain'
					)}`;
				} else if (urlParams.has('customerDomain') && !username.includes('@')) {
					usernameModified = `${usernameModified.trim()}@${urlParams.get('customerDomain')}`;
				}
				submitCredentials(usernameModified, password);
			}
		},
		[username, password, submitCredentials]
	);

	const samlButtonCbk = useCallback(() => {
		window.location.assign(
			`/zx/auth/startSamlWorkflow?redirectUrl=${configuration?.destinationUrl ?? ''}`
		);
	}, [configuration]);
	const samlButton = useMemo(() => {
		if (configuration?.authMethods?.includes('saml')) {
			return (
				<Button
					type="outlined"
					data-testid="loginSaml"
					label={t('login_saml', 'Login SAML')}
					color="primary"
					disabled={disableInputs}
					onClick={samlButtonCbk}
					style={{ height: '36px' }}
				/>
			);
		}
		return (
			// used to keep the correct space where or not SAML is shown
			<div style={{ minHeight: '20px' }} />
		);
	}, [configuration, disableInputs, samlButtonCbk, t]);

	useEffect(() => {
		checkClassicUi()
			.then((res) => {
				if (!res.hasClassic) {
					setCookie('UI', 'iris');
				}
			})
			.catch(() => {});
	}, []);

	return (
		<form
			onSubmit={(e) => e.preventDefault()}
			style={{ width: '100%' }}
			data-testid="credentials-form"
		>
			<Row padding={{ bottom: 'large' }}>
				<Input
					defaultValue={username}
					disabled={disableInputs}
					hasError={!!authError}
					data-testid="username"
					onChange={(e: any) => setUsername(e.target.value)}
					label={t('username', 'Username')}
					backgroundColor="gray5"
				/>
			</Row>
			<Row padding={{ bottom: 'small' }}>
				<PasswordInput
					defaultValue={password}
					disabled={disableInputs}
					data-testid="password"
					hasError={!!authError}
					onChange={(e: any) => setPassword(e.target.value)}
					label={t('password', 'Password')}
					backgroundColor="gray5"
				/>
			</Row>
			<zx-text color="error" size="small" overflow="break-word">
				{authError || <br />}
			</zx-text>

			<Row
				orientation="vertical"
				crossAlignment="flex-start"
				padding={{ bottom: 'large', top: 'small' }}
			>
				<Button
					style={{ height: '36px' }}
					loading={loading}
					data-testid="login"
					onClick={submitUserPassword}
					disabled={disableInputs}
					label={t('login', 'Login')}
					width="fill"
				/>
			</Row>
			<Row mainAlignment="flex-end" padding={{ bottom: 'extralarge' }}>
				{samlButton}
			</Row>
		</form>
	);
};
