#!/usr/bin/env bash
PWD=`pwd`

build/install/baseJob/bin/hubBatch \
    --config example.LoadAndRunFlow \
    --project_dir ${PWD} \
    --env local \
    --input_file_path ${PWD}/input \
    --input_file_pattern .*\.xml \
    --entity_name Monster \
    --flow_name ingest-monster \
    --chunk 100
