/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';

import pkg from './package.json';

const config = (
	env: Record<string, unknown>,
	args: { mode?: webpack.Configuration['mode'] }
): webpack.Configuration & webpackDevServer.Configuration => {
	const pkgRel = args.mode === 'development' ? Date.now() : 1;
	return {
		mode: args.mode,
		devtool: 'source-map',
		entry: {
			index: path.resolve(process.cwd(), 'src', 'index.jsx')
		},
		output: {
			path: `${__dirname}/dist`
		},
		target: 'web',
		devServer: {
			webSocketServer: false,
			proxy: [
				{
					path: '/carbonioAdmin',
					// target: 'https://infra-848931f5.testarea.zextras.com',
					// target: 'https://localhost:7071/',
					target: 'https://np-s04.demo.zextras.io:6071/',
					secure: true,
					changeOrigin: true
				},
				{
					path: '/service',
					// target: 'https://infra-848931f5.testarea.zextras.com',
					// target: 'https://localhost:7071/',
					target: 'https://np-s04.demo.zextras.io:7071/',
					secure: true,
					changeOrigin: true
				},
				{
					path: '/zx',
					target: 'https://np-s04.demo.zextras.io:6071/',
					secure: false
				}
			]
		},
		resolve: {
			extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
			alias: {
				assets: path.resolve(process.cwd(), 'assets')
			}
		},
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				},
				{
					test: /\.html$/,
					use: [
						{
							loader: 'html-loader'
						}
					]
				},
				{
					test: /\.(css)$/,
					exclude: [/node_modules\/tinymce/],
					use: [
						{
							loader: 'style-loader'
						},
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true
							}
						}
					]
				},
				{
					test: /\.(png|jpg|gif|woff2?|svg|eot|ttf|ogg|mp3)$/,
					// exclude: /assets/,
					use: [
						{
							loader: 'file-loader',
							options: {
								outputPath: 'assets'
							}
						}
					]
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin({
				patterns: [
					{ from: 'src/mockServiceWorker.js', to: 'mockServiceWorker.js' },
					{ from: './package/yap.json', to: '.' },
					{
						from: './package/PKGBUILD.template',
						to: 'package/PKGBUILD',
						toType: 'file',
						transform: (content): string => {
							return content
								.toString()
								.replaceAll('{{version}}', pkg.version)
								.replaceAll('{{pkgRel}}', `${pkgRel}`);
						}
					},
					{ from: 'src/mockServiceWorker.js', to: 'mockServiceWorker.js' }
				]
			}),
			new HtmlWebpackPlugin({
				inject: true,
				template: './src/index.html',
				filename: './index.html',
				chunks: ['index'],
				meta: {
					'app-version': pkg.version
				}
			}),
			new Dotenv({
				ignoreStub: true
			})
		]
	};
};

export default config;
