/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { useCallback, useState } from 'react';

import { postV1Login } from '../services/v1-service';
import { Snackbar } from '../ui-components';
import { saveCredentials } from '../utils';
import { type Configuration, CredentialsForm } from './credentials-form';
import OfflineModal from './modals';

type V1LoginManagerProps = { configuration: Configuration; disableInputs: boolean };

export const V1LoginManager = ({ configuration, disableInputs }: V1LoginManagerProps) => {
	const t = i18next.t.bind(i18next);

	const [loading, setLoading] = useState(false);

	const [authError, setAuthError] = useState(false);

	const [snackbarNetworkError, setSnackbarNetworkError] = useState(false);
	const [detailNetworkModal, setDetailNetworkModal] = useState(false);

	const submitCredentials = useCallback(
		async (username: string, password: string) => {
			setLoading(true);
			try {
				const res = await postV1Login('password', username, password);
				switch (res.status) {
					case 200:
						await saveCredentials(username, password);
						window.location.assign(configuration?.destinationUrl ?? '');
						break;
					case 401:
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
						setAuthError(t('server_unreachable', 'Error 502: Service Unreachable - Retry later.'));
						setLoading(false);
						break;
					default:
						setSnackbarNetworkError(true);
						setLoading(false);
				}
			} catch {
				return setLoading(false);
			}
		},
		[configuration?.destinationUrl, t]
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
			<CredentialsForm
				configuration={configuration}
				disableInputs={disableInputs}
				authError={authError}
				submitCredentials={submitCredentials}
				loading={loading}
			/>
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
