/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18n from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('i18next-http-backend', () => ({
  default: { type: 'backend', init: vi.fn(), read: vi.fn() },
}));

vi.mock('i18next-browser-languagedetector', () => ({
  default: {
    type: 'languageDetector',
    init: vi.fn(),
    detect: vi.fn(() => 'en'),
    cacheUserLanguage: vi.fn(),
  },
}));

describe('i18n.config', () => {
  let initSpy: ReturnType<typeof vi.spyOn>;
  let useSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    initSpy = vi.spyOn(i18n, 'init');
    useSpy = vi.spyOn(i18n, 'use').mockReturnValue(i18n);
  });

  it('should initialize i18next with correct configuration', async () => {
    await import('../i18n.config');

    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackLng: expect.arrayContaining(['en']),
        debug: false,
        interpolation: { escapeValue: false },
        backend: { loadPath: 'i18n/{{lng}}.json' },
      }),
    );
  });

  it('should register Backend and LanguageDetector plugins', async () => {
    await import('../i18n.config');

    expect(useSpy).toHaveBeenCalledTimes(2);
  });

  it('should configure missingKeyHandler that logs a warning', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await import('../i18n.config');

    const initCall = initSpy.mock.calls[0]?.[0];
    const handler = initCall?.missingKeyHandler;
    expect(handler).toBeDefined();

    handler!(['en'], 'translation', 'some_missing_key', '');

    expect(warnSpy).toHaveBeenCalledWith('Missing translation with key', 'some_missing_key');
  });
});
