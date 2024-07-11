#!/bin/bash
SCRIPTPATH=$(realpath $(dirname $0))

docker run -d -it -p 8000-8020:8000-8020 \
     --name MarkLogic_9-no-install\
     -v "${SCRIPTPATH}/../mnt/ml9":/var/opt/MarkLogic\
     -e MARKLOGIC_INIT=true \
     marklogicdb/marklogic-db:latest-9