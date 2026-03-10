/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useRef } from 'react';

function useCombinedRefs<T>(...refs: Array<React.Ref<T> | React.RefObject<T | null> | undefined>): React.RefObject<T | null> {
	const targetRef = useRef<T | null>(null);
	useEffect(() => {
		refs.forEach((ref) => {
			if (!ref) return;

			if (typeof ref === 'function') {
				ref(targetRef.current);
			} else {
				(ref as React.MutableRefObject<T | null>).current = targetRef.current;
			}
		});
	});
	return targetRef;
}

export { useCombinedRefs };
