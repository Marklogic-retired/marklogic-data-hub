This example project demonstrates how to create different flow configurations, which are described below.

To try this, first initialize the project and extract the test data:

    ./gradlew hubInit extractZip

Before deploying the application, first update gradle.properties and gradle-local.properties 
[as described in the Data Hub documentation](https://docs.marklogic.com/datahub/tools/gradle/gradle-properties.html). 

Next, deploy the application:

    ./gradlew mlDeploy

With the application deployed, you're ready to run each of the example flows, which are:

1) ingestion_only-flow.flow.json - This flow contains 7 steps. Each step refers to ingesting a different format of input files. The input files are located in the "input" directory.

2) ingestion_mapping-flow.flow.json - This flow contains 4 steps. The input files are located in the "input" directory.
  Step 1 and Step 2 ingest and harmonize (using mapping) json documents.
  Step 3 and Step 4 ingest and harmonize (using mapping) xml documents.

3) ingestion_mapping_mastering-flow.flow.json - This flow contains 3 steps. The input files are located in the "mastering-input" directory.
  Step 1 ingests json documents.
  Step 2 harmonizes json documents.
  Step 3 masters json documents.

Each flow can be run as shown below:

    ./gradlew hubRunFlow -PflowName=ingestion_only-flow
    ./gradlew hubRunFlow -PflowName=ingestion_mapping-flow
    ./gradlew hubRunFlow -PflowName=ingestion_mapping_mastering-flow

In addition, a subset of steps can be run when running a flow:

    ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Psteps=1
    ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Psteps=2,3