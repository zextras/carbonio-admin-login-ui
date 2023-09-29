# SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only

# Zextras Login Page
# This package contains the assets for the browser login page

targets=(
  "centos"
  "ubuntu"
)
pkgname="carbonio-admin-login-ui"
pkgver="0.9.13"
pkgrel="1"
pkgdesc="Carbonio admin login page assets"
pkgdesclong=(
  "Carbonio admin login page assets"
)
maintainer="Zextras <packages@zextras.com>"
arch="amd64"
license=("PROPRIETARY")
section="admin"
priority="optional"
url="https://www.zextras.com/"

package() {
  cd "${srcdir}"
  mkdir -p "${pkgdir}/opt/zextras/admin/login/"
  cp -a  ../build/* "${pkgdir}/opt/zextras/admin/login"
}

postinst() {
  chown root:root -R /opt/zextras/admin/login
  chmod 755 -R /opt/zextras/admin/login
  chmod 644 /opt/zextras/admin/login/assets/*
}
