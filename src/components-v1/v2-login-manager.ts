/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './offline-modal';
import '../ui-components/ds-text';
import '../ui-components/ds-button';
import '../ui-components/ds-checkbox';
import './change-password-form';
import '../ui-components/ds-snackbar';
import './credentials-form';
import '../ui-components/ds-select';
import '../ui-components/ds-input';

import i18next from 'i18next';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { loginToCarbonioAdvancedAdmin, submitOtp } from '../services/v2-service';
import { saveCredentials } from '../utils';

const FORM_STATE = {
  credentials: 'credentials',
  waiting: 'waiting',
  twoFactor: 'two-factor',
  changePassword: 'change-password',
} as const;

type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE];

type OtpItemProp = { label: string; id: string };
type OtpItem = { label: string; value: string };

const mapOtpItems = (otpArray: Array<OtpItemProp>): Array<OtpItem> =>
  (otpArray ?? []).map((obj) => ({
    label: obj.label,
    value: obj.id,
  }));

@customElement('v2-login-manager')
export class V2LoginManager extends LitElement {
  @property({ type: String, attribute: 'destination-url' })
  accessor destinationUrl = '';

  @property({ type: Array })
  accessor authMethods: Array<string> = [];

  @property({ type: Boolean, attribute: 'disable-inputs' })
  accessor disableInputs = false;

  @state()
  private accessor loadingCredentials = false;

  @state()
  private accessor loadingOtp = false;

  @state()
  private accessor progress: FormState = FORM_STATE.credentials;

  @state()
  private accessor authError: string | boolean = false;

  @state()
  private accessor showOtpError = false;

  @state()
  private accessor otpList: Array<OtpItem> = [];

  @state()
  private accessor otpId = '';

  @state()
  private accessor otp = '';

  @state()
  private accessor trustDevice = false;

  @state()
  private accessor email = '';

  @state()
  private accessor snackbarNetworkError = false;

  @state()
  private accessor detailNetworkModal = false;

  private readonly handleSubmitCredentials = async (e: Event): Promise<void> => {
    const { username, password } = (e as CustomEvent<{ username: string; password: string }>)
      .detail;

    this.loadingCredentials = true;
    try {
      const res = await loginToCarbonioAdvancedAdmin(username, password);
      switch (res.status) {
        case 200:
          this.email = username;
          if (res.redirected) {
            this.progress = FORM_STATE.changePassword;
          } else {
            res.json().then(async (response) => {
              await saveCredentials(username, password);
              if (response?.['2FA'] === true) {
                this.otpList = mapOtpItems(response?.otp);
                this.otpId = response?.otp?.[0]?.id ?? '';
                this.progress = FORM_STATE.twoFactor;
                this.loadingCredentials = false;
              } else {
                globalThis.location.assign(this.destinationUrl ?? '');
              }
            });
          }
          break;
        case 401:
          this.authError = i18next.t(
            'credentials_not_valid',
            'Credentials are not valid, please check data and try again',
          );
          this.loadingCredentials = false;
          break;
        case 403:
          this.authError = i18next.t(
            'auth_not_valid',
            'The authentication policy needs more steps: please contact your administrator for more information',
          );
          this.loadingCredentials = false;
          break;
        case 502:
          this.authError = i18next.t(
            'server_unreachable',
            'Error 502: Service Unreachable - Retry later.',
          );
          this.loadingCredentials = false;
          break;
        default:
          this.snackbarNetworkError = true;
          this.loadingCredentials = false;
      }
    } catch {
      this.loadingCredentials = false;
    }
  };

  private readonly handleSubmitOtp = (e: Event): void => {
    e.preventDefault();
    this.loadingOtp = true;
    submitOtp(this.otpId, this.otp, this.trustDevice)
      .then((res) => {
        if (res.status === 200) {
          if (res.redirected) {
            this.progress = FORM_STATE.changePassword;
          } else {
            globalThis.location.assign(this.destinationUrl ?? '');
          }
        } else {
          this.loadingOtp = false;
          this.showOtpError = true;
        }
      })
      .catch(() => {
        this.loadingOtp = false;
      });
  };

  private readonly handleOtpChange = (e: Event): void => {
    const { value } = (e as CustomEvent<{ value: string }>).detail;
    this.otp = value;
  };

  private readonly handleOtpMethodChange = (e: Event): void => {
    const { value } = (e as CustomEvent<{ value: string; label: string }>).detail;
    this.otpId = value;
  };

  private readonly handleTrustDeviceChange = (e: Event): void => {
    const { value } = (e as CustomEvent<{ value: boolean }>).detail;
    this.trustDevice = value;
  };

  private readonly handleSnackbarAction = (): void => {
    this.detailNetworkModal = true;
  };

