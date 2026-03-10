/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { browserName } from 'react-device-detect';
import { type TFunction, Trans, useTranslation } from 'react-i18next';

import backgroundImage from '../../assets/carbonio_light.jpg';
import backgroundImageRetina from '../../assets/carbonio_light-retina.jpg';
import logoCarbonio from '../../assets/carbonio-admin-panel.svg';
import { ServerNotResponding } from '../components-index/server-not-responding';
import { ZimbraForm } from '../components-index/zimbra-form';
import {
	CARBONIO_CE_SUPPORTED_BROWSER_LINK,
	CARBONIO_LOGO_URL,
	CARBONIO_SUPPORTED_BROWSER_LINK,
	CHROME,
	FIREFOX
} from '../constants';
import { getLoginConfig, type GetLoginConfigResponse } from '../services/login-page-services';
import { useLoginConfigStore } from '../store/login/store';
import { Container, Padding, Row } from '../ui-components/src/';
import { prepareUrlForForward } from '../utils';
import { CopyrightBanner } from './copyright-banner';
import { FormSelector } from './form-selector';
import { LinkText } from './link-text';
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
	setCopyrightBanner: (banner: string) => void
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
	t
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

export  const PageLayout=({ version, isAdvanced }: PageLayoutProps)=> {
	const [t] = useTranslation();
	const [logo, setLogo] = useState<Logo | null>(null);
	const [serverError, setServerError] = useState(false);

	const urlParams = new URLSearchParams(window.location.search);
	const [destinationUrl, setDestinationUrl] = useState(
		prepareUrlForForward(urlParams.get('destinationUrl') ?? '')
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
							t
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
				marginRight: 'auto'
			}}
			data-testid="logo"
		/>
	);

	return (
		<Container
			className={clsx(styles.loginContainer, isDefaultBg && styles.loginContainerRetina)}
			style={{
				// @ts-expect-error CSS custom property
				'--background-image': `url(${bg})`,
				'--background-image-retina': `url(${backgroundImageRetina})`
			}}
		>
			<div className={styles.formContainer} data-testid="form-container">
				<Container className={styles.formWrapper} mainAlignment="space-between">
					<Container mainAlignment="flex-start" height="auto">
						<Padding value="28px 0 28px" width="100%">
							<Container crossAlignment="center">
								{logo.url ? (
									<a target="_blank" href={logo.url} rel="noreferrer" data-testid="logo-link">
										{logoHtml}
									</a>
								) : (
									logoHtml
								)}
							</Container>
						</Padding>
					</Container>
					{isAdvanced ? (
						<FormSelector domain={domain} destinationUrl={destinationUrl ?? ''} />
					) : (
						<ZimbraForm destinationUrl={destinationUrl ?? ''} />
					)}

					<Container
						crossAlignment="flex-start"
						height="auto"
						padding={{ bottom: 'extralarge', top: 'extralarge' }}
					>
						<Row padding={{ top: 'large', bottom: 'large' }} wrap="nowrap">
							<Padding right="extrasmall">
								<icon-wc
									color="secondary"
									icon={isSupportedBrowser ? 'CheckmarkOutline' : 'InfoOutline'}
									size="medium"
								/>
							</Padding>
							<zx-text size="small" color="secondary" weight="light">
								<Trans
									i18nKey={
										isSupportedBrowser ? 'browser_fully_supported' : 'browser_limited_supported'
									}
									defaults={
										isSupportedBrowser
											? 'Your browser is fully <a>supported</a>'
											: 'Having troubles? Try a fully <a>supported</a> browser'
									}
									components={{
										a: (
											<LinkText
												to={
													isAdvanced
														? CARBONIO_SUPPORTED_BROWSER_LINK
														: CARBONIO_CE_SUPPORTED_BROWSER_LINK
												}
											/>
										)
									}}
								/>
							</zx-text>
						</Row>
						<CopyrightBanner copyrightBanner={copyrightBanner} t={t} />
					</Container>
				</Container>
			</div>
		</Container>
	);
}
