#!/bin/bash
SCRIPTPATH=$(realpath $(dirname $0))

docker run -d -it --privileged -p 8000-8020:8000-8020 \
     --name esntos_base-2\
     centos:7.9.2009\
     /usr/sbin/initesntos_base-2
