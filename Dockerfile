# SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only

FROM --platform=$BUILDPLATFORM docker.io/library/alpine:3.24.1 AS builder

ENV WEB_PATH="/opt/zextras/admin/login"

# Set up directories
RUN mkdir -p "${WEB_PATH}"

# Copy application files
COPY dist ${WEB_PATH}/

# Final stage - built for all target platforms
FROM docker.io/library/alpine:3.24.1

# Just copy the prepared files (no execution needed)
COPY --from=builder /opt/zextras /opt/zextras
