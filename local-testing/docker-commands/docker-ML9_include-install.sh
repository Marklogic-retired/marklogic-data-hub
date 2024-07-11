#!/bin/bash
SCRIPTPATH=$(realpath $(dirname $0))

docker run -d -it -p 8000-8020:8000-8020 \
     --name MarkLogic_9-with-install\
     -v "${SCRIPTPATH}/../mnt/ml9":/var/opt/MarkLogic\
     -e MARKLOGIC_INIT=true \
     -e MARKLOGIC_ADMIN_USERNAME=admin \
     -e MARKLOGIC_ADMIN_PASSWORD=admin \
     marklogicdb/marklogic-db:latest-9
