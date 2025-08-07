<!--
SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>

SPDX-License-Identifier: CC0-1.0
-->

---
title: Translations
---

Translations are managed by [Weblate][2] on a repository which is hosted on [bitbucket][1]. This repository is
a subtree located at the `/translations/` path within this repository.

## Workflow
The workflow described is part of the build configuration.

1. The developer use a string into the code defining a [default value][3] according to the designs received.
Designs MUST contain approved strings.
    ```js
   import { useTranslation } from 'react-i18next';
   
   const { t } = useTranslation();
   t('help_phone_number', 'Please call this number');
   ```

1. During the merge into `beta` branch the strings will be extracted by a [babel plugin][4] and pushed into the
dedicated repository.

1. Translators will translate the strings on the translation platform.

1. During the merge into `release` branch the strings will be pulled from the dedicated repository and committed
for the build. The commit will be also sent to the `devel` branch.

## Subtree setup
### Add the subtree
```shell script
git subtree add --squash --prefix translations/ git@bitbucket.org:zextras/com_zextras_iris_login.git master
```
### Push translations
```shell script
git subtree push --squash --prefix translations/ git@bitbucket.org:zextras/com_zextras_iris_login.git master
```
### Pull translations
```shell script
git subtree pull --squash --prefix translations/ git@bitbucket.org:zextras/com_zextras_iris_login.git master
```

[1]: https://bitbucket.org/zextras/com_zextras_iris_login`
[2]: https://translate.zextras.tools/projects/iris-mail/com_zextras_iris_login/
[3]: https://www.i18next.com/translation-function/essentials#passing-a-default-value
[4]: https://github.com/gilbsgilbs/babel-plugin-i18next-extract
