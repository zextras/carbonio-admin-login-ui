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
pkgver="0.9.0"
pkgrel="1"
pkgdesc="Zextras login page assets"
pkgdesclong=(
  "Zextras login page assets"
)
maintainer="Zextras <packages@zextras.com>"
arch="amd64"
license=("PROPRIETARY")
section="admin"
priority="optional"
url="https://www.zextras.com/"
depends=(
  "carbonio-nginx"
)

build() {
}

preinst() {
}

package() {
  cd "${srcdir}"
  mkdir -p "${pkgdir}/opt/zextras/admin/login/"
  cp -a  ../build/* "${pkgdir}/opt/zextras/admin/login"
  chown root:root -R "${pkgdir}/opt/zextras/admin/login"
  chmod 755 -R "${pkgdir}/opt/zextras/admin/login"
}

postinst() {
}

prerm() {
}

postrm() {
}
