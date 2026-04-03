/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';

import { getDeviceModel, isSafeRedirect } from '../utils';

const ORIGIN = 'https://mail.example.com';

describe('isSafeRedirect', () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { ...originalLocation, origin: ORIGIN },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: originalLocation,
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
      ['', 'empty string'],
      ['https://saml-validation.com', 'https external domain'],
      ['http://saml-validation.com', 'http external domain'],
      ['http://mail.example.com/inbox', 'same host but different scheme (http vs https)'],
    ])('%s (%s)', (url) => {
      expect(isSafeRedirect(url)).toBe(true);
    });
  });

  describe('should block dangerous URLs', () => {
    it.each([
      ['javascript:alert(document.cookie)', 'javascript: scheme'],
      ['javascript:void(0)', 'javascript:void'],
      ['javascript:eval(alert(1))', 'javascript:eval'],
      ['data:text/html,<script>alert(1)</script>', 'data: URI with script'],
      ['data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', 'data: URI base64 encoded'],
      ['vbscript:msgbox("xss")', 'vbscript: scheme'],
      ['blob:https://evil.com/some-id', 'blob: URI'],
      ['ftp://files.example.com/secret', 'ftp: scheme'],
    ])('%s (%s)', (url) => {
      expect(isSafeRedirect(url)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should block falsy values', () => {
      expect(isSafeRedirect(null)).toBe(false);
    });

    it('should handle backslash-based bypass attempts', () => {
      const result = isSafeRedirect('\\\\evil.com');
      expect(result).toBe(false);
    });
  });
});

describe('getDeviceModel', () => {
  const originalUserAgent = navigator.userAgent;

  function mockUserAgent(ua: string): void {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () => ua,
    });
  }

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () => originalUserAgent,
    });
  });

  describe('browser detection', () => {
    it('should detect Firefox', () => {
      mockUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Firefox/120.0');
      expect(getDeviceModel()).toContain('Firefox 120.0');
    });

    it('should detect Edge', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/119.0.0.0');
      expect(getDeviceModel()).toContain('Edge 119.0');
    });

    it('should detect Chrome', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0 Safari/537.36');
      expect(getDeviceModel()).toContain('Chrome 118.0');
    });

    it('should detect Safari', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 Version/17.1 Safari/605.1.15');
      expect(getDeviceModel()).toContain('Safari 17.1');
    });

    it('should return Unknown browser when no match', () => {
      mockUserAgent('curl/7.68.0');
      expect(getDeviceModel()).toContain('Unknown Unknown');
    });
  });

  describe('os detection', () => {
    it('should detect Windows 10', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0');
      expect(getDeviceModel()).toContain('Windows 10');
    });

    it('should detect Windows 8.1', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64) Chrome/118.0');
      expect(getDeviceModel()).toContain('Windows 8.1');
    });

    it('should detect Windows 8', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 6.2; Win64; x64) Chrome/118.0');
      expect(getDeviceModel()).toContain('Windows 8');
    });

    it('should detect Windows 7', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) Chrome/118.0');
      expect(getDeviceModel()).toContain('Windows 7');
    });

    it('should detect macOS with underscore version', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) Chrome/118.0');
      expect(getDeviceModel()).toContain('macOS 14.1');
    });

    it('should detect Linux without version', () => {
      mockUserAgent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64) Chrome/118.0');
      expect(getDeviceModel()).toContain('Linux Unknown');
    });

    it('should match Linux for Android UA since Linux is checked before Android', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 13) Chrome/118.0');
      expect(getDeviceModel()).toContain('Linux Unknown');
    });

    it('should match macOS for iPhone UA since Mac OS X is checked before iPhone', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) Chrome/118.0');
      expect(getDeviceModel()).toContain('macOS');
    });

    it('should match macOS for iPad UA since Mac OS X is checked before iPad', () => {
      mockUserAgent('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Chrome/118.0');
      expect(getDeviceModel()).toContain('macOS');
    });

    it('should return Unknown OS when no match', () => {
      mockUserAgent('curl/7.68.0');
      expect(getDeviceModel()).toMatch(/\/Unknown Unknown$/);
    });
  });

  describe('mobile detection', () => {
    it('should prefix with Mobile for Android devices', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 13) Chrome/118.0');
      expect(getDeviceModel()).toMatch(/^Mobile Chrome 118.0/);
    });

    it('should not prefix with Mobile for desktop Chrome on Windows', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0');
      expect(getDeviceModel()).toMatch(/^Chrome 118.0\/Windows 10$/);
    });

    it('should prefix with Mobile for iPhone', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) Chrome/118.0');
      expect(getDeviceModel()).toMatch(/^Mobile Chrome 118.0/);
    });

    it('should prefix with Mobile for iPad', () => {
      mockUserAgent('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Chrome/118.0');
      expect(getDeviceModel()).toMatch(/^Mobile Chrome 118.0/);
    });
  });

  describe('full output format', () => {
    it('should format desktop Chrome on Windows as "Chrome version/Windows version"', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0');
      expect(getDeviceModel()).toBe('Chrome 118.0/Windows 10');
    });

    it('should format Firefox on Linux as "Firefox version/Linux Unknown"', () => {
      mockUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Firefox/120.0');
      expect(getDeviceModel()).toBe('Firefox 120.0/Linux Unknown');
    });

    it('should format unknown browser and OS as "Unknown Unknown/Unknown Unknown"', () => {
      mockUserAgent('curl/7.68.0');
      expect(getDeviceModel()).toBe('Unknown Unknown/Unknown Unknown');
    });
  });
});
