/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isSafeRedirect } from '../utils';

const ORIGIN = 'https://mail.example.com';

describe('isSafeRedirect', () => {
	const originalLocation = window.location;

	beforeEach(() => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: { ...originalLocation, origin: ORIGIN }
		});
	});

	afterEach(() => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: originalLocation
		});
	});

	describe('should allow safe URLs', () => {
		it.each([
			['/', 'root path'],
			['/inbox', 'simple relative path'],
			['/mail/inbox?page=1', 'relative path with query string'],
			['/settings#account', 'relative path with fragment'],
			[`${ORIGIN}/inbox`, 'absolute same-origin URL'],
			[`${ORIGIN}/mail/inbox?page=1&sort=date`, 'absolute same-origin with query params'],
			['relative-path', 'plain relative segment'],
			['', 'empty string']
		])('%s (%s)', (url) => {
			expect(isSafeRedirect(url)).toBe(true);
		});
	});

	describe('should block dangerous URLs', () => {
		it.each([
			['https://evil.com', 'external domain'],
			['https://evil.com/phishing-page', 'external domain with path'],
			['http://mail.example.com/inbox', 'same host but different scheme (http vs https)'],
			['https://subdomain.mail.example.com', 'subdomain of current origin'],
			['https://mail.example.com.evil.com', 'origin embedded in attacker domain'],
			['//evil.com', 'protocol-relative external URL'],
			['javascript:alert(document.cookie)', 'javascript: scheme'],
			['javascript:void(0)', 'javascript:void'],
			['javascript:eval(alert(1))', 'javascript:eval'],
			['data:text/html,<script>alert(1)</script>', 'data: URI with script'],
			['data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', 'data: URI base64 encoded'],
			['vbscript:msgbox("xss")', 'vbscript: scheme'],
			['blob:https://evil.com/some-id', 'blob: URI'],
			['ftp://files.example.com/secret', 'ftp: scheme']
		])('%s (%s)', (url) => {
			expect(isSafeRedirect(url)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should block URLs with credentials in them', () => {
			expect(isSafeRedirect('https://user:pass@evil.com')).toBe(false);
		});

		it('should handle URLs with leading whitespace', () => {
			expect(isSafeRedirect('  /inbox')).toBe(true);
		});

		it('should handle backslash-based bypass attempts', () => {
			const result = isSafeRedirect('\\\\evil.com');
			expect(result).toBe(false);
		});

		it('should handle null bytes', () => {
			expect(isSafeRedirect('/inbox\0.evil.com')).toBe(true);
		});
	});
});
