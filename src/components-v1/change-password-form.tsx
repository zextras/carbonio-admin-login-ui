/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { useCallback, useEffect, useState } from 'react';

import {
  BLOCK_COMMON_WORDS_IN_PASSWORD_POLICY,
  BLOCK_PERSONAL_DATA_IN_PASSWORD_POLICY,
  INVALID_PASSWORD_ERR_CODE,
  PASSWORD_LOCKED,
  PASSWORD_RECENTLY_USED_ERR_CODE,
  ZIMBRA_PASSWORD_MAX_LENGTH_ATTR_NAME,
  ZIMBRA_PASSWORD_MIN_DIGITS_OR_PUNCS,
  ZIMBRA_PASSWORD_MIN_LENGTH_ATTR_NAME,
  ZIMBRA_PASSWORD_MIN_LOWERCASE_CHARS_ATTR_NAME,
  ZIMBRA_PASSWORD_MIN_NUMERIC_CHARS_ATTR_NAME,
  ZIMBRA_PASSWORD_MIN_PUNCTUATION_CHARS_ATTR_NAME,
  ZIMBRA_PASSWORD_MIN_UPPERCASE_CHARS_ATTR_NAME,
  ZM_AUTH_TOKEN,
} from '../constants';
import '../ui-components/web-components/ds-input';

import { PasswordInput } from '../ui-components/components/PasswordInput';
import { isSafeRedirect, saveCredentials, setCookie } from '../utils';

export const submitChangePassword = (
  username: string,
  oldPassword: string,
  newPassword: string,
) => {
  return fetch('/service/admin/soap/ChangePasswordRequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
    body: JSON.stringify({
      Body: {
        ChangePasswordRequest: {
          _jsns: 'urn:zimbraAccount',
          csrfTokenSecured: '0',
          persistAuthTokenCookie: '1',
          account: {
            by: 'name',
            _content: username,
          },
          oldPassword: {
            _content: oldPassword,
          },
          password: {
            _content: newPassword,
          },
          prefs: [{ pref: { name: 'zimbraPrefMailPollingInterval' } }],
        },
      },
    }),
  });
};

