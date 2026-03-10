/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from 'react';

import { ErrorPage } from './error-page';
import { getAdvancedSupported } from './services/advanced-supported';

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
    <>
      <ErrorPage />
			{/*    {errorResponse && <ErrorPage />} */}
			{/* {isLoading && <LoadingView />} */}
			{/* {supportedResponse && apiResponse.supported && <LoginAdvanced />} */}
			{/* {supportedResponse && !apiResponse.supported && <LoginCE />} */}
    </>
	);
}
