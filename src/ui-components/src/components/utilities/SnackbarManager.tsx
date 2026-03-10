/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type JSX, type PropsWithChildren, useCallback, useContext, useReducer } from 'react';

import { type CreateSnackbarFn,SnackbarManagerContext } from '../../use-snackbar/use-snackbar';
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

export function useSnackbar(): CreateSnackbarFn {
	const createSnackbar = useContext(SnackbarManagerContext);
	const fallback = useCallback<CreateSnackbarFn>(() => {
		console.error('snackbar manager context not initialized');
		return (): void => undefined;
	}, []);
	return createSnackbar ?? fallback;
}
type SnackbarManagerProps = PropsWithChildren<{
  autoHideDefaultTimeout?: number;
}>;

export function SnackbarManager({ children, autoHideDefaultTimeout }: SnackbarManagerProps): JSX.Element {
  const [snackbars, dispatchSnackbar] = useReducer(snackbarsReducer, []);

  const createSnackbar = useCallback<CreateSnackbarFn>(
    ({
      label,
      key,
      severity = 'info' as const,
      onActionClick,
      onClose,
      autoHideTimeout,
      replace,
      ...rest
    }) => {
      const handleClose = (): void => {
        onClose?.();
        dispatchSnackbar({ type: SNACKBAR_ACTION.POP });
      };
      const handleActionClick = (): void => {
        onActionClick ? onActionClick() : onClose?.();
        dispatchSnackbar({ type: SNACKBAR_ACTION.POP });
      };
      const snackKey = key ?? `${severity}-${label}`;

      dispatchSnackbar({
        type: replace ? SNACKBAR_ACTION.POP_AND_PREPEND : SNACKBAR_ACTION.PUSH,
        value: (
          <Snackbar
            key={snackKey}
            open
            severity={severity}
            label={label}
            onActionClick={handleActionClick}
            onClose={handleClose}
            autoHideTimeout={autoHideTimeout ?? autoHideDefaultTimeout}
            {...rest}
          />
        ),
      });

      return () => dispatchSnackbar({ type: 'remove', key: snackKey });
    },
    [dispatchSnackbar, autoHideDefaultTimeout],
  );

  return (
    <>
      <SnackbarManagerContext.Provider value={createSnackbar}>
        {children}
      </SnackbarManagerContext.Provider>
      {snackbars.length > 0 && snackbars[0]}
    </>
  );
}

