/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './browser-support-message';

import clsx from 'clsx';
import i18next, { type TFunction } from 'i18next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { browserName } from 'react-device-detect';

import backgroundImage from '../../assets/carbonio_light.jpg';
import backgroundImageRetina from '../../assets/carbonio_light-retina.jpg';
import logoCarbonio from '../../assets/carbonio-admin-panel.svg';
import { ServerNotResponding } from '../components-index/server-not-responding';
import {
  CARBONIO_LOGO_URL,
  CHROME,
  FIREFOX,
} from '../constants';
import { getLoginConfig, type GetLoginConfigResponse } from '../services/login-page-services';
import { useLoginConfigStore } from '../store/login/store';
import { prepareUrlForForward } from '../utils';
import { FormSelector } from './form-selector';
import styles from './page-layout.module.css';

type ConfigBasicSettingsProps = {
  res: { loginPageBackgroundImage?: string };
  setBg: (bg: string) => void;
  setIsDefaultBg: (isDefault: boolean) => void;
};

function configureBasicSettings({ res, setBg, setIsDefaultBg }: ConfigBasicSettingsProps) {
  if (res.loginPageBackgroundImage) {
    setBg(res.loginPageBackgroundImage);
    setIsDefaultBg(false);
  }
}

function createLogoObject(res: GetLoginConfigResponse) {
  const logoObj = {} as Logo;
  if (res.loginPageLogo) {
    logoObj.image = res.loginPageLogo;
    logoObj.width = '100%';
  } else {
    logoObj.image = logoCarbonio;
    logoObj.width = '221px';
  }

  if (res.loginPageSkinLogoUrl) {
    logoObj.url = res.loginPageSkinLogoUrl;
  } else {
    logoObj.url = '';
  }
  return logoObj;
}

function setDocumentTitle(res: GetLoginConfigResponse, t: TFunction) {
  if (res.loginPageTitle) {
    document.title = res.loginPageTitle;
  } else {
    document.title = t('carbonio_authentication', 'Carbonio Authentication');
  }
}

function setFavicon(faviconUrl: string) {
  const link = (document.querySelector("link[rel*='icon']") ||
    document.createElement('link')) as HTMLLinkElement;
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
}

