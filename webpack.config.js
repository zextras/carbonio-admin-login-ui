// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const babelRCApp = require('./babel.config.app.js');
const pkg = require('./package.json');

const pathsToCopy = [
	{ from: 'translations', to: 'i18n' },
	{ from: 'src/mockServiceWorker.js', to: 'mockServiceWorker.js' }
];

module.exports = (env) => {
	return {
		devtool: 'source-map',
		entry: {
			index: path.resolve(process.cwd(), 'src', 'index.jsx')
		},
		output: {
			path: `${__dirname}/build`
		},
		target: 'web',
		devServer: {
			proxy: {
				'/zx': {
					target: 'https://infra-848931f5.testarea.zextras.com',
					secure: false
				}
			}
		},
		resolve: {
			extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
			alias: {
				'assets': path.resolve(process.cwd(), 'assets')
			}
		},
		module: {
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
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin({
				patterns: pathsToCopy,
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
	}
}
