/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Row, Text, Input, Button, PasswordInput } from '@zextras/zapp-ui';
import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ZM_AUTH_TOKEN,
	ZIMBRA_PASSWORD_MAX_LENGTH_ATTR_NAME,
	ZIMBRA_PASSWORD_MIN_LENGTH_ATTR_NAME,
	ZIMBRA_PASSWORD_MIN_LOWERCASE_CHARS_ATTR_NAME,
	ZIMBRA_PASSWORD_MIN_NUMERIC_CHARS_ATTR_NAME,
	ZIMBRA_PASSWORD_MIN_PUNCTUATION_CHARS_ATTR_NAME,
	ZIMBRA_PASSWORD_MIN_UPPERCASE_CHARS_ATTR_NAME,
	INVALID_PASSWORD_ERR_CODE, PASSWORD_RECENTLY_USED_ERR_CODE
} from '../constants';
import { saveCredentials, setCookie } from '../utils';

export const submitChangePassword = (username, oldPassword, newPassword) => {
	return fetch('/service/soap/ChangePasswordRequest', {
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
						_content: username
					},
					oldPassword: {
						_content: oldPassword
					},
					password: {
						_content: newPassword
					},
					prefs: [{pref: {name: 'zimbraPrefMailPollingInterval'}}]
				}
			}
		})
	});
};

