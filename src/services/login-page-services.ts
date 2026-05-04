/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export async function getLoginSupported(signal: AbortSignal) {
  const res = await fetch('/zx/login/supported', { signal });
  if (res.status === 200) return res.json();
  throw new Error('Network Error');
}

type GetLoginConfigResponseBase = {
  carbonioWebUiDescription: string;
  carbonioAdminUiTitle: string;
  carbonioWebUiDarkMode: boolean;
  zimbraDomainName: string;
  carbonioFeatureResetPasswordEnabled: boolean;
  loginPageSkinLogoURL: string;
  loginPageLogo: string;
  carbonioPrefWebUiDarkMode: boolean;
  carbonioAdminUiDescription: string;
  loginPageFavicon: string;
  adminConsolePublicUrl: string;
  zimbraPublicServiceHostname: string;
  loginPageBackgroundImage: string;
  carbonioWebUiTitle: string;
  zimbraPublicServicePort: string;
  zimbraPublicServiceProtocol: string;
  loginPageTitle: string;
  publicUrl: string;
  loginPageColorSet: unknown;
  loginPageSkinLogoAppBanner: string;
  carbonioLogoURL: string;
  loginPageSkinLogoUrl: string;
  carbonioAdminUiFavicon: string;
  carbonioAdminUiBackground: string;
  carbonioAdminUiLoginLogo: string;
};

export type GetLoginConfigResponse = Partial<GetLoginConfigResponseBase>;

export async function getLoginConfig(
  version: number,
  domain: string | null,
  host: string,
): Promise<GetLoginConfigResponse> {
  const urlParams = new URLSearchParams();
  if (domain) urlParams.append('domain', domain);
  if (host) urlParams.append('host', host);
  return fetch(`/zx/login/v${version}/config?${urlParams}`, {
    method: 'GET',
  }).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error('Network Error');
  });
}

export async function checkClassicUi() {
  const res = await fetch('/public/blank.html');
  if (res.status === 404) {
    return { hasClassic: false };
  }
  return { hasClassic: true };
}