const ChangePasswordForm = ({ isLoading, setIsLoading, username, configuration }: any) => {
  const t = i18next.t.bind(i18next);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPasswordError, setShowOldPasswordError] = useState(false);
  const [errorLabelNewPassword, setErrorLabelNewPassword] = useState<string | false>(false);
  const [errorLabelConfirmNewPassword, setErrorLabelConfirmNewPassword] = useState('');

  const onChangeOldPassword = useCallback(
    (ev) => setOldPassword(ev.target.value),
    [setOldPassword],
  );
  const onChangeNewPassword = useCallback(
    (ev) => setNewPassword(ev.target.value),
    [setNewPassword],
  );
  const onChangeConfirmNewPassword = useCallback(
    (ev) => setConfirmNewPassword(ev.target.value),
    [setConfirmNewPassword],
  );

  useEffect(() => {
    setErrorLabelNewPassword('');
    setErrorLabelConfirmNewPassword('');
  }, [newPassword, t]);

  useEffect(() => {
    if (newPassword && confirmNewPassword !== newPassword) {
      setErrorLabelConfirmNewPassword(
        t('changePassword_error_confirmPassword', 'Confirm password not valid'),
      );
    } else {
      setErrorLabelConfirmNewPassword('');
    }
  }, [confirmNewPassword, newPassword, t]);

  const submitChangePasswordCb = useCallback(
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      if (newPassword && confirmNewPassword === newPassword && !errorLabelNewPassword) {
        submitChangePassword(username, oldPassword, newPassword)
          .then(async (res) => {
            let payload;
            try {
              payload = await res.json();
            } catch {
              payload = res;
            }
            if (res.status === 200) {
              const authTokenArr = payload?.Body?.ChangePasswordResponse?.authToken;
              const authToken =
                authTokenArr && authTokenArr.length > 0 ? authTokenArr[0]._content : undefined;
              if (authToken) {
                setCookie(ZM_AUTH_TOKEN, authToken);
              }
            }
            switch (res.status) {
              case 200:
                await saveCredentials(username, newPassword);
                if (isSafeRedirect(configuration.destination)) {
                  window.location.assign(configuration.destination);
                } else {
                  window.location.assign('/');
                }
                break;
              case 401:
              case 500:
                if (payload?.Body?.Fault?.Detail?.Error?.Code === INVALID_PASSWORD_ERR_CODE) {
                  setShowOldPasswordError(false);
                  const { a } = payload.Body.Fault.Detail.Error;
                  let currNum = a
                    ? a.find((rec: any) => rec.n === BLOCK_COMMON_WORDS_IN_PASSWORD_POLICY)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_block_common_words', {
                        defaultValue:
                          'Invalid password: password is known to be too common: {{str}}',
                        replace: { str: currNum._content },
                      }),
                    );
                    break;
                  }
                  currNum = a
                    ? a.find((rec: any) => rec.n === BLOCK_PERSONAL_DATA_IN_PASSWORD_POLICY)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_block_personal_data', {
                        defaultValue:
                          'Invalid password: password contains username or other personal data: {{str}}',
                        replace: { str: currNum._content },
                      }),
                    );
                    break;
                  }
                  currNum = a
                    ? a.find((rec: any) => rec.n === ZIMBRA_PASSWORD_MAX_LENGTH_ATTR_NAME)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_maxLength', {
                        defaultValue: 'Maximum length is {{num}} characters',
                        replace: { num: currNum._content },
                      }),
                    );
                    break;
                  }

                  currNum = a
                    ? a.find((rec: any) => rec.n === ZIMBRA_PASSWORD_MIN_LENGTH_ATTR_NAME)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_minLength', {
                        defaultValue: 'Minimum length is {{num}} characters',
                        replace: { num: currNum._content },
                      }),
                    );
                    break;
                  }

                  currNum = a
                    ? a.find((rec: any) => rec.n === ZIMBRA_PASSWORD_MIN_LOWERCASE_CHARS_ATTR_NAME)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_minLowerCaseChars', {
                        defaultValue: 'Expecting at least {{num}} lowercase characters',
                        replace: { num: currNum._content },
                      }),
                    );
                    break;
                  }
                  currNum = a
                    ? a.find((rec: any) => rec.n === ZIMBRA_PASSWORD_MIN_NUMERIC_CHARS_ATTR_NAME)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_minNumericChars', {
                        defaultValue: 'Expecting at least {{num}} numeric characters',
                        replace: { num: currNum._content },
                      }),
                    );
                    break;
                  }
                  currNum = a
                    ? a.find(
                        (rec: any) => rec.n === ZIMBRA_PASSWORD_MIN_PUNCTUATION_CHARS_ATTR_NAME,
                      )
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_minPunctuationChars', {
                        defaultValue: 'Expecting at least {{num}} punctuation characters',
                        replace: { num: currNum._content },
                      }),
                    );
                    break;
                  }
                  currNum = a
                    ? a.find((rec: any) => rec.n === ZIMBRA_PASSWORD_MIN_UPPERCASE_CHARS_ATTR_NAME)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_minUppercaseChars', {
                        defaultValue: 'Expecting at least {{num}} uppercase characters',
                        replace: { num: currNum._content },
                      }),
                    );
                  }
                  currNum = a
                    ? a.find((rec: any) => rec.n === ZIMBRA_PASSWORD_MIN_DIGITS_OR_PUNCS)
                    : undefined;
                  if (currNum) {
                    setErrorLabelNewPassword(
                      t('changePassword_error_minDigitsOrPuncs', {
                        defaultValue:
                          'Expecting at least {{num}} numeric or punctuation characters',
                        replace: { num: currNum._content },
                      }),
                    );
                  }
                } else if (payload?.Body?.Fault?.Detail?.Error?.Code === PASSWORD_LOCKED) {
                  setShowOldPasswordError(false);
                  setErrorLabelNewPassword(
                    t('changePassword_error_passwordLocked', {
                      defaultValue: "Password is locked and can't be changed",
                    }),
                  );
                } else if (
                  payload?.Body?.Fault?.Detail?.Error?.Code === PASSWORD_RECENTLY_USED_ERR_CODE
                ) {
                  setShowOldPasswordError(false);
                  setErrorLabelNewPassword(
                    t('changePassword_error_passwordRecentlyUsed', {
                      defaultValue: 'Password recently used',
                    }),
                  );
                } else {
                  setShowOldPasswordError(true);
                  setErrorLabelNewPassword('');
                }
                break;
              case 502:
                setShowOldPasswordError(false);
                setErrorLabelNewPassword(
                  t('server_unreachable', 'Error 502: Service Unreachable - Retry later.'),
                );
                setIsLoading(false);
                break;
              default:
                setShowOldPasswordError(false);
                setErrorLabelNewPassword(
                  t('changePassword_error_minLowerCaseChars', {
                    defaultValue: 'Expecting at least {{num}} lowercase characters',
                    replace: { num: 6 },
                  }),
                );
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
    },
    [
      t,
      setIsLoading,
      newPassword,
      confirmNewPassword,
      errorLabelNewPassword,
      username,
      oldPassword,
      configuration.destinationUrl,
    ],
  );

  return (
    <form
      onSubmit={submitChangePasswordCb}
      style={{ width: '100%', height: 'auto', maxHeight: 'unset' }}
    >
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
          {t('changePassword_title', 'Create a new password')}
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
        <ds-input
          default-value={username}
          disabled
          label="Email"
          data-testid="email"
        ></ds-input>
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
        <PasswordInput
          defaultValue={oldPassword}
          hasError={showOldPasswordError}
          onChange={onChangeOldPassword}
          label={t('changePassword_oldPassword', 'Old password')}
          data-testid="oldPassword"
        />
      </div>
      {showOldPasswordError && (
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
            {t('wrong_password', 'Wrong password, please check data and try again')}
          </ds-text>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--padding-size-large) 0 0 0',
          boxSizing: 'border-box',
        }}
      >
        <PasswordInput
          defaultValue={newPassword}
          hasError={!!errorLabelNewPassword}
          onChange={onChangeNewPassword}
          label={t('changePassword_newPassword', 'New password')}
          data-testid="newPassword"
        />
      </div>
      {errorLabelNewPassword && (
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
            {errorLabelNewPassword}
          </ds-text>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--padding-size-large) 0 0 0',
          boxSizing: 'border-box',
        }}
      >
        <PasswordInput
          defaultValue={confirmNewPassword}
          hasError={!!errorLabelConfirmNewPassword}
          onChange={onChangeConfirmNewPassword}
          label={t('changePassword_confirmNewPassword', 'Confirm new password')}
          data-testid="confirmNewPassword"
        />
      </div>
      {errorLabelConfirmNewPassword && (
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
            {errorLabelConfirmNewPassword}
          </ds-text>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'var(--padding-size-medium) 0',
          boxSizing: 'border-box',
        }}
      >
        <ds-button
          onClick={submitChangePasswordCb as (e: Event) => void}
          label={t('changePassword_confirm_label', 'Change password and login')}
          width="fill"
          loading={isLoading}
          disabled={!newPassword || confirmNewPassword !== newPassword || !!errorLabelNewPassword}
          data-testid="submitChangePasswordBtn"
        />
      </div>
    </form>
  );
};

export default ChangePasswordForm;
