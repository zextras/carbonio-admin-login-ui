/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Button,
	Checkbox,
	Input,
	Row,
	Select,
	Snackbar,
	Text,
} from '@zextras/zapp-ui';
import { map } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	postV2Login,
	submitOtp
} from '../services/v2-service';
import { saveCredentials } from '../utils';
import ChangePasswordForm from './change-password-form';
import CredentialsForm from './credentials-form';

import { OfflineModal } from './modals';
import Spinner from './spinner';

const formState = {
	credentials: 'credentials',
	waiting: 'waiting',
	twoFactor: 'two-factor',
	changePassword: 'change-password',
};

export default function V2LoginManager({ configuration, disableInputs }) {
	const [t] = useTranslation();

	const [loadingCredentials, setLoadingCredentials] = useState(false);
	const [loadingOtp, setLoadingOtp] = useState(false);
	const [progress, setProgress] = useState(formState.credentials);

	const [authError, setAuthError] = useState(false);
	const [showOtpError, setShowOtpError] = useState(false);

	const [otpList, setOtpList] = useState([]);
	const [otpId, setOtpId] = useState('');
	const [otp, setOtp] = useState('');
	const onChangeOtp = useCallback(
		(ev) => {
			setOtp(ev.target.value);
		},
		[setOtp]
	);
	const [trustDevice, setTrustDevice] = useState(false);
	const toggleTrustDevice = useCallback(
		() => setTrustDevice((v) => !v),
		[setTrustDevice]
	);

	const [email, setEmail] = useState('');
	const [loadingChangePassword, setLoadingChangePassword] = useState(false);

	const [snackbarNetworkError, setSnackbarNetworkError] = useState(false);
	const [detailNetworkModal, setDetailNetworkModal] = useState(false);

	const submitCredentials = useCallback(
		(username, password) => {
			setLoadingCredentials(true);
			return postV2Login('password', username, password)
				.then((res) => {
					switch (res.status) {
						case 200:
							setEmail(username);
							if (res.redirected) {
								setProgress(formState.changePassword);
							}
							else {
								res.json().then(async (response) => {
									await saveCredentials(username, password);
									if (response?.['2FA'] === true) {
										setOtpList(
											map(response?.otp ?? [], (obj) => ({
												label: obj.label,
												value: obj.id,
											}))
										);
										setOtpId(response?.otp?.[0].id);
										setProgress(formState.twoFactor);
										setLoadingCredentials(false);
									}
 									else {
										window.location.assign(configuration.destinationUrl);
									}
								});
							}
							break;
						case 401:
							setAuthError(
								t(
									'credentials_not_valid',
									'Credentials are not valid, please check data and try again'
								)
							);
							setLoadingCredentials(false);
							break;
						case 403:
							setAuthError(
								t(
									'auth_not_valid',
									'The authentication policy needs more steps: please contact your administrator for more information'
								)
							);
							setLoadingCredentials(false);
							break;
						default:
							setSnackbarNetworkError(true);
							setLoadingCredentials(false);
					}
				})
				.catch(() => setLoadingCredentials(false));
		},
		[configuration.destinationUrl]
	);

	const submitOtpCb = useCallback(
		(e) => {
			e.preventDefault();
			setLoadingOtp(true);
			submitOtp(otpId, otp, trustDevice)
				.then((res) => {
					if (res.status === 200) {
						if (res.redirected) {
							setProgress(formState.changePassword);
						}
						else {
							window.location.assign(configuration.destinationUrl);
						}
					}
					else {
						setLoadingOtp(false);
						setShowOtpError(true);
					}
				})
				.catch(() => setLoadingOtp(false));
		},
		[otpId, otp, trustDevice, configuration.destinationUrl]
	);

	const onCloseCbk = useCallback(
		() => setDetailNetworkModal(false),
		[setDetailNetworkModal]
	);
	const onSnackbarActionCbk = useCallback(
		() => setDetailNetworkModal(true),
		[setDetailNetworkModal]
	);
	const onCloseSnackbarCbk = useCallback(
		() => setSnackbarNetworkError(false),
		[setSnackbarNetworkError]
	);

	return (
		<>
			{progress === formState.credentials && (
				<CredentialsForm
					configuration={configuration}
					disableInputs={disableInputs}
					authError={authError}
					submitCredentials={submitCredentials}
					loading={loadingCredentials}
				/>
			)}
			{progress === formState.waiting && (
				<Row
					orientation="vertical"
					crossAlignment="center"
					padding={{ vertical: 'extralarge' }}
				>
					<Spinner />
				</Row>
			)}
			{progress === formState.twoFactor && (
				<form onSubmit={submitOtpCb} style={{ width: '100%' }}>
					<input type="submit" style={{ display: 'none' }} />
					<Row padding={{ bottom: 'large' }}>
						<Text size="large" color="text" weight="bold">
							{t('two_step_authentication', 'Two-Step-Authentication')}
						</Text>
					</Row>
					<Row padding={{ top: 'large' }}>
						<Select
							items={otpList}
							background="gray5"
							label={t('choose_otp', 'Choose the OTP Method')}
							onChange={setOtpId}
							defaultSelection={otpList[0]}
						/>
					</Row>
					<Row padding={{ top: 'large' }}>
						<Input
							defaultValue={otp}
							hasError={showOtpError}
							disabled={disableInputs}
							onChange={onChangeOtp}
							label={t('type_otp', 'Type here One-Time-Password')}
							backgroundColor="gray5"
						/>
					</Row>
					<Row padding={{ top: 'extrasmall' }} mainAlignment="flex-start">
						<Text color="error" size="medium" overflow="break-word">
							{showOtpError &&
								t(
									'wrong_password',
									'Wrong password, please check data and try again'
								)}
							{!showOtpError && <br />}
						</Text>
					</Row>
					<Row
						orientation="vertical"
						crossAlignment="flex-start"
						padding={{ vertical: 'small' }}
					>
						<Button
							onClick={submitOtpCb}
							disabled={disableInputs}
							label={t('login', 'Login')}
							size="fill"
							loading={loadingOtp}
						/>
					</Row>
					<Row mainAlignment="flex-start">
						<Checkbox
							value={trustDevice}
							label={t(
								'trust_device_and_ip',
								'Trust this device and IP address'
							)}
							onClick={toggleTrustDevice}
						/>
					</Row>
				</form>
			)}
			{progress === formState.changePassword && (
				<ChangePasswordForm
					isLoading={loadingChangePassword}
					setIsLoading={setLoadingChangePassword}
					configuration={configuration}
					username={email}
				/>
			)}
			<Snackbar
				open={snackbarNetworkError}
				label={t('cant_login', 'Can not do the login now')}
				actionLabel={t('details', 'Details')}
				onActionClick={onSnackbarActionCbk}
				onClose={onCloseSnackbarCbk}
				autoHideTimeout={10000}
				type="error"
			/>
			<OfflineModal open={detailNetworkModal} onClose={onCloseCbk} />
		</>
	);
}
