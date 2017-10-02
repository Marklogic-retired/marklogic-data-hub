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

test $1 && MLBUILD_USER=$1
test $2 && MLBUILD_PASSWORD=$2
test $3 && ML_VERSION=$3

suffix=$(sed -e 's#.*\.\(\)#\1#' <<< $ML_VERSION)
if [[ $suffix = 'nightly' ]]; then
  # find today
  day=$(date +"%Y%m%d")

  # if the user passed a day string as a param then use it instead
  test $4 && day=$4
  # make a version number out of the date
  ver="8.0-$day"

  echo "********* Downloading MarkLogic nightly $ver"

  # fetch/install ML nightly
  fname="MarkLogic-RHEL7-$ver.x86_64.rpm"

  url="https://root.marklogic.com/nightly/builds/linux64-rh7/rh7-intel64-80-test-1.marklogic.com/b8_0/pkgs.$day/$fname"

  status=$(curl -k --anyauth -u $MLBUILD_USER:$MLBUILD_PASSWORD --head --write-out %{http_code} --silent --output /dev/null $url)
  if [[ $status = 200 ]]; then
    successOrExit curl -k --anyauth -u $MLBUILD_USER:$MLBUILD_PASSWORD -o ./$fname $url

    fname=$(pwd)/$fname

    yum -y install $fname --skip-broken

    echo "********* MarkLogic nightly $ver installed"
  else
    echo "CANNOT DOWNLOAD: status = $status for date $day (URL=\"$url\")"
    exit 1
  fi
else
  ver=${ML_VERSION}
  fname=MarkLogic-RHEL7-${ver}.x86_64.rpm

  curl -c cookies.txt --data "email=${MLBUILD_USER}&password=${MLBUILD_PASSWORD}" https://developer.marklogic.com/login
  dl_link=$(curl -b cookies.txt --data "download=/download/binaries/8.0/${fname}" https://developer.marklogic.com/get-download-url | perl -pe 's/.*"path":"([^"]+).*/\1/')
  url="https://developer.marklogic.com${dl_link}"

  echo "********* Downloading MarkLogic $ver"
    echo "Download URL: $url"

  successOrExit curl -k -o ./$fname $url

  fname=$(pwd)/$fname

  yum -y install $fname --skip-broken

  echo "********* MarkLogic $ver installed"
fi
