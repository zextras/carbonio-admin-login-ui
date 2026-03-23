/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../ui-components/web-components/ds-input';
import '../ui-components/web-components/ds-password-input';

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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
import { submitChangePassword } from '../services/change-password';
import { isSafeRedirect, saveCredentials, setCookie } from '../utils';

type PasswordErrorAttribute = {
  n: string;
  _content: string;
};

type PasswordErrorPayload = {
  Body?: {
    Fault?: {
      Detail?: {
        Error?: {
          Code?: string;
          a?: Array<PasswordErrorAttribute>;
        };
      };
    };
  };
};

@customElement('change-password-form')
export class ChangePasswordForm extends LitElement {
  @property({ type: String })
  accessor username = '';

  @property({ type: String, attribute: 'destination-url' })
  accessor destinationUrl = '';

  @state()
  private accessor loading = false;

  @state()
  private accessor oldPassword = '';

  @state()
  private accessor newPassword = '';

  @state()
  private accessor confirmNewPassword = '';

  @state()
  private accessor showOldPasswordError = false;

  @state()
  private accessor errorLabelNewPassword = '';

  @state()
  private accessor errorLabelConfirmNewPassword = '';

  private handleSubmit(e: Event): void {
    e.preventDefault();
    this.loading = true;

    if (this.newPassword && this.confirmNewPassword === this.newPassword && !this.errorLabelNewPassword) {
      submitChangePassword(this.username, this.oldPassword, this.newPassword)
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
              await saveCredentials(this.username, this.newPassword);
              if (isSafeRedirect(this.destinationUrl)) {
                window.location.assign(this.destinationUrl);
              } else {
                window.location.assign('/');
              }
              break;
            case 401:
            case 500:
              this.handlePasswordError(payload);
              break;
            case 502:
              this.showOldPasswordError = false;
              this.errorLabelNewPassword = i18next.t(
                'server_unreachable',
                'Error 502: Service Unreachable - Retry later.',
              );
              this.loading = false;
              break;
            default:
              this.showOldPasswordError = false;
              this.errorLabelNewPassword = i18next.t(
                'changePassword_error_minLowerCaseChars',
                {
                  defaultValue: 'Expecting at least {{num}} lowercase characters',
                  replace: { num: 6 },
                },
              );
              this.loading = false;
          }
        })
        .catch((err) => {
          this.loading = false;
          if (err.message.startsWith('authentication failed')) {
            this.showOldPasswordError = true;
            this.errorLabelNewPassword = '';
          }
        });
    }
    this.loading = false;
  }

  private handlePasswordError(payload: PasswordErrorPayload): void {
    const t = i18next.t.bind(i18next);
    if (payload?.Body?.Fault?.Detail?.Error?.Code === INVALID_PASSWORD_ERR_CODE) {
      this.showOldPasswordError = false;
      const { a } = payload.Body.Fault.Detail.Error;
      let currNum = a
        ? a.find((rec) => rec.n === BLOCK_COMMON_WORDS_IN_PASSWORD_POLICY)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_block_common_words', {
          defaultValue: 'Invalid password: password is known to be too common: {{str}}',
          replace: { str: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === BLOCK_PERSONAL_DATA_IN_PASSWORD_POLICY)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_block_personal_data', {
          defaultValue:
            'Invalid password: password contains username or other personal data: {{str}}',
          replace: { str: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MAX_LENGTH_ATTR_NAME)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_maxLength', {
          defaultValue: 'Maximum length is {{num}} characters',
          replace: { num: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MIN_LENGTH_ATTR_NAME)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_minLength', {
          defaultValue: 'Minimum length is {{num}} characters',
          replace: { num: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MIN_LOWERCASE_CHARS_ATTR_NAME)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_minLowerCaseChars', {
          defaultValue: 'Expecting at least {{num}} lowercase characters',
          replace: { num: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MIN_NUMERIC_CHARS_ATTR_NAME)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_minNumericChars', {
          defaultValue: 'Expecting at least {{num}} numeric characters',
          replace: { num: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MIN_PUNCTUATION_CHARS_ATTR_NAME)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_minPunctuationChars', {
          defaultValue: 'Expecting at least {{num}} punctuation characters',
          replace: { num: currNum._content },
        });
        return;
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MIN_UPPERCASE_CHARS_ATTR_NAME)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_minUppercaseChars', {
          defaultValue: 'Expecting at least {{num}} uppercase characters',
          replace: { num: currNum._content },
        });
      }
      currNum = a
        ? a.find((rec) => rec.n === ZIMBRA_PASSWORD_MIN_DIGITS_OR_PUNCS)
        : undefined;
      if (currNum) {
        this.errorLabelNewPassword = t('changePassword_error_minDigitsOrPuncs', {
          defaultValue: 'Expecting at least {{num}} numeric or punctuation characters',
          replace: { num: currNum._content },
        });
      }
    } else if (payload?.Body?.Fault?.Detail?.Error?.Code === PASSWORD_LOCKED) {
      this.showOldPasswordError = false;
      this.errorLabelNewPassword = t('changePassword_error_passwordLocked', {
        defaultValue: "Password is locked and can't be changed",
      });
    } else if (payload?.Body?.Fault?.Detail?.Error?.Code === PASSWORD_RECENTLY_USED_ERR_CODE) {
      this.showOldPasswordError = false;
      this.errorLabelNewPassword = t('changePassword_error_passwordRecentlyUsed', {
        defaultValue: 'Password recently used',
      });
    } else {
      this.showOldPasswordError = true;
      this.errorLabelNewPassword = '';
    }
  }

  private handleOldPasswordChange(e: CustomEvent<{ value: string }>): void {
    this.oldPassword = e.detail.value;
  }

  private handleNewPasswordChange(e: CustomEvent<{ value: string }>): void {
    this.newPassword = e.detail.value;
    this.errorLabelNewPassword = '';
    this.errorLabelConfirmNewPassword = '';
  }

  private handleConfirmPasswordChange(e: CustomEvent<{ value: string }>): void {
    this.confirmNewPassword = e.detail.value;
  }

  override render(): TemplateResult {
    const t = i18next.t.bind(i18next);

    if (this.confirmNewPassword && this.confirmNewPassword !== this.newPassword) {
      this.errorLabelConfirmNewPassword = t(
        'changePassword_error_confirmPassword',
        'Confirm password not valid',
      );
    }

    return html`
      <form @submit=${this.handleSubmit} style="width: 100%; height: auto; max-height: unset">
        <input type="submit" style="display: none" />
        <div
          style="display: flex; align-items: center; justify-content: center; padding: 0 0 var(--padding-size-large) 0; box-sizing: border-box"
        >
          <ds-text size="large" color="text" weight="bold">
            ${t('changePassword_title', 'Create a new password')}
          </ds-text>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: center; padding: var(--padding-size-large) 0 0 0; box-sizing: border-box"
        >
          <ds-input
            default-value=${this.username}
            disabled
            label="Email"
            data-testid="email"
          ></ds-input>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: center; padding: var(--padding-size-large) 0 0 0; box-sizing: border-box"
        >
          <ds-password-input
            default-value=${this.oldPassword}
            ?has-error=${this.showOldPasswordError}
            @change=${this.handleOldPasswordChange}
            label=${t('changePassword_oldPassword', 'Old password')}
            data-testid="oldPassword"
          ></ds-password-input>
        </div>
        ${this.showOldPasswordError
          ? html`
              <div
                style="display: flex; align-items: center; justify-content: flex-start; padding: var(--padding-size-extrasmall) 0 0 0; box-sizing: border-box"
              >
                <ds-text color="error" size="small" overflow="break-word">
                  ${t('wrong_password', 'Wrong password, please check data and try again')}
                </ds-text>
              </div>
            `
          : ''}
        <div
          style="display: flex; align-items: center; justify-content: center; padding: var(--padding-size-large) 0 0 0; box-sizing: border-box"
        >
          <ds-password-input
            default-value=${this.newPassword}
            ?has-error=${!!this.errorLabelNewPassword}
            @change=${this.handleNewPasswordChange}
            label=${t('changePassword_newPassword', 'New password')}
            data-testid="newPassword"
          ></ds-password-input>
        </div>
        ${this.errorLabelNewPassword
          ? html`
              <div
                style="display: flex; align-items: center; justify-content: flex-start; padding: var(--padding-size-extrasmall) 0 0 0; box-sizing: border-box"
              >
                <ds-text color="error" size="small" overflow="break-word">
                  ${this.errorLabelNewPassword}
                </ds-text>
              </div>
            `
          : ''}
        <div
          style="display: flex; align-items: center; justify-content: center; padding: var(--padding-size-large) 0 0 0; box-sizing: border-box"
        >
          <ds-password-input
            default-value=${this.confirmNewPassword}
            ?has-error=${!!this.errorLabelConfirmNewPassword}
            @change=${this.handleConfirmPasswordChange}
            label=${t('changePassword_confirmNewPassword', 'Confirm new password')}
            data-testid="confirmNewPassword"
          ></ds-password-input>
        </div>
        ${this.errorLabelConfirmNewPassword
          ? html`
              <div
                style="display: flex; align-items: center; justify-content: flex-start; padding: var(--padding-size-extrasmall) 0 0 0; box-sizing: border-box"
              >
                <ds-text color="error" size="small" overflow="break-word">
                  ${this.errorLabelConfirmNewPassword}
                </ds-text>
              </div>
            `
          : ''}
        <div
          style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: var(--padding-size-medium) 0; box-sizing: border-box"
        >
          <ds-button
            @click=${this.handleSubmit}
            label=${t('changePassword_confirm_label', 'Change password and login')}
            width="fill"
            ?loading=${this.loading}
            ?disabled=${!this.newPassword ||
            this.confirmNewPassword !== this.newPassword ||
            !!this.errorLabelNewPassword}
            data-testid="submitChangePasswordBtn"
          ></ds-button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'change-password-form': ChangePasswordForm;
  }
}
