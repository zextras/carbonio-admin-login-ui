/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext, type JSX, type PropsWithChildren, useCallback, useContext, useReducer } from 'react';

import { Snackbar } from '../Snackbar';

const SNACKBAR_ACTION = {
	PUSH: 'push',
	POP: 'pop',
	POP_AND_PREPEND: 'pop_and_prepend',
	REMOVE: 'remove',
} as const;

type SnackbarAction =
	| {
			type: typeof SNACKBAR_ACTION.PUSH;
			value: JSX.Element;
		}
	| { type: typeof SNACKBAR_ACTION.POP }
	 | { type: typeof SNACKBAR_ACTION.POP_AND_PREPEND; value: JSX.Element }
	 | { type: typeof SNACKBAR_ACTION.REMOVE; key: string };

type CreateSnackbarFn = (options: {
	severity: 'info' | 'success' | 'warning' | 'error';
	label: string;
	onActionClick?: () => void;
	autoHideTimeout?: number;
}) => () => void;

type SnackbarManagerProps = PropsWithChildren<{
	autoHideDefaultTimeout?: number;
}>;

const SnackbarManagerContext = createContext<CreateSnackbarFn | null>(null);

export type { CreateSnackbarFn, SnackbarManagerProps, SnackbarManagerContext };

export function useSnackbar(): CreateSnackbarFn {
	const createSnackbar = useContext(SnackbarManagerContext);
	const fallback = useCallback<CreateSnackbarFn>(() => {
		console.error('snackbar manager context not initialized');
		return (): void => undefined;
	}, []);
	return createSnackbar ?? fallback;
}

function snackbarsReducer(state: Array<JSX.Element>, action: SnackbarAction): Array<JSX.Element> {
	switch (action.type) {
		case 'push': {
			return [...state, action.value];
		}
		case 'pop': {
			return state.slice(1);
		}
		case 'pop_and_prepend': {
			return [action.value, ...state.slice(1)];
		}
		case 'remove': {
			return state.filter((snackbar) => snackbar.key !== action.key);
		}
		default: {
			return state;
		}
	}
}

let snackbarKey = 0;

export function SnackbarManager({ children, autoHideDefaultTimeout }: SnackbarManagerProps): JSX.Element {
	const [snackbars, dispatchSnackbar] = useReducer(snackbarsReducer, []);

	const createSnackbar = useCallback<CreateSnackbarFn>(
		({ severity, label, onActionClick, autoHideTimeout }) => {
			const snackKey = `snackbar-${snackbarKey++}`;
			snackbarKey += 1;

			dispatchSnackbar({ type: 'push', value: undefined });

			let closeSnackbar: () => void;
			const handleClose = (): void => {
				dispatchSnackbar({ type: 'remove', key: snackKey });
				closeSnackbar?.();
			};

			dispatchSnackbar({
				type: 'push',
				value: (
					<Snackbar
                        key={snackKey}
                        open
                        severity={severity}
                        label={label}
                        onActionClick={handleActionClick}
                        onClose={handleClose}
                        autoHideTimeout={autoHideTimeout ?? autoHideDefaultTimeout}
                    />
                ),
            });

			return closeSnackbar;
		},
		[autoHideDefaultTimeout, dispatchSnackbar]
	);

	return (
		<SnackbarManagerContext.Provider value={createSnackbar}>
			{snackbars.length > 0 && snackbars[0]}
		</SnackbarManagerContext.Provider>
	);
}
