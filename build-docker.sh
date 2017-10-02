#!/bin/sh

# This script is used to build the docker images
# used to test the DHF in Travis

# build release images
read -p "DMC User: " myuser
read -s -p "DMC Password: " mypass

test $myuser && export MLBUILD_USER=$myuser
test $mypass && export MLBUILD_PASSWORD=$mypass
echo

for ver in 8.0-7 9.0-1.1 9.0-2 9.0-3
do
  export ML_VERSION=$ver
  docker-compose build
done

# build nightly images
read -p "Nightly User: " myuser
read -s -p "Nightly Password: " mypass

test $myuser && export MLBUILD_USER=$myuser
test $mypass && export MLBUILD_PASSWORD=$mypass
echo

for ver in 8.nightly 9.nightly 10.nightly
do
  export ML_VERSION=$ver
  docker-compose build
done
