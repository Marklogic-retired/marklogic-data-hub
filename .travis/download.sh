#!/bin/bash

echo "Logging in to Docker registry"
docker login -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}

echo "Getting Docker Image"
docker pull marklogiccommunity/marklogic-datahub-1x
