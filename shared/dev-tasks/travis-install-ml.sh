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

fname=MarkLogic.rpm
fnamedeb="marklogic_"
suff="_amd64.deb"
fnamedeb=$fnamedeb$suff

url=$MLRELEASE_URL

echo "********* Downloading MarkLogic"

status=$(curl -k --head --write-out %{http_code} --silent --output /dev/null $url)
if [[ $status = 200 ]]; then
    successOrExit curl -k -o ./$fname $url

    fname=$(pwd)/$fname

    sudo apt-get update
    sudo apt-get install alien dpkg-dev debhelper build-essential
    sudo alien -d -k $fname
    sudo dpkg -i $fnamedeb

    echo "********* MarkLogic installed"
else
    echo "CANNOT DOWNLOAD: status = $status for version (URL=secure/suppressed)"
    exit 1
fi