const ChangePasswordForm = ({isLoading, setIsLoading, username, configuration}) => {
	const [t] = useTranslation();

	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');
	const [showOldPasswordError, setShowOldPasswordError] = useState(false);
	const [errorLabelNewPassword, setErrorLabelNewPassword] = useState(false);
	const [errorLabelConfirmNewPassword, setErrorLabelConfirmNewPassword] = useState('');

	const onChangeOldPassword = useCallback(
		(ev) => setOldPassword(ev.target.value),
		[setOldPassword]);
	const onChangeNewPassword = useCallback(
		(ev) => setNewPassword(ev.target.value),
		[setNewPassword]);
	const onChangeConfirmNewPassword = useCallback(
		(ev) => setConfirmNewPassword(ev.target.value),
		[setConfirmNewPassword]);

	useEffect(() => {
		setErrorLabelNewPassword('');
		setErrorLabelConfirmNewPassword('');
	}, [newPassword, t]);

	useEffect(() => {
		if (newPassword && (confirmNewPassword !== newPassword)) {
			setErrorLabelConfirmNewPassword(
				t(
					'changePassword_error_confirmPassword', 'Confirm password not valid'
				)
			);
		}
		else {
			setErrorLabelConfirmNewPassword('');
		}
	}, [confirmNewPassword, newPassword, t]);

	const submitChangePasswordCb = useCallback((e) => {
		e.preventDefault();
		setIsLoading(true);
		if (newPassword && (confirmNewPassword === newPassword) && !errorLabelNewPassword) {
			submitChangePassword(username, oldPassword, newPassword)
				.then(async (res) => {
					const payload = await res.json();
					if (res.status === 200) {
						const authTokenArr = payload.Body.ChangePasswordResponse.authToken;
						const authToken = authTokenArr && authTokenArr.length > 0 ?
							authTokenArr[0]._content : undefined;
						if (authToken) {
							setCookie(ZM_AUTH_TOKEN, authToken);
						}
					}
					switch (res.status) {
						case 200:
							await saveCredentials(username, newPassword);
							window.location.assign(configuration.destinationUrl);
							break;
						case 401:
						case 500:
							if (payload.Body.Fault?.Detail?.Error?.Code === INVALID_PASSWORD_ERR_CODE) {
								setShowOldPasswordError(false);
								const {a} = payload.Body.Fault.Detail.Error;
								let currNum = a ?
									a.find(rec => (rec.n === ZIMBRA_PASSWORD_MAX_LENGTH_ATTR_NAME)) :
									undefined;
								if (currNum) {
									setErrorLabelNewPassword(
										t('changePassword_error_maxLength',
											{
												defaultValue: 'Maximum length is {{num}} characters',
												replace: {num: currNum._content}
											})
									);
									break;
								}

								currNum = a ?
									a.find(rec => rec.n === ZIMBRA_PASSWORD_MIN_LENGTH_ATTR_NAME) :
									undefined;
								if (currNum) {
									setErrorLabelNewPassword(
										t('changePassword_error_minLength', {
											defaultValue: 'Minimum length is {{num}} characters',
											replace: {num: currNum._content}
										})
									);
									break;
								}

								currNum = a ?
									a.find(rec => rec.n === ZIMBRA_PASSWORD_MIN_LOWERCASE_CHARS_ATTR_NAME) : undefined;
								if (currNum) {
									setErrorLabelNewPassword(
										t('changePassword_error_minLowerCaseChars',
											{
												defaultValue: 'Expecting at least {{num}} lowercase characters',
												replace: {num: currNum._content}
											})
									);
									break;
								}
								currNum = a ?
									a.find(rec => rec.n === ZIMBRA_PASSWORD_MIN_NUMERIC_CHARS_ATTR_NAME) : undefined;
								if (currNum) {
									setErrorLabelNewPassword(
										t('changePassword_error_minNumericChars',
											{
												defaultValue: 'Expecting at least {{num}} numeric characters',
												replace: {num: currNum._content}
											})
									);
									break;
								}
								currNum = a ?
									a.find(rec => rec.n === ZIMBRA_PASSWORD_MIN_PUNCTUATION_CHARS_ATTR_NAME) :
									undefined;
								if (currNum) {
									setErrorLabelNewPassword(
										t('changePassword_error_minPunctuationChars',
											{
												defaultValue: 'Expecting at least {{num}} punctuation characters',
												replace: {num: currNum._content}
											})
									);
									break;
								}
								currNum = a ?
									a.find(rec => rec.n === ZIMBRA_PASSWORD_MIN_UPPERCASE_CHARS_ATTR_NAME) :
									undefined;
								if (currNum) {
									setErrorLabelNewPassword(
										t('changePassword_error_minUppercaseChars',
											{
												defaultValue: 'Expecting at least {{num}} uppercase characters',
												replace: {num: currNum._content}
											})
									);
								}
							}
							else if(payload.Body.Fault?.Detail?.Error?.Code === PASSWORD_RECENTLY_USED_ERR_CODE) {
								setShowOldPasswordError(false);
								setErrorLabelNewPassword(
									t('changePassword_error_passwordRecentlyUsed',
										{
											defaultValue: 'Password recently used'
										})
								);
							}
							else {
								setShowOldPasswordError(true);
								setErrorLabelNewPassword('');
							}
							break;
						default:
							setShowOldPasswordError(false);
							setErrorLabelNewPassword(t('changePassword_error_minLowerCaseChars',
								{
									defaultValue: 'Expecting at least {{num}} lowercase characters',
									replace: {num: 6}
								}));
							setIsLoading(false);
					}
				})
				.catch((err) => {
					setIsLoading(false);
					if (err.message.startsWith('authentication failed')) {
						setShowOldPasswordError(true);
						setErrorLabelNewPassword('');
					}
				});
		}
		setIsLoading(false);
	}, [
		setIsLoading, newPassword, confirmNewPassword, errorLabelNewPassword, username, oldPassword,
		configuration.destinationUrl
	]);

	return (
		<form onSubmit={submitChangePasswordCb} style={{width: '100%', height: 'auto', maxHeight: 'unset'}}>
			<input type="submit" style={{display: 'none'}}/>
			<Row padding={{bottom: 'large'}}>
				<Text size="large" color="text" weight="bold">
					{t('changePassword_title', 'Create a new password')}
				</Text>
			</Row>
			<Row padding={{top: 'large'}}>
				<Input
					defaultValue={username}
					disabled
					label='Email'
				/>
			</Row>
			<Row padding={{top: 'large'}}>
				<PasswordInput
					defaultValue={oldPassword}
					hasError={showOldPasswordError}
					onChange={onChangeOldPassword}
					label={t('changePassword_oldPassword', 'Old password')}
					backgroundColor="gray5"
				/>
			</Row>
			{showOldPasswordError &&
			<Row padding={{top: 'extrasmall'}} mainAlignment="flex-start">
				<Text color="error" size="medium" overflow="break-word">
					{t('wrong_password', 'Wrong password, please check data and try again')}
				</Text>
			</Row>
			}
			<Row padding={{top: 'large'}}>
				<PasswordInput
					defaultValue={newPassword}
					hasError={errorLabelNewPassword}
					onChange={onChangeNewPassword}
					label={t('changePassword_newPassword', 'New password')}
					backgroundColor="gray5"
				/>
			</Row>
			{errorLabelNewPassword &&
			<Row padding={{top: 'extrasmall'}} mainAlignment="flex-start">
				<Text color="error" size="medium" overflow="break-word">
					{errorLabelNewPassword}
				</Text>
			</Row>
			}
			<Row padding={{top: 'large'}}>
				<PasswordInput
					defaultValue={confirmNewPassword}
					hasError={errorLabelConfirmNewPassword}
					onChange={onChangeConfirmNewPassword}
					label={t('changePassword_confirmNewPassword', 'Confirm new password')}
					backgroundColor="gray5"
				/>
			</Row>
			{errorLabelConfirmNewPassword &&
			<Row padding={{top: 'extrasmall'}} mainAlignment="flex-start">
				<Text color="error" size="medium" overflow="break-word">
					{errorLabelConfirmNewPassword}
				</Text>
			</Row>
			}
			<Row
				orientation="vertical"
				crossAlignment="flex-start"
				padding={{vertical: 'medium'}}
			>
				<Button
					onClick={submitChangePasswordCb}
					label={t('changePassword_confirm_label', 'Change password and login')}
					size="fill"
					loading={isLoading}
					disabled={!newPassword || confirmNewPassword !== newPassword || errorLabelNewPassword}
				/>
			</Row>
		</form>
	);
};

export default ChangePasswordForm;