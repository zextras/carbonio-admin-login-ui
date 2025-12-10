/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
	const readValue = useCallback<() => T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(error);
			return initialValue;
		}
	}, [initialValue, key]);

	const [storedValue, setStoredValue] = useState<T>(readValue());
	const shouldDispatchEvent = useRef(false);

	const setValue = (value: T | ((val: T) => T)): void => {
		try {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			const valueToStoreJSON = JSON.stringify(valueToStore);
			setStoredValue((prevState) => {
				const prevValueJSON = JSON.stringify(prevState);
				if (prevValueJSON !== valueToStoreJSON) {
					localStorage.setItem(key, valueToStoreJSON);
					shouldDispatchEvent.current = true;
					return valueToStore;
				}
				return prevState;
			});
		} catch (error) {
			console.error(error);
		}
	};

	// Dispatch storage event after state update completes (outside render phase)
	useEffect(() => {
		if (shouldDispatchEvent.current) {
			shouldDispatchEvent.current = false;
			window.dispatchEvent(new Event('storage'));
		}
	}, [storedValue]);

	const updateValue = useCallback(() => {
		setStoredValue(readValue());
	}, [readValue]);

	useEffect(() => {
		window.addEventListener('storage', updateValue);
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		return () => {
			window.removeEventListener('storage', updateValue);
		};
	}, [updateValue]);

	return [storedValue, setValue];
}
