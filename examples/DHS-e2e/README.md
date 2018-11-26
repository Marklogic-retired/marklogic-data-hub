# Running Data Hub Service end-end #

There are 2 projects one for each DHS and DSF. DHS is the project to run DHF flows in the stack spun up by DHS. Whereas DSF is the project that consumes curated data in the FINAL database. Commands to be executed in sequence are as under:

## Pre-req ##
Gradle 4.x+ installed globally.
* wget https://services.gradle.org/distributions/gradle-4.2.1-bin.zip
* unzip to a dir of choice
* update env var PATH in bash_profile
  * `export PATH=$PATH:<unzipped dir>/gradle4.2.1/bin`
  * source ~/.bash_profile

There is a gradle task “importAllCustomers” to ingest source documents. So you can either run that task or use your locally installed mlcp.sh as described later.
* Download and Extract mlcp-9.0.7.zip to a directory of your choice
  * `export PATH=$PATH:<unzipped dir>/mlcp-9.0.7/bin`
  * source ~/.bash_profile


After creating stack in AWS make sure you have created users with appropriate roles. Update DHS/gradle.properties and DSF/gradle.properties to use them.

* For DHS project
  * User with flowDeveloper role can create, load into modules DB and run flows
  * User with flowOperator role can only run flows
* For DSF project
  * User with endpointDeveloper role can load into modules DB and call the DSF API
  * User with endpointUser role can only call the DSF API


## Assumptions and things to note ##
* This project assumes that DHS environment is already provisioned. All the app servers, databases are provisioned and required roles created as described in pre-req above
* This example was executed from bastion host
* DHS enables you to configure the endpoints to be private or public. If they are public, you can run this project from your laptop. If the endpoints are private, then these hosts are only accessible from the VPC that is peered to the MarkLogic VPC (This can be accessed from your local by ssh tunneling). In either case please update mlHost in DHS/gradle.properties and DSF/gradle.properties to use Flows endpoint.


# Steps to run end to end #

## Getting your flows in DHS ##
1. cd `<path to DHS>`
2. Install data-hub core MODULES
    1. gradle hubInstallModules
    2. data-hub-MODULES should have 133 documents. You can verify this in your browser:
        ___http://CURATION_ENDPOINT:8004/v1/search?database=data-hub-MODULES___
3. Load your modules for input/harmoninzation flows
    1. gradle mlLoadModules
    2. data-hub-MODULES should now have 145 documents. You can verify this in your browser:
        ___http://CURATION_ENDPOINT:8004/v1/search?database=data-hub-MODULES___
4. Run input flow
    1. mlcp.sh import -mode "local" -host "`Ingest/Flows endpoint`" -port "8006" -username "xx" -password "yy" -input_file_path "`path to DHS/input/json/customers/`" -input_file_type "documents" -output_collections "Customer,DHS" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "`path to DHS/input/json`,''" -document_type "json" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Customer,flow-name=customerInput" -restrict_hosts true
  
        ___Alternately you can run___
  
    2. gradle importAllCustomers
        1. Ensure to update path to input documents in DHS/build.gradle where the task is defined
    3. Post ingestion, there should be 11 documents in data-hub-STAGING:
        ___http://CURATION_ENDPOINT:8004/v1/search?database=data-hub-STAGING___
5. Run harmonization flow
    1. gradle hubRunFlow -PentityName=Customer -PflowName=customerHarmonize
    2. Post harmonization, there should be 11 documents in data-hub-FINAL:
        ___http://CURATION_ENDPOINT:8004/v1/search?database=data-hub-FINAL___

## Consuming curated data from FINAL database ##
1. cd `<path to DSF>`
2. Load your APIs into data-hub-MODULES database
    1. gradle mlLoadModules
        1. If you are using same project to run against another AWS stack, delete `module-timestamps.properties` under `build/ml-javaclient-util` dir
        2. data-hub-MODULES should now have 152 documents. You can verify this in your browser:
            ___http://CURATION_ENDPOINT:8004/v1/search?database=data-hub-MODULES___
3. Call the API. The API runs a query on FINAL database to return all the Customers who have "Sales" in their title
    1. gradle runMain


