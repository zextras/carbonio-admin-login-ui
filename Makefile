# SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only

# Makefile for building carbonio-admin-login-ui packages using YAP
#
# Usage:
#   make build TARGET=ubuntu-jammy           # Build packages for Ubuntu 22.04
#   make clean                               # Clean build artifacts
#
# Supported targets:
#   ubuntu-jammy, ubuntu-noble, rocky-8, rocky-9

# Configuration
.DEFAULT_GOAL := build
YAP_IMAGE_PREFIX ?= docker.io/m0rf30/yap
YAP_VERSION ?= 1.47
CONTAINER_RUNTIME ?= $(shell command -v docker >/dev/null 2>&1 && echo docker || echo podman)

# Build directories
OUTPUT_DIR ?= artifacts

# CCache directory for build caching
CCACHE_DIR ?= $(CURDIR)/.ccache

# Default target (can be overridden)
TARGET ?= ubuntu-jammy

# Container image name (format: docker.io/m0rf30/yap-<target>:<version>)
YAP_IMAGE = $(YAP_IMAGE_PREFIX)-$(TARGET):$(YAP_VERSION)

# Container name
CONTAINER_NAME ?= yap-$(TARGET)

# Container options
CONTAINER_OPTS = --rm -ti \
	--name $(CONTAINER_NAME) \
	-v $(CURDIR):/project \
	-v $(CURDIR)/$(OUTPUT_DIR):/artifacts

.PHONY: all build build-js build-package clean pull list-targets help

# Default target
all: build

## build: Build everything (JS + packages) for the specified TARGET
build: build-js build-package

## build-js: Install dependencies and build JavaScript/TypeScript
build-js:
	@echo "Installing npm dependencies..."
	npm install
	@echo "Building JavaScript/TypeScript..."
	npm run build
	@echo "Preparing package sources..."
	cp dist/package/PKGBUILD package/PKGBUILD
	tar -czf package/carbonio-admin-login-ui-dist.tar.gz dist

## build-package: Build distribution packages for the specified TARGET
build-package:
	@echo "Building packages for $(TARGET)..."
	@mkdir -p $(OUTPUT_DIR) $(CCACHE_DIR)
	$(CONTAINER_RUNTIME) run $(CONTAINER_OPTS) $(YAP_IMAGE) build $(TARGET) /project/package

## pull: Pull the YAP container image for the specified TARGET
pull:
	@echo "Pulling YAP image for $(TARGET)..."
	$(CONTAINER_RUNTIME) pull $(YAP_IMAGE)

## clean: Remove build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(OUTPUT_DIR) dist node_modules package/PKGBUILD package/$(PKGNAME)-dist.tar.gz

## list-targets: List supported distribution targets
list-targets:
	@echo "Supported distribution targets:"
	@echo ""
	@echo "  ubuntu-jammy    (Ubuntu 22.04 LTS)"
	@echo "  ubuntu-noble    (Ubuntu 24.04 LTS)"
	@echo "  rocky-8         (Rocky Linux 8)"
	@echo "  rocky-9         (Rocky Linux 9)"
	@echo ""
	@echo "Usage: make build TARGET=<target>"

## help: Show this help message
help:
	@echo "Carbonio Admin Login UI - Build System"
	@echo ""
	@echo "This Makefile builds carbonio-admin-login-ui packages using YAP"
	@echo "(Yet Another Packager) in Docker/Podman containers."
	@echo ""
	@echo "Usage:"
	@echo "  make <target> [TARGET=<distro>] [OPTIONS]"
	@echo ""
	@echo "Targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /' | column -t -s ':'
	@echo ""
	@echo "Options:"
	@echo "  TARGET             Distribution target (default: $(TARGET))"
	@echo "  YAP_IMAGE_PREFIX   YAP image prefix (default: $(YAP_IMAGE_PREFIX))"
	@echo "  YAP_VERSION        YAP image version (default: $(YAP_VERSION))"
	@echo "  CONTAINER_RUNTIME  Container runtime (default: podman)"
	@echo "  CONTAINER_NAME     Container name (default: $(CONTAINER_NAME))"
	@echo "  OUTPUT_DIR         Output directory for packages (default: $(OUTPUT_DIR))"
	@echo "  CCACHE_DIR         CCache directory for build caching (default: $(CCACHE_DIR))"
	@echo ""
	@echo "Examples:"
	@echo "  make build TARGET=ubuntu-jammy      # Build everything for Ubuntu 22.04"
	@echo "  make build TARGET=rocky-9           # Build everything for Rocky Linux 9"
	@echo "  make build-js                       # Build only JS/TS"
	@echo "  make build-package TARGET=ubuntu-jammy  # Build only packages"
	@echo "  make pull TARGET=ubuntu-noble       # Pull YAP image for Ubuntu 24.04"
	@echo ""
