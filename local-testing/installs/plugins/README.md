# Getting started

## Deploy
````bash
./gradlew mlDeploy
````

````bash
./gradlew hubDeployUserArtifacts
````

````bash
./gradlew hubGeneratePii
````

````bash
./gradlew mlDeploySecurity
````

## Input flows
````bash
mlcp import \
    -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
    -transform_param "entity-name=Farm,flow-name=loadFarms,jobId=cl-farms" \
    -input_file_path "data/farms" \
    -output_uri_replace "data,''" \
    -output_collections "Farm" \
    -input_file_type "json" \
    -host "localhost" \
    -port "8010"
````

````bash
mlcp import \
    -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
    -transform_param "entity-name=Pasture,flow-name=loadPastures,jobId=cl-pastures" \
    -input_file_path "data/pastures" \
    -output_uri_replace "data,''" \
    -output_collections "Pasture" \
    -input_file_type "json" \
    -host "localhost" \
    -port "8010"
````

````bash
mlcp import \
    -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
    -transform_param "entity-name=Llama,flow-name=loadLlamas,jobId=cl-llamas" \
    -input_file_path "data/llamas" \
    -output_uri_replace "data,''" \
    -output_collections "Llama" \
    -input_file_type "json" \
    -host "localhost" \
    -port "8010"
````

## Harmonization flows
````bash
./gradlew hubRunFlow -PentityName=Farm -PflowName=harmonizeFarms
````

````bash
./gradlew hubRunFlow -PentityName=Pasture -PflowName=harmonizePastures
````

````bash
./gradlew hubRunFlow -PentityName=Llama -PflowName=harmonizeLlamas
````
