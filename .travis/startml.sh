#!/bin/bash

export MARKLOGIC_INSTALL_DIR=/opt/MarkLogic
export MARKLOGIC_DATA_DIR=/data

export MARKLOGIC_FSTYPE=ext4
export MARKLOGIC_USER=daemon
export MARKLOGIC_PID_FILE=/var/run/MarkLogic.pid
export MARKLOGIC_MLCMD_PID_FILE=/var/run/mlcmd.pid
export MARKLOGIC_UMASK=022

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/MarkLogic/mlcmd/bin
export LD_PRELOAD=/opt/MarkLogic/lib/libjemalloc.so.1
export LD_LIBRARY_PATH=/opt/MarkLogic/lib:/data/Lib

echo "STARTING MARKLOGIC"

/opt/MarkLogic/bin/MarkLogic
