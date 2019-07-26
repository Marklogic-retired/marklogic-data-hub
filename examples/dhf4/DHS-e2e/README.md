# Running Data Hub Service end-to-end #

This project demonstrates an end to end scenario with an ssl enabled DHS stack. There are two projects — one for running DHF flows in Data Hub Service (DHS), and one for consuming data from the final database with Data Services (DSF).

## Prerequisites ##

Install MarkLogic Content Pump (mlcp).
* Download and Extract mlcp-9.0.9.zip to a directory of your choice
  * `export PATH=$PATH:<unzipped dir>/mlcp-9.0.9/bin`
  * `source ~/.bash_profile`


After creating your stack in AWS, make sure you have created users with appropriate roles. Update DHS/gradle.properties and DSF/gradle.properties to use them.
For information on DHS roles, refer to the [DHS documentation](https://internal.cloudservices.marklogic.com/help?type=datahub&subtype=user#DHSroles)


## Assumptions and things to note ##
* This project assumes that a DHS environment is already provisioned. All the app servers and databases should be provisioned and required roles created as described in the prerequisites above.
* This example was run using public endpoints.
* DHS enables you to configure the endpoints to be private or public. If they are public, you can run this project from your laptop. If the endpoints are private, then these hosts are only accessible from the VPC that is peered to the MarkLogic VPC. In either case, please update `mlHost` in DHS/gradle.properties and DSF/gradle.properties to use the Flows endpoint and `operationsEndpoint` in DSF/gradle.properties to use the Operations endpoint.



# Steps #

## Getting your flows in DHS ##
1. `cd <path to DHS>`
    * Initialize the project by running `./gradlew hubInit -PenvironmentName=dhs`
2. Install data-hub core MODULES
    * `./gradlew hubInstallModules -PenvironmentName=dhs`
    * Verify that data-hub-MODULES has 135 documents from your browser:
        ___https://CURATION_ENDPOINT:8011/v1/search?database=data-hub-MODULES___
3. Load your modules for the input and harmonization flows
    * `./gradlew mlLoadModules -PenvironmentName=dhs`
    * Verify that data-hub-MODULES has 150 documents from your browser:
        ___https://CURATION_ENDPOINT:8011/v1/search?database=data-hub-MODULES___
4. Load your indexes into the databases
    * `./gradlew mlUpdateIndexes -PenvironmentName=dhs`
5. Run the input flow in either ways below
    * `./gradlew importAllCustomers -PenvironmentName=dhs` OR
    * `mlcp.sh import -mode "local" -host "`**Ingest/Flows endpoint**`" -port "8010" -username "`**Your username here**`" -password "`**Your password here**`" -input_file_path "`**path to DHS/input/json/customers/**`" -input_file_type "documents" -output_collections "Customer,DHS" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "`**path to DHS/input/json**`,''" -document_type "json" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Customer,flow-name=customerInput" -ssl true`
    * Verify there are 11 documents in data-hub-STAGING:
        ___https://CURATION_ENDPOINT:8011/v1/search?database=data-hub-STAGING___
6. Run the harmonization flow
    * `./gradlew hubRunFlow -PentityName=Customer -PflowName=customerHarmonize -PenvironmentName=dhs`
    * Verify there are 11 documents in data-hub-FINAL:
        ___https://CURATION_ENDPOINT:8011/v1/search?database=data-hub-FINAL___
7. Perform a search in your browser to invoke a service extension
    * Load this url ___https://CURATION_ENDPOINT:8011/v1/resources/restExtensionExample?rs:title=Owner___
    * Verify that the service extension "restExtensionExample" returns 1 document from FINAL database that have job title Owner 

## Consuming curated data from the data-hub-FINAL database ##
1. `cd <path to DSF>`
2. Load your APIs into the data-hub-MODULES database
    * (Optional) If you are using the same project to run against another AWS stack, delete `module-timestamps.properties` from under the `build/ml-javaclient-util` directory
    * `./gradlew mlLoadModules`
    * Verify that data-hub-MODULES has 157 documents from your browser:
              ___https://CURATION_ENDPOINT:8011/v1/search?database=data-hub-MODULES___
3. Call the API. The API runs a query on FINAL database to return all the Customers who have "Sales" in their title
    * `./gradlew runMain`


