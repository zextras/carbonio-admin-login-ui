/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import { TextDecoder, TextEncoder } from 'util';

// Polyfill web streams for MSW compatibility with jsdom
global.ReadableStream = ReadableStream as unknown as typeof globalThis.ReadableStream;
global.WritableStream = WritableStream as unknown as typeof globalThis.WritableStream;
global.TransformStream = TransformStream as unknown as typeof globalThis.TransformStream;
global.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;

// Polyfill BroadcastChannel for MSW compatibility with jsdom
/* eslint-disable class-methods-use-this */
class BroadcastChannelPolyfill {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	postMessage(): void {}

	close(): void {}

	addEventListener(): void {}

	removeEventListener(): void {}

	onmessage: ((event: MessageEvent) => void) | null = null;

	onmessageerror: ((event: MessageEvent) => void) | null = null;
}
/* eslint-enable class-methods-use-this */
global.BroadcastChannel = BroadcastChannelPolyfill as unknown as typeof BroadcastChannel;

window.matchMedia = function matchMedia(query: string): MediaQueryList {
	return {
		matches: false,
		media: query,
		onchange: null,
		addListener: noop, // Deprecated
		removeListener: noop, // Deprecated
		addEventListener: noop,
		removeEventListener: noop,
		dispatchEvent: (): boolean => true
	};
};
