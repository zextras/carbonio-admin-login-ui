/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useLayoutEffect, useState, useContext } from 'react';

import {
	Container,
	Link,
	Padding,
	Row,
	Text,
	Icon,
	useScreenMode
} from '@zextras/carbonio-design-system';
import PropTypes from 'prop-types';
import { browserName } from 'react-device-detect';
import { useTranslation, Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

import FormSelector from './form-selector';
import logoCarbonio from '../../assets/carbonio-admin-panel.svg';
import backgroundImageRetina from '../../assets/carbonio_light-retina.jpg';
import backgroundImage from '../../assets/carbonio_light.jpg';
import darkBackgroundImage from '../../assets/carbonio_loginpage.jpg';
import ServerNotResponding from '../components-index/server-not-responding';
import { ZimbraForm } from '../components-index/zimbra-form';
import {
	CARBONIO_CE_SUPPORTED_BROWSER_LINK,
	CARBONIO_LOGO_URL,
	CARBONIO_SUPPORTED_BROWSER_LINK,
	CHROME,
	FIREFOX
} from '../constants';
import { useDarkReaderResultValue } from '../dark-mode/use-dark-reader-result-value';
import { useGetPrimaryColor } from '../primary-color/use-get-primary-color';
import { getLoginConfig } from '../services/login-page-services';
import { useLoginConfigStore } from '../store/login/store';
import { ThemeCallbacksContext } from '../theme-provider/theme-provider';
import { prepareUrlForForward } from '../utils';

const LoginContainer = styled(Container)`
	padding: 0 100px;
	background: url(${(props) => props.backgroundImage}) no-repeat 75% center/cover;
	justify-content: center;
	align-items: center;
	${({ screenMode }) =>
		screenMode === 'mobile' &&
		css`
			padding: 0 12px;
			align-items: center;
		`}
	${({ isDefaultBg }) =>
		isDefaultBg &&
		css`
			@media (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi) {
				background: url(${backgroundImageRetina}) no-repeat 75% center/cover;
			}
		`}
`;

const FormContainer = styled.div`
	max-width: 100%;
	max-height: 100vh;
	box-shadow: 0px 0px 20px -7px rgba(0, 0, 0, 0.3);
`;

const FormWrapper = styled(Container)`
	width: auto;
	height: auto;
	background-color: ${({ theme, isDarkThmeEnabled }) =>
		isDarkThmeEnabled ? 'rgba(65,65,65, .8)' : 'rgba(255,255,255, 0.8)'};
	padding: 48px 48px 0;
	width: 436px;
	max-width: 100%;
	min-height: 620px;
	overflow-y: auto;
	${({ screenMode }) =>
		screenMode === 'mobile' &&
		css`
			padding: 20px 20px 0;
			width: 360px;
			max-height: 100%;
			height: auto;
		`}
`;

const PhotoLink = styled(Link)``;
const PhotoCredits = styled(Text)`
	position: absolute;
	bottom: ${({ theme }) => theme.sizes.padding.large};
	right: ${({ theme }) => theme.sizes.padding.large};
	opacity: 50%;
	&,
	${PhotoLink} {
		color: #fff;
	}

	@media (max-width: 767px) {
		display: none;
	}
`;

function DarkReaderListener() {
	const { setDarkReaderState } = useContext(ThemeCallbacksContext);
	const darkReaderResultValue = useDarkReaderResultValue();
	useEffect(() => {
		if (darkReaderResultValue) {
			setDarkReaderState(darkReaderResultValue);
		}
	}, [darkReaderResultValue, setDarkReaderState]);
	return null;
}

function configureBasicSettings(res, setBg, setIsDefaultBg, setIsDarkTheme) {
	if (res.loginPageBackgroundImage) {
		setBg(res.loginPageBackgroundImage);
		setIsDefaultBg(false);
	}
	if (res.isDarkThemeEnable) {
		setIsDarkTheme(true);
		setIsDefaultBg(false);
	}
}

function createLogoObject(res) {
	const logoObj = {};
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

function setDocumentTitle(res, t) {
	if (res.loginPageTitle) {
		document.title = res.loginPageTitle;
	} else {
		document.title = t('carbonio_authentication', 'Carbonio Authentication');
	}
}

function setFavicon(faviconUrl) {
	const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = faviconUrl;
	document.getElementsByTagName('head')[0].appendChild(link);
}

function applyV3Customization(res, logo, setBg, setIsDefaultBg, setCopyrightBanner) {
	if (res.carbonioAdminUiTitle) {
		document.title = res.carbonioAdminUiTitle;
	}
	if (res.carbonioAdminUiFavicon) {
		const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'shortcut icon';
		link.href = res.carbonioAdminUiFavicon;
		document.getElementsByTagName('head')[0].appendChild(link);
	}

	const updatedLogo = { ...logo };

	if (res?.carbonioWebUiDarkMode) {
		if (res?.carbonioAdminUiDarkBackground) {
			setBg(res.carbonioAdminUiDarkBackground);
			setIsDefaultBg(false);
		}

		if (res?.carbonioAdminUiDarkLoginLogo) {
			updatedLogo.image = res.carbonioAdminUiDarkLoginLogo;
			updatedLogo.width = '100%';
		}
	} else {
		if (res?.carbonioAdminUiBackground) {
			setBg(res.carbonioAdminUiBackground);
			setIsDefaultBg(false);
		}

		if (res?.carbonioAdminUiLoginLogo) {
			updatedLogo.image = res.carbonioAdminUiLoginLogo;
			updatedLogo.width = '100%';
		}
	}
	if (res?.carbonioAdminUiDescription) {
		setCopyrightBanner(res.carbonioAdminUiDescription);
	}
	updatedLogo.url = res?.carbonioLogoURL ? res.carbonioLogoURL : CARBONIO_LOGO_URL;
	return updatedLogo;
}

function processLoginConfig({
	res,
	version,
	setBg,
	setIsDefaultBg,
	setIsDarkTheme,
	setCopyrightBanner,
	setLogo,
	t
}) {
	configureBasicSettings(res, setBg, setIsDefaultBg, setIsDarkTheme);
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

function CopyrightBanner({ copyrightBanner, t }) {
	if (copyrightBanner) {
		return (
			<Text size="small" overflow="break-word">
				{copyrightBanner}
			</Text>
		);
	}
	return (
		<Text size="small" overflow="break-word" data-testid="default-banner">
			{t('copy_right', 'Copyright')} &copy;
			{` ${new Date().getFullYear()} Zextras, `}
			{t('all_rights_reserved', 'All rights reserved')}
		</Text>
	);
}

CopyrightBanner.propTypes = {
	copyrightBanner: PropTypes.string,
	t: PropTypes.func.isRequired
};

function LinkText({ to, children, primaryColor }) {
	return (
		<a
			href={to || '#'}
			target="_blank"
			rel="noreferrer"
			style={{
				textDecorationLine: 'underline',
				cursor: 'pointer',
				color: primaryColor || '#2b73d2'
			}}
		>
			{children}
		</a>
	);
}

LinkText.propTypes = {
	to: PropTypes.string,
	children: PropTypes.node,
	primaryColor: PropTypes.string
};

export default function PageLayout({ version, isAdvanced }) {
	const [t] = useTranslation();
	const screenMode = useScreenMode();
	const [logo, setLogo] = useState(null);
	const [serverError, setServerError] = useState(false);

	const urlParams = new URLSearchParams(window.location.search);
	const [destinationUrl, setDestinationUrl] = useState(
		prepareUrlForForward(urlParams.get('destinationUrl'))
	);
	const [domain, setDomain] = useState(urlParams.get('domain'));

	const [bg, setBg] = useState(backgroundImage);
	const [isDefaultBg, setIsDefaultBg] = useState(true);
	const [isDarkTheme, setIsDarkTheme] = useState(false);
	const [copyrightBanner, setCopyrightBanner] = useState('');
	const primaryColor = useGetPrimaryColor();
	const isSupportedBrowser = browserName === CHROME || browserName === FIREFOX;

	useEffect(() => {
		if (isDefaultBg) {
			setBg(isDarkTheme ? darkBackgroundImage : backgroundImage);
		}
	}, [isDarkTheme, isDefaultBg]);

	useLayoutEffect(() => {
		let componentIsMounted = true;
		if (isAdvanced) {
			getLoginConfig(version, domain, window.location.hostname)
				.then((res) => {
					if (!destinationUrl)
						setDestinationUrl(prepareUrlForForward(res.adminConsolePublicUrl ?? res.publicUrl));
					if (!domain) setDomain(res.zimbraDomainName);

					if (componentIsMounted) {
						processLoginConfig({
							res,
							version,
							setBg,
							setIsDefaultBg,
							setIsDarkTheme,
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
		<LoginContainer screenMode={screenMode} isDefaultBg={isDefaultBg} backgroundImage={bg}>
			<DarkReaderListener />
			<FormContainer data-testid="form-container">
				<FormWrapper
					mainAlignment="space-between"
					screenMode={screenMode}
					isDarkThmeEnabled={isDarkTheme}
				>
					<Container mainAlignment="flex-start" height="auto">
						<Padding value="28px 0 28px" crossAlignment="center" width="100%">
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
						<FormSelector domain={domain} destinationUrl={destinationUrl} />
					) : (
						<ZimbraForm destinationUrl={destinationUrl} />
					)}

					<Container
						crossAlignment="flex-start"
						height="auto"
						padding={{ bottom: 'extralarge', top: 'extralarge' }}
					>
						<Row padding={{ top: 'large', bottom: 'large' }} wrap="nowrap">
							<Padding right="extrasmall">
								<Icon
									color="secondary"
									icon={isSupportedBrowser ? 'CheckmarkOutline' : 'InfoOutline'}
									size="medium"
								/>
							</Padding>
							<Text size="small" color="secondary" weight="light">
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
												primaryColor={primaryColor}
												to={
													isAdvanced
														? CARBONIO_SUPPORTED_BROWSER_LINK
														: CARBONIO_CE_SUPPORTED_BROWSER_LINK
												}
											/>
										)
									}}
								/>
							</Text>
						</Row>
						<CopyrightBanner copyrightBanner={copyrightBanner} t={t} />
					</Container>
				</FormWrapper>
			</FormContainer>
		</LoginContainer>
	);
}

PageLayout.propTypes = {
	version: PropTypes.number,
	isAdvanced: PropTypes.bool.isRequired
};
