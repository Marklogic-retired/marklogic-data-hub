#!/bin/sh
STATUS="$(systemctl is-active hub-central)"
if [ "${STATUS}" = "active" ]; then
    echo "hub-central service is already running. Exiting installation."
    exit 1
fi

echo "Creating group: hc-runner"
groupadd -f -r hc-runner

echo "Creating user: hc-runner"
useradd -r -g hc-runner -c "hub-central user" hc-runner