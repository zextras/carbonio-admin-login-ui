<!--
SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>

SPDX-License-Identifier: CC0-1.0
-->

# Carbonio Admin Login UI

<p align="center">
  <a href="https://github.com/zextras/carbonio-admin-login-ui/graphs/contributors" alt="Contributors">
  <img src="https://img.shields.io/github/contributors/zextras/carbonio-admin-login-ui" /></a>
  <a href="https://github.com/zextras/carbonio-admin-login-ui/pulse" alt="Activity">
  <img src="https://img.shields.io/github/commit-activity/m/zextras/carbonio-admin-login-ui" /></a>
  <img src="https://img.shields.io/badge/license-AGPL%203-green" alt="License AGPL 3">
  <img src="https://img.shields.io/badge/project-carbonio-informational" alt="Project Carbonio">
  <a href="https://twitter.com/intent/follow?screen_name=zextras">
  <img src="https://img.shields.io/twitter/follow/zextras?style=social&logo=twitter" alt="Follow on Twitter"><a/>
</p>

Carbonio Admin Login UI is the authentication web application for the Carbonio Admin Panel. It provides a secure and user-friendly login interface for administrators to access the Carbonio administration console.

## Quick Start

### Prerequisites

- Docker or Podman installed
- Make

### Building Packages

```bash
# Build packages for Ubuntu 22.04
make build TARGET=ubuntu-jammy

# Build packages for Rocky Linux 9
make build TARGET=rocky-9

# Build packages for Ubuntu 24.04
make build TARGET=ubuntu-noble
```

### Supported Targets

- `ubuntu-jammy` - Ubuntu 22.04 LTS
- `ubuntu-noble` - Ubuntu 24.04 LTS
- `rocky-8` - Rocky Linux 8
- `rocky-9` - Rocky Linux 9

### Configuration

You can customize the build by setting environment variables:

```bash
# Use a specific container runtime
make build TARGET=ubuntu-jammy CONTAINER_RUNTIME=docker

# Use a different output directory
make build TARGET=rocky-9 OUTPUT_DIR=./my-packages
```

## Installation

This package is distributed as part of the [Carbonio platform](https://zextras.com/carbonio). To install:

### Ubuntu (Jammy/Noble)

```bash
apt-get install carbonio-admin-login-ui
```

### Rocky Linux (8/9)

```bash
yum install carbonio-admin-login-ui
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE.txt](LICENSE.txt) file for details.
