Assumptions:
1) This project assumes that DHS environment is already provisioned (DHS environment is provisioned in AWS. All the app servers, databases and required roles 
are provisioned and the users are created)
2) You have information about load balancer hosts. The loadbalancerhosts can be configured to be public. If the loadbalancerhosts are public, you can run this project from local environment. If the loadbalancerhosts are not public, then these hosts are only accessible from the VPC that is peered to the MarkLogic VPC (This can be accessed from your local by ssh tunneling)

Example Demonstration:
This example demonstrates the usage of gradle tasks to ingest and harmonize sample Product data into MarkLogic.
The example will walk you through an end to end flow of loading datahub modules into DHS environment, creating entites, mappings, input/harmonize flows and 
running the flows in DHS environment

Steps to work on DHS:

1) Add the build.gradle file from the docs folder into the current directory
2) install gradle and run gradle wrapper --gradle-version 3.4
3) ./gradlew build
4) ./gradlew hubInit
5) Copy the gradle.properties file from docs and update the user credentials (Refer to this documentation: https://marklogic.github.io/marklogic-data-hub/project/dhsdeploy/)
6) ./gradlew hubInstallModules (Installs dhf modules into DHS env)
7) ./gradlew hubCreateEntity -PentityName=Product
8) Copy the file Product.entity.json file from docs/entities folder into plugins/entities/Product in your current directory
9) ./gradlew mlLoadModules (This will deploy user modules into Staging and Final databases)
10) run the create_input_flows.sh file to create the input flows
11) ./gradlew mlLoadModules
12) Get mlcp-9.0-7 and add it to the PATH. 
13) Update the input_file_path location in the run_input_flows.sh file (input files are in input folder. These docs should be in staging database)
14) Create a mapping using ./gradlew hubCreateMapping -PmappingName=prodMap
15) copy the files inside docs/mappings into plugins/mappings/prodMap
16) ./gradlew mlLoadModules
17) run create_hm_flows.sh file
18) ./gradlew mlLoadModules
19) run run_hm_flows.sh file
