#!/usr/bin/env sh
set -eu

envsubst '${API_URL} ${SSL_CERT} ${SSL_KEY}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"