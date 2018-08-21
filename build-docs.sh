#!/bin/sh

# This script will build the javadocs for the DHF jar file
# and push them into the docs branch to be magically published
# via travis to the https://marklogic.github.io/marklogic-data-hub site

# run this after you update gradle.properties to contain the new version
# preferable after you do a release
#
# this script will create a new branch add-${hubversion}-javadocs
# you will need to create a Pull Request and review it/approve/merge
# travis will then update the docs site

tmpdir=$(mktemp -d)
hubversion=$(cat gradle.properties | awk -F"=" '{print $2}')
echo "tmpdir: ${tmpdir}"
echo "version: ${hubversion}"
git clone -b docs git@github.com:marklogic/marklogic-data-hub.git ${tmpdir}/docs
./gradlew javadoc
mkdir -p ${tmpdir}/docs/javadocs/${hubversion}
cp -R marklogic-data-hub/build/docs/javadoc ${tmpdir}/docs/javadocs/${hubversion}

cd ${tmpdir}/docs
branch_name=add-${hubversion}-javadocs
git checkout -b ${branch_name}
git add javadocs/${hubversion}
git commit -m "adding ${hubversion} javadocs"
git push origin ${branch_name}
rm -rf ${tmpdir}
