/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useEffect, useState } from 'react';

import { SnackbarManager } from '@zextras/carbonio-design-system';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import { LoginAdvanced } from './loginAdvanced';
import { LoginCE } from './loginCE';
import { getAdvancedSupported } from './services/advanced-supported';
import { ThemeProvider } from './theme-provider/theme-provider';
import { ErrorPage } from './error-page';

type Error = {
	errorMessage: string;
};

type AdvancedSupport = {
	supported: boolean;
};

type Loading = {
	isLoading: true;
};

export function App(): React.JSX.Element {
	const [apiResponse, setApiResponse] = useState<AdvancedSupport | Loading | Error>({
		isLoading: true
	});

	useEffect(() => {
		setApiResponse({ isLoading: true });
		getAdvancedSupported().then((data) => {
			if ('supported' in data) {
				setApiResponse({
					supported: data.supported
				});
			} else {
				setApiResponse({
					errorMessage: ''
				});
			}
		});
	}, []);
	const errorResponse = apiResponse && 'errorMessage' in apiResponse;
	const isLoading = !apiResponse || (apiResponse && 'isLoading' in apiResponse);
	const supportedResponse = apiResponse && 'supported' in apiResponse;

	return (
		<ThemeProvider>
			<SnackbarManager>
				<Suspense fallback={<div></div>}>
					<Router>
						<Switch>
							{errorResponse && <ErrorPage />}
							{isLoading && <>loading</>}
							{supportedResponse && apiResponse.supported && <LoginAdvanced />}
							{supportedResponse && !apiResponse.supported && <LoginCE />}
						</Switch>
					</Router>
				</Suspense>
			</SnackbarManager>
		</ThemeProvider>
	);
}
