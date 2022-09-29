/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const commitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim();
const babelRCApp = require('./babel.config.js');
const baseStaticPath = `/static/iris/carbonio-admin-login-ui/${commitHash}/`;

module.exports = (conf, pkg, options, mode) => {
	const server = `https://${options.host}`;
	const root = 'carbonioAdmin';
	conf.entry = {
		index: path.resolve(process.cwd(), 'src', 'index.jsx')
	};
	conf.output.filename =
		mode === 'development' ? 'zapp-admin-login.bundle.js' : '[name].[chunkhash:8].js';
	conf.resolve.extensions.push('.d.ts');
	conf.plugins.push(
		new CopyPlugin({
			patterns: [
				{
					from: 'assets/',
					to: ''
				}
			]
		}),
		new DefinePlugin({
			COMMIT_ID: JSON.stringify(commitHash.toString().trim()),
			BASE_PATH: JSON.stringify(baseStaticPath)
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: path.resolve(process.cwd(), 'src', 'index.html'),
			chunks: ['index'],
			BASE_PATH: baseStaticPath,
			SHELL_ENV: root
		}),
		new HtmlWebpackPlugin({
			inject: false,
			template: path.resolve(process.cwd(), 'commit.template'),
			filename: 'commit',
			COMMIT_ID: commitHash
		})
	);
	conf.module = {
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules/,
				loader: require.resolve('babel-loader'),
				options: babelRCApp
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
				exclude: [
					/node_modules\/tinymce/
				],
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
	conf.devServer = {
		port: 9000,
		historyApiFallback: {
			index: `${baseStaticPath}/index.html`,
			rewrites: [
				{
					from: new RegExp(`/${root}/*`),
					to: `${baseStaticPath}/index.html`
				}
			]
		},
		server: 'https',
		open: [`/${root}/`],
		proxy: [
			{
				context: ['/static/login/**'],
				target: server,
				secure: false,
				cookieDomainRewrite: {
					'*': server,
					[server]: 'localhost:9000'
				}
			},
			{
				context: ['!/static/iris/carbonio-admin-login-ui/**/*', `!/${root}/`, `!/${root}/**/*`],
				target: server,
				secure: false,
				logLevel: 'debug',
				cookieDomainRewrite: {
					'*': server,
					[server]: 'localhost:9000'
				}
			}
		]
	};
	conf.externals = {};
	return conf;
};
