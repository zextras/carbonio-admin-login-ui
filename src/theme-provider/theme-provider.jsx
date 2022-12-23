/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { createContext, FC, useCallback, useEffect, useState } from 'react';
import { ThemeProvider as UIThemeProvider } from '@zextras/carbonio-design-system';
import { enable, disable, auto, setFetchMethod } from 'darkreader';
import { reduce, set } from 'lodash';
import { darkReaderDynamicThemeFixes } from '../constants';

setFetchMethod(window.fetch);

export const ThemeCallbacksContext = createContext({
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	addExtension: (newExtension, id) => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setDarkReaderState: (newState) => {}
});

const themeSizes = (size) => {
	switch (size) {
		case 'small': {
			return (t) => {
				// eslint-disable-next-line no-param-reassign
				t.sizes.font = {
					extrasmall: '10px',
					small: '12px',
					medium: '14px',
					large: '16px'
				};
				return t;
			};
		}
		case 'large': {
			return (t) => {
				// eslint-disable-next-line no-param-reassign
				t.sizes.font = {
					extrasmall: '14px',
					small: '16px',
					medium: '18px',
					large: '20px'
				};
				return t;
			};
		}
		case 'larger': {
			return (t) => {
				// eslint-disable-next-line no-param-reassign
				t.sizes.font = {
					extrasmall: '16px',
					small: '18px',
					medium: '20px',
					large: '22px'
				};
				return t;
			};
		}
		case 'default':
		case 'normal':
		default: {
			return (t) => {
				// eslint-disable-next-line no-param-reassign
				t.sizes.font = {
					extrasmall: '12px',
					small: '14px',
					medium: '16px',
					large: '18px'
				};
				return t;
			};
		}
	}
};

export function ThemeProvider({ children }) {
	// TODO: update when the DS is fully typed :D
	const [extensions, setExtensions] = useState({
		fonts: (theme) => {
			// eslint-disable-next-line no-param-reassign
			theme.sizes.font = {
				extrasmall: '12px',
				small: '14px',
				medium: '16px',
				large: '18px'
			};
			return theme;
		}
	});

	const [darkReaderState, setDarkReaderState] = useState('disabled');

	useEffect(() => {
		switch (darkReaderState) {
			case 'disabled':
				auto(false);
				disable();
				break;
			case 'enabled':
				auto(false);
				enable(
					{
						sepia: -50
					},
					darkReaderDynamicThemeFixes
				);
				break;
			case 'auto':
			default:
				auto(
					{
						sepia: -50
					},
					darkReaderDynamicThemeFixes
				);
				break;
		}
	}, [darkReaderState]);
	const aggregatedExtensions = useCallback(
		(theme) => reduce(extensions, (acc, val) => val(acc), theme),
		[extensions]
	);
	const addExtension = useCallback(
		(newExtension, id) => {
			setExtensions((ext) => ({ ...ext, [id]: newExtension }));
		},
		[setExtensions]
	);
	return (
		<UIThemeProvider extension={aggregatedExtensions}>
			<ThemeCallbacksContext.Provider value={{ addExtension, setDarkReaderState }}>
				{children}
			</ThemeCallbacksContext.Provider>
		</UIThemeProvider>
	);
}