  private readonly handleSnackbarClose = (): void => {
    this.snackbarNetworkError = false;
  };

  private readonly handleOfflineModalClose = (): void => {
    this.detailNetworkModal = false;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('credentials-submit', this.handleSubmitCredentials);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('credentials-submit', this.handleSubmitCredentials);
  }

  private renderCredentialsForm(): TemplateResult {
    return html`
      <credentials-form
        destination-url=${this.destinationUrl}
        .authMethods=${this.authMethods}
        ?disable-inputs=${this.disableInputs}
        auth-error=${typeof this.authError === 'string' ? this.authError : ''}
        ?loading=${this.loadingCredentials}
      ></credentials-form>
    `;
  }

  private renderWaiting(): TemplateResult {
    return html`
      <div
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--padding-size-extralarge) 0; box-sizing: border-box"
      >
        <ds-spinner></ds-spinner>
      </div>
    `;
  }

  private renderTwoFactorForm(): TemplateResult {
    return html`
      <form @submit=${this.handleSubmitOtp} style="width: 100%">
        <input type="submit" style="display: none" />
        <div
          style="display: flex; align-items: center; justify-content: center; padding: 0 0 var(--padding-size-large) 0; box-sizing: border-box"
        >
          <ds-text as="h1" size="large" color="text" weight="bold">
            ${i18next.t('two_step_authentication', 'Two-Step-Authentication')}
          </ds-text>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: center; padding: var(--padding-size-large) 0 0 0; box-sizing: border-box"
        >
          <ds-select
            .items=${this.otpList}
            label=${i18next.t('choose_otp', 'Choose the OTP Method')}
            .defaultSelection=${this.otpList[0]}
            @change=${this.handleOtpMethodChange}
          ></ds-select>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: center; padding: var(--padding-size-large) 0 0 0; box-sizing: border-box"
        >
          <ds-input
            default-value=${this.otp}
            ?has-error=${this.showOtpError}
            ?disabled=${this.disableInputs}
            @change=${this.handleOtpChange}
            label=${i18next.t('type_otp', 'Type here One-Time-Password')}
          ></ds-input>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: flex-start; padding: var(--padding-size-extrasmall) 0 0 0; box-sizing: border-box"
        >
          <ds-text as="span" color="error" size="small" overflow="break-word">
            ${this.showOtpError
              ? i18next.t('wrong_password', 'Wrong password, please check data and try again')
              : html`<br />`}
          </ds-text>
        </div>
        <div
          style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: var(--padding-size-small) 0; box-sizing: border-box"
        >
          <ds-button
            @click=${this.handleSubmitOtp}
            ?disabled=${this.disableInputs}
            label=${i18next.t('login', 'Login')}
            width="fill"
            ?loading=${this.loadingOtp}
          ></ds-button>
        </div>
        <div
          style="display: flex; align-items: center; justify-content: flex-start; box-sizing: border-box"
        >
          <ds-checkbox
            .value=${this.trustDevice}
            label=${i18next.t('trust_device_and_ip', 'Trust this device and IP address')}
            @change=${this.handleTrustDeviceChange}
          ></ds-checkbox>
        </div>
      </form>
    `;
  }

  private renderChangePasswordForm(): TemplateResult {
    return html`
      <change-password-form
        username=${this.email}
        destination-url=${this.destinationUrl}
      ></change-password-form>
    `;
  }

  private renderSnackbar(): TemplateResult {
    const t = i18next.t.bind(i18next);
    return html`
      <ds-snackbar
        ?open=${this.snackbarNetworkError}
        label=${i18next.t('cant_login', 'Can not do the login now')}
        action-label=${t('details', 'Details')}
        @action-click=${this.handleSnackbarAction}
        @close=${this.handleSnackbarClose}
        auto-hide-timeout=${10000}
        severity="error"
      ></ds-snackbar>
    `;
  }

  private renderOfflineModal(): TemplateResult {
    return html`
      <offline-modal
        ?open=${this.detailNetworkModal}
        @offline-modal:close=${this.handleOfflineModalClose}
      ></offline-modal>
    `;
  }

  override render(): TemplateResult {
    let content: TemplateResult;

    switch (this.progress) {
      case FORM_STATE.credentials:
        content = this.renderCredentialsForm();
        break;
      case FORM_STATE.waiting:
        content = this.renderWaiting();
        break;
      case FORM_STATE.twoFactor:
        content = this.renderTwoFactorForm();
        break;
      case FORM_STATE.changePassword:
        content = this.renderChangePasswordForm();
        break;
      default:
        content = html``;
    }

    return html` ${content} ${this.renderSnackbar()} ${this.renderOfflineModal()} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'v2-login-manager': V2LoginManager;
  }
}
