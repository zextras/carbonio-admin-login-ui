/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback,useEffect, useMemo, useState } from 'react';


type UseCheckboxArgs = {
	ref: React.RefObject<HTMLElement | null>;
	value?: boolean;
	onClick?: (event: Event) => void;
};

function useCheckbox({
	ref,
	value,
	onClick,
}: UseCheckboxArgs): boolean {
	const [checked, setChecked] = useState<boolean>(value || false);

	const uncontrolledMode = useMemo(() => value === undefined, [value]);

	const handleClick = useCallback(
		(ev: Event) => {
				if (uncontrolledMode) {
					setChecked((check) => !check);
				}
				if (onClick) {
					onClick(ev);
				}
		},
		[ uncontrolledMode, onClick]
	);

	useEffect(() => {
		value !== undefined && setChecked(value);
	}, [value]);

		useEffect(() => {
		const refSave = ref.current;
		refSave && refSave.addEventListener('click', handleClick);
		return () => {
			refSave && refSave.removeEventListener('click', handleClick);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref.current, handleClick]);

	return checked;
}

export { useCheckbox };
export type { UseCheckboxArgs };
