#!/bin/sh
echo "Disabling service: hub-central"
systemctl --no-reload disable --now hub-central