/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import swc from 'unplugin-swc';
import { createBootstrapRolldownOptions } from './vite.rolldown.config';

function copyYapJson(): Plugin {
  return {
    name: 'copy-yap-json',
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      fs.copyFileSync(path.resolve(__dirname, 'yap.json'), path.resolve(outDir, 'yap.json'));
    },
  };
}

function copyPkgBuild(isDev: boolean): Plugin {
  return {
    name: 'copy-pkgbuild',
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
      const template = fs.readFileSync(
        path.resolve(__dirname, 'package/PKGBUILD.template'),
        'utf-8',
      );
      const content = template
        .replaceAll('{{version}}', pkg.version)
        .replaceAll('{{pkgRel}}', `${isDev ? Date.now() : 1}`);
      const destDir = path.resolve(outDir, 'package');
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(path.resolve(destDir, 'PKGBUILD'), content);
    },
  };
}

function copyMockServiceWorker(): Plugin {
  return {
    name: 'copy-mock-service-worker',
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      fs.copyFileSync(
        path.resolve(__dirname, 'src/mockServiceWorker.js'),
        path.resolve(outDir, 'mockServiceWorker.js'),
      );
    },
  };
}

function htmlMetaVersion(): Plugin {
  return {
    name: 'html-meta-version',
    transformIndexHtml(html) {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
      return html.replace(
        '</head>',
        `  <meta name="app-version" content="${pkg.version}" />\n  </head>`,
      );
    },
  };
}

function getProxyTarget(): string {
  const target = process.env['VITE_TARGET'] || 'localhost';
  return `https://${target}:6071`;
}

function withLocationRewrite(config: {
  target: string;
  changeOrigin: boolean;
  secure: boolean;
}): object {
  return {
    ...config,
    cookieDomainRewrite: { '*': 'localhost' },
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        const targetUrl = new URL(config.target);
        proxyReq.setHeader('Origin', targetUrl.origin);
        if (req.headers['referer']) {
          proxyReq.setHeader(
            'Referer',
            req.headers['referer'].replace('http://localhost:3000', targetUrl.origin),
          );
        }
      });

      proxy.on('proxyRes', (proxyRes: any) => {
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          if (Array.isArray(cookies)) {
            proxyRes.headers['set-cookie'] = cookies.map((cookie: string) =>
              cookie.replace(/;\s*Secure/gi, '').replace(/;\s*SameSite=\w+/gi, ''),
            );
          } else if (typeof cookies === 'string') {
            proxyRes.headers['set-cookie'] = cookies
              .replace(/;\s*Secure/gi, '')
              .replace(/;\s*SameSite=\w+/gi, '');
          }
        }
        const location = proxyRes.headers['location'];
        if (location) {
          proxyRes.headers['location'] = location.replace(
            /https:\/\/[^/]+/,
            'http://localhost:3000',
          );
        }
      });
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const basePath = '/static/login/';
  const isServeCommand = command === 'serve';
  const isDev = mode === 'development';
  const proxyTarget = getProxyTarget();
  if (isServeCommand) {
    // eslint-disable-next-line no-console
    console.log('Proxy target:', proxyTarget);
  }

  return {
    plugins: [
      copyYapJson(),
      copyPkgBuild(isDev),
      copyMockServiceWorker(),
      htmlMetaVersion(),
      swc.vite({
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            decoratorVersion: '2023-11',
          },
        },
      }),
      svgr({
        svgrOptions: {
          ref: true,
          svgo: false,
          titleProp: true,
          exportType: 'default',
        },
        include: '**/*.svg',
        exclude: '**/src/assets/**/*.svg',
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      BASE_PATH: JSON.stringify(basePath),
    },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      sourcemap: isDev,
      rollupOptions: createBootstrapRolldownOptions(),
    },
    base: '/static/login/',
    publicDir: 'assets',
    ...(isDev
      ? {
          server: {
            port: 3000,
            strictPort: false,
            proxy: {
              '/static/login/i18n': {
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              },
              '/zx': {
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              },
              '/login': withLocationRewrite({
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              }),
              '/services': withLocationRewrite({
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              }),
              '/service': withLocationRewrite({
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
              }),
            },
          },
        }
      : {}),
  };
});
