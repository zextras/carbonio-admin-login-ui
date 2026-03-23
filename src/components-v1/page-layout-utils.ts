/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TFunction } from 'i18next';

import logoCarbonio from '../assets/carbonio-admin-panel.svg';
import { CARBONIO_LOGO_URL } from '../constants';
import type { GetLoginConfigResponse } from '../services/login-page-services';

export type Logo = { image: string; width: string; url?: string };

type ConfigBasicSettingsProps = {
  res: { loginPageBackgroundImage?: string };
  setBg: (bg: string) => void;
  setIsDefaultBg: (isDefault: boolean) => void;
};

export function configureBasicSettings({ res, setBg, setIsDefaultBg }: ConfigBasicSettingsProps): void {
  if (res.loginPageBackgroundImage) {
    setBg(res.loginPageBackgroundImage);
    setIsDefaultBg(false);
  }
}

export function createLogoObject(res: GetLoginConfigResponse): Logo {
  const logoObj: Logo = { image: logoCarbonio, width: '221px', url: '' };

  if (res.loginPageLogo) {
    logoObj.image = res.loginPageLogo;
    logoObj.width = '100%';
  }

  if (res.loginPageSkinLogoUrl) {
    logoObj.url = res.loginPageSkinLogoUrl;
  }

  return logoObj;
}

export function setDocumentTitle(res: GetLoginConfigResponse, t: TFunction): void {
  if (res.loginPageTitle) {
    document.title = res.loginPageTitle;
  } else {
    document.title = t('carbonio_authentication', 'Carbonio Authentication');
  }
}

export function setFavicon(faviconUrl: string): void {
  const link = (document.querySelector("link[rel*='icon']") ||
    document.createElement('link')) as HTMLLinkElement;
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
}

type ApplyV3CustomizationProps = {
  res: GetLoginConfigResponse;
  logo: Logo;
  setBg: (bg: string) => void;
  setIsDefaultBg: (isDefault: boolean) => void;
  setCopyrightBanner: (banner: string) => void;
};

export function applyV3Customization({
  res,
  logo,
  setBg,
  setIsDefaultBg,
  setCopyrightBanner,
}: ApplyV3CustomizationProps): Logo {
  if (res.carbonioAdminUiTitle) {
    document.title = res.carbonioAdminUiTitle;
  }
  if (res.carbonioAdminUiFavicon) {
    setFavicon(res.carbonioAdminUiFavicon);
  }

  const updatedLogo: Logo = { ...logo };

  if (res?.carbonioAdminUiBackground) {
    setBg(res.carbonioAdminUiBackground);
    setIsDefaultBg(false);
  }

  if (res?.carbonioAdminUiLoginLogo) {
    updatedLogo.image = res.carbonioAdminUiLoginLogo;
    updatedLogo.width = '100%';
  }
  if (res?.carbonioAdminUiDescription) {
    setCopyrightBanner(res.carbonioAdminUiDescription);
  }
  updatedLogo.url = res?.carbonioLogoURL ?? CARBONIO_LOGO_URL;

  return updatedLogo;
}

type ProcessLoginConfigProps = {
  res: GetLoginConfigResponse;
  version: number;
  setBg: (bg: string) => void;
  setIsDefaultBg: (isDefault: boolean) => void;
  setCopyrightBanner: (banner: string) => void;
  setLogo: (logo: Logo) => void;
  t: TFunction;
};

export function processLoginConfig({
  res,
  version,
  setBg,
  setIsDefaultBg,
  setCopyrightBanner,
  setLogo,
  t,
}: ProcessLoginConfigProps): void {
  configureBasicSettings({ res, setBg, setIsDefaultBg });
  const logo = createLogoObject(res);
  setDocumentTitle(res, t);

  if (res.loginPageFavicon) {
    setFavicon(res.loginPageFavicon);
  }

  if (version === 3) {
    const v3Logo = applyV3Customization({ res, logo, setBg, setIsDefaultBg, setCopyrightBanner });
    setLogo(v3Logo);
  } else {
    setLogo(logo);
  }
}
