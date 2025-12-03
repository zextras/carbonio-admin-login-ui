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
import { generateColorSet, prepareUrlForForward } from '../utils';

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

export default function PageLayout({ version, isAdvanced }) {
	const [t] = useTranslation();
	const screenMode = useScreenMode();
	const [logo, setLogo] = useState(null);
	const [serverError, setServerError] = useState(false);

	const urlParams = new URLSearchParams(window.location.search);
	console.log('PageLayout render::', 
		{ version, isAdvanced, urlParams, 
			search: window.location.search, 
			destinationUrl: urlParams.get('destinationUrl'), 
			domain: urlParams.get('domain') });
	const [destinationUrl, setDestinationUrl] = useState(
		prepareUrlForForward(urlParams.get('destinationUrl'))
	);
	const [domain, setDomain] = useState(
		urlParams.get('domain') ?? destinationUrl);

	const [bg, setBg] = useState(backgroundImage);
	const [isDefaultBg, setIsDefaultBg] = useState(true);
	const [editedTheme, setEditedTheme] = useState({});
	const [isDarkTheme, setIsDarkTheme] = useState(false);
	const [copyrightBanner, setCopyrightBanner] = useState('');
	const { setDarkReaderState } = useContext(ThemeCallbacksContext);
	const primaryColor = useGetPrimaryColor();
	const isSupportedBrowser = browserName === CHROME || browserName === FIREFOX;
	console.log('PageLayout render::::', {destinationUrl}); 
	useEffect(() => {
		if (isDefaultBg) {
			if (isDarkTheme) {
				setBg(darkBackgroundImage);
			} else {
				setBg(backgroundImage);
			}
		}
	}, [isDarkTheme, isDefaultBg]);

	useLayoutEffect(() => {
		let componentIsMounted = true;
		if (isAdvanced) {
			getLoginConfig(version, domain, domain)
				.then((res) => {
					if (!destinationUrl) setDestinationUrl(prepareUrlForForward(res.publicUrl));
					if (!domain) setDomain(res.zimbraDomainName);

					const _logo = {};

					if (componentIsMounted) {
						if (res.loginPageBackgroundImage) {
							setBg(res.loginPageBackgroundImage);
							setIsDefaultBg(false);
						}
						if (res.isDarkThemeEnable) {
							setIsDarkTheme(true);
							setIsDefaultBg(false);
						}

						if (res.loginPageLogo) {
							_logo.image = res.loginPageLogo;
							_logo.width = '100%';
						} else {
							_logo.image = logoCarbonio;
							_logo.width = '221px';
						}

						if (res.loginPageSkinLogoUrl) {
							_logo.url = res.loginPageSkinLogoUrl;
						} else {
							_logo.url = '';
						}

						if (res.loginPageTitle) {
							document.title = res.loginPageTitle;
						} else {
							document.title = t('carbonio_authentication', 'Carbonio Authentication');
						}

						if (res.loginPageFavicon) {
							const link =
								document.querySelector("link[rel*='icon']") || document.createElement('link');
							link.type = 'image/x-icon';
							link.rel = 'shortcut icon';
							link.href = res.loginPageFavicon;
							document.getElementsByTagName('head')[0].appendChild(link);
						}

						if (res.loginPageColorSet) {
							const colorSet = res.loginPageColorSet;
							if (colorSet.primary) {
								setEditedTheme((et) => ({
									...et,
									'palette.primary': generateColorSet({
										regular: `#${colorSet.primary}`
									})
								}));
							}
							if (colorSet.secondary) {
								setEditedTheme((et) => ({
									...et,
									'palette.secondary': generateColorSet({
										regular: `#${colorSet.secondary}`
									})
								}));
							}
						}

						if (version === 3) {
							useLoginConfigStore.setState(res);
							// In case of v3 API response
							if (res.carbonioAdminUiTitle) {
								document.title = res.carbonioAdminUiTitle;
							}
							if (res.carbonioAdminUiFavicon) {
								const link =
									document.querySelector("link[rel*='icon']") || document.createElement('link');
								link.type = 'image/x-icon';
								link.rel = 'shortcut icon';
								link.href = res.carbonioAdminUiFavicon;
								document.getElementsByTagName('head')[0].appendChild(link);
							}
							if (res?.carbonioWebUiDarkMode) {
								if (res?.carbonioAdminUiDarkBackground) {
									setBg(res.carbonioAdminUiDarkBackground);
									setIsDefaultBg(false);
								}

								if (res?.carbonioAdminUiDarkLoginLogo) {
									_logo.image = res.carbonioAdminUiDarkLoginLogo;
									_logo.width = '100%';
								}
							} else {
								if (res?.carbonioAdminUiBackground) {
									setBg(res.carbonioAdminUiBackground);
									setIsDefaultBg(false);
								}

								if (res?.carbonioAdminUiLoginLogo) {
									_logo.image = res.carbonioAdminUiLoginLogo;
									_logo.width = '100%';
								}
							}
							if (res?.carbonioAdminUiDescription) {
								setCopyrightBanner(res.carbonioAdminUiDescription);
							}
							_logo.url = res?.carbonioLogoURL ? res.carbonioLogoURL : CARBONIO_LOGO_URL;
						}
						setLogo(_logo);
					}
				})
				.catch(() => {
					// It should never happen, If the server doesn't respond this page will not be loaded
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

	const LinkText = (props) => {
		const { to, children } = props || {};
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
	};

	if (serverError) return <ServerNotResponding />;

	if (logo) {
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
										<a target="_blank" href={logo.url} rel="noreferrer">
											{logoHtml}
										</a>
									) : (
										logoHtml
									)}
								</Container>
							</Padding>
						</Container>
						{isAdvanced ? (
							<FormSelector domain={domain} destinationUrl={destinationUrl}/>
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
							{copyrightBanner ? (
								<Text size="small" overflow="break-word">
									{copyrightBanner}
								</Text>
							) : (
								<Text size="small" overflow="break-word" data-testid="default-banner">
									{t('copy_right', 'Copyright')} &copy;
									{` ${new Date().getFullYear()} Zextras, `}
									{t('all_rights_reserved', 'All rights reserved')}
								</Text>
							)}
						</Container>
					</FormWrapper>
				</FormContainer>
			</LoginContainer>
		);
	}

	return null;
}

PageLayout.propTypes = {
	version: PropTypes.number,
	isAdvanced: PropTypes.bool.isRequired
};
