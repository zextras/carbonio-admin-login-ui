// SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

library(
    identifier: 'jenkins-lib-ui@1.0.11',
    retriever: modernSCM([
        $class: 'GitSCMSource',
        credentialsId: 'jenkins-integration-with-github-account',
        remote: 'git@github.com:zextras/jenkins-lib-ui.git',
    ])
)

zappPipeline(
    disableAutoTranslationsSync: true,
    preTestScript: 'pnpm dlx playwright@1.58.2 install --with-deps chromium',
    testScript: 'test:ci'
)