function applyV3Customization(
  res: GetLoginConfigResponse,
  logo: Logo,
  setBg: (bg: string) => void,
  setIsDefaultBg: (isDefault: boolean) => void,
  setCopyrightBanner: (banner: string) => void,
) {
  if (res.carbonioAdminUiTitle) {
    document.title = res.carbonioAdminUiTitle;
  }
  if (res.carbonioAdminUiFavicon) {
    const link = (document.querySelector("link[rel*='icon']") ||
      document.createElement('link')) as HTMLLinkElement;
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = res.carbonioAdminUiFavicon;
    document.head.appendChild(link);
  }

  const updatedLogo = { ...logo };

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
  updatedLogo.url = res?.carbonioLogoURL ? res.carbonioLogoURL : CARBONIO_LOGO_URL;
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
function processLoginConfig({
  res,
  version,
  setBg,
  setIsDefaultBg,
  setCopyrightBanner,
  setLogo,
  t,
}: ProcessLoginConfigProps) {
  configureBasicSettings({ res, setBg, setIsDefaultBg });
  const _logo = createLogoObject(res);
  setDocumentTitle(res, t);

  if (res.loginPageFavicon) {
    setFavicon(res.loginPageFavicon);
  }

  if (version === 3) {
    useLoginConfigStore.setState(res);
    const v3Logo = applyV3Customization(res, _logo, setBg, setIsDefaultBg, setCopyrightBanner);
    setLogo(v3Logo);
  } else {
    setLogo(_logo);
  }
}

type PageLayoutProps = { version: number; isAdvanced: boolean };
type Logo = { image: string; width: string; url?: string };

export const PageLayout = ({ version, isAdvanced }: PageLayoutProps) => {
  const t = i18next.t.bind(i18next);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [serverError, setServerError] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const [destinationUrl, setDestinationUrl] = useState(
    prepareUrlForForward(urlParams.get('destinationUrl') ?? ''),
  );
  const [domain, setDomain] = useState(urlParams.get('domain'));

  const [bg, setBg] = useState(backgroundImage);
  const [isDefaultBg, setIsDefaultBg] = useState(true);
  const [copyrightBanner, setCopyrightBanner] = useState('');
  const isSupportedBrowser = browserName === CHROME || browserName === FIREFOX;

  useEffect(() => {
    if (isDefaultBg) {
      setBg(backgroundImage);
    }
  }, [isDefaultBg]);

  useLayoutEffect(() => {
    let componentIsMounted = true;
    if (isAdvanced) {
      getLoginConfig(version, domain, window.location.hostname)
        .then((res) => {
          if (!destinationUrl)
            setDestinationUrl(prepareUrlForForward(res.adminConsolePublicUrl ?? res.publicUrl));
          if (!domain) setDomain(res.zimbraDomainName ?? '');

          if (componentIsMounted) {
            processLoginConfig({
              res,
              version,
              setBg,
              setIsDefaultBg,
              setCopyrightBanner,
              setLogo,
              t,
            });
          }
        })
        .catch(() => {
          if (componentIsMounted) setServerError(true);
        });
    } else {
      setLogo({ image: logoCarbonio, width: '221px', url: CARBONIO_LOGO_URL });
      document.title = t('carbonio_authentication', 'Carbonio Authentication');
    }

    return () => {
      componentIsMounted = false;
    };
  }, [destinationUrl, t, domain, version, isAdvanced]);

  if (serverError) return <ServerNotResponding />;
  if (!logo) return null;

  const logoHtml = (
    <img
      alt="Logo"
      src={logo.image}
      width={logo.width}
      style={{
        maxWidth: '100%',
        maxHeight: '150px',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      data-testid="logo"
    />
  );

  return (
    <div
      className={clsx(styles.loginContainer, isDefaultBg && styles.loginContainerRetina)}
      style={{
        // @ts-expect-error CSS custom property
        '--background-image': `url(${bg})`,
        '--background-image-retina': `url(${backgroundImageRetina})`,
      }}
    >
      <div className={styles.formWrapper} data-testid="form-container">
        <div className={styles.logoSection}>
          {logo.url ? (
            <a target="_blank" href={logo.url} rel="noreferrer" data-testid="logo-link">
              {logoHtml}
            </a>
          ) : (
            logoHtml
          )}
        </div>
        {/* {isAdvanced ? ( */}
        <FormSelector domain={domain} destinationUrl={destinationUrl ?? ''} />
        {/* ) : ( */}
        {/* <ZimbraForm destinationUrl={destinationUrl ?? ''} /> */}
        {/* )} */}

        <div className={styles.bottomSection}>
          <div className={styles.browserSupportRow}>
            <div className={styles.iconPadding}>
              <icon-wc
                color="secondary"
                icon={isSupportedBrowser ? 'CheckmarkOutline' : 'InfoOutline'}
                size="medium"
              />
            </div>
            <zx-text size="small" color="secondary" weight="light">
              <browser-support-message
                is-supported-browser={isSupportedBrowser}
                is-advanced={isAdvanced}
              />
            </zx-text>
          </div>
          {copyrightBanner ? (
            <zx-text size="small" overflow="break-word">
              {copyrightBanner}
            </zx-text>
          ) : (
            <zx-text size="small" overflow="break-word" data-testid="default-banner">
              {t('copy_right', 'Copyright')} &copy; {` ${new Date().getFullYear()} Zextras, `}
              {t('all_rights_reserved', 'All rights reserved')}
            </zx-text>
          )}
        </div>
      </div>
    </div>
  );
};
