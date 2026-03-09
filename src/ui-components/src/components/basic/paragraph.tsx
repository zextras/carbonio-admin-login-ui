/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import styles from './Paragraph.module.css';
import { Text, type TextProps } from './text/Text';

type ParagraphProps = TextProps;

const Paragraph = React.forwardRef<HTMLDivElement, ParagraphProps>(function ParagraphFn(
	{ children, overflow = 'break-word' as const, ...rest },
	ref
) {
	return (
		<Text ref={ref} overflow={overflow} lineHeight={1.4} className={styles.paragraph} {...rest}>
			{children}
		</Text>
	);
});

export type { ParagraphProps };
export { Paragraph };
