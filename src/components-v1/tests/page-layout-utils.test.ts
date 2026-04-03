/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { CARBONIO_LOGO_URL } from '../../constants';
import type { GetLoginConfigResponse } from '../../services/login-page-services';
import {
  applyV3Customization,
  configureBasicSettings,
  createLogoObject,
  processLoginConfig,
  setDocumentTitle,
  setFavicon,
} from '../page-layout-utils';

describe('configureBasicSettings', () => {
  it('should set background and mark as non-default when loginPageBackgroundImage is present', () => {
    const setBg = vi.fn();
    const setIsDefaultBg = vi.fn();

    configureBasicSettings({
      res: { loginPageBackgroundImage: 'custom-bg.png' },
      setBg,
      setIsDefaultBg,
    });

    expect(setBg).toHaveBeenCalledWith('custom-bg.png');
    expect(setIsDefaultBg).toHaveBeenCalledWith(false);
  });

  it('should do nothing when loginPageBackgroundImage is absent', () => {
    const setBg = vi.fn();
    const setIsDefaultBg = vi.fn();

    configureBasicSettings({ res: {}, setBg, setIsDefaultBg });

    expect(setBg).not.toHaveBeenCalled();
    expect(setIsDefaultBg).not.toHaveBeenCalled();
  });
});

describe('createLogoObject', () => {
  it('should return default logo when no custom fields are set', () => {
    const logo = createLogoObject({});

    expect(logo.image).toBeDefined();
    expect(logo.width).toBe('221px');
    expect(logo.url).toBe('');
  });

  it('should use loginPageLogo and set width to 100% when provided', () => {
    const logo = createLogoObject({ loginPageLogo: 'custom-logo.png' });

    expect(logo.image).toBe('custom-logo.png');
    expect(logo.width).toBe('100%');
    expect(logo.url).toBe('');
  });

  it('should set url from loginPageSkinLogoUrl when provided', () => {
    const logo = createLogoObject({ loginPageSkinLogoUrl: 'https://skin.example.com' });

    expect(logo.url).toBe('https://skin.example.com');
    expect(logo.width).toBe('221px');
  });

  it('should apply both loginPageLogo and loginPageSkinLogoUrl together', () => {
    const logo = createLogoObject({
      loginPageLogo: 'custom-logo.png',
      loginPageSkinLogoUrl: 'https://skin.example.com',
    });

    expect(logo.image).toBe('custom-logo.png');
    expect(logo.width).toBe('100%');
    expect(logo.url).toBe('https://skin.example.com');
  });
});

describe('setDocumentTitle', () => {
  afterEach(() => {
    document.title = '';
  });

  it('should set document title from res.loginPageTitle when present', () => {
    const t = vi.fn();
    setDocumentTitle({ loginPageTitle: 'My Admin Panel' }, t as never);

    expect(document.title).toBe('My Admin Panel');
    expect(t).not.toHaveBeenCalled();
  });

  it('should fall back to t() translation when loginPageTitle is absent', () => {
    const t = vi.fn().mockReturnValue('Carbonio Authentication');
    setDocumentTitle({}, t as never);

    expect(t).toHaveBeenCalledWith('carbonio_authentication', 'Carbonio Authentication');
    expect(document.title).toBe('Carbonio Authentication');
  });
});

describe('setFavicon', () => {
  afterEach(() => {
    document.head.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());
  });

  it('should update existing favicon link element', () => {
    const existing = document.createElement('link');
    existing.rel = 'icon';
    existing.href = 'old.ico';
    document.head.appendChild(existing);

    setFavicon('new-favicon.ico');

    const link = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.href).toContain('new-favicon.ico');
    expect(link.type).toBe('image/x-icon');
  });

  it('should create new link element when no favicon exists', () => {
    expect(document.querySelector("link[rel*='icon']")).toBeNull();

    setFavicon('brand-new.ico');

    const link = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.href).toContain('brand-new.ico');
    expect(link.type).toBe('image/x-icon');
  });
});

