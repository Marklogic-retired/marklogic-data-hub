#!/bin/bash

if [ "${TRAVIS_SECURE_ENV_VARS}" = "true" ] ; then
  ./travis-install-ml.sh release
  ./setup-marklogic.sh
fi
