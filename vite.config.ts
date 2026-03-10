/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json';


const rootDir = './';
const packageName = 'carbonio-admin-ui';
const basePath = `/static/iris/${packageName}/`;

function getProxyTarget(): string {
  const target = process.env.VITE_TARGET || 'localhost';
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

export default defineConfig(({ mode }) => {
	const pkgRel = mode === 'development' ? Date.now() : 1;
  const proxyTarget = getProxyTarget();

	return {
		root: 'src',
		esbuild: {
			target: 'esnext'
		},
		plugins: [
    react({
        babel: {
          plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
        },
      }),
			viteStaticCopy({
				targets: [
					{ src: '../package/yap.json', dest: '.' },
					{
						src: '../package/PKGBUILD.template',
						dest: 'package',
						rename: 'PKGBUILD',
						transform: (content: Buffer) => {
							return content
								.toString()
								.replaceAll('{{version}}', pkg.version)
								.replaceAll('{{pkgRel}}', `${pkgRel}`);
						}
					},
					{ src: 'mockServiceWorker.js', dest: '.' }
				]
			})
		],
		resolve: {
			alias: {
				assets: resolve(__dirname, 'assets')
			}
		},
		define: {
			'import.meta.env.VITE_PACKAGE_VERSION': JSON.stringify(pkg.version)
		},
		build: {
			outDir: '../dist',
			emptyDirBeforeWrite: true,
			sourcemap: true
		},
		        server: {
            port: 3000,
            strictPort: false,
            // proxy: {
            //   '/carbonioAdmin/static': {
            //     target: proxyTarget,
            //     changeOrigin: true,
            //     secure: false,
            //     rewrite: (path) => path.replace(/^\/carbonioAdmin\/static/, '/static'),
            //     followRedirects: true,
            //   },
            //   '/logout': {
            //     target: proxyTarget,
            //     changeOrigin: true,
            //     secure: false,
            //   },
            //   '/zx': {
            //     target: proxyTarget,
            //     changeOrigin: true,
            //     secure: false,
            //   },
            //   '/services': {
            //     target: proxyTarget,
            //     changeOrigin: true,
            //     secure: false,
            //   },
            //   '/login': {
            //     target: proxyTarget,
            //     changeOrigin: true,
            //     secure: false,
            //   },
            //   '/service': {
            //     target: proxyTarget,
            //     changeOrigin: true,
            //     secure: false,
            //   },
            // },
          },
	};
});
