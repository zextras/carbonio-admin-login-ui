/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { checkClassicUi } from '../services/login-page-services';
import { PasswordInput } from '../ui-components/components/PasswordInput';
import { isSafeRedirect, setCookie } from '../utils';

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
  loading = false,
}: CredentialsFormProps) => {
  const t = i18next.t.bind(i18next);
  const [username, setUsername] = useState(urlParams.get('username') || '');
  const [password, setPassword] = useState('');

  const submitUserPassword = useCallback(
    (e) => {
      e.preventDefault();
      if (username && password) {
        let usernameModified = username;
        if (urlParams.has('virtualacctdomain')) {
          usernameModified = `${usernameModified.replace('@', '.')}@${urlParams.get(
            'virtualacctdomain',
          )}`;
        } else if (urlParams.has('customerDomain') && !username.includes('@')) {
          usernameModified = `${usernameModified.trim()}@${urlParams.get('customerDomain')}`;
        }
        submitCredentials(usernameModified, password);
      }
    },
    [username, password, submitCredentials],
  );

  const samlButtonCbk = useCallback(() => {
    if (isSafeRedirect(configuration.destinationUrl)) {
      window.location.assign(
        `/zx/auth/startSamlWorkflow?redirectUrl=${configuration.destinationUrl}`,
      );
    } else {
      window.location.assign('/');
    }
  }, [configuration]);
  const samlButton = useMemo(() => {
    if (configuration?.authMethods?.includes('saml')) {
      return (
        <ds-button
          type="outlined"
          data-testid="loginSaml"
          label={t('login_saml', 'Login SAML')}
          color="primary"
          disabled={disableInputs}
          onClick={samlButtonCbk as (e: Event) => void}
          style={{ height: '36px' }}
        />
      );
    }
    return <div style={{ minHeight: '20px' }} />;
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0 var(--padding-size-large) 0',
          boxSizing: 'border-box',
        }}
      >
        <ds-input
           default-value={username}
           disabled={disableInputs}
           has-error={!!authError}
           data-testid="username"
           onChange={(e: CustomEvent<{ value: string }>) => setUsername(e.detail.value)}
           label={t('username', 'Username')}
         ></ds-input>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0 var(--padding-size-small) 0',
          boxSizing: 'border-box',
        }}
      >
        <PasswordInput
           defaultValue={password}
           disabled={disableInputs}
           data-testid="password"
           hasError={!!authError}
           onChange={(value: string) => setPassword(value)}
           label={t('password', 'Password')}
         />
      </div>
      <ds-text color="error" size="small" overflow="break-word">
        {authError || <br />}
      </ds-text>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'var(--padding-size-small) 0 var(--padding-size-large) 0',
          boxSizing: 'border-box',
        }}
      >
        <ds-button
          style={{ height: '36px' }}
          loading={loading}
          data-testid="login"
          onClick={submitUserPassword as (e: Event) => void}
          disabled={disableInputs}
          label={t('login', 'Login')}
          width="fill"
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 0 var(--padding-size-extralarge) 0',
          boxSizing: 'border-box',
        }}
      >
        {samlButton}
      </div>
    </form>
  );
};
