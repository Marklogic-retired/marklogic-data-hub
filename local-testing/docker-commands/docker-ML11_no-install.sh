#!/bin/bash
SCRIPTPATH=$(realpath $(dirname $0))

docker run -d -it -p 8000-8020:8000-8020 \
     --name MarkLogic_11-no-install\
     -v "${SCRIPTPATH}/../mnt/ml11":/var/opt/MarkLogic\
     -e MARKLOGIC_INIT=true \
     marklogicdb/marklogic-db:latest-11.0