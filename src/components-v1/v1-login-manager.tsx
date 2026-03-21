/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './offline-modal';

import i18next from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';

import { postV1Login } from '../services/v1-service';
import { isSafeRedirect, saveCredentials } from '../utils';
import { type Configuration, CredentialsForm } from './credentials-form';

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
            if (isSafeRedirect(configuration.destinationUrl)) {
              window.location.assign(configuration?.destinationUrl);
            } else {
              window.location.assign('/');
            }
            break;
          case 401:
            setAuthError(
              t(
                'credentials_not_valid',
                'Credentials are not valid, please check data and try again',
              ),
            );
            setLoading(false);
            break;
          case 403:
            setAuthError(
              t(
                'auth_not_valid',
                'The authentication policy needs more steps: please contact your administrator for more information',
              ),
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
    [configuration?.destinationUrl, t],
  );

  const snackbarRef = useRef<HTMLElement>(null);
  const offlineModalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const snackbar = snackbarRef.current;
    if (!snackbar) return;

    const handleClose = () => setSnackbarNetworkError(false);
    const handleAction = () => setDetailNetworkModal(true);

    snackbar.addEventListener('snackbar:close', handleClose);
    snackbar.addEventListener('snackbar:action-click', handleAction);

    return () => {
      snackbar.removeEventListener('snackbar:close', handleClose);
      snackbar.removeEventListener('snackbar:action-click', handleAction);
    };
  }, []);

  useEffect(() => {
    const modal = offlineModalRef.current;
    if (!modal) return;

    const handleClose = () => setDetailNetworkModal(false);
    modal.addEventListener('offline-modal:close', handleClose);

    return () => {
      modal.removeEventListener('offline-modal:close', handleClose);
    };
  }, [setDetailNetworkModal]);

  return (
    <>
      <CredentialsForm
        configuration={configuration}
        disableInputs={disableInputs}
        authError={authError}
        submitCredentials={submitCredentials}
        loading={loading}
      />
      <ds-snackbar
        ref={snackbarRef}
        open={snackbarNetworkError}
        label={t('cant_login', 'Can not do the login now')}
        action-label={t('details', 'Details')}
        auto-hide-timeout={10000}
        severity="error"
      />
      <offline-modal ref={offlineModalRef} open={detailNetworkModal} />
    </>
  );
};
