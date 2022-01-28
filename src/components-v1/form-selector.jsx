/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from 'react';
import V1LoginManager from './v1-login-manager';
import V2LoginManager from './v2-login-manager';
import { getAuthSupported, doAuthLogout } from '../services/auth-configuration-service';
import ServerNotResponding from '../components-index/server-not-responding';
import NotSupportedVersion from '../components-index/not-supported-version';

export default function FormSelector({ destinationUrl, domain }) {
	const [configuration, setConfiguration] = useState(null);
	const [error, setError] = useState(false);
	const [disableInputs, setDisableInputs] = useState(true);

	useEffect(() => {
		let componentIsMounted = true;

		getAuthSupported(domain)
			.then((res) => {
				if (componentIsMounted) {
					setConfiguration((conf) => ({
						...conf,
						...res,
						destinationUrl
					}));
					setDisableInputs(false);
				}
			})
			.catch(() => {
				// It should never happen, If the server doesn't respond this page will not be loaded
				if(componentIsMounted) setError(true);
			});
		return () => {
			componentIsMounted = false;
		}
	}, []);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (configuration && urlParams.has('loginOp') && urlParams.get('loginOp') === 'logout') {
			doAuthLogout(configuration)
				.catch(() => console.log('Logout failed'));
		}
	}, [configuration]);

	if(error)
		return <ServerNotResponding />

	if (configuration === null || !configuration.destinationUrl)
		return <div></div>;

	if (configuration.maxApiVersion >= 2 && configuration.minApiVersion <= 2)
		return <V2LoginManager
			configuration={configuration}
			disableInputs={disableInputs}
		/>;
	if (configuration.maxApiVersion >= 1 && configuration.minApiVersion <= 1)
		return <V1LoginManager
			configuration={configuration}
			disableInputs={disableInputs}
		/>;

	return <NotSupportedVersion />
}
