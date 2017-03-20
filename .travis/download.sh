#!/bin/bash

# runs command from parameters and exits with the eoror code of the command
# if it fails
function successOrExit {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "$1 exited with error: $status"
        exit $status
    fi
}

set | grep TRAVIS

test $1 && arg1=$1

ver=${ML_VERSION}
fname=MarkLogic-RHEL7-${ver}.x86_64.rpm
fnamedeb="marklogic_"
fnamedeb=$fnamedeb$ver
suff="_amd64.deb"
fnamedeb=$fnamedeb$suff

echo "Logging in for Download"
curl -s -c cookies.txt --data "email=${MLBUILD_USER}&password=${MLBUILD_PASSWORD}" https://developer.marklogic.com/login > /dev/null 2>&1

echo
echo "Getting Download Link"
dl_link=$(curl -s -b cookies.txt --data "download=/download/binaries/8.0/${fname}" https://developer.marklogic.com/get-download-url | perl -pe 's/.*"path":"([^"]+).*/\1/')
url="https://developer.marklogic.com${dl_link}"

echo "********* Downloading MarkLogic $ver"
successOrExit curl -s -k -o ./MarkLogic.rpm $url
