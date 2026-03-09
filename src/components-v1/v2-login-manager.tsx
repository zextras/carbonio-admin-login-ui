/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useState } from 'react';

import { Button, Checkbox, Input, Row, Select, Snackbar, Text } from '../ui-components/src';
import { useTranslation } from 'react-i18next';

import ChangePasswordForm from './change-password-form';
import { Configuration, CredentialsForm } from './credentials-form';
import OfflineModal from './modals';
import Spinner from './spinner';
import { loginToCarbonioAdmin, submitOtp } from '../services/v2-service';
import { saveCredentials } from '../utils';

const formState = {
	credentials: 'credentials',
	waiting: 'waiting',
	twoFactor: 'two-factor',
	changePassword: 'change-password'
};

type V2LoginManager = { configuration: Configuration; disableInputs: boolean };

export const V2LoginManager = ({ configuration, disableInputs }: V2LoginManager) => {
	const [t] = useTranslation();
	const [loadingCredentials, setLoadingCredentials] = useState(false);
	const [loadingOtp, setLoadingOtp] = useState(false);
	const [progress, setProgress] = useState(formState.credentials);

	const [showOtpError, setShowOtpError] = useState(false);

	const [otpId, setOtpId] = useState<any>('');
	const [otp, setOtp] = useState('');
	const onChangeOtp = useCallback(
		(ev) => {
			setOtp(ev.target.value);
		},
		[setOtp]
	);
	const [trustDevice, setTrustDevice] = useState(false);
	const toggleTrustDevice = useCallback(() => setTrustDevice((v) => !v), [setTrustDevice]);

	const [loadingChangePassword, setLoadingChangePassword] = useState(false);

	const [snackbarNetworkError, setSnackbarNetworkError] = useState(false);
	const [detailNetworkModal, setDetailNetworkModal] = useState(false);
	const submitCredentials = useCallback(async (username, password) => {
		setLoadingCredentials(true);
		try {
			const res = await loginToCarbonioAdmin(username, password);
			if (res.status === 200) {
				await saveCredentials(username, password);
				window.location.assign('/carbonioAdmin');
				setProgress('false');
			} else {
				setSnackbarNetworkError(true);
				setLoadingCredentials(false);
			}
		} catch {
			return setLoadingCredentials(false);
		}
	}, []);

	const submitOtpCb = useCallback(
		(e) => {
			e.preventDefault();
			setLoadingOtp(true);
			submitOtp(otpId, otp, trustDevice)
				.then((res) => {
					if (res.status === 200) {
						if (res.redirected) {
							setProgress(formState.changePassword);
						} else {
							window.location.assign(configuration?.destinationUrl ?? '');
						}
					} else {
						setLoadingOtp(false);
						setShowOtpError(true);
					}
				})
				.catch(() => setLoadingOtp(false));
		},
		[otpId, otp, trustDevice, configuration?.destinationUrl]
	);

	const onCloseCbk = useCallback(() => setDetailNetworkModal(false), [setDetailNetworkModal]);
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
					authError={false}
					submitCredentials={submitCredentials}
					loading={loadingCredentials}
				/>
			)}
			{progress === formState.waiting && (
				<Row orientation="vertical" crossAlignment="center" padding={{ vertical: 'extralarge' }}>
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
							items={[]}
							background="gray5"
							label={t('choose_otp', 'Choose the OTP Method')}
							onChange={setOtpId}
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
						<Text color="error" size="small" overflow="break-word">
							{showOtpError &&
								t('wrong_password', 'Wrong password, please check data and try again')}
							{!showOtpError && <br />}
						</Text>
					</Row>
					<Row orientation="vertical" crossAlignment="flex-start" padding={{ vertical: 'small' }}>
						<Button
							onClick={submitOtpCb}
							disabled={disableInputs}
							label={t('login', 'Login')}
							width="fill"
							loading={loadingOtp}
						/>
					</Row>
					<Row mainAlignment="flex-start">
						<Checkbox
							value={trustDevice}
							label={t('trust_device_and_ip', 'Trust this device and IP address')}
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
					username={''}
				/>
			)}
			<Snackbar
				open={snackbarNetworkError}
				label={t('cant_login', 'Can not do the login now')}
				actionLabel={t('details', 'Details')}
				onActionClick={onSnackbarActionCbk}
				onClose={onCloseSnackbarCbk}
				autoHideTimeout={10000}
				severity="error"
			/>
			<OfflineModal open={detailNetworkModal} onClose={onCloseCbk} />
		</>
	);
};
