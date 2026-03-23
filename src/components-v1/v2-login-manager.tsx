/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './offline-modal';

import i18next from 'i18next';
import { map } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

import { loginToCarbonioAdvancedAdmin, submitOtp } from '../services/v2-service';
import { saveCredentials } from '../utils';
import { type Configuration } from './credentials-form';

const formState = {
  credentials: 'credentials',
  waiting: 'waiting',
  twoFactor: 'two-factor',
  changePassword: 'change-password',
};

type OtpItemProp = { label: string; id: string };
type OtpItem = { label: string; value: string };

const mapOtpItems = (otpArray: Array<OtpItemProp>): Array<OtpItem> =>
  map(otpArray ?? [], (obj) => ({
    label: obj.label,
    value: obj.id,
  }));

type V2LoginManagerProps = { configuration: Configuration; disableInputs?: boolean };

export const V2LoginManager = ({ configuration, disableInputs }: V2LoginManagerProps) => {
  const t = i18next.t.bind(i18next);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [progress, setProgress] = useState(formState.credentials);

  const [authError, setAuthError] = useState<string | boolean>(false);
  const [showOtpError, setShowOtpError] = useState(false);

  const [otpList, setOtpList] = useState<Array<OtpItem>>([]);
  const [otpId, setOtpId] = useState('');
  const [otp, setOtp] = useState('');
  const onChangeOtp = useCallback(
    (ev: any) => {
      setOtp(ev.target.value);
    },
    [setOtp],
  );
  const [trustDevice, setTrustDevice] = useState(false);

  const [email, setEmail] = useState('');

  const [snackbarNetworkError, setSnackbarNetworkError] = useState(false);
  const [detailNetworkModal, setDetailNetworkModal] = useState(false);

  const credentialsFormRef = useRef<HTMLElement>(null);
  const offlineModalRef = useRef<HTMLElement>(null);

  const submitCredentials = useCallback(
    async (username: string, password: string) => {
      setLoadingCredentials(true);
      try {
        const res = await loginToCarbonioAdvancedAdmin(username, password);
        switch (res.status) {
          case 200:
            setEmail(username);
            if (res.redirected) {
              setProgress(formState.changePassword);
            } else {
              res.json().then(async (response) => {
                await saveCredentials(username, password);
                if (response?.['2FA'] === true) {
                  setOtpList(mapOtpItems(response?.otp));
                  setOtpId(response?.otp?.[0].id);
                  setProgress(formState.twoFactor);
                  setLoadingCredentials(false);
                } else {
                  globalThis.location.assign(configuration?.destinationUrl ?? '');
                }
              });
            }
            break;
          case 401:
            setAuthError(
              t(
                'credentials_not_valid',
                'Credentials are not valid, please check data and try again',
              ),
            );
            setLoadingCredentials(false);
            break;
          case 403:
            setAuthError(
              t(
                'auth_not_valid',
                'The authentication policy needs more steps: please contact your administrator for more information',
              ),
            );
            setLoadingCredentials(false);
            break;
          case 502:
            setAuthError(t('server_unreachable', 'Error 502: Service Unreachable - Retry later.'));
            setLoadingCredentials(false);
            break;
          default:
            setSnackbarNetworkError(true);
            setLoadingCredentials(false);
        }
      } catch {
        return setLoadingCredentials(false);
      }
    },
    [configuration?.destinationUrl, t],
  );

  useEffect(() => {
    const form = credentialsFormRef.current;
    if (!form) return;

    const handleCredentialsSubmit = (e: CustomEvent<{ username: string; password: string }>) => {
      submitCredentials(e.detail.username, e.detail.password);
    };
    form.addEventListener('credentials-submit', handleCredentialsSubmit as EventListener);

    return () => {
      form.removeEventListener('credentials-submit', handleCredentialsSubmit as EventListener);
    };
  }, [submitCredentials]);

  const submitOtpCb = useCallback(
    (e: any) => {
      e.preventDefault();
      setLoadingOtp(true);
      submitOtp(otpId, otp, trustDevice)
        .then((res) => {
          if (res.status === 200) {
            if (res.redirected) {
              setProgress(formState.changePassword);
            } else {
              globalThis.location.assign(configuration?.destinationUrl ?? '');
            }
          } else {
            setLoadingOtp(false);
            setShowOtpError(true);
          }
        })
        .catch(() => setLoadingOtp(false));
    },
    [otpId, otp, trustDevice, configuration?.destinationUrl],
  );

  const onSnackbarActionCbk = useCallback(
    () => setDetailNetworkModal(true),
    [setDetailNetworkModal],
  );
  const onCloseSnackbarCbk = useCallback(
    () => setSnackbarNetworkError(false),
    [setSnackbarNetworkError],
  );

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
      {progress === formState.credentials && (
        <credentials-form
          ref={credentialsFormRef}
          destination-url={configuration?.destinationUrl ?? ''}
          auth-methods={JSON.stringify(configuration?.authMethods ?? [])}
          disable-inputs={!!disableInputs}
          auth-error={typeof authError === 'string' ? authError : ''}
          loading={loadingCredentials}
        ></credentials-form>
      )}
      {progress === formState.waiting && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--padding-size-extralarge) 0',
            boxSizing: 'border-box',
          }}
        >
          <ds-spinner></ds-spinner>
        </div>
      )}
      {progress === formState.twoFactor && (
        <form onSubmit={submitOtpCb} style={{ width: '100%' }}>
          <input type="submit" style={{ display: 'none' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 0 var(--padding-size-large) 0',
              boxSizing: 'border-box',
            }}
          >
            <ds-text size="large" color="text" weight="bold">
              {t('two_step_authentication', 'Two-Step-Authentication')}
            </ds-text>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--padding-size-large) 0 0 0',
              boxSizing: 'border-box',
            }}
          >
            <ds-select
              items={otpList}
              label={t('choose_otp', 'Choose the OTP Method')}
              default-selection={otpList[0]}
              onChange={(e: CustomEvent<{ value: string; label: string }>) =>
                setOtpId(e.detail.value)
              }
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--padding-size-large) 0 0 0',
              boxSizing: 'border-box',
            }}
          >
            <ds-input
              defaultValue={otp}
              has-error={showOtpError}
              disabled={disableInputs}
              onChange={onChangeOtp}
              label={t('type_otp', 'Type here One-Time-Password')}
            ></ds-input>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: 'var(--padding-size-extrasmall) 0 0 0',
              boxSizing: 'border-box',
            }}
          >
            <ds-text color="error" size="small" overflow="break-word">
              {showOtpError &&
                t('wrong_password', 'Wrong password, please check data and try again')}
              {!showOtpError && <br />}
            </ds-text>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: 'var(--padding-size-small) 0',
              boxSizing: 'border-box',
            }}
          >
            <ds-button
              onClick={submitOtpCb as (e: Event) => void}
              disabled={disableInputs}
              label={t('login', 'Login')}
              width="fill"
              loading={loadingOtp}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              boxSizing: 'border-box',
            }}
          >
            <ds-checkbox
              value={trustDevice}
              label={t('trust_device_and_ip', 'Trust this device and IP address')}
              onChange={(e: CustomEvent<{ value: boolean }>) => setTrustDevice(e.detail.value)}
            />
          </div>
        </form>
      )}
      {progress === formState.changePassword && (
        <change-password-form
          username={email}
          destination-url={configuration?.destinationUrl ?? ''}
        ></change-password-form>
      )}
      <ds-snackbar
        open={snackbarNetworkError}
        label={t('cant_login', 'Can not do the login now')}
        actionLabel={t('details', 'Details')}
        onActionClick={onSnackbarActionCbk}
        onClose={onCloseSnackbarCbk}
        autoHideTimeout={10000}
        severity="error"
      />
      <offline-modal ref={offlineModalRef} open={detailNetworkModal} />
    </>
  );
};
