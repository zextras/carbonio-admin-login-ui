<!--
SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>

SPDX-License-Identifier: CC0-1.0
-->

---
title: Developer's Guide
---

This page contains the instructions for developers to contribute to the development of this application.

## Configuration

Before using the app, you must:

```shell script
git clone git@bitbucket.org:zextras/zapp-login.git    # download the repository from Bitbucket
nvm use
npm install                                           # install dependencies from npm
```

In order to function this application does some HTTP requests to a Zextras server.  
You can configure the URI of the server in `webpack.config.js` uncommenting lines:
```js
    // devServer: {
	// 	proxy: {
	// 		'/zx': {
	// 			target: 'TYPE-YOUR-URI-HERE',
	// 			secure: false
	// 		}
	// 	}
	// },
```
and specifying the URI in the field `target`.

Other useful command you can use are:
```shell script
npm run start               # run the application

npm run build               # build the application (you will find the files in folder `build`)
npm run lint                # execute linter
```

## Repository Architecture
The repository contains the fallowing sub-folders:
- `assets` contains the static files (e.g. images) used in the application
- `docs`  contains the files of the website of documentation: in sub-folder `docs` there are the
    markdown file of documentation
- `http` contains the files in which you can find the request to test the backend server
- `i18n` configuration files for the plugin that handle translations
- `src` the source code of the application
- `translations` contains the strings translated in foreign languages
- `zapp-ui` contains the design system of Zextras

## Application workflow
When loaded, the login page read from Url GET parameters:

- `destinationUrl` the url to be redirected to after the successful authentication;
- `domain` the domain used to configure the page.

Then:

1. It calls `/zx/login/supported` to get the supported versions of Zextras Login (this app) in the 
    cluster, and It loads the bundle (html/javascript source code) of the maximum supported version
2. Here the flows split according to version chosen

### Workflow v1
1. It calls `/zx/login/v1/config`, passing the domain, to get the customization to apply
    to the login page
1. It calls `/zx/auth/supported` to get the authentication methods and versions supported by
    the backend; based on this response the component `FormSelector` show the correct form 
    (currently only v1 is defined)
    - if `saml` is present in field `authMethods` the button will be visible.
