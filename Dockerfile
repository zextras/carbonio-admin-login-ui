FROM --platform=$BUILDPLATFORM alpine:3.22.2 AS builder

ENV WEB_PATH="/opt/zextras/admin/login"

# Set up directories
RUN mkdir -p "${WEB_PATH}"

# Copy application files
COPY dist ${WEB_PATH}/

# Final stage - built for all target platforms
FROM alpine:3.22.2

# Just copy the prepared files (no execution needed)
COPY --from=builder /opt/zextras /opt/zextras