describe('applyV3Customization', () => {
  const baseLogo = { image: 'default.png', width: '221px', url: '' };

  it('should set document title from carbonioAdminUiTitle', () => {
    applyV3Customization({
      res: { carbonioAdminUiTitle: 'V3 Admin Title' },
      logo: baseLogo,
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner: vi.fn(),
    });

    expect(document.title).toBe('V3 Admin Title');
  });

  it('should call setFavicon when carbonioAdminUiFavicon is present', () => {
    applyV3Customization({
      res: { carbonioAdminUiFavicon: 'v3-icon.ico' },
      logo: baseLogo,
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner: vi.fn(),
    });

    const link = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.href).toContain('v3-icon.ico');
  });

  it('should set background and mark as non-default when carbonioAdminUiBackground is present', () => {
    const setBg = vi.fn();
    const setIsDefaultBg = vi.fn();

    applyV3Customization({
      res: { carbonioAdminUiBackground: 'v3-bg.png' },
      logo: baseLogo,
      setBg,
      setIsDefaultBg,
      setCopyrightBanner: vi.fn(),
    });

    expect(setBg).toHaveBeenCalledWith('v3-bg.png');
    expect(setIsDefaultBg).toHaveBeenCalledWith(false);
  });

  it('should update logo image and width from carbonioAdminUiLoginLogo', () => {
    const result = applyV3Customization({
      res: { carbonioAdminUiLoginLogo: 'v3-logo.png' },
      logo: baseLogo,
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner: vi.fn(),
    });

    expect(result.image).toBe('v3-logo.png');
    expect(result.width).toBe('100%');
  });

  it('should set copyright banner from carbonioAdminUiDescription', () => {
    const setCopyrightBanner = vi.fn();

    applyV3Customization({
      res: { carbonioAdminUiDescription: 'Copyright 2026' },
      logo: baseLogo,
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner,
    });

    expect(setCopyrightBanner).toHaveBeenCalledWith('Copyright 2026');
  });

  it('should fall back logo url to CARBONIO_LOGO_URL when carbonioLogoURL is absent', () => {
    const result = applyV3Customization({
      res: {},
      logo: baseLogo,
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner: vi.fn(),
    });

    expect(result.url).toBe(CARBONIO_LOGO_URL);
  });

  it('should use carbonioLogoURL when present', () => {
    const result = applyV3Customization({
      res: { carbonioLogoURL: 'https://custom.zextras.com' },
      logo: baseLogo,
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner: vi.fn(),
    });

    expect(result.url).toBe('https://custom.zextras.com');
  });
});

describe('processLoginConfig', () => {
  function createMocks() {
    return {
      setBg: vi.fn(),
      setIsDefaultBg: vi.fn(),
      setCopyrightBanner: vi.fn(),
      setLogo: vi.fn(),
      t: vi.fn().mockReturnValue('Carbonio Authentication'),
    };
  }

  afterEach(() => {
    document.title = '';
    document.head.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());
  });

  it('should apply basic settings, create logo, set title, and set favicon for version 2', () => {
    const mocks = createMocks();
    const res: GetLoginConfigResponse = {
      loginPageBackgroundImage: 'bg.png',
      loginPageTitle: 'Admin Title',
      loginPageFavicon: 'favicon.ico',
    };

    processLoginConfig({ res, version: 2, ...mocks, t: mocks.t as never });

    expect(mocks.setBg).toHaveBeenCalledWith('bg.png');
    expect(mocks.setIsDefaultBg).toHaveBeenCalledWith(false);
    expect(document.title).toBe('Admin Title');
    expect(mocks.setLogo).toHaveBeenCalledWith(
      expect.objectContaining({ width: '221px' }),
    );

    const link = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
    expect(link).toBeDefined();
    expect(link.href).toContain('favicon.ico');
  });

  it('should apply v3 customization when version is 3', () => {
    const mocks = createMocks();
    const res: GetLoginConfigResponse = {
      carbonioAdminUiTitle: 'V3 Title',
      carbonioAdminUiFavicon: 'v3-favicon.ico',
      carbonioAdminUiBackground: 'v3-bg.png',
      carbonioAdminUiLoginLogo: 'v3-logo.png',
      carbonioAdminUiDescription: 'V3 Copyright',
      carbonioLogoURL: 'https://v3.zextras.com',
    };

    processLoginConfig({ res, version: 3, ...mocks, t: mocks.t as never });

    expect(document.title).toBe('V3 Title');
    expect(mocks.setBg).toHaveBeenCalledWith('v3-bg.png');
    expect(mocks.setIsDefaultBg).toHaveBeenCalledWith(false);
    expect(mocks.setCopyrightBanner).toHaveBeenCalledWith('V3 Copyright');
    expect(mocks.setLogo).toHaveBeenCalledWith(
      expect.objectContaining({
        image: 'v3-logo.png',
        width: '100%',
        url: 'https://v3.zextras.com',
      }),
    );
  });

  it('should not call setFavicon when loginPageFavicon is absent for version 2', () => {
    const mocks = createMocks();

    processLoginConfig({ res: {}, version: 2, ...mocks, t: mocks.t as never });

    const link = document.querySelector("link[rel*='icon']");
    expect(link).toBeNull();
  });
});
