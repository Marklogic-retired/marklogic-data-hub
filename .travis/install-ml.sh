#!/bin/bash

test $1 && MLBUILD_USER=$1
test $2 && MLBUILD_PASSWORD=$2
test $3 && ML_VERSION=$3
echo "ML_VERSION = ${ML_VERSION}"
MAJOR_VER=$(sed -e 's#\([^.]*\)\..*#\1#' <<< $ML_VERSION)
echo "major version = ${MAJOR_VER}"
if [ "${MAJOR_VER}" = "8" ]; then
  echo "/tmp/install-ml-8.sh"
  chmod 755 /tmp/install-ml-8.sh
  /tmp/install-ml-8.sh ${MLBUILD_USER} ${MLBUILD_PASSWORD} ${ML_VERSION}
elif [ "${MAJOR_VER}" = "9" ]; then
  echo "/tmp/install-ml-9.sh"
  chmod 755 /tmp/install-ml-9.sh
  /tmp/install-ml-9.sh ${MLBUILD_USER} ${MLBUILD_PASSWORD} ${ML_VERSION}
elif [ "${MAJOR_VER}" = "10" ]; then
  echo "/tmp/install-ml-10.sh"
  chmod 755 /tmp/install-ml-10.sh
  /tmp/install-ml-10.sh ${MLBUILD_USER} ${MLBUILD_PASSWORD} ${ML_VERSION}
else
  echo "NOTHING TO INSTALL!"
  exit 1
fi
