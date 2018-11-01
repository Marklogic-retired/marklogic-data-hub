# Running Data Hub Service end-end #

There are 2 projects one for each DHS and DSF. DHS is the project to run DHF flows in the stack spun up by DHS. Whereas DSF is the project that consumes curated data in the FINAL database. Commands to be executed in sequence are as under:

## Pre-req ##
Gradle 4.x+ installed globally.
* wget https://services.gradle.org/distributions/gradle-4.2.1-bin.zip
* unzip to a dir of choice
* update env var PATH in bash_profile
  * export PATH=$PATH:<unzipped dir>/gradle4.2.1/bin
  * source ~/.bash_profile

There is a gradle task “importAllCustomers” to ingest source documents. So you can either run that task or use your locally installed mlcp.sh as described later.
* Download and Extract mlcp-9.0.7.zip to a directory of your choice
  * export PATH=$PATH:<unzipped dir>/mlcp-9.0.7/bin
  * source ~/.bash_profile


After creating stack in AWS make sure you have created following users with appropriate roles. Set the Password as M@rkl0gic for all the users.

You can create them with username/password of your own choice. In that case ensure DHS/gradle.properties, DSF/gradle.properties and DSF/src/main/java/com/marklogic/APIs/testCustomer.java files are updated to use them.

* For DHS project
  * User dhfdevelop has flowDeveloper role
  * User dhfoperator has flowOperator role
* For DSF project
  * User apideveloper has endpointDeveloper role
  * User apiuser has endpointUser role


## Assumptions and things to note ##
* This project assumes that DHS environment is already provisioned. All the app servers, databases are provisioned and required roles created as described in pre-req above
* This example was executed from bastion host
* Latest DHS release enables you to configure the endpoints to be public. If they are, you can run this project from your laptop. If the endpoints are private, then these hosts are only accessible from the VPC that is peered to the MarkLogic VPC (This can be accessed from your local by ssh tunneling). In either case please update mlHost in DHS/gradle.properties to use Flows endpoint and DSF/gradle.properties and DSF/src/main/java/com/marklogic/APIs/testCustomer.java to use Operations endpoint


# Steps to run end to end #

## Getting your flows in DHS ##
1. cd `<path to DHS>`
2. Install data-hub core MODULES
  1. gradle hubInstallModules
3. Load your modules for input/harmoninzation flows
  1. gradle mlLoadModules
4. Run input flow
  1. mlcp.sh import -mode "local" -host "`Ingest/Flows endpoint`" -port "8006" -username "xx" -password "yy" -input_file_path "`path to DHS/input/json/customers/`" -input_file_type "documents" -output_collections "Customer,DHS" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "`path to DHS/input/json,''`" -document_type "json" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Customer,flow-name=custInput" -restrict_hosts true
  ___Alternately you can run___
  2. gradle importAllCustomers
    1. Ensure to update path to input documents in DHS/build.gradle where the task is defined
5. Run harmonization flow
  1. gradle hubRunFlow -PentityName=Customer -PflowName=custESJJ

## Consuming curated data from FINAL database ##
1. cd `<path to DSF>`
2. Load your APIs into data-hub-MODULES database
  1. gradle mlLoadModules
3. Call the API. The API runs a query on FINAL database to return all the Customers who have "Sales" in their title
  1. gradle runMain


___You can verify via REST port 8004 for ingested/harmonized docs___
