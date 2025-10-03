FROM alpine

RUN apk add --no-cache jq

COPY dist /tmp/build

RUN ADMIN_PATH="/opt/zextras/admin/login" \
&& mkdir -p "${ADMIN_PATH}" \
&& cp -r /tmp/build/* "${ADMIN_PATH}" \
&& rm -r /tmp/build
